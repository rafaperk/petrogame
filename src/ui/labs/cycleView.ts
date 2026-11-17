/**
 * Desenho da bancada dos ciclos padrão a ar: motor de 4 tempos (Otto/Diesel) ou turbina a gás (Brayton),
 * com o estado do ar andando nos diagramas P–v e T–s, o retângulo de Carnot e as contas.
 */
import { AIR, CYC, cyclePoint, cycleState, legPoint, legPoints, V1, type CyclePoint, type CycleState, type Leg } from '../../learning/labs/cycle';
import { approach, arrow, C, Chart, fmt, labelPoints, marker, niceAxis, roundRect, seeded, tag, tempColor, text, ticksOf } from './draw';
import type { LabView } from './views';

const TAU = Math.PI * 2;
const PI = Math.PI;
const K = AIR.k;
const T_LO = 250;
const T_HI = 1800;
const tc = (T: number, a = 1) => tempColor(T, T_LO, T_HI, a);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const f0 = (x: number) => fmt(x, 0);
const digitsOf = (step: number) => (step >= 1 ? 0 : Math.abs(step * 10 - Math.round(step * 10)) < 1e-9 ? 1 : 2);

type Pt = [number, number, number]; // x, y e meia-largura do escoamento

interface Phase {
  key: string;
  name: string;
  dur: number;
  from: CyclePoint;
  to: CyclePoint;
  /** Processo no diagrama; null = estado parado (admissão, escape, transporte nos tubos). */
  leg: Leg | null;
  /** Motor: ângulo da manivela no começo e no fim da etapa (0 = PMS no início da admissão). */
  th0: number;
  th1: number;
  /** Turbina: caminho do ar no desenho. */
  path?: Pt[];
}

function locate(phases: Phase[], t: number): { i: number; p: number } {
  let acc = 0;
  for (let i = 0; i < phases.length; i++) {
    if (t < acc + phases[i].dur) return { i, p: (t - acc) / phases[i].dur };
    acc += phases[i].dur;
  }
  return { i: phases.length - 1, p: 1 };
}

function panel(ctx: CanvasRenderingContext2D, title: string, sub: string): void {
  ctx.fillStyle = C.bg2;
  roundRect(ctx, 8, 8, 300, 544, 10);
  ctx.fill();
  text(ctx, title, 22, 30, { size: 13, bold: true });
  text(ctx, sub, 22, 48, { size: 11, color: C.dim });
}

function metalWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, C.metalDark);
  g.addColorStop(0.5, C.metalLight);
  g.addColorStop(1, C.metal);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

// ================================================================== motor (Otto e Diesel)
const EN = { cx: 158, crankY: 466, rc: 60, L: 150, pin: 24, bl: 92, br: 224, ph: 44, bottom: 402 } as const;
const pistonTop = (th: number) => EN.crankY - (EN.rc * Math.cos(th) + Math.sqrt(EN.L * EN.L - (EN.rc * Math.sin(th)) ** 2)) - EN.pin;
const TOP_TDC = pistonTop(0);
const TOP_BDC = pistonTop(PI);
/** O cabeçote desce quando r sobe: o volume morto (no PMS) é 1/r do volume no PMI. */
const headY = (r: number) => TOP_BDC - (TOP_BDC - TOP_TDC) / (1 - 1 / r);
function volumeAt(r: number): (th: number) => number {
  const yH = headY(r);
  return (th) => (V1 * (pistonTop(th) - yH)) / (TOP_BDC - yH);
}

function enginePhases(st: CycleState, vAt: (th: number) => number): Phase[] {
  const S = 0.9; // s por curso
  const w = PI / S;
  const [p1, p2, p3, p4] = st.pts;
  const otto = st.cyc === CYC.otto;
  let th3 = 2 * PI;
  if (!otto) {
    // ângulo em que o volume chega a v₃ (fim da injeção)
    let a = 2 * PI;
    let b = 3 * PI;
    for (let i = 0; i < 40; i++) {
      const m = (a + b) / 2;
      if (vAt(m) < p3.v) a = m;
      else b = m;
    }
    th3 = (a + b) / 2;
  }
  return [
    { key: 'intake', name: 'Admissão: entra ar a 100 kPa e 27 °C (estado 1)', dur: S, from: p1, to: p1, leg: null, th0: 0, th1: PI },
    { key: 'comp', name: '1 → 2: compressão isentrópica', dur: S, from: p1, to: p2, leg: 'isentropic', th0: PI, th1: 2 * PI },
    {
      key: 'comb',
      name: otto ? '2 → 3: centelha! Calor a volume constante' : '2 → 3: injeção — calor a pressão constante',
      dur: otto ? 0.55 : Math.max(0.06, (th3 - 2 * PI) / w),
      from: p2,
      to: p3,
      leg: otto ? 'isochoric' : 'isobaric',
      th0: 2 * PI,
      th1: th3,
    },
    { key: 'exp', name: '3 → 4: expansão isentrópica (tempo motor)', dur: Math.max(0.06, (3 * PI - th3) / w), from: p3, to: p4, leg: 'isentropic', th0: th3, th1: 3 * PI },
    { key: 'blow', name: '4 → 1: abre o escape — rejeita calor a v cte', dur: 0.55, from: p4, to: p1, leg: 'isochoric', th0: 3 * PI, th1: 3 * PI },
    { key: 'exhaust', name: 'Escape: o pistão empurra os gases para fora', dur: S, from: p1, to: p1, leg: null, th0: 3 * PI, th1: 4 * PI },
  ];
}

/** Estado do ar no cilindro, coerente com a posição do pistão. */
function engineState(ph: Phase, p: number, th: number, vAt: (th: number) => number): CyclePoint {
  switch (ph.key) {
    case 'comp':
    case 'exp': {
      const v = vAt(th);
      return cyclePoint(ph.from.T * Math.pow(ph.from.v / v, K - 1), v);
    }
    case 'comb':
      if (ph.leg === 'isobaric') {
        const v = vAt(th);
        return cyclePoint((ph.from.T * v) / ph.from.v, v);
      }
      return legPoint(ph.from, ph.to, 'isochoric', p);
    case 'blow':
      return legPoint(ph.from, ph.to, 'isochoric', p);
    default:
      return ph.from;
  }
}

// ================================================================== turbina a gás (Brayton)
const BR = { y: 330, cx0: 22, cx1: 96, ch0: 46, ch1: 20, tx0: 220, tx1: 294, th0: 20, th1: 46 } as const;
const PATH: Record<string, Pt[]> = {
  in: [[4, 330, 24], [22, 330, 40]],
  comp: [[22, 330, 40], [82, 330, 16], [90, 307, 3]],
  p2: [[90, 307, 3], [90, 216, 3], [124, 216, 3]],
  p2r: [[90, 307, 3], [90, 133, 3]],
  rc: [[90, 133, 5], [250, 133, 5]],
  px: [[250, 133, 3], [250, 172, 3], [110, 172, 3], [110, 216, 3], [124, 216, 3]],
  comb: [[124, 216, 13], [192, 216, 13]],
  p3: [[192, 216, 3], [226, 216, 3], [226, 307, 3]],
  turb: [[226, 307, 3], [236, 330, 16], [278, 330, 40], [286, 289, 3]],
  ex: [[286, 289, 3], [286, 64, 10]],
  exr: [[286, 289, 3], [286, 110, 3]],
  rh: [[286, 110, 6], [70, 110, 6]],
  stack: [[70, 110, 3], [70, 66, 10]],
};

function along(path: Pt[], u: number): { x: number; y: number; hw: number; nx: number; ny: number } {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
  let d = clamp(u, 0, 1) * total;
  for (let i = 1; i < path.length; i++) {
    const [x0, y0, h0] = path[i - 1];
    const [x1, y1, h1] = path[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (d <= len || i === path.length - 1) {
      const k = len > 0 ? Math.min(1, d / len) : 0;
      return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, hw: h0 + (h1 - h0) * k, nx: len > 0 ? -(y1 - y0) / len : 0, ny: len > 0 ? (x1 - x0) / len : 1 };
    }
    d -= len;
  }
  const [x, y, hw] = path[path.length - 1];
  return { x, y, hw, nx: 0, ny: 1 };
}

/** Pontos x (ar saindo do regenerador) e y (escape saindo dele). */
function regenPoints(st: CycleState): { px: CyclePoint; py: CyclePoint } {
  return {
    px: cyclePoint(st.regen.Tx, (AIR.R * st.regen.Tx) / st.pts[1].P),
    py: cyclePoint(st.regen.Ty, (AIR.R * st.regen.Ty) / st.pts[0].P),
  };
}

function braytonPhases(st: CycleState): Phase[] {
  const [p1, p2, p3, p4] = st.pts;
  const on = st.regen.on;
  const { px, py } = regenPoints(st);
  const ph = (key: string, name: string, dur: number, from: CyclePoint, to: CyclePoint, leg: Leg | null, path?: Pt[]): Phase => ({
    key,
    name,
    dur,
    from,
    to,
    leg,
    th0: 0,
    th1: 0,
    path,
  });
  const list: Phase[] = [
    ph('in', 'Entrada: ar a 100 kPa e 27 °C (estado 1)', 0.35, p1, p1, null, PATH.in),
    ph('comp', 'Compressor 1 → 2: compressão isentrópica', 1, p1, p2, 'isentropic', PATH.comp),
    ph('p2', 'Ar comprimido (estado 2)', 0.4, p2, p2, null, on ? PATH.p2r : PATH.p2),
  ];
  if (on) {
    list.push(
      ph('rc', 'Regenerador 2 → x: o ar recebe calor do escape', 0.8, p2, px, 'isobaric', PATH.rc),
      ph('px', 'Ar pré-aquecido (estado x)', 0.45, px, px, null, PATH.px),
    );
  }
  const c0 = on ? px : p2;
  list.push(
    ph('comb', `Câmara de combustão ${on ? 'x' : '2'} → 3: calor a P cte`, 1, c0, p3, 'isobaric', PATH.comb),
    ph('p3', 'Gás quente (estado 3)', 0.4, p3, p3, null, PATH.p3),
    ph('turb', 'Turbina 3 → 4: expansão isentrópica', 1, p3, p4, 'isentropic', PATH.turb),
  );
  if (on) {
    list.push(
      ph('ex', 'Escape quente (estado 4)', 0.5, p4, p4, null, PATH.exr),
      ph('rh', 'Regenerador 4 → y: o escape cede calor ao ar', 0.8, p4, py, 'isobaric', PATH.rh),
      ph('stack', 'Chaminé (estado y)', 0.4, py, py, null, PATH.stack),
    );
  } else list.push(ph('ex', 'Escape (estado 4)', 0.6, p4, p4, null, PATH.ex));
  const a0 = on ? py : p4;
  list.push(ph('atm', `Atmosfera ${on ? 'y' : '4'} → 1: rejeita calor a P cte`, 0.9, a0, p1, 'isobaric'));
  return list;
}

/** Contorno fechado do ciclo 1-2-3-4-1. */
function cyclePath(st: CycleState): CyclePoint[] {
  const out: CyclePoint[] = [];
  for (let i = 0; i < 4; i++) out.push(...legPoints(st.pts[i], st.pts[(i + 1) % 4], st.legs[i], 40));
  return out;
}

interface Particle {
  s: number;
  o: number;
}
interface Mol {
  u: number;
  w: number;
  du: number;
  dw: number;
}

export function cycleView(): LabView {
  const rnd = seeded(23);
  const parts: Particle[] = Array.from({ length: 120 }, (_, i) => ({ s: i * 0.08, o: rnd() * 2 - 1 }));
  const mols: Mol[] = Array.from({ length: 26 }, () => {
    const a = rnd() * TAU;
    return { u: rnd(), w: rnd(), du: Math.cos(a), dw: Math.sin(a) };
  });
  let clock = 0;
  let paused = false;
  let stepNext = false;
  let lastCyc: number | null = null;
  const sc = { init: false, p: 1000, pStep: 200, v: 1, vStep: 0.2, t: 2000, tStep: 500, s1: 1, sStep: 0.2 };

  function updateScales(st: CycleState, dt: number): void {
    const maxP = Math.max(...st.pts.map((q) => q.P));
    const maxV = Math.max(...st.pts.map((q) => q.v));
    const maxT = Math.max(...st.pts.map((q) => q.T));
    const maxS = Math.max(...st.pts.map((q) => q.s));
    const pAx = niceAxis(maxP * 1.08, [100, 200, 250, 500, 1000, 2000, 2500, 5000]);
    const vAx = niceAxis(maxV * 1.08, [0.1, 0.2, 0.25, 0.5, 1, 2]);
    const tAx = niceAxis(maxT * 1.08, [250, 500, 1000]);
    const sAx = niceAxis(maxS * 1.1 + 0.04, [0.1, 0.2, 0.25, 0.5]);
    if (!sc.init) Object.assign(sc, { init: true, p: pAx.top, v: vAx.top, t: tAx.top, s1: sAx.top });
    else {
      sc.p = approach(sc.p, pAx.top, dt);
      sc.v = approach(sc.v, vAx.top, dt);
      sc.t = approach(sc.t, tAx.top, dt);
      sc.s1 = approach(sc.s1, sAx.top, dt);
    }
    sc.pStep = pAx.step;
    sc.vStep = vAx.step;
    sc.tStep = tAx.step;
    sc.sStep = sAx.step;
  }

  // ---------------------------------------------------------------- motor
  function drawEngine(ctx: CanvasRenderingContext2D, st: CycleState, ph: Phase, p: number, th: number, cur: CyclePoint, dt: number, time: number): void {
    const otto = st.cyc === CYC.otto;
    const { cx, bl, br } = EN;
    const yH = headY(st.r);
    const yP = pistonTop(th);
    panel(ctx, `Motor de 4 tempos — ciclo ${otto ? 'Otto' : 'Diesel'}`, `${otto ? 'Ignição por centelha' : 'Ignição por compressão'} · r = ${fmt(st.r, 1)}`);

    // linha do tempo dos 4 tempos (720° de manivela)
    const SX = 18;
    const SW = 280;
    const SY = 60;
    const strokeIdx = Math.min(3, Math.floor(th / PI + 1e-9));
    ['Admissão', 'Compressão', 'Expansão', 'Escape'].forEach((nm, i) => {
      const x = SX + (i * SW) / 4;
      const on = i === strokeIdx && ph.key !== 'comb' && ph.key !== 'blow';
      ctx.fillStyle = on ? 'rgba(255,201,77,0.22)' : 'rgba(255,255,255,0.05)';
      roundRect(ctx, x + 1, SY, SW / 4 - 2, 20, 4);
      ctx.fill();
      text(ctx, nm, x + SW / 8, SY + 14, { size: 10, align: 'center', color: on ? C.amber : C.dim, bold: on });
    });
    const nx = SX + (th / (4 * PI)) * SW;
    ctx.fillStyle = ph.key === 'comb' ? C.curve2 : ph.key === 'blow' ? C.cold : C.amber;
    ctx.fillRect(nx - 1.5, SY - 4, 3, 28);
    text(ctx, ph.name, SX, SY + 38, { size: 11, bold: true, color: ph.key === 'comb' ? C.curve2 : ph.key === 'blow' ? C.cold : C.text });

    // cárter
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    roundRect(ctx, 70, EN.bottom, 176, 144, 14);
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.stroke();

    // gás no cilindro
    const gasH = Math.max(1, yP - yH);
    ctx.fillStyle = ph.key === 'exhaust' ? 'rgba(140,140,150,0.5)' : ph.key === 'intake' ? tc(AIR.T1, 0.45) : tc(cur.T, 0.75);
    ctx.fillRect(bl, yH, br - bl, gasH);
    const speed = 60 * Math.sqrt(cur.T / AIR.T1);
    for (const m of mols) {
      m.u += (m.du * speed * dt) / (br - bl - 6);
      m.w += (m.dw * speed * dt) / Math.max(4, gasH - 6);
      if (m.u < 0 || m.u > 1) {
        m.du = -m.du;
        m.u = clamp(m.u, 0, 1);
      }
      if (m.w < 0 || m.w > 1) {
        m.dw = -m.dw;
        m.w = clamp(m.w, 0, 1);
      }
      ctx.fillStyle = ph.key === 'exhaust' ? 'rgba(200,200,205,0.8)' : tc(cur.T);
      ctx.beginPath();
      ctx.arc(bl + 3 + m.u * (br - bl - 6), yH + 3 + m.w * Math.max(0, gasH - 6), 2, 0, TAU);
      ctx.fill();
    }
    // combustão
    if (ph.key === 'comb') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(bl, yH, br - bl, gasH);
      ctx.clip();
      if (otto) {
        const rad = 8 + p * (br - bl);
        const g = ctx.createRadialGradient(cx, yH + 2, 2, cx, yH + 2, rad);
        g.addColorStop(0, 'rgba(255,245,190,0.95)');
        g.addColorStop(0.55, tc(st.pts[2].T, 0.85));
        g.addColorStop(1, 'rgba(239,91,67,0)');
        ctx.fillStyle = g;
        ctx.fillRect(bl, yH, br - bl, gasH);
      } else {
        const g = ctx.createRadialGradient(cx, yH + 8, 2, cx, yH + 8, 30 + gasH * 0.8);
        g.addColorStop(0, 'rgba(255,230,150,0.85)');
        g.addColorStop(1, 'rgba(239,91,67,0)');
        ctx.fillStyle = g;
        ctx.fillRect(bl, yH, br - bl, gasH);
        for (let i = 0; i < 18; i++) {
          const a = ((i % 9) / 8 - 0.5) * 1.4;
          const d = (time * 150 + i * 29) % 70;
          ctx.fillStyle = `rgba(255,214,120,${(1 - d / 70).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(cx + Math.sin(a) * d, yH + 4 + Math.cos(a) * d, 1.8, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // paredes e cabeçote
    metalWall(ctx, bl - 8, yH, 8, EN.bottom - yH);
    metalWall(ctx, br, yH, 8, EN.bottom - yH);
    ctx.fillStyle = '#5b6573';
    ctx.fillRect(bl - 18, yH - 34, br - bl + 36, 34);
    // dutos de admissão (esq.) e escape (dir.)
    const ports: [number, number][] = [
      [cx - 34, -1],
      [cx + 34, 1],
    ];
    for (const [xv, dir] of ports) {
      ctx.strokeStyle = '#16212d';
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(xv, yH - 6);
      ctx.lineTo(xv + dir * 40, yH - 42);
      ctx.lineTo(xv + dir * 80, yH - 42);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }
    text(ctx, 'ar', cx - 120, yH - 50, { size: 10, color: C.cold, bold: true });
    text(ctx, 'escape', cx + 120, yH - 50, { size: 10, color: C.dim, bold: true, align: 'right' });
    // fluxo nos dutos
    const portFlow = (xv: number, dir: number, inward: boolean, color: (q: number) => string) => {
      // duto: válvula → cotovelo (xv ± 40) → saída (xv ± 80)
      for (let i = 0; i < 6; i++) {
        const q = (time * 1.4 + i / 6) % 1;
        const u = inward ? 1 - q : q;
        const k = u < 0.5 ? u / 0.5 : (u - 0.5) / 0.5;
        const x = u < 0.5 ? xv + dir * 40 * k : xv + dir * (40 + 40 * k);
        const y = u < 0.5 ? yH - 6 - 36 * k : yH - 42;
        ctx.fillStyle = color(q);
        ctx.beginPath();
        ctx.arc(x, y, inward ? 3 : 3 + 3 * q, 0, TAU);
        ctx.fill();
      }
    };
    if (ph.key === 'intake') portFlow(cx - 34, -1, true, () => tc(AIR.T1, 0.9));
    if (ph.key === 'blow' || ph.key === 'exhaust') portFlow(cx + 34, 1, false, (q) => `rgba(170,170,180,${(0.7 * (1 - q)).toFixed(2)})`);
    // válvulas
    const lift = (which: 'in' | 'ex') => {
      if (which === 'in') return ph.key === 'intake' ? 9 * Math.sin(p * PI) : 0;
      if (ph.key === 'blow') return 9 * p;
      return ph.key === 'exhaust' ? 9 * (1 - p) : 0;
    };
    for (const [xv, which] of [
      [cx - 34, 'in'],
      [cx + 34, 'ex'],
    ] as const) {
      const l = lift(which);
      ctx.fillStyle = C.metalLight;
      ctx.fillRect(xv - 1.5, yH - 62 + l, 3, 58);
      ctx.beginPath();
      ctx.moveTo(xv - 13, yH + l);
      ctx.lineTo(xv + 13, yH + l);
      ctx.lineTo(xv + 6, yH - 5 + l);
      ctx.lineTo(xv - 6, yH - 5 + l);
      ctx.closePath();
      ctx.fill();
    }
    // vela (Otto) ou bico injetor (Diesel)
    if (otto) {
      ctx.fillStyle = '#e8e2d6';
      ctx.fillRect(cx - 4, yH - 60, 8, 14);
      ctx.fillStyle = C.metal;
      ctx.fillRect(cx - 7, yH - 46, 14, 14);
      ctx.strokeStyle = C.metalLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, yH - 2);
      ctx.lineTo(cx, yH + 4);
      ctx.stroke();
      if (ph.key === 'comb' && p < 0.45) {
        ctx.strokeStyle = '#fff6a8';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU + time * 9;
          ctx.beginPath();
          ctx.moveTo(cx, yH + 5);
          ctx.lineTo(cx + Math.cos(a) * 9, yH + 5 + Math.sin(a) * 9);
          ctx.stroke();
        }
      }
    } else {
      ctx.fillStyle = '#3f4855';
      ctx.fillRect(cx - 5, yH - 62, 10, 60);
      ctx.fillStyle = C.amber;
      ctx.fillRect(cx - 2, yH - 70, 4, 8);
      ctx.fillStyle = C.metalLight;
      ctx.fillRect(cx - 2, yH - 2, 4, 5);
    }

    // manivela, biela e pistão
    const cpX = cx + EN.rc * Math.sin(th);
    const cpY = EN.crankY - EN.rc * Math.cos(th);
    const away = Math.atan2(-(cpY - EN.crankY), -(cpX - cx));
    ctx.fillStyle = '#4a5562';
    ctx.beginPath();
    ctx.moveTo(cx, EN.crankY);
    ctx.arc(cx, EN.crankY, 44, away - 1.1, away + 1.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6b7684';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, EN.crankY);
    ctx.lineTo(cpX, cpY);
    ctx.stroke();
    const pinY = yP + EN.pin;
    ctx.strokeStyle = C.metal;
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(cx, pinY);
    ctx.lineTo(cpX, cpY);
    ctx.stroke();
    ctx.lineCap = 'butt';
    for (const [x, y, r] of [
      [cx, EN.crankY, 9],
      [cpX, cpY, 8],
    ]) {
      ctx.fillStyle = C.metalLight;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
    const pg = ctx.createLinearGradient(0, yP, 0, yP + EN.ph);
    pg.addColorStop(0, C.metalLight);
    pg.addColorStop(1, C.metalDark);
    ctx.fillStyle = pg;
    ctx.fillRect(bl + 2, yP, br - bl - 4, EN.ph);
    ctx.strokeStyle = 'rgba(20,30,40,0.6)';
    ctx.lineWidth = 1.5;
    for (const dy of [6, 11, 16]) {
      ctx.beginPath();
      ctx.moveTo(bl + 2, yP + dy);
      ctx.lineTo(br - 2, yP + dy);
      ctx.stroke();
    }
    ctx.fillStyle = C.metalDark;
    ctx.beginPath();
    ctx.arc(cx, pinY, 5, 0, TAU);
    ctx.fill();

    // PMS e PMI
    for (const [y, lab] of [
      [TOP_TDC, 'PMS'],
      [TOP_BDC, 'PMI'],
    ] as const) {
      ctx.strokeStyle = 'rgba(226,235,245,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(44, y);
      ctx.lineTo(bl - 10, y);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, lab, 40, y + 4, { size: 9, color: C.dim, align: 'right' });
    }

    // calor e trabalho da etapa
    if (ph.key === 'comb') tag(ctx, `q_in = ${f0(st.qin)} kJ/kg`, cx, yH - 72, C.curve2, 'center', 11);
    if (ph.key === 'blow') tag(ctx, `q_out = ${f0(st.qout)} kJ/kg`, cx, yH - 72, C.cold, 'center', 11);
    if (ph.key === 'comp') tag(ctx, `recebe w = ${f0(st.wc)} kJ/kg`, 300, 544, C.bad, 'right', 10);
    if (ph.key === 'exp') tag(ctx, `produz w = ${f0(AIR.cv * (st.pts[2].T - st.pts[3].T))} kJ/kg`, 300, 544, C.good, 'right', 10);
  }

  // ---------------------------------------------------------------- turbina a gás
  function drawTurbine(ctx: CanvasRenderingContext2D, st: CycleState, phases: Phase[], period: number, dt: number, time: number): void {
    const on = st.regen.on;
    const useful = st.regen.useful;
    const [p1, p2, p3, p4] = st.pts;
    const { Tx, Ty } = st.regen;
    panel(ctx, 'Turbina a gás — ciclo Brayton', `rp = ${f0(st.rp)} · ${on ? (useful ? 'com regenerador' : 'regenerador sem efeito') : 'ciclo aberto simples'}`);

    // tubos
    const pipe = (pts: Pt[], T: number, w = 10) => {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (const [col, lw] of [
        ['#0d1824', w + 4],
        [tc(T, 0.6), w],
      ] as const) {
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
    };
    pipe(on ? PATH.p2r : PATH.p2, p2.T);
    if (on) pipe(PATH.px, Tx);
    pipe(PATH.p3, p3.T);
    pipe(on ? PATH.exr : PATH.ex, p4.T, 12);
    if (on) pipe(PATH.stack, Ty, 12);
    arrow(ctx, on ? 70 : 286, on ? 72 : 70, on ? 70 : 286, on ? 58 : 56, C.dim, 2, 7);
    text(ctx, on ? 'chaminé' : 'escape', on ? 80 : 276, 66, { size: 9, color: C.dim, align: on ? 'left' : 'right' });
    arrow(ctx, 2, 330, 18, 330, C.cold, 3, 8);

    // regenerador
    if (on) {
      ctx.fillStyle = 'rgba(180,140,255,0.08)';
      roundRect(ctx, 60, 92, 236, 58, 6);
      ctx.fill();
      ctx.strokeStyle = useful ? C.violet : C.bad;
      ctx.lineWidth = 2;
      ctx.setLineDash(useful ? [] : [5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      const gEx = ctx.createLinearGradient(286, 0, 70, 0);
      gEx.addColorStop(0, tc(p4.T, 0.55));
      gEx.addColorStop(1, tc(Ty, 0.55));
      ctx.fillStyle = gEx;
      ctx.fillRect(66, 101, 226, 18);
      const gAir = ctx.createLinearGradient(90, 0, 250, 0);
      gAir.addColorStop(0, tc(p2.T, 0.55));
      gAir.addColorStop(1, tc(Tx, 0.55));
      ctx.fillStyle = gAir;
      ctx.fillRect(86, 124, 170, 18);
      ctx.fillStyle = C.metal;
      ctx.fillRect(66, 120, 226, 3);
      if (useful) for (const x of [118, 170, 222]) arrow(ctx, x, 111, x, 133, '#ffd2a6', 1.5, 6);
      text(ctx, useful ? 'Regenerador' : 'Regenerador inútil: T₄ < T₂', 294, 86, {
        size: 10,
        align: 'right',
        bold: true,
        color: useful ? C.violet : C.bad,
      });
    }

    // compressor e turbina (trapézios com pás girando)
    const machine = (x0: number, x1: number, h0: number, h1: number, Tin: number, Tout: number, label: string, spin: number) => {
      const y = BR.y;
      const shape = () => {
        ctx.beginPath();
        ctx.moveTo(x0, y - h0);
        ctx.lineTo(x1, y - h1);
        ctx.lineTo(x1, y + h1);
        ctx.lineTo(x0, y + h0);
        ctx.closePath();
      };
      shape();
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, tc(Tin, 0.4));
      g.addColorStop(1, tc(Tout, 0.4));
      ctx.fillStyle = g;
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(220,230,240,0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.lineDashOffset = -time * 40 * spin;
      for (let x = x0 + 7; x < x1 - 3; x += 9) {
        ctx.beginPath();
        ctx.moveTo(x, y - 50);
        ctx.lineTo(x, y + 50);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
      ctx.restore();
      shape();
      ctx.strokeStyle = C.metalLight;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      text(ctx, label, (x0 + x1) / 2, y + Math.max(h0, h1) + 16, { size: 11, bold: true, align: 'center' });
    };
    // eixo e gerador
    ctx.strokeStyle = C.metal;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(BR.cx1, BR.y);
    ctx.lineTo(BR.tx0, BR.y);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(30,40,50,0.6)';
    ctx.lineWidth = 8;
    ctx.setLineDash([3, 9]);
    ctx.lineDashOffset = -time * 30;
    ctx.beginPath();
    ctx.moveTo(BR.cx1, BR.y);
    ctx.lineTo(BR.tx0, BR.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    machine(BR.cx0, BR.cx1, BR.ch0, BR.ch1, p1.T, p2.T, 'Compressor', 1);
    machine(BR.tx0, BR.tx1, BR.th0, BR.th1, p3.T, p4.T, 'Turbina', -1);
    ctx.fillStyle = '#3b4654';
    roundRect(ctx, 136, 314, 44, 32, 6);
    ctx.fill();
    ctx.strokeStyle = C.good;
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, 'G', 158, 336, { size: 15, bold: true, align: 'center', color: C.good });
    arrow(ctx, 158, 348, 158, 366, C.good, 3, 8);
    tag(ctx, `w_líq = ${f0(st.wnet)} kJ/kg`, 158, 384, C.good, 'center', 10);

    // câmara de combustão
    const cin = on ? Tx : p2.T;
    ctx.fillStyle = '#2a1d1a';
    roundRect(ctx, 124, 196, 68, 40, 8);
    ctx.fill();
    ctx.save();
    ctx.clip();
    const heat = clamp((p3.T - cin) / 1400, 0.15, 1);
    for (let i = 0; i < 5; i++) {
      const x = 132 + i * 13;
      const r = (10 + 9 * heat) * (0.8 + 0.2 * Math.sin(time * 11 + i * 1.7));
      const g = ctx.createRadialGradient(x, 216, 1, x, 216, r);
      g.addColorStop(0, 'rgba(255,240,170,0.9)');
      g.addColorStop(0.5, 'rgba(255,150,60,0.6)');
      g.addColorStop(1, 'rgba(239,91,67,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, 216 - r, 2 * r, 2 * r);
    }
    ctx.restore();
    roundRect(ctx, 124, 196, 68, 40, 8);
    ctx.strokeStyle = '#c9774a';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, 'combustão', 158, 191, { size: 10, align: 'center', color: C.curve2, bold: true });
    arrow(ctx, 158, 262, 158, 240, C.amber, 2, 7);
    text(ctx, 'combustível', 158, 275, { size: 9, align: 'center', color: C.dim });

    // partículas de ar
    for (const pt of parts) {
      pt.s %= period;
      const { i, p } = locate(phases, pt.s);
      const ph = phases[i];
      if (!ph.path) continue;
      const a = along(ph.path, p);
      let alpha = 0.95;
      if (ph.key === 'in') alpha = clamp(p * 2.5, 0, 1);
      if ((ph.key === 'ex' && !on) || ph.key === 'stack') alpha = clamp((1 - p) * 2.2, 0, 1);
      ctx.fillStyle = tc(ph.from.T + (ph.to.T - ph.from.T) * p, alpha);
      ctx.beginPath();
      ctx.arc(a.x + a.nx * a.hw * pt.o, a.y + a.ny * a.hw * pt.o, 2.6, 0, TAU);
      ctx.fill();
    }
    // parcela acompanhada nos diagramas
    const tagged = locate(phases, clock);
    const tph = phases[tagged.i];
    if (tph.path) {
      const a = along(tph.path, tagged.p);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 6, 0, TAU);
      ctx.stroke();
    }
    void dt;

    // estados
    const stTag = (s: string, T: number, x: number, y: number, align: CanvasTextAlign = 'center') =>
      tag(ctx, `${s} · ${f0(T - AIR.K0)} °C`, x, y, tc(T), align, 10);
    stTag('1', p1.T, 8, 272, 'left');
    stTag('2', p2.T, 90, 268);
    stTag('3', p3.T, 226, 268);
    stTag('4', p4.T, 302, 214, 'right');
    if (on) {
      stTag('x', Tx, 205, 168);
      stTag('y', Ty, 82, 82, 'left');
    }

    // etapa e trabalhos no eixo
    text(ctx, tph.name, 18, 416, { size: 11, bold: true, color: tph.key === 'comb' ? C.curve2 : tph.key === 'atm' ? C.cold : C.text });
    const x0 = 18;
    const wMax = 282;
    const k = wMax / st.wt;
    text(ctx, 'Turbina: w_t', x0, 438, { size: 10, color: C.dim });
    text(ctx, `${f0(st.wt)} kJ/kg`, x0 + wMax, 438, { size: 10, bold: true, align: 'right', color: C.curve2 });
    ctx.fillStyle = C.curve2;
    ctx.fillRect(x0, 443, wMax, 13);
    text(ctx, `Compressor: w_c = ${f0(st.wc)} (${f0(st.bwr * 100)} %)`, x0, 474, { size: 10, color: C.bad, bold: true });
    text(ctx, `Líquido: ${f0(st.wnet)}`, x0 + wMax, 474, { size: 10, color: C.good, bold: true, align: 'right' });
    ctx.fillStyle = C.bad;
    ctx.fillRect(x0, 479, st.wc * k, 13);
    ctx.fillStyle = C.good;
    ctx.fillRect(x0 + st.wc * k, 479, Math.max(0, st.wnet * k), 13);
    text(ctx, 'O compressor gasta parte do trabalho da turbina;', x0, 514, { size: 10, color: C.dim });
    text(ctx, 'só o que sobra (w_líq) vai para o gerador.', x0, 528, { size: 10, color: C.dim });
  }

  // ---------------------------------------------------------------- diagramas
  function drawPv(ctx: CanvasRenderingContext2D, st: CycleState, cur: CyclePoint): void {
    const ch = new Chart(ctx, { x: 362, y: 42, w: 244, h: 194, x0: 0, x1: sc.v, y0: 0, y1: sc.p });
    ch.frame('Diagrama P–v', 'v (m³/kg)', 'P (kPa)', ticksOf(0, sc.v, sc.vStep), ticksOf(0, sc.p, sc.pStep), 0, digitsOf(sc.vStep));
    const pts = cyclePath(st).map((q) => [q.v, q.P] as [number, number]);
    ch.area(pts, 'rgba(95,211,138,0.22)', true);
    ch.poly(pts, C.amber, 3);
    if (st.regen.useful) {
      const { px, py } = regenPoints(st);
      ch.dot(px.v, px.P, C.violet, 4);
      ch.dot(py.v, py.P, C.violet, 4);
    }
    marker(ch, ctx, cur.v, cur.P);
    labelPoints(ch, ctx, st.pts.map((q) => [q.v, q.P] as [number, number]), ['1', '2', '3', '4']);
    text(ctx, 'área interna = w_líq', ch.b.x + ch.b.w - 4, ch.b.y + 14, { size: 10, color: C.good, align: 'right' });
  }

  function drawTs(ctx: CanvasRenderingContext2D, st: CycleState, cur: CyclePoint): void {
    const x0 = -0.06 * sc.s1;
    const ch = new Chart(ctx, { x: 694, y: 42, w: 240, h: 194, x0, x1: sc.s1, y0: 0, y1: sc.t });
    ch.frame('Diagrama T–s', 's (kJ/kg·K)', 'T (K)', ticksOf(0, sc.s1, sc.sStep), ticksOf(0, sc.t, sc.tStep), 0, digitsOf(sc.sStep));
    const [p1, , p3, p4] = st.pts;
    let lowMid: CyclePoint;
    if (st.regen.useful) {
      const { py } = regenPoints(st);
      ch.area(legPoints(p4, py, 'isobaric').map((q) => [q.s, q.T]), 'rgba(180,140,255,0.32)');
      ch.area(legPoints(py, p1, 'isobaric').map((q) => [q.s, q.T]), 'rgba(59,155,232,0.32)');
      lowMid = legPoint(py, p1, 'isobaric', 0.5);
      const m = legPoint(p4, py, 'isobaric', 0.5);
      text(ctx, 'regenerado', ch.X(m.s), ch.Y(m.T / 2), { size: 9, color: C.violet, align: 'center', bold: true });
    } else {
      ch.area(legPoints(p4, p1, st.legs[3]).map((q) => [q.s, q.T]), 'rgba(59,155,232,0.32)');
      lowMid = legPoint(p4, p1, st.legs[3], 0.5);
    }
    const pts = cyclePath(st).map((q) => [q.s, q.T] as [number, number]);
    ch.area(pts, 'rgba(95,211,138,0.28)', true);
    // Carnot entre T₁ e T₃ com a mesma variação de entropia
    ch.poly(
      [
        [0, p1.T],
        [p3.s, p1.T],
        [p3.s, p3.T],
        [0, p3.T],
        [0, p1.T],
      ],
      'rgba(226,235,245,0.8)',
      1.5,
      [5, 4],
    );
    text(ctx, 'Carnot', ch.X(p3.s) - 4, ch.Y(p3.T) - 5, { size: 10, align: 'right' });
    ch.poly(pts, C.amber, 3);
    if (ch.X(p4.s) - ch.X(0) > 40) text(ctx, 'q_out', ch.X(lowMid.s), ch.Y(p1.T / 2), { size: 11, bold: true, align: 'center', color: C.cold, shadow: true });
    const mid = st.pts.reduce((a, q) => ({ s: a.s + q.s / 4, T: a.T + q.T / 4 }), { s: 0, T: 0 });
    if (ch.X(p3.s) - ch.X(0) > 40) text(ctx, 'w_líq', ch.X(mid.s), ch.Y(mid.T) + 4, { size: 11, bold: true, align: 'center', color: C.good, shadow: true });
    if (st.regen.useful) {
      const { px, py } = regenPoints(st);
      ch.dot(px.s, px.T, C.violet, 4);
      ch.dot(py.s, py.T, C.violet, 4);
    }
    marker(ch, ctx, cur.s, cur.T);
    labelPoints(ch, ctx, st.pts.map((q) => [q.s, q.T] as [number, number]), ['1', '2', '3', '4']);
  }

  // ---------------------------------------------------------------- contas
  function drawCalc(ctx: CanvasRenderingContext2D, st: CycleState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 316, 290, 636, 262, 10);
    ctx.fill();
    const name = ['Otto', 'Diesel', 'Brayton'][st.cyc];
    text(ctx, `Ciclo ${name} padrão a ar · por kg de ar · k = 1,4`, 332, 313, { size: 13, bold: true });
    const cols: [string, number, number][] = [
      ['P (kPa)', 530, 0],
      ['v (m³/kg)', 600, 3],
      ['T (K)', 648, 0],
      ['T (°C)', 698, 0],
    ];
    for (const [hd, x] of cols) text(ctx, hd, x, 334, { size: 10, color: C.dim, align: 'right' });
    const desc =
      st.cyc === CYC.brayton
        ? ['entrada do compressor', 'saída do compressor', 'entrada da turbina', 'saída da turbina']
        : ['PMI, fim da admissão', 'PMS, fim da compressão', 'fim da combustão', 'PMI, fim da expansão'];
    st.pts.forEach((q, i) => {
      const y = 350 + i * 14;
      text(ctx, String(i + 1), 332, y, { size: 11, bold: true });
      text(ctx, desc[i], 346, y, { size: 10, color: C.dim });
      [q.P, q.v, q.T, q.T - AIR.K0].forEach((val, j) => text(ctx, fmt(val, cols[j][2]), cols[j][1], y, { size: 11, bold: true, align: 'right' }));
    });
    const T = st.pts.map((q) => q.T);
    let items: [string, string][];
    if (st.cyc === CYC.otto) {
      items = [
        ['Compressão isentrópica: T₂ = T₁·r^(k−1)', `= 300 × ${fmt(st.r, 1)}^0,4 = ${f0(T[1])} K`],
        ['Calor fornecido (v cte): q_in = cv·(T₃ − T₂)', `= 0,7175 × (${f0(T[2])} − ${f0(T[1])}) = ${f0(st.qin)} kJ/kg`],
        ['Calor rejeitado (v cte): q_out = cv·(T₄ − T₁)', `= 0,7175 × (${f0(T[3])} − 300) = ${f0(st.qout)} kJ/kg`],
        ['Rendimento: η = 1 − q_out/q_in = 1 − 1/r^(k−1)', `= 1 − 1/${fmt(st.r, 1)}^0,4 = ${fmt(st.eta * 100, 1)} %`],
      ];
    } else if (st.cyc === CYC.diesel) {
      const ottoEta = 1 - 1 / Math.pow(st.r, K - 1);
      items = [
        ['Compressão isentrópica: T₂ = T₁·r^(k−1)', `= 300 × ${fmt(st.r, 1)}^0,4 = ${f0(T[1])} K`],
        ['Calor a P cte: q_in = cp·(T₃ − T₂) · corte r_c = T₃/T₂', `= 1,0045 × (${f0(T[2])} − ${f0(T[1])}) = ${f0(st.qin)} kJ/kg · r_c = ${fmt(st.rc, 2)}`],
        ['Calor rejeitado (v cte): q_out = cv·(T₄ − T₁)', `= 0,7175 × (${f0(T[3])} − 300) = ${f0(st.qout)} kJ/kg`],
        ['η = 1 − (1/r^(k−1))·(r_c^k − 1)/[k·(r_c − 1)]', `= ${fmt(st.eta * 100, 1)} %  (Otto com o mesmo r: ${fmt(ottoEta * 100, 1)} %)`],
      ];
    } else {
      const u = st.regen.useful;
      items = [
        ['Compressor: T₂ = T₁·rp^((k−1)/k) · w_c = cp·(T₂ − T₁)', `T₂ = ${f0(T[1])} K · w_c = ${f0(st.wc)} kJ/kg`],
        ['Turbina: T₄ = T₃/rp^((k−1)/k) · w_t = cp·(T₃ − T₄)', `T₄ = ${f0(T[3])} K · w_t = ${f0(st.wt)} kJ/kg`],
        u
          ? ['Calor fornecido: q_in = cp·(T₃ − Tx), com Tx = T₄', `= 1,0045 × (${f0(T[2])} − ${f0(st.regen.Tx)}) = ${f0(st.qin)} kJ/kg`]
          : ['Calor fornecido (P cte): q_in = cp·(T₃ − T₂)', `= 1,0045 × (${f0(T[2])} − ${f0(T[1])}) = ${f0(st.qin)} kJ/kg`],
        u
          ? ['Rendimento: η = (w_t − w_c)/q_in', `= (${f0(st.wt)} − ${f0(st.wc)})/${f0(st.qin)} = ${fmt(st.eta * 100, 1)} %`]
          : ['Rendimento: η = 1 − 1/rp^((k−1)/k)', `= 1 − 1/${f0(st.rp)}^0,286 = ${fmt(st.eta * 100, 1)} %`],
      ];
    }
    items.forEach(([k, val], i) => {
      const y = 416 + i * 30;
      text(ctx, k, 332, y, { size: 11, color: C.dim });
      text(ctx, val, 342, y + 14, { size: 12, bold: true });
    });
    text(ctx, 'cv = 0,7175 · cp = 1,0045 · R = 0,287 kJ/kg·K', 332, 544, { size: 10, color: C.dim });

    // calor fornecido → trabalho + calor rejeitado; rendimento × Carnot
    const bx = 716;
    const bw = 226;
    text(ctx, 'Calor fornecido', bx, 332, { size: 10, color: C.dim });
    text(ctx, `${f0(st.qin)} kJ/kg`, bx + bw, 332, { size: 10, bold: true, align: 'right', color: C.curve2 });
    ctx.fillStyle = C.curve2;
    ctx.fillRect(bx, 338, bw, 16);
    const fw = bw * clamp(st.wnet / st.qin, 0, 1);
    text(ctx, `w_líq ${f0(st.wnet)}`, bx, 372, { size: 10, color: C.good, bold: true });
    text(ctx, `q_out ${f0(st.qout)}`, bx + bw, 372, { size: 10, color: C.cold, bold: true, align: 'right' });
    ctx.fillStyle = C.good;
    ctx.fillRect(bx, 378, fw, 16);
    ctx.fillStyle = C.cold;
    ctx.fillRect(bx + fw, 378, bw - fw, 16);
    text(ctx, 'Rendimento (0 a 100 %)', bx, 424, { size: 10, color: C.dim });
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(bx, 430, bw, 18);
    ctx.fillRect(bx, 454, bw, 18);
    ctx.fillStyle = C.good;
    ctx.fillRect(bx, 430, bw * clamp(st.eta, 0, 1), 18);
    ctx.fillStyle = 'rgba(226,235,245,0.22)';
    ctx.fillRect(bx, 454, bw * clamp(st.etaC, 0, 1), 18);
    ctx.strokeStyle = 'rgba(226,235,245,0.8)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, 454, bw * clamp(st.etaC, 0, 1), 18);
    ctx.setLineDash([]);
    text(ctx, `ciclo: ${fmt(st.eta * 100, 1)} %`, bx + 6, 444, { size: 11, bold: true, shadow: true });
    text(ctx, `Carnot: ${fmt(st.etaC * 100, 1)} %`, bx + 6, 468, { size: 11, bold: true, shadow: true });
    text(ctx, 'Carnot entre T₁ e T₃ é o teto: aqui o', bx, 494, { size: 10, color: C.dim });
    text(ctx, 'calor não entra todo na temperatura', bx, 508, { size: 10, color: C.dim });
    text(ctx, 'máxima nem sai todo na mínima.', bx, 522, { size: 10, color: C.dim });
  }

  return {
    reset() {
      clock = 0;
      paused = false;
      stepNext = false;
      lastCyc = null;
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
        title: 'Avança para o começo da próxima etapa do ciclo e pausa.',
        run() {
          stepNext = true;
        },
      },
    ],
    draw(ctx, v, _o, dt, time) {
      const st = cycleState(v);
      if (lastCyc !== null && st.cyc !== lastCyc) clock = 0;
      lastCyc = st.cyc;
      const engine = st.cyc !== CYC.brayton;
      const vAt = volumeAt(engine ? st.r : 10);
      const phases = engine ? enginePhases(st, vAt) : braytonPhases(st);
      const period = phases.reduce((a, q) => a + q.dur, 0);
      clock %= period;
      if (stepNext) {
        const { i } = locate(phases, clock);
        let acc = 0;
        for (let j = 0; j <= i; j++) acc += phases[j].dur;
        clock = (acc % period) + 1e-4;
        paused = true;
        stepNext = false;
      }
      if (!paused) {
        clock = (clock + dt) % period;
        for (const pt of parts) pt.s = (pt.s + dt) % period;
      }
      const { i, p } = locate(phases, clock);
      const ph = phases[i];
      const th = ph.th0 + (ph.th1 - ph.th0) * p;
      const cur = engine ? engineState(ph, p, th, vAt) : ph.leg ? legPoint(ph.from, ph.to, ph.leg, p) : ph.from;
      updateScales(st, dt);
      if (engine) drawEngine(ctx, st, ph, p, th, cur, paused ? 0 : dt, time);
      else drawTurbine(ctx, st, phases, period, dt, time);
      drawPv(ctx, st, cur);
      drawTs(ctx, st, cur);
      drawCalc(ctx, st);
      if (paused) tag(ctx, '⏸ pausado', 296, 26, C.amber, 'right', 10);
    },
    status(v, o) {
      const st = cycleState(v);
      const T2c = st.pts[1].T - AIR.K0;
      const T4c = st.pts[3].T - AIR.K0;
      if (st.invalid === 1) {
        return {
          tone: 'bad',
          text: `T₃ abaixo de T₂ (${f0(T2c)} °C): o ar já sai da compressão mais quente que isso — não dá para fornecer calor. Suba T₃ ou baixe ${st.cyc === CYC.brayton ? 'rp' : 'r'}.`,
        };
      }
      if (st.invalid === 2) return { tone: 'bad', text: 'T₃ alto demais para esse r: a combustão a pressão constante passaria do PMI. O modelo limitou T₃.' };
      if (st.cyc === CYC.otto) {
        if (st.r > 12) return { tone: 'warn', text: `r = ${fmt(st.r, 1)} num Otto: na prática a mistura detonaria antes da centelha (batida de pino). Motores a gasolina usam r ≈ 8 a 12.` };
        return { tone: 'ok', text: `Otto: η = ${fmt(o.eta, 1)} % depende só de r. Subir T₃ aumenta o trabalho por ciclo, não o rendimento.` };
      }
      if (st.cyc === CYC.diesel) {
        if (st.r < 12) return { tone: 'warn', text: `Diesel com r = ${fmt(st.r, 1)}: o ar chega a só ${f0(T2c)} °C no fim da compressão — pouco para a ignição. Motores diesel usam r de 14 a 22.` };
        return { tone: 'ok', text: `Diesel: r_c = ${fmt(st.rc, 2)}. Com o mesmo r, quanto maior a razão de corte, menor o rendimento.` };
      }
      if (st.regen.on && !st.regen.useful) {
        return { tone: 'warn', text: `Regenerador inútil: o ar sai do compressor a ${f0(T2c)} °C, mais quente que o escape (${f0(T4c)} °C). Baixe rp ou suba T₃.` };
      }
      if (st.regen.useful) {
        const simple = 1 - 1 / Math.pow(st.rp, (K - 1) / K);
        return { tone: 'ok', text: `Regenerador: o escape a ${f0(T4c)} °C pré-aquece o ar comprimido — η sobe de ${fmt(simple * 100, 1)} % para ${fmt(o.eta, 1)} % sem mudar o trabalho.` };
      }
      return { tone: st.bwr > 0.6 ? 'warn' : 'ok', text: `Brayton: η = ${fmt(o.eta, 1)} % depende só de rp. O compressor consome ${f0(o.bwr)} % do trabalho da turbina.` };
    },
  };
}
