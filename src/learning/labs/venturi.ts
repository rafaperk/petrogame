/**
 * Bancada do Venturi: continuidade + Bernoulli com os três termos (pressão, velocidade e cota),
 * piezômetros (linha piezométrica), Pitot (linha de energia), manômetro diferencial de mercúrio e cavitação.
 *
 * Seções: 1 = entrada (D = 100 mm), 2 = garganta (d), 3 = saída (D = 100 mm).
 * Cotas: z1 = 0, z2 = Δz, z3 = 2·Δz (tubo inclinado por igual). Água a 20 °C.
 */
import { clamp, type LabModel } from './model';
import type { LabValues } from '../types';

export const VENTURI = {
  D: 0.1,
  rho: 1000,
  rhoHg: 13600,
  g: 9.81,
  patm: 101.3,
  /** Pressão de vapor da água a 20 °C, kPa (absoluta). */
  pv: 2.34,
  mu: 0.001,
  /** Perdas do fluido real: contração (× v2²/2g) e difusor (× (v2 − v3)²/2g). */
  kIn: 0.04,
  kOut: 0.15,
} as const;

const area = (d: number) => (Math.PI * d * d) / 4;

export interface VenturiSection {
  z: number;
  v: number;
  /** Pressão manométrica, kPa. */
  p: number;
  /** Carga de pressão p/ρg (m). */
  hp: number;
  /** Carga cinética v²/2g (m). */
  hv: number;
  /** Carga total z + p/ρg + v²/2g (m) — a linha de energia. */
  H: number;
}

export function venturiSections(p: LabValues): { s: [VenturiSection, VenturiSection, VenturiSection]; cav: boolean } {
  const { rho, g } = VENTURI;
  const Q = p.Q / 1000;
  const d2 = p.d2 / 1000;
  const v1 = Q / area(VENTURI.D);
  const v2 = Q / area(d2);
  const v3 = v1;
  const z = [0, p.dz, 2 * p.dz];
  const real = p.real >= 1;
  const loss12 = real ? (VENTURI.kIn * v2 * v2) / (2 * g) : 0;
  const loss23 = real ? (VENTURI.kOut * (v2 - v3) ** 2) / (2 * g) : 0;
  const H1 = z[0] + (p.p1 * 1000) / (rho * g) + (v1 * v1) / (2 * g);
  const H2 = H1 - loss12;
  const H3 = H2 - loss23;
  const make = (zi: number, v: number, H: number): VenturiSection => {
    const hv = (v * v) / (2 * g);
    const hp = H - zi - hv;
    return { z: zi, v, p: (hp * rho * g) / 1000, hp, hv, H };
  };
  const s: [VenturiSection, VenturiSection, VenturiSection] = [make(z[0], v1, H1), make(z[1], v2, H2), make(z[2], v3, H3)];
  // A pressão absoluta não desce abaixo da de vapor: ali o líquido ferve (cavitação).
  const pMin = VENTURI.pv - VENTURI.patm;
  const cav = s[1].p < pMin;
  if (cav) {
    for (const sec of s) {
      if (sec.p < pMin) {
        sec.p = pMin;
        sec.hp = (pMin * 1000) / (rho * g);
      }
    }
  }
  return { s, cav };
}

export const venturiModel: LabModel = {
  id: 'venturi',
  name: 'Venturi e Bernoulli',
  icon: '💧',
  summary:
    'Um tubo de Venturi com piezômetros, tubo de Pitot e manômetro de mercúrio. A **continuidade** acelera o fluido na garganta e o **Bernoulli** cobra a conta na pressão.',
  params: [
    { id: 'Q', label: 'Vazão', min: 0, max: 30, step: 0.5, default: 12, unit: 'L/s', digits: 1 },
    { id: 'd2', label: 'Diâmetro da garganta', min: 40, max: 100, step: 5, default: 50, unit: 'mm', digits: 0, help: 'A entrada e a saída têm 100 mm.' },
    { id: 'p1', label: 'Pressão na entrada', min: 20, max: 150, step: 5, default: 60, unit: 'kPa', digits: 0, help: 'Pressão manométrica na seção 1.' },
    { id: 'dz', label: 'Desnível da garganta', min: 0, max: 3, step: 0.5, default: 0, unit: 'm', digits: 1, help: 'Quanto a garganta fica acima da entrada (a saída sobe o dobro).' },
    { id: 'real', label: 'Fluido', min: 0, max: 1, step: 1, default: 0, choices: ['Ideal (sem perdas)', 'Real (com perdas)'] },
    { id: 'pitot', label: 'Tubo de Pitot', min: 0, max: 1, step: 1, default: 0, choices: ['Esconder', 'Mostrar'] },
  ],
  outputs: [
    { id: 'v1', label: 'Velocidade na entrada', unit: 'm/s', digits: 2 },
    { id: 'v2', label: 'Velocidade na garganta', unit: 'm/s', digits: 2 },
    { id: 'p2', label: 'Pressão na garganta', unit: 'kPa', digits: 1 },
    { id: 'p3', label: 'Pressão na saída', unit: 'kPa', digits: 1 },
    { id: 'dp', label: 'p₁ − p₂', unit: 'kPa', digits: 1 },
    { id: 'dh', label: 'Desnível no mercúrio', unit: 'cm', digits: 1 },
    { id: 'Re', label: 'Reynolds na entrada', digits: 0 },
    { id: 'loss', label: 'Perda de carga total', unit: 'm', digits: 2 },
    { id: 'cav', label: 'Cavitação na garganta', hidden: true },
    { id: 'p1', label: 'Pressão na entrada', unit: 'kPa', digits: 0, hidden: true },
    { id: 'H1', label: 'Carga total na entrada', unit: 'm', digits: 2, hidden: true },
  ],
  compute(p) {
    const { s, cav } = venturiSections(p);
    const { rho, rhoHg, g } = VENTURI;
    // manômetro diferencial: lê a diferença de (p + ρgz) — a cota não entra na leitura
    const piezo1 = s[0].p * 1000 + rho * g * s[0].z;
    const piezo2 = s[1].p * 1000 + rho * g * s[1].z;
    const dh = clamp((piezo1 - piezo2) / ((rhoHg - rho) * g), -10, 10) * 100;
    return {
      v1: s[0].v,
      v2: s[1].v,
      p2: s[1].p,
      p3: s[2].p,
      dp: s[0].p - s[1].p,
      dh,
      Re: (rho * s[0].v * VENTURI.D) / VENTURI.mu,
      loss: s[0].H - s[2].H,
      cav: cav ? 1 : 0,
      p1: s[0].p,
      H1: s[0].H,
    };
  },
  experiments: [
    { label: 'Continuidade', preset: { d2: 50, Q: 12 }, text: 'Metade do diâmetro = **¼ da área** = **4× a velocidade** na garganta (A₁v₁ = A₂v₂).' },
    { label: 'Bernoulli', preset: { d2: 50, Q: 15 }, text: 'Onde a velocidade sobe, a pressão cai: veja a coluna do piezômetro da garganta descer. A **linha de energia** (tracejada) fica reta.' },
    { label: 'Tubo inclinado', preset: { dz: 2, Q: 12 }, text: 'Suba a garganta: a pressão cai mais (gastou carga de posição), mas o **manômetro de mercúrio não muda** — ele só enxerga a velocidade.' },
    { label: 'Fluido real', preset: { real: 1, Q: 20 }, text: 'Com perdas, a linha de energia desce ao longo do tubo e a pressão na saída **não volta** ao valor da entrada.' },
    { label: 'Cavitação na garganta', preset: { Q: 26, d2: 40, p1: 40 }, text: 'Se a pressão na garganta chega à **pressão de vapor**, a água ferve a frio: bolhas que implodem no difusor.' },
    { label: 'Tubo de Pitot', preset: { pitot: 1, Q: 15 }, text: 'O Pitot mede a pressão de **estagnação** (p + ½ρv²): sua coluna sobe até a linha de energia.' },
  ],
};
