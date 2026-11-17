/**
 * Bancada do ensaio de impacto Charpy: um pêndulo (m = 20 kg, braço L = 0,85 m) cai de h₀ = 1,5 m, rompe um corpo de
 * prova entalhado em V (10 × 10 × 55 mm) e sobe do outro lado até h_f. Energia absorvida: E = m·g·(h₀ − h_f).
 *
 * - Aços ferríticos (CCC): curva de transição dúctil-frágil E(T) = E_inf + (E_sup − E_inf)·(1 + tanh((T − T_t)/c))/2.
 *   Mais carbono baixa o patamar superior e sobe a temperatura de transição; grão fino (normalizado) faz o contrário.
 * - CFC (inox austenítico, alumínio): sem transição — a energia muda pouco com a temperatura e a fratura é sempre
 *   dúctil (fibrosa).
 * - Aparência da fratura: a fração fibrosa (dúctil) acompanha a posição na curva (0 % no patamar inferior,
 *   100 % no superior).
 * Atrito e resistência do ar desprezados.
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

/** Pêndulo: massa (kg), braço (m), altura de queda (m) e g. */
export const PENDULUM = { m: 20, L: 0.85, h0: 1.5, g: 9.81 } as const;
/** Energia disponível no pêndulo (J). */
export const E0 = PENDULUM.m * PENDULUM.g * PENDULUM.h0;
/** Ângulo de partida a partir da vertical (rad). */
export const ALPHA0 = Math.acos(1 - PENDULUM.h0 / PENDULUM.L);

export interface ChMat {
  name: string;
  short: string;
  crystal: 'CCC' | 'CFC';
  /** Aço: patamares (J), temperatura de transição (°C) e largura (°C), com grão grosso e com grão fino. */
  steel?: { up: number; low: number; tt: number; c: number; upFine: number; ttFine: number };
  /** CFC: E(T) = base + rise·(1 + tanh((T − mid)/c))/2, sempre dúctil. */
  fcc?: { base: number; rise: number; mid: number; c: number };
}

export const CH_MATS: readonly ChMat[] = [
  { name: 'Aço carbono 0,2 %C (estrutural)', short: 'Aço 0,2 %C', crystal: 'CCC', steel: { up: 180, low: 6, tt: -10, c: 18, upFine: 200, ttFine: -45 } },
  { name: 'Aço carbono 0,6 %C', short: 'Aço 0,6 %C', crystal: 'CCC', steel: { up: 60, low: 4, tt: 45, c: 25, upFine: 68, ttFine: 15 } },
  { name: 'Aço inoxidável austenítico 304', short: 'Inox 304', crystal: 'CFC', fcc: { base: 150, rise: 45, mid: -60, c: 90 } },
  { name: 'Liga de alumínio 6061-T6', short: 'Alumínio', crystal: 'CFC', fcc: { base: 16, rise: 6, mid: 0, c: 120 } },
];

export const chMatOf = (v: LabValues) => Math.min(CH_MATS.length - 1, Math.max(0, Math.round(v.mat ?? 0)));
const isSteel = (v: LabValues) => !!CH_MATS[chMatOf(v)].steel;

/** Patamares, transição e largura do aço, conforme o grão. */
export function steelCurve(m: ChMat, fine: boolean): { up: number; low: number; tt: number; c: number } {
  const s = m.steel!;
  return { up: fine ? s.upFine : s.up, low: s.low, tt: fine ? s.ttFine : s.tt, c: s.c };
}

/** Energia absorvida (J) a T (°C). */
export function charpyEnergy(m: ChMat, fine: boolean, T: number): number {
  if (m.steel) {
    const { up, low, tt, c } = steelCurve(m, fine);
    return low + ((up - low) * (1 + Math.tanh((T - tt) / c))) / 2;
  }
  const f = m.fcc!;
  return f.base + (f.rise * (1 + Math.tanh((T - f.mid) / f.c))) / 2;
}

/** Fração fibrosa (dúctil) da fratura, %. */
export function shearOf(m: ChMat, fine: boolean, T: number): number {
  if (!m.steel) return 100;
  const { tt, c } = steelCurve(m, fine);
  return (100 * (1 + Math.tanh((T - tt) / c))) / 2;
}

/** Temperatura (°C) em que o aço absorve `e` joules (entre os patamares). */
export function tempForEnergy(m: ChMat, fine: boolean, e: number): number {
  const { up, low, tt, c } = steelCurve(m, fine);
  const s = Math.min(0.999999, Math.max(1e-6, (e - low) / (up - low)));
  return tt + c * Math.atanh(2 * s - 1);
}

export interface ChState {
  idx: number;
  m: ChMat;
  fine: boolean;
  T: number;
  E: number;
  /** Altura final (m) e ângulo final a partir da vertical (rad). */
  hf: number;
  beta: number;
  shear: number;
  /** Aço: temperatura de transição (50 % entre os patamares) e a de 27 J. */
  tt: number;
  t27: number;
  /** 'ductile' (≥ 90 % fibrosa), 'mixed' ou 'brittle' (≤ 10 %). */
  mode: 'ductile' | 'mixed' | 'brittle';
}

export function chState(v: LabValues): ChState {
  const idx = chMatOf(v);
  const m = CH_MATS[idx];
  const fine = !!m.steel && Math.round(v.grain ?? 0) === 1;
  const T = v.T ?? 20;
  const E = charpyEnergy(m, fine, T);
  const { m: mass, g, L, h0 } = PENDULUM;
  const hf = h0 - E / (mass * g);
  const beta = Math.acos(Math.max(-1, Math.min(1, 1 - hf / L)));
  const shear = shearOf(m, fine, T);
  return {
    idx,
    m,
    fine,
    T,
    E,
    hf,
    beta,
    shear,
    tt: m.steel ? steelCurve(m, fine).tt : 0,
    t27: m.steel ? tempForEnergy(m, fine, 27) : 0,
    mode: shear >= 90 ? 'ductile' : shear <= 10 ? 'brittle' : 'mixed',
  };
}

export const charpyModel: LabModel = {
  id: 'charpy',
  name: 'Ensaio de impacto Charpy',
  icon: '🔨',
  summary:
    'Um **pêndulo** rompe um corpo de prova com **entalhe em V** e sobe menos do que caiu: a diferença de altura é a **energia absorvida**, E = m·g·(h₀ − h_{f}). Esfrie o aço e veja a **transição dúctil-frágil**; compare com os metais **CFC**, que não têm transição.',
  params: [
    {
      id: 'mat',
      label: 'Material',
      min: 0,
      max: 3,
      step: 1,
      default: 0,
      choices: CH_MATS.map((m) => m.short),
      help: 'Aços carbono com 0,2 e 0,6 %C (ferrita + perlita, CCC), inox austenítico 304 e alumínio 6061-T6 (CFC).',
    },
    {
      id: 'grain',
      label: 'Grão do aço',
      min: 0,
      max: 1,
      step: 1,
      default: 0,
      choices: ['Grosso (laminado)', 'Fino (normalizado)'],
      help: 'A normalização refina o grão da ferrita: o aço fica mais resistente e mais tenaz ao mesmo tempo.',
      show: isSteel,
    },
    {
      id: 'T',
      label: 'Temperatura do corpo de prova',
      min: -120,
      max: 120,
      step: 1,
      default: 20,
      unit: '°C',
      digits: 0,
      help: 'O corpo de prova fica no banho térmico (álcool com gelo-seco, água, óleo) e é rompido em poucos segundos.',
    },
  ],
  outputs: [
    { id: 'E', label: 'Energia absorvida', unit: 'J', digits: 0 },
    { id: 'hf', label: 'Altura final do martelo', unit: 'm', digits: 2 },
    { id: 'shear', label: 'Fratura fibrosa (dúctil)', unit: '%', digits: 0 },
    { id: 'tt', label: 'Temperatura de transição', unit: '°C', digits: 0, show: isSteel },
    { id: 't27', label: 'Temperatura para 27 J', unit: '°C', digits: 0, show: isSteel },
    { id: 'beta', label: 'Ângulo final', unit: '°', digits: 0, hidden: true },
    { id: 'brittle', label: 'Fratura frágil', hidden: true },
  ],
  compute(p) {
    const st = chState(p);
    return {
      E: st.E,
      hf: st.hf,
      shear: st.shear,
      tt: st.tt,
      t27: st.t27,
      beta: (st.beta * 180) / Math.PI,
      brittle: st.mode === 'brittle' ? 1 : 0,
    };
  },
  experiments: [
    {
      label: 'Transição dúctil-frágil',
      preset: { mat: 0, grain: 0, T: 20 },
      text: 'Arraste a temperatura no gráfico: perto de 20 °C o aço absorve muita energia (fratura **fibrosa**, opaca); abaixo de −30 °C ele quebra como vidro (fratura **brilhante**, por clivagem).',
    },
    {
      label: 'CFC não tem transição',
      preset: { mat: 2, grain: 0, T: -100 },
      text: 'O **inox austenítico** (CFC) continua tenaz a −100 °C — por isso ele vai em tanques criogênicos (GNL, oxigênio líquido). O alumínio também não tem transição, só que absorve pouca energia.',
    },
    {
      label: 'Mais carbono',
      preset: { mat: 1, grain: 0, T: 20 },
      text: 'Com 0,6 %C (mais perlita) o patamar superior cai para ~60 J e a transição sobe para ~45 °C: à temperatura ambiente o aço já está na região frágil.',
    },
    {
      label: 'Grão fino',
      preset: { mat: 0, grain: 1, T: -40 },
      text: 'O **refino de grão** (normalização) desloca a transição para ~35 °C abaixo. É o único mecanismo que aumenta a resistência **e** a tenacidade ao mesmo tempo.',
    },
  ],
};
