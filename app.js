(() => {
  const STORAGE_KEY = 'drumsmash-state-v2';

  const game = document.getElementById('game');
  const countEl = document.getElementById('count');
  const soundEl = document.getElementById('sound');
  const modeNameEl = document.getElementById('mode-name');
  const headingEl = document.getElementById('heading');
  const instructionEl = document.getElementById('instruction');
  const parentBtn = document.getElementById('parent');
  const drumPieces = Array.from(document.querySelectorAll('.drum-piece'));
  const toyPads = Array.from(document.querySelectorAll('.toy-pad'));

  const DRUMS = [
    { id: 'kick', label: 'Boom!', freq: 86, color: '#ff7a5c' },
    { id: 'snare', label: 'Tap!', freq: 182, color: '#58b8a8' },
    { id: 'hat', label: 'Tss!', freq: 480, color: '#f3b73f' },
    { id: 'tom', label: 'Tom!', freq: 138, color: '#ff9a52' },
    { id: 'ding', label: 'Ding!', freq: 650, color: '#ffd154' },
  ];

  const NUMBER_ITEMS = [
    { type: 'number', text: '1', label: 'One!', color: '#ff7e67', note: 523.25 },
    { type: 'number', text: '2', label: 'Two!', color: '#ffb84d', note: 587.33 },
    { type: 'number', text: '3', label: 'Three!', color: '#5ec2a6', note: 659.25 },
    { type: 'number', text: '4', label: 'Four!', color: '#64a6e8', note: 783.99 },
    { type: 'number', text: '5', label: 'Five!', color: '#9c7be2', note: 880.0 },
    { type: 'emoji', text: '🚌', label: 'Red Bus!', color: '#ff6e52', note: 659.25 },
    { type: 'emoji', text: '🚕', label: 'London Taxi!', color: '#f2b73b', note: 783.99 },
    { type: 'emoji', text: '🐶', label: 'Woof!', color: '#e59a5c', note: 587.33 },
    { type: 'emoji', text: '🎈', label: 'Pop!', color: '#ff748c', note: 1046.5 },
    { type: 'emoji', text: '🌈', label: 'Rainbow!', color: '#6ec4b0', note: 880.0 },
    { type: 'emoji', text: '⭐', label: 'Twinkle!', color: '#ffd154', note: 1046.5 },
    { type: 'emoji', text: '🎵', label: 'Tra-la!', color: '#8f74dc', note: 783.99 },
  ];

  // Crisp inline SVG graphics for drum bursts (replaces missing PNG assets)
  const BURST_SVGS = {
    kick: `<svg class="burst-svg" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="52" r="38" fill="#ff7a5c" stroke="#c94934" stroke-width="6"/>
      <circle cx="50" cy="52" r="27" fill="#fff4d6" stroke="#f3c567" stroke-width="5"/>
      <circle cx="50" cy="52" r="10" fill="#ffd46c"/>
      <path d="M26 84l-8 10M74 84l8 10" stroke="#4a6c8c" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    snare: `<svg class="burst-svg" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="14" y="34" width="72" height="36" rx="14" fill="#63c2b3" stroke="#2d6e7e" stroke-width="6"/>
      <ellipse cx="50" cy="36" rx="36" ry="12" fill="#fff7e2" stroke="#2d6e7e" stroke-width="5"/>
      <line x1="30" y1="45" x2="30" y2="66" stroke="#fff4d6" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="47" x2="50" y2="68" stroke="#fff4d6" stroke-width="4" stroke-linecap="round"/>
      <line x1="70" y1="45" x2="70" y2="66" stroke="#fff4d6" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    hat: `<svg class="burst-svg" viewBox="0 0 100 100" aria-hidden="true">
      <line x1="50" y1="42" x2="50" y2="90" stroke="#5c7b96" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="50" cy="48" rx="40" ry="12" fill="#f2b838" stroke="#c8861e" stroke-width="5"/>
      <ellipse cx="50" cy="36" rx="40" ry="12" fill="#ffe06d" stroke="#c8861e" stroke-width="5"/>
      <ellipse cx="50" cy="32" rx="11" ry="5" fill="#fff2ad"/>
    </svg>`,
    tom: `<svg class="burst-svg" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M18 32h64v32c0 12-14 20-32 20s-32-8-32-20V32z" fill="#ff9e57" stroke="#c95b36" stroke-width="6"/>
      <ellipse cx="50" cy="32" rx="32" ry="12" fill="#fff5d9" stroke="#c95b36" stroke-width="5"/>
      <circle cx="32" cy="56" r="4" fill="#ffd98a"/>
      <circle cx="50" cy="60" r="4" fill="#ffd98a"/>
      <circle cx="68" cy="56" r="4" fill="#ffd98a"/>
    </svg>`,
    ding: `<svg class="burst-svg" viewBox="0 0 100 100" aria-hidden="true">
      <line x1="50" y1="46" x2="50" y2="90" stroke="#5c7b96" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="50" cy="44" rx="42" ry="13" fill="#ffd859" stroke="#d19022" stroke-width="5"/>
      <path d="M36 40c2-11 26-11 28 0" fill="#ffbf47" stroke="#d19022" stroke-width="4"/>
      <path d="M18 22l5 6M82 22l-5 6M50 12v8" stroke="#ff8d5c" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    note: `<svg class="burst-svg" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M40 72V26l36-8v44" fill="none" stroke="#245892" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="31" cy="74" rx="13" ry="10" transform="rotate(-18 31 74)" fill="#ff775b"/>
      <ellipse cx="67" cy="64" rx="13" ry="10" transform="rotate(-18 67 64)" fill="#ffd154"/>
    </svg>`,
  };

  let state = loadState();
  let audioCtx = null;
  let noiseBuffer = null;
  let activeSound = null;
  let rollDelay = null;
  let rollInterval = null;
  let parentHoldTimer = null;
  let panelBackdrop = null;

  // Track active pointers and keys so multi-touch / multi-key rolls stay smooth
  const activePointers = new Map();
  const activeKeys = new Set();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        mode: saved.mode === 'numbers' ? 'numbers' : 'drums',
        total: Number.isFinite(saved.total) && saved.total >= 0 ? Math.floor(saved.total) : 0,
        muted: Boolean(saved.muted),
      };
    } catch {
      return { mode: 'drums', total: 0, muted: false };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota or private-mode errors
    }
  }

  function applyModeUI() {
    const isNumbers = state.mode === 'numbers';
    game.classList.toggle('numbers', isNumbers);
    game.classList.toggle('muted', state.muted);
    countEl.textContent = String(state.total);
    modeNameEl.textContent = isNumbers ? 'NUMBERS & EMOJI' : 'DRUM PARTY';
    headingEl.textContent = isNumbers ? 'Count and sparkle!' : 'Tap, tap, boom!';
    instructionEl.textContent = isNumbers
      ? 'Tap a number or press any key for a happy surprise!'
      : 'Tap a drum or press any key. Hold for a drum roll!';
  }

  function ensureAudio() {
    if (!audioCtx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      audioCtx = new AudioCtor();
      const length = Math.floor(audioCtx.sampleRate * 0.3);
      noiseBuffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // Enforces "one sound at a time" with a gentle 18ms fade-out to avoid audio clicks
  function stopActiveSound() {
    if (!activeSound || !audioCtx) return;
    const now = audioCtx.currentTime;
    try {
      activeSound.gain.gain.cancelScheduledValues(now);
      activeSound.gain.gain.setValueAtTime(Math.max(activeSound.gain.gain.value, 0.0001), now);
      activeSound.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
      activeSound.nodes.forEach((node) => {
        try {
          node.stop(now + 0.022);
        } catch {
          // Node may already have stopped
        }
      });
    } catch {
      // Ignore Web Audio scheduling errors
    }
    activeSound = null;
  }

  function playDrum(drum) {
    if (state.muted) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    stopActiveSound();

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0.0001, now);
    const nodes = [];

    if (drum.id === 'kick' || drum.id === 'tom') {
      const osc = ctx.createOscillator();
      osc.type = drum.id === 'kick' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(drum.freq * 2.75, now);
      osc.frequency.exponentialRampToValueAtTime(drum.freq * 0.62, now + 0.17);
      master.gain.exponentialRampToValueAtTime(0.24, now + 0.008);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.31);
      osc.connect(master);
      osc.start(now);
      osc.stop(now + 0.33);
      nodes.push(osc);
    } else {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = drum.id === 'hat' ? 'highpass' : 'bandpass';
      filter.frequency.value = drum.id === 'hat' ? 6500 : drum.id === 'ding' ? 3600 : 1800;
      filter.Q.value = drum.id === 'ding' ? 1.6 : 0.8;

      src.connect(filter);
      filter.connect(master);

      const peak = drum.id === 'hat' ? 0.07 : 0.14;
      const dur = drum.id === 'hat' ? 0.095 : 0.21;
      master.gain.exponentialRampToValueAtTime(peak, now + 0.005);
      master.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      src.start(now);
      src.stop(now + dur + 0.02);
      nodes.push(src);

      if (drum.id === 'ding') {
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(640, now);
        bellGain.gain.setValueAtTime(0.14, now);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        bell.connect(bellGain);
        bellGain.connect(master);
        bell.start(now);
        bell.stop(now + 0.23);
        nodes.push(bell);
      }
    }

    activeSound = { gain: master, nodes };
  }

  function playMarimba(freq) {
    if (state.muted) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    stopActiveSound();

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.18, now + 0.008);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.connect(master);
    osc.start(now);
    osc.stop(now + 0.36);

    const overtone = ctx.createOscillator();
    const overGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2, now);
    overGain.gain.setValueAtTime(0.06, now);
    overGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    overtone.connect(overGain);
    overGain.connect(master);
    overtone.start(now);
    overtone.stop(now + 0.16);

    activeSound = { gain: master, nodes: [osc, overtone] };
  }

  function animateElementHit(el) {
    if (!el) return;
    el.classList.remove('hit');
    void el.offsetWidth;
    el.classList.add('hit');
  }

  function popSoundPill(text) {
    soundEl.textContent = text;
    soundEl.classList.remove('pop');
    void soundEl.offsetWidth;
    soundEl.classList.add('pop');
  }

  function spawnRipple(x, y, color) {
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    r.style.setProperty('--ripple-color', color);
    game.append(r);
    setTimeout(() => r.remove(), 580);
  }

  function spawnBurst(x, y, html, isNumberBadge = false, badgeColor = '#ff7e67') {
    const b = document.createElement('div');
    b.className = 'burst';
    b.style.left = `${x}px`;
    b.style.top = `${y}px`;
    b.style.setProperty('--rot-start', `${(Math.random() - 0.5) * 20}deg`);
    b.style.setProperty('--rot-mid', `${(Math.random() - 0.5) * 14}deg`);
    b.style.setProperty('--rot-end', `${(Math.random() - 0.5) * 22}deg`);

    if (isNumberBadge) {
      const badge = document.createElement('div');
      badge.className = 'burst-badge';
      badge.style.background = badgeColor;
      badge.textContent = html;
      b.append(badge);
    } else {
      b.innerHTML = html;
    }

    game.append(b);
    setTimeout(() => b.remove(), 1180);
  }

  function smash(x = window.innerWidth / 2, y = window.innerHeight / 2, forcedId = null) {
    if (panelBackdrop) return;

    if (state.mode === 'drums') {
      const drum =
        (forcedId && DRUMS.find((d) => d.id === forcedId)) ||
        DRUMS[Math.floor(Math.random() * DRUMS.length)];

      playDrum(drum);
      popSoundPill(drum.label);

      const stagePiece = drumPieces.find((p) => p.dataset.drum === drum.id);
      animateElementHit(stagePiece);

      const useNote = Math.random() < 0.25;
      spawnRipple(x, y, drum.color);
      spawnBurst(x, y, useNote ? BURST_SVGS.note : BURST_SVGS[drum.id]);
    } else {
      const item =
        (forcedId && NUMBER_ITEMS.find((n) => n.text === forcedId)) ||
        NUMBER_ITEMS[Math.floor(Math.random() * NUMBER_ITEMS.length)];

      playMarimba(item.note);
      popSoundPill(item.label);

      if (item.type === 'number') {
        const pad = toyPads.find((p) => p.dataset.num === item.text);
        animateElementHit(pad);
        spawnRipple(x, y, item.color);
        spawnBurst(x, y, item.text, true, item.color);
      } else {
        spawnRipple(x, y, item.color);
        spawnBurst(x, y, `<span class="burst-emoji">${item.text}</span>`);
      }
    }

    state.total += 1;
    countEl.textContent = String(state.total);
    saveState();
  }

  function stopRoll() {
    clearTimeout(rollDelay);
    clearInterval(rollInterval);
    rollDelay = null;
    rollInterval = null;
  }

  function startRoll(getCoords, forcedId = null) {
    stopRoll();
    rollDelay = setTimeout(() => {
      rollInterval = setInterval(() => {
        if (panelBackdrop) {
          stopRoll();
          return;
        }
        const { x, y } = getCoords();
        smash(
          x + (Math.random() - 0.5) * 68,
          y + (Math.random() - 0.5) * 44,
          forcedId
        );
      }, 140);
    }, 330);
  }

  function maybeStopRoll() {
    if (activePointers.size === 0 && activeKeys.size === 0) {
      stopRoll();
    }
  }

  // Pointer interactions on the main stage
  game.addEventListener('pointerdown', (e) => {
    if (panelBackdrop || parentBtn.contains(e.target)) return;

    const drumEl = e.target.closest('.drum-piece');
    const padEl = e.target.closest('.toy-pad');
    const forcedId = drumEl?.dataset.drum || padEl?.dataset.num || null;

    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    smash(e.clientX, e.clientY, forcedId);

    startRoll(() => {
      const pos = activePointers.get(e.pointerId) || { x: e.clientX, y: e.clientY };
      return pos;
    }, forcedId);
  });

  game.addEventListener('pointermove', (e) => {
    if (activePointers.has(e.pointerId)) {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
  });

  const endPointer = (e) => {
    activePointers.delete(e.pointerId);
    maybeStopRoll();
  };

  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);
  window.addEventListener('contextmenu', (e) => e.preventDefault());

  // Keyboard interactions (including number keys 1-5 in Numbers mode)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (panelBackdrop) {
        e.preventDefault();
        closePanel();
      }
      return;
    }

    if (panelBackdrop) return;
    if (document.activeElement === parentBtn && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openPanel();
      return;
    }

    if (e.repeat || ['Meta', 'Control', 'Alt', 'Shift', 'Tab'].includes(e.key)) {
      return;
    }

    e.preventDefault();
    activeKeys.add(e.code);

    const x = window.innerWidth * (0.14 + Math.random() * 0.72);
    const y = window.innerHeight * (0.18 + Math.random() * 0.56);
    const forcedId = state.mode === 'numbers' && /^[1-5]$/.test(e.key) ? e.key : null;

    smash(x, y, forcedId);
    startRoll(
      () => ({
        x: window.innerWidth * (0.14 + Math.random() * 0.72),
        y: window.innerHeight * (0.18 + Math.random() * 0.56),
      }),
      forcedId
    );
  });

  window.addEventListener('keyup', (e) => {
    activeKeys.delete(e.code);
    maybeStopRoll();
  });

  window.addEventListener('blur', () => {
    activePointers.clear();
    activeKeys.clear();
    stopRoll();
    cancelParentHold();
  });

  // Parent Controls (1.5s hold on top-left corner, or keyboard Enter/Space when focused)
  function cancelParentHold() {
    clearTimeout(parentHoldTimer);
    parentHoldTimer = null;
    parentBtn.classList.remove('holding');
  }

  parentBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    cancelParentHold();
    parentBtn.classList.add('holding');
    parentHoldTimer = setTimeout(() => {
      cancelParentHold();
      openPanel();
    }, 1500);
  });

  parentBtn.addEventListener('pointerup', cancelParentHold);
  parentBtn.addEventListener('pointercancel', cancelParentHold);
  parentBtn.addEventListener('pointerleave', cancelParentHold);

  function closePanel() {
    if (!panelBackdrop) return;
    panelBackdrop.remove();
    panelBackdrop = null;
  }

  function openPanel() {
    if (panelBackdrop) return;
    activePointers.clear();
    activeKeys.clear();
    stopRoll();

    const backdrop = document.createElement('div');
    backdrop.className = 'panel-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'parent-panel-title');

    backdrop.innerHTML = `
      <div class="panel">
        <button class="close" type="button" aria-label="Close parent controls">×</button>
        <p class="eyebrow">Parent Controls</p>
        <h2 id="parent-panel-title">Choose a play mode</h2>
        <div class="modes">
          <button type="button" data-mode="drums" class="${state.mode === 'drums' ? 'active' : ''}">
            🥁
            <span>Drum Party</span>
            <small>Interactive kit + drum sounds</small>
          </button>
          <button type="button" data-mode="numbers" class="${state.mode === 'numbers' ? 'active' : ''}">
            🔢
            <span>Numbers &amp; Emoji</span>
            <small>Counting pads + marimba notes</small>
          </button>
        </div>
        <div class="panel-actions">
          <button type="button" class="panel-btn ${state.muted ? 'active' : ''}" data-action="mute">
            ${state.muted ? '🔇 Sound muted (Tap to unmute)' : '🔊 Sound on (Tap to mute)'}
          </button>
          <button type="button" class="panel-btn" data-action="reset">
            ↺ Reset smash counter (${state.total})
          </button>
        </div>
        <p class="parent-note">Gentle colours, no flashing, and one sound at a time.</p>
      </div>
    `;

    // Prevent clicks inside the backdrop from ever reaching #game
    backdrop.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (e.target === backdrop) closePanel();
    });

    const closeBtn = backdrop.querySelector('.close');
    closeBtn.addEventListener('click', closePanel);

    backdrop.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode;
        saveState();
        applyModeUI();
        popSoundPill(state.mode === 'drums' ? 'Ready to drum!' : 'Ready to count!');
        closePanel();
      });
    });

    const muteBtn = backdrop.querySelector('[data-action="mute"]');
    muteBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      if (state.muted) stopActiveSound();
      saveState();
      applyModeUI();
      muteBtn.classList.toggle('active', state.muted);
      muteBtn.textContent = state.muted
        ? '🔇 Sound muted (Tap to unmute)'
        : '🔊 Sound on (Tap to mute)';
    });

    const resetBtn = backdrop.querySelector('[data-action="reset"]');
    resetBtn.addEventListener('click', () => {
      state.total = 0;
      saveState();
      applyModeUI();
      resetBtn.textContent = '↺ Counter reset (0)';
    });

    document.body.append(backdrop);
    panelBackdrop = backdrop;
    closeBtn.focus();
  }

  applyModeUI();
})();
