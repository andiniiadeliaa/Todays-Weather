// Web Audio API ambient rain sound generator

let audioCtx = null;
let noiseSource = null;
let filterNode = null;
let gainNode = null;

/**
 * Lazily create the AudioContext on first call.
 * Safe to call multiple times — exits early if already initialized.
 */
export function initAudio() {
  if (audioCtx) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtx();
  } catch (e) {
    console.warn('audio.js: AudioContext not available', e);
    audioCtx = null;
  }
}

/**
 * Build the audio graph: white noise → lowpass filter (400 Hz) → gain → destination.
 * @param {AudioContext} ctx
 */
export function buildAudioGraph(ctx) {
  try {
    // Create a 2-second stereo white noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    filterNode = ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 400;

    gainNode = ctx.createGain();
    gainNode.gain.value = 0.35;

    noiseSource.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(0);
  } catch (e) {
    console.warn('audio.js: buildAudioGraph failed', e);
  }
}

/**
 * Stop and disconnect all audio graph nodes, then clear references.
 */
export function tearDownAudioGraph() {
  try {
    if (noiseSource) {
      noiseSource.stop();
      noiseSource.disconnect();
      noiseSource = null;
    }
    if (filterNode) {
      filterNode.disconnect();
      filterNode = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
  } catch (e) {
    console.warn('audio.js: tearDownAudioGraph error', e);
  }
}

/**
 * Enable or disable the ambient rain sound.
 * @param {boolean} enable
 */
export function toggleSound(enable) {
  if (enable) {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    buildAudioGraph(audioCtx);
  } else {
    tearDownAudioGraph();
  }
}

/**
 * Persist sound preference to localStorage.
 * @param {string} state — 'on' or 'off'
 */
export function saveSoundPref(state) {
  try {
    localStorage.setItem('cozyRain_sound', state);
  } catch (e) {
    console.warn('audio.js: localStorage.setItem failed', e);
  }
}

/**
 * Read sound preference from localStorage.
 * @returns {'on'|'off'}
 */
export function restoreSoundPref() {
  try {
    const stored = localStorage.getItem('cozyRain_sound');
    if (stored === 'on' || stored === 'off') return stored;
  } catch (e) {
    // localStorage unavailable — fall through to default
  }
  return 'off';
}
