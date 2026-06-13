let ctx: AudioContext | null = null;
function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); }
    catch { return null; }
  }
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.15, delay = 0) {
  const c = ensure(); if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = 0;
  o.connect(g); g.connect(c.destination);
  const t = c.currentTime + delay;
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur + 0.05);
}

export const sfx = {
  correct() { tone(660, 0.12, "triangle", 0.18); tone(990, 0.18, "triangle", 0.15, 0.1); },
  wrong()   { tone(180, 0.25, "sawtooth", 0.18); tone(120, 0.3, "sawtooth", 0.15, 0.1); },
  tick()    { tone(800, 0.04, "square", 0.06); },
  win()     { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.2, "triangle", 0.18, i * 0.12)); },
  click()   { tone(440, 0.05, "square", 0.08); },
};
