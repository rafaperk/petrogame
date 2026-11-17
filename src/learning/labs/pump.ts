/**
 * Bancada da bomba centrífuga: curva da bomba × curva do sistema, rendimento, potência, leis de afinidade,
 * NPSH disponível × requerido (cavitação) e escorva.
 *
 * Bomba de referência a 1.750 rpm: H = 52 − 0,0012·Q² (Q em m³/h, H em m); potência no eixo
 * P = 7 + 0,0697·Q kW (mínima na vazão nula, como numa bomba radial). Leis de afinidade com r = n/1750:
 * H(Q) = r²·52 − 0,0012·Q² · P(Q) = r³·7 + r²·0,0697·Q · NPSHr = 2·r² + 0,00025·Q².
 * Sistema: H = 15 m (estática) + K·Q², com K = 0,0008 (tubulação) + 0,0004/a² (válvula com abertura a).
 */
import { clamp, interp, type LabModel } from './model';
import type { LabValues } from '../types';

export const PUMP = {
  n0: 1750,
  h0: 52,
  a: 0.0012,
  p0: 7,
  pk: 0.0697,
  hStatic: 15,
  kPipe: 0.0008,
  kValve: 0.0004,
  kSuction: 0.00015,
  hAtm: 10.33,
  npshr0: 2,
  npshrK: 0.00025,
  /** ρ do ar / ρ da água: sem escorva, a bomba "bombeia ar" e quase não gera altura. */
  airRatio: 0.0012,
  qMax: 200,
} as const;

/** Pressão de vapor da água em metros de coluna (ρg ≈ 9,81 kN/m³). */
const PV_TABLE: readonly (readonly [number, number])[] = [
  [10, 0.125],
  [20, 0.24],
  [30, 0.43],
  [40, 0.75],
  [50, 1.26],
  [60, 2.03],
  [70, 3.17],
  [80, 4.83],
  [90, 7.15],
  [95, 8.65],
  [100, 10.33],
];
export const vaporHead = (tempC: number) => interp(PV_TABLE, tempC);

export const speedRatio = (p: LabValues) => p.rpm / PUMP.n0;
/** Altura da bomba na rotação atual (sem cavitação). */
export const pumpHead = (q: number, r: number) => r * r * PUMP.h0 - PUMP.a * q * q;
export const pumpPower = (q: number, r: number) => r ** 3 * PUMP.p0 + r * r * PUMP.pk * q;
export const hydraulicPower = (q: number, h: number) => (9.81 * (q / 3600) * h); // kW (ρ = 1000)
export const efficiency = (q: number, r: number) => {
  const h = pumpHead(q, r);
  return h > 0 ? hydraulicPower(q, h) / pumpPower(q, r) : 0;
};
export const systemK = (valvePct: number) => PUMP.kPipe + PUMP.kValve / Math.max(0.0001, (valvePct / 100) ** 2);
export const systemHead = (q: number, valvePct: number) => PUMP.hStatic + systemK(valvePct) * q * q;
export const npshRequired = (q: number, r: number) => PUMP.npshr0 * r * r + PUMP.npshrK * q * q;
export const npshAvailable = (q: number, p: LabValues) => PUMP.hAtm + p.zs - PUMP.kSuction * q * q - vaporHead(p.temp);

/** Vazão de melhor rendimento (BEP) na rotação r — proporcional a r (afinidade). */
let bep0 = 0;
export function bepFlow(r: number): number {
  if (!bep0) {
    let best = 0;
    for (let q = 1; q < 180; q += 0.25) {
      const e = efficiency(q, 1);
      if (e > best) {
        best = e;
        bep0 = q;
      }
    }
  }
  return bep0 * r;
}

/** Fator de queda de altura pela cavitação (0 = nenhuma). A 1ª queda (3%) é a própria definição do NPSHr. */
function headDrop(deficit: number): number {
  return deficit > 0 ? clamp(0.03 + 0.075 * deficit, 0, 0.6) : 0;
}

export interface PumpPoint {
  q: number;
  h: number;
  drop: number;
}

/** Ponto de operação: interseção da curva da bomba (degradada pela cavitação, se houver) com a do sistema. */
export function operatingPoint(p: LabValues): PumpPoint {
  const r = speedRatio(p);
  if (!p.primed) return { q: 0, h: r * r * PUMP.h0 * PUMP.airRatio, drop: 0 };
  if (p.valve < 1) return { q: 0, h: r * r * PUMP.h0, drop: 0 };
  const k = systemK(p.valve);
  let drop = 0;
  let q = 0;
  for (let i = 0; i < 40; i++) {
    const shut = r * r * PUMP.h0 * (1 - drop);
    q = shut <= PUMP.hStatic ? 0 : Math.sqrt((shut - PUMP.hStatic) / (PUMP.a * (1 - drop) + k));
    const deficit = npshRequired(q, r) - npshAvailable(q, p);
    drop = 0.6 * drop + 0.4 * headDrop(deficit);
  }
  const h = q > 0 ? systemHead(q, p.valve) : r * r * PUMP.h0 * (1 - drop);
  return { q, h, drop };
}

export const pumpModel: LabModel = {
  id: 'pump',
  name: 'Bomba centrífuga',
  icon: '🌀',
  summary:
    'Por dentro da bomba: o rotor joga o líquido para fora, a voluta transforma velocidade em pressão. Mexa na rotação, na válvula, no nível de sucção e na temperatura e veja o **ponto de operação** e o **NPSH** mudarem.',
  params: [
    { id: 'rpm', label: 'Rotação', min: 1200, max: 2100, step: 50, default: 1750, unit: 'rpm', digits: 0 },
    { id: 'valve', label: 'Válvula de descarga', min: 0, max: 100, step: 5, default: 60, unit: '%', digits: 0, help: 'Abertura da válvula de descarga (0 = fechada / shutoff).' },
    { id: 'zs', label: 'Nível da sucção', min: -6, max: 6, step: 0.5, default: 1, unit: 'm', digits: 1, help: 'Altura do nível do tanque de sucção em relação ao eixo da bomba. Positivo = bomba afogada.' },
    { id: 'temp', label: 'Temperatura da água', min: 20, max: 95, step: 5, default: 25, unit: '°C', digits: 0, help: 'Água mais quente tem pressão de vapor maior.' },
    { id: 'primed', label: 'Escorva', min: 0, max: 1, step: 1, default: 1, choices: ['Sem escorva (ar)', 'Escorvada'] },
  ],
  outputs: [
    { id: 'Q', label: 'Vazão', unit: 'm³/h', digits: 1 },
    { id: 'H', label: 'Altura manométrica', unit: 'm', digits: 1 },
    { id: 'P', label: 'Potência no eixo', unit: 'kW', digits: 1 },
    { id: 'eta', label: 'Rendimento', unit: '%', digits: 0 },
    { id: 'npshd', label: 'NPSH disponível', unit: 'm', digits: 2 },
    { id: 'npshr', label: 'NPSH requerido', unit: 'm', digits: 2 },
    { id: 'margin', label: 'Margem (NPSHd − NPSHr)', unit: 'm', digits: 2 },
    { id: 'cav', label: 'Cavitação', hidden: true },
    { id: 'drop', label: 'Queda de altura pela cavitação', unit: '%', digits: 0, hidden: true },
    { id: 'Hshut', label: 'Altura em shutoff', unit: 'm', digits: 1, hidden: true },
    { id: 'bep', label: 'Vazão do BEP', unit: 'm³/h', digits: 0, hidden: true },
  ],
  compute(p) {
    const r = speedRatio(p);
    const op = operatingPoint(p);
    const P = p.primed ? pumpPower(op.q, r) : pumpPower(0, r) * 0.15;
    const eta = op.q > 0 ? hydraulicPower(op.q, op.h) / P : 0;
    const npshd = npshAvailable(op.q, p);
    const npshr = npshRequired(op.q, r);
    const margin = npshd - npshr;
    return {
      Q: op.q,
      H: op.h,
      P,
      eta: eta * 100,
      npshd,
      npshr,
      margin,
      cav: p.primed && op.q > 0 && margin < 0 ? 1 : 0,
      drop: op.drop * 100,
      Hshut: p.primed ? r * r * PUMP.h0 : r * r * PUMP.h0 * PUMP.airRatio,
      bep: bepFlow(r),
    };
  },
  experiments: [
    { label: 'Estrangular a descarga', preset: { valve: 25 }, text: 'Feche a válvula aos poucos: o ponto de operação **sobe pela curva da bomba** (menos vazão, mais altura).' },
    { label: 'Shutoff', preset: { valve: 0 }, text: 'Válvula fechada: vazão zero, altura máxima e **potência mínima** — por isso a partida é com a descarga fechada. Mas não deixe assim: a energia vira calor.' },
    { label: 'Leis de afinidade', preset: { rpm: 2100, valve: 100 }, text: 'Compare a curva tracejada (1.750 rpm) com a nova: **Q ∝ n**, **H ∝ n²**, **P ∝ n³**.' },
    { label: 'Água quente na sucção', preset: { temp: 90, zs: -1, valve: 100 }, text: 'A pressão de vapor sobe, o **NPSH disponível cai** e a bomba cavita: bolhas nascem na entrada do rotor e implodem mais adiante.' },
    { label: 'Bomba sem escorva', preset: { primed: 0 }, text: 'Com ar na carcaça, o rotor gira mas a altura gerada é ~1.000 vezes menor (ρ do ar ≪ ρ da água): não bombeia.' },
  ],
};
