/** Desenho da bancada do cilindro com pistão: moléculas, vizinhança de cada processo, diagramas P–V e T–S e a 1ª lei. */
import { drivenByHeat, GAS, MASS, pathPoint, pistonState, PROC, PROC_NAMES, type GasPoint, type PistonState } from '../../learning/labs/piston';
import type { LabValues } from '../../learning/types';
import { approach, arrow, C, Chart, fmt, niceAxis, roundRect, seeded, tag, tempColor, text, ticksOf } from './draw';
import type { LabView } from './views';

const TAU = Math.PI * 2;
const XL = 86; // parede interna esquerda do cilindro
const XR = 226; // parede interna direita
const CX = (XL + XR) / 2;
const WALL = 9;
const YB = 452; // fundo interno
const PX = 100; // px de altura por m³ (a área é constante: altura ∝ volume)
const PH = 20; // espessura do pistão
const Y_TOP = 124; // topo das paredes
const T_LO = 150;
const T_HI = 1100;
const PLAY_S = 2.6;
const N_MOL = 42;
const REF = { P: C.curve1, V: C.violet, T: C.curve3, S: C.curve4 } as const;

const SUBTITLE = [
  'Carga fixa no pistão: P = 100 kPa',
  'Pistão travado: V = 1 m³',
  'Banho a 27 °C: T constante',
  'Paredes isoladas: Q = 0',
  'Aletas: troca parte do calor (P·Vⁿ = cte)',
];

const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
/** Número entre parênteses quando negativo (para as contas "= a + (−b)"). */
const sgn = (x: number, d = 1) => (x < -1e-9 ? `(${fmt(x, d)})` : fmt(x, d));

/** O processo parado na fração u do caminho (animação "repetir o processo"). */
function partial(v: LabValues, u: number): LabValues {
  if (u >= 1) return v;
  const t1 = GAS.T1 - GAS.K0;
  if (drivenByHeat(v)) return { ...v, t2: t1 + (v.t2 - t1) * u };
  return { ...v, v2: GAS.V1 + (v.v2 - GAS.V1) * u };
}

interface Mol {
  x: number; // px
  y: number; // 0 (fundo) a 1 (pistão)
  vx: number;
  vy: number;
}

/** Linha de legenda das curvas de referência (tracejadas, todas pelo estado 1). */
function refLegend(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const items: [string, string][] = [
    ['P cte', REF.P],
    ['V cte', REF.V],
    ['T cte', REF.T],
    ['S cte', REF.S],
  ];
  items.forEach(([label, color], i) => {
    const xx = x + i * 50;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(xx, y - 4);
    ctx.lineTo(xx + 14, y - 4);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, label, xx + 17, y, { size: 10, color: C.dim });
  });
}

function flame(ctx: CanvasRenderingContext2D, x: number, yBase: number, h: number, w: number, time: number, seed: number): void {
  const flick = 0.78 + 0.22 * Math.sin(time * 13 + seed * 2.1) * Math.sin(time * 8.3 + seed);
  const hh = h * flick;
  const g = ctx.createLinearGradient(0, yBase, 0, yBase - hh);
  g.addColorStop(0, 'rgba(90,150,255,0.95)');
  g.addColorStop(0.3, 'rgba(255,196,70,0.95)');
  g.addColorStop(1, 'rgba(239,91,67,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, yBase);
  ctx.quadraticCurveTo(x - w / 2, yBase - hh * 0.55, x, yBase - hh);
  ctx.quadraticCurveTo(x + w / 2, yBase - hh * 0.55, x + w / 2, yBase);
  ctx.closePath();
  ctx.fill();
}

export function pistonView(): LabView {
  const rnd = seeded(11);
  const mols: Mol[] = Array.from({ length: N_MOL }, () => {
    const a = rnd() * TAU;
    return { x: XL + 6 + rnd() * (XR - XL - 12), y: rnd(), vx: Math.cos(a), vy: Math.sin(a) };
  });
  let play: number | null = null;
  let lastProc: number | null = null;
  let dragging = false;
  // escalas dos gráficos (deslizam até o valor "redondo" novo)
  const sc = { init: false, p: 200, pStep: 50, t: 600, tStep: 100, s0: -0.5, s1: 0.5, sStep: 0.5, e: 100 };

  function updateScales(v: LabValues, full: PistonState, dt: number): void {
    let maxP: number = GAS.P1;
    let maxT: number = GAS.T1;
    let minS = 0;
    let maxS = 0;
    for (let i = 0; i <= 24; i++) {
      const q = pathPoint(v, i / 24);
      maxP = Math.max(maxP, q.P);
      maxT = Math.max(maxT, q.T);
      minS = Math.min(minS, q.S);
      maxS = Math.max(maxS, q.S);
    }
    const pAx = niceAxis(maxP * 1.1, [50, 100, 200, 250, 500, 1000]);
    const tAx = niceAxis(Math.max(maxT * 1.1, 450), [100, 200, 250, 500]);
    const sStep = maxS - minS > 1.6 ? 1 : 0.5;
    const s0 = Math.min(-sStep, Math.floor((minS - 0.12) / sStep) * sStep);
    const s1 = Math.max(sStep, Math.ceil((maxS + 0.12) / sStep) * sStep);
    const eTop = niceAxis(Math.max(Math.abs(full.Q), Math.abs(full.W), Math.abs(full.dU), 20), [20, 50, 100, 200, 250, 500]).top;
    if (!sc.init) {
      Object.assign(sc, { init: true, p: pAx.top, t: tAx.top, s0, s1, e: eTop });
    } else {
      sc.p = approach(sc.p, pAx.top, dt);
      sc.t = approach(sc.t, tAx.top, dt);
      sc.s0 = approach(sc.s0, s0, dt);
      sc.s1 = approach(sc.s1, s1, dt);
      sc.e = approach(sc.e, eTop, dt);
    }
    sc.pStep = pAx.step;
    sc.tStep = tAx.step;
    sc.sStep = sStep;
  }

  // ------------------------------------------------------------------ cilindro
  function drawCylinder(ctx: CanvasRenderingContext2D, v: LabValues, st: PistonState, full: PistonState, dt: number, time: number): void {
    const proc = Math.round(v.proc);
    const heat = drivenByHeat(v);
    const gasH = st.V * PX;
    const yPb = YB - gasH; // face de baixo do pistão
    const yPt = yPb - PH; // topo do pistão

    ctx.fillStyle = C.bg2;
    roundRect(ctx, 8, 8, 300, 544, 10);
    ctx.fill();
    text(ctx, 'Cilindro com ar (sistema fechado)', 22, 30, { size: 13, bold: true });
    text(ctx, SUBTITLE[proc], 22, 48, { size: 11, color: C.dim });

    // banho (atrás do cilindro)
    if (proc === PROC.isothermal) {
      const x0 = XL - WALL - 30;
      const x1 = XR + WALL + 30;
      const g = ctx.createLinearGradient(0, 150, 0, YB + WALL + 18);
      g.addColorStop(0, 'rgba(59,143,224,0.25)');
      g.addColorStop(1, 'rgba(37,99,168,0.55)');
      ctx.fillStyle = g;
      roundRect(ctx, x0, 150, x1 - x0, YB + WALL + 18 - 150, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(150,200,255,0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = x0 + 3; x <= x1 - 3; x += 4) {
        const y = 151 + Math.sin(x * 0.12 + time * 2.4) * 1.5;
        if (x === x0 + 3) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      tag(ctx, 'banho a 27 °C (grande: não esquenta)', CX, YB + WALL + 38, C.cold, 'center', 10);
    }

    // gás
    ctx.fillStyle = tempColor(st.T, T_LO, T_HI, 0.22);
    ctx.fillRect(XL, yPb, XR - XL, gasH);
    // régua de volume
    for (let k = 1; k <= 6; k++) {
      const y = YB - k * 0.5 * PX;
      ctx.strokeStyle = 'rgba(226,235,245,0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(XL, y);
      ctx.lineTo(XL + (k % 2 ? 4 : 8), y);
      ctx.stroke();
      if (k % 2 === 0) text(ctx, `${k / 2} m³`, XL + 11, y + 4, { size: 9, color: 'rgba(226,235,245,0.5)' });
    }
    // posição do pistão no estado 1
    if (Math.abs(st.V - GAS.V1) > 0.04) {
      const y = YB - GAS.V1 * PX;
      ctx.strokeStyle = 'rgba(226,235,245,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(XL, y);
      ctx.lineTo(XR, y);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'estado 1', XR - 4, y - 4, { size: 9, color: C.dim, align: 'right' });
    }
    // moléculas: velocidade ∝ √T
    const speed = 75 * Math.sqrt(st.T / GAS.T1);
    const r = 3.4;
    const span = Math.max(1, gasH - 2 * r);
    const col = tempColor(st.T, T_LO, T_HI);
    for (const m of mols) {
      m.x += m.vx * speed * dt;
      m.y += (m.vy * speed * dt) / span;
      if (m.x < XL + r) {
        m.x = XL + r;
        m.vx = Math.abs(m.vx);
      } else if (m.x > XR - r) {
        m.x = XR - r;
        m.vx = -Math.abs(m.vx);
      }
      if (m.y < 0) {
        m.y = Math.min(1, -m.y);
        m.vy = Math.abs(m.vy);
      } else if (m.y > 1) {
        m.y = Math.max(0, 2 - m.y);
        m.vy = -Math.abs(m.vy);
      }
      const py = YB - r - m.y * span;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(m.x, py, r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.arc(m.x - 1, py - 1, 1.1, 0, TAU);
      ctx.fill();
    }

    // paredes e fundo
    const wall = (x: number, y: number, w: number, h: number) => {
      const g = ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, C.metalDark);
      g.addColorStop(0.5, C.metalLight);
      g.addColorStop(1, C.metal);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    };
    wall(XL - WALL, Y_TOP, WALL, YB + WALL - Y_TOP);
    wall(XR, Y_TOP, WALL, YB + WALL - Y_TOP);
    ctx.fillStyle = C.metal;
    ctx.fillRect(XL - WALL, YB, XR - XL + 2 * WALL, WALL);

    // isolamento (adiabático) e aletas (politrópico)
    if (proc === PROC.adiabatic) {
      const bands: [number, number, number, number][] = [
        [XL - WALL - 16, Y_TOP + 8, 16, YB + WALL - Y_TOP - 8],
        [XR + WALL, Y_TOP + 8, 16, YB + WALL - Y_TOP - 8],
        [XL - WALL - 16, YB + WALL, XR - XL + 2 * WALL + 32, 14],
      ];
      for (const [x, y, w, h] of bands) {
        ctx.fillStyle = '#d6b06c';
        ctx.fillRect(x, y, w, h);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.strokeStyle = 'rgba(110,72,28,0.55)';
        ctx.lineWidth = 1.5;
        // hachura diagonal, em faixas de 40 px de altura
        for (let yy = y; yy < y + h; yy += 40) {
          for (let k = -40; k < w + 40; k += 7) {
            ctx.beginPath();
            ctx.moveTo(x + k, yy);
            ctx.lineTo(x + k - 40, yy + 40);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
      tag(ctx, 'isolamento térmico: Q = 0', CX, YB + WALL + 40, C.amber, 'center', 10);
    } else if (proc === PROC.polytropic) {
      ctx.fillStyle = C.metalDark;
      for (let y = Y_TOP + 14; y < YB; y += 16) {
        ctx.fillRect(XL - WALL - 14, y, 14, 5);
        ctx.fillRect(XR + WALL, y, 14, 5);
      }
      tag(ctx, 'aletas: troca parte do calor', CX, YB + WALL + 40, C.dim, 'center', 10);
    }

    // pistão
    const pg = ctx.createLinearGradient(0, yPt, 0, yPb);
    pg.addColorStop(0, C.metalLight);
    pg.addColorStop(1, C.metalDark);
    ctx.fillStyle = pg;
    ctx.fillRect(XL + 1, yPt, XR - XL - 2, PH);
    ctx.strokeStyle = 'rgba(20,30,40,0.6)';
    ctx.lineWidth = 1.5;
    for (const dy of [5, 10]) {
      ctx.beginPath();
      ctx.moveTo(XL + 1, yPt + dy);
      ctx.lineTo(XR - 1, yPt + dy);
      ctx.stroke();
    }
    if (proc === PROC.isobaric) {
      ctx.fillStyle = '#4a5562';
      roundRect(ctx, CX - 46, yPt - 18, 92, 18, 3);
      ctx.fill();
      ctx.fillStyle = '#5d6978';
      roundRect(ctx, CX - 34, yPt - 33, 68, 15, 3);
      ctx.fill();
      text(ctx, 'carga fixa', CX, yPt - 5, { size: 10, align: 'center', bold: true });
    } else if (proc === PROC.isochoric) {
      ctx.fillStyle = C.amber;
      for (const y of [yPt - 8, yPb + 1]) {
        ctx.fillRect(XL - WALL - 6, y, WALL + 14, 7);
        ctx.fillRect(XR - 8, y, WALL + 14, 7);
      }
      tag(ctx, 'travas', XR + WALL + 30, yPt - 14, C.amber, 'center', 10);
    } else {
      // haste e manopla: o pistão é movido de fora
      ctx.fillStyle = C.metal;
      ctx.fillRect(CX - 5, yPt - 46, 10, 46);
      ctx.fillStyle = dragging ? C.amber : C.metalLight;
      roundRect(ctx, CX - 30, yPt - 56, 60, 10, 4);
      ctx.fill();
      if (!dragging) text(ctx, '↕ arraste', CX, yPt - 62, { size: 10, color: C.dim, align: 'center' });
    }

    // fonte de calor (processos comandados pela temperatura)
    if (heat) {
      const burnerY = YB + WALL + 42;
      const dT = full.T - GAS.T1;
      if (dT > 1) {
        ctx.fillStyle = '#3a4350';
        roundRect(ctx, XL - 6, burnerY, XR - XL + 12, 7, 3);
        ctx.fill();
        const inten = clamp(Math.abs(full.Q) / 500, 0.3, 1);
        for (let i = 0; i < 7; i++) flame(ctx, XL + 8 + (i * (XR - XL - 16)) / 6, burnerY, 32 * inten, 16, time, i);
      } else if (dT < -1) {
        for (let i = 0; i < 5; i++) {
          const x = XL + 2 + i * 28;
          ctx.fillStyle = 'rgba(190,230,255,0.85)';
          roundRect(ctx, x, YB + WALL + 3, 22, 18, 4);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillRect(x + 4, YB + WALL + 6, 6, 3);
        }
        text(ctx, 'gelo', CX, YB + WALL + 36, { size: 10, color: C.cold, align: 'center', bold: true });
      }
    }

    // setas de calor
    const qAbs = Math.abs(full.Q);
    if (qAbs > 0.5) {
      const f = clamp(qAbs / 500, 0, 1);
      const len = 12 + 20 * f;
      const w = 2 + 2.5 * f;
      const qc = full.Q > 0 ? '#ffb15c' : '#7cc4ff';
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(time * 5);
      if (heat) {
        for (const x of [XL + 26, CX, XR - 26]) {
          if (full.Q > 0) arrow(ctx, x, YB + 2, x, YB - len, qc, w, 8);
          else arrow(ctx, x, YB - len, x, YB + 4, qc, w, 8);
        }
      } else {
        const ys = gasH > 50 ? [YB - gasH * 0.3, YB - gasH * 0.7] : [YB - gasH / 2];
        for (const y of ys) {
          if (full.Q > 0) {
            arrow(ctx, XL - WALL - 24, y, XL - WALL - 24 + len + WALL, y, qc, w, 8);
            arrow(ctx, XR + WALL + 24, y, XR + WALL + 24 - len - WALL, y, qc, w, 8);
          } else {
            arrow(ctx, XL + 4, y, XL + 4 - len - WALL, y, qc, w, 8);
            arrow(ctx, XR - 4, y, XR - 4 + len + WALL, y, qc, w, 8);
          }
        }
      }
      ctx.globalAlpha = 1;
    }
    // seta de trabalho
    if (Math.abs(full.W) > 0.5) {
      const up = full.W > 0;
      const yc = yPt + PH / 2;
      const wc = up ? C.good : C.bad;
      arrow(ctx, 282, up ? yc + 18 : yc - 22, 282, up ? yc - 22 : yc + 18, wc, 3, 9);
      text(ctx, 'W', 292, yc + 5, { size: 12, bold: true, color: wc });
    }

    // leituras
    const qCol = st.Q > 0.05 ? C.curve2 : st.Q < -0.05 ? C.cold : C.dim;
    tag(ctx, `Q = ${fmt(st.Q, 1)} kJ`, 82, 524, qCol, 'center', 11);
    tag(ctx, `W = ${fmt(st.W, 1)} kJ`, 230, 524, st.W > 0.05 ? C.good : st.W < -0.05 ? C.bad : C.dim, 'center', 11);
    text(ctx, `P = ${fmt(st.P, 0)} kPa · V = ${fmt(st.V, 2)} m³ · T = ${fmt(st.T - GAS.K0, 0)} °C`, CX + 2, 546, {
      size: 11,
      color: C.text,
      align: 'center',
      bold: true,
    });
  }

  // ------------------------------------------------------------------ diagramas
  function pathMarks(ch: Chart, ctx: CanvasRenderingContext2D, done: GasPoint[], key: (p: GasPoint) => [number, number]): void {
    const a = done[Math.floor(done.length * 0.42)];
    const b = done[Math.floor(done.length * 0.58)];
    const [ax, ay] = key(a);
    const [bx, by] = key(b);
    const x1 = ch.X(ax);
    const y1 = ch.Y(ay);
    const x2 = ch.X(bx);
    const y2 = ch.Y(by);
    if (Math.hypot(x2 - x1, y2 - y1) > 6 && y1 > ch.b.y && y2 > ch.b.y) arrow(ctx, x1, y1, x2, y2, C.amber, 3, 10);
    const [x0, y0] = key(done[0]);
    const [xe, ye] = key(done[done.length - 1]);
    ch.dot(x0, y0, C.text, 5);
    ch.dot(xe, ye, C.amber, 6);
    const lab = (x: number, y: number, s: string) => {
      const px = Math.min(ch.b.x + ch.b.w - 6, ch.X(x) + 8);
      const py = Math.max(ch.b.y + 12, Math.min(ch.b.y + ch.b.h - 4, ch.Y(y) - 8));
      text(ctx, s, px, py, { size: 12, bold: true, shadow: true });
    };
    lab(x0, y0, '1');
    if (Math.hypot(ch.X(xe) - ch.X(x0), ch.Y(ye) - ch.Y(y0)) > 10) lab(xe, ye, '2');
  }

  function drawPV(ctx: CanvasRenderingContext2D, v: LabValues, u: number, st: PistonState): void {
    const ch = new Chart(ctx, { x: 362, y: 42, w: 244, h: 194, x0: 0, x1: 3.2, y0: 0, y1: sc.p });
    ch.frame('Diagrama P–V', 'V (m³)', 'P (kPa)', [0, 1, 2, 3], ticksOf(0, sc.p, sc.pStep));
    const N = 48;
    const fullPts = Array.from({ length: N + 1 }, (_, i) => pathPoint(v, i / N));
    const done = Array.from({ length: N + 1 }, (_, i) => pathPoint(v, (u * i) / N));
    if (Math.abs(st.W) > 0.05) ch.area(done.map((p) => [p.V, p.P]), st.W > 0 ? 'rgba(95,211,138,0.28)' : 'rgba(255,107,94,0.26)');
    // referências pelo estado 1
    ch.fn(() => GAS.P1, REF.P, 1.5, [5, 4]);
    ch.poly([[GAS.V1, 0], [GAS.V1, sc.p]], REF.V, 1.5, [5, 4]);
    ch.fn((V) => GAS.P1 / V, REF.T, 1.5, [5, 4], 0.05, 3.2);
    ch.fn((V) => GAS.P1 * Math.pow(V, -GAS.k), REF.S, 1.5, [5, 4], 0.05, 3.2);
    ch.poly(fullPts.map((p) => [p.V, p.P]), 'rgba(255,201,77,0.45)', 2, [3, 4]);
    ch.poly(done.map((p) => [p.V, p.P]), C.amber, 3.5);
    // rótulo da área
    const mid = done[Math.floor(N / 2)];
    if (Math.abs(ch.X(st.V) - ch.X(GAS.V1)) > 26 && ch.Y(0) - ch.Y(mid.P) > 30) {
      text(ctx, 'W', ch.X(mid.V), ch.Y(mid.P / 2) + 5, { size: 14, bold: true, align: 'center', color: st.W > 0 ? C.good : C.bad, shadow: true });
    }
    pathMarks(ch, ctx, done, (p) => [p.V, p.P]);
    refLegend(ctx, ch.b.x - 34, ch.b.y + ch.b.h + 30);
  }

  function drawTS(ctx: CanvasRenderingContext2D, v: LabValues, u: number, st: PistonState): void {
    const ch = new Chart(ctx, { x: 694, y: 42, w: 240, h: 194, x0: sc.s0, x1: sc.s1, y0: 0, y1: sc.t });
    ch.frame('Diagrama T–S', 'ΔS (kJ/K)', 'T (K)', ticksOf(sc.s0, sc.s1, sc.sStep), ticksOf(0, sc.t, sc.tStep), 0, sc.sStep < 1 ? 1 : 0);
    const N = 48;
    const fullPts = Array.from({ length: N + 1 }, (_, i) => pathPoint(v, i / N));
    const done = Array.from({ length: N + 1 }, (_, i) => pathPoint(v, (u * i) / N));
    if (Math.abs(st.S) > 1e-4) ch.area(done.map((p) => [p.S, p.T]), st.Q > 0 ? 'rgba(255,174,66,0.28)' : 'rgba(59,155,232,0.3)');
    ch.fn((S) => GAS.T1 * Math.exp(S / (MASS * GAS.cp)), REF.P, 1.5, [5, 4]);
    ch.fn((S) => GAS.T1 * Math.exp(S / (MASS * GAS.cv)), REF.V, 1.5, [5, 4]);
    ch.fn(() => GAS.T1, REF.T, 1.5, [5, 4]);
    ch.poly([[0, 0], [0, sc.t]], REF.S, 1.5, [5, 4]);
    ch.poly(fullPts.map((p) => [p.S, p.T]), 'rgba(255,201,77,0.45)', 2, [3, 4]);
    ch.poly(done.map((p) => [p.S, p.T]), C.amber, 3.5);
    const mid = done[Math.floor(N / 2)];
    if (Math.abs(ch.X(st.S) - ch.X(0)) > 26) {
      text(ctx, 'Q', ch.X(mid.S), ch.Y(mid.T / 2) + 5, { size: 14, bold: true, align: 'center', color: st.Q > 0 ? C.curve2 : C.cold, shadow: true });
    }
    pathMarks(ch, ctx, done, (p) => [p.S, p.T]);
    text(ctx, 'área até 0 K = Q', ch.b.x + 6, ch.b.y + ch.b.h - 6, { size: 10, color: C.dim });
    refLegend(ctx, ch.b.x - 34, ch.b.y + ch.b.h + 30);
  }

  // ------------------------------------------------------------------ 1ª lei
  function drawLaw(ctx: CanvasRenderingContext2D, v: LabValues, st: PistonState): void {
    const proc = Math.round(v.proc);
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 316, 290, 636, 262, 10);
    ctx.fill();
    text(ctx, `1ª lei: Q = ΔU + W  ·  ${PROC_NAMES[proc]}${proc === PROC.polytropic ? ` (n = ${fmt(v.n, 2)})` : ''}`, 332, 313, { size: 13, bold: true });
    // estados
    const cols: [string, number, number][] = [
      ['P (kPa)', 474, 1],
      ['V (m³)', 544, 2],
      ['T (K)', 610, 0],
      ['T (°C)', 676, 0],
    ];
    for (const [hd, x] of cols) text(ctx, hd, x, 336, { size: 10, color: C.dim, align: 'right' });
    const rows: [string, number[]][] = [
      ['Estado 1', [GAS.P1, GAS.V1, GAS.T1, GAS.T1 - GAS.K0]],
      ['Estado 2', [st.P, st.V, st.T, st.T - GAS.K0]],
    ];
    rows.forEach(([name, vals], i) => {
      const y = 353 + i * 17;
      text(ctx, name, 332, y, { size: 11, color: C.dim });
      vals.forEach((val, j) => text(ctx, fmt(val, cols[j][2]), cols[j][1], y, { size: 12, bold: true, align: 'right' }));
    });
    // contas
    const isoT = proc === PROC.isothermal || (proc === PROC.polytropic && Math.abs(v.n - 1) < 1e-6);
    let wk: string;
    let wv: string;
    if (proc === PROC.isobaric) {
      wk = 'Trabalho a P constante: W = P·(V₂ − V₁)';
      wv = `= ${fmt(GAS.P1, 0)} × (${fmt(st.V, 2)} − 1) = ${fmt(st.W, 1)} kJ`;
    } else if (proc === PROC.isochoric) {
      wk = 'Trabalho a V constante: o pistão não anda';
      wv = '= 0 kJ';
    } else if (isoT) {
      wk = 'Trabalho isotérmico: W = P₁V₁·ln(V₂/V₁)';
      wv = `= 100 × 1 × ln(${fmt(st.V, 2)}) = ${fmt(st.W, 1)} kJ`;
    } else {
      wk = `Trabalho ${proc === PROC.adiabatic ? 'adiabático' : 'politrópico'}: W = (P₂V₂ − P₁V₁)/(1 − ${proc === PROC.adiabatic ? 'k' : 'n'})`;
      wv = `= (${fmt(st.P, 1)} × ${fmt(st.V, 2)} − 100)/(1 − ${fmt(st.n, 2)}) = ${fmt(st.W, 1)} kJ`;
    }
    const items: [string, string][] = [
      [wk, wv],
      ['Energia interna (só depende de T): ΔU = m·cv·(T₂ − T₁)', `= ${fmt(MASS, 3)} × ${fmt(GAS.cv, 4)} × (${fmt(st.T, 1)} − 300) = ${fmt(st.dU, 1)} kJ`],
      ['1ª lei: Q = ΔU + W', `= ${sgn(st.dU)} + ${sgn(st.W)} = ${fmt(st.Q, 1)} kJ`],
      [
        'Entropia: ΔS = m·[cv·ln(T₂/T₁) + R·ln(V₂/V₁)]',
        `= ${fmt(st.S, 3)} kJ/K  ${Math.abs(st.S) < 5e-4 ? '(isentrópico)' : st.S > 0 ? '(recebeu calor)' : '(perdeu calor)'}`,
      ],
    ];
    items.forEach(([k, val], i) => {
      const y = 396 + i * 36;
      text(ctx, k, 332, y, { size: 11, color: C.dim });
      text(ctx, val, 342, y + 15, { size: 12, bold: true });
    });
    text(ctx, `m = P₁V₁/(R·T₁) = ${fmt(MASS, 3)} kg · cv = 0,718 · cp = 1,005 kJ/kg·K`, 332, 543, { size: 10, color: C.dim });

    // barras Q = ΔU + W
    const zero = 424;
    const hMax = 88;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(716, zero);
    ctx.lineTo(942, zero);
    ctx.stroke();
    const bars: [string, number, string, number][] = [
      ['Q', st.Q, C.curve2, 742],
      ['ΔU', st.dU, C.hot, 830],
      ['W', st.W, C.good, 914],
    ];
    for (const [name, val, color, x] of bars) {
      const hh = (val / sc.e) * hMax;
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = color;
      ctx.fillRect(x - 19, Math.min(zero, zero - hh), 38, Math.abs(hh));
      ctx.globalAlpha = 1;
      text(ctx, fmt(val, 0), x, hh >= 0 ? zero - hh - 6 : zero - hh + 14, { size: 11, bold: true, align: 'center', color });
      text(ctx, name, x, 541, { size: 15, bold: true, align: 'center' });
    }
    text(ctx, '=', 786, 541, { size: 15, bold: true, align: 'center', color: C.dim });
    text(ctx, '+', 872, 541, { size: 15, bold: true, align: 'center', color: C.dim });
    text(ctx, 'kJ', 942, 318, { size: 10, color: C.dim, align: 'right' });
  }

  return {
    reset() {
      play = null;
      lastProc = null;
      sc.init = false;
      dragging = false;
    },
    actions: [
      {
        label: '▶ Repetir o processo',
        title: 'Volta ao estado 1 e refaz o caminho até o estado 2, devagar.',
        run() {
          play = 0;
        },
      },
    ],
    draw(ctx, v, _o, dt, time) {
      const proc = Math.round(v.proc);
      if (lastProc !== null && proc !== lastProc) play = 0;
      lastProc = proc;
      let u = 1;
      if (play !== null) {
        play += dt / PLAY_S;
        if (play >= 1) play = null;
        else u = ease(play);
      }
      const st = pistonState(partial(v, u));
      const full = pistonState(v);
      updateScales(v, full, dt);
      drawCylinder(ctx, v, st, full, dt, time);
      drawPV(ctx, v, u, st);
      drawTS(ctx, v, u, st);
      drawLaw(ctx, v, st);
      if (play !== null) tag(ctx, 'processo 1 → 2 em andamento…', 784, 300, C.amber, 'center', 10);
    },
    status(v, o) {
      const proc = Math.round(v.proc);
      const heat = drivenByHeat(v);
      if (heat && Math.abs(v.t2 - (GAS.T1 - GAS.K0)) < 2.5) return { tone: 'warn', text: 'T₂ = T₁: nada acontece. Aqueça (chama) ou resfrie (gelo) o cilindro.' };
      if (!heat && Math.abs(v.v2 - GAS.V1) < 0.025) return { tone: 'warn', text: 'V₂ = V₁: o pistão está parado. Puxe ou empurre (arraste a manopla no desenho).' };
      const comp = !heat && v.v2 < GAS.V1;
      switch (proc) {
        case PROC.isobaric:
          return { tone: 'ok', text: `P constante: só ${fmt(o.wq, 1)} % do calor vira trabalho (W/Q = R/cp); o resto muda a energia interna.` };
        case PROC.isochoric:
          return { tone: 'ok', text: 'V constante: W = 0, então Q = ΔU. A pressão acompanha a temperatura absoluta (P/T constante).' };
        case PROC.isothermal:
          return comp
            ? { tone: 'ok', text: 'T constante: ΔU = 0. Para comprimir sem esquentar, o ar devolve ao banho todo o trabalho recebido (Q = W < 0).' }
            : { tone: 'ok', text: 'T constante: ΔU = 0 e todo o calor recebido sai como trabalho (Q = W).' };
        case PROC.adiabatic:
          return comp
            ? { tone: 'ok', text: `Isolado (Q = 0): o trabalho recebido vira energia interna e o ar esquenta até ${fmt(o.T2, 0)} °C.` }
            : { tone: 'ok', text: `Isolado (Q = 0): o ar paga o trabalho com a própria energia interna e esfria até ${fmt(o.T2, 0)} °C.` };
        default: {
          const n = v.n;
          if (n < 0.025) return { tone: 'ok', text: 'n = 0 é o isobárico: a mesma reta horizontal no P–V.' };
          if (Math.abs(n - 1) < 0.025) return { tone: 'ok', text: 'n = 1 é o isotérmico: P·V constante e ΔU = 0.' };
          if (Math.abs(n - GAS.k) < 0.025) return { tone: 'ok', text: 'n = k = 1,4 é o adiabático reversível: Q = 0.' };
          if (comp) {
            if (n < 1) return { tone: 'ok', text: 'n < 1 comprimindo: o ar até esfria — rejeita mais calor do que o trabalho que recebe.' };
            if (n < GAS.k) return { tone: 'ok', text: '1 < n < k comprimindo: o ar esquenta, mas perde parte do trabalho como calor (Q < 0) — compressor resfriado.' };
            return { tone: 'ok', text: 'n > k comprimindo: o ar esquenta mais que no adiabático, porque ainda recebe calor (Q > 0).' };
          }
          if (n < 1) return { tone: 'ok', text: 'n < 1 expandindo: o ar esquenta enquanto expande — precisa receber muito calor.' };
          if (n < GAS.k) return { tone: 'ok', text: '1 < n < k expandindo: o ar esfria, mas recebe algum calor (Q > 0).' };
          return { tone: 'ok', text: 'n > k expandindo: o ar esfria mais que no adiabático, porque ainda perde calor (Q < 0).' };
        }
      }
    },
    pointer(kind, x, y, v) {
      if (drivenByHeat(v)) {
        dragging = false;
        return null;
      }
      const yMid = YB - v.v2 * PX - PH / 2;
      const near = x > XL - 34 && x < XR + 34 && y > yMid - 62 && y < yMid + 26;
      if (kind === 'down') dragging = near;
      if (kind === 'up') dragging = false;
      if (!dragging) return null;
      play = null;
      const V = clamp((YB - PH / 2 - y) / PX, 0.2, 3);
      return { v2: Math.round(V / 0.05) * 0.05 };
    },
    cursor(x, y, v) {
      if (drivenByHeat(v)) return 'default';
      const yMid = YB - v.v2 * PX - PH / 2;
      return x > XL - 34 && x < XR + 34 && y > yMid - 62 && y < yMid + 26 ? 'ns-resize' : 'default';
    },
  };
}
