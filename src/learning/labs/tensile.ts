/**
 * Bancada do ensaio de tração: uma máquina universal puxa um corpo de prova cilíndrico (A₀ = 100 mm²,
 * L₀ = 50 mm) até romper. Curvas de engenharia (σ = F/A₀, ε = ΔL/L₀) de quatro materiais típicos.
 *
 * - Trecho elástico: σ = E·ε até o limite de proporcionalidade.
 * - Aço 1020: escoamento descontínuo (limite superior, queda e patamar no limite inferior), depois
 *   encruamento parabólico até o limite de resistência σ_r.
 * - Aço temperado e revenido e alumínio: escoamento contínuo. A curva sai da reta com a mesma inclinação E
 *   (joelho suave) e o limite de escoamento é o da deformação permanente de 0,2 % (paralela à reta elástica).
 * - Depois de σ_r vem a estricção: a força cai até a ruptura e o pescoço afina até A_f = A₀·(1 − estricção).
 * - Ferro fundido cinzento: ε = σ/E + c·(σ/σ_r)^p, sem escoamento nem estricção; rompe na tensão máxima.
 * Descarregar volta por uma reta paralela à elástica (inclinação E) e sobra a deformação permanente ε − σ/E.
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

/** Corpo de prova: área (mm²), comprimento útil entre marcas (mm) e diâmetro inicial (mm). */
export const SPECIMEN = { A0: 100, L0: 50, d0: Math.sqrt(400 / Math.PI) } as const;

export interface TensileMat {
  name: string;
  /** Nome curto (legendas). */
  short: string;
  /** Módulo de elasticidade (MPa). */
  E: number;
  /** Limite de proporcionalidade: fim da reta de Hooke (MPa). No aço 1020, é o limite superior de escoamento. */
  sp: number;
  /** Escoamento descontínuo: a tensão cai ao limite inferior e fica no patamar até a deformação `end`. */
  plateau?: { lower: number; end: number };
  /** Escoamento contínuo: parcela do encruamento que acontece logo no joelho. */
  knee?: number;
  /** Limite de resistência (MPa) e a deformação em que ele acontece (fim do alongamento uniforme). */
  sr: number;
  eu: number;
  /** Deformação (sob carga) e tensão de engenharia na ruptura. */
  ef: number;
  sf: number;
  /** Estricção: redução de área no pescoço (fração). */
  ra: number;
  /** Frágil: ε = σ/E + c·(σ/σ_r)^p. */
  brittle?: { c: number; p: number };
}

export const MATERIALS: readonly TensileMat[] = [
  { name: 'Aço SAE 1020 laminado', short: 'Aço 1020', E: 200_000, sp: 270, plateau: { lower: 250, end: 0.015 }, sr: 400, eu: 0.2, ef: 0.32, sf: 320, ra: 0.6 },
  { name: 'Aço SAE 4140 temperado e revenido', short: 'Aço temperado', E: 200_000, sp: 560, knee: 0.45, sr: 850, eu: 0.06, ef: 0.15, sf: 680, ra: 0.5 },
  { name: 'Alumínio 6061-T6', short: 'Alumínio', E: 70_000, sp: 230, knee: 0.55, sr: 310, eu: 0.08, ef: 0.13, sf: 255, ra: 0.4 },
  { name: 'Ferro fundido cinzento', short: 'Ferro fundido', E: 100_000, sp: 0, sr: 200, eu: 0.0045, ef: 0.0045, sf: 200, ra: 0, brittle: { c: 0.0025, p: 2.2 } },
];

/** Queda do limite superior ao inferior (aço 1020), em deformação. */
const DROP = 0.0004;
/** Deformação permanente que define o escoamento convencional. */
export const OFFSET = 0.002;

/** Índice do material escolhido. */
export const matOf = (v: LabValues) => Math.min(MATERIALS.length - 1, Math.max(0, Math.round(v.mat ?? 0)));

// ------------------------------------------------------------------ curva de carregamento

/** Constante do joelho: com ela a curva sai da reta de Hooke com a mesma inclinação E. */
const kneeK = MATERIALS.map((m) => {
  if (!m.knee) return 0;
  const w = m.knee;
  const e1 = m.sp / m.E;
  // g'(0) = w·k/(1 − e^(−k)) + 2·(1 − w) precisa valer E·(ε_u − ε_p)/(σ_r − σ_p)
  const target = ((m.E * (m.eu - e1)) / (m.sr - m.sp) - 2 * (1 - w)) / w;
  let lo = 1e-6;
  let hi = 1000;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (mid / (1 - Math.exp(-mid)) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
});

function brittleStress(m: TensileMat, e: number): number {
  const { c, p } = m.brittle!;
  let lo = 0;
  let hi = m.sr;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (mid / m.E + c * Math.pow(mid / m.sr, p) < e) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Tensão de engenharia (MPa) na curva de carregamento, para a deformação `e` (fração), até a ruptura. */
export function curveStress(m: TensileMat, e: number): number {
  if (e <= 0) return 0;
  if (m.brittle) return brittleStress(m, Math.min(e, m.ef));
  const e1 = m.sp / m.E;
  if (e <= e1) return m.E * e;
  if (e > m.eu) {
    const s = Math.min(1, (e - m.eu) / (m.ef - m.eu));
    return m.sr - (m.sr - m.sf) * s * s;
  }
  if (m.plateau) {
    const { lower, end } = m.plateau;
    if (e <= e1 + DROP) return m.sp + ((lower - m.sp) * (e - e1)) / DROP;
    if (e <= end) return lower;
    const t = (e - end) / (m.eu - end);
    return lower + (m.sr - lower) * (1 - (1 - t) ** 2);
  }
  const t = (e - e1) / (m.eu - e1);
  const w = m.knee ?? 0.5;
  const k = kneeK[MATERIALS.indexOf(m)];
  const g = (w * (1 - Math.exp(-k * t))) / (1 - Math.exp(-k)) + (1 - w) * (1 - (1 - t) ** 2);
  return m.sp + (m.sr - m.sp) * g;
}

/** Deformações onde a curva muda de trecho (para desenhar as quinas sem arredondar). */
export function curveKnots(m: TensileMat): number[] {
  if (m.brittle) return [m.ef];
  const e1 = m.sp / m.E;
  const k = [e1, m.eu, m.ef];
  if (m.plateau) k.push(e1 + DROP, m.plateau.end);
  return k.sort((a, b) => a - b);
}

/** Área da seção mais fina (mm²) sob carga, na deformação `e` (até a ruptura). */
export function areaAt(m: TensileMat, e: number): number {
  const { A0 } = SPECIMEN;
  if (m.brittle || e <= m.eu) return A0 / (1 + Math.max(0, e));
  const Au = A0 / (1 + m.eu);
  const Af = A0 * (1 - m.ra);
  return Au - (Au - Af) * Math.min(1, (e - m.eu) / (m.ef - m.eu));
}

/** Tensão verdadeira (MPa): a força dividida pela área real da seção mais fina. */
export const trueStress = (m: TensileMat, e: number) => (curveStress(m, e) * SPECIMEN.A0) / areaAt(m, e);

/** Escoamento convencional (0,2 %): onde a paralela à reta elástica cruza a curva. Frágil: não tem. */
const YIELD = MATERIALS.map((m) => {
  if (m.brittle) return { e: 0, s: 0 };
  let lo = OFFSET;
  let hi = m.eu;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (curveStress(m, mid) > m.E * (mid - OFFSET)) lo = mid;
    else hi = mid;
  }
  const e = (lo + hi) / 2;
  return { e, s: curveStress(m, e) };
});

/** Energia por volume absorvida até cada deformação (área sob a curva, MJ/m³ = MPa), numa grade densa perto de zero. */
const N_TAB = 2000;
const ENERGY = MATERIALS.map((m) => {
  const U = new Float64Array(N_TAB + 1);
  let prevE = 0;
  let prevS = 0;
  for (let i = 1; i <= N_TAB; i++) {
    const e = m.ef * (i / N_TAB) ** 2;
    const s = curveStress(m, e);
    U[i] = U[i - 1] + 0.5 * (s + prevS) * (e - prevE);
    prevE = e;
    prevS = s;
  }
  return U;
});

/** Área sob a curva de 0 até `e` (MJ/m³). */
export function energyTo(idx: number, e: number): number {
  const m = MATERIALS[idx];
  const x = Math.min(Math.max(e, 0), m.ef);
  const u = Math.sqrt(x / m.ef) * N_TAB;
  const i = Math.min(N_TAB - 1, Math.floor(u));
  const U = ENERGY[idx];
  return U[i] + (U[i + 1] - U[i]) * (u - i);
}

/** Limite de escoamento convencional (MPa) e a deformação em que ele é medido (fração). */
export const yieldOf = (idx: number) => YIELD[idx];

// ------------------------------------------------------------------ estado do ensaio

export type TensilePhase = 'zero' | 'elastic' | 'yield' | 'hardening' | 'necking' | 'broken' | 'unloaded';

export interface TensileState {
  idx: number;
  m: TensileMat;
  /** Deformação imposta (a máxima atingida, se descarregado), fração. */
  e: number;
  broken: boolean;
  unloaded: boolean;
  phase: TensilePhase;
  /** Tensão na curva no ponto atingido (antes de descarregar), MPa. */
  sCurve: number;
  /** Tensão de engenharia agora (MPa). */
  s: number;
  /** Deformação agora (fração): sob carga, a imposta; descarregado, a permanente; rompido, o alongamento. */
  eNow: number;
  /** Deformação permanente (fração): a que sobraria descarregando agora. */
  ep: number;
  /** Força (kN) e alongamento entre marcas (mm). */
  F: number;
  dL: number;
  /** Área (mm²) e diâmetro (mm) na seção mais fina. */
  A: number;
  d: number;
  /** Tensão verdadeira F/A (MPa). */
  sv: number;
  /** Energia absorvida até agora (MJ/m³). */
  U: number;
  /** Escoamento convencional (MPa) e a deformação onde é medido; 0 no frágil. */
  se: number;
  eY: number;
  /** Módulo de resiliência σ_e²/(2E) e de tenacidade (área até a ruptura), MJ/m³. */
  Ur: number;
  Ut: number;
  /** Alongamento após a ruptura (fração): ε_f − σ_f/E. */
  along: number;
}

export function tensileState(v: LabValues): TensileState {
  const idx = matOf(v);
  const m = MATERIALS[idx];
  const { A0, L0, d0 } = SPECIMEN;
  const e = Math.max(0, v.eps ?? 0) / 100;
  const broken = e >= m.ef;
  const unloaded = !broken && Math.round(v.unload ?? 0) === 1;
  const sCurve = broken ? m.sf : curveStress(m, e);
  const along = m.ef - m.sf / m.E;
  const elastic = !m.brittle && e <= m.sp / m.E;
  const ep = broken ? along : elastic ? 0 : Math.max(0, e - sCurve / m.E);
  const necking = !broken && !m.brittle && e > m.eu;
  // área: volume constante no trecho uniforme; no pescoço, cai até A₀·(1 − estricção)
  let A: number;
  if (broken) A = m.brittle ? A0 / (1 + along) : A0 * (1 - m.ra);
  else if (unloaded && !necking) A = A0 / (1 + ep);
  else A = areaAt(m, e);
  const s = broken || unloaded ? 0 : sCurve;
  const F = (s * A0) / 1000;
  const eNow = broken ? along : unloaded ? ep : e;
  const y = YIELD[idx];
  const Ut = energyTo(idx, m.ef);
  let phase: TensilePhase;
  if (broken) phase = 'broken';
  else if (unloaded) phase = 'unloaded';
  else if (e <= 0) phase = 'zero';
  else if (m.brittle || elastic) phase = 'elastic';
  else if (necking) phase = 'necking';
  else if (m.plateau ? e <= m.plateau.end : e <= y.e) phase = 'yield';
  else phase = 'hardening';
  return {
    idx,
    m,
    e,
    broken,
    unloaded,
    phase,
    sCurve,
    s,
    eNow,
    ep,
    F,
    dL: eNow * L0,
    A,
    d: d0 * Math.sqrt(A / A0),
    sv: s > 0 ? (s * A0) / A : 0,
    U: broken ? Ut : energyTo(idx, e) - (unloaded ? (sCurve * sCurve) / (2 * m.E) : 0),
    se: y.s,
    eY: y.e,
    Ur: (y.s * y.s) / (2 * m.E),
    Ut,
    along,
  };
}

/** O ensaio já passou do ponto em que se mede o escoamento? (as leituras aparecem conforme o ensaio avança) */
const yieldSeen = (v: LabValues) => {
  const idx = matOf(v);
  return !MATERIALS[idx].brittle && (v.eps ?? 0) / 100 >= YIELD[idx].e;
};
const maxSeen = (v: LabValues) => (v.eps ?? 0) / 100 >= MATERIALS[matOf(v)].eu;
const brokeSeen = (v: LabValues) => (v.eps ?? 0) / 100 >= MATERIALS[matOf(v)].ef;

export const tensileModel: LabModel = {
  id: 'tensile',
  name: 'Ensaio de tração',
  icon: '🧷',
  summary:
    'Uma **máquina universal** puxa um corpo de prova (A₀ = 100 mm², L₀ = 50 mm) até romper e traça o **diagrama tensão × deformação**. Compare aço doce, aço temperado e revenido, alumínio e ferro fundido; **descarregue** no meio do ensaio para ver a deformação permanente e o encruamento.',
  params: [
    {
      id: 'mat',
      label: 'Material',
      min: 0,
      max: 3,
      step: 1,
      default: 0,
      choices: MATERIALS.map((m) => m.short),
      help: 'Aço SAE 1020 laminado, aço SAE 4140 temperado e revenido, alumínio 6061-T6 e ferro fundido cinzento.',
    },
    {
      id: 'eps',
      label: 'Deformação imposta ε',
      min: 0,
      max: 36,
      step: 0.01,
      default: 0,
      unit: '%',
      digits: 2,
      help: 'Alongamento entre as marcas (L₀ = 50 mm) imposto pela travessa da máquina. Para ajuste fino no trecho elástico, arraste no gráfico ampliado.',
    },
    {
      id: 'unload',
      label: 'Carga',
      min: 0,
      max: 1,
      step: 1,
      default: 0,
      choices: ['Aplicada', 'Retirada'],
      help: 'Retirar a carga descarrega o corpo de prova pela reta paralela ao trecho elástico.',
    },
  ],
  outputs: [
    { id: 'sig', label: 'Tensão σ = F/A₀', unit: 'MPa', digits: 0 },
    { id: 'F', label: 'Força na célula de carga', unit: 'kN', digits: 1 },
    { id: 'dL', label: 'Alongamento entre marcas', unit: 'mm', digits: 2 },
    { id: 'ep', label: 'Deformação permanente', unit: '%', digits: 2 },
    { id: 'sv', label: 'Tensão verdadeira F/A', unit: 'MPa', digits: 0 },
    { id: 'E', label: 'Módulo de elasticidade E', unit: 'GPa', digits: 0 },
    { id: 'se', label: 'Limite de escoamento', unit: 'MPa', digits: 0, show: yieldSeen },
    { id: 'Ur', label: 'Módulo de resiliência', unit: 'MJ/m³', digits: 3, show: yieldSeen },
    { id: 'sr', label: 'Limite de resistência', unit: 'MPa', digits: 0, show: maxSeen },
    { id: 'along', label: 'Alongamento após a ruptura', unit: '%', digits: 2, show: brokeSeen },
    { id: 'ra', label: 'Estricção', unit: '%', digits: 0, show: brokeSeen },
    { id: 'U', label: 'Energia absorvida', unit: 'MJ/m³', digits: 2 },
    { id: 'def', label: 'Deformação atual', unit: '%', digits: 3, hidden: true },
    { id: 'broken', label: 'Rompido', hidden: true },
    { id: 'neck', label: 'Com estricção', hidden: true },
    { id: 'd', label: 'Diâmetro mínimo', unit: 'mm', digits: 2, hidden: true },
    { id: 'Fmax', label: 'Força máxima', unit: 'kN', digits: 1, hidden: true },
  ],
  compute(p) {
    const st = tensileState(p);
    return {
      sig: st.s,
      F: st.F,
      dL: st.dL,
      ep: st.ep * 100,
      sv: st.sv,
      E: st.m.E / 1000,
      se: st.se,
      Ur: st.Ur,
      sr: st.m.sr,
      along: st.along * 100,
      ra: st.m.ra * 100,
      U: st.U,
      def: st.eNow * 100,
      broken: st.broken ? 1 : 0,
      neck: st.phase === 'necking' ? 1 : 0,
      d: st.d,
      Fmax: (st.m.sr * SPECIMEN.A0) / 1000,
    };
  },
  experiments: [
    {
      label: 'O ensaio completo',
      preset: { mat: 0, eps: 0, unload: 0 },
      text: 'Aperte **▶ Ensaiar** e acompanhe: reta elástica, **patamar de escoamento** (a deformação cresce sem a força subir), encruamento até o **limite de resistência**, estricção e ruptura.',
    },
    {
      label: 'Descarregar e recarregar',
      preset: { mat: 0, eps: 8, unload: 1 },
      text: 'Descarregado a partir de 8 %: o corpo de prova volta por uma reta **paralela à elástica** e sobra a deformação permanente. Volte a carga: ele só escoa de novo na tensão em que parou — é o **encruamento**.',
    },
    {
      label: 'Aço × alumínio',
      preset: { mat: 2, eps: 0.3, unload: 0 },
      text: 'Mesma deformação elástica, um terço da tensão: o alumínio tem **E = 70 GPa**. Troque para o aço temperado: muito mais resistente, mas com a **mesma reta** do aço 1020 (E não muda com o tratamento térmico).',
    },
    {
      label: 'Frágil',
      preset: { mat: 3, eps: 0.3, unload: 0 },
      text: 'O ferro fundido cinzento rompe a cerca de **0,45 %**, sem escoar e sem pescoço. Absorve uma fração mínima da energia que o aço 1020 absorve até romper.',
    },
    {
      label: 'Estricção',
      preset: { mat: 0, eps: 26, unload: 0 },
      text: 'Passado o limite de resistência, a deformação se concentra no **pescoço**: a força cai, mas a **tensão verdadeira** (F dividida pela área real) continua subindo.',
    },
  ],
};
