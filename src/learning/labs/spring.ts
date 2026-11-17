/**
 * Bancada de molas e parafusos, em dois modos:
 * - mola helicoidal de compressão (pontas esquadrejadas e retificadas, entre pratos paralelos) numa prensa de ensaio:
 *   rigidez k = G·d⁴/(8·D³·n), índice C = D/d, fator de Wahl, tensão de torção no fio, energia, mola fechada e
 *   as associações em série e em paralelo;
 * - macaco de parafuso (parafuso de potência): avanço, ângulo de hélice, torque para subir e para descer,
 *   autotravamento e rendimento, com rosca quadrada ou trapezoidal (sem atrito de colar: mancal axial de rolamento).
 * Números didáticos, de ordem de grandeza real.
 */
import type { LabValues } from '../types';
import { clamp, type LabModel } from './model';

const PI = Math.PI;
const DEG = PI / 180;

// ------------------------------------------------------------------ mola
/** Materiais: G (MPa), tensão de torção admissível (MPa) e densidade (kg/m³). */
export const SPRING_MATS = [
  { name: 'Aço mola', G: 80000, tauAdm: 700, rho: 7850 },
  { name: 'Aço inox', G: 69000, tauAdm: 560, rho: 7900 },
  { name: 'Bronze fosforoso', G: 41000, tauAdm: 330, rho: 8800 },
] as const;
/** Folga entre as espiras da mola livre, em fração do diâmetro médio. */
export const GAP = 0.3;
/** L₀/D acima do qual a mola entre pratos paralelos corre risco de flambar. */
export const BUCKLE = 5.26;
/** Fator de segurança mostrado quando a mola está descarregada. */
const FS_CAP = 99;

export interface SpringGeom {
  d: number;
  D: number;
  n: number;
  G: number;
  /** Rigidez (N/mm), índice de mola e fator de Wahl. */
  k: number;
  C: number;
  Kw: number;
  /** Passo da mola livre, comprimento livre, comprimento sólido e curso até fechar (mm). */
  p: number;
  L0: number;
  Ls: number;
  dSolid: number;
  /** Força que fecha a mola (N). */
  Fs: number;
  /** Frequência natural da mola entre pratos (Hz). */
  fn: number;
}

export const wahl = (C: number) => (4 * C - 1) / (4 * C - 4) + 0.615 / C;

export function springOf(d: number, D: number, n: number, mat: number): SpringGeom {
  const m = SPRING_MATS[clamp(Math.round(mat), 0, 2)];
  const G = m.G;
  const k = (G * d ** 4) / (8 * D ** 3 * n);
  const C = D / d;
  const Kw = wahl(C);
  const p = d + GAP * D;
  const L0 = n * p + 2 * d;
  const Ls = (n + 2) * d;
  const dSolid = L0 - Ls;
  // massa das espiras ativas (kg) e a frequência natural com as duas pontas fixas: f = ½·√(k/m)
  const mass = (m.rho * PI * PI * d * d * D * n) / 4 / 1e9;
  const fn = 0.5 * Math.sqrt((k * 1000) / mass);
  return { d, D, n, G, k, C, Kw, p, L0, Ls, dSolid, Fs: k * dSolid, fn };
}

export interface SpringState {
  arr: number;
  mat: number;
  geom: SpringGeom;
  F: number;
  /** Força em cada mola (N) e deflexão de cada uma (mm). */
  Fe: number;
  de: number;
  /** Deflexão total (mm), rigidez equivalente (N/mm). */
  defl: number;
  keq: number;
  /** Tensão de torção máxima no fio (MPa), admissível e fator de segurança. */
  tau: number;
  tauAdm: number;
  FS: number;
  /** Energia armazenada (J). */
  U: number;
  solid: boolean;
  buckle: boolean;
  /** Número de molas e altura livre do conjunto (mm). */
  count: number;
  height0: number;
}

export function springState(v: LabValues): SpringState {
  const arr = clamp(Math.round(v.arr ?? 0), 0, 2);
  const mat = clamp(Math.round(v.mat ?? 0), 0, 2);
  const geom = springOf(Math.max(0.5, v.dw ?? 6), Math.max(5, v.Dm ?? 48), Math.max(1, Math.round(v.na ?? 8)), mat);
  const F = Math.max(0, v.F ?? 400);
  const Fe = arr === 2 ? F / 2 : F;
  const free = Fe / geom.k;
  const solid = free >= geom.dSolid - 1e-9;
  const de = Math.min(free, geom.dSolid);
  const count = arr === 0 ? 1 : 2;
  const defl = arr === 1 ? 2 * de : de;
  const keq = arr === 0 ? geom.k : arr === 1 ? geom.k / 2 : 2 * geom.k;
  // fechada, a mola vira um bloco: a força a mais passa pelas espiras encostadas e a torção no fio para de crescer
  const Fwire = Math.min(Fe, geom.Fs);
  const tau = (geom.Kw * 8 * Fwire * geom.D) / (PI * geom.d ** 3);
  const tauAdm = SPRING_MATS[mat].tauAdm;
  const FS = tau > 1e-9 ? Math.min(FS_CAP, tauAdm / tau) : FS_CAP;
  const U = (count * 0.5 * geom.k * de * de) / 1000;
  return { arr, mat, geom, F, Fe, de, defl, keq, tau, tauAdm, FS, U, solid, buckle: geom.L0 / geom.D > BUCKLE, count, height0: arr === 1 ? 2 * geom.L0 : geom.L0 };
}

// ------------------------------------------------------------------ macaco de parafuso
/** Meio-ângulo do perfil da rosca: quadrada 0°, trapezoidal 15° (perfil de 30°). */
export const THREAD_HALF = [0, 15] as const;

export interface JackState {
  /** Avanço (mm), ângulo de hélice e ângulo de atrito (°). */
  L: number;
  lambda: number;
  phi: number;
  /** Atrito efetivo μ' = μ/cos α. */
  mup: number;
  tanL: number;
  /** Torques para subir e para descer (N·m): negativo = desce sozinho. */
  Tup: number;
  Tdown: number;
  /** Rendimento (fração) e força na ponta da manivela (N). */
  eta: number;
  Fman: number;
  lock: boolean;
  W: number;
  R: number;
}

/** Rendimento do parafuso de potência para um ângulo de hélice cuja tangente é `t`. */
export const screwEta = (t: number, mup: number) => (t * (1 - mup * t)) / (t + mup);

export function jackState(v: LabValues): JackState {
  const alpha = THREAD_HALF[clamp(Math.round(v.perfil ?? 1), 0, 1)] * DEG;
  const starts = clamp(Math.round(v.ent ?? 0), 0, 2) + 1;
  const p = Math.max(0.1, v.pas ?? 6);
  const dm = Math.max(1, v.dmed ?? 33);
  const mu = Math.max(0, v.mu ?? 0.15);
  const W = Math.max(0, v.W ?? 10) * 1000;
  const R = Math.max(0.01, v.R ?? 0.3);
  const L = starts * p;
  const tanL = L / (PI * dm);
  const mup = mu / Math.cos(alpha);
  const r = dm / 2000;
  const Tup = (W * r * (tanL + mup)) / (1 - mup * tanL);
  const Tdown = (W * r * (mup - tanL)) / (1 + mup * tanL);
  return {
    L,
    lambda: Math.atan(tanL) / DEG,
    phi: Math.atan(mup) / DEG,
    mup,
    tanL,
    Tup,
    Tdown,
    eta: screwEta(tanL, mup),
    Fman: Tup / R,
    lock: mup > tanL,
    W,
    R,
  };
}

const isSpring = (v: LabValues) => Math.round(v.modo ?? 0) === 0;
const isJack = (v: LabValues) => Math.round(v.modo ?? 0) === 1;

export const springModel: LabModel = {
  id: 'spring',
  name: 'Molas e macaco de parafuso',
  icon: '🔩',
  summary:
    'Uma **prensa de ensaio de molas**: mude o **fio**, o **diâmetro**, as **espiras** e o **material** e veja a rigidez k = G·d⁴/(8·D³·n), a tensão no fio (com o **fator de Wahl**), a energia, a mola **fechada** e as molas em **série** e em **paralelo**. No **macaco de parafuso**, troque o passo, as **entradas**, o perfil da rosca e o atrito, e veja o torque para subir e para descer, o **rendimento** e quando o parafuso é **autotravante**.',
  params: [
    { id: 'modo', label: 'Ensaio', min: 0, max: 1, step: 1, default: 0, choices: ['Mola helicoidal', 'Macaco de parafuso'], help: 'Dois elementos de máquinas na mesma bancada.' },
    { id: 'arr', label: 'Montagem', min: 0, max: 2, step: 1, default: 0, choices: ['Uma mola', 'Duas em série', 'Duas em paralelo'], help: 'Em série, as duas levam a força toda e as deflexões se somam. Em paralelo, dividem a força e deflexionam igual.', show: isSpring },
    { id: 'mat', label: 'Material do fio', min: 0, max: 2, step: 1, default: 0, choices: ['Aço mola', 'Aço inox', 'Bronze fosforoso'], help: 'Módulo de cisalhamento G: aço mola 80 GPa, inox 69 GPa, bronze fosforoso 41 GPa.', show: isSpring },
    { id: 'dw', label: 'Diâmetro do fio (d)', min: 2, max: 10, step: 0.5, default: 6, unit: 'mm', digits: 1, help: 'A rigidez cresce com d⁴; a tensão no fio cai com d³.', show: isSpring },
    { id: 'Dm', label: 'Diâmetro médio da mola (D)', min: 20, max: 90, step: 1, default: 48, unit: 'mm', digits: 0, help: 'Do centro do fio de um lado ao centro do fio do outro. A rigidez cai com D³.', show: isSpring },
    { id: 'na', label: 'Espiras ativas (n)', min: 3, max: 16, step: 1, default: 8, digits: 0, help: 'As que trabalham. Mais as 2 espiras das pontas, esquadrejadas e retificadas. Menos espiras = mola mais rígida.', show: isSpring },
    { id: 'F', label: 'Força da prensa', min: 0, max: 2000, step: 10, default: 400, unit: 'N', digits: 0, help: 'Força aplicada no conjunto. Também dá para arrastar o prato de cima no desenho.', show: isSpring },
    { id: 'perfil', label: 'Perfil da rosca', min: 0, max: 1, step: 1, default: 1, choices: ['Quadrada', 'Trapezoidal (30°)'], help: "Os flancos inclinados da trapezoidal aumentam o atrito efetivo: μ' = μ/cos 15°.", show: isJack },
    { id: 'ent', label: 'Entradas da rosca', min: 0, max: 2, step: 1, default: 0, choices: ['1 entrada', '2 entradas', '3 entradas'], help: 'Avanço = número de entradas × passo: quanto o parafuso sobe numa volta.', show: isJack },
    { id: 'pas', label: 'Passo da rosca (p)', min: 2, max: 12, step: 1, default: 6, unit: 'mm', digits: 0, help: 'Distância entre dois filetes vizinhos.', show: isJack },
    { id: 'dmed', label: 'Diâmetro médio da rosca (dₘ)', min: 20, max: 60, step: 1, default: 33, unit: 'mm', digits: 0, help: 'No meio da altura dos filetes. Um Tr 36 × 6 tem dₘ = 33 mm.', show: isJack },
    { id: 'mu', label: 'Coeficiente de atrito na rosca (μ)', min: 0.05, max: 0.3, step: 0.01, default: 0.15, digits: 2, help: 'Aço com bronze: ~0,15 a seco, ~0,10 lubrificado; menos que isso só com lubrificante especial.', show: isJack },
    { id: 'W', label: 'Carga levantada (W)', min: 0, max: 40, step: 0.5, default: 10, unit: 'kN', digits: 1, help: 'A carga apoia num mancal axial de rolamento: não há atrito de colar.', show: isJack },
    { id: 'R', label: 'Comprimento da manivela', min: 0.1, max: 0.6, step: 0.05, default: 0.3, unit: 'm', digits: 2, help: 'Força na mão = torque ÷ comprimento da manivela.', show: isJack },
  ],
  outputs: [
    { id: 'C', label: 'Índice de mola C = D/d', digits: 2, show: isSpring },
    { id: 'Kw', label: 'Fator de Wahl', digits: 3, show: isSpring },
    { id: 'k', label: 'Rigidez de uma mola', unit: 'N/mm', digits: 2, show: isSpring },
    { id: 'keq', label: 'Rigidez do conjunto', unit: 'N/mm', digits: 2, show: isSpring },
    { id: 'defl', label: 'Deflexão do conjunto', unit: 'mm', digits: 1, show: isSpring },
    { id: 'L0', label: 'Comprimento livre de uma mola', unit: 'mm', digits: 1, show: isSpring },
    { id: 'Ls', label: 'Comprimento sólido (fechada)', unit: 'mm', digits: 1, show: isSpring },
    { id: 'tau', label: 'Tensão de torção no fio', unit: 'MPa', digits: 0, show: isSpring },
    { id: 'tauAdm', label: 'Tensão admissível do material', unit: 'MPa', digits: 0, show: isSpring },
    { id: 'FS', label: 'Fator de segurança', digits: 2, show: isSpring },
    { id: 'U', label: 'Energia armazenada', unit: 'J', digits: 2, show: isSpring },
    { id: 'fn', label: 'Frequência natural da mola (surto)', unit: 'Hz', digits: 0, show: isSpring },
    { id: 'L', label: 'Avanço por volta', unit: 'mm', digits: 0, show: isJack },
    { id: 'lambda', label: 'Ângulo de hélice (λ)', unit: '°', digits: 2, show: isJack },
    { id: 'phi', label: "Ângulo de atrito (φ' = arctg μ')", unit: '°', digits: 2, show: isJack },
    { id: 'Tup', label: 'Torque para subir', unit: 'N·m', digits: 1, show: isJack },
    { id: 'Tdown', label: 'Torque para descer (negativo: desce sozinha)', unit: 'N·m', digits: 1, show: isJack },
    { id: 'eta', label: 'Rendimento', unit: '%', digits: 1, show: isJack },
    { id: 'Fman', label: 'Força na manivela para subir', unit: 'N', digits: 0, show: isJack },
    { id: 'solid', label: 'Mola fechada (1 = sim)', hidden: true },
    { id: 'flamb', label: 'Risco de flambagem (1 = sim)', hidden: true },
    { id: 'Fs', label: 'Força que fecha uma mola', hidden: true },
    { id: 'lock', label: 'Autotravante (1 = sim)', hidden: true },
  ],
  compute(v) {
    const s = springState(v);
    const j = jackState(v);
    return {
      C: s.geom.C,
      Kw: s.geom.Kw,
      k: s.geom.k,
      keq: s.keq,
      defl: s.defl,
      L0: s.geom.L0,
      Ls: s.geom.Ls,
      tau: s.tau,
      tauAdm: s.tauAdm,
      FS: s.FS,
      U: s.U,
      fn: s.geom.fn,
      L: j.L,
      lambda: j.lambda,
      phi: j.phi,
      Tup: j.Tup,
      Tdown: j.Tdown,
      eta: j.eta * 100,
      Fman: j.Fman,
      solid: s.solid ? 1 : 0,
      flamb: s.buckle ? 1 : 0,
      Fs: s.geom.Fs,
      lock: j.lock ? 1 : 0,
    };
  },
  experiments: [
    {
      label: 'A rigidez da mola',
      preset: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 8, F: 400 },
      text: 'k = G·d⁴/(8·D³·n). Engrosse o **fio** um pouco e a mola endurece muito (d⁴); aumente o **diâmetro** e ela amolece (D³); com mais **espiras**, amolece na proporção.',
    },
    {
      label: 'Cortar espiras',
      preset: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 10, F: 400 },
      text: 'A rigidez é inversamente proporcional ao número de espiras ativas: cortar 2 de 10 deixa a mola **25 % mais rígida** (10/8). A tensão no fio não muda com a mesma força.',
    },
    {
      label: 'Série e paralelo',
      preset: { modo: 0, arr: 1, mat: 0, dw: 6, Dm: 48, na: 8, F: 400 },
      text: 'Em **série**, as duas molas levam a força toda: k_eq = k/2 e a deflexão dobra. Em **paralelo**, dividem a força: k_eq = 2k, e a tensão em cada fio cai à metade.',
    },
    {
      label: 'Mola fechada',
      preset: { modo: 0, arr: 0, mat: 0, dw: 6, Dm: 48, na: 8, F: 1800 },
      text: 'Passando da força que **encosta as espiras**, a mola vira um bloco maciço: a deflexão para no curso máximo. Na prática, a mola nunca deve trabalhar fechada.',
    },
    {
      label: 'Bronze × aço',
      preset: { modo: 0, arr: 0, mat: 2, dw: 6, Dm: 48, na: 8, F: 400 },
      text: 'O bronze tem G quase metade do aço: a mola fica **mais mole**, com a **mesma** tensão no fio (τ não depende de G) — mas o bronze aguenta bem menos.',
    },
    {
      label: 'Macaco autotravante',
      preset: { modo: 1, perfil: 1, ent: 0, pas: 6, dmed: 33, mu: 0.15, W: 10, R: 0.3 },
      text: 'Rosca **Tr 36 × 6**, uma entrada: λ = 3,3° é menor que o ângulo de atrito (8,8°): solte a manivela e a carga **fica** parada. O preço: rendimento abaixo de 50 %.',
    },
    {
      label: 'Três entradas',
      preset: { modo: 1, perfil: 1, ent: 2, pas: 6, dmed: 33, mu: 0.15, W: 10, R: 0.3 },
      text: 'Com 3 entradas, o avanço triplica (18 mm por volta): sobe mais rápido e o rendimento passa de 50 % — mas a hélice fica mais inclinada que o atrito e a carga **desce sozinha**.',
    },
  ],
};
