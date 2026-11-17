/**
 * Bancada do trocador de calor bitubular (água quente no tubo interno, água fria no anular):
 * escoamento paralelo × contracorrente, perfis de temperatura, MLDT, efetividade (ε-NUT) e incrustação.
 */
import type { LabModel } from './model';
import type { LabValues } from '../types';

export const EXCH = {
  cp: 4.18, // kJ/(kg·K)
  uClean: 1.0, // kW/(m²·K)
  rFoul: 0.8, // m²·K/kW (resistência de incrustação somada)
} as const;

export interface ExchangerState {
  ch: number;
  cc: number;
  cmin: number;
  cr: number;
  ua: number;
  ntu: number;
  eff: number;
  q: number;
  tho: number;
  tco: number;
  dt1: number;
  dt2: number;
  lmtd: number;
  counter: boolean;
}

export function lmtdOf(dt1: number, dt2: number): number {
  if (dt1 <= 0 || dt2 <= 0) return 0;
  if (Math.abs(dt1 - dt2) < 1e-6) return dt1;
  return (dt1 - dt2) / Math.log(dt1 / dt2);
}

export function exchanger(p: LabValues): ExchangerState {
  const counter = p.arr >= 1;
  const ch = p.mh * EXCH.cp;
  const cc = p.mc * EXCH.cp;
  const cmin = Math.min(ch, cc);
  const cmax = Math.max(ch, cc);
  const cr = cmin / cmax;
  const u = p.foul >= 1 ? 1 / (1 / EXCH.uClean + EXCH.rFoul) : EXCH.uClean;
  const ua = u * p.area;
  const ntu = ua / cmin;
  let eff: number;
  if (counter) {
    eff = Math.abs(1 - cr) < 1e-9 ? ntu / (1 + ntu) : (1 - Math.exp(-ntu * (1 - cr))) / (1 - cr * Math.exp(-ntu * (1 - cr)));
  } else {
    eff = (1 - Math.exp(-ntu * (1 + cr))) / (1 + cr);
  }
  const q = eff * cmin * (p.thi - p.tci);
  const tho = p.thi - q / ch;
  const tco = p.tci + q / cc;
  const dt1 = counter ? p.thi - tco : p.thi - p.tci;
  const dt2 = counter ? tho - p.tci : tho - tco;
  return { ch, cc, cmin, cr, ua, ntu, eff, q, tho, tco, dt1, dt2, lmtd: lmtdOf(dt1, dt2), counter };
}

/**
 * Temperaturas ao longo do trocador (x de 0 a 1; o quente entra em x = 0).
 * Paralelo: o frio também entra em x = 0. Contracorrente: o frio entra em x = 1.
 */
export function profiles(p: LabValues, n = 48): { x: number[]; th: number[]; tc: number[] } {
  const st = exchanger(p);
  const x: number[] = [];
  const th: number[] = [];
  const tc: number[] = [];
  const theta0 = st.counter ? p.thi - st.tco : p.thi - p.tci;
  const k = st.counter ? st.ua * (1 / st.ch - 1 / st.cc) : st.ua * (1 / st.ch + 1 / st.cc);
  for (let i = 0; i <= n; i++) {
    const xi = i / n;
    // ∫θ dx de 0 a x, com θ(x) = θ0·e^(−k·x)
    const integ = Math.abs(k) < 1e-9 ? theta0 * xi : (theta0 * (1 - Math.exp(-k * xi))) / k;
    const thx = p.thi - (st.ua / st.ch) * integ;
    const tcx = st.counter ? st.tco - (st.ua / st.cc) * integ : p.tci + (st.ua / st.cc) * integ;
    x.push(xi);
    th.push(thx);
    tc.push(tcx);
  }
  return { x, th, tc };
}

export const exchangerModel: LabModel = {
  id: 'exchanger',
  name: 'Trocador de calor',
  icon: '♨️',
  summary:
    'Um trocador **bitubular**: água quente no tubo de dentro, água fria no espaço anular. Troque o arranjo, as vazões e a área e veja os **perfis de temperatura**, a **MLDT** e o calor trocado.',
  params: [
    { id: 'arr', label: 'Arranjo', min: 0, max: 1, step: 1, default: 0, choices: ['Paralelo', 'Contracorrente'] },
    { id: 'thi', label: 'Entrada da água quente', min: 50, max: 95, step: 5, default: 90, unit: '°C', digits: 0 },
    { id: 'tci', label: 'Entrada da água fria', min: 10, max: 40, step: 5, default: 20, unit: '°C', digits: 0 },
    { id: 'mh', label: 'Vazão de água quente', min: 0.05, max: 1, step: 0.05, default: 0.3, unit: 'kg/s', digits: 2 },
    { id: 'mc', label: 'Vazão de água fria', min: 0.05, max: 1, step: 0.05, default: 0.3, unit: 'kg/s', digits: 2 },
    { id: 'area', label: 'Área de troca', min: 0.5, max: 8, step: 0.5, default: 2, unit: 'm²', digits: 1, help: 'Comprimento do trocador (U = 1,0 kW/m²·K limpo).' },
    { id: 'foul', label: 'Superfície', min: 0, max: 1, step: 1, default: 0, choices: ['Limpa', 'Incrustada'] },
  ],
  outputs: [
    { id: 'q', label: 'Calor trocado', unit: 'kW', digits: 1 },
    { id: 'tho', label: 'Saída da água quente', unit: '°C', digits: 1 },
    { id: 'tco', label: 'Saída da água fria', unit: '°C', digits: 1 },
    { id: 'dt1', label: 'ΔT₁ (extremidade 1)', unit: '°C', digits: 1 },
    { id: 'dt2', label: 'ΔT₂ (extremidade 2)', unit: '°C', digits: 1 },
    { id: 'lmtd', label: 'MLDT', unit: '°C', digits: 1 },
    { id: 'eff', label: 'Efetividade ε', unit: '%', digits: 0 },
    { id: 'ntu', label: 'NUT', digits: 2 },
    { id: 'U', label: 'U', unit: 'kW/m²·K', digits: 2 },
    { id: 'cross', label: 'Saída fria − saída quente', unit: '°C', digits: 1, hidden: true },
  ],
  compute(p) {
    const st = exchanger(p);
    return {
      q: st.q,
      tho: st.tho,
      tco: st.tco,
      dt1: st.dt1,
      dt2: st.dt2,
      lmtd: st.lmtd,
      eff: st.eff * 100,
      ntu: st.ntu,
      U: st.ua / p.area,
      cross: st.tco - st.tho,
    };
  },
  experiments: [
    { label: 'Paralelo', preset: { arr: 0 }, text: 'Os dois entram do mesmo lado: o ΔT começa enorme e **despenca**. A saída fria nunca passa da saída quente.' },
    { label: 'Contracorrente', preset: { arr: 1 }, text: 'Sentidos opostos: o ΔT fica mais **uniforme**, a MLDT é maior e a troca, também. A água fria pode sair **mais quente** que a quente sai.' },
    { label: 'Capacidades iguais', preset: { arr: 1, mh: 0.3, mc: 0.3 }, text: 'Em contracorrente com ṁ·cp iguais, as retas ficam **paralelas**: ΔT constante e MLDT = ΔT.' },
    { label: 'Área grande', preset: { area: 8 }, text: 'Mais área, mais troca — mas com retorno decrescente: as curvas se aproximam e o ΔT some.' },
    { label: 'Incrustação', preset: { foul: 1 }, text: 'A incrustação é uma **resistência térmica a mais**: U cai e o calor trocado também.' },
  ],
};
