#!/usr/bin/env python3
"""End-to-end browser playthrough test for Drum Smash.

Spins up a local static server for the repo root and drives headless Chromium
through both Drum Party and Numbers & Emoji modes, verifying interactions,
parent controls, persistence, layout, and zero console/page/local-404 errors.

Usage:
    python3 tests/playthrough.py
"""

from __future__ import annotations

import functools
import http.server
import pathlib
import socketserver
import sys
import threading
from playwright.sync_api import sync_playwright

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        pass


def start_server(root: pathlib.Path) -> tuple[socketserver.TCPServer, int]:
    handler = functools.partial(QuietHandler, directory=str(root))
    server = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, port


def boxes_overlap(a: dict, b: dict) -> bool:
    return not (
        a["x"] + a["width"] <= b["x"]
        or b["x"] + b["width"] <= a["x"]
        or a["y"] + a["height"] <= b["y"]
        or b["y"] + b["height"] <= a["y"]
    )


def run_playthrough() -> None:
    server, port = start_server(REPO_ROOT)
    base_url = f"http://127.0.0.1:{port}/index.html"

    page_errors: list[str] = []
    console_errors: list[str] = []
    local_http_errors: list[str] = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1280, "height": 800})
            page = context.new_page()

            page.on("pageerror", lambda err: page_errors.append(str(err)))
            page.on(
                "console",
                lambda msg: console_errors.append(msg.text)
                if msg.type == "error"
                else None,
            )
            page.on(
                "response",
                lambda res: local_http_errors.append(f"{res.status} {res.url}")
                if res.url.startswith(f"http://127.0.0.1:{port}") and res.status >= 400
                else None,
            )

            print("1. Loading Drum Smash...")
            page.goto(base_url, wait_until="domcontentloaded")
            page.wait_for_selector("#game")
            assert page.locator("#count").text_content() == "0"
            assert page.locator("#mode-name").text_content() == "DRUM PARTY"

            # Verify .parent does not overlap .brand-mark on desktop
            parent_box = page.locator("#parent").bounding_box()
            brand_box = page.locator(".brand-mark").bounding_box()
            assert parent_box and brand_box
            assert not boxes_overlap(parent_box, brand_box), (
                f".parent overlaps .brand-mark on desktop: {parent_box} vs {brand_box}"
            )

            print("2. Playing Drum Party: tapping all 5 drums on stage...")
            expected_drums = [
                ("kick", "Boom!"),
                ("snare", "Tap!"),
                ("hat", "Tss!"),
                ("tom", "Tom!"),
                ("ding", "Ding!"),
            ]
            for idx, (drum_id, label) in enumerate(expected_drums, start=1):
                piece = page.locator(f'.drum-piece[data-drum="{drum_id}"]')
                piece.click()
                assert page.locator("#sound").text_content() == label, (
                    f"Expected {label} for {drum_id}, got {page.locator('#sound').text_content()}"
                )
                assert page.locator("#count").text_content() == str(idx)
                assert page.locator(".burst").count() >= 1
                assert "hit" in (piece.get_attribute("class") or "")

            print("3. Testing hold-to-drum-roll on kick drum...")
            kick_box = page.locator('.drum-piece[data-drum="kick"]').bounding_box()
            assert kick_box
            before_roll = int(page.locator("#count").text_content() or "0")
            page.mouse.move(
                kick_box["x"] + kick_box["width"] / 2,
                kick_box["y"] + kick_box["height"] / 2,
            )
            page.mouse.down()
            page.wait_for_timeout(720)
            page.mouse.up()
            after_roll = int(page.locator("#count").text_content() or "0")
            assert after_roll >= before_roll + 3, (
                f"Expected drum roll to fire multiple hits, got {before_roll} -> {after_roll}"
            )
            # Ensure roll stops cleanly after release
            page.wait_for_timeout(300)
            settled = int(page.locator("#count").text_content() or "0")
            assert settled == after_roll, (
                f"Drum roll kept firing after pointerup: {after_roll} -> {settled}"
            )

            print("4. Testing keyboard play & shortcut safety...")
            page.keyboard.press("KeyA")
            after_key = int(page.locator("#count").text_content() or "0")
            assert after_key == settled + 1
            # Ctrl+F should NOT trigger a smash
            page.keyboard.press("Control+f")
            assert int(page.locator("#count").text_content() or "0") == after_key

            print("5. Testing Parent Controls toddler gate (quick tap vs 1.5s hold)...")
            pbox = page.locator("#parent").bounding_box()
            assert pbox
            px, py = pbox["x"] + pbox["width"] / 2, pbox["y"] + pbox["height"] / 2
            # Quick tap must NOT open modal or leave focus that opens on Space
            page.mouse.move(px, py)
            page.mouse.down()
            page.wait_for_timeout(120)
            page.mouse.up()
            assert page.locator(".panel-backdrop").count() == 0
            page.keyboard.press("Space")
            assert page.locator(".panel-backdrop").count() == 0, (
                "Quick tap on .parent leaked focus and opened modal on Space"
            )
            assert int(page.locator("#count").text_content() or "0") == after_key + 1

            # Real 1.6s hold MUST open Parent Controls
            page.mouse.move(px, py)
            page.mouse.down()
            page.wait_for_timeout(1650)
            page.mouse.up()
            page.wait_for_selector(".panel-backdrop")

            # Clicking inside panel must not trigger a drum smash
            count_before_modal_click = int(page.locator("#count").text_content() or "0")
            page.locator(".parent-note").click()
            assert int(page.locator("#count").text_content() or "0") == count_before_modal_click

            # Test mute toggle on & off
            mute_btn = page.locator('[data-action="mute"]')
            mute_btn.click()
            assert mute_btn.get_attribute("aria-pressed") == "true"
            assert "muted" in (page.locator("#game").get_attribute("class") or "")
            mute_btn.click()
            assert mute_btn.get_attribute("aria-pressed") == "false"

            print("6. Switching to Numbers & Emoji mode and playing all 5 pads...")
            page.locator('[data-mode="numbers"]').click()
            assert page.locator(".panel-backdrop").count() == 0
            assert "numbers" in (page.locator("#game").get_attribute("class") or "")
            assert page.locator("#mode-name").text_content() == "NUMBERS & EMOJI"
            assert page.locator("#heading").text_content() == "Count and sparkle!"

            expected_nums = [
                ("1", "One!"),
                ("2", "Two!"),
                ("3", "Three!"),
                ("4", "Four!"),
                ("5", "Five!"),
            ]
            for num, label in expected_nums:
                pad = page.locator(f'.toy-pad[data-num="{num}"]')
                pad.click()
                assert page.locator("#sound").text_content() == label, (
                    f"Expected {label} for pad {num}, got {page.locator('#sound').text_content()}"
                )

            # Pressing number key '3' plays Three!
            page.keyboard.press("Digit3")
            assert page.locator("#sound").text_content() == "Three!"

            # Focused pad + Enter plays that exact pad's number
            page.locator('.toy-pad[data-num="4"]').focus()
            page.keyboard.press("Enter")
            assert page.locator("#sound").text_content() == "Four!"

            print("7. Testing localStorage persistence across reload + counter reset...")
            saved_count = int(page.locator("#count").text_content() or "0")
            assert saved_count > 0
            # Wait briefly for debounced/flushed save then reload
            page.wait_for_timeout(450)
            page.reload(wait_until="domcontentloaded")
            page.wait_for_selector("#game")
            assert "numbers" in (page.locator("#game").get_attribute("class") or "")
            assert int(page.locator("#count").text_content() or "0") == saved_count

            # Open Parent Controls via keyboard, reset counter, close with Escape
            page.locator("#parent").focus()
            page.keyboard.press("Enter")
            page.wait_for_selector(".panel-backdrop")
            page.locator('[data-action="reset"]').click()
            assert page.locator("#count").text_content() == "0"
            page.keyboard.press("Escape")
            assert page.locator(".panel-backdrop").count() == 0

            print("8. Testing mobile portrait (390x844) and short landscape (667x375)...")
            for width, height in [(390, 844), (667, 375)]:
                page.set_viewport_size({"width": width, "height": height})
                page.wait_for_timeout(100)
                pb = page.locator("#parent").bounding_box()
                bb = page.locator(".brand-mark").bounding_box()
                assert pb and bb
                assert not boxes_overlap(pb, bb), (
                    f".parent overlaps .brand-mark at {width}x{height}: {pb} vs {bb}"
                )

            # Verify modal opens cleanly on short landscape phone
            page.locator("#parent").focus()
            page.keyboard.press("Enter")
            page.wait_for_selector(".panel-backdrop")
            page.locator('[data-mode="drums"]').click()
            assert page.locator(".panel-backdrop").count() == 0

            browser.close()
    finally:
        server.shutdown()
        server.server_close()

    assert not local_http_errors, f"Local HTTP errors detected: {local_http_errors}"
    assert not page_errors, f"Uncaught page errors detected: {page_errors}"
    assert not console_errors, f"Console errors detected: {console_errors}"
    print("ALL PLAYTHROUGH CHECKS PASSED!")


if __name__ == "__main__":
    try:
        run_playthrough()
    except Exception as exc:
        print(f"PLAYTHROUGH FAILED: {exc}", file=sys.stderr)
        sys.exit(1)
