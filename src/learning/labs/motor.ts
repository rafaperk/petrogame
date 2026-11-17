/**
 * Bancada de máquinas elétricas: um **motor de indução trifásico** (rotor de gaiola) e um **alternador** (gerador
 * síncrono), com o mesmo estator de três bobinas a 120°.
 *
 * Motor (circuito equivalente por fase, valores típicos de um motor de 7,5 kW, 220/380 V):
 * - as correntes trifásicas criam um **campo girante** que roda na rotação síncrona n_s = 120·f/p;
 * - o rotor gira um pouco mais devagar (escorregamento s = (n_s − n)/n_s): é a diferença que induz corrente nas
 *   barras e gera conjugado; sem diferença não há indução;
 * - o ponto de operação é onde o conjugado do motor iguala o da carga (mais atrito e ventilação);
 * - a carga além do conjugado máximo faz o motor "tombar" (parar com a corrente de partida);
 * - cada bobina foi feita para 220 V: triângulo na rede de 220 V, estrela na de 380 V. Estrela na rede de 220 V dá
 *   127 V por bobina (corrente e conjugado ÷ 3: é a partida estrela-triângulo); triângulo na de 380 V queima o motor;
 * - o inversor de frequência mantém V/f constante até 60 Hz (fluxo nominal); acima disso a tensão fica no máximo e
 *   o fluxo cai (enfraquecimento de campo);
 * - capacitores na rede fornecem a potência reativa de magnetização e melhoram o fator de potência.
 *
 * Alternador: rotor com polos excitados em CC, girado por uma turbina. A frequência é f = p·n/120 e a tensão gerada
 * é proporcional à rotação e ao fluxo (que cresce com a excitação até saturar). Com carga, a reatância síncrona
 * derruba a tensão nos terminais, e a turbina precisa de mais torque (lei de Lenz).
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

export const POLES = [2, 4, 6, 8] as const;
export const F_N = 60;
/** Potência nominal do motor (W) — 10 cv. */
export const P_N = 7500;
/** Tensão nominal de cada bobina do motor (V): placa 220/380 V. */
export const V_WIND = 220;
/** Base do circuito equivalente (VA). */
export const S_BASE = 10000;
/** Impedância de base por fase (Ω): 220 V por bobina, S_BASE/3 por fase. */
export const Z_BASE = (V_WIND * V_WIND) / (S_BASE / 3);
/** Circuito equivalente por fase (pu, a 60 Hz). */
export const R1 = 0.03;
export const X1 = 0.08;
export const R2 = 0.03;
export const X2 = 0.08;
export const XM = 2.4;
/** Barras profundas: a resistência do rotor cresce com a frequência das correntes nele (s·f). */
export const DEEP = 1.0;
/** Perdas no ferro com fluxo e frequência nominais (W). */
export const P_FE = 200;
/** Atrito e ventilação a 1.800 rpm (W); crescem com o quadrado da rotação. */
export const P_MEC = 90;
/** Escorregamento que define o conjugado nominal (100 % de carga). */
export const S_NOM = 0.03;

export const NETS = [220, 380] as const;

// ---------------------------------------------------------------- números complexos (só o necessário)
type Cx = [number, number];
const add = (a: Cx, b: Cx): Cx => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Cx, b: Cx): Cx => [a[0] - b[0], a[1] - b[1]];
const mul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const div = (a: Cx, b: Cx): Cx => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const abs = (a: Cx) => Math.hypot(a[0], a[1]);

/** Rotação síncrona (rpm). */
export const syncRpm = (f: number, p: number) => (120 * f) / p;
/** Frequência gerada (Hz). */
export const genFreq = (n: number, p: number) => (p * n) / 120;

/** Alimentação do motor: tensão em cada bobina e frequência. */
export interface Supply {
  p: number;
  f: number;
  /** Tensão aplicada em cada bobina (V). */
  Vph: number;
  /** Ligação: 0 = triângulo, 1 = estrela. */
  lig: number;
}

export function supplyOf(v: LabValues): Supply {
  const p = POLES[Math.round(v.poles ?? 1)] ?? 4;
  const f = Math.max(1, v.f ?? F_N);
  const net = NETS[Math.round(v.rede ?? 0)] ?? 220;
  const lig = Math.round(v.lig ?? 0);
  const Vnet = lig === 1 ? net / Math.sqrt(3) : net;
  // inversor: V/f constante até 60 Hz; acima disso a tensão para no máximo
  return { p, f, Vph: Vnet * Math.min(1, f / F_N), lig };
}

/** Fluxo relativo ao nominal (1 = 220 V por bobina a 60 Hz). */
export const fluxOf = (s: Supply) => s.Vph / V_WIND / (s.f / F_N);
/** Saturação do ferro: acima do fluxo nominal a reatância de magnetização despenca. */
export const satOf = (psi: number) => 1 / (1 + 5 * Math.max(0, psi - 1) ** 2);

export interface MotorPoint {
  s: number;
  /** Conjugado eletromagnético (N·m). */
  Tem: number;
  /** Corrente de fase (A) e de linha (A). */
  Iph: number;
  IL: number;
  /** Potências de entrada (W, var). */
  P: number;
  Q: number;
  /** Perdas (W). */
  pCu1: number;
  pCu2: number;
  pFe: number;
}

/** Motor em um escorregamento dado (circuito equivalente por fase). */
export function motorAt(sp: Supply, s: number): MotorPoint {
  const k = sp.f / F_N;
  const psi = fluxOf(sp);
  const ss = Math.max(1e-7, s);
  const r1 = R1 * Z_BASE;
  const x1 = X1 * k * Z_BASE;
  const r2 = R2 * Z_BASE * (1 + DEEP * Math.min(1, ss * k));
  const x2 = X2 * k * Z_BASE;
  const xm = XM * k * Z_BASE * satOf(psi);
  const Z2: Cx = [r2 / ss, x2];
  const Zm: Cx = [0, xm];
  const Zp = div(mul(Zm, Z2), add(Zm, Z2));
  const Z1: Cx = [r1, x1];
  const I1 = div([sp.Vph, 0], add(Z1, Zp));
  const E = sub([sp.Vph, 0], mul(I1, Z1));
  const I2 = abs(div(E, Z2));
  const pAg = 3 * I2 * I2 * (r2 / ss);
  const ws = (4 * Math.PI * sp.f) / sp.p;
  const Iph = abs(I1);
  const pFe = P_FE * psi * psi * (0.6 * k + 0.4 * k * k);
  return {
    s: ss,
    Tem: pAg / ws,
    Iph,
    IL: sp.lig === 1 ? Iph : Iph * Math.sqrt(3),
    P: 3 * sp.Vph * I1[0] + pFe,
    Q: -3 * sp.Vph * I1[1],
    pCu1: 3 * Iph * Iph * r1,
    pCu2: ss * pAg,
    pFe,
  };
}

/** Atrito e ventilação (W) na rotação n (rpm). */
export const mechLoss = (n: number) => P_MEC * (n / 1800) ** 2;
/** Conjugado nominal (N·m) do motor de p polos (100 % de carga). */
export const ratedTorque = (p: number) => P_N / (((4 * Math.PI * F_N) / p) * (1 - S_NOM));

/** Escorregamento do conjugado máximo e o conjugado máximo (N·m). */
export function breakdown(sp: Supply): { s: number; T: number } {
  let best = { s: 1, T: motorAt(sp, 1).Tem };
  for (let i = 1; i <= 240; i++) {
    const s = 0.002 * Math.pow(500, i / 240);
    const T = motorAt(sp, s).Tem;
    if (T > best.T) best = { s, T };
  }
  // refino em volta do melhor ponto
  let lo = best.s / 1.04;
  let hi = Math.min(1, best.s * 1.04);
  for (let i = 0; i < 40; i++) {
    const a = lo + (hi - lo) / 3;
    const b = hi - (hi - lo) / 3;
    if (motorAt(sp, a).Tem < motorAt(sp, b).Tem) lo = a;
    else hi = b;
  }
  const s = (lo + hi) / 2;
  const T = motorAt(sp, s).Tem;
  return T > best.T ? { s, T } : best;
}

export interface MotorState {
  sp: Supply;
  ns: number;
  n: number;
  s: number;
  /** Conjugado da carga (N·m) e o nominal. */
  TL: number;
  TN: number;
  /** Conjugado eletromagnético no ponto (N·m). */
  T: number;
  Tp: number;
  Tmax: number;
  sMax: number;
  pt: MotorPoint;
  start: MotorPoint;
  Pout: number;
  pMec: number;
  eta: number;
  fp: number;
  /** Rede (com os capacitores). */
  Qcap: number;
  Qnet: number;
  Snet: number;
  fpNet: number;
  Inet: number;
  stall: boolean;
  over: boolean;
  dir: number;
  net: number;
}

/** Ponto de operação do motor com os controles `v`. */
export function motorState(v: LabValues): MotorState {
  const sp = supplyOf(v);
  const ns = syncRpm(sp.f, sp.p);
  const TN = ratedTorque(sp.p);
  const TL = (Math.max(0, v.load ?? 100) / 100) * TN;
  const bd = breakdown(sp);
  const need = (s: number) => {
    const n = ns * (1 - s);
    const wm = (2 * Math.PI * n) / 60;
    return TL + (wm > 0 ? mechLoss(n) / wm : 0);
  };
  let s = 1;
  let stall = true;
  if (motorAt(sp, bd.s).Tem >= need(bd.s)) {
    stall = false;
    let lo = 1e-7;
    let hi = bd.s;
    for (let i = 0; i < 80; i++) {
      const mid = Math.sqrt(lo * hi);
      if (motorAt(sp, mid).Tem < need(mid)) lo = mid;
      else hi = mid;
    }
    s = hi;
  }
  const pt = motorAt(sp, s);
  const start = motorAt(sp, 1);
  const n = ns * (1 - s);
  const pMec = mechLoss(n);
  const Pout = stall ? 0 : Math.max(0, pt.Tem * ((2 * Math.PI * n) / 60) - pMec);
  const net = NETS[Math.round(v.rede ?? 0)] ?? 220;
  const capOn = Math.round(sp.f) === F_N;
  const Qcap = capOn ? Math.max(0, v.cap ?? 0) * 1000 : 0;
  const Qnet = pt.Q - Qcap;
  const Snet = Math.hypot(pt.P, Qnet);
  const S = Math.hypot(pt.P, pt.Q);
  return {
    sp,
    ns,
    n,
    s,
    TL,
    TN,
    T: stall ? start.Tem : TL,
    Tp: start.Tem,
    Tmax: bd.T,
    sMax: bd.s,
    pt,
    start,
    Pout,
    pMec,
    eta: pt.P > 0 ? Pout / pt.P : 0,
    fp: S > 0 ? pt.P / S : 0,
    Qcap,
    Qnet,
    Snet,
    fpNet: Snet > 0 ? pt.P / Snet : 0,
    Inet: Snet / (Math.sqrt(3) * net),
    stall,
    over: fluxOf(sp) > 1.15,
    dir: Math.round(v.seq ?? 0) === 1 ? -1 : 1,
    net,
  };
}

/** Dados de placa do motor de p polos (60 Hz, 220 V em triângulo, carga nominal). */
export interface Nameplate {
  p: number;
  n: number;
  I220: number;
  I380: number;
  fp: number;
  eta: number;
  IpIn: number;
  TpTn: number;
  TmaxTn: number;
  TN: number;
}

const plates = new Map<number, Nameplate>();
export function nameplate(p: number): Nameplate {
  const hit = plates.get(p);
  if (hit) return hit;
  const st = motorState({ poles: POLES.indexOf(p as (typeof POLES)[number]), f: F_N, rede: 0, lig: 0, load: 100, cap: 0 });
  const plate: Nameplate = {
    p,
    n: st.n,
    I220: st.pt.IL,
    I380: st.pt.IL / Math.sqrt(3),
    fp: st.fp,
    eta: st.eta,
    IpIn: st.start.IL / st.pt.IL,
    TpTn: st.Tp / st.TN,
    TmaxTn: st.Tmax / st.TN,
    TN: st.TN,
  };
  plates.set(p, plate);
  return plate;
}

// ---------------------------------------------------------------- alternador
/** Alternador de 10 kVA, 220 V (estrela), 60 Hz na rotação síncrona. */
export const G_S = 10000;
export const G_V = 220;
export const G_ZB = (G_V * G_V) / G_S;
/** Reatância síncrona (pu, a 60 Hz) e resistência da armadura (pu). */
export const G_XS = 0.5;
export const G_RA = 0.02;
/** Curva de magnetização: fluxo relativo em função da excitação (1 = 100 %). */
export const G_SAT = 0.6;
export const fluxOfExc = (x: number) => (x <= 0 ? 0 : ((1 + G_SAT) * x) / (G_SAT + x));

export interface GenState {
  p: number;
  n: number;
  f: number;
  phi: number;
  /** Tensões de linha (V): gerada (a vazio) e nos terminais. */
  E: number;
  V: number;
  I: number;
  P: number;
  pCu: number;
  pFe: number;
  pMec: number;
  Pt: number;
  T: number;
  eta: number;
  RL: number;
}

export function genState(v: LabValues): GenState {
  const p = POLES[Math.round(v.poles ?? 1)] ?? 4;
  const n = Math.max(0, v.rpm ?? 1800);
  const f = genFreq(n, p);
  const phi = fluxOfExc(Math.max(0, v.exc ?? 100) / 100);
  const n60 = (120 * F_N) / p;
  const E = G_V * (n / n60) * phi;
  const Eph = E / Math.sqrt(3);
  const kw = Math.max(0, v.kw ?? 0);
  const RL = kw > 0 ? (G_V * G_V) / (kw * 1000) : Infinity;
  const xs = G_XS * G_ZB * (f / F_N);
  const ra = G_RA * G_ZB;
  const I = Number.isFinite(RL) ? Eph / Math.hypot(RL + ra, xs) : 0;
  const Vph = Number.isFinite(RL) ? I * RL : Eph;
  const P = 3 * I * I * (Number.isFinite(RL) ? RL : 0);
  const pCu = 3 * I * I * ra;
  const k = f / F_N;
  const pFe = P_FE * phi * phi * (0.6 * k + 0.4 * k * k);
  const pMec = mechLoss(n);
  const Pt = P + pCu + pFe + pMec;
  const w = (2 * Math.PI * n) / 60;
  return { p, n, f, phi, E, V: Vph * Math.sqrt(3), I, P, pCu, pFe, pMec, Pt, T: w > 0 ? Pt / w : 0, eta: Pt > 0 ? P / Pt : 0, RL };
}

// ---------------------------------------------------------------- modelo da bancada
const isMotor = (v: LabValues) => Math.round(v.maq ?? 0) === 0;
const isGen = (v: LabValues) => Math.round(v.maq ?? 0) === 1;
const capShown = (v: LabValues) => isMotor(v) && Math.round(v.f ?? F_N) === F_N;
const capUsed = (v: LabValues) => capShown(v) && (v.cap ?? 0) > 0;

export const motorModel: LabModel = {
  id: 'motor',
  name: 'Motor de indução e alternador',
  icon: '⚡',
  summary:
    'Um **estator** com três bobinas a 120°. No **motor de indução**, as correntes trifásicas criam um **campo girante** (n_s = 120·f/p) e o rotor de gaiola gira um pouco atrás dele: é o **escorregamento** que induz a corrente no rotor. Mude os **polos**, a **frequência** (inversor), a **carga**, a **ligação** (estrela ou triângulo) e os **capacitores**. No **alternador**, uma turbina gira os polos do rotor e o estator gera tensão trifásica.',
  params: [
    { id: 'maq', label: 'Máquina', min: 0, max: 1, step: 1, default: 0, choices: ['Motor de indução', 'Alternador'], help: 'A mesma ideia nas duas: um campo magnético girando dentro de três bobinas a 120°.' },
    { id: 'poles', label: 'Número de polos', min: 0, max: 3, step: 1, default: 1, choices: ['2', '4', '6', '8'], help: 'Mais polos, campo mais lento: n_s = 120·f/p.' },
    { id: 'rede', label: 'Tensão da rede', min: 0, max: 1, step: 1, default: 0, choices: ['220 V', '380 V'], help: 'Tensão de linha (entre fases) da rede trifásica. Também dá para clicar no botão da rede na caixa de ligação.', show: isMotor },
    {
      id: 'lig',
      label: 'Ligação do motor (placa 220/380 V)',
      min: 0,
      max: 1,
      step: 1,
      default: 0,
      choices: ['Triângulo (Δ)', 'Estrela (Y)'],
      help: 'Cada bobina é de 220 V. Triângulo põe a tensão da rede em cada bobina; estrela põe a tensão da rede ÷ √3. Também dá para clicar nos bornes da caixa de ligação.',
      show: isMotor,
    },
    { id: 'f', label: 'Frequência (inversor)', min: 10, max: 90, step: 1, default: 60, unit: 'Hz', digits: 0, help: '60 Hz é a rede. Outros valores simulam um inversor de frequência com V/f constante até 60 Hz.', show: isMotor },
    { id: 'load', label: 'Carga no eixo (% do conjugado nominal)', min: 0, max: 400, step: 5, default: 100, unit: '%', digits: 0, help: 'Carga de conjugado constante, como uma esteira ou um guindaste. 100 % é a carga da placa. Também dá para arrastar a reta da carga no gráfico.', show: isMotor },
    { id: 'cap', label: 'Capacitores na rede', min: 0, max: 8, step: 0.5, default: 0, unit: 'kvar', digits: 1, help: 'Banco de capacitores em paralelo com o motor: fornece a potência reativa da magnetização. Só com a rede (60 Hz).', show: capShown },
    { id: 'seq', label: 'Sequência de fases', min: 0, max: 1, step: 1, default: 0, choices: ['L1-L2-L3', 'L2-L1-L3'], help: 'Trocar duas fases inverte o sentido do campo girante (e do motor).', show: isMotor },
    { id: 'rpm', label: 'Rotação da turbina', min: 0, max: 3600, step: 50, default: 1800, unit: 'rpm', digits: 0, help: 'A turbina (ou motor diesel) gira o rotor do alternador.', show: isGen },
    { id: 'exc', label: 'Corrente de excitação (campo)', min: 0, max: 150, step: 5, default: 100, unit: '%', digits: 0, help: 'Corrente contínua nos polos do rotor. Mais excitação, mais fluxo (até o ferro saturar) e mais tensão.', show: isGen },
    { id: 'kw', label: 'Carga elétrica (resistências)', min: 0, max: 12, step: 0.5, default: 5, unit: 'kW', digits: 1, help: 'Potência das lâmpadas se recebessem 220 V (com menos tensão, consomem menos). Também dá para clicar nas lâmpadas.', show: isGen },
  ],
  outputs: [
    { id: 'ns', label: 'Rotação síncrona (campo girante)', unit: 'rpm', digits: 0, show: isMotor },
    { id: 'n', label: 'Rotação do eixo', unit: 'rpm', digits: 0, show: isMotor },
    { id: 's', label: 'Escorregamento', unit: '%', digits: 1, show: isMotor },
    { id: 'T', label: 'Conjugado no eixo', unit: 'N·m', digits: 1, show: isMotor },
    { id: 'Pout', label: 'Potência no eixo', unit: 'kW', digits: 2, show: isMotor },
    { id: 'I', label: 'Corrente de linha do motor', unit: 'A', digits: 1, show: isMotor },
    { id: 'Ip', label: 'Corrente de partida (direta)', unit: 'A', digits: 0, show: isMotor },
    { id: 'fp', label: 'Fator de potência do motor (cos φ)', digits: 2, show: isMotor },
    { id: 'eta', label: 'Rendimento', unit: '%', digits: 1, show: isMotor },
    { id: 'P', label: 'Potência ativa (P)', unit: 'kW', digits: 2, show: isMotor },
    { id: 'Q', label: 'Potência reativa da rede (Q)', unit: 'kvar', digits: 2, show: isMotor },
    { id: 'S', label: 'Potência aparente da rede (S)', unit: 'kVA', digits: 2, show: isMotor },
    { id: 'fpRede', label: 'Fator de potência visto pela rede', digits: 2, show: capUsed },
    { id: 'Irede', label: 'Corrente na rede', unit: 'A', digits: 1, show: capUsed },
    { id: 'Vbob', label: 'Tensão em cada bobina', unit: 'V', digits: 0, show: isMotor },
    { id: 'fg', label: 'Frequência gerada', unit: 'Hz', digits: 1, show: isGen },
    { id: 'E', label: 'Tensão gerada a vazio (linha)', unit: 'V', digits: 0, show: isGen },
    { id: 'V', label: 'Tensão nos terminais (linha)', unit: 'V', digits: 0, show: isGen },
    { id: 'Ig', label: 'Corrente de linha', unit: 'A', digits: 1, show: isGen },
    { id: 'Pg', label: 'Potência elétrica entregue', unit: 'kW', digits: 2, show: isGen },
    { id: 'Tt', label: 'Torque no eixo da turbina', unit: 'N·m', digits: 1, show: isGen },
    { id: 'Pt', label: 'Potência da turbina', unit: 'kW', digits: 2, show: isGen },
    { id: 'Tp', label: 'Conjugado de partida', hidden: true },
    { id: 'Tmax', label: 'Conjugado máximo', hidden: true },
    { id: 'TN', label: 'Conjugado nominal', hidden: true },
    { id: 'fr', label: 'Frequência das correntes do rotor', hidden: true },
    { id: 'stall', label: 'Motor tombou (1 = sim)', hidden: true },
    { id: 'over', label: 'Sobretensão nas bobinas (1 = sim)', hidden: true },
    { id: 'parte', label: 'Consegue partir com a carga (1 = sim)', hidden: true },
    { id: 'dir', label: 'Sentido de rotação (1 ou −1)', hidden: true },
    { id: 'Qm', label: 'Potência reativa do motor', hidden: true },
    { id: 'Sm', label: 'Potência aparente do motor', hidden: true },
  ],
  compute(v) {
    const m = motorState(v);
    const g = genState(v);
    const Sm = Math.hypot(m.pt.P, m.pt.Q);
    return {
      ns: m.ns,
      n: m.n,
      s: m.s * 100,
      T: m.T,
      Pout: m.Pout / 1000,
      I: m.pt.IL,
      Ip: m.start.IL,
      fp: m.fp,
      eta: m.eta * 100,
      P: m.pt.P / 1000,
      Q: m.Qnet / 1000,
      S: m.Snet / 1000,
      fpRede: m.fpNet,
      Irede: m.Inet,
      Vbob: m.sp.Vph,
      fg: g.f,
      E: g.E,
      V: g.V,
      Ig: g.I,
      Pg: g.P / 1000,
      Tt: g.T,
      Pt: g.Pt / 1000,
      Tp: m.Tp,
      Tmax: m.Tmax,
      TN: m.TN,
      fr: m.s * m.sp.f,
      stall: m.stall ? 1 : 0,
      over: m.over ? 1 : 0,
      parte: m.Tp > m.TL ? 1 : 0,
      dir: m.dir,
      Qm: m.pt.Q / 1000,
      Sm: Sm / 1000,
    };
  },
  experiments: [
    {
      label: 'Campo girante e escorregamento',
      preset: { maq: 0, poles: 1, f: 60, load: 100 },
      text: 'O campo gira a **1.800 rpm** (4 polos, 60 Hz) e o rotor, a uns 1.745 rpm: o escorregamento de ~3 % é o que induz corrente nas barras. Tire a carga e veja o rotor quase alcançar o campo — e as barras quase apagarem.',
    },
    {
      label: 'Polos e frequência',
      preset: { maq: 0, poles: 3, f: 60, load: 100 },
      text: 'Com **8 polos** o campo gira a 120·60/8 = **900 rpm**. Volte para 2 polos (3.600 rpm). Depois mude a frequência no inversor: a rotação acompanha a frequência.',
    },
    {
      label: 'Carga até tombar',
      preset: { maq: 0, poles: 1, f: 60, load: 250 },
      text: 'Mais carga, mais escorregamento e mais corrente. Passe do **conjugado máximo** (~2,8 vezes o nominal) e o motor **tomba**: para e fica puxando a corrente de partida.',
    },
    {
      label: 'Estrela na rede de 220 V',
      preset: { maq: 0, poles: 1, f: 60, rede: 0, lig: 1, load: 30 },
      text: 'Em estrela, cada bobina recebe 220/√3 = **127 V**: corrente de partida e conjugado caem para **1/3**. É a partida estrela-triângulo — só serve com carga leve. Suba a carga para 100 %.',
    },
    {
      label: 'Fator de potência',
      preset: { maq: 0, poles: 1, f: 60, load: 25, cap: 0 },
      text: 'Com pouca carga o motor quase só magnetiza: **cos φ baixo**. Ponha capacitores e veja a potência reativa da rede e a corrente na rede caírem, com a mesma potência ativa.',
    },
    {
      label: 'Alternador: 60 Hz',
      preset: { maq: 1, poles: 2, rpm: 1200, exc: 100, kw: 0 },
      text: 'Com **6 polos**, f = p·n/120 = 6·1.200/120 = **60 Hz**. Mude a rotação e veja a frequência e a tensão mudarem juntas. Ponha carga e sinta o torque que a turbina precisa fazer.',
    },
    {
      label: 'Alternador com carga',
      preset: { maq: 1, poles: 1, rpm: 1800, exc: 100, kw: 8 },
      text: 'Com carga, a tensão nos terminais **cai** (reatância síncrona). Aumente a **excitação** para voltar a 220 V — é o que o regulador de tensão faz sozinho.',
    },
  ],
};
