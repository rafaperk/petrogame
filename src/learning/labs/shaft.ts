/**
 * Bancada do eixo: uma árvore de aço SAE 1045 apoiada em dois mancais (A e B, a 800 mm um do outro), girada pelo
 * motor através de um acoplamento. Uma engrenagem (D = 250 mm, ângulo de pressão 20°, 15 kg) entre os mancais passa a
 * potência para a máquina movida: a força nos dentes flete o eixo e carrega os mancais, e o trecho entre o acoplamento
 * e a engrenagem sofre torção. A massa da engrenagem sobre o eixo (de massa desprezível) dá a velocidade crítica.
 * Os mancais podem ser rolamentos (vida L10) ou buchas lubrificadas (número de Sommerfeld e curva de Stribeck).
 * Números didáticos, de ordem de grandeza real.
 */
import type { LabValues } from '../types';
import { clamp, type LabModel } from './model';

/** Distância entre os mancais (mm). */
export const SPAN = 800;
/** Diâmetro primitivo da engrenagem (mm), ângulo de pressão (°) e massa (kg). */
export const GEAR_D = 250;
export const PRESSURE = 20;
export const GEAR_M = 15;
/** Aço SAE 1045 laminado (MPa). SE = limite de fadiga já corrigido (acabamento, tamanho). */
export const E_STEEL = 200e3;
export const SY = 310;
export const SU = 565;
export const SE = 200;
/** Desbalanceamento residual da engrenagem (µm) e amortecimento do eixo. */
export const ECC = 20;
export const ZETA = 0.03;
/** Capacidade dinâmica dos rolamentos (kN) e expoente da vida. */
export const BEARINGS = [
  { name: 'esferas', C: 15, p: 3 },
  { name: 'rolos', C: 28, p: 10 / 3 },
] as const;
/** Vida máxima mostrada (h): acima disso o rolamento está "folgado" e o número perde sentido. */
export const LIFE_CAP = 1e7;
/** Bucha: comprimento = diâmetro (L/D = 1), rugosidade combinada (µm), atrito sem filme, densidade do óleo. */
export const ROUGH = 1;
export const F_BOUNDARY = 0.12;
export const RHO_OIL = 870;

const PI = Math.PI;

// ------------------------------------------------------------------ óleo
/** Viscosidade cinemática (cSt) a 40 °C e 100 °C dos óleos monoviscosos (Walther/ASTM D341 entre os dois pontos). */
const MONO = {
  sae10: { v40: 32, v100: 5.4 },
  sae30: { v40: 100, v100: 11.5 },
} as const;

export const OILS = ['SAE 10', 'SAE 30', 'SAE 10W-30'] as const;

function walther(o: { v40: number; v100: number }, tC: number): number {
  const x40 = Math.log10(313.15);
  const x100 = Math.log10(373.15);
  const y40 = Math.log10(Math.log10(o.v40 + 0.7));
  const y100 = Math.log10(Math.log10(o.v100 + 0.7));
  const B = (y40 - y100) / (x100 - x40);
  const A = y40 + B * x40;
  const y = A - B * Math.log10(tC + 273.15);
  return Math.pow(10, Math.pow(10, y)) - 0.7;
}

/**
 * Viscosidade cinemática (cSt) do óleo `oil` (índice de OILS) a `tC` °C. O multiviscoso 10W-30 é fino como o SAE 10
 * no frio (0 °C) e encorpado como o SAE 30 no quente (100 °C): entre os dois, o logaritmo da viscosidade passa de um
 * para o outro (é o efeito do aditivo melhorador do índice de viscosidade).
 */
export function oilVisc(oil: number, tC: number): number {
  const v10 = walther(MONO.sae10, tC);
  const v30 = walther(MONO.sae30, tC);
  if (oil === 0) return v10;
  if (oil === 1) return v30;
  const w = clamp(tC / 100, 0, 1);
  return Math.exp((1 - w) * Math.log(v10) + w * Math.log(v30));
}

// ------------------------------------------------------------------ bucha (Raimondi e Boyd, L/D = 1)
/** [S, ε, (r/c)·f] para mancal completo com L/D = 1. */
const RB: readonly (readonly [number, number, number])[] = [
  [0.00474, 0.97, 0.514],
  [0.0188, 0.9, 1.05],
  [0.0446, 0.8, 1.7],
  [0.121, 0.6, 3.22],
  [0.264, 0.4, 5.79],
  [0.631, 0.2, 12.8],
  [1.33, 0.1, 26.4],
];

/** Excentricidade relativa ε e atrito do filme (r/c)·f a partir do número de Sommerfeld. */
export function journalOf(S: number): { eps: number; rcf: number } {
  const s = Math.max(S, 1e-9);
  const first = RB[0];
  const last = RB[RB.length - 1];
  if (s <= first[0]) {
    // abaixo da tabela: o filme continua afinando (1 − ε ∝ S^0,87) e o atrito do filme cai com √S
    const k = s / first[0];
    return { eps: 1 - (1 - first[1]) * Math.pow(k, 0.87), rcf: first[2] * Math.sqrt(k) };
  }
  if (s >= last[0]) {
    // eixo quase centrado: Petroff, (r/c)·f = 2π²·S
    return { eps: last[1] * (last[0] / s), rcf: 2 * PI * PI * s };
  }
  for (let i = 1; i < RB.length; i++) {
    const [s1, e1, f1] = RB[i];
    if (s <= s1) {
      const [s0, e0, f0] = RB[i - 1];
      const t = (Math.log(s) - Math.log(s0)) / (Math.log(s1) - Math.log(s0));
      return { eps: e0 + (e1 - e0) * t, rcf: Math.exp(Math.log(f0) + (Math.log(f1) - Math.log(f0)) * t) };
    }
  }
  return { eps: last[1], rcf: last[2] };
}

export interface JournalState {
  /** Viscosidade dinâmica (Pa·s) e cinemática (cSt). */
  mu: number;
  nu: number;
  /** Pressão média no mancal W/(L·D) (Pa). */
  p: number;
  /** Número de Hersey μN/P (N em rps). */
  hersey: number;
  S: number;
  eps: number;
  /** Folga radial (µm) e espessura mínima do filme (µm). */
  c: number;
  h0: number;
  /** Espessura do filme ÷ rugosidade. */
  lambda: number;
  /** 0 = limítrofe (contato metal-metal), 1 = misto, 2 = hidrodinâmico (filme completo). */
  regime: number;
  f: number;
  /** Potência perdida por atrito (W). */
  loss: number;
}

/**
 * Atrito de uma bucha com filme Λ (espessura ÷ rugosidade): o contato entre as rugosidades some aos poucos entre
 * Λ ≈ 0,7 e Λ ≈ 4 (lubrificação mista), e o que sobra é o atrito viscoso do filme.
 */
export function frictionOf(rcf: number, cr: number, lambda: number): number {
  const t = clamp((Math.log(Math.max(lambda, 1e-9)) - Math.log(0.7)) / (Math.log(4) - Math.log(0.7)), 0, 1);
  const w = 1 - t * t * (3 - 2 * t);
  return w * F_BOUNDARY + (1 - w) * rcf * cr;
}

/** Bucha de diâmetro d (mm) e comprimento d, carga W (N), rotação n (rpm), folga relativa cr (c/r), óleo e temperatura. */
export function journalState(W: number, d: number, n: number, cr: number, oil: number, tC: number): JournalState {
  const nu = oilVisc(oil, tC);
  const mu = (RHO_OIL * nu) / 1e6;
  const D = d / 1000;
  const p = Math.max(W, 1e-6) / (D * D);
  const N = n / 60;
  const hersey = (mu * N) / p;
  const S = hersey / (cr * cr);
  const { eps, rcf } = journalOf(S);
  const c = (cr * d * 1000) / 2;
  const h0 = c * (1 - eps);
  const lambda = h0 / ROUGH;
  const f = frictionOf(rcf, cr, lambda);
  const loss = f * W * (D / 2) * ((2 * PI * n) / 60);
  const regime = lambda < 1 ? 0 : lambda < 3 ? 1 : 2;
  return { mu, nu, p, hersey, S, eps, c, h0, lambda, regime, f, loss };
}

// ------------------------------------------------------------------ eixo
export interface ShaftState {
  brg: number;
  P: number;
  n: number;
  /** Posição da engrenagem a partir do mancal A e o resto do vão (mm). */
  a: number;
  b: number;
  d: number;
  /** Torque (N·m), força tangencial e resultante nos dentes (N). */
  T: number;
  Ft: number;
  F: number;
  /** Reações nos mancais (N) e momento fletor máximo, sob a engrenagem (N·m). */
  RA: number;
  RB: number;
  M: number;
  /** Tensões na superfície (MPa): flexão (alternada, o eixo gira), torção, von Mises e Tresca. */
  sig: number;
  tau: number;
  svm: number;
  tmax: number;
  /** Fatores de segurança: escoamento por von Mises e por Tresca; fadiga por Goodman (von Mises). */
  FS: number;
  FStr: number;
  FSf: number;
  /** Rigidez do eixo sob a engrenagem (N/m), flecha estática (mm) e velocidade crítica (rpm). */
  k: number;
  defl: number;
  nc: number;
  r: number;
  /** Amplitude da vibração pelo desbalanceamento (µm). */
  amp: number;
  /** Vida L10 dos rolamentos (h), limitada a LIFE_CAP. */
  LA: number;
  LB: number;
  /** Bucha do mancal mais carregado. */
  jr: JournalState;
  /** Mancal mais carregado: 0 = A, 1 = B. */
  worst: number;
}

/** Vida L10 em horas: (C/P)^p milhões de rotações, à rotação n. */
export function lifeHours(Ckn: number, p: number, loadN: number, n: number): number {
  const L10 = Math.pow((Ckn * 1000) / Math.max(loadN, 1e-6), p);
  return Math.min(LIFE_CAP, (L10 * 1e6) / (60 * Math.max(n, 1e-6)));
}

export function shaftState(v: LabValues): ShaftState {
  const brg = clamp(Math.round(v.brg ?? 0), 0, 2);
  const P = Math.max(0.01, v.P ?? 15);
  const n = Math.max(1, v.n ?? 1150);
  const a = clamp(v.a ?? 400, 1, SPAN - 1);
  const b = SPAN - a;
  const d = Math.max(5, v.d ?? 40);
  const omega = (2 * PI * n) / 60;
  const T = (P * 1000) / omega;
  const Ft = (2 * T * 1000) / GEAR_D;
  const F = Ft / Math.cos((PRESSURE * PI) / 180);
  const RA = (F * b) / SPAN;
  const RB = (F * a) / SPAN;
  const M = (F * a * b) / SPAN / 1000;
  const d3 = d * d * d;
  const sig = (32 * M * 1000) / (PI * d3);
  const tau = (16 * T * 1000) / (PI * d3);
  const svm = Math.sqrt(sig * sig + 3 * tau * tau);
  const tmax = Math.sqrt((sig / 2) ** 2 + tau * tau);
  const FS = SY / svm;
  const FStr = SY / (2 * tmax);
  // eixo girando: a flexão é alternada (amplitude σ) e a torção é constante (média √3·τ por von Mises)
  const FSf = 1 / (sig / SE + (Math.sqrt(3) * tau) / SU);
  const I = (PI * d ** 4) / 64; // mm⁴
  const k = (3 * E_STEEL * I * SPAN) / (a * a * b * b) * 1000; // N/mm → N/m
  const defl = (F / k) * 1000;
  const wn = Math.sqrt(k / GEAR_M);
  const nc = (wn * 60) / (2 * PI);
  const r = n / nc;
  const amp = (ECC * r * r) / Math.sqrt((1 - r * r) ** 2 + (2 * ZETA * r) ** 2);
  const roll = BEARINGS[brg === 1 ? 1 : 0];
  const LA = lifeHours(roll.C, roll.p, RA, n);
  const LB = lifeHours(roll.C, roll.p, RB, n);
  const worst = RB > RA + 1e-9 ? 1 : 0;
  const jr = journalState(Math.max(RA, RB), d, n, (v.cr ?? 1) / 1000, clamp(Math.round(v.oil ?? 1), 0, 2), v.temp ?? 60);
  return { brg, P, n, a, b, d, T, Ft, F, RA, RB, M, sig, tau, svm, tmax, FS, FStr, FSf, k, defl, nc, r, amp, LA, LB, jr, worst };
}

const isRoll = (v: LabValues) => Math.round(v.brg ?? 0) !== 2;
const isOil = (v: LabValues) => Math.round(v.brg ?? 0) === 2;

export const shaftModel: LabModel = {
  id: 'shaft',
  name: 'Eixo, mancais e lubrificação',
  icon: '🛢️',
  summary:
    'Uma **árvore** de aço em dois mancais, girada pelo motor através de um **acoplamento**. A **engrenagem** passa a potência adiante: a força nos dentes **flete** o eixo e o torque o **torce**. Arraste a engrenagem, mude a potência, a rotação e o diâmetro e veja a tensão de **von Mises**, a **fadiga** do eixo girando, a **velocidade crítica** e a **vida dos rolamentos** — ou troque os rolamentos por **buchas com óleo** e veja o filme de óleo, o **número de Sommerfeld** e a curva de **Stribeck**.',
  params: [
    {
      id: 'brg',
      label: 'Mancais',
      min: 0,
      max: 2,
      step: 1,
      default: 0,
      choices: ['Rolamento de esferas', 'Rolamento de rolos', 'Bucha com óleo'],
      help: 'Rolamentos: elementos rolantes entre dois anéis (vida L10 = (C/P)^p milhões de rotações). Bucha: o eixo gira sobre um filme de óleo (mancal de deslizamento).',
    },
    { id: 'P', label: 'Potência transmitida', min: 0.5, max: 30, step: 0.5, default: 15, unit: 'kW', digits: 1, help: 'Potência que o motor manda pelo eixo até a engrenagem. Torque T = P/ω.' },
    { id: 'n', label: 'Rotação do eixo', min: 50, max: 3600, step: 10, default: 1150, unit: 'rpm', digits: 0, help: 'Mesma potência com menos rotação = mais torque (e mais força nos dentes).' },
    {
      id: 'a',
      label: 'Posição da engrenagem (a partir do mancal A)',
      min: 80,
      max: 720,
      step: 20,
      default: 400,
      unit: 'mm',
      digits: 0,
      help: 'Vão de 800 mm entre os mancais. Perto de um mancal, o momento fletor cai (e esse mancal recebe quase toda a carga). Também dá para arrastar a engrenagem no desenho.',
    },
    { id: 'd', label: 'Diâmetro do eixo', min: 20, max: 70, step: 1, default: 40, unit: 'mm', digits: 0, help: 'As tensões caem com d³; a rigidez (e a velocidade crítica) sobe com d⁴ (e d²).' },
    { id: 'oil', label: 'Óleo', min: 0, max: 2, step: 1, default: 1, choices: [...OILS], help: 'Graus SAE: o número maior é o óleo mais viscoso. O multiviscoso 10W-30 se comporta como um SAE 10 no frio (W = inverno) e como um SAE 30 no quente.', show: isOil },
    { id: 'temp', label: 'Temperatura do óleo', min: 0, max: 120, step: 5, default: 60, unit: '°C', digits: 0, help: 'A viscosidade do óleo cai muito com a temperatura.', show: isOil },
    { id: 'cr', label: 'Folga radial relativa (c/r)', min: 0.5, max: 3, step: 0.1, default: 1, unit: '‰', digits: 1, help: 'Folga radial ÷ raio do eixo. Típico: 1 ‰ (milésimo). O número de Sommerfeld cresce com (r/c)².', show: isOil },
  ],
  outputs: [
    { id: 'T', label: 'Torque no eixo', unit: 'N·m', digits: 1 },
    { id: 'Ft', label: 'Força tangencial nos dentes (2T/D)', unit: 'N', digits: 0 },
    { id: 'F', label: 'Força resultante nos dentes', unit: 'N', digits: 0 },
    { id: 'RA', label: 'Reação no mancal A', unit: 'N', digits: 0 },
    { id: 'RB', label: 'Reação no mancal B', unit: 'N', digits: 0 },
    { id: 'M', label: 'Momento fletor máximo', unit: 'N·m', digits: 1 },
    { id: 'sig', label: 'Tensão de flexão (32M/πd³)', unit: 'MPa', digits: 1 },
    { id: 'tau', label: 'Tensão de torção (16T/πd³)', unit: 'MPa', digits: 1 },
    { id: 'svm', label: 'Tensão de von Mises √(σ² + 3τ²)', unit: 'MPa', digits: 1 },
    { id: 'tmax', label: 'Cisalhamento máximo (Tresca)', unit: 'MPa', digits: 1 },
    { id: 'FS', label: 'Segurança ao escoamento (von Mises)', digits: 2 },
    { id: 'FStr', label: 'Segurança ao escoamento (Tresca)', digits: 2 },
    { id: 'FSf', label: 'Segurança à fadiga (Goodman)', digits: 2 },
    { id: 'defl', label: 'Flecha sob a engrenagem', unit: 'mm', digits: 3 },
    { id: 'nc', label: 'Velocidade crítica', unit: 'rpm', digits: 0 },
    { id: 'amp', label: 'Amplitude da vibração', unit: 'µm', digits: 0 },
    { id: 'LA', label: 'Vida L10 do rolamento A', unit: 'h', digits: 0, show: isRoll },
    { id: 'LB', label: 'Vida L10 do rolamento B', unit: 'h', digits: 0, show: isRoll },
    { id: 'visc', label: 'Viscosidade do óleo', unit: 'cSt', digits: 1, show: isOil },
    { id: 'S', label: 'Número de Sommerfeld (mancal mais carregado)', digits: 4, show: isOil },
    { id: 'h0', label: 'Espessura mínima do filme', unit: 'µm', digits: 1, show: isOil },
    { id: 'f', label: 'Coeficiente de atrito na bucha', digits: 4, show: isOil },
    { id: 'loss', label: 'Perda por atrito na bucha', unit: 'W', digits: 0, show: isOil },
    { id: 'r', label: 'Rotação ÷ velocidade crítica', hidden: true },
    { id: 'Lmin', label: 'Vida do rolamento mais carregado', hidden: true },
    { id: 'regime', label: 'Regime de lubrificação (0 limítrofe, 1 misto, 2 filme completo)', hidden: true },
    { id: 'eps', label: 'Excentricidade relativa', hidden: true },
    { id: 'pm', label: 'Pressão média na bucha (MPa)', hidden: true },
    { id: 'hersey', label: 'Número de Hersey μN/P', hidden: true },
  ],
  compute(v) {
    const s = shaftState(v);
    return {
      T: s.T,
      Ft: s.Ft,
      F: s.F,
      RA: s.RA,
      RB: s.RB,
      M: s.M,
      sig: s.sig,
      tau: s.tau,
      svm: s.svm,
      tmax: s.tmax,
      FS: s.FS,
      FStr: s.FStr,
      FSf: s.FSf,
      defl: s.defl,
      nc: s.nc,
      amp: s.amp,
      LA: s.LA,
      LB: s.LB,
      visc: s.jr.nu,
      S: s.jr.S,
      h0: s.jr.h0,
      f: s.jr.f,
      loss: s.jr.loss,
      r: s.r,
      Lmin: Math.min(s.LA, s.LB),
      regime: s.jr.regime,
      eps: s.jr.eps,
      pm: s.jr.p / 1e6,
      hersey: s.jr.hersey,
    };
  },
  experiments: [
    {
      label: 'Flexão e torção juntas',
      preset: { brg: 0, P: 15, n: 1150, a: 400, d: 40 },
      text: 'A força nos dentes **flete** o eixo (momento máximo sob a engrenagem) e o torque **torce** só o trecho entre o acoplamento e a engrenagem. Von Mises junta as duas: σ_eq = √(σ² + 3τ²). Baixe a rotação com a mesma potência e veja tudo subir.',
    },
    {
      label: 'Engrenagem perto do mancal',
      preset: { brg: 0, P: 30, n: 600, a: 400, d: 40 },
      text: 'Com a engrenagem no meio do vão, o momento é F·L/4. Arraste-a para perto de um mancal: o momento (e a tensão) **cai** — mas esse mancal passa a levar quase toda a carga.',
    },
    {
      label: 'Velocidade crítica',
      preset: { brg: 0, P: 7.5, n: 1750, a: 400, d: 30 },
      text: 'Eixo fino: a crítica (√(k/m)) fica perto dos 1.750 rpm e o eixo **vibra muito**. Engrosse o eixo (k sobe com d⁴) ou leve a engrenagem para perto de um mancal e a crítica se afasta.',
    },
    {
      label: 'Vida dos rolamentos',
      preset: { brg: 0, P: 30, n: 600, a: 400, d: 50 },
      text: 'Vida L10 = (C/P)³ milhões de rotações nos rolamentos de esferas: **dobrar a carga divide a vida por 8**. Troque por rolos (C maior e expoente 10/3).',
    },
    {
      label: 'Bucha: filme de óleo',
      preset: { brg: 2, P: 10, n: 200, a: 400, d: 40, oil: 1, temp: 60, cr: 1 },
      text: 'O eixo gira **afastado do centro** e arrasta o óleo para a cunha que o sustenta. Baixe a rotação ou esquente o óleo: o filme afina, o número de Sommerfeld cai e o mancal entra na lubrificação **mista** e depois **limítrofe** (contato metal-metal).',
    },
    {
      label: 'Óleo multiviscoso',
      preset: { brg: 2, P: 10, n: 200, a: 400, d: 40, oil: 2, temp: 20, cr: 1 },
      text: 'O **10W-30** flui como um SAE 10 no frio (partida fácil) e segura a viscosidade de um SAE 30 a 100 °C. Compare os três óleos frios e quentes.',
    },
  ],
};
