/**
 * Bancada de corrosão: uma cuba com duas placas metálicas (A e B) mergulhadas num meio. Sozinha, cada placa corrói na
 * sua taxa (micropilhas na própria superfície). Ligadas por um fio, o metal mais ativo da série galvânica vira o
 * **anodo** (corrói mais) e o mais nobre vira o **catodo** (fica protegido). Com uma fonte (corrente impressa), o polo +
 * vai na placa A (anodo) e o − na placa B (a estrutura protegida).
 *
 * Modelo didático, com a física certa nas tendências:
 * - cada metal tem o seu potencial de corrosão na série galvânica em água do mar (V × Ag/AgCl, valores aproximados);
 * - a reação catódica depende do meio: redução do O₂ (limitada pelo O₂ que chega à superfície, i_L), do H⁺ (ácido) ou
 *   da água (H₂, só bem abaixo de −1,0 V em meio neutro: é a superproteção);
 * - o anodo dissolve mais quanto mais é puxado para cima do seu potencial (reta de Evans: j = (E − E_anodo)/r_a);
 * - o catodo é puxado para baixo do seu potencial; a dissolução dele some quando a polarização chega a 0,15 V
 *   (no aço: −0,65 − 0,15 = −0,80 V × Ag/AgCl, o critério de proteção catódica em água do mar);
 * - a resistividade do eletrólito limita a corrente (queda ôhmica entre as placas);
 * - taxa de penetração pela lei de Faraday: mm/ano = i·M/(n·F·ρ).
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

export const FARADAY = 96485;
export const YEAR_S = 3.15576e7;
/** Polarização (V) que zera a dissolução do catodo. */
export const ETA = 0.15;
/** Reta de Evans dos anodos ativos (Ω·m²): sobretensão = r_a × densidade de corrente. */
export const R_A = 0.02;
/** Corrente passiva do inox (A/m²): o filme de Cr₂O₃ quase não deixa o metal dissolver. */
export const I_PASS = 1e-4;
/** Reações anódicas que não dissolvem o metal: O₂ no inox (transpassivo) e Cl₂/O₂ no grafite (V) e sua "resistência" (Ω·m²). */
export const E_GAS_INOX = 0.9;
export const E_GAS_C = 1.1;
export const R_GAS = 0.05;
/** Critério de proteção do aço em água do mar (V × Ag/AgCl), equivalente a −0,85 V × Cu/CuSO₄. */
export const E_PROT_STEEL = -0.8;
/** Abaixo disto o aço protegido começa a gerar H₂ (superproteção). */
export const E_OVER = -1.05;

export type MetalKind = 'active' | 'passive' | 'inert';

export interface Metal {
  name: string;
  /** Rótulo do botão. */
  label: string;
  /** Símbolo químico (ou "Inox"). */
  sym: string;
  /** Potencial de corrosão em água do mar (V × Ag/AgCl). */
  E: number;
  /** Elétrons por átomo dissolvido. */
  n: number;
  /** Massa molar (g/mol). */
  M: number;
  /** Massa específica (g/cm³). */
  rho: number;
  /** Fração da reação catódica disponível que vira corrosão quando o metal está sozinho (filmes protetores). */
  film: number;
  kind: MetalKind;
  /** Íon que vai para a solução. */
  ion: string;
  color: string;
  /** Cor do produto de corrosão (hidróxido/óxido) em meio neutro. */
  product: string;
}

/** Série galvânica em água do mar, do mais ativo (anódico) ao mais nobre (catódico). */
export const METALS: Metal[] = [
  { name: 'Magnésio', label: 'Mg', sym: 'Mg', E: -1.6, n: 2, M: 24.31, rho: 1.74, film: 1, kind: 'active', ion: 'Mg²⁺', color: '#d5dbe0', product: '#eef2f4' },
  { name: 'Zinco', label: 'Zn', sym: 'Zn', E: -1.03, n: 2, M: 65.38, rho: 7.14, film: 0.3, kind: 'active', ion: 'Zn²⁺', color: '#a3b2bf', product: '#e9eef1' },
  { name: 'Alumínio', label: 'Al', sym: 'Al', E: -0.8, n: 3, M: 26.98, rho: 2.7, film: 0.1, kind: 'active', ion: 'Al³⁺', color: '#dde3e9', product: '#f2f4f6' },
  { name: 'Aço carbono', label: 'Aço', sym: 'Fe', E: -0.65, n: 2, M: 55.85, rho: 7.87, film: 1, kind: 'active', ion: 'Fe²⁺', color: '#7f8a95', product: '#c2622b' },
  { name: 'Estanho', label: 'Sn', sym: 'Sn', E: -0.4, n: 2, M: 118.71, rho: 7.29, film: 0.05, kind: 'active', ion: 'Sn²⁺', color: '#c9ced4', product: '#ddd8ca' },
  { name: 'Cobre', label: 'Cu', sym: 'Cu', E: -0.32, n: 2, M: 63.55, rho: 8.96, film: 0.3, kind: 'active', ion: 'Cu²⁺', color: '#c97a48', product: '#5fb3a1' },
  { name: 'Inox 304 (passivo)', label: 'Inox', sym: 'Inox', E: -0.08, n: 2, M: 55.85, rho: 7.9, film: 0, kind: 'passive', ion: 'Fe²⁺', color: '#b9c6d2', product: '#c2622b' },
  { name: 'Grafite', label: 'Grafite', sym: 'C', E: 0.25, n: 4, M: 12.01, rho: 2.2, film: 0, kind: 'inert', ion: '', color: '#3e4349', product: '#3e4349' },
];
export const STEEL = 3;
export const COPPER = 5;
export const INOX = 6;
export const GRAPHITE = 7;

export interface Medium {
  name: string;
  label: string;
  /** Corrente limite de redução do O₂ (A/m²): o O₂ que chega à superfície por difusão. */
  iL: number;
  /** Potencial abaixo do qual o H₂ se forma (V) e a "resistência" dessa reação (Ω·m²). */
  Eh: number;
  rh: number;
  /** Resistividade do eletrólito (Ω·m). */
  rho: number;
  /** Reação catódica principal. */
  cathodic: string;
  o2: boolean;
  acid: boolean;
  color: string;
}

export const MEDIA: Medium[] = [
  { name: 'Água do mar (com O₂)', label: 'Água do mar', iL: 0.1, Eh: -1.05, rh: 1, rho: 0.25, cathodic: 'O₂ + 2H₂O + 4e⁻ → 4OH⁻', o2: true, acid: false, color: '#2f8c94' },
  { name: 'Água doce (com O₂)', label: 'Água doce', iL: 0.08, Eh: -1.05, rh: 1, rho: 50, cathodic: 'O₂ + 2H₂O + 4e⁻ → 4OH⁻', o2: true, acid: false, color: '#3f88c7' },
  { name: 'Água do mar sem O₂', label: 'Mar sem O₂', iL: 0.002, Eh: -1.05, rh: 1, rho: 0.25, cathodic: '2H₂O + 2e⁻ → H₂ + 2OH⁻', o2: false, acid: false, color: '#36607a' },
  { name: 'Ácido (pH 2, sem O₂)', label: 'Ácido (pH 2)', iL: 0, Eh: -0.37, rh: 0.2, rho: 2.5, cathodic: '2H⁺ + 2e⁻ → H₂', o2: false, acid: true, color: '#7f9a4a' },
];
export const SEA = 0;
export const FRESH = 1;
export const DEAER = 2;
export const ACID = 3;

/** Densidade de corrente catódica que o meio sustenta no potencial E (A/m²): O₂ (patamar) + H₂. */
export function cathodicJ(med: Medium, E: number): number {
  return med.iL + Math.max(0, med.Eh - E) / med.rh;
}

/** Parte da corrente catódica que vira H₂ (A/m²). */
export function h2J(med: Medium, E: number): number {
  return Math.max(0, med.Eh - E) / med.rh;
}

/** Corrosão do metal sozinho no meio (A/m²). */
export function selfJ(m: Metal, med: Medium): number {
  if (m.kind === 'inert') return 0;
  const c = cathodicJ(med, m.E);
  if (m.kind === 'passive') return c > 0 ? I_PASS : 0;
  return m.film * c;
}

/** Corrente anódica que sai do anodo no potencial E (A/m²). */
export function anodicJ(m: Metal, E: number): number {
  if (m.kind === 'active') return Math.max(0, (E - m.E) / R_A);
  if (m.kind === 'passive') return (E > m.E ? I_PASS : 0) + Math.max(0, (E - E_GAS_INOX) / R_GAS);
  return Math.max(0, (E - E_GAS_C) / R_GAS);
}

/** Fração da dissolução do catodo que some quando ele é polarizado até E (0 = nada, 1 = protegido). */
export function protOf(m: Metal, E: number): number {
  return Math.min(1, Math.max(0, (m.E - E) / ETA));
}

/** Corrente catódica que o catodo aceita no potencial E (A/m²). */
export function cathodeJ(m: Metal, med: Medium, E: number): number {
  return cathodicJ(med, E) * protOf(m, E);
}

/** Resistência do eletrólito entre as placas (Ω): espalhamento da corrente a partir de cada placa (áreas em m²). */
export function solutionR(med: Medium, AA: number, AC: number): number {
  return ((med.rho * Math.sqrt(Math.PI)) / 4) * (1 / Math.sqrt(AA) + 1 / Math.sqrt(AC));
}

/**
 * Pilha: acha o potencial do catodo E_c em que a corrente que o anodo fornece é a que o catodo aceita.
 * E_anodo = E_c + V_fonte − I·R (o fio iguala os metais; a fonte soma V; o eletrólito tira I·R).
 */
export function solveCell(an: Metal, ca: Metal, AA: number, AC: number, med: Medium, Vs: number): { I: number; Ec: number; Ea: number } {
  const Rs = solutionR(med, AA, AC);
  const Ic = (E: number) => AC * cathodeJ(ca, med, E);
  const resid = (Ec: number) => {
    const I = Ic(Ec);
    return AA * anodicJ(an, Ec + Vs - I * Rs) - I;
  };
  let hi = ca.E;
  let lo = -12;
  if (resid(hi) <= 0) return { I: 0, Ec: ca.E, Ea: an.E };
  for (let k = 0; k < 90; k++) {
    const mid = (hi + lo) / 2;
    if (resid(mid) > 0) hi = mid;
    else lo = mid;
  }
  const Ec = (hi + lo) / 2;
  const I = Ic(Ec);
  return { I, Ec, Ea: Ec + Vs - I * Rs };
}

/** mm/ano por A/m² (Faraday). */
export const rateFactor = (m: Metal) => (m.M * YEAR_S) / (m.n * FARADAY * m.rho * 1000);
/** g/ano por A. */
export const massFactor = (m: Metal) => (m.M * YEAR_S) / (m.n * FARADAY);

export interface Plate {
  metal: Metal;
  /** Área molhada (cm² e m²). */
  cm2: number;
  A: number;
  /** Papel na pilha. */
  role: 'alone' | 'anode' | 'cathode';
  /** Potencial da placa (V × Ag/AgCl). */
  E: number;
  /** Corrosão sozinha e agora (A/m²). */
  j0: number;
  j: number;
  /** Taxas (mm/ano) sozinha e agora; perda de massa (g/ano). */
  r0: number;
  r: number;
  loss: number;
  /** Proteção (0–1) quando é catodo. */
  prot: number;
  /** H₂ que se forma na placa (A): no catodo e, no metal muito ativo, na própria superfície. */
  h2: number;
  /** Reação anódica sem dissolver o metal (Cl₂/O₂ no grafite ou no inox), em A. */
  gas: number;
}

export interface CellState {
  A: Plate;
  B: Plate;
  med: Medium;
  medIdx: number;
  link: 0 | 1 | 2;
  Vs: number;
  /** Diferença de potencial em circuito aberto (V), sempre ≥ 0. */
  dE: number;
  /** Corrente da pilha (A). */
  I: number;
  /** Placa anódica: 0 = A, 1 = B, −1 = nenhuma. */
  anode: -1 | 0 | 1;
  Rs: number;
}

const idx = (v: number | undefined, def: number, n: number) => Math.min(n - 1, Math.max(0, Math.round(v ?? def)));

export function cellState(v: LabValues): CellState {
  const mA = METALS[idx(v.metA, STEEL, METALS.length)];
  const mB = METALS[idx(v.metB, COPPER, METALS.length)];
  const medIdx = idx(v.env, SEA, MEDIA.length);
  const med = MEDIA[medIdx];
  const link = idx(v.link, 1, 3) as 0 | 1 | 2;
  const Vs = link === 2 ? Math.max(0, v.V ?? 2) : 0;
  const cmA = Math.max(1, v.aA ?? 100);
  const cmB = Math.max(1, v.aB ?? 100);
  const AA = cmA / 1e4;
  const AB = cmB / 1e4;
  const plate = (metal: Metal, cm2: number, A: number): Plate => {
    const j0 = selfJ(metal, med);
    return {
      metal,
      cm2,
      A,
      role: 'alone',
      E: metal.E,
      j0,
      j: j0,
      r0: j0 * rateFactor(metal),
      r: j0 * rateFactor(metal),
      loss: j0 * A * massFactor(metal),
      prot: 0,
      h2: metal.kind === 'active' ? metal.film * h2J(med, metal.E) * A : 0,
      gas: 0,
    };
  };
  const pA = plate(mA, cmA, AA);
  const pB = plate(mB, cmB, AB);
  const st: CellState = { A: pA, B: pB, med, medIdx, link, Vs, dE: Math.abs(mA.E - mB.E), I: 0, anode: -1, Rs: solutionR(med, AA, AB) };
  if (link === 0) return st;

  // papéis: com fio, o mais ativo é o anodo; com fonte, o polo + (placa A) é o anodo
  let anode: -1 | 0 | 1 = -1;
  if (link === 2) anode = 0;
  else if (mA.E < mB.E) anode = 0;
  else if (mB.E < mA.E) anode = 1;
  if (anode < 0) return st;
  const an = anode === 0 ? pA : pB;
  const ca = anode === 0 ? pB : pA;
  const sol = solveCell(an.metal, ca.metal, an.A, ca.A, med, Vs);
  st.I = sol.I;
  if (sol.I <= 0) return st;
  st.anode = anode;
  an.role = 'anode';
  ca.role = 'cathode';
  an.E = sol.Ea;
  ca.E = sol.Ec;
  // anodo: a corrente da pilha dissolve o metal (no inox só a corrente passiva; no grafite nada: vira gás)
  if (an.metal.kind === 'active') an.j = an.j0 + sol.I / an.A;
  else if (an.metal.kind === 'passive') {
    an.j = I_PASS;
    an.gas = Math.max(0, sol.I - I_PASS * an.A);
  } else {
    an.j = 0;
    an.gas = sol.I;
  }
  // catodo: a dissolução cai com a polarização; o que passa do patamar do O₂ vira H₂
  ca.prot = protOf(ca.metal, sol.Ec);
  ca.j = ca.j0 * (1 - ca.prot);
  ca.h2 = ca.A * ca.prot * h2J(med, sol.Ec);
  for (const p of [an, ca]) {
    p.r = p.j * rateFactor(p.metal);
    p.loss = p.j * p.A * massFactor(p.metal);
  }
  return st;
}

const linked = (v: LabValues) => Math.round(v.link ?? 1) > 0;
const supply = (v: LabValues) => Math.round(v.link ?? 1) === 2;
const CHOICES = METALS.map((m) => m.label);

export const corrosionModel: LabModel = {
  id: 'corrosion',
  name: 'Pilha de corrosão e proteção catódica',
  icon: '🧪',
  summary:
    'Uma **cuba** com duas placas metálicas. Sozinha, cada uma corrói devagar; ligadas por um **fio**, o metal mais ativo da **série galvânica** vira **anodo** (corrói mais) e o mais nobre vira **catodo** (fica protegido). Mude os metais, as **áreas**, o **meio** (água do mar, água doce, sem O₂, ácido) e use uma **fonte** para ver a proteção catódica por corrente impressa.',
  params: [
    { id: 'metA', label: 'Metal da placa A', min: 0, max: METALS.length - 1, step: 1, default: STEEL, choices: CHOICES, help: 'Mg, Zn, Al, aço, estanho, cobre, inox 304 passivo e grafite: do mais ativo ao mais nobre na série galvânica em água do mar.' },
    { id: 'metB', label: 'Metal da placa B', min: 0, max: METALS.length - 1, step: 1, default: COPPER, choices: CHOICES, help: 'Com o fio, quem estiver mais abaixo na série (mais ativo) vira o anodo.' },
    {
      id: 'env',
      label: 'Meio (eletrólito)',
      min: 0,
      max: MEDIA.length - 1,
      step: 1,
      default: SEA,
      choices: MEDIA.map((m) => m.label),
      help: 'O meio decide a reação catódica: O₂ + 2H₂O + 4e⁻ → 4OH⁻ com oxigênio; 2H⁺ + 2e⁻ → H₂ no ácido. A água do mar conduz muito melhor que a água doce.',
    },
    {
      id: 'link',
      label: 'Ligação entre as placas',
      min: 0,
      max: 2,
      step: 1,
      default: 1,
      choices: ['Aberta', 'Fio', 'Fonte'],
      help: 'Aberta: cada placa corrói sozinha. Fio: pilha galvânica. Fonte: corrente impressa, com o polo + na placa A e o − na placa B. Também dá para clicar no aparelho do fio para abrir ou fechar o circuito.',
    },
    { id: 'V', label: 'Tensão da fonte (+ em A, − em B)', min: 0, max: 4, step: 0.05, default: 2, unit: 'V', digits: 2, help: 'Proteção por corrente impressa: a fonte empurra elétrons para a placa B. Ela precisa vencer a diferença de potencial do próprio par.', show: supply },
    { id: 'aA', label: 'Área molhada da placa A', min: 10, max: 1000, step: 10, default: 100, unit: 'cm²', digits: 0, help: 'Arraste também a borda de baixo da placa no desenho.' },
    { id: 'aB', label: 'Área molhada da placa B', min: 10, max: 1000, step: 10, default: 100, unit: 'cm²', digits: 0, help: 'Catodo grande com anodo pequeno é a pior combinação.' },
  ],
  outputs: [
    { id: 'dE', label: 'ΔE entre os metais (circuito aberto)', unit: 'V', digits: 2 },
    { id: 'I', label: 'Corrente da pilha', unit: 'mA', digits: 2, show: linked },
    { id: 'rA', label: 'Corrosão da placa A', unit: 'mm/ano', digits: 3 },
    { id: 'rB', label: 'Corrosão da placa B', unit: 'mm/ano', digits: 3 },
    { id: 'kAn', label: 'Anodo: vezes a taxa dele sozinho', digits: 1, show: linked },
    { id: 'prot', label: 'Proteção do catodo', unit: '%', digits: 0, show: linked },
    { id: 'EA', label: 'Potencial da placa A (× Ag/AgCl)', unit: 'V', digits: 2 },
    { id: 'EB', label: 'Potencial da placa B (× Ag/AgCl)', unit: 'V', digits: 2 },
    { id: 'H2', label: 'Hidrogênio no catodo', unit: 'mA', digits: 2, show: linked },
    { id: 'lossAn', label: 'Massa perdida pelo anodo', unit: 'g/ano', digits: 2, show: linked },
    { id: 'anode', label: 'Anodo (0 = A, 1 = B, −1 = nenhum)', hidden: true },
    { id: 'rA0', label: 'Corrosão da placa A sozinha', hidden: true },
    { id: 'rB0', label: 'Corrosão da placa B sozinha', hidden: true },
    { id: 'protA', label: 'Proteção da placa A', hidden: true },
    { id: 'protB', label: 'Proteção da placa B', hidden: true },
    { id: 'lossA', label: 'Massa perdida pela placa A', hidden: true },
    { id: 'lossB', label: 'Massa perdida pela placa B', hidden: true },
  ],
  compute(p) {
    const st = cellState(p);
    const an = st.anode === 0 ? st.A : st.anode === 1 ? st.B : null;
    const ca = st.anode === 0 ? st.B : st.anode === 1 ? st.A : null;
    return {
      dE: st.dE,
      I: st.I * 1000,
      rA: st.A.r,
      rB: st.B.r,
      kAn: an && an.r0 > 0 ? an.r / an.r0 : 1,
      prot: ca ? ca.prot * 100 : 0,
      EA: st.A.E,
      EB: st.B.E,
      H2: ca ? ca.h2 * 1000 : 0,
      lossAn: an ? an.loss : 0,
      anode: st.anode,
      rA0: st.A.r0,
      rB0: st.B.r0,
      protA: st.A.prot * 100,
      protB: st.B.prot * 100,
      lossA: st.A.loss,
      lossB: st.B.loss,
    };
  },
  experiments: [
    {
      label: 'Pilha aço–cobre',
      preset: { metA: STEEL, metB: COPPER, env: SEA, link: 1, aA: 100, aB: 100 },
      text: 'O aço é mais ativo: vira o **anodo** e corrói o dobro. O cobre, **catodo**, fica protegido. Os elétrons vão do anodo ao catodo pelo fio; no catodo, o O₂ da água vira OH⁻. Abra o circuito e compare.',
    },
    {
      label: 'Anodo pequeno, catodo grande',
      preset: { metA: STEEL, metB: COPPER, env: SEA, link: 1, aA: 10, aB: 1000 },
      text: 'Um rebite de aço numa chapa de cobre: todo o O₂ que chega à grande área de cobre puxa elétrons do pouquinho de aço. A corrosão do rebite fica **dezenas de vezes** mais rápida. Inverta as áreas.',
    },
    {
      label: 'Lata riscada: estanho × zinco',
      preset: { metA: STEEL, metB: 4, env: SEA, link: 1, aA: 10, aB: 1000 },
      text: 'Folha de flandres riscada: o estanho é **mais nobre** que o aço, então o aço exposto no risco vira um anodo pequeno e fura depressa. Troque a placa B por zinco (aço galvanizado): agora o aço é o catodo e fica protegido.',
    },
    {
      label: 'Anodo de sacrifício',
      preset: { metA: 1, metB: STEEL, env: SEA, link: 1, aA: 100, aB: 1000 },
      text: 'O zinco, mais ativo, protege uma área de aço dez vezes maior e se consome no lugar dela. O aço desce de −0,65 V para perto de −1,0 V: abaixo de −0,80 V ele está protegido. Experimente magnésio e alumínio.',
    },
    {
      label: 'Corrente impressa',
      preset: { metA: GRAPHITE, metB: STEEL, env: SEA, link: 2, V: 2, aA: 100, aB: 1000 },
      text: 'O grafite é **mais nobre** que o aço, mas a fonte força a corrente: o aço vira catodo. Abaixo de ~2 V a fonte nem vence o par; muito acima, o aço passa de −1,05 V e começa a gerar **H₂** (superproteção).',
    },
    {
      label: 'Sem oxigênio',
      preset: { metA: STEEL, metB: COPPER, env: DEAER, link: 1, aA: 100, aB: 100 },
      text: 'Sem O₂ dissolvido, falta a reação catódica e a corrosão do aço **quase para** — por isso se tira o oxigênio da água das caldeiras e da água de injeção.',
    },
    {
      label: 'Zinco e cobre no ácido',
      preset: { metA: 1, metB: COPPER, env: ACID, link: 1, aA: 100, aB: 100 },
      text: 'No ácido a reação catódica é 2H⁺ + 2e⁻ → H₂. Sozinho o cobre não corrói (é mais nobre que o hidrogênio); ligado ao zinco, as **bolhas aparecem no cobre**, mas quem se dissolve é o zinco.',
    },
  ],
};
