/**
 * Efeitos sonoros sintetizados na hora (WebAudio) — nada de arquivos de áudio.
 */
import { state } from './state';

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (!state.data.settings.sound) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.06, delay = 0, slideTo?: number): void {
  const ac = context();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  blip(): void {
    tone(520 + Math.random() * 160, 0.035, 'square', 0.025);
  },
  select(): void {
    tone(660, 0.06, 'square', 0.04);
  },
  confirm(): void {
    tone(740, 0.07, 'square', 0.045);
    tone(988, 0.09, 'square', 0.04, 0.06);
  },
  correct(): void {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, 'triangle', 0.07, i * 0.07));
  },
  wrong(): void {
    tone(330, 0.18, 'sawtooth', 0.035, 0, 196);
  },
  levelUp(): void {
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.045, i * 0.09));
  },
  water(): void {
    [880, 740, 988].forEach((f, i) => tone(f, 0.08, 'sine', 0.06, i * 0.05));
  },
  page(): void {
    tone(400, 0.05, 'triangle', 0.04, 0, 600);
  },
  toggle(): void {
    tone(440, 0.05, 'square', 0.03);
  },
  coin(): void {
    tone(988, 0.06, 'square', 0.04);
    tone(1319, 0.12, 'square', 0.04, 0.06);
  },
};
