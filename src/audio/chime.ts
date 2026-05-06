// Chime synthesis via Web Audio. Sine wave + soft attack + slow exponential
// decay gives a glockenspiel-ish bell timbre. No asset download needed.

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    _ctx = new Ctor();
  }
  if (_ctx.state === 'suspended') void _ctx.resume();
  return _ctx;
}

type Voice = 'sine' | 'bell' | 'pluck' | 'epiano';

/** Pure sine — soft, mellow. Used for the KIX chime. */
function playSine(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  volume: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.linearRampToValueAtTime(volume, startAt + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

/**
 * Two-op FM bell — carrier sine + modulator at inharmonic 1.4× ratio.
 * Modulation depth itself decays, so brightness fades faster than amplitude
 * (the classic DX7 "tubular bell" character). Iconic, articulate, not muddy.
 */
function playBell(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  volume: number,
): void {
  const carrier = ctx.createOscillator();
  const modulator = ctx.createOscillator();
  const modGain = ctx.createGain();
  const amp = ctx.createGain();

  carrier.type = 'sine';
  modulator.type = 'sine';
  carrier.frequency.value = freq;
  modulator.frequency.value = freq * 1.4;

  // Modulation depth: bright at strike, decays to zero faster than amp tail
  const modDepth = freq * 4.5;
  modGain.gain.setValueAtTime(modDepth, startAt);
  modGain.gain.exponentialRampToValueAtTime(
    0.001,
    startAt + Math.max(duration * 0.45, 0.08),
  );
  modulator.connect(modGain);
  modGain.connect(carrier.frequency);

  carrier.connect(amp);
  amp.connect(ctx.destination);
  amp.gain.setValueAtTime(0.0001, startAt);
  amp.gain.linearRampToValueAtTime(volume, startAt + 0.004); // sharp percussive attack
  amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  carrier.start(startAt);
  modulator.start(startAt);
  carrier.stop(startAt + duration + 0.05);
  modulator.stop(startAt + duration + 0.05);
}

/**
 * Additive pluck — fundamental triangle + sine octave + sine fifth.
 * Rounder than the FM bell; cleaner in the bass register where FM mod can
 * become rumbly.
 */
function playPluck(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  volume: number,
): void {
  const partials = [
    { mult: 1, type: 'triangle' as OscillatorType, gain: 1.0, dur: duration },
    { mult: 2, type: 'sine' as OscillatorType, gain: 0.35, dur: duration * 0.7 },
    { mult: 3, type: 'sine' as OscillatorType, gain: 0.10, dur: duration * 0.4 },
  ];
  for (const p of partials) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = p.type;
    osc.frequency.value = freq * p.mult;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(volume * p.gain, startAt + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + p.dur);
    osc.start(startAt);
    osc.stop(startAt + p.dur + 0.05);
  }
}

/**
 * Electric piano — additive synthesis matching the Rhodes / DX7 EP1 spectrum:
 *
 *   • fundamental sine            (warm body)
 *   • 2× octave sine, 32 %        (piano harmonic body)
 *   • 3× sine, 10 %, fast decay   (brilliance)
 *   • 4.04× *inharmonic* "tine"   (characteristic e-piano metallic ping —
 *                                  very short, fades in ~120 ms)
 *
 * Gentle 12 ms attack (no click) + long exponential tail = piano envelope.
 * The brief inharmonic partial is what makes it sound like an electronic
 * piano specifically rather than an acoustic upright.
 */
function playEPiano(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  volume: number,
): void {
  const partials = [
    { mult: 1.0, gain: 1.0, decay: duration }, // fundamental
    { mult: 2.0, gain: 0.32, decay: duration * 0.85 }, // octave
    { mult: 3.0, gain: 0.1, decay: duration * 0.55 }, // brilliance
    { mult: 4.04, gain: 0.06, decay: Math.min(duration * 0.18, 0.12) }, // tine
  ];
  for (const p of partials) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * p.mult;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(volume * p.gain, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + p.decay);
    osc.start(startAt);
    osc.stop(startAt + p.decay + 0.05);
  }
}

function playNote(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  volume = 0.22,
  voice: Voice = 'sine',
): void {
  if (voice === 'bell') return playBell(ctx, freq, startAt, duration, volume);
  if (voice === 'pluck') return playPluck(ctx, freq, startAt, duration, volume);
  if (voice === 'epiano') return playEPiano(ctx, freq, startAt, duration, volume);
  return playSine(ctx, freq, startAt, duration, volume);
}

interface Step {
  /** frequency in Hz, or null for a rest */
  f: number | null;
  /** offset (seconds) from sequence start when this note begins */
  at: number;
  /** sustain duration (seconds); resting tail beyond next note OK */
  dur?: number;
  /** per-note volume override (default 0.22) */
  vol?: number;
  /** instrument timbre (default 'sine') */
  voice?: Voice;
}

function playSequence(steps: Step[], tailDur = 0.9): void {
  try {
    const ctx = getCtx();
    const t0 = ctx.currentTime + 0.02;
    for (const s of steps) {
      if (s.f == null) continue;
      playNote(ctx, s.f, t0 + s.at, s.dur ?? tailDur, s.vol, s.voice);
    }
  } catch {
    /* Web Audio unavailable — silently no-op */
  }
}

// ─── KIX 関西空港 chime: E5 – C#5 – E5 – A5 ─────────────────────────
// E5=659.25, C#5=554.37, A5=880.00
export function playKixChime(): void {
  const stride = 0.34;
  const notes = [659.25, 554.37, 659.25, 880.0];
  playSequence(
    notes.map((f, i) => ({ f, at: i * stride, dur: 0.95 })),
    0.95,
  );
}

// ─── 御堂筋線 (Midosuji Line) approach melodies ─────────────────────
// Two patterns; one picked at random per click for variety.

// Pitch table (equal-tempered, A4 = 440)
const C2 = 65.41;
const F2 = 87.31;
const G2 = 98.0;
const A2 = 110.0;
const C3 = 130.81;
const A4 = 440.0;
const D5 = 587.33;
const E5 = 659.25;
const F5 = 698.46;
const A5 = 880.0;

// Variant A — flowing arpeggio (10 notes, two voices in parallel)
//   Treble: D5  A4  E5  A4  F5   D5  A4  E5  A4  D5
//   Bass:   F2  C2  G2  C2  A2   F2  C2  G2  C2  F2
function playMidosujiVariantA(): void {
  const stride = 0.20; // a touch slower; piano sustain doesn't need rush
  const treble = [D5, A4, E5, A4, F5, D5, A4, E5, A4, D5];
  const bass = [F2, C2, G2, C2, A2, F2, C2, G2, C2, F2];
  const seq: Step[] = [];
  for (let i = 0; i < treble.length; i++) {
    const at = i * stride;
    const last = i === treble.length - 1;
    // Long sustain so notes overlap into chordal piano texture.
    seq.push({ f: treble[i], at, dur: last ? 1.6 : 1.0, vol: 0.18, voice: 'epiano' });
    seq.push({ f: bass[i], at, dur: last ? 1.8 : 1.2, vol: 0.13, voice: 'epiano' });
  }
  playSequence(seq, 1.8);
}

// Variant B — melody with rests (4 notes, quarter rest, 4 notes, eighth rest)
//   Treble: F5  A5  E5  A5  [♩]  F5  A5  E5  D5  [♪]
//   Bass:   A2  C3  G2  C3  [♩]  A2  C3  G2  F2  [♪]
function playMidosujiVariantB(): void {
  const beat = 0.30; // quarter note duration
  type Pitched = { kind: 'note'; t: number; b: number };
  type Rest = { kind: 'rest'; len: number };
  const score: (Pitched | Rest)[] = [
    { kind: 'note', t: F5, b: A2 },
    { kind: 'note', t: A5, b: C3 },
    { kind: 'note', t: E5, b: G2 },
    { kind: 'note', t: A5, b: C3 },
    { kind: 'rest', len: beat }, // 四分休止
    { kind: 'note', t: F5, b: A2 },
    { kind: 'note', t: A5, b: C3 },
    { kind: 'note', t: E5, b: G2 },
    { kind: 'note', t: D5, b: F2 },
    { kind: 'rest', len: beat / 2 }, // 八分休止
  ];
  const seq: Step[] = [];
  let t = 0;
  for (const ev of score) {
    if (ev.kind === 'rest') {
      t += ev.len;
      continue;
    }
    // Both voices use epiano: piano envelope + light metallic gloss.
    seq.push({ f: ev.t, at: t, dur: 1.1, vol: 0.18, voice: 'epiano' });
    seq.push({ f: ev.b, at: t, dur: 1.3, vol: 0.13, voice: 'epiano' });
    t += beat;
  }
  playSequence(seq, 1.3);
}

export function playMidosujiChime(): void {
  // Random pick per click so repeated clicks don't get monotonous
  if (Math.random() < 0.5) playMidosujiVariantA();
  else playMidosujiVariantB();
}
