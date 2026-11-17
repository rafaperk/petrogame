/**
 * Desenho da bancada do compressor alternativo: cilindro(s) com válvulas automáticas (lâminas), manivela e
 * biela, o ar entrando e saindo, o diagrama P–V indicado, o rendimento volumétrico × razão de pressões e as contas.
 */
import { COMP, compState, specificWork, tempFactor, type CompState, type Stage } from '../../learning/labs/compressor';
import type { LabValues } from '../../learning/types';
import { approach, arrow, C, Chart, fmt, FONT, labelPoints, marker, niceAxis, roundRect, seeded, tag, tempColor, text, ticksOf } from './draw';
import type { LabView } from './views';

const TAU = Math.PI * 2;
const PI = Math.PI;
const T_LO = 280;
const T_HI = 680;
const tc = (T: number, a = 1) => tempColor(T, T_LO, T_HI, a);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
const f2 = (x: number) => fmt(x, 2);
/** Segundos por volta na tela (câmera lenta: o compressor de verdade dá 10 voltas por segundo). */
const REV_S = 3.2;

// ------------------------------------------------------------------ mecanismo (igual para todos os cilindros)
const CRANK_Y = 466;
const RC = 54;
const ROD = 128;
const PIN = 20;
const STROKE = 2 * RC;
const CASE_TOP = 414;
const CASE_BOTTOM = 528;
const yTopOf = (th: number) => CRANK_Y - (RC * Math.cos(th) + Math.sqrt(ROD * ROD - (RC * Math.sin(th)) ** 2)) - PIN;
const Y_TDC = yTopOf(0);
const Y_BDC = yTopOf(PI);
/** Fração do curso já percorrida: 0 no PMS, 1 no PMI. */
const xOf = (th: number) => (yTopOf(th) - Y_TDC) / STROKE;

interface Cyl {
  cx: number;
  /** Diâmetro interno (px). */
  bore: number;
  wall: number;
  /** Altura do cabeçote e do pistão (px). */
  head: number;
  ph: number;
}
const ONE: Cyl = { cx: 158, bore: 108, wall: 8, head: 50, ph: 34 };
const LOW: Cyl = { cx: 96, bore: 84, wall: 7, head: 46, ph: 30 };
const HIGH: Cyl = { cx: 226, bore: 52, wall: 6, head: 46, ph: 26 };
const portX = (g: Cyl, side: -1 | 1) => g.cx + side * g.bore * 0.26;
const portW = (g: Cyl) => g.bore * 0.2;
const headX0 = (g: Cyl) => g.cx - g.bore / 2 - g.wall - 9;
const headX1 = (g: Cyl) => g.cx + g.bore / 2 + g.wall + 9;

/** Vaso de ar comprimido e manômetro (os dois modos). */
const VASO = { x0: 256, x1: 300, y0: 96, y1: 176 } as const;
const VASO_X = (VASO.x0 + VASO.x1) / 2;
const GAUGE = { x: 230, y: 108, r: 12 } as const;
/** Resfriador intermediário (2 estágios). */
const IC = { x0: 134, x1: 196, y0: 152, y1: 180, y: 166 } as const;

type PhaseKey = 'reexp' | 'suc' | 'comp' | 'dis' | 'dead';

const PHASE_TXT: Record<PhaseKey, string> = {
  reexp: 'Re-expansão 3 → 4: o gás do espaço morto se expande; válvulas fechadas',
  suc: 'Aspiração 4 → 1: P caiu abaixo de P₁; a sucção abre e entra ar novo',
  comp: 'Compressão 1 → 2: válvulas fechadas; a pressão e a temperatura sobem',
  dis: 'Descarga 2 → 3: P chegou a P₂; a descarga abre e o ar vai para o vaso',
  dead: 'Sem vazão: o gás preso re-expande o curso todo; as válvulas não abrem',
};

/** O que acontece dentro de um cilindro num ângulo de manivela. */
interface CylState {
  P: number;
  V: number;
  T: number;
  /** Massa no cilindro (g). */
  m: number;
  phase: PhaseKey;
  /** Abertura das válvulas de sucção e de descarga (0 a 1). */
  ls: number;
  ld: number;
}

function cylState(s: Stage, n: number, th: number): CylState {
  const a = ((th % TAU) + TAU) % TAU;
  const V = s.Vc + s.Vd * xOf(a);
  const [p1, p2, , p4] = s.pts;
  let P: number;
  let phase: PhaseKey;
  let ls = 0;
  let ld = 0;
  if (s.dead) {
    P = s.Pd * Math.pow(s.Vc / V, n);
    phase = 'dead';
  } else if (a < PI) {
    if (V < p4.V) {
      P = s.Pd * Math.pow(s.Vc / V, n);
      phase = 'reexp';
    } else {
      P = s.Ps;
      phase = 'suc';
      ls = clamp(Math.min((V - p4.V) / (0.03 * s.Vd), (PI - a) / 0.22), 0, 1);
    }
  } else if (V > p2.V) {
    P = s.Ps * Math.pow(p1.V / V, n);
    phase = 'comp';
  } else {
    P = s.Pd;
    phase = 'dis';
    ld = clamp(Math.min((p2.V - V) / (0.03 * s.Vd), (TAU - a) / 0.22), 0, 1);
  }
  const T = COMP.T1 * tempFactor(P / s.Ps, n);
  return { P, V, T, m: (P * V) / (COMP.R * T), phase, ls, ld };
}

/** Ângulo de manivela em que o pistão está na fração `x` do curso (descendo ou subindo). */
function angleAt(x: number, down: boolean): number {
  let a = down ? 0 : PI;
  let b = down ? PI : TAU;
  for (let i = 0; i < 40; i++) {
    const m = (a + b) / 2;
    const xm = xOf(m);
    if (down ? xm < x : xm > x) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

/** Ângulos em que o estágio muda de etapa (PMS, abre a sucção, PMI, abre a descarga). */
function eventsOf(s: Stage): number[] {
  if (s.dead) return [0, PI];
  const [, p2, , p4] = s.pts;
  return [0, angleAt((p4.V - s.Vc) / s.Vd, true), PI, angleAt((p2.V - s.Vc) / s.Vd, false)].sort((a, b) => a - b);
}

/** Ciclo fechado 1-2-3-4 no plano V–P. */
function loopPts(s: Stage, n: number): [number, number][] {
  const [p1, p2, p3, p4] = s.pts;
  const out: [number, number][] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const V = p1.V + ((p2.V - p1.V) * i) / N;
    out.push([V, p1.P * Math.pow(p1.V / V, n)]);
  }
  if (p3.V > 0) {
    for (let i = 0; i <= N; i++) {
      const V = p3.V + ((p4.V - p3.V) * i) / N;
      out.push([V, p3.P * Math.pow(p3.V / V, n)]);
    }
  } else {
    out.push([0, p3.P], [0, p4.P]);
  }
  out.push([p1.V, p1.P]);
  return out;
}

type Path = [number, number][];

function pathLength(path: Path): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
  return total;
}

function along(path: Path, u: number): [number, number] {
  let d = clamp(u, 0, 1) * pathLength(path);
  for (let i = 1; i < path.length; i++) {
    const [x0, y0] = path[i - 1];
    const [x1, y1] = path[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (d <= len || i === path.length - 1) {
      const k = len > 0 ? Math.min(1, d / len) : 0;
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
    }
    d -= len;
  }
  return path[path.length - 1];
}

function pipe(ctx: CanvasRenderingContext2D, path: Path, inner: string, width = 12): void {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const [w, col] of [
    [width, '#16212d'],
    [width - 6, inner],
  ] as const) {
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'butt';
}

/** Bolinhas de ar andando pelo tubo enquanto a válvula está aberta (`on` de 0 a 1). */
function flowDots(ctx: CanvasRenderingContext2D, path: Path, t: number, on: number, color: string, count = 7): void {
  if (on <= 0.02) return;
  const len = pathLength(path);
  ctx.globalAlpha = clamp(on * 1.4, 0, 1);
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const [x, y] = along(path, (t * (90 / len) + i / count) % 1);
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function metalWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, C.metalDark);
  g.addColorStop(0.5, C.metalLight);
  g.addColorStop(1, C.metal);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

/** Legenda da etapa: "Título: explicação", com a explicação encolhendo até caber. */
function caption(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, maxW: number, color: string): void {
  const i = name.indexOf(': ');
  const head = i < 0 ? name : name.slice(0, i);
  const body = i < 0 ? '' : name.slice(i + 2);
  text(ctx, head, x, y, { size: 11, bold: true, color });
  if (!body) return;
  let size = 10.5;
  for (; size > 8; size -= 0.5) {
    ctx.font = `600 ${size}px ${FONT}`;
    if (ctx.measureText(body).width <= maxW) break;
  }
  text(ctx, body, x, y + 14, { size, color: C.dim });
}

interface Mol {
  u: number;
  w: number;
  du: number;
  dw: number;
}

export function compressorView(): LabView {
  const rnd = seeded(31);
  const pool = (count: number): Mol[] =>
    Array.from({ length: count }, () => {
      const a = rnd() * TAU;
      return { u: rnd(), w: rnd(), du: Math.cos(a), dw: Math.sin(a) };
    });
  const molsA = pool(46);
  const molsB = pool(26);
  let th = 0.35;
  let flowT = 0;
  let paused = false;
  let stepNext = false;
  let lastZ: number | null = null;
  const sc = { init: false, p: 800, pStep: 200 };

  function updateScales(v: LabValues, dt: number): void {
    const ax = niceAxis(v.p2 * 1.08, [100, 200, 250, 500]);
    if (!sc.init) Object.assign(sc, { init: true, p: ax.top });
    else sc.p = approach(sc.p, ax.top, dt);
    sc.pStep = ax.step;
  }

  // ---------------------------------------------------------------- cilindro
  function drawCyl(ctx: CanvasRenderingContext2D, g: Cyl, s: Stage, n: number, angle: number, cs: CylState, mols: Mol[], dt: number, sucCol: string, disCol: string): void {
    const bl = g.cx - g.bore / 2;
    const br = g.cx + g.bore / 2;
    const yH = Y_TDC - (s.Vc / s.Vd) * STROKE;
    const yP = yTopOf(angle);

    // camisa d'água: mais forte quanto mais perto do isotérmico
    const cool = clamp((COMP.k - n) / (COMP.k - 1), 0, 1);
    if (cool > 0.02) {
      ctx.fillStyle = `rgba(59,143,224,${(0.2 + 0.6 * cool).toFixed(3)})`;
      const jw = g.bore > 70 ? 7 : 5;
      roundRect(ctx, bl - g.wall - jw, yH + 2, jw + 2, CASE_TOP - 10 - yH, 3);
      ctx.fill();
      roundRect(ctx, br + g.wall - 2, yH + 2, jw + 2, CASE_TOP - 10 - yH, 3);
      ctx.fill();
    }

    // gás e moléculas (quantidade ∝ massa no cilindro)
    const gasH = Math.max(0, yP - yH);
    ctx.fillStyle = tc(cs.T, 0.3);
    ctx.fillRect(bl, yH, br - bl, gasH);
    const mMax = (s.Ps * (s.Vc + s.Vd)) / (COMP.R * COMP.T1);
    const count = Math.round(mols.length * clamp(cs.m / mMax, 0, 1));
    const speed = 55 * Math.sqrt(cs.T / COMP.T1);
    const r = g.bore > 70 ? 2.6 : 2.1;
    for (let i = 0; i < mols.length; i++) {
      const m = mols[i];
      m.u += (m.du * speed * dt) / Math.max(4, br - bl - 2 * r);
      m.w += (m.dw * speed * dt) / Math.max(4, gasH - 2 * r);
      if (m.u < 0 || m.u > 1) {
        m.du = -m.du;
        m.u = clamp(m.u, 0, 1);
      }
      if (m.w < 0 || m.w > 1) {
        m.dw = -m.dw;
        m.w = clamp(m.w, 0, 1);
      }
      if (i >= count || gasH < 2 * r + 1) continue;
      ctx.fillStyle = tc(cs.T);
      ctx.beginPath();
      ctx.arc(bl + r + m.u * (br - bl - 2 * r), yH + r + m.w * (gasH - 2 * r), r, 0, TAU);
      ctx.fill();
    }

    // paredes
    metalWall(ctx, bl - g.wall, yH, g.wall, CASE_TOP + 6 - yH);
    metalWall(ctx, br, yH, g.wall, CASE_TOP + 6 - yH);

    // manivela, biela e pistão
    const cpX = g.cx + RC * Math.sin(angle);
    const cpY = CRANK_Y - RC * Math.cos(angle);
    const away = Math.atan2(-(cpY - CRANK_Y), -(cpX - g.cx));
    ctx.fillStyle = '#4a5562';
    ctx.beginPath();
    ctx.moveTo(g.cx, CRANK_Y);
    ctx.arc(g.cx, CRANK_Y, g.bore > 70 ? 40 : 30, away - 1.1, away + 1.1);
    ctx.closePath();
    ctx.fill();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6b7684';
    ctx.lineWidth = g.bore > 70 ? 20 : 15;
    ctx.beginPath();
    ctx.moveTo(g.cx, CRANK_Y);
    ctx.lineTo(cpX, cpY);
    ctx.stroke();
    ctx.strokeStyle = C.metal;
    ctx.lineWidth = g.bore > 70 ? 10 : 8;
    ctx.beginPath();
    ctx.moveTo(g.cx, yP + PIN);
    ctx.lineTo(cpX, cpY);
    ctx.stroke();
    ctx.lineCap = 'butt';
    for (const [x, y, rr] of [
      [g.cx, CRANK_Y, 8],
      [cpX, cpY, 7],
    ]) {
      ctx.fillStyle = C.metalLight;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, TAU);
      ctx.fill();
    }
    const pg = ctx.createLinearGradient(0, yP, 0, yP + g.ph);
    pg.addColorStop(0, C.metalLight);
    pg.addColorStop(1, C.metalDark);
    ctx.fillStyle = pg;
    ctx.fillRect(bl + 1, yP, br - bl - 2, g.ph);
    ctx.strokeStyle = 'rgba(20,30,40,0.6)';
    ctx.lineWidth = 1.5;
    for (const dy of [5, 10, 15]) {
      ctx.beginPath();
      ctx.moveTo(bl + 1, yP + dy);
      ctx.lineTo(br - 1, yP + dy);
      ctx.stroke();
    }
    ctx.fillStyle = C.metalDark;
    ctx.beginPath();
    ctx.arc(g.cx, yP + PIN, 4.5, 0, TAU);
    ctx.fill();

    // cabeçote: câmara de sucção (esq.) e de descarga (dir.), placa de válvulas e as lâminas
    const hx0 = headX0(g);
    const hx1 = headX1(g);
    ctx.fillStyle = '#5b6573';
    roundRect(ctx, hx0, yH - g.head, hx1 - hx0, g.head - 8, 5);
    ctx.fill();
    ctx.fillStyle = sucCol;
    ctx.fillRect(hx0 + 5, yH - g.head + 6, g.cx - 3 - (hx0 + 5), g.head - 20);
    ctx.fillStyle = disCol;
    ctx.fillRect(g.cx + 3, yH - g.head + 6, hx1 - 5 - (g.cx + 3), g.head - 20);
    ctx.fillStyle = C.metal;
    ctx.fillRect(bl - g.wall, yH - 9, br - bl + 2 * g.wall, 9);
    const pw = portW(g);
    const xs = portX(g, -1);
    const xd = portX(g, 1);
    ctx.fillStyle = sucCol;
    ctx.fillRect(xs - pw / 2, yH - 9, pw, 9);
    ctx.fillStyle = disCol;
    ctx.fillRect(xd - pw / 2, yH - 9, pw, 9);
    const reed = (hx: number, hy: number, base: number, open: number) => {
      const len = pw + 9;
      const a = base + open * 0.5;
      ctx.strokeStyle = open > 0.02 ? C.amber : C.metalLight;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + Math.cos(a) * len, hy + Math.sin(a) * len);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = C.metalDark;
      ctx.beginPath();
      ctx.arc(hx, hy, 2.5, 0, TAU);
      ctx.fill();
    };
    // sucção: lâmina sob a placa, abre para dentro do cilindro; descarga: sobre a placa, abre para a câmara
    reed(xs - pw / 2 - 4, yH + 1.5, 0, cs.ls);
    reed(xd + pw / 2 + 4, yH - 10.5, PI, cs.ld);
    // ar passando pelas válvulas
    const through = (x: number, y0: number, y1: number, on: number, col: string) => {
      if (on <= 0.05) return;
      ctx.fillStyle = col;
      ctx.globalAlpha = on;
      for (let i = 0; i < 3; i++) {
        const q = (flowT * 1.8 + i / 3) % 1;
        ctx.beginPath();
        ctx.arc(x + (i - 1) * 3, y0 + (y1 - y0) * q, 2.2, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    through(xs, yH - 16, yH + 14, cs.ls, tc(COMP.T1));
    through(xd, yH + 8, yH - 20, cs.ld, tc(s.T2));
  }

  function gauge(ctx: CanvasRenderingContext2D, p2: number): void {
    const { x, y, r } = GAUGE;
    ctx.strokeStyle = '#16212d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(VASO.x0, y);
    ctx.stroke();
    ctx.fillStyle = '#e8eef4';
    ctx.strokeStyle = C.metalDark;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    const a0 = PI * 0.75;
    const a1 = PI * 2.25;
    ctx.strokeStyle = '#7b8794';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const a = a0 + ((a1 - a0) * i) / 8;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * (r - 4), y + Math.sin(a) * (r - 4));
      ctx.lineTo(x + Math.cos(a) * (r - 1.5), y + Math.sin(a) * (r - 1.5));
      ctx.stroke();
    }
    const a = a0 + (a1 - a0) * clamp(p2 / 1600, 0, 1);
    ctx.strokeStyle = C.bad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3));
    ctx.stroke();
    text(ctx, `${f0(p2)} kPa`, x, y + r + 13, { size: 10, bold: true, align: 'center' });
  }

  function vessel(ctx: CanvasRenderingContext2D, T2: number): void {
    const g = ctx.createLinearGradient(VASO.x0, 0, VASO.x1, 0);
    g.addColorStop(0, C.metalDark);
    g.addColorStop(0.45, '#a9b6c3');
    g.addColorStop(1, C.metal);
    ctx.fillStyle = g;
    roundRect(ctx, VASO.x0, VASO.y0, VASO.x1 - VASO.x0, VASO.y1 - VASO.y0, 18);
    ctx.fill();
    text(ctx, 'vaso', VASO_X, 140, { size: 10, bold: true, align: 'center', color: '#1b2836' });
    // válvula de segurança no topo
    ctx.fillStyle = C.bad;
    ctx.fillRect(VASO_X - 4, VASO.y0 - 9, 8, 9);
    ctx.fillRect(VASO_X - 7, VASO.y0 - 12, 14, 4);
    tag(ctx, `T₂ = ${f0(T2 - COMP.K0)} °C`, VASO_X - 4, 198, tc(T2), 'center', 10);
  }

  function filter(ctx: CanvasRenderingContext2D, fx: number): void {
    ctx.fillStyle = '#4f5b68';
    roundRect(ctx, fx - 22, 100, 44, 46, 6);
    ctx.fill();
    ctx.strokeStyle = '#c9d3dc';
    ctx.lineWidth = 1.2;
    for (let x = fx - 17; x <= fx + 17; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 106);
      ctx.lineTo(x + 2, 112);
      ctx.lineTo(x, 118);
      ctx.lineTo(x + 2, 124);
      ctx.lineTo(x, 130);
      ctx.lineTo(x + 2, 136);
      ctx.lineTo(x, 140);
      ctx.stroke();
    }
    text(ctx, 'filtro', fx + 9, 160, { size: 9, color: C.dim });
  }

  function crankcase(ctx: CanvasRenderingContext2D, x0: number, x1: number): void {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    roundRect(ctx, x0, CASE_TOP, x1 - x0, CASE_BOTTOM - CASE_TOP, 14);
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function deadCenters(ctx: CanvasRenderingContext2D, xa: number, xb: number, labelX: number, align: CanvasTextAlign): void {
    for (const [y, lab] of [
      [Y_TDC, 'PMS'],
      [Y_BDC, 'PMI'],
    ] as const) {
      ctx.strokeStyle = 'rgba(226,235,245,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xa, y);
      ctx.lineTo(xb, y);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, lab, labelX, align === 'center' ? y - 4 : y + 4, { size: 9, color: C.dim, align });
    }
  }

  // ---------------------------------------------------------------- máquina
  function drawMachine(ctx: CanvasRenderingContext2D, st: CompState, cs: CylState[], dt: number): void {
    const two = st.z === 2;
    const n = st.n;
    const [s1] = st.stages;
    const c1 = cs[0];
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 8, 8, 300, 544, 10);
    ctx.fill();
    text(ctx, two ? 'Compressor de 2 estágios' : 'Compressor alternativo de 1 estágio', 22, 30, { size: 13, bold: true });
    text(ctx, `600 rpm · ar a 100 kPa e 27 °C · n = ${f2(n)}`, 22, 48, { size: 11, color: C.dim });
    const phTxt = two && c1.phase === 'dis' ? 'Descarga 2 → 3: P chegou a Pi; o ar vai para o resfriador' : PHASE_TXT[c1.phase];
    const phCol = c1.phase === 'dead' ? C.bad : c1.phase === 'suc' ? C.good : c1.phase === 'dis' ? C.curve2 : C.text;
    caption(ctx, (two ? 'Baixa · ' : '') + phTxt, 22, 70, 276, phCol);

    const cool = tc(COMP.T1, 0.9);
    const hot = tc(st.T2, 0.95);
    const fx = two ? 28 : 46;
    const g1 = two ? LOW : ONE;
    const yH = Y_TDC - st.c * STROKE;
    const yPipe = yH - 24;
    const sucPath: Path = [
      [fx, 146],
      [fx, yPipe],
      [portX(g1, -1), yPipe],
      [portX(g1, -1), yH - 10],
    ];
    const g2 = two ? HIGH : ONE;
    const lastDis = two ? 1 : 0;
    const disPath: Path = [
      [portX(g2, 1), yH - 10],
      [portX(g2, 1), yPipe],
      [VASO_X, yPipe],
      [VASO_X, VASO.y1],
    ];

    crankcase(ctx, two ? 30 : 64, two ? 284 : 252);
    if (two) {
      // virabrequim comum: os dois pistões defasados de meia volta
      ctx.strokeStyle = '#3a4350';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(LOW.cx, CRANK_Y);
      ctx.lineTo(HIGH.cx, CRANK_Y);
      ctx.stroke();
    }
    pipe(ctx, sucPath, cool);
    pipe(ctx, disPath, hot);
    if (two) {
      const xa = portX(LOW, 1);
      const xb = portX(HIGH, -1);
      const toIc: Path = [
        [xa, yH - 10],
        [xa, IC.y],
        [IC.x0 + 4, IC.y],
      ];
      const fromIc: Path = [
        [IC.x1 - 4, IC.y],
        [xb, IC.y],
        [xb, yH - 10],
      ];
      pipe(ctx, toIc, hot);
      pipe(ctx, fromIc, cool);
      ctx.strokeStyle = '#16212d';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(IC.x0, IC.y);
      ctx.lineTo(IC.x1, IC.y);
      ctx.stroke();
      // resfriador intermediário: casco com aletas e água
      ctx.fillStyle = '#3b6d9c';
      roundRect(ctx, IC.x0, IC.y0, IC.x1 - IC.x0, IC.y1 - IC.y0, 6);
      ctx.fill();
      const grad = ctx.createLinearGradient(IC.x0, 0, IC.x1, 0);
      grad.addColorStop(0, hot);
      grad.addColorStop(1, cool);
      ctx.fillStyle = grad;
      ctx.fillRect(IC.x0 + 3, IC.y - 3, IC.x1 - IC.x0 - 6, 6);
      ctx.strokeStyle = 'rgba(200,225,255,0.55)';
      ctx.lineWidth = 1;
      for (let x = IC.x0 + 6; x < IC.x1 - 3; x += 5) {
        ctx.beginPath();
        ctx.moveTo(x, IC.y0 + 3);
        ctx.lineTo(x, IC.y1 - 3);
        ctx.stroke();
      }
      arrow(ctx, IC.x1 - 12, IC.y1 + 13, IC.x1 - 12, IC.y1 + 1, C.cold, 2, 6);
      arrow(ctx, IC.x0 + 12, IC.y1 + 1, IC.x0 + 12, IC.y1 + 13, C.cold, 2, 6);
      text(ctx, 'água', (IC.x0 + IC.x1) / 2, IC.y1 + 13, { size: 9, color: C.cold, align: 'center' });
      text(ctx, `resfriador · Pi = ${f0(st.Pi)} kPa`, (IC.x0 + IC.x1) / 2, IC.y0 - 6, { size: 9, color: C.text, align: 'center', bold: true });
      flowDots(ctx, toIc, flowT, cs[0].ld, tc(st.T2), 6);
      flowDots(ctx, fromIc, flowT, cs[1].ls, tc(COMP.T1), 6);
    }
    flowDots(ctx, sucPath, flowT, c1.ls, tc(COMP.T1));
    flowDots(ctx, disPath, flowT, cs[lastDis].ld, tc(st.T2));
    filter(ctx, fx);
    vessel(ctx, st.T2);
    gauge(ctx, COMP.P1 * st.r);

    // cilindros
    drawCyl(ctx, g1, s1, n, th, c1, molsA, dt, cool, hot);
    if (two) drawCyl(ctx, HIGH, st.stages[1], n, th + PI, cs[1], molsB, dt, cool, hot);

    // PMS/PMI e onde as válvulas abrem
    if (two) {
      deadCenters(ctx, headX1(LOW) - 8, headX0(HIGH) + 8, 167, 'center');
    } else {
      deadCenters(ctx, 40, ONE.cx - ONE.bore / 2 - ONE.wall - 10, 36, 'right');
      if (!s1.dead) {
        const yAt = (V: number) => yH + (V / s1.Vd) * STROKE;
        let y2 = yAt(s1.pts[1].V);
        let y4 = yAt(s1.pts[3].V);
        if (Math.abs(y2 - y4) < 14) {
          const mid = (y2 + y4) / 2;
          y2 = mid - 7;
          y4 = mid + 7;
        }
        const xr = ONE.cx + ONE.bore / 2 + ONE.wall + 3;
        const mark = (yy: number, y0: number, label: string, col: string) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(xr, y0);
          ctx.lineTo(xr + 6, y0 - 4);
          ctx.lineTo(xr + 6, y0 + 4);
          ctx.closePath();
          ctx.fill();
          text(ctx, label, xr + 9, yy + 3.5, { size: 9, color: col, bold: true });
        };
        mark(y2, yAt(s1.pts[1].V), '2: abre descarga', C.curve2);
        mark(y4, yAt(s1.pts[3].V), '4: abre sucção', C.good);
      }
    }

    // o que há no cilindro agora
    if (two) {
      const [a, b] = cs;
      text(ctx, `Baixa: ${f0(a.P)} kPa · ${f0(a.T - COMP.K0)} °C   Alta: ${f0(b.P)} kPa · ${f0(b.T - COMP.K0)} °C`, 158, 545, { size: 10, bold: true, align: 'center' });
    } else {
      text(ctx, `No cilindro: P = ${f0(c1.P)} kPa · T = ${f0(c1.T - COMP.K0)} °C · ${f1(c1.m)} g de ar`, 158, 545, { size: 10, bold: true, align: 'center' });
    }
  }

  // ---------------------------------------------------------------- diagrama P–V
  function drawPV(ctx: CanvasRenderingContext2D, v: LabValues, st: CompState, cs: CylState[]): void {
    const ch = new Chart(ctx, { x: 362, y: 42, w: 244, h: 194, x0: 0, x1: 12, y0: 0, y1: sc.p });
    ch.frame('Diagrama P–V indicado', 'V (L)', 'P (kPa)', ticksOf(0, 12, 2), ticksOf(0, sc.p, sc.pStep));
    const n = st.n;
    const [s1, s2] = st.stages;
    const p = s1.pts;
    if (s2) {
      // 1 estágio só (mesma aspiração), a isoterma por 1 e a economia dos 2 estágios
      const a = p[0];
      const Vend = a.V * Math.pow(a.P / v.p2, 1 / n);
      const single = (V: number) => a.P * Math.pow(a.V / V, n);
      const saved: [number, number][] = [];
      const N = 30;
      for (let i = 0; i <= N; i++) {
        const V = p[1].V + ((Vend - p[1].V) * i) / N;
        saved.push([V, single(V)]);
      }
      const q = s2.pts;
      for (let i = 0; i <= N; i++) {
        const V = q[1].V + ((q[0].V - q[1].V) * i) / N;
        saved.push([V, q[0].P * Math.pow(q[0].V / V, n)]);
      }
      if (!s1.dead) ch.area(saved, 'rgba(95,211,138,0.35)', true);
      ch.fn((V) => (a.P * a.V) / V, C.curve3, 1.3, [3, 4], (a.P * a.V) / sc.p, 12);
      ch.fn(single, 'rgba(226,235,245,0.65)', 1.5, [5, 4], Vend, a.V);
    }
    const stages = s2 ? [s1, s2] : [s1];
    stages.forEach((s, i) => {
      const pts = loopPts(s, n);
      const col = i ? C.violet : C.amber;
      ch.area(pts, i ? 'rgba(180,140,255,0.26)' : 'rgba(255,201,77,0.2)', true);
      ch.poly(pts, col, 2.5);
    });
    // faixas do eixo V: espaço morto, re-expansão e volume aspirado (estágio 1)
    const yAx = ch.Y(0) - 3;
    const band = (va: number, vb: number, col: string) => {
      if (vb - va < 1e-6) return;
      ctx.strokeStyle = col;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(ch.X(va), yAx);
      ctx.lineTo(ch.X(vb), yAx);
      ctx.stroke();
    };
    band(0, s1.Vc, C.metal);
    if (s1.dead) band(s1.Vc, p[0].V, C.bad);
    else {
      band(s1.Vc, p[3].V, C.bad);
      band(p[3].V, p[0].V, C.good);
    }
    // trabalho por volta = área
    stages.forEach((s, i) => {
      if (s.dead) return;
      const cxp = (s.pts[0].V + s.pts[2].V + s.pts[1].V + s.pts[3].V) / 4;
      const cyp = (s.pts[0].P + s.pts[1].P) / 2;
      const label = s2 ? `W${i ? '₂' : '₁'} = ${f2(s.W)} kJ` : `W = ${f2(s.W)} kJ/volta`;
      if (ch.Y(s.pts[0].P) - ch.Y(s.pts[1].P) > 18) text(ctx, label, ch.X(cxp), ch.Y(cyp) + 4, { size: s2 ? 10 : 11, bold: true, align: 'center', shadow: true, color: i ? '#d9c6ff' : '#ffe2a0' });
    });
    if (s1.dead) {
      text(ctx, 'ηv = 0: o gás só vai e volta', ch.X(6.5), ch.Y(sc.p * 0.55), { size: 11, bold: true, align: 'center', color: C.bad, shadow: true });
    } else {
      labelPoints(
        ch,
        ctx,
        p.map((q) => [q.V, q.P] as [number, number]),
        ['1', '2', '3', '4'],
      );
    }
    for (const q of cs) marker(ch, ctx, q.V, q.P);
    // legenda (canto de cima à direita fica livre)
    const items: [string, string, 'bar' | 'dash' | 'fill'][] = s2
      ? [
          ['estágio 1 (baixa)', C.amber, 'bar'],
          ['estágio 2 (alta)', C.violet, 'bar'],
          ['1 estágio só', 'rgba(226,235,245,0.8)', 'dash'],
          ['isoterma', C.curve3, 'dash'],
          ['economia', 'rgba(95,211,138,0.6)', 'fill'],
        ]
      : [
          ['ar novo aspirado', C.good, 'bar'],
          ['re-expansão', C.bad, 'bar'],
          ['espaço morto', C.metal, 'bar'],
        ];
    const lx = ch.b.x + ch.b.w - 100;
    items.forEach(([label, col, kind], i) => {
      const y = ch.b.y + 12 + i * 13;
      if (kind === 'fill') {
        ctx.fillStyle = col;
        ctx.fillRect(lx, y - 8, 14, 8);
      } else {
        ctx.strokeStyle = col;
        ctx.lineWidth = kind === 'bar' ? 4 : 1.8;
        ctx.setLineDash(kind === 'dash' ? [4, 3] : []);
        ctx.beginPath();
        ctx.moveTo(lx, y - 4);
        ctx.lineTo(lx + 14, y - 4);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      text(ctx, label, lx + 19, y, { size: 10, color: C.text });
    });
  }

  // ---------------------------------------------------------------- ηv × razão
  function drawEta(ctx: CanvasRenderingContext2D, st: CompState): void {
    const ch = new Chart(ctx, { x: 694, y: 42, w: 240, h: 194, x0: 1, x1: 16, y0: 0, y1: 100 });
    ch.frame('Rendimento volumétrico', 'P₂/P₁', 'ηv (%)', ticksOf(2, 16, 2), [0, 25, 50, 75, 100]);
    const n = st.n;
    const eta = (r: number, c: number, z: number) => Math.max(0, 1 + c - c * Math.pow(r, 1 / (z * n))) * 100;
    ch.fn(() => 100, 'rgba(226,235,245,0.55)', 1.2, [4, 4]);
    text(ctx, 'c = 0', ch.X(16) - 4, ch.Y(100) + 13, { size: 10, color: C.dim, align: 'right' });
    const legend: [string, string, number[]?][] = [];
    if (st.z === 1) {
      for (const f of [5, 10, 15, 20]) if (Math.abs(f - st.c * 100) > 0.5) ch.fn((r) => eta(r, f / 100, 1), 'rgba(90,184,255,0.38)', 1.2, [4, 4]);
      ch.fn((r) => eta(r, st.c, 1), C.curve1, 2.5);
      legend.push([`c = ${f0(st.c * 100)} % (este)`, C.curve1], ['c = 5, 10, 15, 20 %', 'rgba(90,184,255,0.6)', [4, 4]]);
      if (st.c > 0 && st.rmax <= 16) {
        const x = st.rmax;
        ch.poly(
          [
            [x, 0],
            [x, 32],
          ],
          C.bad,
          1.5,
          [3, 3],
        );
        const right = ch.X(x) > ch.b.x + ch.b.w - 50;
        text(ctx, `máx. ${f1(x)}`, ch.X(x) + (right ? -4 : 4), ch.Y(28), { size: 10, bold: true, color: C.bad, align: right ? 'right' : 'left' });
      }
    } else {
      ch.fn((r) => eta(r, st.c, 1), C.curve1, 1.5, [5, 4]);
      ch.fn((r) => eta(r, st.c, 2), C.violet, 2.5);
      legend.push([`2 estágios (c = ${f0(st.c * 100)} %)`, C.violet], ['1 estágio só', C.curve1, [5, 4]]);
    }
    marker(ch, ctx, st.r, st.etav * 100);
    ch.legend(legend, ch.b.x + 8, ch.b.y + ch.b.h - 8 - 16 * (legend.length - 1));
  }

  // ---------------------------------------------------------------- contas
  function drawCalc(ctx: CanvasRenderingContext2D, v: LabValues, st: CompState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 316, 290, 636, 262, 10);
    ctx.fill();
    const two = st.z === 2;
    const n = st.n;
    const iso = Math.abs(n - 1) < 1e-6;
    const c = st.c;
    text(ctx, `${two ? '2 estágios' : '1 estágio'} · ar: R = 0,287 kJ/kg·K · Vd = 10 L por volta · c = ${f0(c * 100)} %`, 332, 313, { size: 13, bold: true });

    // estados
    const [s1, s2] = st.stages;
    const cols: [string, number][] = two
      ? [
          ['P baixa', 520],
          ['V (L)', 562],
          ['P alta', 610],
          ['V (L)', 652],
          ['T (°C)', 698],
        ]
      : [
          ['P (kPa)', 540],
          ['V (L)', 600],
          ['T (°C)', 660],
        ];
    for (const [hd, x] of cols) text(ctx, hd, x, 334, { size: 10, color: C.dim, align: 'right' });
    const desc = ['PMI: fecha a sucção', 'abre a descarga', 'PMS: fecha a descarga', 'abre a sucção'];
    s1.pts.forEach((q, i) => {
      const y = 350 + i * 14;
      text(ctx, String(i + 1), 332, y, { size: 11, bold: true });
      text(ctx, s1.dead ? (i % 2 ? 'PMS' : 'PMI') : desc[i], 346, y, { size: 10, color: C.dim });
      const vals = two && s2 ? [q.P, q.V, s2.pts[i].P, s2.pts[i].V, q.T - COMP.K0] : [q.P, q.V, q.T - COMP.K0];
      const digits = two ? [0, 2, 0, 2, 0] : [0, 2, 0];
      vals.forEach((val, j) => text(ctx, fmt(val, digits[j]), cols[j][1], y, { size: 11, bold: true, align: 'right' }));
    });

    const rTxt = two ? 'Pi/P₁' : 'P₂/P₁';
    const rs = st.rs;
    const e = 1 / n;
    const m = (n - 1) / n;
    const items: [string, string][] = [];
    if (two) items.push(['Pressão intermediária ótima: Pi = √(P₁·P₂)', `= √(100 × ${f0(v.p2)}) = ${f0(st.Pi)} kPa → razão ${f2(rs)} em cada estágio`]);
    items.push([
      `Rendimento volumétrico: ηv = 1 + c − c·(${rTxt})^(1/n)`,
      s1.dead
        ? `= 1 + ${f2(c)} − ${f2(c)} × ${f2(rs)}^${f2(e)} < 0 → ηv = 0 (máx. ${f1(st.rmax)})`
        : `= 1 + ${f2(c)} − ${f2(c)} × ${f2(rs)}^${f2(e)} = ${f1(st.etav * 100)} % → ${f2(st.fad)} m³/min de ar`,
    ]);
    items.push([
      `Descarga${two ? ' de cada estágio' : ''}: T₂ = T₁·(${rTxt})^((n−1)/n)`,
      iso ? '= 300 K: com n = 1 o ar não esquenta (27 °C)' : `= 300 × ${f2(rs)}^${fmt(m, 3)} = ${f0(st.T2)} K = ${f0(st.T2 - COMP.K0)} °C`,
    ]);
    items.push(
      iso
        ? ['Trabalho isotérmico: w = R·T₁·ln(P₂/P₁)', `= 0,287 × 300 × ln ${f2(st.r)} = ${f1(st.w)} kJ/kg`]
        : [
            `Trabalho: w = ${two ? '2·' : ''}n/(n−1)·R·T₁·[(${rTxt})^((n−1)/n) − 1]`,
            `= ${two ? '2 × ' : ''}${f2(n / (n - 1))} × 0,287 × 300 × (${fmt(tempFactor(rs, n), 3)} − 1) = ${f1(st.w)} kJ/kg`,
          ],
    );
    items.push(['Potência indicada: Ẇ = ṁ·w', `= ${fmt(st.mdot, 4)} kg/s × ${f1(st.w)} kJ/kg = ${f1(st.power)} kW`]);
    const y0 = two ? 412 : 416;
    const dy = two ? 26 : 32;
    items.forEach(([k, val], i) => {
      const y = y0 + i * dy;
      text(ctx, k, 332, y, { size: 10.5, color: C.dim });
      text(ctx, val, 342, y + 13, { size: 11.5, bold: true });
    });

    // trabalho por kg: isotérmico (mínimo), este compressor e adiabático em 1 estágio
    const bx = 716;
    const bw = 226;
    text(ctx, 'Trabalho por kg de ar (kJ/kg)', bx, 332, { size: 10, color: C.dim });
    const bars: [string, number, string][] = [
      ['isotérmico (o mínimo)', st.wiso, C.curve3],
      [two ? 'estes 2 estágios' : 'este compressor', st.w, C.amber],
    ];
    if (two) bars.push(['1 estágio, mesmo n', st.w1, 'rgba(226,235,245,0.55)']);
    bars.push(['adiabático, 1 estágio', st.wad, C.bad]);
    const top = Math.max(...bars.map((b) => b[1]));
    bars.forEach(([label, val, col], i) => {
      const y = 348 + i * 25;
      text(ctx, label, bx, y, { size: 10, color: C.text });
      text(ctx, f1(val), bx + bw, y, { size: 10, bold: true, align: 'right', color: col });
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(bx, y + 4, bw, 9);
      ctx.fillStyle = col;
      ctx.fillRect(bx, y + 4, bw * clamp(val / top, 0, 1), 9);
    });

    // para onde vai a descida do pistão
    const yb = 462;
    text(ctx, 'Descida do pistão (curso inteiro = Vd)', bx, yb, { size: 10, color: C.dim });
    const lost = clamp(1 - st.etav, 0, 1);
    ctx.fillStyle = C.bad;
    ctx.fillRect(bx, yb + 6, bw * lost, 14);
    ctx.fillStyle = C.good;
    ctx.fillRect(bx + bw * lost, yb + 6, bw * (1 - lost), 14);
    text(ctx, `re-expansão ${f0(lost * 100)} %`, bx, yb + 34, { size: 10, bold: true, color: C.bad });
    text(ctx, `ar novo ${f0(st.etav * 100)} %`, bx + bw, yb + 34, { size: 10, bold: true, color: C.good, align: 'right' });
    text(ctx, 'O espaço morto tira vazão, não muda o', bx, yb + 56, { size: 10, color: C.dim });
    text(ctx, 'trabalho por kg: o gás devolve o que recebeu.', bx, yb + 70, { size: 10, color: C.dim });
  }

  return {
    reset() {
      th = 0.35;
      flowT = 0;
      paused = false;
      stepNext = false;
      lastZ = null;
      sc.init = false;
    },
    actions: [
      {
        label: '⏯ Pausar / continuar',
        run() {
          paused = !paused;
        },
      },
      {
        label: '⏭ Próxima etapa',
        title: 'Avança até a próxima abertura ou fechamento de válvula (estágio 1) e pausa.',
        run() {
          stepNext = true;
        },
      },
    ],
    draw(ctx, v, _o, dt, _time) {
      const st = compState(v);
      if (lastZ !== null && st.z !== lastZ) th = 0.35;
      lastZ = st.z;
      if (stepNext) {
        const ev = eventsOf(st.stages[0]);
        const next = ev.find((e) => e > th + 1e-3) ?? ev[0] + TAU;
        th = (next + 1e-4) % TAU;
        paused = true;
        stepNext = false;
      }
      const step = paused ? 0 : dt;
      th = (th + (step * TAU) / REV_S) % TAU;
      flowT += step;
      const cs = [cylState(st.stages[0], st.n, th)];
      if (st.z === 2) cs.push(cylState(st.stages[1], st.n, th + PI));
      updateScales(v, dt);
      drawMachine(ctx, st, cs, step);
      drawPV(ctx, v, st, cs);
      drawEta(ctx, st);
      drawCalc(ctx, v, st);
      if (paused) tag(ctx, '⏸ pausado', 296, 26, C.amber, 'right', 10);
    },
    status(v, o) {
      const st = compState(v);
      if (st.stages[0].dead) {
        return {
          tone: 'bad',
          text: `Vazão zero: com ${f0(v.c)} % de espaço morto, a maior razão por estágio é (1 + 1/c)ⁿ = ${f1(st.rmax)}, e este estágio pede ${f1(st.rs)}. O gás preso re-expande o curso inteiro e a sucção nunca abre.`,
        };
      }
      if (o.T2 > 200) {
        return { tone: 'warn', text: `Descarga a ${f0(o.T2)} °C: quente demais para o óleo do cilindro (carboniza e pode inflamar). Resfrie melhor (n menor) ou divida a compressão em 2 estágios.` };
      }
      if (st.etav < 0.5) {
        return { tone: 'warn', text: `ηv = ${f1(o.etav)} %: ${f0((1 - st.etav) * 100)} % da descida do pistão só re-expande o gás do espaço morto. Menos espaço morto ou menos razão por estágio.` };
      }
      if (st.z === 2) {
        const T2one = COMP.T1 * tempFactor(st.r, st.n) - COMP.K0;
        return {
          tone: 'ok',
          text: `Pi = √(P₁·P₂) = ${f0(st.Pi)} kPa: razão ${f2(st.rs)} em cada estágio e trabalhos iguais. Economia de ${f1(o.save)} % e descarga a ${f0(o.T2)} °C (num estágio só, ${f0(T2one)} °C).`,
        };
      }
      if (Math.abs(st.n - 1) < 0.025) return { tone: 'ok', text: 'n = 1: compressão isotérmica, o menor trabalho possível — exigiria tirar todo o calor durante a compressão. O ar sai a 27 °C.' };
      return {
        tone: 'ok',
        text: `ηv = ${f1(o.etav)} %: de cada 10 L deslocados entram ${f2(st.vind)} L de ar novo. O trabalho por kg (${f1(o.w)} kJ/kg) não depende do espaço morto: ${f1(specificWork(st.r, st.n))} kJ/kg com qualquer c.`,
      };
    },
  };
}
