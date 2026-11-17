/**
 * Bancada dos ciclos padrão a ar: Otto (ignição por centelha), Diesel (ignição por compressão) e Brayton (turbina a gás),
 * com o ciclo de Carnot entre as mesmas temperaturas extremas como referência.
 *
 * Hipóteses do ar-padrão frio: o fluido é só ar (gás perfeito, k = 1,4, calores específicos constantes); a combustão
 * vira "calor fornecido"; o escape vira "calor rejeitado"; todos os processos são reversíveis.
 * Estado 1 (início da compressão): 100 kPa e 27 °C. Tudo por kg de ar.
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

const R = 0.287;
const K = 1.4;

export const AIR = {
  R,
  k: K,
  cv: R / (K - 1),
  cp: (K * R) / (K - 1),
  P1: 100, // kPa
  T1: 300, // K
  K0: 273,
} as const;

/** Volume específico no estado 1 (m³/kg). */
export const V1 = (AIR.R * AIR.T1) / AIR.P1;

export const CYC = { otto: 0, diesel: 1, brayton: 2 } as const;
export const CYCLE_NAMES = ['Otto', 'Diesel', 'Brayton'];

export type Leg = 'isentropic' | 'isochoric' | 'isobaric';

/** Estado do ar: T (K), P (kPa), v (m³/kg) e s em relação ao estado 1 (kJ/kg·K). */
export interface CyclePoint {
  T: number;
  P: number;
  v: number;
  s: number;
}

export interface CycleState {
  cyc: number;
  /** Estados 1, 2, 3 e 4. */
  pts: [CyclePoint, CyclePoint, CyclePoint, CyclePoint];
  /** Processos 1→2, 2→3, 3→4 e 4→1. */
  legs: [Leg, Leg, Leg, Leg];
  qin: number;
  qout: number;
  wnet: number;
  /** Trabalho de compressão e de expansão (turbina), por kg. */
  wc: number;
  wt: number;
  eta: number;
  /** Carnot entre T₁ e T₃. */
  etaC: number;
  /** Taxa de compressão V₁/V₂, razão de corte V₃/V₂ e razão de pressões P₂/P₁. */
  r: number;
  rc: number;
  rp: number;
  /** w_c/w_t ("back work ratio"). */
  bwr: number;
  /** Pressão média efetiva: w_líq/(v_máx − v_mín). */
  mep: number;
  /**
   * 0 = ok; 1 = a T₃ pedida não passa de T₂ (não há como fornecer calor): o modelo usa T₂ + 20 K;
   * 2 = Diesel com T₃ alto demais para o r: a combustão passaria do PMI (o modelo limita r_c a 0,95·r).
   */
  invalid: 0 | 1 | 2;
  /** Regenerador ideal: ligado? útil (escape mais quente que o ar comprimido)? Tx = ar saindo dele, Ty = gás saindo dele. */
  regen: { on: boolean; useful: boolean; Tx: number; Ty: number };
}

const sOf = (T: number, v: number) => AIR.cv * Math.log(T / AIR.T1) + AIR.R * Math.log(v / V1);
export const cyclePoint = (T: number, v: number): CyclePoint => ({ T, v, P: (AIR.R * T) / v, s: sOf(T, v) });
const atP = (T: number, P: number) => cyclePoint(T, (AIR.R * T) / P);

/** Ponto na fração u (0 a 1) do processo de a até b. */
export function legPoint(a: CyclePoint, b: CyclePoint, leg: Leg, u: number): CyclePoint {
  if (leg === 'isentropic') {
    const v = a.v * Math.pow(b.v / a.v, u);
    return cyclePoint(a.T * Math.pow(a.v / v, K - 1), v);
  }
  const T = a.T + (b.T - a.T) * u;
  return leg === 'isochoric' ? cyclePoint(T, a.v) : atP(T, a.P);
}

/** Pontos intermediários de um processo de a até b (inclui as pontas). */
export function legPoints(a: CyclePoint, b: CyclePoint, leg: Leg, n = 32): CyclePoint[] {
  return Array.from({ length: n + 1 }, (_, i) => legPoint(a, b, leg, i / n));
}

export function cycleState(p: LabValues): CycleState {
  const cyc = Math.round(p.cyc);
  const { T1, P1, cv, cp, K0 } = AIR;
  const want = p.t3 + K0;
  const s1 = cyclePoint(T1, V1);

  if (cyc === CYC.brayton) {
    const rp = p.rp;
    const x = Math.pow(rp, (K - 1) / K);
    const T2 = T1 * x;
    const invalid = want < T2 + 20 ? 1 : 0;
    const T3 = invalid ? T2 + 20 : want;
    const T4 = T3 / x;
    const P2 = P1 * rp;
    const pts: CycleState['pts'] = [s1, atP(T2, P2), atP(T3, P2), atP(T4, P1)];
    const wc = cp * (T2 - T1);
    const wt = cp * (T3 - T4);
    const on = Math.round(p.regen) === 1;
    const useful = on && T4 > T2;
    // regenerador ideal (efetividade 100%): o ar comprimido sai dele a T₄ e o gás de escape, a T₂
    const Tx = useful ? T4 : T2;
    const Ty = useful ? T2 : T4;
    const qin = cp * (T3 - Tx);
    const qout = cp * (Ty - T1);
    const wnet = wt - wc;
    return {
      cyc,
      pts,
      legs: ['isentropic', 'isobaric', 'isentropic', 'isobaric'],
      qin,
      qout,
      wnet,
      wc,
      wt,
      eta: wnet / qin,
      etaC: 1 - T1 / T3,
      r: V1 / pts[1].v,
      rc: 1,
      rp,
      bwr: wc / wt,
      mep: wnet / (pts[3].v - pts[1].v),
      invalid,
      regen: { on, useful, Tx, Ty },
    };
  }

  const r = p.r;
  const v2 = V1 / r;
  const T2 = T1 * Math.pow(r, K - 1);
  const rcMax = 0.95 * r;
  const invalid = want < T2 + 20 ? 1 : cyc === CYC.diesel && want > T2 * rcMax ? 2 : 0;
  const T3 = invalid === 1 ? T2 + 20 : invalid === 2 ? T2 * rcMax : want;
  let pts: CycleState['pts'];
  let qin: number;
  let wt: number;
  let rc = 1;
  if (cyc === CYC.otto) {
    const T4 = T3 / Math.pow(r, K - 1);
    pts = [s1, cyclePoint(T2, v2), cyclePoint(T3, v2), cyclePoint(T4, V1)];
    qin = cv * (T3 - T2);
    wt = cv * (T3 - T4);
  } else {
    rc = T3 / T2;
    const v3 = rc * v2;
    const T4 = T3 * Math.pow(v3 / V1, K - 1);
    pts = [s1, cyclePoint(T2, v2), cyclePoint(T3, v3), cyclePoint(T4, V1)];
    qin = cp * (T3 - T2);
    // na combustão a P constante o pistão já desce: trabalho P·(v₃ − v₂) = R·(T₃ − T₂)
    wt = AIR.R * (T3 - T2) + cv * (T3 - T4);
  }
  const qout = cv * (pts[3].T - T1);
  const wc = cv * (T2 - T1);
  const wnet = qin - qout;
  return {
    cyc,
    pts,
    legs: ['isentropic', cyc === CYC.otto ? 'isochoric' : 'isobaric', 'isentropic', 'isochoric'],
    qin,
    qout,
    wnet,
    wc,
    wt,
    eta: wnet / qin,
    etaC: 1 - T1 / T3,
    r,
    rc,
    rp: pts[1].P / P1,
    bwr: wc / wt,
    mep: wnet / (V1 - v2),
    invalid,
    regen: { on: false, useful: false, Tx: T2, Ty: pts[3].T },
  };
}

const isPiston = (v: LabValues) => Math.round(v.cyc) !== CYC.brayton;

export const cycleModel: LabModel = {
  id: 'cycle',
  name: 'Ciclos Otto, Diesel e Brayton',
  icon: '🔥',
  summary:
    'Os ciclos **padrão a ar** dos motores e da turbina a gás, com o motor (ou a turbina) funcionando e o estado do ar andando nos diagramas **P–v** e **T–s**. A área dentro do ciclo é o trabalho líquido; o retângulo tracejado é **Carnot** entre as mesmas temperaturas.',
  params: [
    { id: 'cyc', label: 'Ciclo', min: 0, max: 2, step: 1, default: 0, choices: CYCLE_NAMES },
    {
      id: 'r',
      label: 'Taxa de compressão r = V₁/V₂',
      min: 4,
      max: 22,
      step: 0.5,
      default: 9,
      digits: 1,
      show: isPiston,
      help: 'Volume no PMI ÷ volume no PMS (câmara de combustão).',
    },
    {
      id: 'rp',
      label: 'Razão de pressões rp = P₂/P₁',
      min: 2,
      max: 30,
      step: 1,
      default: 12,
      digits: 0,
      show: (v) => !isPiston(v),
      help: 'Pressão na saída do compressor ÷ pressão na entrada.',
    },
    {
      id: 't3',
      label: 'Temperatura máxima T₃',
      min: 700,
      max: 2000,
      step: 50,
      default: 1400,
      unit: '°C',
      digits: 0,
      help: 'Quanto combustível é queimado. Na turbina a gás, é limitada pela resistência das palhetas.',
    },
    { id: 'regen', label: 'Regenerador', min: 0, max: 1, step: 1, default: 0, choices: ['Sem', 'Com'], show: (v) => !isPiston(v) },
  ],
  outputs: [
    { id: 'eta', label: 'Rendimento η', unit: '%', digits: 1 },
    { id: 'etaC', label: 'Carnot (T₁ a T₃)', unit: '%', digits: 1 },
    { id: 'qin', label: 'Calor fornecido', unit: 'kJ/kg', digits: 0 },
    { id: 'qout', label: 'Calor rejeitado', unit: 'kJ/kg', digits: 0 },
    { id: 'wnet', label: 'Trabalho líquido', unit: 'kJ/kg', digits: 0 },
    { id: 'T2', label: 'Fim da compressão T₂', unit: '°C', digits: 0 },
    { id: 'T4', label: 'Fim da expansão T₄', unit: '°C', digits: 0 },
    { id: 'Pmax', label: 'Pressão máxima', unit: 'kPa', digits: 0 },
    { id: 'rc', label: 'Razão de corte r_c', digits: 2, show: (v) => Math.round(v.cyc) === CYC.diesel },
    { id: 'bwr', label: 'Consumo do compressor', unit: '% de w_t', digits: 0, show: (v) => !isPiston(v) },
    { id: 'mep', label: 'Pressão média efetiva', unit: 'kPa', digits: 0, show: isPiston },
    { id: 'invalid', label: 'T₃ fora do possível (1: abaixo de T₂; 2: Diesel passaria do PMI)', digits: 0, hidden: true },
    { id: 'regenUseful', label: 'Regenerador útil', digits: 0, hidden: true },
  ],
  compute(p) {
    const st = cycleState(p);
    return {
      eta: st.eta * 100,
      etaC: st.etaC * 100,
      qin: st.qin,
      qout: st.qout,
      wnet: st.wnet,
      T2: st.pts[1].T - AIR.K0,
      T4: st.pts[3].T - AIR.K0,
      Pmax: Math.max(...st.pts.map((q) => q.P)),
      rc: st.rc,
      bwr: st.bwr * 100,
      mep: st.mep,
      invalid: st.invalid,
      regenUseful: st.regen.useful ? 1 : 0,
    };
  },
  experiments: [
    {
      label: 'Otto (gasolina)',
      preset: { cyc: 0, r: 9, t3: 1400 },
      text: 'Compressão isentrópica, combustão **instantânea a volume constante** (centelha no PMS), expansão e escape. O rendimento só depende de **r**: η = 1 − 1/r^{k−1}.',
    },
    {
      label: 'Diesel (caminhão)',
      preset: { cyc: 1, r: 18, t3: 1400 },
      text: 'O ar é comprimido sozinho até ficar quente o bastante para **inflamar o diesel injetado**. A combustão acontece **a pressão constante** enquanto o pistão já desce.',
    },
    {
      label: 'Mesmo r: Otto × Diesel',
      preset: { cyc: 1, r: 9, t3: 1400 },
      text: 'Com a **mesma taxa de compressão**, o Diesel rende **menos** que o Otto (compare com o preset Otto). Ele ganha na prática porque trabalha com r bem maior, de 14 a 22.',
    },
    {
      label: 'Turbina a gás',
      preset: { cyc: 2, rp: 12, t3: 1100, regen: 0 },
      text: 'Fluxo contínuo: compressor, câmara de combustão a pressão constante e turbina no mesmo eixo. Veja quanto do trabalho da turbina o **compressor** consome.',
    },
    {
      label: 'Brayton com regenerador',
      preset: { cyc: 2, rp: 5, t3: 1100, regen: 1 },
      text: 'Com rp baixo, o gás sai da turbina **mais quente** que o ar comprimido: o regenerador reaproveita esse calor e o rendimento sobe sem mudar o trabalho.',
    },
    {
      label: 'Regenerador inútil',
      preset: { cyc: 2, rp: 24, t3: 800, regen: 1 },
      text: 'Com rp alto, o ar já sai do compressor **mais quente** que o gás de escape: não há calor para regenerar.',
    },
  ],
};
