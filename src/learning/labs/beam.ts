/**
 * Bancada da viga: biapoiada (apoio fixo em A, móvel em B) ou em balanço (engastada em A), com uma carga
 * concentrada P ou uma distribuída w no vão inteiro. Peso próprio desprezado; regime elástico linear.
 *
 * Convenções: x a partir de A (no balanço, A é o engaste); V positivo quando o lado esquerdo do corte é
 * empurrado para cima; M positivo quando traciona as fibras de baixo (viga "sorrindo"); flecha y para baixo.
 * Linha elástica: E·I·y'' = −M.
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

export type SectionKind = 'rect' | 'I' | 'round';

export interface Section {
  name: string;
  kind: SectionKind;
  /** Largura e altura externas (mm); no perfil I, `tf` e `tw` são as espessuras da mesa e da alma. */
  b: number;
  h: number;
  tf?: number;
  tw?: number;
  /** Área (mm²), momento de inércia (mm⁴), distância da linha neutra à fibra extrema (mm). */
  A: number;
  I: number;
  c: number;
  /** Momento estático acima da linha neutra (mm³) e largura na linha neutra (mm): τ = V·Q/(I·t). */
  Q: number;
  t: number;
}

const rect = (name: string, b: number, h: number): Section => ({ name, kind: 'rect', b, h, A: b * h, I: (b * h ** 3) / 12, c: h / 2, Q: (b * h * h) / 8, t: b });

function ibeam(name: string, h: number, b: number, tf: number, tw: number): Section {
  const hw = h - 2 * tf;
  return {
    name,
    kind: 'I',
    b,
    h,
    tf,
    tw,
    A: 2 * b * tf + tw * hw,
    I: (b * h ** 3 - (b - tw) * hw ** 3) / 12,
    c: h / 2,
    Q: b * tf * (h / 2 - tf / 2) + (tw * hw * hw) / 8,
    t: tw,
  };
}

const round = (name: string, d: number): Section => ({ name, kind: 'round', b: d, h: d, A: (Math.PI * d * d) / 4, I: (Math.PI * d ** 4) / 64, c: d / 2, Q: d ** 3 / 12, t: d });

export const SECTIONS: readonly Section[] = [
  rect('Retângulo 60 × 120 mm, em pé', 60, 120),
  rect('Retângulo 60 × 120 mm, deitado', 120, 60),
  ibeam('Perfil I 150 × 100 mm', 150, 100, 10, 6),
  round('Barra redonda Ø 100 mm', 100),
];

export interface BeamMat {
  name: string;
  /** Módulo de elasticidade (GPa), limite de escoamento (MPa) e massa específica (kg/m³). */
  E: number;
  se: number;
  rho: number;
}

export const BEAM_MATS: readonly BeamMat[] = [
  { name: 'Aço estrutural', E: 200, se: 250, rho: 7850 },
  { name: 'Alumínio 6061-T6', E: 70, se: 275, rho: 2700 },
];

export interface BeamState {
  /** Em balanço (engastada em A)? Carga distribuída? */
  cant: boolean;
  dist: boolean;
  /** Vão (m), carga concentrada (kN) e sua posição a partir de A (m), carga distribuída (kN/m). */
  L: number;
  P: number;
  a: number;
  w: number;
  sec: Section;
  mat: BeamMat;
  /** Rigidez à flexão (N·m²). */
  EI: number;
  /** Reações verticais (kN) e momento de engastamento (kN·m, em módulo). */
  RA: number;
  RB: number;
  MA: number;
  /** Esforços internos e flecha ao longo do vão: V (kN), M (kN·m), y (mm, para baixo). */
  V: (x: number) => number;
  M: (x: number) => number;
  y: (x: number) => number;
  /** Maiores |V| e |M| e onde |M| é máximo (m). */
  Vmax: number;
  Mmax: number;
  xM: number;
  /** Flecha máxima (mm) e onde acontece (m). */
  ymax: number;
  xy: number;
  /** Módulo de resistência W = I/c (mm³). */
  W: number;
  /** Tensões máximas de flexão (σ = M/W) e de cisalhamento (τ = V·Q/(I·t)), MPa. */
  sig: number;
  tau: number;
  /** Fator de segurança ao escoamento σ_e/σ (limitado a 99,9 sem carga). */
  FS: number;
  /** Massa por metro (kg/m). */
  kg: number;
}

const pick = <T>(list: readonly T[], v: number | undefined) => list[Math.min(list.length - 1, Math.max(0, Math.round(v ?? 0)))];

export function beamState(v: LabValues): BeamState {
  const cant = Math.round(v.sup ?? 0) === 1;
  const dist = Math.round(v.load ?? 0) === 1;
  const L = v.L;
  const P = dist ? 0 : Math.max(0, v.P);
  const a = dist ? 0 : (L * Math.min(100, Math.max(0, v.a))) / 100;
  const w = dist ? Math.max(0, v.w) : 0;
  const sec = pick(SECTIONS, v.sec);
  const mat = pick(BEAM_MATS, v.mat);
  const EI = mat.E * 1e9 * sec.I * 1e-12;
  const Pn = P * 1000;
  const wn = w * 1000;
  const b = L - a;
  let RA: number;
  let RB = 0;
  let MA = 0;
  let V: (x: number) => number;
  let M: (x: number) => number;
  /** Flecha em metros (convertida para mm abaixo). */
  let ym: (x: number) => number;
  let Vmax: number;
  let Mmax: number;
  let xM: number;
  let ymax: number;
  let xy: number;
  if (!cant && !dist) {
    RA = (P * b) / L;
    RB = (P * a) / L;
    V = (x) => (x <= a ? RA : RA - P);
    M = (x) => (x <= a ? RA * x : RB * (L - x));
    ym = (x) => (x <= a ? (Pn * b * x * (L * L - b * b - x * x)) / (6 * EI * L) : (Pn * a * (L - x) * (L * L - a * a - (L - x) ** 2)) / (6 * EI * L));
    Vmax = Math.max(RA, RB);
    Mmax = (P * a * b) / L;
    xM = a;
    if (a >= b) {
      xy = Math.sqrt((L * L - b * b) / 3);
      ymax = (Pn * b * Math.pow(L * L - b * b, 1.5)) / (9 * Math.sqrt(3) * EI * L);
    } else {
      xy = L - Math.sqrt((L * L - a * a) / 3);
      ymax = (Pn * a * Math.pow(L * L - a * a, 1.5)) / (9 * Math.sqrt(3) * EI * L);
    }
  } else if (!cant) {
    RA = (w * L) / 2;
    RB = RA;
    V = (x) => RA - w * x;
    M = (x) => (w * x * (L - x)) / 2;
    ym = (x) => (wn * x * (L ** 3 - 2 * L * x * x + x ** 3)) / (24 * EI);
    Vmax = RA;
    Mmax = (w * L * L) / 8;
    xM = L / 2;
    xy = L / 2;
    ymax = (5 * wn * L ** 4) / (384 * EI);
  } else if (!dist) {
    RA = P;
    MA = P * a;
    V = (x) => (x <= a ? P : 0);
    M = (x) => (x <= a ? -P * (a - x) : 0);
    ym = (x) => (x <= a ? (Pn * x * x * (3 * a - x)) / (6 * EI) : (Pn * a * a * (3 * x - a)) / (6 * EI));
    Vmax = P;
    Mmax = P * a;
    xM = 0;
    xy = L;
    ymax = (Pn * a * a * (3 * L - a)) / (6 * EI);
  } else {
    RA = w * L;
    MA = (w * L * L) / 2;
    V = (x) => w * (L - x);
    M = (x) => (-w * (L - x) ** 2) / 2;
    ym = (x) => (wn * x * x * (6 * L * L - 4 * L * x + x * x)) / (24 * EI);
    Vmax = w * L;
    Mmax = (w * L * L) / 2;
    xM = 0;
    xy = L;
    ymax = (wn * L ** 4) / (8 * EI);
  }
  const W = sec.I / sec.c;
  // N·m / mm³ → MPa: M·10³ N·mm·10³ / W = M (kN·m)·10⁶ / W (mm³)
  const sig = (Mmax * 1e6) / W;
  const tau = (Vmax * 1000 * sec.Q) / (sec.I * sec.t);
  return {
    cant,
    dist,
    L,
    P,
    a,
    w,
    sec,
    mat,
    EI,
    RA,
    RB,
    MA,
    V,
    M,
    y: (x) => ym(x) * 1000,
    Vmax,
    Mmax,
    xM,
    ymax: ymax * 1000,
    xy,
    W,
    sig,
    tau,
    FS: sig > 1e-9 ? Math.min(99.9, mat.se / sig) : 99.9,
    kg: (sec.A * 1e-6 * mat.rho),
  };
}

const isCant = (v: LabValues) => Math.round(v.sup) === 1;
const isPoint = (v: LabValues) => Math.round(v.load) === 0;

export const beamModel: LabModel = {
  id: 'beam',
  name: 'Viga em flexão',
  icon: '🏗️',
  summary:
    'Uma viga **biapoiada** ou **em balanço** com carga concentrada ou distribuída. Veja as **reações**, os diagramas de **esforço cortante** e de **momento fletor**, a **tensão de flexão** na seção (σ = M·y/I) e a **flecha**. Troque a seção e o material para comparar resistência, rigidez e peso.',
  params: [
    { id: 'sup', label: 'Apoios', min: 0, max: 1, step: 1, default: 0, choices: ['Biapoiada', 'Em balanço'], help: 'Biapoiada: apoio fixo em A e móvel em B. Em balanço: engastada em A e livre na outra ponta.' },
    { id: 'load', label: 'Carga', min: 0, max: 1, step: 1, default: 0, choices: ['Concentrada P', 'Distribuída w'] },
    { id: 'P', label: 'Carga concentrada P', min: 0, max: 40, step: 1, default: 10, unit: 'kN', digits: 0, show: isPoint },
    {
      id: 'a',
      label: 'Posição de P (x/L)',
      min: 0,
      max: 100,
      step: 5,
      default: 50,
      unit: '%',
      digits: 0,
      show: isPoint,
      help: 'Distância de P até A, em % do vão. Também dá para arrastar a carga no desenho.',
    },
    { id: 'w', label: 'Carga distribuída w', min: 0, max: 20, step: 0.5, default: 5, unit: 'kN/m', digits: 1, show: (v) => !isPoint(v) },
    { id: 'L', label: 'Vão L', min: 2, max: 6, step: 0.5, default: 4, unit: 'm', digits: 1 },
    { id: 'sec', label: 'Seção', min: 0, max: 3, step: 1, default: 0, choices: ['Retângulo em pé', 'Retângulo deitado', 'Perfil I', 'Redonda'], help: 'Retângulo 60 × 120 mm (em pé ou deitado), perfil I 150 × 100 mm e barra redonda de 100 mm.' },
    { id: 'mat', label: 'Material', min: 0, max: 1, step: 1, default: 0, choices: ['Aço', 'Alumínio'], help: 'Aço: E = 200 GPa e σe = 250 MPa. Alumínio 6061-T6: E = 70 GPa e σe = 275 MPa.' },
  ],
  outputs: [
    { id: 'RA', label: 'Reação vertical em A', unit: 'kN', digits: 2 },
    { id: 'RB', label: 'Reação em B', unit: 'kN', digits: 2, show: (v) => !isCant(v) },
    { id: 'MA', label: 'Momento no engaste', unit: 'kN·m', digits: 2, show: isCant },
    { id: 'Vmax', label: 'Cortante máximo |V|', unit: 'kN', digits: 2 },
    { id: 'Mmax', label: 'Momento fletor máximo |M|', unit: 'kN·m', digits: 2 },
    { id: 'I', label: 'Momento de inércia I', unit: 'cm⁴', digits: 0 },
    { id: 'W', label: 'Módulo de resistência W', unit: 'cm³', digits: 1 },
    { id: 'sig', label: 'Tensão de flexão máxima', unit: 'MPa', digits: 1 },
    { id: 'tau', label: 'Cisalhamento máximo', unit: 'MPa', digits: 2 },
    { id: 'y', label: 'Flecha máxima', unit: 'mm', digits: 2 },
    { id: 'FS', label: 'Fator de segurança σe/σ', digits: 2 },
    { id: 'kg', label: 'Massa por metro', unit: 'kg/m', digits: 1 },
    { id: 'xM', label: 'Posição do |M| máximo', unit: 'm', digits: 2, hidden: true },
    { id: 'A', label: 'Área da seção', unit: 'cm²', digits: 1, hidden: true },
    { id: 'Lr', label: 'Vão / flecha', digits: 0, hidden: true },
  ],
  compute(p) {
    const st = beamState(p);
    return {
      RA: st.RA,
      RB: st.RB,
      MA: st.MA,
      Vmax: st.Vmax,
      Mmax: st.Mmax,
      I: st.sec.I / 1e4,
      W: st.W / 1e3,
      sig: st.sig,
      tau: st.tau,
      y: st.ymax,
      FS: st.FS,
      kg: st.kg,
      xM: st.xM,
      A: st.sec.A / 100,
      Lr: st.ymax > 1e-9 ? Math.min(1e6, (st.L * 1000) / st.ymax) : 1e6,
    };
  },
  experiments: [
    {
      label: 'Carga no meio',
      preset: { sup: 0, load: 0, P: 10, a: 50, L: 4, sec: 0, mat: 0 },
      text: 'Cada apoio segura metade da carga. O cortante é constante em cada trecho e **salta P** sob a carga; o momento cresce em linha reta até **M = PL/4** bem no meio. Arraste a carga no desenho.',
    },
    {
      label: 'Carga distribuída',
      preset: { sup: 0, load: 1, w: 5, L: 4, sec: 0, mat: 0 },
      text: 'Com w no vão inteiro o cortante vira uma reta e o momento uma **parábola**, máxima (**wL²/8**) no meio — exatamente onde **V = 0**.',
    },
    {
      label: 'Balanço',
      preset: { sup: 1, load: 0, P: 5, a: 100, L: 3, sec: 0, mat: 0 },
      text: 'No balanço o engaste segura a força **e** um momento. O momento máximo (**P·L**) fica no engaste e traciona as fibras de **cima**: a viga "chora".',
    },
    {
      label: 'Em pé × deitada',
      preset: { sup: 0, load: 0, P: 10, a: 50, L: 4, sec: 1, mat: 0 },
      text: 'A mesma tábua deitada: I cai para 1/4 e W para 1/2 (I = b·h³/12). A tensão **dobra** e a flecha **quadruplica**. Volte para "em pé" e compare.',
    },
    {
      label: 'Perfil I',
      preset: { sup: 0, load: 0, P: 15, a: 50, L: 4, sec: 2, mat: 0 },
      text: 'O perfil I põe o material longe da linha neutra, onde a tensão é maior: quase o mesmo W do retângulo em pé com **40 % do peso**.',
    },
  ],
};
