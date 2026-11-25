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
    { id: 'hat', label: 'Tss!', freq: 6500, color: '#f3b73f' },
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

  // Crisp inline SVG graphics for drum bursts
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
  let softClipCurve = null;
  let dryBus = null;
  let reverbBus = null;
  let activeVoices = [];
  let rollDelay = null;
  let rollInterval = null;
  let parentHoldTimer = null;
  let saveTimer = null;
  let panelBackdrop = null;
  let previousFocus = null;

  const MAX_VOICES = 8;

  // Track active pointers and keys with their individual targets so multi-touch/key rolls stay accurate
  const activePointers = new Map(); // pointerId -> { x, y, forcedId }
  const activeKeys = new Map(); // keyCode -> { forcedId }

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

  function flushSave() {
    clearTimeout(saveTimer);
    saveTimer = null;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota or private-mode errors
    }
  }

  function scheduleSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(flushSave, 400);
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

  // Gentle tanh-like curve for warm drumhead punch without harsh clipping
  function createSoftClipCurve(amount = 2.4) {
    const samples = 1024;
    const curve = new Float32Array(samples);
    const norm = Math.tanh(amount);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(x * amount) / norm;
    }
    return curve;
  }

  // Small, warm wooden-room stereo impulse response so drums sit in a natural acoustic space
  function createRoomImpulse(ctx, duration = 0.48) {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, 2.8);
        const white = Math.random() * 2 - 1;
        // One-pole low-pass damping mimics warm room absorption
        lp = lp * 0.62 + white * 0.38;
        data[i] = lp * env;
      }
      // Subtle early reflections for acoustic room depth
      const taps = ch === 0 ? [0.008, 0.017, 0.029] : [0.011, 0.021, 0.034];
      taps.forEach((sec, idx) => {
        const pos = Math.floor(sec * rate);
        if (pos < length) {
          data[pos] += (0.28 - idx * 0.06) * (ch === 0 ? 1 : -1);
        }
      });
    }
    return impulse;
  }

  let audioUnlocked = false;

  function unlockAudio() {
    const ctx = ensureAudio();
    if (!ctx || audioUnlocked) return;
    try {
      // Tiny silent buffer reliably unlocks iOS WebKit audio on the very first touch
      const silent = ctx.createBuffer(1, 1, ctx.sampleRate);
      const src = ctx.createBufferSource();
      src.buffer = silent;
      src.connect(ctx.destination);
      src.start(0);
      audioUnlocked = true;
    } catch {
      // Will retry on next user gesture
    }
  }

  function ensureAudio() {
    if (!audioCtx) {
      // iOS 17+ Safari: allow sound even when the physical Silent switch is on
      if (navigator.audioSession && 'type' in navigator.audioSession) {
        try {
          navigator.audioSession.type = 'playback';
        } catch {
          // Ignore on browsers that restrict audioSession
        }
      }

      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      audioCtx = new AudioCtor();

      // 1.5s white noise buffer (long enough for full crash cymbal shimmer)
      const length = Math.floor(audioCtx.sampleRate * 1.5);
      noiseBuffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      softClipCurve = createSoftClipCurve(2.2);

      // Soft master limiter keeps rapid toddler smashes warm and never harsh
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
      compressor.knee.setValueAtTime(18, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(4, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.16, audioCtx.currentTime);

      const masterOut = audioCtx.createGain();
      masterOut.gain.setValueAtTime(0.92, audioCtx.currentTime);
      compressor.connect(masterOut);
      masterOut.connect(audioCtx.destination);

      dryBus = audioCtx.createGain();
      dryBus.gain.setValueAtTime(1, audioCtx.currentTime);
      dryBus.connect(compressor);

      reverbBus = audioCtx.createGain();
      reverbBus.gain.setValueAtTime(1, audioCtx.currentTime);
      const convolver = audioCtx.createConvolver();
      convolver.buffer = createRoomImpulse(audioCtx, 0.48);
      const reverbReturn = audioCtx.createGain();
      reverbReturn.gain.setValueAtTime(0.24, audioCtx.currentTime);
      reverbBus.connect(convolver);
      convolver.connect(reverbReturn);
      reverbReturn.connect(compressor);
    }
    // Handles both 'suspended' and iOS Safari's 'interrupted' state (after lock/call/tab switch)
    if (audioCtx.state !== 'running') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function disconnectVoice(voice) {
    if (!voice || voice.disconnected) return;
    voice.disconnected = true;
    clearTimeout(voice.cleanupTimer);
    voice.cleanupTimer = null;
    (voice.outputNodes || [voice.gain]).forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // Ignore already-disconnected nodes
      }
    });
  }

  function fadeOutVoice(voice, fadeSec = 0.025) {
    if (!voice || !audioCtx) return;
    const now = audioCtx.currentTime;
    try {
      const param = voice.gain.gain;
      if (typeof param.cancelAndHoldAtTime === 'function') {
        param.cancelAndHoldAtTime(now);
      } else {
        param.cancelScheduledValues(now);
        param.setValueAtTime(Math.max(param.value, 0.0001), now);
      }
      param.exponentialRampToValueAtTime(0.0001, now + fadeSec);
      voice.nodes.forEach((node) => {
        try {
          node.stop(now + fadeSec + 0.006);
        } catch {
          // Node may already have stopped
        }
      });
    } catch {
      // Ignore Web Audio scheduling errors
    }
    clearTimeout(voice.cleanupTimer);
    voice.cleanupTimer = setTimeout(() => disconnectVoice(voice), (fadeSec + 0.04) * 1000);
  }

  function stopAllSounds() {
    activeVoices.forEach((voice) => fadeOutVoice(voice, 0.02));
    activeVoices = [];
  }

  function registerVoice(id, voiceOutput, nodes, endTime) {
    const now = audioCtx.currentTime;
    activeVoices = activeVoices.filter((v) => v.endTime > now);

    // Closed hi-hat chokes any previous hi-hat for crisp acoustic rolls
    if (id === 'hat') {
      activeVoices = activeVoices.filter((v) => {
        if (v.id === 'hat') {
          fadeOutVoice(v, 0.025);
          return false;
        }
        return true;
      });
    }

    while (activeVoices.length >= MAX_VOICES) {
      const oldest = activeVoices.shift();
      fadeOutVoice(oldest, 0.03);
    }

    const voice = {
      id,
      gain: voiceOutput.gain,
      outputNodes: voiceOutput.outputNodes,
      nodes,
      endTime,
      disconnected: false,
      cleanupTimer: null,
    };
    const cleanupMs = Math.max(80, (endTime - now + 0.08) * 1000);
    voice.cleanupTimer = setTimeout(() => disconnectVoice(voice), cleanupMs);
    activeVoices.push(voice);
  }

  function createVoiceOutput(ctx, panValue, reverbAmount) {
    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(1, ctx.currentTime);
    const outputNodes = [voiceGain];

    let outNode = voiceGain;
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(panValue, ctx.currentTime);
      voiceGain.connect(panner);
      outNode = panner;
      outputNodes.push(panner);
    }

    outNode.connect(dryBus);
    if (reverbAmount > 0) {
      const send = ctx.createGain();
      send.gain.setValueAtTime(reverbAmount, ctx.currentTime);
      outNode.connect(send);
      send.connect(reverbBus);
      outputNodes.push(send);
    }
    return { gain: voiceGain, outputNodes };
  }

  // Unlock Web Audio synchronously on first touchstart for iPhone / iOS Safari
  window.addEventListener('touchstart', unlockAudio, { passive: true, capture: true });

  function playDrum(drum) {
    if (state.muted) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Subtle humanization so repeated hits and rolls sound like real sticks
    const pitchVar = 0.982 + Math.random() * 0.036;
    const vel = 0.9 + Math.random() * 0.14;
    const nodes = [];

    const panMap = { hat: -0.42, snare: -0.18, kick: 0, tom: 0.22, ding: 0.42 };
    const revMap = { hat: 0.16, snare: 0.34, kick: 0.14, tom: 0.28, ding: 0.42 };
    const voiceOutput = createVoiceOutput(ctx, panMap[drum.id] ?? 0, revMap[drum.id] ?? 0.2);
    const voiceGain = voiceOutput.gain;
    let endTime = now + 0.5;

    if (drum.id === 'kick') {
      // 1. Sub-bass acoustic shell body
      const bodyEnv = ctx.createGain();
      bodyEnv.gain.setValueAtTime(0.0001, now);
      bodyEnv.gain.linearRampToValueAtTime(0.58 * vel, now + 0.003);
      bodyEnv.gain.exponentialRampToValueAtTime(0.18 * vel, now + 0.11);
      bodyEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      const shaper = ctx.createWaveShaper();
      shaper.curve = softClipCurve;
      bodyEnv.connect(shaper);
      shaper.connect(voiceGain);

      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(142 * pitchVar, now);
      sub.frequency.exponentialRampToValueAtTime(54 * pitchVar, now + 0.055);
      sub.frequency.exponentialRampToValueAtTime(41 * pitchVar, now + 0.36);
      sub.connect(bodyEnv);
      sub.start(now);
      sub.stop(now + 0.44);
      nodes.push(sub);

      // 2. Warm felt-beater punch (audible even on small laptop/phone speakers)
      const punchEnv = ctx.createGain();
      punchEnv.gain.setValueAtTime(0.0001, now);
      punchEnv.gain.linearRampToValueAtTime(0.24 * vel, now + 0.002);
      punchEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
      punchEnv.connect(voiceGain);

      const punch = ctx.createOscillator();
      punch.type = 'triangle';
      punch.frequency.setValueAtTime(240 * pitchVar, now);
      punch.frequency.exponentialRampToValueAtTime(88 * pitchVar, now + 0.045);
      punch.connect(punchEnv);
      punch.start(now);
      punch.stop(now + 0.075);
      nodes.push(punch);

      // 3. Felt beater skin click transient
      const clickEnv = ctx.createGain();
      clickEnv.gain.setValueAtTime(0.0001, now);
      clickEnv.gain.linearRampToValueAtTime(0.18 * vel, now + 0.0015);
      clickEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
      clickEnv.connect(voiceGain);

      const clickSrc = ctx.createBufferSource();
      clickSrc.buffer = noiseBuffer;
      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(2200 * pitchVar, now);
      clickFilter.Q.setValueAtTime(1.3, now);
      clickSrc.connect(clickFilter);
      clickFilter.connect(clickEnv);
      clickSrc.start(now);
      clickSrc.stop(now + 0.025);
      nodes.push(clickSrc);

      endTime = now + 0.45;
    } else if (drum.id === 'snare') {
      // 1. Acoustic snare shell fundamental
      const shellEnv = ctx.createGain();
      shellEnv.gain.setValueAtTime(0.0001, now);
      shellEnv.gain.linearRampToValueAtTime(0.32 * vel, now + 0.0025);
      shellEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
      shellEnv.connect(voiceGain);

      const shell = ctx.createOscillator();
      shell.type = 'triangle';
      shell.frequency.setValueAtTime(235 * pitchVar, now);
      shell.frequency.exponentialRampToValueAtTime(168 * pitchVar, now + 0.048);
      shell.connect(shellEnv);
      shell.start(now);
      shell.stop(now + 0.19);
      nodes.push(shell);

      // 2. Upper drumhead resonance mode (~1.85x)
      const headEnv = ctx.createGain();
      headEnv.gain.setValueAtTime(0.0001, now);
      headEnv.gain.linearRampToValueAtTime(0.16 * vel, now + 0.002);
      headEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);
      headEnv.connect(voiceGain);

      const head = ctx.createOscillator();
      head.type = 'sine';
      head.frequency.setValueAtTime(345 * pitchVar, now);
      head.frequency.exponentialRampToValueAtTime(280 * pitchVar, now + 0.05);
      head.connect(headEnv);
      head.start(now);
      head.stop(now + 0.11);
      nodes.push(head);

      // 3. Crisp snare-wire rattle
      const wireEnv = ctx.createGain();
      wireEnv.gain.setValueAtTime(0.0001, now);
      wireEnv.gain.linearRampToValueAtTime(0.3 * vel, now + 0.0025);
      wireEnv.gain.exponentialRampToValueAtTime(0.075 * vel, now + 0.075);
      wireEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      wireEnv.connect(voiceGain);

      const wireSrc = ctx.createBufferSource();
      wireSrc.buffer = noiseBuffer;
      const wireHp = ctx.createBiquadFilter();
      wireHp.type = 'highpass';
      wireHp.frequency.setValueAtTime(1150, now);
      const wireTone = ctx.createBiquadFilter();
      wireTone.type = 'peaking';
      wireTone.frequency.setValueAtTime(3200 * pitchVar, now);
      wireTone.Q.setValueAtTime(1.1, now);
      wireTone.gain.setValueAtTime(4, now);
      const wireLp = ctx.createBiquadFilter();
      wireLp.type = 'lowpass';
      wireLp.frequency.setValueAtTime(9800, now);

      wireSrc.connect(wireHp);
      wireHp.connect(wireTone);
      wireTone.connect(wireLp);
      wireLp.connect(wireEnv);
      wireSrc.start(now, Math.random() * 0.4);
      wireSrc.stop(now + 0.26);
      nodes.push(wireSrc);

      // 4. Stick-on-head snap transient
      const snapEnv = ctx.createGain();
      snapEnv.gain.setValueAtTime(0.0001, now);
      snapEnv.gain.linearRampToValueAtTime(0.2 * vel, now + 0.001);
      snapEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
      snapEnv.connect(voiceGain);

      const snapSrc = ctx.createBufferSource();
      snapSrc.buffer = noiseBuffer;
      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(4400 * pitchVar, now);
      snapFilter.Q.setValueAtTime(1.6, now);
      snapSrc.connect(snapFilter);
      snapFilter.connect(snapEnv);
      snapSrc.start(now, Math.random() * 0.3);
      snapSrc.stop(now + 0.018);
      nodes.push(snapSrc);

      endTime = now + 0.28;
    } else if (drum.id === 'tom') {
      const baseFreq = 104 * pitchVar;

      // 1. Deep resonant floor-tom fundamental
      const bodyEnv = ctx.createGain();
      bodyEnv.gain.setValueAtTime(0.0001, now);
      bodyEnv.gain.linearRampToValueAtTime(0.46 * vel, now + 0.004);
      bodyEnv.gain.exponentialRampToValueAtTime(0.14 * vel, now + 0.18);
      bodyEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

      const shaper = ctx.createWaveShaper();
      shaper.curve = softClipCurve;
      bodyEnv.connect(shaper);
      shaper.connect(voiceGain);

      const body = ctx.createOscillator();
      body.type = 'sine';
      body.frequency.setValueAtTime(baseFreq * 1.65, now);
      body.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.09);
      body.frequency.exponentialRampToValueAtTime(baseFreq * 0.89, now + 0.45);
      body.connect(bodyEnv);
      body.start(now);
      body.stop(now + 0.5);
      nodes.push(body);

      // 2. Circular drumhead (1,1) Bessel overtone (1.59x) for realistic acoustic tom character
      const overEnv = ctx.createGain();
      overEnv.gain.setValueAtTime(0.0001, now);
      overEnv.gain.linearRampToValueAtTime(0.15 * vel, now + 0.003);
      overEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
      overEnv.connect(voiceGain);

      const over = ctx.createOscillator();
      over.type = 'sine';
      over.frequency.setValueAtTime(baseFreq * 2.15, now);
      over.frequency.exponentialRampToValueAtTime(baseFreq * 1.59, now + 0.075);
      over.connect(overEnv);
      over.start(now);
      over.stop(now + 0.21);
      nodes.push(over);

      // 3. Soft drumstick-on-head thump
      const atkEnv = ctx.createGain();
      atkEnv.gain.setValueAtTime(0.0001, now);
      atkEnv.gain.linearRampToValueAtTime(0.14 * vel, now + 0.002);
      atkEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
      atkEnv.connect(voiceGain);

      const atkSrc = ctx.createBufferSource();
      atkSrc.buffer = noiseBuffer;
      const atkFilter = ctx.createBiquadFilter();
      atkFilter.type = 'bandpass';
      atkFilter.frequency.setValueAtTime(1050 * pitchVar, now);
      atkFilter.Q.setValueAtTime(1.2, now);
      atkSrc.connect(atkFilter);
      atkFilter.connect(atkEnv);
      atkSrc.start(now, Math.random() * 0.3);
      atkSrc.stop(now + 0.03);
      nodes.push(atkSrc);

      endTime = now + 0.52;
    } else if (drum.id === 'hat') {
      // 1. Six inharmonic bronze partials for realistic metallic hi-hat shimmer
      const metalBus = ctx.createGain();
      metalBus.gain.setValueAtTime(0.0001, now);
      metalBus.gain.linearRampToValueAtTime(0.13 * vel, now + 0.002);
      metalBus.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      const metalBp = ctx.createBiquadFilter();
      metalBp.type = 'bandpass';
      metalBp.frequency.setValueAtTime(8200 * pitchVar, now);
      metalBp.Q.setValueAtTime(1.1, now);
      const metalHp = ctx.createBiquadFilter();
      metalHp.type = 'highpass';
      metalHp.frequency.setValueAtTime(6000, now);

      metalBus.connect(metalBp);
      metalBp.connect(metalHp);
      metalHp.connect(voiceGain);

      const ratios = [296, 415, 543, 682, 811, 1024];
      ratios.forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f * pitchVar, now);
        osc.connect(metalBus);
        osc.start(now);
        osc.stop(now + 0.11);
        nodes.push(osc);
      });

      // 2. Crisp closed-hat air & stick "chick"
      const airEnv = ctx.createGain();
      airEnv.gain.setValueAtTime(0.0001, now);
      airEnv.gain.linearRampToValueAtTime(0.16 * vel, now + 0.0015);
      airEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.072);
      airEnv.connect(voiceGain);

      const airSrc = ctx.createBufferSource();
      airSrc.buffer = noiseBuffer;
      const airHp = ctx.createBiquadFilter();
      airHp.type = 'highpass';
      airHp.frequency.setValueAtTime(7400, now);
      const airLp = ctx.createBiquadFilter();
      airLp.type = 'lowpass';
      airLp.frequency.setValueAtTime(13000, now);

      airSrc.connect(airHp);
      airHp.connect(airLp);
      airLp.connect(airEnv);
      airSrc.start(now, Math.random() * 0.5);
      airSrc.stop(now + 0.09);
      nodes.push(airSrc);

      endTime = now + 0.12;
    } else if (drum.id === 'ding') {
      // 1. Shimmering bronze crash cymbal partial cluster
      const shimmerBus = ctx.createGain();
      shimmerBus.gain.setValueAtTime(0.0001, now);
      shimmerBus.gain.linearRampToValueAtTime(0.11 * vel, now + 0.01);
      shimmerBus.gain.exponentialRampToValueAtTime(0.032 * vel, now + 0.32);
      shimmerBus.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);

      const shimHp = ctx.createBiquadFilter();
      shimHp.type = 'highpass';
      shimHp.frequency.setValueAtTime(2800, now);
      const shimLp = ctx.createBiquadFilter();
      shimLp.type = 'lowpass';
      shimLp.frequency.setValueAtTime(10800, now);

      shimmerBus.connect(shimHp);
      shimHp.connect(shimLp);
      shimLp.connect(voiceGain);

      const crashPartials = [312, 468, 619, 804, 1088, 1412];
      crashPartials.forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f * pitchVar, now);
        osc.connect(shimmerBus);
        osc.start(now);
        osc.stop(now + 1.18);
        nodes.push(osc);
      });

      // 2. Smooth acoustic cymbal wash
      const washEnv = ctx.createGain();
      washEnv.gain.setValueAtTime(0.0001, now);
      washEnv.gain.linearRampToValueAtTime(0.16 * vel, now + 0.012);
      washEnv.gain.exponentialRampToValueAtTime(0.045 * vel, now + 0.28);
      washEnv.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);
      washEnv.connect(voiceGain);

      const washSrc = ctx.createBufferSource();
      washSrc.buffer = noiseBuffer;
      const washBp = ctx.createBiquadFilter();
      washBp.type = 'bandpass';
      washBp.frequency.setValueAtTime(5600 * pitchVar, now);
      washBp.Q.setValueAtTime(0.6, now);
      const washLp = ctx.createBiquadFilter();
      washLp.type = 'lowpass';
      washLp.frequency.setValueAtTime(11200, now);

      washSrc.connect(washBp);
      washBp.connect(washLp);
      washLp.connect(washEnv);
      washSrc.start(now, Math.random() * 0.25);
      washSrc.stop(now + 1.08);
      nodes.push(washSrc);

      // 3. Subtle brass cymbal bell ping on impact
      const bellPairs = [
        { freq: 980 * pitchVar, gain: 0.08 * vel, dur: 0.42 },
        { freq: 1495 * pitchVar, gain: 0.045 * vel, dur: 0.28 },
      ];
      bellPairs.forEach((b) => {
        const bEnv = ctx.createGain();
        bEnv.gain.setValueAtTime(0.0001, now);
        bEnv.gain.linearRampToValueAtTime(b.gain, now + 0.003);
        bEnv.gain.exponentialRampToValueAtTime(0.0001, now + b.dur);
        bEnv.connect(voiceGain);

        const bOsc = ctx.createOscillator();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(b.freq, now);
        bOsc.connect(bEnv);
        bOsc.start(now);
        bOsc.stop(now + b.dur + 0.02);
        nodes.push(bOsc);
      });

      endTime = now + 1.2;
    }

    registerVoice(drum.id, voiceOutput, nodes, endTime);
  }

  function playMarimba(freq) {
    if (state.muted) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const vel = 0.92 + Math.random() * 0.1;
    // Gentle pitch-mapped stereo spread across the rosewood bars
    const pan = Math.max(-0.35, Math.min(0.35, ((freq - 700) / 350) * 0.3));
    const voiceOutput = createVoiceOutput(ctx, pan, 0.26);
    const voiceGain = voiceOutput.gain;
    const nodes = [];

    // 1. Warm rosewood bar fundamental
    const bodyEnv = ctx.createGain();
    bodyEnv.gain.setValueAtTime(0.0001, now);
    bodyEnv.gain.linearRampToValueAtTime(0.28 * vel, now + 0.004);
    bodyEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
    bodyEnv.connect(voiceGain);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.connect(bodyEnv);
    osc.start(now);
    osc.stop(now + 0.55);
    nodes.push(osc);

    // 2. Classic arched marimba 4th harmonic (2 octaves up, fast decay)
    const overEnv = ctx.createGain();
    overEnv.gain.setValueAtTime(0.0001, now);
    overEnv.gain.linearRampToValueAtTime(0.085 * vel, now + 0.0025);
    overEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
    overEnv.connect(voiceGain);

    const overtone = ctx.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 4, now);
    overtone.connect(overEnv);
    overtone.start(now);
    overtone.stop(now + 0.09);
    nodes.push(overtone);

    // 3. Soft yarn-mallet wooden knock transient
    const malletEnv = ctx.createGain();
    malletEnv.gain.setValueAtTime(0.0001, now);
    malletEnv.gain.linearRampToValueAtTime(0.09 * vel, now + 0.0015);
    malletEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
    malletEnv.connect(voiceGain);

    const malletSrc = ctx.createBufferSource();
    malletSrc.buffer = noiseBuffer;
    const malletFilter = ctx.createBiquadFilter();
    malletFilter.type = 'bandpass';
    malletFilter.frequency.setValueAtTime(Math.min(freq * 2.2, 2600), now);
    malletFilter.Q.setValueAtTime(2.0, now);
    malletSrc.connect(malletFilter);
    malletFilter.connect(malletEnv);
    malletSrc.start(now, Math.random() * 0.3);
    malletSrc.stop(now + 0.02);
    nodes.push(malletSrc);

    registerVoice('marimba', voiceOutput, nodes, now + 0.56);
  }

  // Uses getBoundingClientRect() so SVG <g> elements flush layout reliably too
  function animateElementHit(el) {
    if (!el) return;
    el.classList.remove('hit');
    void el.getBoundingClientRect();
    el.classList.add('hit');
  }

  function popSoundPill(text) {
    soundEl.textContent = text;
    soundEl.classList.remove('pop');
    void soundEl.getBoundingClientRect();
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
    scheduleSave();
  }

  function stopRoll() {
    clearTimeout(rollDelay);
    clearInterval(rollInterval);
    rollDelay = null;
    rollInterval = null;
  }

  // Dynamically reads the most recent still-held pointer or key on every roll tick
  function getActiveRollTarget() {
    if (activePointers.size > 0) {
      let latest;
      for (const val of activePointers.values()) latest = val;
      return {
        x: latest.x + (Math.random() - 0.5) * 68,
        y: latest.y + (Math.random() - 0.5) * 44,
        forcedId: latest.forcedId,
      };
    }
    if (activeKeys.size > 0) {
      let latest;
      for (const val of activeKeys.values()) latest = val;
      return {
        x: window.innerWidth * (0.14 + Math.random() * 0.72),
        y: window.innerHeight * (0.18 + Math.random() * 0.56),
        forcedId: latest.forcedId,
      };
    }
    return null;
  }

  function ensureRollScheduled() {
    if (rollDelay || rollInterval) return;
    rollDelay = setTimeout(() => {
      rollDelay = null;
      rollInterval = setInterval(() => {
        if (panelBackdrop) {
          stopRoll();
          return;
        }
        const target = getActiveRollTarget();
        if (!target) {
          stopRoll();
          return;
        }
        smash(target.x, target.y, target.forcedId);
      }, 140);
    }, 330);
  }

  function maybeStopRoll() {
    if (activePointers.size === 0 && activeKeys.size === 0) {
      stopRoll();
      flushSave();
    }
  }

  // Pointer interactions on the main stage (primary mouse button or touch/pen only)
  game.addEventListener('pointerdown', (e) => {
    if (panelBackdrop || parentBtn.contains(e.target)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const drumEl = e.target.closest('.drum-piece');
    const padEl = e.target.closest('.toy-pad');
    const forcedId = drumEl?.dataset.drum || padEl?.dataset.num || null;

    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY, forcedId });
    smash(e.clientX, e.clientY, forcedId);
    ensureRollScheduled();
  });

  game.addEventListener('pointermove', (e) => {
    const entry = activePointers.get(e.pointerId);
    if (entry) {
      entry.x = e.clientX;
      entry.y = e.clientY;
    }
  });

  const endPointer = (e) => {
    if (activePointers.delete(e.pointerId)) {
      maybeStopRoll();
    }
  };

  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);
  window.addEventListener('contextmenu', (e) => {
    if (!panelBackdrop) e.preventDefault();
  });

  // Keyboard interactions (preserves browser shortcuts & focused controls)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (panelBackdrop) {
        e.preventDefault();
        closePanel();
      }
      return;
    }

    if (panelBackdrop) {
      handleModalTab(e);
      return;
    }

    // Never hijack OS/browser shortcuts or function keys
    if (e.metaKey || e.ctrlKey || e.altKey || /^F\d{1,2}$/.test(e.key)) {
      return;
    }

    if (document.activeElement === parentBtn && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openPanel();
      return;
    }

    if (e.repeat || ['Meta', 'Control', 'Alt', 'Shift', 'Tab'].includes(e.key)) {
      return;
    }

    e.preventDefault();

    // Respect focused number pads when activated with Enter/Space
    const focusedPad =
      document.activeElement?.classList?.contains('toy-pad') &&
      (e.key === 'Enter' || e.key === ' ')
        ? document.activeElement
        : null;

    let x = window.innerWidth * (0.14 + Math.random() * 0.72);
    let y = window.innerHeight * (0.18 + Math.random() * 0.56);
    let forcedId = state.mode === 'numbers' && /^[1-5]$/.test(e.key) ? e.key : null;

    if (focusedPad) {
      const rect = focusedPad.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
      forcedId = focusedPad.dataset.num;
    }

    activeKeys.set(e.code, { forcedId });
    smash(x, y, forcedId);
    ensureRollScheduled();
  });

  window.addEventListener('keyup', (e) => {
    if (activeKeys.delete(e.code)) {
      maybeStopRoll();
    }
  });

  window.addEventListener('blur', () => {
    activePointers.clear();
    activeKeys.clear();
    stopRoll();
    cancelParentHold();
    flushSave();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSave();
  });

  // Parent Controls (1.5s hold on top-left corner, or Tab-focus + Enter/Space)
  function cancelParentHold() {
    clearTimeout(parentHoldTimer);
    parentHoldTimer = null;
    parentBtn.classList.remove('holding');
  }

  parentBtn.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    // Prevent quick pointer taps from focusing parentBtn and bypassing the 1.5s gate on Space/Enter
    e.preventDefault();
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

  function handleModalTab(e) {
    if (e.key !== 'Tab' || !panelBackdrop) return;
    const focusables = Array.from(
      panelBackdrop.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function closePanel() {
    if (!panelBackdrop) return;
    panelBackdrop.remove();
    panelBackdrop = null;
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
    previousFocus = null;
  }

  function openPanel() {
    if (panelBackdrop) return;
    previousFocus = document.activeElement;
    activePointers.clear();
    activeKeys.clear();
    stopRoll();
    flushSave();

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
          <button type="button" data-mode="drums" class="${state.mode === 'drums' ? 'active' : ''}" aria-pressed="${state.mode === 'drums'}">
            🥁
            <span>Drum Party</span>
            <small>Interactive kit + drum sounds</small>
          </button>
          <button type="button" data-mode="numbers" class="${state.mode === 'numbers' ? 'active' : ''}" aria-pressed="${state.mode === 'numbers'}">
            🔢
            <span>Numbers &amp; Emoji</span>
            <small>Counting pads + marimba notes</small>
          </button>
        </div>
        <div class="panel-actions">
          <button type="button" class="panel-btn ${state.muted ? 'active' : ''}" data-action="mute" aria-pressed="${state.muted}">
            ${state.muted ? '🔇 Sound muted (Tap to unmute)' : '🔊 Sound on (Tap to mute)'}
          </button>
          <button type="button" class="panel-btn" data-action="reset">
            ↺ Reset smash counter (${state.total})
          </button>
        </div>
        <p class="parent-note">Gentle colours, no flashing, and soft volume limiting.</p>
      </div>
    `;

    // Keep pointer events isolated from #game; dismiss backdrop on full click
    backdrop.addEventListener('pointerdown', (e) => e.stopPropagation());
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closePanel();
    });

    const closeBtn = backdrop.querySelector('.close');
    closeBtn.addEventListener('click', closePanel);

    backdrop.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode;
        flushSave();
        applyModeUI();
        popSoundPill(state.mode === 'drums' ? 'Ready to drum!' : 'Ready to count!');
        closePanel();
      });
    });

    const muteBtn = backdrop.querySelector('[data-action="mute"]');
    muteBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      if (state.muted) stopAllSounds();
      flushSave();
      applyModeUI();
      muteBtn.classList.toggle('active', state.muted);
      muteBtn.setAttribute('aria-pressed', String(state.muted));
      muteBtn.textContent = state.muted
        ? '🔇 Sound muted (Tap to unmute)'
        : '🔊 Sound on (Tap to mute)';
    });

    const resetBtn = backdrop.querySelector('[data-action="reset"]');
    resetBtn.addEventListener('click', () => {
      state.total = 0;
      flushSave();
      applyModeUI();
      resetBtn.textContent = '↺ Counter reset (0)';
    });

    document.body.append(backdrop);
    panelBackdrop = backdrop;
    closeBtn.focus();
  }

  applyModeUI();
})();
