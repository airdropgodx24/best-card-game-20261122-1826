// Tiny WebAudio synth for Ember Court: no audio files, every sound is
// built in code. Created lazily on the first user gesture.

let audioCtx = null;

export function ensureAudio() {
  if (audioCtx) return audioCtx;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  } catch {
    audioCtx = null;
  }
  return audioCtx;
}

function tone(freq, dur, type, vol, when) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ctx.currentTime + (when || 0);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function playSound(kind) {
  if (kind === 'play') tone(520, 0.12, 'triangle', 0.12, 0);
  if (kind === 'hit') {
    tone(180, 0.15, 'sawtooth', 0.1, 0);
    tone(120, 0.2, 'sawtooth', 0.08, 0.05);
  }
  if (kind === 'heal') tone(660, 0.25, 'sine', 0.1, 0);
  if (kind === 'turn') tone(440, 0.08, 'triangle', 0.08, 0);
  if (kind === 'win') {
    tone(523, 0.15, 'triangle', 0.12, 0);
    tone(659, 0.15, 'triangle', 0.12, 0.15);
    tone(784, 0.3, 'triangle', 0.12, 0.3);
  }
  if (kind === 'lose') {
    tone(392, 0.2, 'sawtooth', 0.08, 0);
    tone(311, 0.2, 'sawtooth', 0.08, 0.2);
    tone(233, 0.4, 'sawtooth', 0.08, 0.4);
  }
}
