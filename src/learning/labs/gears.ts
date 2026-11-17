/**
 * Bancada do redutor: um guincho. O motor gira o pinhão 1, que engrena na coroa 2 (com ou sem uma engrenagem
 * intermediária no meio); com dois pares, o pinhão 3 (no eixo da coroa 2) engrena na coroa 4. O tambor, no eixo de
 * saída, enrola o cabo que levanta a carga com velocidade constante.
 * Módulo 4 mm em todas as engrenagens (diâmetro primitivo D = 4·z). g = 10 m/s², como nas provas.
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

export const MODULE = 4;
export const G = 10;

export interface GearState {
  z1: number;
  z2: number;
  z3: number;
  z4: number;
  zi: number;
  idler: boolean;
  two: boolean;
  n1: number;
  mass: number;
  R: number;
  eta: number;
  d: number;
  /** Diâmetros primitivos (mm). */
  D1: number;
  D2: number;
  D3: number;
  D4: number;
  Di: number;
  /** Relações de transmissão (n_saída/n_entrada) de cada par e total. */
  i1: number;
  i2: number;
  i: number;
  /** Rotações (rpm): eixo intermediário (coroa 2 + pinhão 3), tambor e a engrenagem intermediária (louca). */
  ni: number;
  nt: number;
  nId: number;
  w1: number;
  wt: number;
  /** Engrenamentos (cada um perde 1 − η) e rendimento total. */
  meshes: number;
  etaTot: number;
  /** Torques (N·m): tambor, eixo intermediário (2 pares), motor. */
  Tt: number;
  Ti: number;
  Tm: number;
  /** Potências (W). */
  Pout: number;
  Pm: number;
  loss: number;
  /** Velocidade de subida da carga (m/s). */
  v: number;
  /** Forças tangenciais nos dentes (N). */
  Ft1: number;
  Ft2: number;
  /** Tensões de cisalhamento por torção (MPa). */
  taum: number;
  taui: number;
  taut: number;
  /** Sentidos de giro: +1 = o mesmo do motor (horário), −1 = o contrário. */
  dir2: number;
  dirI: number;
  dirT: number;
}

const tauOf = (T: number, d: number) => (16 * T * 1000) / (Math.PI * d * d * d);

export function gearState(v: LabValues): GearState {
  const z = (x: number | undefined, def: number) => Math.max(1, Math.round(x ?? def));
  const z1 = z(v.z1, 20);
  const z2 = z(v.z2, 60);
  const z3 = z(v.z3, 15);
  const z4 = z(v.z4, 75);
  const zi = z(v.zi, 30);
  const idler = Math.round(v.idler ?? 0) === 1;
  const two = Math.round(v.two ?? 1) === 1;
  const n1 = Math.max(0, v.n1 ?? 1800);
  const mass = Math.max(0, v.mass ?? 500);
  const R = Math.max(1e-3, v.R ?? 0.15);
  const eta = Math.min(1, Math.max(0.01, v.eta ?? 1));
  const d = Math.max(1, v.d ?? 40);
  const i1 = z1 / z2;
  const i2 = two ? z3 / z4 : 1;
  const i = i1 * i2;
  const ni = n1 * i1;
  const nt = n1 * i;
  const nId = (n1 * z1) / zi;
  const w1 = (n1 * 2 * Math.PI) / 60;
  const wt = (nt * 2 * Math.PI) / 60;
  const meshes = (idler ? 2 : 1) + (two ? 1 : 0);
  const etaTot = Math.pow(eta, meshes);
  const Tt = mass * G * R;
  // potência que chega a cada eixo = a da carga dividida pelos rendimentos dos engrenamentos depois dele
  const Ti = two ? (Tt * i2) / eta : Tt;
  const Tm = (Tt * i) / etaTot;
  const Pout = Tt * wt;
  const Pm = Tm * w1;
  const dir2 = idler ? 1 : -1;
  return {
    z1,
    z2,
    z3,
    z4,
    zi,
    idler,
    two,
    n1,
    mass,
    R,
    eta,
    d,
    D1: MODULE * z1,
    D2: MODULE * z2,
    D3: MODULE * z3,
    D4: MODULE * z4,
    Di: MODULE * zi,
    i1,
    i2,
    i,
    ni,
    nt,
    nId,
    w1,
    wt,
    meshes,
    etaTot,
    Tt,
    Ti,
    Tm,
    Pout,
    Pm,
    loss: Pm - Pout,
    v: wt * R,
    Ft1: (2 * Tm * 1000) / (MODULE * z1),
    Ft2: two ? (2 * Ti * 1000) / (MODULE * z3) : 0,
    taum: tauOf(Tm, d),
    taui: two ? tauOf(Ti, d) : 0,
    taut: tauOf(Tt, d),
    dir2,
    dirI: -1,
    dirT: two ? -dir2 : dir2,
  };
}

const isTwo = (v: LabValues) => Math.round(v.two ?? 1) === 1;
const hasIdler = (v: LabValues) => Math.round(v.idler ?? 0) === 1;
const lossy = (v: LabValues) => (v.eta ?? 1) < 0.9999;

export const gearsModel: LabModel = {
  id: 'gears',
  name: 'Redutor de engrenagens (guincho)',
  icon: '⚙️',
  summary:
    'Um **guincho**: o motor gira o pinhão, as engrenagens **reduzem a rotação** e **multiplicam o torque**, e o tambor levanta a carga. Troque os números de dentes, ponha uma **engrenagem intermediária**, use um ou dois pares e veja a rotação, o torque e a potência em cada eixo — e qual eixo é o mais solicitado.',
  params: [
    { id: 'z1', label: 'Dentes do pinhão do motor (z1)', min: 10, max: 60, step: 1, default: 20, digits: 0, help: 'Engrenagem no eixo do motor. Diâmetro primitivo D = módulo × z = 4·z mm.' },
    { id: 'z2', label: 'Dentes da coroa (z2)', min: 10, max: 120, step: 1, default: 60, digits: 0, help: 'Relação do par: n2/n1 = z1/z2 = D1/D2. A engrenagem maior gira mais devagar e com mais torque.' },
    {
      id: 'idler',
      label: 'Engrenagem intermediária',
      min: 0,
      max: 1,
      step: 1,
      default: 0,
      choices: ['Sem', 'Com'],
      help: 'Uma engrenagem entre o pinhão e a coroa ("louca"): inverte o sentido de giro, mas não muda a relação de transmissão.',
    },
    { id: 'zi', label: 'Dentes da intermediária', min: 10, max: 80, step: 1, default: 30, digits: 0, help: 'Qualquer número de dentes: a relação entre o pinhão e a coroa continua z1/z2.', show: hasIdler },
    { id: 'two', label: 'Pares de engrenagens', min: 0, max: 1, step: 1, default: 1, choices: ['1 par', '2 pares'], help: 'Com 2 pares (trem composto), a relação total é o produto das relações de cada par.' },
    { id: 'z3', label: 'Dentes do 2º pinhão (z3)', min: 10, max: 60, step: 1, default: 15, digits: 0, help: 'Pinhão do 2º par, no mesmo eixo da coroa z2 (gira junto com ela).', show: isTwo },
    { id: 'z4', label: 'Dentes da 2ª coroa (z4)', min: 10, max: 120, step: 1, default: 75, digits: 0, help: 'Coroa do 2º par, no eixo do tambor.', show: isTwo },
    { id: 'n1', label: 'Rotação do motor', min: 0, max: 3600, step: 10, default: 1800, unit: 'rpm', digits: 0, help: 'Motor de indução de 4 polos em 60 Hz: ~1.800 rpm.' },
    { id: 'mass', label: 'Carga içada', min: 0, max: 2000, step: 10, default: 500, unit: 'kg', digits: 0, help: 'Subindo com velocidade constante: a força no cabo é o peso m·g.' },
    { id: 'R', label: 'Raio do tambor', min: 0.05, max: 0.3, step: 0.01, default: 0.15, unit: 'm', digits: 2, help: 'Torque no tambor = força no cabo × raio; velocidade da carga = ω × raio.' },
    { id: 'eta', label: 'Rendimento de cada engrenamento', min: 0.8, max: 1, step: 0.01, default: 1, digits: 2, help: '1 = ideal (sem perdas). Cada par que engrena perde uma parte da potência por atrito.' },
    { id: 'd', label: 'Diâmetro dos eixos', min: 20, max: 120, step: 1, default: 40, unit: 'mm', digits: 0, help: 'Todos os eixos com o mesmo diâmetro: τ = 16·T/(π·d³).' },
  ],
  outputs: [
    { id: 'i', label: 'Relação i = n_tambor/n_motor', digits: 4 },
    { id: 'red', label: 'Redução n_motor/n_tambor', digits: 2 },
    { id: 'nId', label: 'Rotação da intermediária', unit: 'rpm', digits: 0, show: hasIdler },
    { id: 'ni', label: 'Rotação do eixo intermediário', unit: 'rpm', digits: 0, show: isTwo },
    { id: 'nt', label: 'Rotação do tambor', unit: 'rpm', digits: 1 },
    { id: 'v', label: 'Velocidade de subida da carga', unit: 'm/s', digits: 2 },
    { id: 'Tt', label: 'Torque no tambor (m·g·R)', unit: 'N·m', digits: 1 },
    { id: 'Ti', label: 'Torque no eixo intermediário', unit: 'N·m', digits: 1, show: isTwo },
    { id: 'Tm', label: 'Torque do motor', unit: 'N·m', digits: 2 },
    { id: 'Pm', label: 'Potência do motor', unit: 'kW', digits: 2 },
    { id: 'Pout', label: 'Potência na carga (m·g·v)', unit: 'kW', digits: 2 },
    { id: 'loss', label: 'Perdas nos engrenamentos', unit: 'kW', digits: 2, show: lossy },
    { id: 'Ft1', label: 'Força nos dentes do 1º par', unit: 'N', digits: 0 },
    { id: 'Ft2', label: 'Força nos dentes do 2º par', unit: 'N', digits: 0, show: isTwo },
    { id: 'taum', label: 'Torção no eixo do motor', unit: 'MPa', digits: 1 },
    { id: 'taui', label: 'Torção no eixo intermediário', unit: 'MPa', digits: 1, show: isTwo },
    { id: 'taut', label: 'Torção no eixo do tambor', unit: 'MPa', digits: 1 },
    { id: 'dirT', label: 'Sentido do tambor (+1 = o do motor)', hidden: true },
    { id: 'TId', label: 'Torque no eixo da intermediária', hidden: true },
    { id: 'etaTot', label: 'Rendimento total', hidden: true },
  ],
  compute(p) {
    const st = gearState(p);
    return {
      i: st.i,
      red: 1 / st.i,
      nId: st.nId,
      ni: st.ni,
      nt: st.nt,
      v: st.v,
      Tt: st.Tt,
      Ti: st.Ti,
      Tm: st.Tm,
      Pm: st.Pm / 1000,
      Pout: st.Pout / 1000,
      loss: st.loss / 1000,
      Ft1: st.Ft1,
      Ft2: st.Ft2,
      taum: st.taum,
      taui: st.taui,
      taut: st.taut,
      dirT: st.dirT,
      // a intermediária gira solta no seu eixo: recebe e passa adiante a mesma força, não transmite torque ao eixo
      TId: 0,
      etaTot: st.etaTot,
    };
  },
  experiments: [
    {
      label: 'Um par',
      preset: { two: 0, idler: 0, z1: 20, z2: 60, n1: 1800, mass: 200, R: 0.15 },
      text: 'Com z₂ = 3·z₁ a coroa gira **3 vezes mais devagar** e recebe **3 vezes o torque**: a potência P = T·ω é a mesma nos dois eixos. Troque z₂ e veja os dois mudarem juntos.',
    },
    {
      label: 'Trem composto',
      preset: { two: 1, idler: 0, z1: 20, z2: 60, z3: 15, z4: 75, eta: 1 },
      text: 'Dois pares: 3:1 e 5:1 dão **15:1**. O torque cresce de eixo em eixo (50 → 150 → 750 N·m) e o eixo do tambor é o mais solicitado.',
    },
    {
      label: 'Engrenagem intermediária',
      preset: { two: 0, idler: 1, zi: 30, z1: 20, z2: 60 },
      text: 'A intermediária **inverte o sentido** de giro da coroa, mas a relação continua z₁/z₂. Mude os dentes dela: só a rotação **dela** muda.',
    },
    {
      label: 'Perdas',
      preset: { two: 1, idler: 0, eta: 0.95 },
      text: 'Com 95 % por engrenamento, sobram 0,95² ≈ 90 % da potência no tambor. O motor precisa de mais torque para levantar a mesma carga.',
    },
  ],
};
