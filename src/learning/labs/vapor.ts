/**
 * Bancada dos ciclos a vapor:
 * - **Rankine** (usina a vapor, água): simples, com reaquecimento ou regenerativo (um aquecedor aberto), com a
 *   eficiência isentrópica da turbina ajustável (a bomba é sempre ideal);
 * - **refrigeração** por compressão de vapor (R-134a), ciclo ideal.
 *
 * Estados numerados como nos livros. Rankine simples: 1 (saída do condensador) → 2 (bomba) → 3 (caldeira) →
 * 4 (turbina). Com reaquecimento: 3 → 4 (turbina de alta) → 5 (reaquecedor) → 6 (turbina de baixa).
 * Regenerativo: 2 (bomba 1) → 3 (aquecedor aberto, líquido saturado) → 4 (bomba 2) → 5 (caldeira) →
 * 6 (extração) → 7 (saída da turbina). Refrigeração: 1 (saída do evaporador, vapor saturado) → 2 (descarga do
 * compressor) → 3 (saída do condensador, líquido saturado) → 4 (após a válvula).
 * Tudo por kg de fluido que passa na caldeira (ou no compressor).
 */
import type { LabValues } from '../types';
import { K0, R134A, satP, satT, stateFromPh, stateFromPs, stateFromPT, WATER, type Fluid, type FState } from './fluids';
import type { LabModel } from './model';

export const VCYC = { rankine: 0, refrig: 1 } as const;
export const MOD = { simple: 0, reheat: 1, regen: 2 } as const;
export const MOD_NAMES = ['Simples', 'Reaquecimento', 'Regeneração'];
/** Tonelada de refrigeração (kW): 12.000 BTU/h. */
export const TR_KW = 3.517;
/** Reaquecimento a 1/4 da pressão da caldeira, até a mesma temperatura T₃. */
export const REHEAT_FRACTION = 0.25;
/** Título mínimo recomendado na saída da turbina (abaixo disso, gotas erodem as últimas pás). */
export const X_MIN = 0.88;

export type VLegKind = 'pump' | 'heat' | 'expand' | 'compress' | 'throttle';
/** Processo do índice `from` ao `to` (índices de `pts`, a partir de 0). */
export interface VLeg {
  from: number;
  to: number;
  kind: VLegKind;
}

export interface RankineState {
  mod: number;
  pts: FState[];
  legs: VLeg[];
  /** Eficiência isentrópica da turbina (0 a 1). */
  eff: number;
  /** Pressões em kPa. */
  pb: number;
  pc: number;
  /** Temperatura do vapor na saída da caldeira (°C), já corrigida se ficou abaixo da saturação. */
  T3: number;
  /** Reaquecimento e extração (kPa; 0 quando não se aplica) e a fração extraída y. */
  prh: number;
  pext: number;
  y: number;
  wt: number;
  wp: number;
  wnet: number;
  qin: number;
  qout: number;
  eta: number;
  /** Carnot entre a temperatura de condensação e T₃. */
  etaC: number;
  /** Título na saída da turbina (1 se sair superaquecido). */
  xt: number;
  /** Fração do trabalho da turbina consumida pela bomba. */
  bwr: number;
  /** Temperatura de condensação (°C). */
  Tcond: number;
  /** 1 = T₃ pedida abaixo da saturação: a caldeira entrega vapor saturado. */
  invalid: 0 | 1;
}

export interface RefrigState {
  pts: FState[];
  legs: VLeg[];
  /** Temperaturas de evaporação e de condensação (°C) e as pressões (kPa). */
  te: number;
  tc: number;
  Pe: number;
  Pk: number;
  qL: number;
  qH: number;
  wc: number;
  cop: number;
  copC: number;
  copHP: number;
  /** Título após a válvula. */
  xv: number;
  /** Descarga do compressor (°C). */
  T2: number;
  /** Capacidade (kW), vazão de refrigerante (kg/s) e potência do compressor (kW). */
  QL: number;
  mdot: number;
  Wc: number;
}

const legs = (list: [number, number, VLegKind][]): VLeg[] => list.map(([from, to, kind]) => ({ from, to, kind }));

/** Bomba ideal: w = v·ΔP (líquido quase incompressível); a temperatura praticamente não muda. */
function pumpTo(a: FState, P: number): FState {
  const v = satT(WATER, a.T).vf;
  return { P, T: a.T, h: a.h + v * (P - a.P), s: a.s, x: 0, phase: 'liq' };
}

/** Expansão na turbina até P, com eficiência isentrópica eff. */
function expandTo(a: FState, P: number, eff: number): FState {
  const ideal = stateFromPs(WATER, P, a.s);
  return eff >= 1 ? ideal : stateFromPh(WATER, P, a.h - eff * (a.h - ideal.h));
}

/** Ciclo de Rankine. `opts` fixa as pressões de reaquecimento e de extração (kPa) — usado nos testes. */
export function rankineState(p: LabValues, opts: { prh?: number; pext?: number } = {}): RankineState {
  const mod = Math.round(p.mod);
  const pb = p.pb * 1000;
  const pc = p.pc;
  const eff = p.etat / 100;
  const sc = satP(WATER, pc);
  const sb = satP(WATER, pb);
  const invalid: 0 | 1 = p.t3 < sb.T + 0.5 ? 1 : 0;
  const T3 = invalid ? sb.T : p.t3;
  const p1: FState = { P: pc, T: sc.T, h: sc.hf, s: sc.sf, x: 0, phase: 'liq' };
  const top = stateFromPT(WATER, pb, T3);
  let pts: FState[];
  let path: VLeg[];
  let wt: number;
  let wp: number;
  let qin: number;
  let qout: number;
  let prh = 0;
  let pext = 0;
  let y = 0;
  if (mod === MOD.reheat) {
    prh = opts.prh ?? pb * REHEAT_FRACTION;
    const p2 = pumpTo(p1, pb);
    const p4 = expandTo(top, prh, eff);
    const p5 = stateFromPT(WATER, prh, T3);
    const p6 = expandTo(p5, pc, eff);
    pts = [p1, p2, top, p4, p5, p6];
    path = legs([
      [0, 1, 'pump'],
      [1, 2, 'heat'],
      [2, 3, 'expand'],
      [3, 4, 'heat'],
      [4, 5, 'expand'],
      [5, 0, 'heat'],
    ]);
    wt = top.h - p4.h + (p5.h - p6.h);
    wp = p2.h - p1.h;
    qin = top.h - p2.h + (p5.h - p4.h);
    qout = p6.h - p1.h;
  } else if (mod === MOD.regen) {
    // aquecedor aberto onde a T de saturação fica no meio do caminho entre o condensador e a caldeira
    pext = opts.pext ?? satT(WATER, (sc.T + sb.T) / 2).P;
    const se = satP(WATER, pext);
    const p2 = pumpTo(p1, pext);
    const p3: FState = { P: pext, T: se.T, h: se.hf, s: se.sf, x: 0, phase: 'liq' };
    const p4 = pumpTo(p3, pb);
    const p6 = expandTo(top, pext, eff);
    const p7 = expandTo(p6, pc, eff);
    // balanço do aquecedor aberto: y·h₆ + (1 − y)·h₂ = h₃
    y = (p3.h - p2.h) / (p6.h - p2.h);
    pts = [p1, p2, p3, p4, top, p6, p7];
    path = legs([
      [0, 1, 'pump'],
      [1, 2, 'heat'],
      [2, 3, 'pump'],
      [3, 4, 'heat'],
      [4, 5, 'expand'],
      [5, 6, 'expand'],
      [6, 0, 'heat'],
    ]);
    wt = top.h - p6.h + (1 - y) * (p6.h - p7.h);
    wp = (1 - y) * (p2.h - p1.h) + (p4.h - p3.h);
    qin = top.h - p4.h;
    qout = (1 - y) * (p7.h - p1.h);
  } else {
    const p2 = pumpTo(p1, pb);
    const p4 = expandTo(top, pc, eff);
    pts = [p1, p2, top, p4];
    path = legs([
      [0, 1, 'pump'],
      [1, 2, 'heat'],
      [2, 3, 'expand'],
      [3, 0, 'heat'],
    ]);
    wt = top.h - p4.h;
    wp = p2.h - p1.h;
    qin = top.h - p2.h;
    qout = p4.h - p1.h;
  }
  const exit = pts[pts.length - 1];
  return {
    mod,
    pts,
    legs: path,
    eff,
    pb,
    pc,
    T3,
    prh,
    pext,
    y,
    wt,
    wp,
    wnet: wt - wp,
    qin,
    qout,
    eta: (wt - wp) / qin,
    etaC: 1 - (sc.T + K0) / (T3 + K0),
    xt: exit.x,
    bwr: wp / wt,
    Tcond: sc.T,
    invalid,
  };
}

/** Refrigerador ideal por compressão de vapor (R-134a). */
export function refrigState(p: LabValues): RefrigState {
  const te = p.te;
  const tc = Math.max(p.tc, te + 5);
  const se = satT(R134A, te);
  const sk = satT(R134A, tc);
  const p1: FState = { P: se.P, T: te, h: se.hg, s: se.sg, x: 1, phase: 'vap' };
  const p2 = stateFromPs(R134A, sk.P, p1.s);
  const p3: FState = { P: sk.P, T: tc, h: sk.hf, s: sk.sf, x: 0, phase: 'liq' };
  const p4 = stateFromPh(R134A, se.P, p3.h);
  const qL = p1.h - p4.h;
  const wc = p2.h - p1.h;
  const qH = p2.h - p3.h;
  const QL = p.cap * TR_KW;
  const mdot = QL / qL;
  return {
    pts: [p1, p2, p3, p4],
    legs: legs([
      [0, 1, 'compress'],
      [1, 2, 'heat'],
      [2, 3, 'throttle'],
      [3, 0, 'heat'],
    ]),
    te,
    tc,
    Pe: se.P,
    Pk: sk.P,
    qL,
    qH,
    wc,
    cop: qL / wc,
    copC: (te + K0) / (tc - te),
    copHP: qH / wc,
    xv: p4.x,
    T2: p2.T,
    QL,
    mdot,
    Wc: mdot * wc,
  };
}

/** Estado na fração u (0 a 1) do processo de a até b — para animar o marcador e desenhar os diagramas. */
export function legState(f: Fluid, a: FState, b: FState, kind: VLegKind, eff: number, u: number): FState {
  switch (kind) {
    case 'pump':
      return { ...a, P: a.P + (b.P - a.P) * u, h: a.h + (b.h - a.h) * u };
    case 'heat':
      return stateFromPh(f, a.P, a.h + (b.h - a.h) * u);
    case 'compress':
      return stateFromPs(f, a.P * Math.pow(b.P / a.P, u), a.s);
    case 'throttle':
      return stateFromPh(f, a.P * Math.pow(b.P / a.P, u), a.h);
    default: {
      const P = a.P * Math.pow(b.P / a.P, u);
      const ideal = stateFromPs(f, P, a.s);
      return eff >= 1 ? ideal : stateFromPh(f, P, a.h - eff * (a.h - ideal.h));
    }
  }
}

/** Pontos de um processo (inclui as pontas). Nos processos a P constante, inclui as quinas da cúpula. */
export function legPath(f: Fluid, a: FState, b: FState, kind: VLegKind, eff: number, n = 24): FState[] {
  if (kind === 'pump') return [a, b];
  if (kind === 'heat') {
    const sat = satP(f, a.P);
    const hs = [a.h, b.h];
    for (const hb of [sat.hf, sat.hg]) if ((hb - a.h) * (hb - b.h) < 0) hs.push(hb);
    for (let i = 1; i < n; i++) hs.push(a.h + ((b.h - a.h) * i) / n);
    hs.sort((p, q) => (b.h > a.h ? p - q : q - p));
    return hs.map((h, i) => (i === 0 ? a : i === hs.length - 1 ? b : stateFromPh(f, a.P, h)));
  }
  return Array.from({ length: n + 1 }, (_, i) => (i === 0 ? a : i === n ? b : legState(f, a, b, kind, eff, i / n)));
}

export const isRankine = (v: LabValues) => Math.round(v.cyc) === VCYC.rankine;
const isRefrig = (v: LabValues) => !isRankine(v);
const isMod = (m: number) => (v: LabValues) => isRankine(v) && Math.round(v.mod) === m;

const ZERO = {
  eta: 0,
  etaC: 0,
  wnet: 0,
  qin: 0,
  qout: 0,
  wt: 0,
  wp: 0,
  xt: 0,
  Tcond: 0,
  bwr: 0,
  prh: 0,
  y: 0,
  pext: 0,
  invalid: 0,
  cop: 0,
  copC: 0,
  copHP: 0,
  qL: 0,
  wc: 0,
  qH: 0,
  xv: 0,
  T2: 0,
  Pe: 0,
  Pk: 0,
  mdot: 0,
  Wc: 0,
};

export const vaporModel: LabModel = {
  id: 'vapor',
  name: 'Ciclos a vapor: Rankine e refrigeração',
  icon: '♨️',
  summary:
    'A usina a vapor (**Rankine**, com água) e o **refrigerador por compressão de vapor** (R-134a), com o fluido mudando de fase dentro da **cúpula de saturação**. Acompanhe o título do vapor, o diagrama **T–s** (e o **P–h** da refrigeração), o rendimento e o COP.',
  params: [
    { id: 'cyc', label: 'Ciclo', min: 0, max: 1, step: 1, default: 0, choices: ['Rankine', 'Refrigeração'] },
    { id: 'mod', label: 'Arranjo', min: 0, max: 2, step: 1, default: 0, choices: MOD_NAMES, show: isRankine },
    {
      id: 'pb',
      label: 'Pressão da caldeira',
      min: 1,
      max: 15,
      step: 0.5,
      default: 2,
      unit: 'MPa',
      digits: 1,
      show: isRankine,
      help: 'Pressão em que a água ferve na caldeira (e entra na turbina).',
    },
    {
      id: 't3',
      label: 'Temperatura do vapor na turbina',
      min: 250,
      max: 600,
      step: 10,
      default: 450,
      unit: '°C',
      digits: 0,
      show: isRankine,
      help: 'Saída do superaquecedor. Limitada pela resistência dos tubos e das palhetas.',
    },
    {
      id: 'pc',
      label: 'Pressão do condensador',
      min: 5,
      max: 100,
      step: 2.5,
      default: 10,
      unit: 'kPa',
      digits: 1,
      show: isRankine,
      help: 'Vácuo do condensador: quanto menor, mais fria a condensação.',
    },
    {
      id: 'etat',
      label: 'Eficiência isentrópica da turbina',
      min: 60,
      max: 100,
      step: 1,
      default: 100,
      unit: '%',
      digits: 0,
      show: isRankine,
      help: '100 % = turbina ideal (isentrópica).',
    },
    {
      id: 'te',
      label: 'Temperatura de evaporação',
      min: -30,
      max: 10,
      step: 1,
      default: -10,
      unit: '°C',
      digits: 0,
      show: isRefrig,
      help: 'Uns graus abaixo da temperatura da câmara refrigerada.',
    },
    {
      id: 'tc',
      label: 'Temperatura de condensação',
      min: 20,
      max: 60,
      step: 1,
      default: 40,
      unit: '°C',
      digits: 0,
      show: isRefrig,
      help: 'Uns graus acima do ar (ou da água) que resfria o condensador.',
    },
    {
      id: 'cap',
      label: 'Capacidade de refrigeração',
      min: 1,
      max: 20,
      step: 1,
      default: 5,
      unit: 'TR',
      digits: 0,
      show: isRefrig,
      help: '1 TR (tonelada de refrigeração) = 3,517 kW = 12.000 BTU/h.',
    },
  ],
  outputs: [
    { id: 'eta', label: 'Rendimento η', unit: '%', digits: 1, show: isRankine },
    { id: 'etaC', label: 'Carnot (T_cond a T₃)', unit: '%', digits: 1, show: isRankine },
    { id: 'wnet', label: 'Trabalho líquido', unit: 'kJ/kg', digits: 0, show: isRankine },
    { id: 'qin', label: 'Calor na caldeira', unit: 'kJ/kg', digits: 0, show: isRankine },
    { id: 'qout', label: 'Calor no condensador', unit: 'kJ/kg', digits: 0, show: isRankine },
    { id: 'wt', label: 'Trabalho da turbina', unit: 'kJ/kg', digits: 0, show: isRankine },
    { id: 'wp', label: 'Trabalho da bomba', unit: 'kJ/kg', digits: 1, show: isRankine },
    { id: 'xt', label: 'Título na saída da turbina', digits: 3, show: isRankine },
    { id: 'Tcond', label: 'Temperatura de condensação', unit: '°C', digits: 1, show: isRankine },
    { id: 'bwr', label: 'Consumo da bomba', unit: '% de w_t', digits: 1, show: isRankine },
    { id: 'prh', label: 'Pressão de reaquecimento', unit: 'MPa', digits: 2, show: isMod(MOD.reheat) },
    { id: 'y', label: 'Vapor extraído', unit: '%', digits: 1, show: isMod(MOD.regen) },
    { id: 'pext', label: 'Pressão de extração', unit: 'kPa', digits: 0, show: isMod(MOD.regen) },
    { id: 'invalid', label: 'T₃ abaixo da saturação (sai vapor saturado)', digits: 0, hidden: true },
    { id: 'cop', label: 'COP do refrigerador', digits: 2, show: isRefrig },
    { id: 'copC', label: 'COP de Carnot', digits: 2, show: isRefrig },
    { id: 'copHP', label: 'COP como bomba de calor', digits: 2, show: isRefrig },
    { id: 'qL', label: 'Efeito refrigerante q_L', unit: 'kJ/kg', digits: 1, show: isRefrig },
    { id: 'wc', label: 'Trabalho do compressor', unit: 'kJ/kg', digits: 1, show: isRefrig },
    { id: 'qH', label: 'Calor rejeitado q_H', unit: 'kJ/kg', digits: 1, show: isRefrig },
    { id: 'xv', label: 'Título após a válvula', digits: 3, show: isRefrig },
    { id: 'T2', label: 'Descarga do compressor', unit: '°C', digits: 1, show: isRefrig },
    { id: 'Pe', label: 'Pressão de evaporação', unit: 'kPa', digits: 0, show: isRefrig },
    { id: 'Pk', label: 'Pressão de condensação', unit: 'kPa', digits: 0, show: isRefrig },
    { id: 'mdot', label: 'Vazão de R-134a', unit: 'kg/s', digits: 3, show: isRefrig },
    { id: 'Wc', label: 'Potência do compressor', unit: 'kW', digits: 2, show: isRefrig },
  ],
  compute(p) {
    if (isRefrig(p)) {
      const r = refrigState(p);
      return {
        ...ZERO,
        cop: r.cop,
        copC: r.copC,
        copHP: r.copHP,
        qL: r.qL,
        wc: r.wc,
        qH: r.qH,
        xv: r.xv,
        T2: r.T2,
        Pe: r.Pe,
        Pk: r.Pk,
        mdot: r.mdot,
        Wc: r.Wc,
      };
    }
    const k = rankineState(p);
    return {
      ...ZERO,
      eta: k.eta * 100,
      etaC: k.etaC * 100,
      wnet: k.wnet,
      qin: k.qin,
      qout: k.qout,
      wt: k.wt,
      wp: k.wp,
      xt: k.xt,
      Tcond: k.Tcond,
      bwr: k.bwr * 100,
      prh: k.prh / 1000,
      y: k.y * 100,
      pext: k.pext,
      invalid: k.invalid,
    };
  },
  experiments: [
    {
      label: 'Rankine simples',
      preset: { cyc: 0, mod: 0, pb: 2, t3: 450, pc: 10, etat: 100 },
      text: 'Siga a água: a **bomba** quase não gasta trabalho (líquido é quase incompressível), a **caldeira** aquece, vaporiza e superaquece, a **turbina** expande e o **condensador** fecha o ciclo. Dentro da **cúpula** do T–s, líquido e vapor convivem a temperatura constante.',
    },
    {
      label: 'Vácuo no condensador',
      preset: { cyc: 0, mod: 0, pb: 4, t3: 400, pc: 50, etat: 100 },
      text: 'Baixe a pressão do condensador de 50 para 10 kPa: a água condensa mais fria e o **rendimento sobe**. Em troca, o vapor sai da turbina **mais úmido** (título menor).',
    },
    {
      label: 'Caldeira de alta pressão',
      preset: { cyc: 0, mod: 0, pb: 15, t3: 600, pc: 10, etat: 100 },
      text: 'A 15 MPa e 600 °C o rendimento passa de 40 %, mas o vapor sai da turbina com cerca de **20 % de gotas** — elas erodem as últimas fileiras de pás.',
    },
    {
      label: 'Reaquecimento',
      preset: { cyc: 0, mod: 1, pb: 15, t3: 600, pc: 10, etat: 100 },
      text: 'O vapor expande até 1/4 da pressão, **volta à caldeira** e é reaquecido a 600 °C antes da turbina de baixa. O **título** na saída sobe muito; o rendimento, só um pouco.',
    },
    {
      label: 'Regeneração',
      preset: { cyc: 0, mod: 2, pb: 15, t3: 600, pc: 10, etat: 100 },
      text: 'Vapor **extraído** da turbina aquece a água de alimentação num aquecedor aberto. O trabalho por kg de vapor cai, mas o **rendimento sobe**: o calor da caldeira entra a uma temperatura média maior.',
    },
    {
      label: 'Turbina real',
      preset: { cyc: 0, mod: 0, pb: 4, t3: 400, pc: 10, etat: 85 },
      text: 'Com eficiência isentrópica de 85 %, a expansão **gera entropia**: a linha 3→4 tomba para a direita no T–s, o trabalho cai e o vapor sai **mais seco**.',
    },
    {
      label: 'Refrigerador (R-134a)',
      preset: { cyc: 1, te: -10, tc: 40, cap: 5 },
      text: 'O R-134a **evapora** a baixa pressão roubando calor da câmara (q_L), o **compressor** eleva a pressão, o **condensador** rejeita q_H = q_L + w e a **válvula** derruba a pressão a **entalpia constante** (reta vertical no P–h).',
    },
    {
      label: 'Congelador × ar-condicionado',
      preset: { cyc: 1, te: -25, tc: 45, cap: 5 },
      text: 'Quanto maior a distância entre a evaporação e a condensação, **menor o COP**. Suba a evaporação para 5 °C (ar-condicionado) e compare o COP e a potência do compressor.',
    },
  ],
};
