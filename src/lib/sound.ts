/**
 * Optional ambience: a synthesized campfire (low rumble + random crackles).
 * - Never autoplays (WCAG 1.4.2); starts only from a user gesture.
 * - Zero network cost: generated with the Web Audio API.
 * - Fades in/out to avoid clicks.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let crackleTimer: number | null = null;

function noiseBuffer(ac: AudioContext, seconds: number, brown = false) {
  const len = ac.sampleRate * seconds;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = w;
  }
  return buf;
}

function crackle() {
  if (!ctx || !master) return;
  const ac = ctx;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, 0.05);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1500 + Math.random() * 3500;
  bp.Q.value = 1.2;
  const g = ac.createGain();
  const now = ac.currentTime;
  const peak = 0.08 + Math.random() * 0.22;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(peak, now + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03 + Math.random() * 0.05);
  src.connect(bp).connect(g).connect(master);
  src.start(now);
  src.stop(now + 0.1);
  crackleTimer = window.setTimeout(crackle, 40 + Math.random() * (Math.random() > 0.85 ? 900 : 260));
}

export function startAmbience() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const rumble = ctx.createBufferSource();
    rumble.buffer = noiseBuffer(ctx, 4, true);
    rumble.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const rg = ctx.createGain();
    rg.gain.value = 0.55;
    rumble.connect(lp).connect(rg).connect(master);
    rumble.start();
  }
  ctx.resume();
  master!.gain.cancelScheduledValues(ctx.currentTime);
  master!.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2);
  if (crackleTimer === null) crackle();
}

export function stopAmbience() {
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  if (crackleTimer !== null) {
    clearTimeout(crackleTimer);
    crackleTimer = null;
  }
  window.setTimeout(() => ctx?.suspend(), 700);
}
