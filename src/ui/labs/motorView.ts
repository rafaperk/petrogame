/**
 * Desenho da bancada de máquinas elétricas.
 *
 * Motor de indução: o corte do motor (estator com as três fases em faixas coloridas e o sentido das correntes, o
 * campo girante no entreferro com os polos N/S, o rotor de gaiola com as correntes induzidas nas barras), a curva
 * conjugado × rotação com a reta da carga (arraste para mudar a carga) e o ponto de operação, o triângulo de
 * potências com os capacitores e a placa do motor com a caixa de ligação (clique para trocar estrela/triângulo e a
 * rede). Os botões dão a partida direta ou estrela-triângulo e mostram a corrente × tempo.
 *
 * Alternador: o rotor de polos salientes girado pela turbina, as fases do estator com a tensão induzida, o
 * osciloscópio com as três fases e a rede de referência, o fluxo de potência turbina → carga e o banco de lâmpadas
 * (clique numa lâmpada para mudar a carga).
 */
import {
  F_N,
  fluxOf,
  genState,
  mechLoss,
  motorAt,
  motorState,
  nameplate,
  POLES,
  R2,
  ratedTorque,
  supplyOf,
  syncRpm,
  V_WIND,
  X2,
  type GenState,
  type MotorState,
  type Supply,
} from '../../learning/labs/motor';
import type { LabValues } from '../../learning/types';
import { approach, arrow, C, Chart, fmt, FONT, marker, niceAxis, roundRect, tag, text, ticksOf } from './draw';
import type { LabView } from './views';

const TAU = Math.PI * 2;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
const f2 = (x: number) => fmt(x, 2);

/** Cores das fases L1, L2, L3 (rgb). */
const PH = ['255,107,94', '255,201,77', '90,184,255'];
const PHC = PH.map((c) => `rgb(${c})`);
/** Faixas de cada par de polos, no sentido anti-horário: L1+, L3−, L2+, L1−, L3+, L2−. */
const BELT_PHASE = [0, 2, 1, 0, 2, 1];
const N_RGB = '255,112,96';
const S_RGB = '96,170,255';
const OUT_RGB = '255,174,66';
const IN_RGB = '126,224,255';

// ------------------------------------------------------------------ máquina
const M = { x: 228, y: 206 };
const R_FRAME = 170;
const R_OUT = 160;
const R_SLOT = 136;
const R_IN = 114;
const R_ROT = 98;
const R_BAR = 84;
const R_SH = 17;
/** Câmera lenta: rotações por segundo na tela para cada rotação por segundo de verdade. */
const VIS = 0.012;
const NB = 20;

// ------------------------------------------------------------------ painéis
const STRIP = { x: 16, y: 398, w: 436, h: 150 };
const CH = { x: 516, y: 46, w: 400, h: 178 };
const PT = { x: 470, y: 276, w: 228, h: 272 };
const NP = { x: 708, y: 276, w: 236, h: 272 };
const PLATE = { x: 716, y: 284, w: 220, h: 104 };
const TERM = { x: 716, y: 396, w: 220, h: 146 };
const TERM_X = [764, 826, 888];
const TERM_Y = [458, 500];
const NET_BTN = { x: 852, y: 402, w: 78, h: 20 };
const X_STEPS = [50, 100, 200, 250, 500, 1000];
const T_STEPS = [5, 10, 20, 25, 50, 100, 200, 250, 500];
const V_STEPS = [50, 100, 200, 250, 500];

/** Ponto na tela para o raio r e o ângulo th (anti-horário, a partir das 3 horas). */
const xy = (r: number, th: number): [number, number] => [M.x + r * Math.cos(th), M.y - r * Math.sin(th)];

/** Faixa de anel entre os raios r0 e r1 e os ângulos th0 < th1. */
function band(ctx: CanvasRenderingContext2D, r0: number, r1: number, th0: number, th1: number): void {
  ctx.beginPath();
  ctx.arc(M.x, M.y, r1, -th0, -th1, true);
  ctx.arc(M.x, M.y, r0, -th1, -th0, false);
  ctx.closePath();
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string | CanvasGradient, stroke?: string, lw = 1): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

/** ⊙ (corrente saindo do papel) ou ⊗ (entrando). */
function dotCross(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, out: boolean, color: string): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  if (out) {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.32, 0, TAU);
    ctx.fill();
  } else {
    const q = r * 0.62;
    ctx.beginPath();
    ctx.moveTo(x - q, y - q);
    ctx.lineTo(x + q, y + q);
    ctx.moveTo(x + q, y - q);
    ctx.lineTo(x - q, y + q);
    ctx.stroke();
  }
}

/** Texto com trechos em subscrito: as partes de índice ímpar ficam pequenas e mais baixas. Devolve a largura. */
function rich(ctx: CanvasRenderingContext2D, parts: string[], x: number, y: number, size: number, color: string, bold = false): number {
  let cx = x;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  parts.forEach((s, i) => {
    if (!s) return;
    const sub = i % 2 === 1;
    ctx.font = `${bold ? 700 : 600} ${sub ? Math.round(size * 0.72) : size}px ${FONT}`;
    ctx.fillText(s, cx, sub ? y + size * 0.26 : y);
    cx += ctx.measureText(s).width;
  });
  return cx - x;
}

function panel(ctx: CanvasRenderingContext2D, b: { x: number; y: number; w: number; h: number }, title?: string): void {
  ctx.fillStyle = C.bg2;
  roundRect(ctx, b.x, b.y, b.w, b.h, 8);
  ctx.fill();
  if (title) text(ctx, title, b.x + 12, b.y + 20, { size: 13, bold: true });
}

/** Seta curva em volta do centro da máquina (sentido de giro). */
function spinArrow(ctx: CanvasRenderingContext2D, r: number, thc: number, span: number, dir: number, color: string, width: number): void {
  const th0 = thc - (dir * span) / 2;
  const th1 = thc + (dir * span) / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(M.x, M.y, r, -th0, -th1, dir > 0);
  ctx.stroke();
  const [xa, ya] = xy(r, th1 - dir * 0.09);
  const [xb, yb] = xy(r, th1);
  arrow(ctx, xa, ya, xb, yb, color, width, 10);
}

/** Tensão certa na bobina para a mesma rede e frequência (para comparar com uma ligação errada). */
const ratedSupply = (sp: Supply): Supply => ({ ...sp, Vph: V_WIND * Math.min(1, sp.f / F_N) });

interface Curve {
  pts: [number, number][];
  ip: [number, number][];
  Tmax: number;
  nTmax: number;
  Tp: number;
  Ip: number;
}

/** Curvas conjugado × rotação e corrente × rotação para uma alimentação. */
function sample(sp: Supply, extra: number[] = []): Curve {
  const ns = syncRpm(sp.f, sp.p);
  const ss: number[] = [];
  for (let i = 0; i <= 120; i++) ss.push(1 - i / 120);
  ss.push(0.045, 0.035, 0.025, 0.018, 0.012, 0.008, 0.005, 0.003, 0.0015, ...extra);
  ss.sort((a, b) => b - a);
  const pts: [number, number][] = [];
  const ip: [number, number][] = [];
  let Tmax = 0;
  let nTmax = 0;
  for (const s0 of ss) {
    const s = Math.max(1e-6, s0);
    const mp = motorAt(sp, s);
    const n = ns * (1 - s);
    pts.push([n, mp.Tem]);
    ip.push([n, mp.IL]);
    if (mp.Tem > Tmax) {
      Tmax = mp.Tem;
      nTmax = n;
    }
  }
  return { pts, ip, Tmax, nTmax, Tp: pts[0][1], Ip: ip[0][1] };
}

/** Partida animada (direta ou estrela-triângulo). */
interface Run {
  mode: 'direct' | 'yd';
  /** Tempo desde a partida (s). */
  t: number;
  /** Velocidade angular do eixo (rad/s). */
  w: number;
  /** 0 = em estrela (só na estrela-triângulo), 1 = ligação final. */
  phase: 0 | 1;
  /** [t, corrente de linha, rotação, conjugado]. */
  samples: [number, number, number, number][];
  switchT: number | null;
  quiet: number;
  done: boolean;
  blocked: boolean;
  endClock: number;
  key: string;
}

interface Live {
  n: number;
  T: number;
  I: number;
  s: number;
  sp: Supply;
}

const runKey = (v: LabValues) => ['maq', 'poles', 'f', 'rede', 'load', 'seq'].map((k) => Math.round((v[k] ?? 0) * 100)).join('|');

export function motorView(): LabView {
  let phiF = 0;
  let phiR = 0;
  let clock = 0;
  let xTop = 2000;
  let yTop = 150;
  let vTop = 250;
  let ptScale = 14;
  let barTop = 10;
  let needle = 0;
  let tTop = 60;
  let run: Run | null = null;
  let refuse = -99;
  let dragLoad = false;
  /** Escala do gráfico de conjugado (para arrastar a carga). */
  let chartTop = 150;

  const isGen = (v: LabValues) => Math.round(v.maq ?? 0) === 1;
  const kOf = (p: number) => p / 2;

  /** Alimentação durante a partida (na estrela-triângulo, a fase 0 é em estrela). */
  const runSupply = (v: LabValues, r: Run): Supply => supplyOf(r.mode === 'yd' ? { ...v, lig: r.phase === 0 ? 1 : 0 } : v);

  const liveOf = (v: LabValues): Live | null => {
    if (!run || run.done || isGen(v)) return null;
    const sp = runSupply(v, run);
    const ns = syncRpm(sp.f, sp.p);
    const n = (run.w * 60) / TAU;
    const s = clamp(1 - n / ns, 1e-6, 1);
    const mp = motorAt(sp, s);
    return { n, T: mp.Tem, I: mp.IL, s, sp };
  };

  // ---------------------------------------------------------------- máquina (corte)
  function drawMachine(ctx: CanvasRenderingContext2D, d: number, st: MotorState | null, g: GenState | null, live: Live | null): void {
    const gen = !!g;
    const p = gen ? g.p : st!.sp.p;
    const k = kOf(p);
    const dir = gen ? 1 : st!.dir;
    const ns = gen ? g.n : st!.ns;
    const n = gen ? g.n : live ? live.n : st!.stall ? 0 : st!.n;
    phiF += (dir * (ns / 60) * VIS * TAU * d) % TAU;
    phiR += (dir * (n / 60) * VIS * TAU * d) % TAU;
    if (gen) phiF = phiR;
    const psi = k * phiF;
    const flux = gen ? g.phi : clamp(fluxOf(live ? live.sp : st!.sp), 0, 1.6);
    const amp = gen ? clamp(g.E / 220, 0, 1.2) : 1;

    // pés e carcaça aletada
    ctx.fillStyle = '#26364a';
    ctx.beginPath();
    ctx.moveTo(M.x - 128, M.y + 176);
    ctx.lineTo(M.x - 92, M.y + 118);
    ctx.lineTo(M.x + 92, M.y + 118);
    ctx.lineTo(M.x + 128, M.y + 176);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(M.x - 150, M.y + 174, 300, 10);
    ctx.strokeStyle = '#30445a';
    ctx.lineWidth = 4;
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * TAU;
      const [x0, y0] = xy(R_FRAME - 2, a);
      const [x1, y1] = xy(R_FRAME + 7, a);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    disc(ctx, M.x, M.y, R_FRAME, '#34475d', '#22303f', 2);
    // estator: chapas de aço-silício
    disc(ctx, M.x, M.y, R_OUT, '#4f5d6d');
    ctx.strokeStyle = 'rgba(0,0,0,0.13)';
    ctx.lineWidth = 1;
    for (let r = R_SLOT + 4; r < R_OUT; r += 5) {
      ctx.beginPath();
      ctx.arc(M.x, M.y, r, 0, TAU);
      ctx.stroke();
    }

    // faixas das fases (as bobinas), com o sentido da corrente (motor) ou da tensão induzida (alternador)
    const nbt = 3 * p;
    const w = TAU / nbt;
    for (let j = 0; j < nbt; j++) {
      const th0 = j * w + 0.025;
      const th1 = (j + 1) * w - 0.025;
      const ae = (j + 0.5) * (Math.PI / 3) - psi;
      // motor: a corrente de magnetização fica 90° adiante do fluxo; alternador: a tensão induzida acompanha o fluxo
      const J = (gen ? Math.cos(ae) : Math.sin(ae)) * amp;
      const ph = BELT_PHASE[j % 6];
      ctx.fillStyle = `rgba(${PH[ph]},${0.16 + 0.62 * Math.min(1, Math.abs(J))})`;
      band(ctx, R_IN + 4, R_SLOT, th0, th1);
      ctx.fill();
      if (Math.abs(J) > 0.3) {
        const [mx, my] = xy((R_IN + 4 + R_SLOT) / 2, (th0 + th1) / 2);
        dotCross(ctx, mx, my, p >= 8 ? 4 : 5, J > 0, `rgba(255,255,255,${0.35 + 0.6 * Math.min(1, Math.abs(J))})`);
      }
      if (j < 6 && j % 2 === 0) {
        const [lx, ly] = xy((R_SLOT + R_OUT) / 2, (th0 + th1) / 2);
        text(ctx, ['L1', 'L2', 'L3'][ph], lx, ly + 4, { size: 10, bold: true, align: 'center', color: PHC[ph] });
      }
    }

    // entreferro: o campo (N/S) que gira
    disc(ctx, M.x, M.y, R_IN, '#0c1520');
    const SEG = 120;
    for (let i = 0; i < SEG; i++) {
      const t0 = (i / SEG) * TAU;
      const t1 = ((i + 1) / SEG) * TAU;
      const B = flux * Math.cos(k * ((t0 + t1) / 2) - psi);
      const north = gen ? B > 0 : B < 0;
      ctx.fillStyle = `rgba(${north ? N_RGB : S_RGB},${clamp(Math.abs(B), 0, 1.4) * 0.6})`;
      band(ctx, R_ROT + 1, R_IN - 1, t0 - 0.003, t1 + 0.003);
      ctx.fill();
    }

    if (!gen) {
      // rotor de gaiola: as barras acendem com a corrente induzida (só existe com escorregamento)
      const s = live ? live.s : st!.s;
      const grad = ctx.createRadialGradient(M.x, M.y, R_SH, M.x, M.y, R_ROT);
      grad.addColorStop(0, '#5f6b79');
      grad.addColorStop(1, '#46515d');
      disc(ctx, M.x, M.y, R_ROT, grad);
      const barA = Math.pow(clamp(s / 0.028, 0, 1), 0.6);
      const lag = Math.atan((s * X2) / R2);
      for (let b = 0; b < NB; b++) {
        const th = phiR + (b / NB) * TAU;
        const i = dir * barA * Math.cos(k * th - psi + dir * lag);
        const [bx, by] = xy(R_BAR, th);
        disc(ctx, bx, by, 6.5, `rgba(${i > 0 ? OUT_RGB : IN_RGB},${0.1 + 0.88 * Math.abs(i)})`, '#2b3540', 1.2);
        if (Math.abs(i) > 0.35) dotCross(ctx, bx, by, 3.4, i > 0, 'rgba(18,24,32,0.85)');
      }
      ctx.strokeStyle = '#aeb6bf';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(M.x, M.y, R_ROT - 2, 0, TAU);
      ctx.stroke();
      // faixa pintada no rotor, para ver o giro
      const [ax, ay] = xy(R_SH + 5, phiR);
      const [bx2, by2] = xy(R_BAR - 11, phiR);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx2, by2);
      ctx.stroke();
    } else {
      // rotor de polos salientes, com as bobinas de campo (excitação em CC)
      const shoe = (0.62 * Math.PI) / p;
      const bw = clamp(((TAU * 52) / p) * 0.45, 12, 30);
      disc(ctx, M.x, M.y, R_SH + 12, '#58636f');
      for (let j = 0; j < p; j++) {
        const th = phiR + (j * Math.PI) / k;
        const north = j % 2 === 0;
        ctx.save();
        ctx.translate(M.x, M.y);
        ctx.rotate(-th);
        ctx.fillStyle = '#58636f';
        ctx.fillRect(R_SH + 2, -bw / 2, R_ROT - 16 - R_SH, bw);
        ctx.fillStyle = g.phi > 0 ? '#d08a3a' : '#7a5a35';
        ctx.fillRect(R_SH + 12, -bw / 2 - 7, R_ROT - 36 - R_SH, 7);
        ctx.fillRect(R_SH + 12, bw / 2, R_ROT - 36 - R_SH, 7);
        ctx.fillStyle = `rgba(${north ? N_RGB : S_RGB},${0.22 + 0.55 * clamp(g.phi, 0, 1.3)})`;
        ctx.beginPath();
        ctx.arc(0, 0, R_ROT, -shoe, shoe);
        ctx.arc(0, 0, R_ROT - 14, shoe, -shoe, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        if (g.phi > 0.02) {
          const [lx, ly] = xy(R_ROT - 25, th);
          text(ctx, north ? 'N' : 'S', lx, ly + 4, { size: 11, bold: true, align: 'center', color: '#fff', shadow: true });
        }
      }
    }
    // eixo com chaveta
    disc(ctx, M.x, M.y, R_SH, '#a9b2bc', '#2b3540', 2);
    const [kx, ky] = xy(R_SH - 5, phiR);
    disc(ctx, kx, ky, 3.5, '#2b3540');

    // polos do campo no entreferro
    if (flux > 0.05 && !gen)
      for (let m = 0; m < k; m++) {
        // polos do campo do estator: N onde o fluxo sai do estator e entra no rotor
        const thS = (psi + TAU * m) / k;
        const thN = thS + Math.PI / k;
        const [nx, ny] = xy((R_ROT + R_IN) / 2, thN);
        const [sx, sy] = xy((R_ROT + R_IN) / 2, thS);
        text(ctx, 'N', nx, ny + 4, { size: 11, bold: true, align: 'center', color: '#fff', shadow: true });
        text(ctx, 'S', sx, sy + 4, { size: 11, bold: true, align: 'center', color: '#fff', shadow: true });
      }

    // sentidos de giro e rótulos
    if (ns > 0.5) spinArrow(ctx, R_FRAME + 17, Math.PI / 6, 0.55, dir, `rgb(${N_RGB})`, 3);
    if (n > 0.5) spinArrow(ctx, 56, (7 * Math.PI) / 6, 0.85, dir, 'rgba(255,255,255,0.75)', 3);
    text(ctx, gen ? 'Corte do alternador (câmera lenta)' : 'Corte do motor (câmera lenta)', 16, 22, { size: 12, color: C.dim, bold: true });
    dotCross(ctx, 23, 39, 5, true, C.dim);
    text(ctx, 'saindo', 32, 43, { size: 11, color: C.dim });
    dotCross(ctx, 85, 39, 5, false, C.dim);
    text(ctx, 'entrando', 94, 43, { size: 11, color: C.dim });
    if (gen) {
      text(ctx, `rotor e campo: ${f0(g.n)} rpm`, 452, 24, { size: 12, bold: true, align: 'right', color: `rgb(${N_RGB})` });
      text(ctx, 'excitação CC por anéis e escovas', 452, 41, { size: 11, align: 'right', color: C.dim });
    } else {
      text(ctx, `campo: ${f0(ns)} rpm`, 452, 24, { size: 12, bold: true, align: 'right', color: `rgb(${N_RGB})` });
      text(ctx, `rotor: ${f0(n)} rpm`, 452, 41, { size: 12, bold: true, align: 'right', color: C.text });
      if (dir < 0) text(ctx, '(sentido invertido)', 452, 57, { size: 11, align: 'right', color: C.amber });
    }
  }

  // ---------------------------------------------------------------- faixa das contas
  function drawStripMotor(ctx: CanvasRenderingContext2D, st: MotorState, live: Live | null): void {
    panel(ctx, STRIP);
    const x = STRIP.x + 14;
    const y = STRIP.y;
    const n = live ? live.n : st.stall ? 0 : st.n;
    const s = live ? live.s : st.s;
    rich(ctx, ['n', 's', ` = 120·f/p = 120·${f0(st.sp.f)}/${st.sp.p} = ${f0(st.ns)} rpm`], x, y + 27, 15, C.text, true);
    rich(ctx, [`n = ${f0(n)} rpm  →  s = (n`, 's', ' − n)/n', 's', ` = ${f1(s * 100)} %`], x, y + 54, 14, C.text);
    const IL = live ? live.I : st.stall ? st.start.IL : st.pt.IL;
    text(ctx, `Barras do rotor: s·f = ${f1(s * st.sp.f)} Hz · corrente de linha ${f1(IL)} A`, x, y + 79, { size: 12.5, color: C.dim });
    const w = (TAU * n) / 60;
    const T = live ? live.T : st.T;
    text(ctx, `P = T·ω = ${f1(T)} N·m × ${f1(w)} rad/s = ${f2((T * w) / 1000)} kW`, x, y + 102, { size: 12.5, color: C.dim });
    const lig = st.sp.lig === 1 ? 'estrela' : 'triângulo';
    const over = st.over;
    const low = st.sp.Vph < 0.8 * V_WIND * Math.min(1, st.sp.f / F_N);
    text(ctx, `Cada bobina recebe ${f0(st.sp.Vph)} V (${lig} na rede de ${st.net} V${st.sp.f !== F_N ? `, inversor a ${f0(st.sp.f)} Hz` : ''})`, x, y + 126, {
      size: 12.5,
      bold: true,
      color: over ? C.bad : low ? C.amber : C.good,
    });
  }

  function drawStripGen(ctx: CanvasRenderingContext2D, g: GenState, v: LabValues): void {
    panel(ctx, STRIP);
    // turbina
    const cx = STRIP.x + 54;
    const cy = STRIP.y + 68;
    disc(ctx, cx, cy, 38, '#1d2c3e', C.line, 2);
    for (let b = 0; b < 10; b++) {
      const a = phiR + (b / 10) * TAU;
      ctx.strokeStyle = C.metalLight;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 9, cy - Math.sin(a) * 9);
      ctx.quadraticCurveTo(cx + Math.cos(a + 0.5) * 24, cy - Math.sin(a + 0.5) * 24, cx + Math.cos(a + 0.35) * 33, cy - Math.sin(a + 0.35) * 33);
      ctx.stroke();
    }
    disc(ctx, cx, cy, 8, C.metal, '#2b3540', 2);
    text(ctx, 'turbina', cx, STRIP.y + 124, { size: 11.5, color: C.dim, align: 'center', bold: true });
    text(ctx, `${f1(g.T)} N·m`, cx, STRIP.y + 140, { size: 11.5, color: C.amber, align: 'center', bold: true });

    const x = STRIP.x + 108;
    const y = STRIP.y;
    text(ctx, `f = p·n/120 = ${g.p}·${f0(g.n)}/120 = ${f1(g.f)} Hz`, x, y + 27, { size: 15, bold: true });
    text(ctx, `Tensão gerada (a vazio): E ∝ n·Φ → ${f0(g.E)} V`, x, y + 53, { size: 12.5, color: C.dim });
    const kw = v.kw ?? 0;
    text(ctx, kw > 0 ? `Com a carga: ${f0(g.V)} V nos terminais e ${f1(g.I)} A` : 'Sem carga: tensão nos terminais = E, corrente zero', x, y + 77, { size: 12.5, color: C.dim });
    const w = (TAU * g.n) / 60;
    text(ctx, `Turbina: T = P/ω = ${f2(g.Pt / 1000)} kW ÷ ${f1(w)} rad/s = ${f1(g.T)} N·m`, x, y + 101, { size: 12.5, color: C.dim });
    text(ctx, `Excitação ${f0(v.exc ?? 100)} % → fluxo ${f0(g.phi * 100)} % do nominal`, x, y + 125, { size: 12.5, bold: true, color: g.phi > 0 ? C.text : C.amber });
  }

  // ---------------------------------------------------------------- conjugado × rotação
  function drawTorque(ctx: CanvasRenderingContext2D, st: MotorState, d: number, live: Live | null): void {
    const ns = st.ns;
    xTop = approach(xTop, niceAxis(ns * 1.06, X_STEPS, 6).top, d, 6);
    const rated = ratedSupply(st.sp);
    const wrong = Math.abs(st.sp.Vph - rated.Vph) > 5;
    const cur = sample(st.sp, [st.s]);
    const ref = wrong ? sample(rated) : null;
    const peak = Math.max(cur.Tmax, st.TL, ref ? ref.Tmax : 0) * 1.12;
    yTop = approach(yTop, niceAxis(peak, T_STEPS, 5).top, d, 6);
    chartTop = yTop;
    const ch = new Chart(ctx, { ...CH, x0: 0, x1: xTop, y0: 0, y1: yTop });
    ch.frame('Conjugado × rotação', 'rotação (rpm)', 'conjugado (N·m)', ticksOf(0, xTop, niceAxis(xTop, X_STEPS, 6).step), ticksOf(0, yTop, niceAxis(yTop, T_STEPS, 5).step));

    // corrente (escala própria: o máximo é a corrente de partida)
    const iTop = Math.max(cur.Ip, ref ? ref.Ip : 0) / 0.86;
    const kI = yTop / iTop;
    ch.poly(
      cur.ip.map(([n, i]) => [n, i * kI] as [number, number]),
      'rgba(255,174,66,0.8)',
      1.8,
      [6, 4],
    );
    if (ref) {
      ch.poly(ref.pts, 'rgba(200,210,222,0.5)', 2, [5, 4]);
      const yd = run && run.mode === 'yd' && !run.done;
      text(ctx, yd ? 'depois, em triângulo' : 'com a ligação certa', ch.X(ref.nTmax), ch.Y(ref.Tmax) - 8, { size: 10.5, color: C.dim, align: 'center' });
    }
    ch.poly(cur.pts, C.curve1, 3);

    // carga
    ch.poly(
      [
        [0, st.TL],
        [xTop, st.TL],
      ],
      dragLoad ? '#b6f5c6' : C.curve3,
      2.5,
    );
    // rótulos da carga e da partida ficam em lados opostos da reta da carga
    const tpAbove = cur.Tp >= st.TL;
    text(ctx, `carga ${f1(st.TL)} N·m (${f0((st.TL / st.TN) * 100)} %)`, CH.x + 8, ch.Y(st.TL) + (tpAbove ? 15 : -6), { size: 11, color: C.curve3, bold: true });

    // rotação síncrona
    ctx.strokeStyle = `rgba(${N_RGB},0.8)`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ch.X(ns), CH.y);
    ctx.lineTo(ch.X(ns), CH.y + CH.h);
    ctx.stroke();
    ctx.setLineDash([]);
    rich(ctx, ['n', 's'], ch.X(ns) + 4, CH.y + 12, 12, `rgb(${N_RGB})`, true);

    // partida e máximo
    ch.dot(0, cur.Tp, C.curve1, 4);
    text(ctx, `partida ${f0(cur.Tp)} N·m`, ch.X(0) + 7, ch.Y(cur.Tp) + (tpAbove ? -8 : 15), { size: 10.5, color: C.curve1, bold: true });
    text(ctx, `I partida ${f0(cur.Ip)} A`, ch.X(0) + 7, ch.Y(cur.Ip * kI) - 5, { size: 10.5, color: C.curve2, bold: true });
    ch.dot(cur.nTmax, cur.Tmax, C.curve1, 4);
    text(ctx, `máx. ${f0(cur.Tmax)} N·m`, ch.X(cur.nTmax), ch.Y(cur.Tmax) - 8, { size: 10.5, color: C.curve1, align: 'center', bold: true });

    if (live) {
      const r = run!;
      ch.poly(
        r.samples.map(([, , n, T]) => [n, T] as [number, number]),
        'rgba(255,255,255,0.55)',
        2,
      );
      ch.dot(live.n, live.T, '#fff', 5.5);
      tag(ctx, `I = ${f0(live.I)} A`, clamp(ch.X(live.n), CH.x + 40, CH.x + CH.w - 40), ch.Y(live.T) - 12, C.curve2);
      return;
    }
    if (st.stall) {
      ch.dot(0, st.Tp, C.bad, 7);
      tag(ctx, 'tombou: parado', ch.X(0) + 62, ch.Y(st.Tp) - 14, C.bad);
      return;
    }
    // escorregamento
    const yb = CH.y + CH.h - 10;
    const xa = ch.X(st.n);
    const xb = ch.X(ns);
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xa, yb - 5);
    ctx.lineTo(xa, yb + 5);
    ctx.moveTo(xa, yb);
    ctx.lineTo(xb, yb);
    ctx.moveTo(xb, yb - 5);
    ctx.lineTo(xb, yb + 5);
    ctx.stroke();
    tag(ctx, `s = ${f1(st.s * 100)} %`, Math.min(xa, xb) - 6, yb + 2, C.amber, 'right', 11);
    marker(ch, ctx, st.n, st.T);
    const nearMax = Math.abs(ch.Y(st.T) - ch.Y(cur.Tmax)) < 24 && Math.abs(ch.X(st.n) - ch.X(cur.nTmax)) < 110;
    tag(ctx, `${f0(st.n)} rpm`, ch.X(st.n) - 12, ch.Y(st.T) + (nearMax ? 20 : -12), '#fff', 'right', 11);
  }

  // ---------------------------------------------------------------- triângulo de potências
  function drawTriangle(ctx: CanvasRenderingContext2D, st: MotorState, d: number): void {
    panel(ctx, PT, 'Triângulo de potências');
    const P = st.pt.P / 1000;
    const Qm = st.pt.Q / 1000;
    const Qc = st.Qcap / 1000;
    const Qn = st.Qnet / 1000;
    const Sm = Math.hypot(P, Qm);
    const O = { x: PT.x + 26, y: PT.y + 186 };
    ptScale = approach(ptScale, Math.min(132 / Math.max(P, 0.3), 136 / Math.max(Qm, Qc, 0.3)), d, 4);
    const k = ptScale;
    const px = O.x + P * k;
    const qy = O.y - Qm * k;
    const ny = O.y - Qn * k;
    // ângulo φ
    const phi = Math.atan2(Qm, P);
    ctx.strokeStyle = C.dim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(O.x, O.y, 26, 0, -phi, true);
    ctx.stroke();
    text(ctx, 'φ', O.x + 30 * Math.cos(phi / 2) + 2, O.y - 30 * Math.sin(phi / 2) + 5, { size: 12, color: C.dim, bold: true });
    arrow(ctx, O.x, O.y, px, O.y, C.curve3, 3, 10);
    arrow(ctx, px, O.y, px, qy, C.amber, 3, 10);
    arrow(ctx, O.x, O.y, px, qy, C.curve1, 3, 10);
    text(ctx, `P ${f2(P)} kW`, (O.x + px) / 2, O.y + 17, { size: 11.5, color: C.curve3, align: 'center', bold: true });
    text(ctx, 'Q', px + 7, Math.max(qy + 14, (O.y + qy) / 2 - 4), { size: 11.5, color: C.amber, bold: true });
    text(ctx, `${f2(Qm)} kvar`, px + 7, Math.max(qy + 28, (O.y + qy) / 2 + 10), { size: 10.5, color: C.amber });
    const mx = (O.x + px) / 2;
    const my = (O.y + qy) / 2;
    text(ctx, `S ${f2(Sm)} kVA`, mx - 8, my - 6, { size: 11.5, color: C.curve1, align: 'right', bold: true });
    if (Qc > 0) {
      arrow(ctx, px - 7, qy, px - 7, ny, C.violet, 3, 10);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(O.x, O.y);
      ctx.lineTo(px, ny);
      ctx.stroke();
      ctx.setLineDash([]);
      rich(ctx, ['Q', 'c', ` ${f1(Qc)} kvar`], px + 7, clamp(ny + 4, qy + 44, O.y + 30), 11, C.violet, true);
    }
    const y0 = PT.y + 222;
    text(ctx, `cos φ = P/S = ${f2(st.fp)}   ·   S² = P² + Q²`, PT.x + 12, y0, { size: 12, bold: true });
    if (Qc > 0) {
      text(ctx, `Rede: cos φ = ${f2(st.fpNet)}${Qn < 0 ? ' (adiantado)' : ''}`, PT.x + 12, y0 + 20, { size: 11.5, color: C.violet, bold: true });
      text(ctx, `corrente na rede ${f1(st.Inet)} A (motor ${f1(st.pt.IL)} A)`, PT.x + 12, y0 + 37, { size: 11, color: C.dim });
    } else {
      text(ctx, 'Q magnetiza o ferro e volta para a rede;', PT.x + 12, y0 + 20, { size: 11, color: C.dim });
      text(ctx, 'só P vira trabalho e calor.', PT.x + 12, y0 + 36, { size: 11, color: C.dim });
    }
  }

  // ---------------------------------------------------------------- corrente × tempo na partida
  function drawRunChart(ctx: CanvasRenderingContext2D, st: MotorState, d: number): void {
    const r = run!;
    const tEnd = Math.max(1.5, r.t);
    tTop = approach(tTop, niceAxis(tEnd * 1.08, [0.5, 1, 2, 5], 5).top, d, 6);
    const peak = r.samples.reduce((a, s) => Math.max(a, s[1]), 1);
    const iTop = niceAxis(peak * 1.12, [10, 20, 25, 50, 100], 5).top;
    const ch = new Chart(ctx, { x: PT.x + 52, y: PT.y + 36, w: PT.w - 66, h: PT.h - 120, x0: 0, x1: tTop, y0: 0, y1: iTop });
    ch.frame(r.mode === 'yd' ? 'Partida Y-Δ: corrente' : 'Partida direta: corrente', 'tempo (s)', 'A', ticksOf(0, tTop, niceAxis(tTop, [0.5, 1, 2, 5], 5).step), ticksOf(0, iTop, niceAxis(iTop, [10, 20, 25, 50, 100], 5).step), 0, 1);
    const IN = nameplate(st.sp.p).I220 / (st.net === 380 ? Math.sqrt(3) : 1);
    ch.poly(
      [
        [0, IN],
        [tTop, IN],
      ],
      'rgba(126,224,138,0.7)',
      1.5,
      [5, 4],
    );
    text(ctx, `nominal ${f0(IN)} A`, ch.X(tTop) - 2, ch.Y(IN) - 4, { size: 10, color: C.curve3, align: 'right' });
    ch.poly(
      r.samples.map(([t, i]) => [t, i] as [number, number]),
      C.curve2,
      2.5,
    );
    const top = r.samples.reduce((a, s) => (s[1] > a[1] ? s : a), r.samples[0] ?? [0, 0, 0, 0]);
    if (top) text(ctx, `pico ${f0(top[1])} A = ${f1(top[1] / IN)}× a nominal`, PT.x + 12, PT.y + PT.h - 30, { size: 11.5, color: C.curve2, bold: true });
    let note = '';
    if (r.blocked) note = 'Não partiu: conjugado de partida < carga.';
    else if (r.mode === 'yd' && r.switchT !== null) note = `Comutou para Δ em ${f1(r.switchT)} s (2º pico).`;
    else if (r.done) note = `Chegou à rotação em ${f1(r.t)} s.`;
    else note = 'Acelerando…';
    text(ctx, note, PT.x + 12, PT.y + PT.h - 14, { size: 11, color: r.blocked ? C.bad : C.dim });
  }

  // ---------------------------------------------------------------- placa e caixa de ligação
  function drawPlate(ctx: CanvasRenderingContext2D, st: MotorState): void {
    panel(ctx, NP);
    const pl = nameplate(st.sp.p);
    const grad = ctx.createLinearGradient(PLATE.x, PLATE.y, PLATE.x + PLATE.w, PLATE.y + PLATE.h);
    grad.addColorStop(0, '#d5dbe2');
    grad.addColorStop(1, '#9ba6b1');
    ctx.fillStyle = grad;
    roundRect(ctx, PLATE.x, PLATE.y, PLATE.w, PLATE.h, 5);
    ctx.fill();
    ctx.strokeStyle = '#5c6874';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    for (const [rx, ry] of [
      [PLATE.x + 7, PLATE.y + 7],
      [PLATE.x + PLATE.w - 7, PLATE.y + 7],
      [PLATE.x + 7, PLATE.y + PLATE.h - 7],
      [PLATE.x + PLATE.w - 7, PLATE.y + PLATE.h - 7],
    ])
      disc(ctx, rx, ry, 2.6, '#6b7682');
    const dark = '#1a2430';
    const lines = [
      `7,5 kW (10 cv) · 60 Hz · ${pl.p} polos`,
      `220/380 V · ${f1(pl.I220)}/${f1(pl.I380)} A`,
      `${f0(pl.n)} rpm · cos φ ${f2(pl.fp)} · η ${f1(pl.eta * 100)} %`,
      `Ip/In ${f1(pl.IpIn)} · FS 1,15 · Isol. F · IP55 · S1`,
    ];
    text(ctx, 'MOTOR DE INDUÇÃO TRIFÁSICO', PLATE.x + PLATE.w / 2, PLATE.y + 20, { size: 11, bold: true, color: dark, align: 'center' });
    lines.forEach((s, i) => text(ctx, s, PLATE.x + PLATE.w / 2, PLATE.y + 40 + i * 17, { size: 11, color: dark, align: 'center' }));

    // caixa de ligação
    const right = (st.net === 220 && st.sp.lig === 0) || (st.net === 380 && st.sp.lig === 1);
    const tone = right ? C.good : st.over ? C.bad : C.amber;
    ctx.fillStyle = '#1b2a3c';
    roundRect(ctx, TERM.x, TERM.y, TERM.w, TERM.h, 6);
    ctx.fill();
    ctx.strokeStyle = tone;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
    text(ctx, 'Caixa de ligação', TERM.x + 9, TERM.y + 19, { size: 11.5, bold: true, color: C.dim });
    ctx.fillStyle = 'rgba(255,201,77,0.16)';
    roundRect(ctx, NET_BTN.x, NET_BTN.y, NET_BTN.w, NET_BTN.h, 5);
    ctx.fill();
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 1;
    ctx.stroke();
    text(ctx, `rede ${st.net} V ⇄`, NET_BTN.x + NET_BTN.w / 2, NET_BTN.y + 14, { size: 11, bold: true, color: C.amber, align: 'center' });
    const name = st.sp.lig === 1 ? 'Estrela (Y)' : 'Triângulo (Δ)';
    text(ctx, `${name}: ${f0(st.sp.Vph / Math.min(1, st.sp.f / F_N))} V em cada bobina`, TERM.x + 9, TERM.y + 39, { size: 11.5, bold: true, color: tone });
    // linhas da rede até 1, 2, 3
    TERM_X.forEach((x, i) => {
      ctx.strokeStyle = PHC[i];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, TERM.y + TERM.h - 6);
      ctx.lineTo(x, TERM_Y[1] + 9);
      ctx.stroke();
      text(ctx, `L${i + 1}`, x - 8, TERM.y + TERM.h - 10, { size: 10, bold: true, color: PHC[i], align: 'right' });
    });
    // pontes
    ctx.strokeStyle = '#d99a4e';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (st.sp.lig === 1) {
      ctx.moveTo(TERM_X[0], TERM_Y[0]);
      ctx.lineTo(TERM_X[2], TERM_Y[0]);
    } else
      for (const x of TERM_X) {
        ctx.moveTo(x, TERM_Y[0]);
        ctx.lineTo(x, TERM_Y[1]);
      }
    ctx.stroke();
    ctx.lineCap = 'butt';
    const labels = [
      ['6', '4', '5'],
      ['1', '2', '3'],
    ];
    TERM_Y.forEach((y, row) =>
      TERM_X.forEach((x, col) => {
        disc(ctx, x, y, 10, '#c8d1db', '#56616e', 2);
        text(ctx, labels[row][col], x, y + 4, { size: 11, bold: true, color: '#1a2430', align: 'center' });
      }),
    );
  }

  // ---------------------------------------------------------------- alternador: osciloscópio, potência e lâmpadas
  function drawScope(ctx: CanvasRenderingContext2D, g: GenState, d: number): void {
    const Vpk = (g.V / Math.sqrt(3)) * Math.SQRT2;
    const refPk = (220 / Math.sqrt(3)) * Math.SQRT2;
    vTop = approach(vTop, niceAxis(Math.max(Vpk, refPk) * 1.15, V_STEPS, 4).top, d, 6);
    const ch = new Chart(ctx, { ...CH, x0: 0, x1: 50, y0: -vTop, y1: vTop });
    ch.frame('Osciloscópio', 'tempo (ms)', '', ticksOf(0, 50, 10), ticksOf(-vTop, vTop, niceAxis(vTop, V_STEPS, 4).step));
    const wave = (pk: number, f: number, ph: number): [number, number][] => {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 300; i++) {
        const t = (50 * i) / 300;
        pts.push([t, pk * Math.sin((TAU * f * t) / 1000 - ph)]);
      }
      return pts;
    };
    ch.poly(wave(refPk, 60, 0), 'rgba(200,210,222,0.55)', 1.6, [5, 4]);
    for (let i = 0; i < 3; i++) ch.poly(wave(Vpk, g.f, (i * TAU) / 3), PHC[i], 2.2);
    // período
    if (g.f > 0 && Vpk > 1) {
      const T = 1000 / g.f;
      if (T <= 50) {
        const y = CH.y + 10;
        ctx.strokeStyle = C.text;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ch.X(0), y);
        ctx.lineTo(ch.X(T), y);
        ctx.moveTo(ch.X(T), y - 5);
        ctx.lineTo(ch.X(T), y + 5);
        ctx.stroke();
        text(ctx, `T = 1/f = ${f1(T)} ms`, ch.X(T) + 6, y + 4, { size: 11, bold: true });
      } else text(ctx, `T = 1/f = ${f0(T)} ms (maior que a janela)`, CH.x + 8, CH.y + 14, { size: 11, bold: true });
    }
    // legenda
    const lx = CH.x + 6;
    const ly = CH.y - 14;
    ['L1', 'L2', 'L3'].forEach((s, i) => {
      ctx.fillStyle = PHC[i];
      ctx.fillRect(lx + 92 + i * 40, ly - 5, 14, 3);
      text(ctx, s, lx + 110 + i * 40, ly, { size: 11, color: C.text });
    });
    ctx.strokeStyle = 'rgba(200,210,222,0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(lx + 214, ly - 4);
    ctx.lineTo(lx + 230, ly - 4);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'rede 220 V · 60 Hz', lx + 234, ly, { size: 11, color: C.dim });
  }

  function drawPower(ctx: CanvasRenderingContext2D, g: GenState, d: number): void {
    panel(ctx, PT, 'Turbina → gerador → carga');
    barTop = approach(barTop, niceAxis(Math.max(g.Pt / 1000, 1) * 1.05, [1, 2, 5, 10, 20, 50], 4).top, d, 5);
    const x0 = PT.x + 14;
    const wMax = PT.w - 28;
    const y = PT.y + 50;
    const segs: [number, string, string][] = [
      [g.P, C.curve3, 'carga'],
      [g.pCu, C.curve2, 'cobre'],
      [g.pFe, C.violet, 'ferro'],
      [g.pMec, C.dim, 'atrito'],
    ];
    text(ctx, `turbina: ${f2(g.Pt / 1000)} kW`, x0, y - 8, { size: 11.5, color: C.text, bold: true });
    ctx.fillStyle = '#0d1824';
    ctx.fillRect(x0, y, wMax, 20);
    let x = x0;
    for (const [pw, col] of segs) {
      const w = (pw / 1000 / barTop) * wMax;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, w, 20);
      x += w;
    }
    segs.forEach(([pw, col, name], i) => {
      const cx = x0 + (i % 2) * 104;
      const cy = y + 38 + Math.floor(i / 2) * 17;
      ctx.fillStyle = col;
      ctx.fillRect(cx, cy - 8, 10, 10);
      text(ctx, `${name} ${f2(pw / 1000)} kW`, cx + 14, cy + 1, { size: 11, color: C.text });
    });
    text(ctx, `rendimento ${f1(g.eta * 100)} %`, x0, y + 86, { size: 11.5, color: C.dim, bold: true });

    // mostrador de torque
    const cx = PT.x + PT.w / 2;
    const cy = PT.y + 226;
    const r = 60;
    tTop = approach(tTop, niceAxis(Math.max(g.T, 10) * 1.1, [10, 20, 25, 50, 100], 5).top, d, 5);
    needle = approach(needle, g.T, d, 6);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = C.amber;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * clamp(needle / tTop, 0, 1));
    ctx.stroke();
    const a = Math.PI + Math.PI * clamp(needle / tTop, 0, 1);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4));
    ctx.stroke();
    disc(ctx, cx, cy, 5, '#fff');
    text(ctx, '0', cx - r, cy + 16, { size: 10, color: C.dim, align: 'center' });
    text(ctx, f0(tTop), cx + r, cy + 16, { size: 10, color: C.dim, align: 'center' });
    text(ctx, `${f1(g.T)} N·m`, cx, cy - 18, { size: 14, bold: true, align: 'center', color: C.amber });
    text(ctx, 'torque no eixo da turbina', cx, cy + 32, { size: 11, color: C.dim, align: 'center' });
  }

  const BULB = (j: number) => ({ x: NP.x + 40 + (j % 4) * 52, y: NP.y + 56 + Math.floor(j / 4) * 50 });

  function drawLamps(ctx: CanvasRenderingContext2D, g: GenState, v: LabValues): void {
    panel(ctx, NP, 'Carga: 12 lâmpadas de 1 kW');
    const kw = v.kw ?? 0;
    const glow = clamp((g.V / 220) ** 2, 0, 1.4);
    for (let j = 0; j < 12; j++) {
      const { x, y } = BULB(j);
      const lit = clamp(kw - j, 0, 1);
      const b = lit * glow;
      if (b > 0.02) {
        const rg = ctx.createRadialGradient(x, y, 2, x, y, 30);
        rg.addColorStop(0, `rgba(255,230,140,${0.75 * Math.min(1, b)})`);
        rg.addColorStop(1, 'rgba(255,230,140,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(x - 30, y - 30, 60, 60);
      }
      disc(ctx, x, y, 14, b > 0.02 ? `rgba(255,${200 + Math.round(40 * Math.min(1, b))},${90 + Math.round(80 * Math.min(1, b))},${0.35 + 0.6 * Math.min(1, b)})` : 'rgba(170,185,200,0.18)', lit > 0 ? '#e9d79a' : '#56616e', 1.5);
      ctx.fillStyle = '#7d8894';
      ctx.fillRect(x - 6, y + 13, 12, 8);
    }
    const y0 = NP.y + 200;
    text(ctx, `${f1(kw)} kW se recebessem 220 V`, NP.x + 12, y0, { size: 11.5, color: C.text, bold: true });
    text(ctx, kw > 0 ? `recebem ${f0(g.V)} V → consomem ${f2(g.P / 1000)} kW` : 'tudo apagado: gerador a vazio', NP.x + 12, y0 + 18, { size: 11, color: C.dim });
    text(ctx, `corrente: ${f1(g.I)} A por fase`, NP.x + 12, y0 + 35, { size: 11, color: C.dim });
    text(ctx, 'clique numa lâmpada para mudar a carga', NP.x + 12, y0 + 56, { size: 10.5, color: C.dim });
  }

  // ---------------------------------------------------------------- interação
  const inChart = (x: number, y: number) => x >= CH.x && x <= CH.x + CH.w && y >= CH.y - 4 && y <= CH.y + CH.h + 4;
  const inTerm = (x: number, y: number) => x >= TERM_X[0] - 22 && x <= TERM_X[2] + 22 && y >= TERM_Y[0] - 16 && y <= TERM_Y[1] + 16;
  const inNet = (x: number, y: number) => x >= NET_BTN.x && x <= NET_BTN.x + NET_BTN.w && y >= NET_BTN.y && y <= NET_BTN.y + NET_BTN.h;
  const bulbAt = (x: number, y: number) => {
    for (let j = 0; j < 12; j++) {
      const b = BULB(j);
      if (Math.hypot(x - b.x, y - b.y) <= 17) return j;
    }
    return -1;
  };
  const loadAt = (y: number, v: LabValues) => {
    const p = POLES[Math.round(v.poles ?? 1)] ?? 4;
    const T = ((CH.y + CH.h - y) / CH.h) * chartTop;
    return clamp(Math.round(((T / ratedTorque(p)) * 100) / 5) * 5, 0, 400);
  };

  const startRun = (mode: 'direct' | 'yd', v: LabValues): Run => ({
    mode,
    t: 0,
    w: 0,
    phase: mode === 'yd' ? 0 : 1,
    samples: [],
    switchT: null,
    quiet: 0,
    done: false,
    blocked: false,
    endClock: 0,
    key: runKey(v),
  });

  return {
    reset() {
      run = null;
      refuse = -99;
      dragLoad = false;
      phiF = phiR = 0;
    },
    actions: [
      {
        label: '▶ Partida direta',
        title: 'Liga o motor parado direto na rede e mostra a corrente de partida.',
        run(api) {
          const v = api.get();
          if (isGen(v)) api.set({ maq: 0 });
          run = startRun('direct', { ...v, maq: 0 });
        },
      },
      {
        label: '▶ Partida estrela-triângulo',
        title: 'Parte em estrela (corrente e conjugado ÷ 3) e passa para triângulo perto de 90 % da rotação. Só na rede de 220 V.',
        run(api) {
          const v = api.get();
          if (isGen(v)) api.set({ maq: 0 });
          if (Math.round(v.rede ?? 0) === 1) {
            refuse = clock;
            run = null;
            return;
          }
          if (api.isLocked('lig')) {
            run = startRun('direct', { ...v, maq: 0 });
            return;
          }
          api.set({ lig: 1 });
          run = startRun('yd', { ...v, maq: 0 });
        },
      },
    ],
    tick(v, dt) {
      clock += dt;
      if (!run) return null;
      if (run.done) {
        if (runKey(v) !== run.key || clock - run.endClock > 14) run = null;
        return null;
      }
      if (isGen(v)) {
        run = null;
        return null;
      }
      const p = POLES[Math.round(v.poles ?? 1)] ?? 4;
      const J = 0.35 * (p / 4) ** 2;
      const TL = (Math.max(0, v.load ?? 100) / 100) * ratedTorque(p);
      let out: LabValues | null = null;
      let acc = 0;
      const steps = 8;
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const sp = runSupply(v, run);
        const ws = (syncRpm(sp.f, sp.p) * TAU) / 60;
        const s = clamp(1 - run.w / ws, 1e-6, 1);
        const T = motorAt(sp, s).Tem;
        const n = (run.w * 60) / TAU;
        const Tf = run.w > 0.5 ? mechLoss(n) / run.w : 0;
        acc = (T - TL - Tf) / J;
        if (run.w <= 0 && acc < 0) acc = 0;
        run.w = clamp(run.w + acc * h, 0, ws);
        run.t += h;
      }
      const lv = liveOf(v);
      if (lv) run.samples.push([run.t, lv.I, lv.n, lv.T]);
      const TN = ratedTorque(p);
      run.quiet = Math.abs(acc * J) < 0.015 * TN && run.t > 0.25 ? run.quiet + dt : 0;
      if (run.mode === 'yd' && run.phase === 0) {
        const ns = lv ? syncRpm(lv.sp.f, lv.sp.p) : 1800;
        if ((lv && lv.n >= 0.9 * ns) || run.quiet > 0.3 || (run.t > 1.2 && run.w < 0.5)) {
          run.phase = 1;
          run.switchT = run.t;
          run.quiet = 0;
          out = { lig: 0 };
        }
      } else if (run.t > 1.2 && run.w < 0.5) {
        run.blocked = true;
        run.done = true;
      } else if (run.quiet > 0.35) run.done = true;
      if (run.t > 30) run.done = true;
      if (run.done) {
        run.endClock = clock;
        run.key = runKey({ ...v, ...(out ?? {}) });
      }
      return out;
    },
    pointer(kind, x, y, v): LabValues | null {
      if (isGen(v)) {
        if (kind !== 'down') return null;
        const j = bulbAt(x, y);
        if (j < 0) return null;
        const kw = v.kw ?? 0;
        return { kw: j === 0 && kw >= 0.5 && kw <= 1 ? 0 : j + 1 };
      }
      if (kind === 'down') {
        if (inNet(x, y)) return { rede: Math.round(v.rede ?? 0) === 1 ? 0 : 1 };
        if (inTerm(x, y)) return { lig: Math.round(v.lig ?? 0) === 1 ? 0 : 1 };
        dragLoad = inChart(x, y);
      }
      if (!dragLoad) return null;
      const out: LabValues = { load: loadAt(y, v) };
      if (kind === 'up') dragLoad = false;
      return out;
    },
    cursor(x, y, v) {
      if (isGen(v)) return bulbAt(x, y) >= 0 ? 'pointer' : 'default';
      if (inNet(x, y) || inTerm(x, y)) return 'pointer';
      if (dragLoad || inChart(x, y)) return 'ns-resize';
      return 'default';
    },
    draw(ctx, v, _o, dt) {
      const d = Math.min(dt, 0.05);
      if (isGen(v)) {
        const g = genState(v);
        drawMachine(ctx, d, null, g, null);
        drawStripGen(ctx, g, v);
        drawScope(ctx, g, d);
        drawPower(ctx, g, d);
        drawLamps(ctx, g, v);
        return;
      }
      const st = motorState(v);
      const live = liveOf(v);
      drawMachine(ctx, d, st, null, live);
      drawStripMotor(ctx, st, live);
      drawTorque(ctx, st, d, live);
      if (run) drawRunChart(ctx, st, d);
      else drawTriangle(ctx, st, d);
      drawPlate(ctx, st);
    },
    status(v) {
      if (isGen(v)) {
        const g = genState(v);
        if (g.n < 1) return { tone: 'warn', text: 'Turbina parada: sem movimento do campo em relação às bobinas, não há tensão induzida.' };
        if (g.phi <= 0) return { tone: 'warn', text: 'Sem excitação não há campo no rotor: a turbina gira, mas o alternador não gera tensão.' };
        const sync = Math.abs(g.f - 60) <= 0.5 && Math.abs(g.V - 220) <= 5;
        if ((v.kw ?? 0) <= 0)
          return { tone: 'ok', text: `A vazio: ${f0(g.E)} V a ${f1(g.f)} Hz (f = p·n/120). Sem corrente, a turbina só vence as perdas: ${f1(g.T)} N·m.` };
        if (sync)
          return { tone: 'ok', text: `${f1(g.f)} Hz e ${f0(g.V)} V: as mesmas da rede. Para ligar em paralelo falta conferir a sequência de fases e o ângulo (sincronismo).` };
        return {
          tone: g.V < 200 ? 'warn' : 'ok',
          text: `Com carga, a corrente no estator freia o rotor (lei de Lenz): a turbina faz ${f1(g.T)} N·m. A reatância síncrona derruba a tensão de ${f0(g.E)} para ${f0(g.V)} V — o regulador de tensão aumentaria a excitação.`,
        };
      }
      const st = motorState(v);
      if (clock - refuse < 6)
        return { tone: 'warn', text: 'Na rede de 380 V este motor (220/380 V) já trabalha em estrela: não há como partir em estrela-triângulo. Para isso seria preciso um motor 380/660 V.' };
      if (run && !run.done) {
        const lv = liveOf(v);
        if (lv)
          return {
            tone: 'warn',
            text:
              run.mode === 'yd' && run.phase === 0
                ? `Partindo em estrela: cada bobina recebe 127 V e a corrente fica em ${f0(lv.I)} A — um terço da partida direta.`
                : `Partida: ${f0(lv.n)} rpm e ${f0(lv.I)} A. A corrente só cai quando o rotor se aproxima da rotação do campo.`,
          };
      }
      if (st.over)
        return { tone: 'bad', text: `Triângulo na rede de 380 V: cada bobina recebe 380 V, √3 vezes a tensão de projeto. O ferro satura, a corrente vai a ${f0(st.pt.IL)} A e o motor queima. Na rede de 380 V, ligue em estrela.` };
      if (st.stall)
        return { tone: 'bad', text: `O motor tombou: a carga (${f0(st.TL)} N·m) passou do conjugado máximo (${f0(st.Tmax)} N·m). Ele para e fica puxando ${f0(st.start.IL)} A — o relé térmico tem de desligar.` };
      const yLow = st.sp.lig === 1 && st.net === 220;
      if (yLow)
        return {
          tone: 'warn',
          text: `Estrela na rede de 220 V: cada bobina recebe só 127 V. Corrente de partida (${f0(st.start.IL)} A) e conjugado caem para 1/3 — é a partida estrela-triângulo.${st.Tp < st.TL ? ' Com essa carga ele nem parte.' : ` Com ${f0((st.TL / st.TN) * 100)} % de carga, o escorregamento vai a ${f1(st.s * 100)} %.`}`,
        };
      if (st.dir < 0) return { tone: 'ok', text: 'Duas fases trocadas: o campo girante inverte o sentido, e o motor gira ao contrário.' };
      if (st.Qcap > 0) {
        if (st.Qnet < 0) return { tone: 'warn', text: `Capacitores demais: sobram ${f2(-st.Qnet / 1000)} kvar e a rede vê um fator de potência adiantado (${f2(st.fpNet)}). O ideal é chegar perto de 0,92–1.` };
        return { tone: 'ok', text: `Os capacitores fornecem ${f1(st.Qcap / 1000)} kvar da magnetização: a rede vê cos φ = ${f2(st.fpNet)} e a corrente cai para ${f1(st.Inet)} A, com a mesma potência ativa.` };
      }
      if (st.Tp < st.TL)
        return { tone: 'warn', text: `Girando, ele aguenta ${f0((st.TL / st.TN) * 100)} % de carga com ${f1(st.s * 100)} % de escorregamento — mas parado não partiria: o conjugado de partida (${f0(st.Tp)} N·m) é menor que o da carga.` };
      if (st.TL < 0.05 * st.TN)
        return { tone: 'ok', text: `A vazio: o rotor quase alcança o campo (s = ${f2(st.s * 100)} %) e quase não há corrente nas barras. O motor só magnetiza: cos φ = ${f2(st.fp)}.` };
      if (st.sp.f !== F_N)
        return {
          tone: 'ok',
          text: `Inversor a ${f0(st.sp.f)} Hz: o campo gira a 120·${f0(st.sp.f)}/${st.sp.p} = ${f0(st.ns)} rpm.${st.sp.f > F_N ? ' Acima de 60 Hz a tensão não sobe mais: o fluxo e o conjugado máximo caem.' : ' A tensão cai junto (V/f constante) para manter o fluxo.'}`,
        };
      return {
        tone: 'ok',
        text: `Campo a ${f0(st.ns)} rpm e rotor a ${f0(st.n)} rpm: escorregamento de ${f1(st.s * 100)} %. É essa diferença que induz corrente nas barras e cria o conjugado de ${f1(st.T)} N·m.`,
      };
    },
  };
}
