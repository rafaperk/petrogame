/**
 * Bancada do diagrama ferro-carbono (Fe–Fe₃C, metaestável): campos de fase, regra da alavanca,
 * microconstituintes no resfriamento lento (ferrita/cementita proeutetoide, perlita, ledeburita) e têmpera.
 *
 * Pontos (como nos livros-texto): fusão do Fe 1.538 °C · peritético 1.495 °C (δ 0,09 · γ 0,17 · L 0,53 %C) ·
 * δ/γ 1.394 °C · α/γ 912 °C · eutético 4,30 %C a 1.148 °C (γ máx. 2,11 %C) · eutetoide 0,76 %C a 727 °C
 * (α máx. 0,022 %C) · cementita 6,67 %C. As linhas entre os pontos são aproximadas por retas.
 */
import { clamp, type LabModel } from './model';
import type { LabValues } from '../types';

export const FEC = {
  cMax: 6.67,
  tMelt: 1538,
  tPerit: 1495,
  cDeltaPerit: 0.09,
  cGammaPerit: 0.17,
  cLiqPerit: 0.53,
  tDeltaGamma: 1394,
  tA3Fe: 912,
  tEut: 1148,
  cEut: 4.3,
  cGammaMax: 2.11,
  tEutd: 727,
  cEutd: 0.76,
  cAlphaMax: 0.022,
  tCemLiq: 1250,
  tMin: 300,
} as const;

export enum Region {
  L = 1,
  LDelta,
  Delta,
  DeltaGamma,
  LGamma,
  Gamma,
  AlphaGamma,
  Alpha,
  GammaFe3C,
  AlphaFe3C,
  LFe3C,
}

export const REGION_INFO: Record<Region, { name: string; phases: string; note: string }> = {
  [Region.L]: { name: 'L', phases: 'Líquido', note: 'Tudo fundido.' },
  [Region.LDelta]: { name: 'L + δ', phases: 'Líquido + ferrita δ', note: 'Solidificação da ferrita δ (alta temperatura, pouco cobrada).' },
  [Region.Delta]: { name: 'δ', phases: 'Ferrita δ (CCC)', note: 'Ferrita de alta temperatura, cúbica de corpo centrado.' },
  [Region.DeltaGamma]: { name: 'δ + γ', phases: 'Ferrita δ + austenita', note: 'Faixa estreita perto do peritético.' },
  [Region.LGamma]: { name: 'L + γ', phases: 'Líquido + austenita', note: 'A austenita solidifica primeiro; o líquido restante enriquece em carbono.' },
  [Region.Gamma]: { name: 'γ', phases: 'Austenita (CFC)', note: 'Campo de austenitização: CFC dissolve até 2,11 %C. É daqui que partem os tratamentos térmicos.' },
  [Region.AlphaGamma]: { name: 'α + γ', phases: 'Ferrita + austenita', note: 'Entre A₃ e A₁: a ferrita proeutetoide nasce nos contornos da austenita.' },
  [Region.Alpha]: { name: 'α', phases: 'Ferrita (CCC)', note: 'Ferrita: CCC, dissolve no máximo 0,022 %C (a 727 °C). Mole e dúctil.' },
  [Region.GammaFe3C]: { name: 'γ + Fe₃C', phases: 'Austenita + cementita', note: 'Entre Acm e A₁: a cementita proeutetoide forma uma rede nos contornos de grão.' },
  [Region.AlphaFe3C]: { name: 'α + Fe₃C', phases: 'Ferrita + cementita', note: 'Abaixo de 727 °C: as fases são sempre ferrita e cementita; o que muda é o arranjo (perlita, proeutetoides).' },
  [Region.LFe3C]: { name: 'L + Fe₃C', phases: 'Líquido + cementita', note: 'Ferro fundido hipereutético: cementita primária no líquido.' },
};

/** Composições das linhas do diagrama em função da temperatura (retas entre os pontos notáveis). */
export const lines = {
  /** Liquidus (A–B–C–D). */
  liquidus(c: number): number {
    if (c <= FEC.cLiqPerit) return FEC.tMelt - ((FEC.tMelt - FEC.tPerit) * c) / FEC.cLiqPerit;
    if (c <= FEC.cEut) return FEC.tPerit - ((FEC.tPerit - FEC.tEut) * (c - FEC.cLiqPerit)) / (FEC.cEut - FEC.cLiqPerit);
    return FEC.tEut + ((FEC.tCemLiq - FEC.tEut) * (c - FEC.cEut)) / (FEC.cMax - FEC.cEut);
  },
  /** %C do líquido em equilíbrio na temperatura t (ramo B–C, 1.148–1.495 °C). */
  liqBC: (t: number) => FEC.cLiqPerit + ((FEC.cEut - FEC.cLiqPerit) * (FEC.tPerit - t)) / (FEC.tPerit - FEC.tEut),
  /** Ramo A–B do liquidus (acima do peritético). */
  liqAB: (t: number) => (FEC.cLiqPerit * (FEC.tMelt - t)) / (FEC.tMelt - FEC.tPerit),
  /** Ramo C–D (líquido em equilíbrio com cementita). */
  liqCD: (t: number) => FEC.cEut + ((FEC.cMax - FEC.cEut) * (t - FEC.tEut)) / (FEC.tCemLiq - FEC.tEut),
  /** Solidus da ferrita δ (A–H). */
  solDelta: (t: number) => (FEC.cDeltaPerit * (FEC.tMelt - t)) / (FEC.tMelt - FEC.tPerit),
  /** Solidus da austenita (J–E). */
  solGamma: (t: number) => FEC.cGammaPerit + ((FEC.cGammaMax - FEC.cGammaPerit) * (FEC.tPerit - t)) / (FEC.tPerit - FEC.tEut),
  /** Limites δ/(δ+γ) e (δ+γ)/γ (N–H e N–J). */
  deltaRight: (t: number) => (FEC.cDeltaPerit * (t - FEC.tDeltaGamma)) / (FEC.tPerit - FEC.tDeltaGamma),
  gammaLeft: (t: number) => (FEC.cGammaPerit * (t - FEC.tDeltaGamma)) / (FEC.tPerit - FEC.tDeltaGamma),
  /** A₃ (G–S): austenita em equilíbrio com ferrita. */
  a3: (t: number) => (FEC.cEutd * (FEC.tA3Fe - t)) / (FEC.tA3Fe - FEC.tEutd),
  /** Acm (S–E): solubilidade do C na austenita. */
  acm: (t: number) => FEC.cEutd + ((FEC.cGammaMax - FEC.cEutd) * (t - FEC.tEutd)) / (FEC.tEut - FEC.tEutd),
  /** Limite da ferrita acima de 727 °C (G–P). */
  alphaHigh: (t: number) => (FEC.cAlphaMax * (FEC.tA3Fe - t)) / (FEC.tA3Fe - FEC.tEutd),
  /** Temperatura da A₃ para um teor c (0 a 0,76 %C). */
  a3inv: (c: number) => FEC.tA3Fe - ((FEC.tA3Fe - FEC.tEutd) * c) / FEC.cEutd,
  /** Temperatura da Acm para um teor c (0,76 a 2,11 %C). */
  acmInv: (c: number) => FEC.tEutd + ((FEC.tEut - FEC.tEutd) * (c - FEC.cEutd)) / (FEC.cGammaMax - FEC.cEutd),
  /** Solvus da ferrita abaixo de 727 °C (P–Q), aproximado. */
  alphaLow: (t: number) => (FEC.cAlphaMax * clamp(t - 200, 0, 527)) / 527,
};

export function regionOf(c: number, t: number): Region {
  if (t >= lines.liquidus(c)) return Region.L;
  if (t > FEC.tEut) {
    if (c >= FEC.cEut) return Region.LFe3C;
    if (t >= FEC.tPerit) return c <= lines.solDelta(t) ? Region.Delta : Region.LDelta;
    if (c > lines.solGamma(t)) return Region.LGamma;
    if (t > FEC.tDeltaGamma) {
      if (c < lines.deltaRight(t)) return Region.Delta;
      if (c < lines.gammaLeft(t)) return Region.DeltaGamma;
    }
    return Region.Gamma;
  }
  if (t > FEC.tEutd) {
    if (t < FEC.tA3Fe && c < lines.alphaHigh(t)) return Region.Alpha;
    if (t < FEC.tA3Fe && c < lines.a3(t)) return Region.AlphaGamma;
    if (c <= lines.acm(t)) return Region.Gamma;
    return Region.GammaFe3C;
  }
  return c < lines.alphaLow(t) ? Region.Alpha : Region.AlphaFe3C;
}

export interface TieLine {
  /** Composições das duas fases nas pontas da linha de amarração. */
  left: number;
  right: number;
  leftPhase: string;
  rightPhase: string;
  /** Fração da fase da direita (regra da alavanca). */
  fRight: number;
}

const lever = (c: number, left: number, right: number) => clamp((c - left) / (right - left), 0, 1);

/** Linha de amarração e regra da alavanca nos campos bifásicos (null nos monofásicos). */
export function tieLine(c: number, t: number): TieLine | null {
  const r = regionOf(c, t);
  const mk = (left: number, right: number, leftPhase: string, rightPhase: string): TieLine => ({ left, right, leftPhase, rightPhase, fRight: lever(c, left, right) });
  switch (r) {
    case Region.LDelta:
      return mk(lines.solDelta(t), lines.liqAB(t), 'δ', 'L');
    case Region.DeltaGamma:
      return mk(lines.deltaRight(t), lines.gammaLeft(t), 'δ', 'γ');
    case Region.LGamma:
      return mk(lines.solGamma(t), lines.liqBC(t), 'γ', 'L');
    case Region.LFe3C:
      return mk(lines.liqCD(t), FEC.cMax, 'L', 'Fe₃C');
    case Region.AlphaGamma:
      return mk(lines.alphaHigh(t), lines.a3(t), 'α', 'γ');
    case Region.GammaFe3C:
      return mk(Math.min(lines.acm(t), FEC.cGammaMax), FEC.cMax, 'γ', 'Fe₃C');
    case Region.AlphaFe3C:
      return mk(lines.alphaLow(t), FEC.cMax, 'α', 'Fe₃C');
    default:
      return null;
  }
}

/** Frações (0–100) das fases e dos microconstituintes no resfriamento lento (ou após a têmpera). */
export function fecState(p: LabValues): Record<string, number> {
  const c = clamp(p.c, 0, FEC.cMax);
  const t = p.t;
  const r = regionOf(c, t);
  const tie = tieLine(c, t);
  const out: Record<string, number> = {
    region: r,
    fL: 0,
    fDelta: 0,
    fGamma: 0,
    fAlpha: 0,
    fFe3C: 0,
    fPerlita: 0,
    fFerritaPro: 0,
    fCementitaPro: 0,
    fLedeburita: 0,
    fCemPrim: 0,
    fMart: 0,
    cLeft: tie?.left ?? c,
    cRight: tie?.right ?? c,
    cNow: c,
    tNow: t,
  };
  const phase: Record<string, string> = { L: 'fL', δ: 'fDelta', γ: 'fGamma', α: 'fAlpha', 'Fe₃C': 'fFe3C' };
  if (tie) {
    out[phase[tie.leftPhase]] = (1 - tie.fRight) * 100;
    out[phase[tie.rightPhase]] = tie.fRight * 100;
  } else {
    const single: Partial<Record<Region, string>> = { [Region.L]: 'fL', [Region.Delta]: 'fDelta', [Region.Gamma]: 'fGamma', [Region.Alpha]: 'fAlpha' };
    out[single[r] ?? 'fGamma'] = 100;
  }

  // Microconstituintes (resfriamento lento a partir da austenita)
  const { cEutd: e, cAlphaMax: a, cMax: m, cGammaMax: gmax, cEut } = FEC;
  if (t <= FEC.tEutd) {
    if (c <= a) {
      out.fFerritaPro = 100;
    } else if (c < e) {
      out.fPerlita = lever(c, a, e) * 100;
      out.fFerritaPro = 100 - out.fPerlita;
    } else if (c <= gmax) {
      out.fCementitaPro = lever(c, e, m) * 100;
      out.fPerlita = 100 - out.fCementitaPro;
    } else if (c <= cEut) {
      const led = lever(c, gmax, cEut);
      const pro = 1 - led; // austenita proeutética → perlita + cementita proeutetoide
      out.fLedeburita = led * 100;
      out.fCementitaPro = pro * lever(gmax, e, m) * 100;
      out.fPerlita = pro * (1 - lever(gmax, e, m)) * 100;
    } else {
      out.fCemPrim = lever(c, cEut, m) * 100;
      out.fLedeburita = 100 - out.fCemPrim;
    }
    if (p.cool >= 1 && c > a && c <= gmax) {
      // têmpera: a austenita vira martensita (fora do equilíbrio; a cementita proeutetoide já formada fica)
      out.fMart = 100 - out.fCementitaPro;
      out.fPerlita = 0;
      out.fFerritaPro = 0;
    }
  } else if (t < FEC.tEut && c > gmax) {
    // ferro fundido entre 727 e 1.148 °C: ledeburita (γ + Fe₃C eutética) + austenita proeutética ou cementita primária
    if (c <= cEut) out.fLedeburita = lever(c, gmax, cEut) * 100;
    else {
      out.fCemPrim = lever(c, cEut, m) * 100;
      out.fLedeburita = 100 - out.fCemPrim;
    }
  } else if (r === Region.AlphaGamma) {
    out.fFerritaPro = out.fAlpha;
  } else if (r === Region.GammaFe3C) {
    out.fCementitaPro = out.fFe3C;
  }
  return out;
}

export const fecModel: LabModel = {
  id: 'fec',
  name: 'Diagrama ferro-carbono',
  icon: '🔥',
  summary:
    'Arraste o ponto pelo diagrama (ou use os controles): veja as **fases**, a **regra da alavanca** e, no microscópio, a **microestrutura** — ferrita, perlita, cementita, martensita.',
  params: [
    { id: 'c', label: 'Carbono', min: 0, max: 6.67, step: 0.01, default: 0.4, unit: '%C', digits: 2 },
    { id: 't', label: 'Temperatura', min: FEC.tMin, max: 1600, step: 1, default: 900, unit: '°C', digits: 0 },
    { id: 'view', label: 'Mostrar', min: 0, max: 1, step: 1, default: 0, choices: ['Aços (até 2,2 %C)', 'Diagrama completo'] },
    { id: 'cool', label: 'Resfriamento', min: 0, max: 1, step: 1, default: 0, choices: ['Lento (equilíbrio)', 'Têmpera (rápido)'] },
  ],
  outputs: [
    { id: 'fAlpha', label: 'Ferrita α', unit: '%', digits: 0 },
    { id: 'fGamma', label: 'Austenita γ', unit: '%', digits: 0 },
    { id: 'fFe3C', label: 'Cementita Fe₃C', unit: '%', digits: 0 },
    { id: 'fL', label: 'Líquido', unit: '%', digits: 0 },
    { id: 'fDelta', label: 'Ferrita δ', unit: '%', digits: 0, hidden: true },
    { id: 'fPerlita', label: 'Perlita', unit: '%', digits: 0 },
    { id: 'fFerritaPro', label: 'Ferrita proeutetoide', unit: '%', digits: 0 },
    { id: 'fCementitaPro', label: 'Cementita proeutetoide', unit: '%', digits: 0 },
    { id: 'fLedeburita', label: 'Ledeburita', unit: '%', digits: 0, hidden: true },
    { id: 'fCemPrim', label: 'Cementita primária', unit: '%', digits: 0, hidden: true },
    { id: 'fMart', label: 'Martensita', unit: '%', digits: 0, hidden: true },
    { id: 'region', label: 'Campo', hidden: true },
    { id: 'cLeft', label: '%C da fase à esquerda', hidden: true },
    { id: 'cRight', label: '%C da fase à direita', hidden: true },
    { id: 'cNow', label: 'Carbono', unit: '%C', digits: 2, hidden: true },
    { id: 'tNow', label: 'Temperatura', unit: '°C', digits: 0, hidden: true },
  ],
  compute: fecState,
  experiments: [
    { label: 'Aço eutetoide', preset: { c: 0.76, t: 700 }, text: '0,76 %C abaixo de 727 °C: **100% perlita** — lamelas de ferrita e cementita.' },
    { label: 'Hipoeutetoide', preset: { c: 0.4, t: 700 }, text: 'Ferrita proeutetoide (clara) + perlita (listrada). Regra da alavanca: perlita = (0,4 − 0,022)/(0,76 − 0,022) ≈ 51%.' },
    { label: 'Hipereutetoide', preset: { c: 1.2, t: 700 }, text: 'Perlita envolvida por uma **rede de cementita** nos contornos de grão — por isso esses aços são frágeis.' },
    { label: 'Entre A₃ e A₁', preset: { c: 0.4, t: 780 }, text: 'Campo **α + γ**: a linha de amarração mostra a composição de cada fase nas pontas.' },
    { label: 'Austenitização', preset: { c: 0.4, t: 900 }, text: 'Acima de A₃ o aço é **100% austenita** (CFC): o ponto de partida da têmpera, normalização e recozimento.' },
    { label: 'Têmpera', preset: { c: 0.45, t: 400, cool: 1 }, text: 'Resfriamento rápido: o carbono fica preso e nasce a **martensita** (agulhas, muito dura). O diagrama de equilíbrio não prevê isso — é assunto das curvas TTT.' },
    { label: 'Ferro fundido branco', preset: { c: 3.5, t: 600, view: 1 }, text: 'Acima de 2,11 %C: **ledeburita** (o eutético de 4,3 %C) — estrutura dura e quebradiça.' },
  ],
};
