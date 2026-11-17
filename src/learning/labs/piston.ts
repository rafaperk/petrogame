/**
 * Bancada do cilindro com pistão: ar (gás perfeito) sai do estado 1 (100 kPa, 27 °C, 1 m³) e chega ao estado 2
 * por um processo isobárico, isocórico, isotérmico, adiabático reversível (isentrópico) ou politrópico.
 * Diagrama P–V (área sob a curva = trabalho), diagrama T–S (área sob a curva = calor) e a 1ª lei: Q = ΔU + W.
 *
 * Convenção do jogo (a mesma das lições): Q > 0 entra no gás; W > 0 é trabalho realizado PELO gás (expansão).
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

const R = 0.287;
const K = 1.4;

/** Ar como gás perfeito, com cv = R/(k − 1) exato (assim Q = 0 sai exato no adiabático). */
export const GAS = {
  R,
  k: K,
  cv: R / (K - 1),
  cp: (K * R) / (K - 1),
  P1: 100, // kPa
  V1: 1, // m³
  T1: 300, // K (27 °C)
  K0: 273, // °C → K, como nas lições
} as const;

/** Massa de ar no cilindro (kg): m = P₁·V₁/(R·T₁) ≈ 1,16 kg. Note que m·R·T₁ = P₁·V₁ = 100 kJ. */
export const MASS = (GAS.P1 * GAS.V1) / (GAS.R * GAS.T1);

export const PROC = { isobaric: 0, isochoric: 1, isothermal: 2, adiabatic: 3, polytropic: 4 } as const;
export const PROC_NAMES = ['Isobárico', 'Isocórico', 'Isotérmico', 'Adiabático', 'Politrópico'];

/** Um ponto do caminho. S é a variação de entropia em relação ao estado 1 (kJ/K). */
export interface GasPoint {
  P: number;
  V: number;
  T: number;
  S: number;
}

export interface PistonState extends GasPoint {
  /** Expoente politrópico (P·Vⁿ = cte); isocórico = Infinity. */
  n: number;
  W: number;
  Q: number;
  dU: number;
}

/** O processo é comandado pela temperatura (aquecer/resfriar) ou pelo volume (mexer no pistão)? */
export const drivenByHeat = (v: LabValues) => Math.round(v.proc) <= PROC.isochoric;

export function exponentOf(v: LabValues): number {
  switch (Math.round(v.proc)) {
    case PROC.isobaric:
      return 0;
    case PROC.isochoric:
      return Infinity;
    case PROC.isothermal:
      return 1;
    case PROC.adiabatic:
      return GAS.k;
    default:
      return v.n;
  }
}

/** Entropia em relação ao estado 1: ΔS = m·[cv·ln(T/T₁) + R·ln(V/V₁)]. */
export const entropyOf = (T: number, V: number) => MASS * (GAS.cv * Math.log(T / GAS.T1) + GAS.R * Math.log(V / GAS.V1));

/** Ponto do caminho 1 → 2, com u de 0 (estado 1) a 1 (estado 2). */
export function pathPoint(v: LabValues, u: number): GasPoint {
  const { P1, V1, T1, K0 } = GAS;
  const proc = Math.round(v.proc);
  if (proc === PROC.isobaric || proc === PROC.isochoric) {
    const T = T1 + (v.t2 + K0 - T1) * u;
    const V = proc === PROC.isobaric ? (V1 * T) / T1 : V1;
    const P = proc === PROC.isobaric ? P1 : (P1 * T) / T1;
    return { P, V, T, S: entropyOf(T, V) };
  }
  const n = exponentOf(v);
  const V = V1 + (v.v2 - V1) * u;
  const P = P1 * Math.pow(V1 / V, n);
  const T = T1 * Math.pow(V1 / V, n - 1);
  return { P, V, T, S: entropyOf(T, V) };
}

/** Estado 2 e a contabilidade de energia do processo 1 → 2 (kJ). */
export function pistonState(v: LabValues): PistonState {
  const end = pathPoint(v, 1);
  const n = exponentOf(v);
  const { P1, V1 } = GAS;
  let W: number;
  if (!Number.isFinite(n)) W = 0;
  else if (Math.abs(n - 1) < 1e-6) W = P1 * V1 * Math.log(end.V / V1);
  else W = (end.P * end.V - P1 * V1) / (1 - n);
  const dU = MASS * GAS.cv * (end.T - GAS.T1);
  return { ...end, n, W, Q: dU + W, dU };
}

export const pistonModel: LabModel = {
  id: 'piston',
  name: 'Cilindro com pistão',
  icon: '🧪',
  summary:
    'Ar num cilindro com pistão, partindo sempre de **100 kPa, 27 °C e 1 m³**. Escolha o processo, aqueça ou mexa no pistão e veja as moléculas, o **diagrama P–V** (área = trabalho), o **T–S** (área = calor) e a 1ª lei **Q = ΔU + W**.',
  params: [
    { id: 'proc', label: 'Processo', min: 0, max: 4, step: 1, default: 0, choices: PROC_NAMES },
    {
      id: 'n',
      label: 'Expoente n (P·Vⁿ = cte)',
      min: 0,
      max: 2,
      step: 0.05,
      default: 1.3,
      digits: 2,
      show: (v) => Math.round(v.proc) === PROC.polytropic,
      help: 'n = 0 é isobárico, n = 1 isotérmico, n = k = 1,4 adiabático.',
    },
    {
      id: 'v2',
      label: 'Volume final V₂',
      min: 0.2,
      max: 3,
      step: 0.05,
      default: 0.5,
      unit: 'm³',
      digits: 2,
      show: (v) => !drivenByHeat(v),
      help: 'Empurre ou puxe o pistão (também dá para arrastar no desenho).',
    },
    {
      id: 't2',
      label: 'Temperatura final T₂',
      min: -100,
      max: 600,
      step: 5,
      default: 327,
      unit: '°C',
      digits: 0,
      show: (v) => drivenByHeat(v),
      help: 'Aqueça (chama) ou resfrie (gelo) o cilindro.',
    },
  ],
  outputs: [
    { id: 'P2', label: 'Pressão final P₂', unit: 'kPa', digits: 1 },
    { id: 'V2', label: 'Volume final V₂', unit: 'm³', digits: 2 },
    { id: 'T2', label: 'Temperatura final T₂', unit: '°C', digits: 1 },
    { id: 'W', label: 'Trabalho do gás W', unit: 'kJ', digits: 1 },
    { id: 'Q', label: 'Calor recebido Q', unit: 'kJ', digits: 1 },
    { id: 'dU', label: 'Variação ΔU', unit: 'kJ', digits: 1 },
    { id: 'dS', label: 'Variação ΔS', unit: 'kJ/K', digits: 3 },
    { id: 'T2K', label: 'T₂ em kelvin', unit: 'K', digits: 0, hidden: true },
    { id: 'absQ', label: '|Q|', unit: 'kJ', digits: 1, hidden: true },
    { id: 'wq', label: 'W/Q', unit: '%', digits: 1, hidden: true },
  ],
  compute(p) {
    const st = pistonState(p);
    return {
      P2: st.P,
      V2: st.V,
      T2: st.T - GAS.K0,
      W: st.W,
      Q: st.Q,
      dU: st.dU,
      dS: st.S,
      T2K: st.T,
      absQ: Math.abs(st.Q),
      wq: Math.abs(st.Q) > 1e-9 ? (st.W / st.Q) * 100 : 0,
    };
  },
  experiments: [
    {
      label: 'Aquecer a P constante',
      preset: { proc: 0, t2: 327 },
      text: 'Pesos fixos sobre o pistão: aquecendo, o ar se expande a **pressão constante**. De 350 kJ de calor, só **100 kJ viram trabalho**; os outros 250 kJ aumentam a energia interna.',
    },
    {
      label: 'Tanque rígido',
      preset: { proc: 1, t2: 327 },
      text: 'Pistão travado: **W = 0** e todo o calor vira energia interna (Q = ΔU). A pressão sobe na proporção da temperatura **absoluta**: 300 K → 600 K dobra a pressão.',
    },
    {
      label: 'Expansão isotérmica',
      preset: { proc: 2, v2: 2 },
      text: 'Banho a 27 °C: a temperatura não muda, **ΔU = 0** e todo o calor recebido sai como trabalho (**Q = W**). No T–S o caminho é uma reta horizontal.',
    },
    {
      label: 'Compressão adiabática',
      preset: { proc: 3, v2: 0.5 },
      text: 'Cilindro isolado: **Q = 0**. O trabalho recebido vira energia interna e o ar **esquenta** (é assim que o Diesel inflama o combustível). No T–S, uma reta vertical: isentrópico.',
    },
    {
      label: 'Politrópico n = 1,3',
      preset: { proc: 4, n: 1.3, v2: 0.5 },
      text: 'Entre o isotérmico (n = 1) e o adiabático (n = 1,4): o ar esquenta, mas **perde um pouco de calor** (Q < 0) — como num compressor com as paredes resfriadas.',
    },
    {
      label: 'Família P·Vⁿ',
      preset: { proc: 4, n: 0, v2: 2 },
      text: 'Arraste o **n**: 0 é isobárico, 1 é isotérmico, 1,4 é adiabático e, quanto maior, mais a curva se aproxima da vertical (isocórico). Compare com as curvas tracejadas.',
    },
  ],
};
