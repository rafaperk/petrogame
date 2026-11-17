/**
 * Bancada de vibrações: um motor (massa m) sobre molas (rigidez k cada, em paralelo ou em série) e um amortecedor
 * viscoso (fração de amortecimento ζ). No eixo há um disco com desbalanceamento m_e·e = 0,01 kg·m.
 *
 * - **Livre**: o motor é puxado e solto. m·x'' + c·x' + k·x = 0 → ω_n = √(k/m), ζ = c/c_c, c_c = 2·√(k·m).
 * - **Forçada**: o desbalanceamento gira a n rpm e empurra o motor com F_0 = m_e·e·ω² (componente vertical).
 *   Regime permanente: X = (m_e·e/m)·r²/√((1 − r²)² + (2ζr)²), com r = ω/ω_n; força no piso F_T = X·√(k² + (c·ω)²).
 * - **Absorvedor dinâmico** (2 graus de liberdade): massa m_a = 0,2·m presa ao motor por uma mola k_a = m_a·ω_a²,
 *   sintonizada na rotação n_a. Quando a rotação é igual à sintonia, o motor para: a mola do absorvedor faz no motor
 *   uma força igual e oposta à do desbalanceamento. O sistema passa a ter duas frequências naturais.
 * Massa das molas desprezada; só a direção vertical.
 */
import type { LabValues } from '../types';
import { clamp, type LabModel } from './model';

/** Desbalanceamento do disco (kg·m): 100 g a 10 cm do eixo. */
export const UNB = 0.01;
/** Massa do absorvedor / massa do motor. */
export const MU = 0.2;
export const G = 9.81;
/** Deslocamento inicial (m) ao puxar e soltar. */
export const X0 = 0.002;

export interface Arrangement {
  name: string;
  short: string;
  /** Rigidez equivalente a partir da rigidez de cada mola. */
  keq: (k: number) => number;
  /** Como a conta aparece na tela. */
  rule: string;
}

export const ARRANGEMENTS: readonly Arrangement[] = [
  { name: '1 mola', short: '1 mola', keq: (k) => k, rule: 'keq = k' },
  { name: '2 molas em paralelo', short: '2 em paralelo', keq: (k) => 2 * k, rule: 'keq = k + k = 2·k' },
  { name: '4 molas em paralelo', short: '4 em paralelo', keq: (k) => 4 * k, rule: 'keq = 4·k' },
  { name: '2 molas em série', short: '2 em série', keq: (k) => k / 2, rule: '1/keq = 1/k + 1/k → keq = k/2' },
];

export const arrOf = (v: LabValues) => clamp(Math.round(v.arr ?? 2), 0, ARRANGEMENTS.length - 1);
const isFree = (v: LabValues) => Math.round(v.mode ?? 1) === 0;
const isForced = (v: LabValues) => !isFree(v);
const hasAbs = (v: LabValues) => Math.round(v.abs ?? 0) === 1;

// ------------------------------------------------------------------ números complexos (só o necessário)
type Cx = [number, number];
const cmul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a: Cx, b: Cx): Cx => {
  const d = b[0] * b[0] + b[1] * b[1];
  if (d === 0) return [Infinity, 0];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const cabs = (a: Cx) => Math.hypot(a[0], a[1]);

/** Regime da vibração livre: 0 sem amortecimento, 1 subamortecido, 2 crítico, 3 superamortecido. */
export type Regime = 0 | 1 | 2 | 3;
export const REGIME_NAMES = ['sem amortecimento', 'subamortecido', 'criticamente amortecido', 'superamortecido'] as const;

export interface VibSystem {
  m: number;
  /** Rigidez de cada mola e equivalente (N/m). */
  k: number;
  arr: number;
  keq: number;
  zeta: number;
  /** Amortecimento (N·s/m) e amortecimento crítico. */
  c: number;
  cc: number;
  wn: number;
  /** Absorvedor ligado, massa (kg), rigidez (N/m) e frequência de sintonia (rad/s). */
  abs: boolean;
  ma: number;
  ka: number;
  wa: number;
}

export function systemOf(v: LabValues): VibSystem {
  const m = v.m ?? 50;
  const k = (v.k ?? 50) * 1000;
  const arr = arrOf(v);
  const keq = ARRANGEMENTS[arr].keq(k);
  const zeta = Math.max(0, v.zeta ?? 0.05);
  const cc = 2 * Math.sqrt(keq * m);
  const abs = hasAbs(v);
  const ma = MU * m;
  const wa = ((v.na ?? 600) * 2 * Math.PI) / 60;
  return { m, k, arr, keq, zeta, c: zeta * cc, cc, wn: Math.sqrt(keq / m), abs, ma, ka: ma * wa * wa, wa };
}

export interface ForcedResponse {
  /** Força do desbalanceamento (N). */
  F0: number;
  /** Amplitude do motor (m) e atraso de fase em relação à força (rad, 0 a π no sistema de 1 grau). */
  X: number;
  phase: number;
  /** Amplitude e atraso do absorvedor (m, rad). */
  Xa: number;
  phaseA: number;
  /** Força transmitida ao piso pelas molas e pelo amortecedor (N). */
  FT: number;
}

/** Regime permanente sob o desbalanceamento girando a ω (rad/s). */
export function forced(s: VibSystem, w: number): ForcedResponse {
  const F0 = UNB * w * w;
  const kc: Cx = [s.keq, s.c * w];
  if (!s.abs) {
    const x = cdiv([F0, 0], [s.keq - s.m * w * w, s.c * w]);
    const X = cabs(x);
    return { F0, X, phase: X > 0 ? -Math.atan2(x[1], x[0]) : 0, Xa: 0, phaseA: 0, FT: cabs(cmul(kc, x)) };
  }
  const z22 = s.ka - s.ma * w * w;
  const z11: Cx = [s.keq + s.ka - s.m * w * w, s.c * w];
  const det: Cx = [z11[0] * z22 - s.ka * s.ka, z11[1] * z22];
  const x1 = cdiv([F0 * z22, 0], det);
  const x2 = cdiv([F0 * s.ka, 0], det);
  const X = cabs(x1);
  const Xa = cabs(x2);
  return {
    F0,
    X,
    phase: X > 0 ? -Math.atan2(x1[1], x1[0]) : 0,
    Xa,
    phaseA: Xa > 0 ? -Math.atan2(x2[1], x2[0]) : 0,
    FT: cabs(cmul(kc, x1)),
  };
}

/** Frequências naturais (rad/s, sem amortecimento) e formas modais (absorvedor/motor) do sistema com absorvedor. */
export function modesOf(s: VibSystem): { w1: number; w2: number; a1: number; a2: number } {
  const A = s.m * s.ma;
  const B = s.m * s.ka + s.ma * (s.keq + s.ka);
  const C = s.keq * s.ka;
  const disc = Math.sqrt(Math.max(0, B * B - 4 * A * C));
  const w1 = Math.sqrt((B - disc) / (2 * A));
  const w2 = Math.sqrt((B + disc) / (2 * A));
  return { w1, w2, a1: s.ka / (s.ka - s.ma * w1 * w1), a2: s.ka / (s.ka - s.ma * w2 * w2) };
}

export function regimeOf(zeta: number): Regime {
  if (zeta <= 0) return 0;
  if (Math.abs(zeta - 1) < 1e-9) return 2;
  return zeta < 1 ? 1 : 3;
}

/** Vibração livre de 1 grau, solto do repouso em x0: posição no instante t (s). */
export function freeX(zeta: number, wn: number, x0: number, t: number): number {
  const reg = regimeOf(zeta);
  if (reg <= 1) {
    const wd = wn * Math.sqrt(1 - zeta * zeta);
    return Math.exp(-zeta * wn * t) * x0 * (Math.cos(wd * t) + ((zeta * wn) / wd) * Math.sin(wd * t));
  }
  if (reg === 2) return x0 * (1 + wn * t) * Math.exp(-wn * t);
  const q = Math.sqrt(zeta * zeta - 1);
  const s1 = -wn * (zeta - q);
  const s2 = -wn * (zeta + q);
  return ((s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) * x0) / (s2 - s1);
}

/** Estado da simulação livre (motor e absorvedor), em m e m/s. */
export interface FreeSim {
  x1: number;
  v1: number;
  x2: number;
  v2: number;
}

function accel(s: VibSystem, y: FreeSim): [number, number] {
  const spring = s.abs ? s.ka * (y.x2 - y.x1) : 0;
  const a1 = (-s.keq * y.x1 - s.c * y.v1 + spring) / s.m;
  const a2 = s.abs ? -spring / s.ma : a1;
  return [a1, a2];
}

/** Um passo de Runge-Kutta (4ª ordem) da vibração livre. Sem absorvedor, x2 acompanha o motor. */
export function stepFree(s: VibSystem, y: FreeSim, h: number): FreeSim {
  const d = (q: FreeSim): FreeSim => {
    const [a1, a2] = accel(s, q);
    return { x1: q.v1, v1: a1, x2: q.v2, v2: a2 };
  };
  const add = (q: FreeSim, k: FreeSim, f: number): FreeSim => ({ x1: q.x1 + k.x1 * f, v1: q.v1 + k.v1 * f, x2: q.x2 + k.x2 * f, v2: q.v2 + k.v2 * f });
  const k1 = d(y);
  const k2 = d(add(y, k1, h / 2));
  const k3 = d(add(y, k2, h / 2));
  const k4 = d(add(y, k3, h));
  const out = add(y, k1, h / 6);
  const o2 = add(out, k2, h / 3);
  const o3 = add(o2, k3, h / 3);
  const res = add(o3, k4, h / 6);
  if (!s.abs) {
    res.x2 = res.x1;
    res.v2 = res.v1;
  }
  return res;
}

/** Energia mecânica (J) da simulação livre: cinética + molas. */
export function energyOf(s: VibSystem, y: FreeSim): number {
  let e = 0.5 * s.m * y.v1 ** 2 + 0.5 * s.keq * y.x1 ** 2;
  if (s.abs) e += 0.5 * s.ma * y.v2 ** 2 + 0.5 * s.ka * (y.x2 - y.x1) ** 2;
  return e;
}

export interface VibState extends VibSystem {
  free: boolean;
  fn: number;
  ncrit: number;
  /** Deflexão estática (m). */
  dst: number;
  regime: Regime;
  /** Frequência amortecida (rad/s), período amortecido (s) e decremento logarítmico (NaN se não oscila). */
  wd: number;
  Td: number;
  dec: number;
  rpm: number;
  w: number;
  r: number;
  resp: ForcedResponse;
  TR: number;
  /** Com absorvedor: frequências naturais (rpm) e formas modais. */
  n1: number;
  n2: number;
  a1: number;
  a2: number;
}

export function vibState(v: LabValues): VibState {
  const s = systemOf(v);
  const fn = s.wn / (2 * Math.PI);
  const regime = regimeOf(s.zeta);
  const osc = regime <= 1;
  const wd = osc ? s.wn * Math.sqrt(1 - s.zeta * s.zeta) : NaN;
  const rpm = Math.max(0, v.rpm ?? 450);
  const w = (rpm * 2 * Math.PI) / 60;
  const resp = forced(s, w);
  const md = s.abs ? modesOf(s) : { w1: NaN, w2: NaN, a1: NaN, a2: NaN };
  return {
    ...s,
    free: isFree(v),
    fn,
    ncrit: fn * 60,
    dst: (s.m * G) / s.keq,
    regime,
    wd,
    Td: osc ? (2 * Math.PI) / wd : NaN,
    dec: osc ? (2 * Math.PI * s.zeta) / Math.sqrt(1 - s.zeta * s.zeta) : NaN,
    rpm,
    w,
    r: w / s.wn,
    resp,
    TR: resp.F0 > 0 ? resp.FT / resp.F0 : 1,
    n1: (md.w1 * 60) / (2 * Math.PI),
    n2: (md.w2 * 60) / (2 * Math.PI),
    a1: md.a1,
    a2: md.a2,
  };
}

const freeOsc = (v: LabValues) => isFree(v) && regimeOf(v.zeta ?? 0.05) <= 1;

export const vibrationModel: LabModel = {
  id: 'vibration',
  name: 'Motor sobre base elástica (vibrações)',
  icon: '〰️',
  summary:
    'Um **motor** apoiado em **molas** e num **amortecedor**. Puxe e solte para ver a **vibração livre** (sub, super ou criticamente amortecida); ligue o motor e varie a rotação para achar a **ressonância**, a região de **isolamento** e o efeito do **absorvedor dinâmico** (2 graus de liberdade).',
  params: [
    { id: 'm', label: 'Massa do motor', min: 10, max: 200, step: 5, default: 50, unit: 'kg', digits: 0, help: 'Massa que vibra (motor + base). Mais massa → frequência natural menor.' },
    {
      id: 'arr',
      label: 'Molas',
      min: 0,
      max: 3,
      step: 1,
      default: 2,
      choices: ARRANGEMENTS.map((a) => a.short),
      help: 'Em paralelo as rigidezes se somam; em série somam-se os inversos (duas molas iguais em série = metade da rigidez).',
    },
    { id: 'k', label: 'Rigidez de cada mola', min: 5, max: 500, step: 5, default: 50, unit: 'kN/m', digits: 0, help: 'Força por unidade de deformação de uma mola (1 kN/m = 1 N/mm).' },
    {
      id: 'zeta',
      label: 'Fração de amortecimento ζ',
      min: 0,
      max: 1.5,
      step: 0.01,
      default: 0.05,
      digits: 2,
      help: 'ζ = c/cc: 0 = sem amortecedor; abaixo de 1 o motor oscila; 1 = crítico; acima de 1 volta sem oscilar.',
    },
    {
      id: 'mode',
      label: 'Ensaio',
      min: 0,
      max: 1,
      step: 1,
      default: 1,
      choices: ['Livre (soltar)', 'Forçada (motor ligado)'],
      help: 'Livre: o motor é deslocado e solto. Forçada: o motor gira e o desbalanceamento empurra a base a cada volta.',
    },
    { id: 'rpm', label: 'Rotação do motor', min: 0, max: 3000, step: 10, default: 450, unit: 'rpm', digits: 0, help: 'Frequência da força de desbalanceamento: f = n/60 (Hz).', show: isForced },
    {
      id: 'abs',
      label: 'Absorvedor dinâmico',
      min: 0,
      max: 1,
      step: 1,
      default: 0,
      choices: ['Sem', 'Com'],
      help: 'Uma massa (20 % da do motor) presa ao motor por uma mola: o conjunto passa a ter 2 graus de liberdade.',
    },
    {
      id: 'na',
      label: 'Sintonia do absorvedor',
      min: 200,
      max: 3000,
      step: 10,
      default: 600,
      unit: 'rpm',
      digits: 0,
      help: 'Frequência natural do absorvedor sozinho, √(ka/ma), em rpm. Na rotação de sintonia o motor para.',
      show: hasAbs,
    },
  ],
  outputs: [
    { id: 'keq', label: 'Rigidez equivalente', unit: 'kN/m', digits: 1 },
    { id: 'wn', label: 'Frequência natural ωn', unit: 'rad/s', digits: 1 },
    { id: 'fn', label: 'Frequência natural fn', unit: 'Hz', digits: 2 },
    { id: 'ncrit', label: 'Rotação de ressonância', unit: 'rpm', digits: 0 },
    { id: 'dst', label: 'Deflexão estática', unit: 'mm', digits: 2 },
    { id: 'cc', label: 'Amortecimento crítico cc', unit: 'N·s/m', digits: 0, show: isFree },
    { id: 'c', label: 'Amortecimento c', unit: 'N·s/m', digits: 0, show: isFree },
    { id: 'wd', label: 'Frequência amortecida ωd', unit: 'rad/s', digits: 1, show: freeOsc },
    { id: 'Td', label: 'Período amortecido', unit: 's', digits: 3, show: freeOsc },
    { id: 'dec', label: 'Decremento logarítmico δ', digits: 3, show: freeOsc },
    { id: 'f', label: 'Frequência da excitação', unit: 'Hz', digits: 1, show: isForced },
    { id: 'r', label: 'Razão de frequências r', digits: 2, show: (v) => isForced(v) && !hasAbs(v) },
    { id: 'F0', label: 'Força do desbalanceamento', unit: 'N', digits: 0, show: isForced },
    { id: 'X', label: 'Amplitude do motor', unit: 'mm', digits: 3, show: isForced },
    { id: 'phase', label: 'Atraso de fase', unit: '°', digits: 0, show: (v) => isForced(v) && !hasAbs(v) },
    { id: 'FT', label: 'Força transmitida ao piso', unit: 'N', digits: 0, show: isForced },
    { id: 'TR', label: 'Transmissibilidade', digits: 2, show: isForced },
    { id: 'Xa', label: 'Amplitude do absorvedor', unit: 'mm', digits: 3, show: (v) => isForced(v) && hasAbs(v) },
    { id: 'n1', label: '1ª frequência natural (2 GL)', unit: 'rpm', digits: 0, show: hasAbs },
    { id: 'n2', label: '2ª frequência natural (2 GL)', unit: 'rpm', digits: 0, show: hasAbs },
    { id: 'regime', label: 'Regime (0 a 3)', hidden: true },
    { id: 'osc', label: 'Oscila na vibração livre', hidden: true },
    { id: 'zetaOut', label: 'ζ', hidden: true },
  ],
  compute(p) {
    const st = vibState(p);
    // leituras que não se aplicam (sem oscilação, sem absorvedor) valem 0; a ressonância exata sem amortecimento, BIG
    const fin = (x: number, alt = 0) => (Number.isFinite(x) ? x : alt);
    const BIG = 1e6;
    return {
      keq: st.keq / 1000,
      wn: st.wn,
      fn: st.fn,
      ncrit: st.ncrit,
      dst: st.dst * 1000,
      cc: st.cc,
      c: st.c,
      wd: fin(st.wd),
      Td: fin(st.Td),
      dec: fin(st.dec),
      f: st.rpm / 60,
      r: st.r,
      F0: st.resp.F0,
      X: fin(st.resp.X * 1000, BIG),
      phase: fin((st.resp.phase * 180) / Math.PI),
      FT: fin(st.resp.FT, BIG),
      TR: fin(st.TR, BIG),
      Xa: fin(st.resp.Xa * 1000, BIG),
      n1: fin(st.n1),
      n2: fin(st.n2),
      regime: st.regime,
      osc: st.regime <= 1 ? 1 : 0,
      zetaOut: st.zeta,
    };
  },
  experiments: [
    {
      label: 'Puxar e soltar',
      preset: { mode: 0, zeta: 0.05, abs: 0 },
      text: 'Arraste o motor para baixo e solte. Com ζ = 0,05 ele oscila na **frequência natural** e a amplitude cai um pouco a cada ciclo. Mude ζ para 1 (crítico) e 1,5 (superamortecido).',
    },
    {
      label: 'Ressonância',
      preset: { mode: 1, zeta: 0.05, abs: 0, rpm: 300 },
      text: 'Arraste a rotação no gráfico de baixo até ~600 rpm: quando a frequência da força bate com a natural, a amplitude dispara — só o **amortecimento** a limita.',
    },
    {
      label: 'Isolamento',
      preset: { mode: 1, zeta: 0.05, abs: 0, rpm: 1500 },
      text: 'Bem acima da ressonância (r > √2) as molas **isolam**: a força no piso fica menor que a do desbalanceamento (T_{R} < 1). Aqui, mais amortecimento **piora** o isolamento.',
    },
    {
      label: 'Absorvedor dinâmico',
      preset: { mode: 1, zeta: 0.05, abs: 1, na: 600, rpm: 600 },
      text: 'O absorvedor sintonizado em 600 rpm **para** o motor nessa rotação — mas cria **duas** ressonâncias novas, uma abaixo e outra acima.',
    },
    {
      label: 'Modos naturais',
      preset: { mode: 0, zeta: 0, abs: 1, na: 600 },
      text: 'Com 2 graus de liberdade há **dois modos**. Use os botões "1º modo" e "2º modo": no 1º, motor e absorvedor vão juntos; no 2º, vão em sentidos opostos — cada um numa frequência só.',
    },
  ],
};
