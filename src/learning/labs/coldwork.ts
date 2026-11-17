/**
 * Bancada de encruamento e recozimento: uma tira recozida (h₀ = 10 mm, grão de partida d₀) passa no laminador e
 * depois fica 1 h no forno.
 *
 * - Trabalho a frio (%TF = redução de espessura): σe, σr e dureza sobem e o alongamento cai, em curvas de saturação
 *   ajustadas a valores típicos de livro. A densidade de discordâncias vai de ~10¹¹ a ~10¹⁵ m⁻².
 * - Recozimento por 1 h a T:
 *   - recuperação: alívio das tensões residuais e uma queda pequena da resistência, sem grãos novos;
 *   - recristalização: fração X(T) logística, completa (95 %) na temperatura de recristalização T_rx, que cai
 *     com mais trabalho a frio. Abaixo do %TF crítico não recristaliza;
 *   - crescimento de grão depois de recristalizar: Δd = k·(T − T_rx − 30)².
 * - Grão recristalizado: d_rx = a + b/%TF (mais trabalho a frio → mais núcleos → grão mais fino).
 * - Hall-Petch no material recristalizado: σe = σ₀ + k_y/√d (d em μm). Dureza HV ≈ (σe + σr)/6.
 * - Laminação a quente (acima de T_rx): recristaliza durante o passe e não encrua; a força cai muito.
 * - Força de laminação: F ≈ 1,15·σ̄·w·√(R·Δh), com σ̄ = tensão média de escoamento no passe.
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

/** Tira e laminador: espessura inicial (mm), largura (mm) e raio dos cilindros (mm). */
export const STRIP = { h0: 10, w: 100, R: 150 } as const;
/** Trabalho a frio crítico (%): abaixo dele não há recristalização. */
export const TF_CRIT = 5;
/** Temperatura até a qual o forno conta como "sem recozimento" (°C). */
export const T_AMB = 25;
/** Largura (°C) da faixa de recristalização (logística) e o deslocamento entre X = 50 % e X = 95 %. */
const W_RX = 15;
const D95 = W_RX * Math.log(19);

export interface CwMat {
  name: string;
  short: string;
  crystal: 'CFC' | 'CCC';
  /** Temperatura de fusão (°C). */
  Tf: number;
  /** Grão do material recebido (recozido), μm. */
  d0: number;
  /** Hall-Petch: σe = s0 + ky/√d e σr = r0 + kr/√d (MPa e MPa·√μm). */
  s0: number;
  ky: number;
  r0: number;
  kr: number;
  /** Encruamento: Δσ = A·(1 − e^(−TF/τ)). */
  dSe: number;
  tSe: number;
  dSr: number;
  tSr: number;
  /** Alongamento recozido, mínimo e a escala de queda (% de TF). */
  el: number;
  elMin: number;
  tEl: number;
  /** T_rx(TF) = tRx + dTrx·e^(−(TF − TF_crit)/kTrx): recristalização completa em 1 h (°C). */
  tRx: number;
  dTrx: number;
  kTrx: number;
  /** Grão recristalizado: d_rx = dRxA + dRxB/TF (μm). */
  dRxA: number;
  dRxB: number;
  /** Crescimento de grão (μm/°C²). */
  kGG: number;
  /** Laminação a quente: temperatura (°C) e tensão de escoamento nela (MPa). */
  tHot: number;
  sHot: number;
}

export const CW_MATS: readonly CwMat[] = [
  {
    name: 'Cobre eletrolítico',
    short: 'Cobre',
    crystal: 'CFC',
    Tf: 1085,
    d0: 40,
    s0: 45,
    ky: 110,
    r0: 200,
    kr: 100,
    dSe: 280,
    tSe: 15,
    dSr: 170,
    tSr: 30,
    el: 48,
    elMin: 4,
    tEl: 14,
    tRx: 220,
    dTrx: 200,
    kTrx: 12,
    dRxA: 6,
    dRxB: 250,
    kGG: 0.0005,
    tHot: 800,
    sHot: 45,
  },
  {
    name: 'Latão 70/30 (Cu-30Zn)',
    short: 'Latão 70/30',
    crystal: 'CFC',
    Tf: 955,
    d0: 40,
    s0: 75,
    ky: 140,
    r0: 300,
    kr: 120,
    dSe: 520,
    tSe: 22,
    dSr: 450,
    tSr: 30,
    el: 62,
    elMin: 3,
    tEl: 15,
    tRx: 370,
    dTrx: 200,
    kTrx: 14,
    dRxA: 5,
    dRxB: 200,
    kGG: 0.0004,
    tHot: 700,
    sHot: 60,
  },
  {
    name: 'Aço SAE 1010 (baixo carbono)',
    short: 'Aço 1010',
    crystal: 'CCC',
    Tf: 1520,
    d0: 25,
    s0: 90,
    ky: 600,
    r0: 260,
    kr: 400,
    dSe: 420,
    tSe: 18,
    dSr: 360,
    tSr: 28,
    el: 35,
    elMin: 2,
    tEl: 12,
    tRx: 560,
    dTrx: 150,
    kTrx: 14,
    dRxA: 8,
    dRxB: 150,
    kGG: 0.0012,
    tHot: 1100,
    sHot: 110,
  },
];

export const cwMatOf = (v: LabValues) => Math.min(CW_MATS.length - 1, Math.max(0, Math.round(v.mat ?? 0)));

const logistic = (x: number) => 1 / (1 + Math.exp(-x));

/** Limite de escoamento e de resistência do material recristalizado com grão d (μm): Hall-Petch. */
export const seAnn = (m: CwMat, d: number) => m.s0 + m.ky / Math.sqrt(d);
export const srAnn = (m: CwMat, d: number) => m.r0 + m.kr / Math.sqrt(d);

/** Propriedades logo depois da laminação a frio (sem recozer). */
export function coldProps(m: CwMat, tf: number): { se: number; sr: number; el: number } {
  return {
    se: seAnn(m, m.d0) + m.dSe * (1 - Math.exp(-tf / m.tSe)),
    sr: srAnn(m, m.d0) + m.dSr * (1 - Math.exp(-tf / m.tSr)),
    el: m.elMin + (m.el - m.elMin) * Math.exp(-tf / m.tEl),
  };
}

/** Temperatura de recristalização (completa em 1 h), °C. Só faz sentido com TF ≥ TF crítico. */
export const trxOf = (m: CwMat, tf: number) => m.tRx + m.dTrx * Math.exp(-(Math.max(tf, TF_CRIT) - TF_CRIT) / m.kTrx);

/** Grão recristalizado (μm). */
export const dRxOf = (m: CwMat, tf: number) => m.dRxA + m.dRxB / Math.max(tf, TF_CRIT);

export interface CwState {
  idx: number;
  m: CwMat;
  /** Trabalho a frio (%) e espessura final (mm). */
  tf: number;
  h: number;
  hot: boolean;
  /** Temperatura do recozimento (°C) e se houve recozimento. */
  ta: number;
  annealed: boolean;
  /** Recristaliza neste %TF? (TF ≥ crítico, a frio) */
  canRx: boolean;
  /** Temperatura de recristalização (completa em 1 h) para este %TF; e a do meio da faixa (X = 50 %). */
  trx: number;
  t50: number;
  /** Fração recristalizada (0 a 1), recuperação (fração do encruamento perdida) e alívio de tensões (0 a 1). */
  X: number;
  rec: number;
  relief: number;
  /** Grão (μm): recristalizado logo ao completar, o dos grãos novos agora (com o crescimento), o da parte não
   * recristalizada e o que aparece na tabela (o da maior parte). */
  dRx: number;
  dNew: number;
  dOld: number;
  d: number;
  se: number;
  sr: number;
  el: number;
  hv: number;
  /** Tensões residuais relativas (100 = recém-laminado a frio). */
  res: number;
  /** log₁₀ da densidade de discordâncias (m⁻²). */
  rho: number;
  /** Alongamento dos grãos deformados (comprimento/espessura). */
  aspect: number;
  /** Força de laminação (kN) e a tensão média de escoamento no passe (MPa). */
  F: number;
  sMean: number;
}

export function cwState(v: LabValues): CwState {
  const idx = cwMatOf(v);
  const m = CW_MATS[idx];
  const tf = Math.min(90, Math.max(0, v.cw ?? 0));
  const hot = Math.round(v.proc ?? 0) === 1 && tf > 0;
  const ta = Math.max(T_AMB, v.ta ?? T_AMB);
  const annealed = ta > T_AMB;
  const h = STRIP.h0 * (1 - tf / 100);
  const canRx = !hot && tf >= TF_CRIT;
  const trx = trxOf(m, tf);
  const t50 = trx - D95;
  const dRx = dRxOf(m, tf);
  const cold = coldProps(m, tf);
  // força de laminação: comprimento de contato √(R·Δh)
  const dh = STRIP.h0 - h;
  const sMean = hot ? m.sHot : (seAnn(m, m.d0) + cold.se) / 2;
  const F = tf > 0 ? (1.15 * sMean * STRIP.w * Math.sqrt(STRIP.R * dh)) / 1000 : 0;
  /** Crescimento de grão acima de `tg` (°C). */
  const grow = (base: number, tg: number) => (annealed ? base + m.kGG * Math.max(0, ta - tg) ** 2 : base);

  let X = 0;
  let rec = 0;
  let relief = 0;
  let dNew = dRx;
  let dOld = m.d0;
  let d: number;
  let se: number;
  let sr: number;
  let el: number;
  let rho: number;
  if (hot) {
    // recristalização dinâmica: grão novo, sem encruamento
    X = 1;
    const dHot = tf >= TF_CRIT ? Math.min(m.d0, dRx * 1.6) : m.d0;
    d = grow(dHot, m.tRx + 30);
    dNew = d;
    se = seAnn(m, d);
    sr = srAnn(m, d);
    el = m.el;
    rho = 11.3;
  } else {
    // a frio: encruado, depois recozido
    const tRef = canRx ? trx : trxOf(m, TF_CRIT);
    if (annealed) {
      rec = 0.15 * logistic((ta - (tRef - D95 - 60)) / 20) + 0.85 * logistic((ta - (tRef + 150)) / 40);
      relief = logistic((ta - (tRef - D95 - 90)) / 18);
      X = canRx ? logistic((ta - t50) / W_RX) : 0;
    }
    const dSe = cold.se - seAnn(m, m.d0);
    const dSr = cold.sr - srAnn(m, m.d0);
    // parte não recristalizada: grão de partida, encruamento menos a recuperação
    dOld = canRx ? m.d0 : grow(m.d0, m.tRx + 30);
    const seOld = seAnn(m, dOld) + dSe * (1 - rec);
    const srOld = srAnn(m, dOld) + dSr * (1 - rec);
    const elOld = m.el - (m.el - cold.el) * (1 - rec);
    // parte recristalizada: grão novo (cresce depois de completar)
    dNew = grow(dRx, trx + 30);
    d = canRx && X >= 0.5 ? dNew : dOld;
    se = (1 - X) * seOld + X * seAnn(m, dNew);
    sr = (1 - X) * srOld + X * srAnn(m, dNew);
    el = (1 - X) * elOld + X * m.el;
    rho = 11 + 4.2 * (1 - Math.exp(-tf / 12)) * (1 - X) * (1 - 0.5 * rec);
  }
  const res = !hot && tf > 0 ? 100 * (1 - relief) * (1 - X) : 0;
  return {
    idx,
    m,
    tf,
    h,
    hot,
    ta,
    annealed,
    canRx,
    trx,
    t50,
    X,
    rec,
    relief,
    dRx,
    dNew,
    dOld,
    d,
    se,
    sr,
    el,
    hv: (se + sr) / 6,
    res,
    rho,
    aspect: hot ? 1 : 1 / (1 - tf / 100),
    F,
    sMean,
  };
}

const coldWorked = (v: LabValues) => Math.round(v.proc ?? 0) === 0 && (v.cw ?? 0) > 0;

export const coldworkModel: LabModel = {
  id: 'coldwork',
  name: 'Encruamento e recozimento',
  icon: '⚒️',
  summary:
    'Uma tira recozida passa no **laminador** e depois fica **1 h no forno**. Veja o **encruamento** (σe e dureza sobem, o alongamento cai), a **recuperação**, a **recristalização** (grãos novos) e o **crescimento de grão** — e por que a laminação **a quente** não encrua.',
  params: [
    {
      id: 'mat',
      label: 'Material',
      min: 0,
      max: 2,
      step: 1,
      default: 0,
      choices: CW_MATS.map((m) => m.short),
      help: 'Cobre eletrolítico e latão 70/30 (CFC) e aço SAE 1010 de baixo carbono (ferrita, CCC). Todos chegam recozidos.',
    },
    {
      id: 'cw',
      label: 'Redução na laminação',
      min: 0,
      max: 70,
      step: 1,
      default: 0,
      unit: '%',
      digits: 0,
      help: 'Redução de espessura (h₀ − h)/h₀ da tira de 10 mm. Laminada a frio, é o percentual de trabalho a frio (%TF).',
    },
    {
      id: 'proc',
      label: 'Laminação',
      min: 0,
      max: 1,
      step: 1,
      default: 0,
      choices: ['A frio (25 °C)', 'A quente'],
      help: 'A quente = acima da temperatura de recristalização (cobre a 800 °C, latão a 700 °C, aço a 1.100 °C).',
    },
    {
      id: 'ta',
      label: 'Recozimento por 1 h a',
      min: T_AMB,
      max: 700,
      step: 5,
      default: T_AMB,
      unit: '°C',
      digits: 0,
      help: '25 °C = sem recozimento. A tira fica 1 h no forno e esfria.',
    },
  ],
  outputs: [
    { id: 'se', label: 'Limite de escoamento σe', unit: 'MPa', digits: 0 },
    { id: 'sr', label: 'Limite de resistência σr', unit: 'MPa', digits: 0 },
    { id: 'el', label: 'Alongamento', unit: '%', digits: 0 },
    { id: 'hv', label: 'Dureza', unit: 'HV', digits: 0 },
    { id: 'd', label: 'Tamanho de grão', unit: 'μm', digits: 0 },
    { id: 'X', label: 'Recristalizado', unit: '%', digits: 0, show: coldWorked },
    { id: 'trx', label: 'Temperatura de recristalização (1 h)', unit: '°C', digits: 0, show: (v) => coldWorked(v) && (v.cw ?? 0) >= TF_CRIT },
    { id: 'res', label: 'Tensões residuais (laminado = 100)', unit: '%', digits: 0, show: coldWorked },
    { id: 'F', label: 'Força de laminação', unit: 'kN', digits: 0, show: (v) => (v.cw ?? 0) > 0 },
    { id: 'h', label: 'Espessura final', unit: 'mm', digits: 1 },
    { id: 'rho', label: 'log₁₀ da densidade de discordâncias', hidden: true },
    { id: 'aspect', label: 'Alongamento dos grãos', hidden: true },
    { id: 'hot', label: 'Laminado a quente', hidden: true },
  ],
  compute(p) {
    const st = cwState(p);
    return {
      se: st.se,
      sr: st.sr,
      el: st.el,
      hv: st.hv,
      d: st.d,
      X: st.X * 100,
      trx: st.canRx ? st.trx : 0,
      res: st.res,
      F: st.F,
      h: st.h,
      rho: st.rho,
      aspect: st.aspect,
      hot: st.hot ? 1 : 0,
    };
  },
  experiments: [
    {
      label: 'Encruar',
      preset: { mat: 0, cw: 40, proc: 0, ta: 25 },
      text: 'Cobre laminado a frio com 40 % de redução: σe sobe de ~60 para ~320 MPa e o alongamento despenca. No microscópio, os grãos ficam **achatados** e cheios de **bandas de deslizamento** (discordâncias emaranhadas).',
    },
    {
      label: 'Recristalizar',
      preset: { mat: 1, cw: 50, proc: 0, ta: 450 },
      text: 'Latão com 50 % de TF recozido a 450 °C: nascem **grãos novos**, equiaxiais e livres de deformação. A resistência volta ao nível do recozido e a ductilidade reaparece. Arraste a temperatura no gráfico de baixo.',
    },
    {
      label: 'Alívio de tensões',
      preset: { mat: 1, cw: 50, proc: 0, ta: 275 },
      text: 'Abaixo da recristalização só acontece a **recuperação**: as tensões residuais quase somem, mas a dureza continua alta — é o recozimento de alívio de tensões.',
    },
    {
      label: 'A quente',
      preset: { mat: 2, cw: 50, proc: 1, ta: 25 },
      text: 'Aço laminado **a quente** (1.100 °C): recristaliza durante o passe, **não encrua** e a força de laminação cai a menos de um terço. O preço: carepa (óxido) e tolerâncias piores.',
    },
    {
      label: 'Crescimento de grão',
      preset: { mat: 0, cw: 50, proc: 0, ta: 650 },
      text: 'Recozido muito acima da recristalização, o grão **cresce** (os contornos somem para baixar a energia total) e, pela **Hall-Petch**, o limite de escoamento cai.',
    },
  ],
};
