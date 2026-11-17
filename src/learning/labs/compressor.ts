/**
 * Bancada do compressor alternativo de simples efeito, com espaço morto. Ar como gás perfeito, aspirado a
 * 100 kPa e 27 °C; o 1º estágio desloca V_d = 10 L por volta, a 600 rpm.
 *
 * Ciclo indicado de cada estágio (volumes em litros, pressões absolutas em kPa):
 *   1 → 2  compressão politrópica (P·Vⁿ = cte), com as duas válvulas fechadas;
 *   2 → 3  descarga a P_d: a válvula de descarga abre quando a pressão no cilindro passa de P_d;
 *   3 → 4  re-expansão do gás que ficou no espaço morto V_c, de novo com as válvulas fechadas;
 *   4 → 1  aspiração a P_s: a válvula de sucção abre quando a pressão cai abaixo de P_s.
 * Rendimento volumétrico: ηᵥ = (V₁ − V₄)/V_d = 1 + c − c·(P_d/P_s)^(1/n), com c = V_c/V_d.
 *
 * Dois estágios: resfriamento intermediário perfeito (o ar volta a T₁), pressão intermediária ótima
 * P_i = √(P₁·P₂) e o cilindro de alta dimensionado para a mesma massa (V_d,AP = V_d·P₁/P_i, mesmo c).
 * Os dois estágios ficam com a mesma razão, o mesmo ηᵥ, a mesma descarga e o mesmo trabalho.
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

export const COMP = {
  P1: 100, // kPa (ar atmosférico)
  T1: 300, // K (27 °C)
  K0: 273,
  R: 0.287, // kJ/(kg·K)
  k: 1.4,
  Vd: 10, // L por volta, 1º estágio
  rpm: 600,
} as const;

/** Estado do ar no cilindro: P em kPa, V em L, T em K. */
export interface CompPoint {
  P: number;
  V: number;
  T: number;
}

export interface Stage {
  /** Pressões de aspiração e de descarga do estágio (kPa). */
  Ps: number;
  Pd: number;
  /** Volume deslocado e espaço morto (L). */
  Vd: number;
  Vc: number;
  /** Estados 1 (PMI), 2 (abre a descarga), 3 (PMS) e 4 (abre a sucção). */
  pts: [CompPoint, CompPoint, CompPoint, CompPoint];
  /** Fração do volume deslocado que vira ar novo (0 a 1). */
  etav: number;
  /** ηᵥ = 0: o gás do espaço morto re-expande o curso inteiro e as válvulas não abrem. */
  dead: boolean;
  /** Temperatura de descarga (K). */
  T2: number;
  /** Trabalho indicado por volta (kJ) = área do ciclo no diagrama P–V. */
  W: number;
}

export interface CompState {
  n: number;
  /** Espaço morto relativo (fração). */
  c: number;
  /** Razão total P₂/P₁ e razão de cada estágio. */
  r: number;
  rs: number;
  z: 1 | 2;
  /** Pressão intermediária (kPa); com 1 estágio, igual a P₂. */
  Pi: number;
  stages: Stage[];
  etav: number;
  /** Ar novo por volta, medido na aspiração (L). */
  vind: number;
  /** Vazão de ar livre (m³/min). */
  fad: number;
  mdot: number;
  /** Trabalho por kg de ar: deste compressor, com 1 estágio (mesmo n), isotérmico e adiabático em 1 estágio. */
  w: number;
  w1: number;
  wiso: number;
  wad: number;
  /** Trabalho por volta, somando os estágios (kJ). */
  Wc: number;
  /** Potência indicada (kW). */
  power: number;
  /** Temperatura de descarga de cada estágio (K). */
  T2: number;
  /** Maior razão por estágio que ainda aspira ar: (1 + 1/c)ⁿ. Infinita sem espaço morto. */
  rmax: number;
}

/** Fator de temperatura de uma compressão politrópica: (P_d/P_s)^((n−1)/n). */
export const tempFactor = (r: number, n: number) => Math.pow(r, (n - 1) / n);

/** Trabalho por kg de uma compressão politrópica (kJ/kg), com o limite isotérmico em n = 1. */
export function specificWork(r: number, n: number): number {
  if (Math.abs(n - 1) < 1e-6) return COMP.R * COMP.T1 * Math.log(r);
  return (n / (n - 1)) * COMP.R * COMP.T1 * (tempFactor(r, n) - 1);
}

/** Um estágio aspirando a P_s e T₁ e descarregando a P_d. */
export function stageOf(Ps: number, Pd: number, Vd: number, c: number, n: number): Stage {
  const { T1, R } = COMP;
  const Vc = c * Vd;
  const V1 = Vc + Vd;
  const r = Pd / Ps;
  const T2 = T1 * tempFactor(r, n);
  const V4 = Vc * Math.pow(r, 1 / n);
  if (V4 >= V1) {
    // o gás preso só se expande até o PMI e volta pela mesma curva
    const Pb = Pd * Math.pow(Vc / V1, n);
    const bdc = { P: Pb, V: V1, T: T1 * tempFactor(Pb / Ps, n) };
    const tdc = { P: Pd, V: Vc, T: T2 };
    return { Ps, Pd, Vd, Vc, pts: [bdc, tdc, tdc, bdc], etav: 0, dead: true, T2, W: 0 };
  }
  const V2 = V1 * Math.pow(1 / r, 1 / n);
  const vind = V1 - V4;
  return {
    Ps,
    Pd,
    Vd,
    Vc,
    pts: [
      { P: Ps, V: V1, T: T1 },
      { P: Pd, V: V2, T: T2 },
      { P: Pd, V: Vc, T: T2 },
      { P: Ps, V: V4, T: T1 },
    ],
    etav: vind / Vd,
    dead: false,
    T2,
    // W = n/(n−1)·P_s·(V₁ − V₄)·[r^((n−1)/n) − 1] = massa aspirada × trabalho por kg
    W: ((Ps * vind) / 1000 / (R * T1)) * specificWork(r, n),
  };
}

export function compState(v: LabValues): CompState {
  const { P1, Vd, R, T1, rpm, k } = COMP;
  const z = Math.round(v.stages) === 1 ? 2 : 1;
  const n = v.n;
  const c = Math.max(0, v.c) / 100;
  const r = v.p2 / P1;
  const rs = Math.pow(r, 1 / z);
  const Pi = P1 * rs;
  const stages = [stageOf(P1, Pi, Vd, c, n)];
  if (z === 2) stages.push(stageOf(Pi, v.p2, (Vd * P1) / Pi, c, n));
  const etav = stages[0].etav;
  const vind = etav * Vd;
  const Wc = stages.reduce((a, s) => a + s.W, 0);
  return {
    n,
    c,
    r,
    rs,
    z,
    Pi,
    stages,
    etav,
    vind,
    fad: (vind * rpm) / 1000,
    mdot: ((P1 * vind) / 1000 / (R * T1)) * (rpm / 60),
    w: z * specificWork(rs, n),
    w1: specificWork(r, n),
    wiso: specificWork(r, 1),
    wad: specificWork(r, k),
    Wc,
    power: (Wc * rpm) / 60,
    T2: stages[0].T2,
    rmax: c > 0 ? Math.pow(1 + 1 / c, n) : Infinity,
  };
}

const twoStages = (v: LabValues) => Math.round(v.stages) === 1;

export const compressorModel: LabModel = {
  id: 'compressor',
  name: 'Compressor alternativo',
  icon: '🗜️',
  summary:
    'Um compressor de pistão de simples efeito (10 L por volta, 600 rpm) aspirando ar a **100 kPa e 27 °C**. Veja as **válvulas automáticas** abrindo pela diferença de pressão, o gás do **espaço morto** re-expandindo, o **diagrama P–V indicado** e o **rendimento volumétrico**. Compare 1 e 2 estágios com resfriamento intermediário.',
  params: [
    {
      id: 'p2',
      label: 'Descarga P₂ (absoluta)',
      min: 200,
      max: 1600,
      step: 50,
      default: 700,
      unit: 'kPa',
      digits: 0,
      help: 'Pressão no vaso de ar comprimido. A aspiração é sempre a 100 kPa (pressão absoluta do ar atmosférico).',
    },
    {
      id: 'c',
      label: 'Espaço morto c',
      min: 0,
      max: 20,
      step: 1,
      default: 5,
      unit: '%',
      digits: 0,
      help: 'c = Vc/Vd: o volume que sobra entre o pistão no PMS e o cabeçote, em % do volume deslocado. Abrir um bolsão de espaço morto aumenta c.',
    },
    {
      id: 'n',
      label: 'Expoente politrópico n',
      min: 1,
      max: 1.4,
      step: 0.05,
      default: 1.3,
      digits: 2,
      help: 'n = 1: isotérmico (resfriamento perfeito); n = k = 1,4: adiabático (sem troca de calor). Cilindros com camisa d’água ficam perto de 1,3.',
    },
    { id: 'stages', label: 'Estágios', min: 0, max: 1, step: 1, default: 0, choices: ['1 estágio', '2 estágios + resfriador'] },
  ],
  outputs: [
    { id: 'etav', label: 'Rendimento volumétrico', unit: '%', digits: 1 },
    { id: 'fad', label: 'Vazão aspirada (ar livre)', unit: 'm³/min', digits: 2 },
    { id: 'T2', label: 'Temperatura de descarga', unit: '°C', digits: 0 },
    { id: 'w', label: 'Trabalho por kg de ar', unit: 'kJ/kg', digits: 1 },
    { id: 'Pw', label: 'Potência indicada', unit: 'kW', digits: 1 },
    { id: 'etaiso', label: 'Rendimento isotérmico', unit: '%', digits: 1 },
    { id: 'pi', label: 'Pressão intermediária', unit: 'kPa', digits: 0, show: twoStages },
    { id: 'save', label: 'Economia sobre 1 estágio', unit: '%', digits: 1, show: twoStages },
    { id: 'rmax', label: 'Razão máxima por estágio', digits: 1, show: (v) => v.c >= 0.5 },
    { id: 'r', label: 'Razão de pressões P₂/P₁', digits: 1, hidden: true },
    { id: 'vind', label: 'Ar novo por volta', unit: 'L', digits: 2, hidden: true },
    { id: 'mdot', label: 'Vazão em massa', unit: 'kg/s', digits: 4, hidden: true },
    { id: 'Wc', label: 'Trabalho por volta', unit: 'kJ', digits: 3, hidden: true },
  ],
  compute(p) {
    const st = compState(p);
    return {
      etav: st.etav * 100,
      fad: st.fad,
      T2: st.T2 - COMP.K0,
      w: st.w,
      Pw: st.power,
      etaiso: (st.wiso / st.w) * 100,
      pi: st.z === 2 ? st.Pi : 0,
      save: st.z === 2 ? (1 - st.w / st.w1) * 100 : 0,
      rmax: Number.isFinite(st.rmax) ? st.rmax : 0,
      r: st.r,
      vind: st.vind,
      mdot: st.mdot,
      Wc: st.Wc,
    };
  },
  experiments: [
    {
      label: 'O ciclo indicado',
      preset: { p2: 700, c: 5, n: 1.3, stages: 0 },
      text: 'As válvulas não têm comando: a de **descarga** abre quando a pressão no cilindro passa de P₂, e a de **sucção** quando cai abaixo de P₁. O gás que sobra no **espaço morto** re-expande antes de entrar ar novo.',
    },
    {
      label: 'Espaço morto grande',
      preset: { p2: 900, c: 15, n: 1.3, stages: 0 },
      text: 'Com 15 % de espaço morto, boa parte da descida do pistão só **re-expande** o gás preso. A vazão despenca, mas o **trabalho por kg não muda**: ao re-expandir, o gás devolve ao pistão o trabalho que recebeu.',
    },
    {
      label: 'Compressor que não aspira',
      preset: { p2: 1200, c: 20, n: 1.3, stages: 0 },
      text: 'Acima da razão máxima (1 + 1/c)ⁿ, o gás do espaço morto re-expande o curso inteiro sem chegar a P₁: a válvula de sucção **nunca abre** e a vazão é zero.',
    },
    {
      label: 'Isotérmico × adiabático',
      preset: { p2: 800, c: 5, n: 1, stages: 0 },
      text: 'n = 1 é o ideal do resfriamento perfeito: o menor trabalho possível e o ar saindo a 27 °C. Arraste n até 1,4 (sem troca de calor) e veja o trabalho e a temperatura de descarga subirem.',
    },
    {
      label: 'Dois estágios',
      preset: { p2: 1000, c: 5, n: 1.3, stages: 1 },
      text: 'Pressão intermediária ótima **P_{i} = √(P₁·P₂)**: razões iguais e trabalhos iguais nos dois estágios (as duas áreas do P–V). O resfriador devolve o ar a 27 °C antes do 2º estágio: menos trabalho e descarga bem mais fria.',
    },
  ],
};
