/**
 * Bancada da rampa: uma caixa com atrito (estático × cinético, puxada por uma força paralela à rampa) e corpos que
 * rolam (aro, cilindro maciço e esfera maciça) — rolamento sem deslizamento ou rolando e escorregando.
 * g = 10 m/s², como nas provas. Sentido: "rampa acima" é o da força F (no piso plano, para a direita).
 */
import type { LabValues } from '../types';
import type { LabModel } from './model';

export const G = 10;
/** Distância percorrida na "corrida" (m): dá o tempo e a velocidade no fim. */
export const RAMP_L = 4;

export interface Shape {
  name: string;
  short: string;
  /** β = I/(m·r²): 0 para a caixa (não rola). */
  beta: number;
  inertia: string;
}

export const SHAPES: readonly Shape[] = [
  { name: 'Caixa', short: 'Caixa', beta: 0, inertia: '' },
  { name: 'Aro (tubo de parede fina)', short: 'Aro', beta: 1, inertia: 'I = m·r²' },
  { name: 'Cilindro maciço', short: 'Cilindro', beta: 0.5, inertia: 'I = m·r²/2' },
  { name: 'Esfera maciça', short: 'Esfera', beta: 0.4, inertia: 'I = 2·m·r²/5' },
];

/** Regimes: parado, deslizando (caixa), rolando sem deslizar, rolando e escorregando. */
export const REST = 0;
export const SLIDE = 1;
export const ROLL = 2;
export const ROLL_SLIP = 3;

export interface RampState {
  body: number;
  shape: Shape;
  rolling: boolean;
  /** Inclinação em graus e em radianos. */
  theta: number;
  th: number;
  m: number;
  mus: number;
  /** μc usado na conta (nunca maior que μe) e o valor do controle. */
  muk: number;
  mukRaw: number;
  F: number;
  r: number;
  P: number;
  N: number;
  /** Componente do peso ao longo da rampa (aponta rampa abaixo). */
  Pt: number;
  fmax: number;
  /** Atrito necessário: o que seguraria a caixa parada, ou o que faz o corpo rolar sem deslizar. */
  fneed: number;
  f: number;
  /** Sentido do atrito: +1 rampa acima, −1 rampa abaixo, 0 sem atrito. */
  fdir: number;
  /** Módulo da aceleração do centro. */
  a: number;
  /** Sentido do movimento: +1 rampa abaixo, −1 rampa acima, 0 parado. */
  dir: number;
  regime: number;
  I: number;
  alpha: number;
  /** α·r/a: 1 rolando sem deslizar, entre 0 e 1 escorregando, 0 sem girar. */
  spin: number;
  /** Fração da energia cinética que está na rotação (0 a 1). */
  erot: number;
  /** Ângulo de repouso (caixa) e inclinação máxima para rolar sem deslizar (corpos que rolam), em graus. */
  thRep: number;
  thLim: number;
  /** Faixa de F em que a caixa fica parada. */
  Fhold: number;
  Fpush: number;
  v: number;
  t: number;
}

const DEG = Math.PI / 180;

/** Aceleração (módulo, sentido) de um corpo solto na rampa, sem a força F: usada na "corrida" e nos gráficos. */
export function releaseOf(beta: number, thetaDeg: number, mus: number, mukRaw: number): { a: number; regime: number } {
  const th = thetaDeg * DEG;
  const muk = Math.min(mukRaw, mus);
  const s = Math.sin(th);
  const c = Math.cos(th);
  if (s <= 1e-12) return { a: 0, regime: REST };
  if (beta === 0) {
    if (s <= mus * c + 1e-12) return { a: 0, regime: REST };
    return { a: G * (s - muk * c), regime: SLIDE };
  }
  // rola sem deslizar se o atrito necessário m·g·sen θ·β/(1+β) couber em μe·N
  if ((s * beta) / (1 + beta) <= mus * c + 1e-12) return { a: (G * s) / (1 + beta), regime: ROLL };
  return { a: G * (s - muk * c), regime: ROLL_SLIP };
}

export function rampState(v: LabValues): RampState {
  const body = Math.max(0, Math.min(SHAPES.length - 1, Math.round(v.body ?? 0)));
  const shape = SHAPES[body];
  const rolling = shape.beta > 0;
  const theta = Math.max(0, Math.min(90, v.theta ?? 30));
  const th = theta * DEG;
  const m = Math.max(1e-6, v.m ?? 20);
  const mus = Math.max(0, v.mus ?? 0.4);
  const mukRaw = Math.max(0, v.muk ?? 0.3);
  const muk = Math.min(mukRaw, mus);
  const F = rolling ? 0 : Math.max(0, v.F ?? 0);
  const r = Math.max(1e-3, v.r ?? 0.2);
  const P = m * G;
  const N = P * Math.cos(th);
  const Pt = P * Math.sin(th);
  const fmax = mus * N;
  const beta = shape.beta;
  const I = beta * m * r * r;

  let fneed: number;
  let f = 0;
  let fdir = 0;
  let a = 0;
  let dir = 0;
  let regime = REST;
  let alpha = 0;
  let spin = 0;

  if (!rolling) {
    // T = soma das forças, sem o atrito, no sentido rampa acima
    const T = F - Pt;
    fneed = Math.abs(T);
    if (Math.abs(T) <= fmax + 1e-9) {
      f = Math.abs(T);
      fdir = T > 1e-12 ? -1 : T < -1e-12 ? 1 : 0;
    } else {
      regime = SLIDE;
      dir = T > 0 ? -1 : 1;
      f = muk * N;
      fdir = -dir;
      a = (Math.abs(T) - f) / m;
    }
  } else {
    fneed = (Pt * beta) / (1 + beta);
    const rel = releaseOf(beta, theta, mus, mukRaw);
    regime = rel.regime;
    a = rel.a;
    if (regime === ROLL) {
      f = fneed;
      fdir = f > 1e-12 ? 1 : 0;
      dir = 1;
      alpha = a / r;
      spin = 1;
    } else if (regime === ROLL_SLIP) {
      f = muk * N;
      fdir = f > 1e-12 ? 1 : 0;
      dir = 1;
      alpha = I > 0 ? (f * r) / I : 0;
      spin = a > 0 ? Math.min(1, (alpha * r) / a) : 0;
    }
  }
  const erot = rolling && a > 0 ? (beta * spin * spin) / (1 + beta * spin * spin) : 0;
  const v4 = a > 0 ? Math.sqrt(2 * a * RAMP_L) : 0;
  const t4 = a > 0 ? Math.sqrt((2 * RAMP_L) / a) : 0;
  return {
    body,
    shape,
    rolling,
    theta,
    th,
    m,
    mus,
    muk,
    mukRaw,
    F,
    r,
    P,
    N,
    Pt,
    fmax,
    fneed,
    f,
    fdir,
    a,
    dir,
    regime,
    I,
    alpha,
    spin,
    erot,
    thRep: Math.atan(mus) / DEG,
    thLim: rolling ? Math.atan((mus * (1 + beta)) / beta) / DEG : Math.atan(mus) / DEG,
    Fhold: Math.max(0, Pt - fmax),
    Fpush: Pt + fmax,
    v: v4,
    t: t4,
  };
}

const isBox = (v: LabValues) => Math.round(v.body ?? 0) === 0;
const isRolling = (v: LabValues) => !isBox(v);
const moves = (v: LabValues) => rampState(v).a > 0;

export const rampModel: LabModel = {
  id: 'ramp',
  name: 'Rampa: atrito e rolamento',
  icon: '🛷',
  summary:
    'Uma **caixa** na rampa, com atrito **estático** e **cinético** e uma força F puxando — ou um **aro**, um **cilindro** e uma **esfera** rolando. Veja o diagrama de corpo livre, quando a caixa sai do lugar, por que o atrito estático "vale o necessário", quem ganha a corrida rampa abaixo e quando o corpo deixa de rolar sem deslizar.',
  params: [
    {
      id: 'body',
      label: 'Corpo',
      min: 0,
      max: 3,
      step: 1,
      default: 0,
      choices: SHAPES.map((s) => s.short),
      help: 'A caixa desliza (com atrito). Aro, cilindro e esfera rolam: para girar, eles precisam do atrito estático.',
    },
    { id: 'theta', label: 'Inclinação da rampa', min: 0, max: 60, step: 1, default: 30, unit: '°', digits: 0, help: 'Ângulo com a horizontal (0° = piso plano). Também dá para arrastar o topo da rampa no desenho.' },
    { id: 'm', label: 'Massa', min: 1, max: 500, step: 1, default: 20, unit: 'kg', digits: 0, help: 'Muda o peso, a normal e o atrito, mas não a aceleração quando só agem o peso, a normal e o atrito.' },
    { id: 'mus', label: 'Atrito estático μe', min: 0, max: 1, step: 0.01, default: 0.4, digits: 2, help: 'Parado, o atrito vale só o necessário para impedir o deslizamento, até o máximo μe·N.' },
    { id: 'muk', label: 'Atrito cinético μc', min: 0, max: 1, step: 0.01, default: 0.3, digits: 2, help: 'Escorregando, o atrito vale μc·N (na prática, μc < μe).' },
    { id: 'F', label: 'Força puxando a caixa', min: 0, max: 3000, step: 10, default: 0, unit: 'N', digits: 0, help: 'Paralela à rampa, rampa acima (no piso plano, na horizontal). Também dá para arrastar no gráfico.', show: isBox },
    { id: 'r', label: 'Raio do corpo', min: 0.05, max: 0.5, step: 0.01, default: 0.2, unit: 'm', digits: 2, help: 'Muda o momento de inércia e a rotação, mas não a aceleração do centro.', show: isRolling },
  ],
  outputs: [
    { id: 'P', label: 'Peso P = m·g', unit: 'N', digits: 0 },
    { id: 'N', label: 'Normal N = m·g·cos θ', unit: 'N', digits: 1 },
    { id: 'Pt', label: 'Peso ao longo da rampa', unit: 'N', digits: 1 },
    { id: 'fmax', label: 'Atrito estático máximo μe·N', unit: 'N', digits: 1 },
    { id: 'fneed', label: 'Atrito necessário (sem deslizar)', unit: 'N', digits: 1 },
    { id: 'f', label: 'Atrito atuante', unit: 'N', digits: 1 },
    { id: 'a', label: 'Aceleração do centro', unit: 'm/s²', digits: 2 },
    { id: 'thRep', label: 'Ângulo de repouso (tg θ = μe)', unit: '°', digits: 1, show: isBox },
    { id: 'Fhold', label: 'F mínima para segurar', unit: 'N', digits: 1, show: isBox },
    { id: 'Fpush', label: 'F máxima sem a caixa subir', unit: 'N', digits: 1, show: isBox },
    { id: 'thLim', label: 'Inclinação máx. sem deslizar', unit: '°', digits: 1, show: isRolling },
    { id: 'I', label: 'Momento de inércia I', unit: 'kg·m²', digits: 3, show: isRolling },
    { id: 'alpha', label: 'Aceleração angular α', unit: 'rad/s²', digits: 2, show: isRolling },
    { id: 'erot', label: 'Energia cinética na rotação', unit: '%', digits: 0, show: isRolling },
    { id: 'v', label: 'Velocidade após 4 m', unit: 'm/s', digits: 2, show: moves },
    { id: 't', label: 'Tempo para percorrer 4 m', unit: 's', digits: 2, show: moves },
    { id: 'regime', label: 'Regime (0 a 3)', hidden: true },
    { id: 'dir', label: 'Sentido do movimento', hidden: true },
    { id: 'slips', label: 'Escorrega na superfície', hidden: true },
  ],
  compute(p) {
    const st = rampState(p);
    return {
      P: st.P,
      N: st.N,
      Pt: st.Pt,
      fmax: st.fmax,
      fneed: st.fneed,
      f: st.f,
      a: st.a,
      thRep: st.thRep,
      Fhold: st.Fhold,
      Fpush: st.Fpush,
      thLim: st.thLim,
      I: st.I,
      alpha: st.alpha,
      erot: st.erot * 100,
      v: st.v,
      t: st.t,
      regime: st.regime,
      dir: st.dir,
      slips: st.regime === SLIDE || st.regime === ROLL_SLIP ? 1 : 0,
    };
  },
  experiments: [
    {
      label: 'Puxar a caixa no piso',
      preset: { body: 0, theta: 0, m: 40, mus: 0.5, muk: 0.3, F: 100 },
      text: 'Aumente F devagar (ou arraste no gráfico): até μe·N = 200 N a caixa **não sai do lugar** e o atrito acompanha a força. Passou disso, ela desliza e o atrito **cai** para μc·N = 120 N.',
    },
    {
      label: 'Ângulo de repouso',
      preset: { body: 0, theta: 15, mus: 0.4, muk: 0.3, F: 0 },
      text: 'Suba a rampa grau a grau: a caixa só escorrega quando **tg θ > μe** (≈ 21,8° com μe = 0,4) — e isso não depende da massa.',
    },
    {
      label: 'Segurar na rampa',
      preset: { body: 0, theta: 35, m: 20, mus: 0.4, muk: 0.3, F: 0 },
      text: 'Com a caixa escorregando, aumente F: entre a **F mínima para segurar** e a **F máxima sem subir** ela fica parada, e o atrito muda de sentido no meio da faixa.',
    },
    {
      label: 'Corrida rampa abaixo',
      preset: { body: 2, theta: 30, mus: 0.4, muk: 0.3 },
      text: 'Veja a corrida: a **esfera** chega antes do **cilindro**, que chega antes do **aro** — quanto menor I/(m·r²), maior a aceleração. Mude a massa e o raio: a ordem não muda.',
    },
    {
      label: 'Rolar e escorregar',
      preset: { body: 1, theta: 30, mus: 0.25, muk: 0.2 },
      text: 'O aro precisa de muito atrito para rolar sem deslizar. Com μe = 0,25 ele **escorrega** a partir de ~26,6°: gira menos do que rola e o atrito passa a dissipar energia.',
    },
  ],
};
