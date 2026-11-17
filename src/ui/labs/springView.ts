/**
 * Desenho da bancada de molas e parafusos.
 * - Mola: a prensa de ensaio com a(s) mola(s) em hélice (espiras de trás mais escuras), a régua com o comprimento
 *   livre, o gráfico força × deflexão (a área é a energia) e a seção do fio com a tensão de torção (maior do lado de
 *   dentro, o fator de Wahl), com as contas.
 * - Macaco: o macaco de parafuso com a manivela girando e a carga subindo (ou descendo sozinha, se não for
 *   autotravante), a rosca "desenrolada" como plano inclinado (λ × ângulo de atrito), a curva rendimento × λ e as contas.
 */
import { BUCKLE, GAP, jackState, screwEta, springState, THREAD_HALF, type JackState, type SpringState } from '../../learning/labs/spring';
import type { LabValues } from '../../learning/types';
import { approach, arrow, C, Chart, fmt, marker, niceAxis, roundRect, tag, text, ticksOf } from './draw';
import type { LabView } from './views';

const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
const f2 = (x: number) => fmt(x, 2);
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

// ------------------------------------------------------------------ mola
const PRESS = { x: 16, y: 12, w: 420, h: 536 };
const COL_L = 56;
const COL_R = 384;
const CX = 220;
const Y_BASE = 492;
const Y_HEAD = 90;
const WIRE = { x: 448, y: 262, w: 496, h: 286 };

// ------------------------------------------------------------------ macaco
const JACK = { x: 16, y: 12, w: 364, h: 536 };
const INCL = { x: 392, y: 12, w: 552, h: 238 };
const NUM = { x: 662, y: 262, w: 282, h: 286 };
const JX = 200;
const BODY_TOP = 336;
const MM = 1.2;
const LIFT_MAX = 120;
const LIFT0 = 40;

const SPRING_COL = ['#d9534a', '#8fb3cf', '#c9894a'];

function panel(ctx: CanvasRenderingContext2D, r: { x: number; y: number; w: number; h: number }, title?: string): void {
  ctx.fillStyle = C.bg2;
  roundRect(ctx, r.x, r.y, r.w, r.h, 8);
  ctx.fill();
  if (title) text(ctx, title, r.x + 10, r.y + 18, { size: 13, bold: true });
}

/** Texto com índices: o trecho marcado sai menor e mais baixo. */
function rich(ctx: CanvasRenderingContext2D, parts: [string, boolean][], x: number, y: number, size: number, color: string, align: 'left' | 'center' | 'right' = 'left', bold = true): void {
  const font = (sub: boolean) => `${bold ? 700 : 600} ${sub ? Math.round(size * 0.72) : size}px "Nunito", system-ui, sans-serif`;
  let w = 0;
  for (const [s, sub] of parts) {
    ctx.font = font(sub);
    w += ctx.measureText(s).width;
  }
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  for (const [s, sub] of parts) {
    ctx.font = font(sub);
    ctx.fillText(s, cx, sub ? y + size * 0.25 : y);
    cx += ctx.measureText(s).width;
  }
}

const fsColor = (fs: number) => (fs < 1 ? C.bad : fs < 1.3 ? C.amber : C.good);

export function springView(): LabView {
  let scale = 1.6;
  let fMax = 2000;
  let dMax = 120;
  let dragPlate = false;
  // macaco: altura da carga (mm), ângulo da manivela, o que está acontecendo
  let lift = LIFT0;
  let crank = 0;
  let mode: 'idle' | 'up' | 'fall' | 'held' = 'idle';
  let modeT = 0;
  let fallV = 0;
  let lastLock = true;

  // ---------------------------------------------------------------- mola: hélice
  /** Desenha uma mola de comprimento atual Lc (mm) com a base em yb, centrada em cx. */
  function drawCoil(ctx: CanvasRenderingContext2D, s: SpringState, cx: number, yb: number, Lc: number, color: string): void {
    const { d, D, n } = s.geom;
    const nt = n + 2;
    const gapNow = Math.max(0, (Lc - (n + 2) * d) / n);
    const rise = (u: number) => {
      // pontas esquadrejadas e retificadas: meia espessura de fio por espira nas pontas, d + folga nas ativas
      if (u <= 1) return u * (d / 2);
      if (u <= n + 1) return d / 2 + (u - 1) * (d + gapNow);
      return d / 2 + n * (d + gapNow) + (u - n - 1) * (d / 2);
    };
    const R = (D / 2) * scale;
    const lw = Math.max(1.6, d * scale);
    const steps = Math.ceil(nt * 36);
    const pts: { x: number; y: number; front: boolean }[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = (i / steps) * nt;
      const th = u * TAU;
      pts.push({ x: cx + Math.sin(th) * R, y: yb - (d / 2 + rise(u)) * scale, front: Math.cos(th) >= 0 });
    }
    ctx.lineCap = 'round';
    for (const pass of [false, true]) {
      ctx.strokeStyle = pass ? color : shade(color, -0.45);
      ctx.lineWidth = lw;
      ctx.beginPath();
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].front !== pass) continue;
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    }
    // brilho nas espiras da frente
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = Math.max(0.8, lw * 0.3);
    ctx.beginPath();
    for (let i = 1; i < pts.length; i++) {
      if (!pts[i].front) continue;
      ctx.moveTo(pts[i - 1].x, pts[i - 1].y - lw * 0.22);
      ctx.lineTo(pts[i].x, pts[i].y - lw * 0.22);
    }
    ctx.stroke();
    ctx.lineCap = 'butt';
  }

  function shade(hex: string, k: number): string {
    const n = parseInt(hex.slice(1), 16);
    const f = (c: number) => Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k)));
    return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
  }

  function plate(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, h = 8): void {
    ctx.fillStyle = '#9aa6b3';
    ctx.fillRect(x0, y, x1 - x0, h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x0, y, x1 - x0, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x0, y + h - 2, x1 - x0, 2);
  }

  /** Centros das molas na prensa. */
  function centers(s: SpringState): number[] {
    if (s.arr !== 2) return [CX];
    const off = ((s.geom.D + s.geom.d) / 2) * scale + 14;
    return [CX - off, CX + off];
  }

  function fitScale(s: SpringState): number {
    const hAvail = Y_BASE - Y_HEAD - 70;
    const widthMM = s.arr === 2 ? 2 * (s.geom.D + s.geom.d) : s.geom.D + s.geom.d;
    const wAvail = s.arr === 2 ? COL_R - COL_L - 110 : 200;
    return Math.min(3, hAvail / s.height0, wAvail / widthMM);
  }

  function drawPress(ctx: CanvasRenderingContext2D, s: SpringState): void {
    panel(ctx, PRESS, 'Prensa de ensaio de molas');
    const col = SPRING_COL[s.mat] ?? SPRING_COL[0];
    // estrutura
    ctx.fillStyle = '#3a4654';
    ctx.fillRect(COL_L - 24, Y_BASE + 8, COL_R - COL_L + 48, 14);
    ctx.fillStyle = '#4c5866';
    ctx.fillRect(COL_L - 7, Y_HEAD - 10, 14, Y_BASE - Y_HEAD + 18);
    ctx.fillRect(COL_R - 7, Y_HEAD - 10, 14, Y_BASE - Y_HEAD + 18);
    ctx.fillStyle = '#3d6fb0';
    roundRect(ctx, COL_L - 18, Y_HEAD - 30, COL_R - COL_L + 36, 26, 5);
    ctx.fill();
    plate(ctx, CX - 120, CX + 120, Y_BASE, 8);
    // molas
    const heightNow = s.height0 - s.defl;
    const yTop = Y_BASE - heightNow * scale;
    const Lc = s.geom.L0 - s.de;
    const color = s.solid ? '#ff7a5e' : col;
    for (const cx of centers(s)) {
      if (s.arr === 1) {
        drawCoil(ctx, s, cx, Y_BASE, Lc, color);
        const yMid = Y_BASE - Lc * scale;
        drawCoil(ctx, s, cx, yMid, Lc, color);
        plate(ctx, cx - (s.geom.D / 2 + s.geom.d) * scale - 6, cx + (s.geom.D / 2 + s.geom.d) * scale + 6, yMid - 3, 6);
      } else drawCoil(ctx, s, cx, Y_BASE, Lc, color);
    }
    // prato de cima, fuso e força
    plate(ctx, CX - 120, CX + 120, yTop - 10, 10);
    ctx.fillStyle = '#b8c0c8';
    ctx.fillRect(CX - 7, Y_HEAD - 4, 14, yTop - 10 - (Y_HEAD - 4));
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = Y_HEAD; y < yTop - 12; y += 5) ctx.fillRect(CX - 7, y, 14, 1.5);
    if (s.F > 0) {
      arrow(ctx, CX + 50, yTop - 62, CX + 50, yTop - 14, C.hot, 3, 10);
      tag(ctx, `F = ${f0(s.F)} N`, CX + 58, yTop - 42, C.hot, 'left', 12);
    }
    // régua na coluna da direita
    const step = scale > 1.2 ? 10 : scale > 0.55 ? 20 : 50;
    ctx.strokeStyle = 'rgba(226,235,245,0.55)';
    ctx.lineWidth = 1;
    for (let mm = 0; Y_BASE - mm * scale > Y_HEAD + 6; mm += step) {
      const y = Y_BASE - mm * scale;
      const big = mm % (step * 5) === 0;
      ctx.beginPath();
      ctx.moveTo(COL_R - 8 - (big ? 8 : 4), y);
      ctx.lineTo(COL_R - 8, y);
      ctx.stroke();
      if (big && mm > 0) text(ctx, f0(mm), COL_R - 20, y + 4, { size: 10, color: C.dim, align: 'right' });
    }
    // comprimento livre (tracejado) e atual
    const yFree = Y_BASE - s.height0 * scale;
    ctx.strokeStyle = C.amber;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(CX - 130, yFree);
    ctx.lineTo(COL_R - 10, yFree);
    ctx.stroke();
    ctx.setLineDash([]);
    rich(ctx, [['L', false], ['0', true], [` = ${f0(s.height0)} mm`, false]], COL_L + 14, yFree - 6, 11, C.amber, 'left');
    if (s.defl > 0.5) {
      const xA = COL_L + 24;
      arrow(ctx, xA, yFree, xA, yTop, C.curve1, 1.6, 7);
      text(ctx, `δ = ${f1(s.defl)} mm`, xA + 6, (yFree + yTop) / 2 + 4, { size: 11, color: C.curve1, bold: true });
    }
    // cotas da mola
    const cx0 = centers(s)[0];
    const R = (s.geom.D / 2) * scale;
    const yDim = Y_BASE + 34;
    ctx.strokeStyle = C.dim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx0 - R, Y_BASE + 24);
    ctx.lineTo(cx0 - R, yDim + 4);
    ctx.moveTo(cx0 + R, Y_BASE + 24);
    ctx.lineTo(cx0 + R, yDim + 4);
    ctx.stroke();
    arrow(ctx, cx0, yDim, cx0 - R, yDim, C.dim, 1, 5);
    arrow(ctx, cx0, yDim, cx0 + R, yDim, C.dim, 1, 5);
    text(ctx, `D = ${f0(s.geom.D)} mm`, cx0, yDim + 15, { size: 10.5, color: C.text, align: 'center', bold: true });
    text(ctx, `fio d = ${f1(s.geom.d)} mm · ${s.geom.n} espiras ativas + 2 de ponta`, PRESS.x + 12, PRESS.y + 36, { size: 10.5, color: C.dim });
    if (s.solid) tag(ctx, 'mola fechada!', CX, yTop + 24, C.bad, 'center', 12);
  }

  // ---------------------------------------------------------------- mola: gráfico F × δ
  function drawFd(ctx: CanvasRenderingContext2D, s: SpringState, dt: number): void {
    const solidTotal = s.arr === 1 ? 2 * s.geom.dSolid : s.geom.dSolid;
    const FsTotal = s.arr === 2 ? 2 * s.geom.Fs : s.geom.Fs;
    const wantD = Math.min(solidTotal * 1.08, (2000 / s.keq) * 1.05);
    const ax = niceAxis(Math.max(5, wantD), [5, 10, 20, 25, 50, 100, 200], 6);
    dMax = approach(dMax, ax.top, dt, 5);
    fMax = 2000;
    const ch = new Chart(ctx, { x: 520, y: 44, w: 396, h: 172, x0: 0, x1: dMax, y0: 0, y1: fMax });
    const xStep = dMax > 300 ? 100 : dMax > 150 ? 50 : dMax > 60 ? 20 : dMax > 30 ? 10 : 5;
    ch.frame('Força × deflexão', 'δ (mm)', 'F (N)', ticksOf(0, dMax, xStep), [0, 500, 1000, 1500, 2000]);
    // energia: área sob a reta até o ponto de trabalho
    const dNow = s.defl;
    const fLine = Math.min(s.F, FsTotal);
    if (dNow > 0) ch.area([[0, 0], [dNow, fLine]], 'rgba(255,201,77,0.22)');
    // uma mola sozinha, para comparar
    if (s.arr !== 0) {
      ch.poly([[0, 0], [s.geom.dSolid, s.geom.Fs], [s.geom.dSolid, fMax * 2]], C.dim, 1.6, [5, 4]);
    }
    ch.poly([[0, 0], [solidTotal, FsTotal], [solidTotal, fMax * 2]], C.curve1, 2.6);
    marker(ch, ctx, Math.min(dNow, dMax), Math.min(s.F, fMax));
    const kx = Math.min(dMax * 0.55, solidTotal * 0.5);
    const kLabel = `k${s.arr === 0 ? '' : ' equivalente'} = ${f2(s.keq)} N/mm`;
    tag(ctx, kLabel, ch.X(kx) + 10, Math.max(ch.b.y + 16, ch.Y(s.keq * kx) - 8), C.curve1, 'left', 11);
    if (s.arr !== 0) text(ctx, 'tracejado: uma mola só', ch.b.x + ch.b.w - 4, ch.b.y + ch.b.h - 8, { size: 10, color: C.dim, align: 'right' });
    if (solidTotal < dMax) text(ctx, 'fechada', ch.X(solidTotal) - 4, ch.b.y + 12, { size: 10, color: C.bad, align: 'right', bold: true });
    text(ctx, `energia U = F·δ/2 = ${f2(s.U)} J`, ch.b.x + 6, ch.b.y + 14, { size: 11, color: C.amber, bold: true });
  }

  // ---------------------------------------------------------------- mola: seção do fio e contas
  function drawWire(ctx: CanvasRenderingContext2D, s: SpringState): void {
    panel(ctx, WIRE, 'Seção do fio: torção');
    const cx = WIRE.x + 100;
    const cy = WIRE.y + 140;
    const R = 62;
    // torção (cresce com o raio, tangente ao círculo) + cisalhamento direto (uniforme, para baixo):
    // somam do lado de dentro da espira (à esquerda, perto do eixo da mola) e se subtraem do lado de fora
    const tauT = 1;
    const tauD = Math.max(0.05, (2 * s.geom.d) / s.geom.D);
    const cell = 4;
    const peak = tauT + tauD;
    for (let gy = -R; gy < R; gy += cell) {
      for (let gx = -R; gx < R; gx += cell) {
        const px = gx + cell / 2;
        const py = gy + cell / 2;
        const r = Math.hypot(px, py);
        if (r > R) continue;
        const rr = r / R;
        // tangente no sentido horário da tela: no ponto da esquerda (dentro) aponta para baixo, como o direto
        const th = Math.atan2(py, px);
        const tx = Math.sin(th) * tauT * rr;
        const ty = -Math.cos(th) * tauT * rr;
        const mag = Math.hypot(tx, ty + tauD) / peak;
        const u = Math.min(1, Math.max(0, mag));
        const c1 = u < 0.5 ? [40 + 2 * u * 60, 110 + 2 * u * 90, 230 - 2 * u * 30] : [100 + (u - 0.5) * 2 * 155, 200 - (u - 0.5) * 2 * 140, 200 - (u - 0.5) * 2 * 155];
        ctx.fillStyle = `rgb(${Math.round(c1[0])},${Math.round(c1[1])},${Math.round(c1[2])})`;
        ctx.fillRect(cx + gx, cy + gy, cell + 0.5, cell + 0.5);
      }
    }
    // setas do sentido da torção na borda
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.2;
      const px = cx + Math.cos(a) * (R + 9);
      const py = cy + Math.sin(a) * (R + 9);
      const tx = -Math.sin(a);
      const ty = Math.cos(a);
      arrow(ctx, px - tx * 7, py - ty * 7, px + tx * 7, py + ty * 7, 'rgba(226,235,245,0.75)', 1.6, 6);
    }
    ctx.strokeStyle = '#26303b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = C.bad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx - R, cy, 5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    text(ctx, '← eixo da mola', cx - R - 4, cy - R - 16, { size: 10.5, color: C.dim });
    text(ctx, 'dentro: τ máx', cx - R - 4, cy + R + 26, { size: 10.5, color: C.hot, bold: true });
    text(ctx, 'fora', cx + R - 18, cy + R + 26, { size: 10.5, color: C.curve1, bold: true });
    // contas
    const x = WIRE.x + 196;
    let y = WIRE.y + 46;
    const line = (parts: [string, boolean][], color: string = C.text, bold = false) => {
      rich(ctx, parts, x, y, 12, color, 'left', bold);
      y += 22;
    };
    const g = s.geom;
    line([[`C = D/d = ${f0(g.D)}/${f1(g.d)} = ${f2(g.C)}`, false]]);
    line([['K', false], ['w', true], [` = (4C − 1)/(4C − 4) + 0,615/C = ${fmt(g.Kw, 3)}`, false]]);
    line([[`k = G·d⁴/(8·D³·n) = ${f2(g.k)} N/mm`, false]], C.curve1, true);
    line([['τ = K', false], ['w', true], [`·8·F·D/(π·d³) = ${f0(s.tau)} MPa`, false]], C.hot, true);
    line([['τ', false], ['adm', true], [` = ${f0(s.tauAdm)} MPa → FS = ${f2(s.FS)}`, false]], fsColor(s.FS), true);
    line([[`comprimento sólido = (n + 2)·d = ${f0(g.Ls)} mm`, false]]);
    line([[`L₀/D = ${f2(g.L0 / g.D)}`, false], [s.buckle ? `  (acima de ${fmt(BUCKLE, 2)}: flamba)` : '  (não flamba)', false]], s.buckle ? C.amber : C.text);
    line([[`G = ${f0(g.G / 1000)} GPa · folga entre espiras: ${fmt(GAP * 100, 0)} % de D`, false]], C.dim);
  }

  // ---------------------------------------------------------------- macaco
  function drawJack(ctx: CanvasRenderingContext2D, j: JackState, v: LabValues): void {
    panel(ctx, JACK, 'Macaco de parafuso');
    const capBottom = BODY_TOP - (30 + lift) * MM;
    // base e corpo
    ctx.fillStyle = '#3a4654';
    ctx.beginPath();
    ctx.moveTo(JX - 140, 524);
    ctx.lineTo(JX + 140, 524);
    ctx.lineTo(JX + 96, 476);
    ctx.lineTo(JX - 96, 476);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5d6b7a';
    ctx.beginPath();
    ctx.moveTo(JX - 70, 478);
    ctx.lineTo(JX + 70, 478);
    ctx.lineTo(JX + 50, BODY_TOP + 18);
    ctx.lineTo(JX - 50, BODY_TOP + 18);
    ctx.closePath();
    ctx.fill();
    // porca de bronze no topo do corpo
    ctx.fillStyle = '#c9894a';
    ctx.fillRect(JX - 34, BODY_TOP, 68, 20);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(JX - 34, BODY_TOP + 16, 68, 4);
    text(ctx, 'porca', JX + 40, BODY_TOP + 15, { size: 10, color: C.dim });
    // parafuso com os filetes (parados em relação à porca: o parafuso "rosqueia" pela própria hélice)
    const sx0 = JX - 18;
    const sx1 = JX + 18;
    const yHead = capBottom + 26;
    ctx.fillStyle = '#b8c0c8';
    ctx.fillRect(sx0, yHead, sx1 - sx0, BODY_TOP - yHead);
    const starts = Math.round(v.ent ?? 0) + 1;
    const pPx = Math.max(3, (v.pas ?? 6) * 1.6);
    const Lpx = pPx * starts;
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx0, yHead, sx1 - sx0, BODY_TOP - yHead);
    ctx.clip();
    ctx.strokeStyle = 'rgba(30,40,52,0.6)';
    ctx.lineWidth = 2;
    for (let y = BODY_TOP + Lpx; y > yHead - Lpx; y -= pPx) {
      ctx.beginPath();
      ctx.moveTo(sx0, y);
      ctx.lineTo(sx1, y - Lpx / 2);
      ctx.stroke();
    }
    ctx.restore();
    // cabeça, manivela e carga
    ctx.fillStyle = '#7e8a98';
    ctx.fillRect(JX - 26, capBottom, 52, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(JX - 26, capBottom, 52, 3);
    const Rpx = (v.R ?? 0.3) * 220;
    const cosA = Math.cos(crank);
    const front = Math.sin(crank) > 0;
    const yL = capBottom + 13;
    const xEnd = JX + Rpx * cosA;
    const drawLever = () => {
      ctx.strokeStyle = '#9aa6b3';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(JX - Rpx * 0.12 * cosA, yL);
      ctx.lineTo(xEnd, yL);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#d9534a';
      ctx.beginPath();
      ctx.arc(xEnd, yL, front ? 8 : 6, 0, TAU);
      ctx.fill();
    };
    if (!front) drawLever();
    ctx.fillStyle = '#56616e';
    ctx.fillRect(JX - 34, capBottom - 10, 68, 10);
    ctx.fillStyle = '#6f5a46';
    roundRect(ctx, JX - 72, capBottom - 78, 144, 68, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(JX - 72, capBottom - 78, 144, 68);
    ctx.beginPath();
    ctx.moveTo(JX - 72, capBottom - 78);
    ctx.lineTo(JX + 72, capBottom - 10);
    ctx.moveTo(JX + 72, capBottom - 78);
    ctx.lineTo(JX - 72, capBottom - 10);
    ctx.stroke();
    tag(ctx, `W = ${fmt(j.W / 1000, 1)} kN`, JX, capBottom - 38, C.text, 'center', 13);
    if (front) drawLever();
    // altura
    const xr = JX + 130;
    ctx.strokeStyle = C.dim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xr, BODY_TOP);
    ctx.lineTo(xr, capBottom);
    ctx.stroke();
    text(ctx, `${f0(lift)} mm`, xr + 6, (BODY_TOP + capBottom) / 2 + 4, { size: 11, color: C.dim, bold: true });
    // situação
    if (mode === 'held') tag(ctx, 'travado: a carga não desce', JX, capBottom - 96, C.good, 'center', 12);
    if (mode === 'fall') tag(ctx, 'descendo sozinha!', JX, capBottom - 96, C.bad, 'center', 12);
    if (mode === 'up') tag(ctx, `subindo ${f0(j.L)} mm por volta`, JX, capBottom - 96, C.curve1, 'center', 12);
    text(ctx, 'use os botões ▶ ao lado dos controles', JACK.x + 12, JACK.y + JACK.h - 8, { size: 10.5, color: C.dim });
  }

  function drawIncline(ctx: CanvasRenderingContext2D, j: JackState, v: LabValues): void {
    panel(ctx, INCL, 'A rosca desenrolada: um plano inclinado');
    const x0 = INCL.x + 40;
    const yb = INCL.y + INCL.h - 34;
    const B = 260;
    const tanL = j.tanL;
    const Hh = B * tanL;
    // rampa: uma volta de rosca aberta (base π·dₘ, altura = avanço)
    ctx.fillStyle = 'rgba(184,192,200,0.25)';
    ctx.beginPath();
    ctx.moveTo(x0, yb);
    ctx.lineTo(x0 + B, yb);
    ctx.lineTo(x0 + B, yb - Hh);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b8c0c8';
    ctx.lineWidth = 2;
    ctx.stroke();
    rich(ctx, [['π·d', false], ['m', true], [` = ${f1(Math.PI * (v.dmed ?? 33))} mm`, false]], x0 + B / 2, yb + 18, 11, C.dim, 'center', false);
    text(ctx, `L = ${f0(j.L)} mm`, x0 + B + 8, yb - Hh / 2 + 4, { size: 11, color: C.dim });
    // ângulo de hélice (azul) e ângulo de atrito (âmbar tracejado)
    const phiR = j.phi * DEG;
    ctx.strokeStyle = C.amber;
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, yb);
    ctx.lineTo(x0 + B, yb - B * Math.tan(phiR));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = C.curve1;
    ctx.beginPath();
    ctx.arc(x0, yb, 64, -Math.atan(tanL), 0);
    ctx.stroke();
    ctx.strokeStyle = C.amber;
    ctx.beginPath();
    ctx.arc(x0, yb, 84, -phiR, 0);
    ctx.stroke();
    // a carga sobre a rampa e as forças (diagrama de corpo livre, subindo)
    const ang = Math.atan(tanL);
    const ux = Math.cos(ang);
    const uy = -Math.sin(ang);
    const nx = -Math.sin(ang);
    const ny = -Math.cos(ang);
    const t = 0.72;
    const bx = x0 + B * t;
    const by = yb - B * t * tanL;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-ang);
    ctx.fillStyle = '#6f5a46';
    ctx.fillRect(-16, -26, 32, 26);
    ctx.restore();
    const cxb = bx + nx * 13;
    const cyb = by + ny * 13;
    const k = 58;
    const P = (tanL + j.mup) / (1 - j.mup * tanL);
    const N = Math.cos(ang) + P * Math.sin(ang);
    arrow(ctx, cxb, cyb, cxb, cyb + k, C.hot, 2.4, 8);
    text(ctx, 'W', cxb + 6, cyb + k - 2, { size: 11, color: C.hot, bold: true });
    const pLen = Math.max(18, k * P);
    arrow(ctx, cxb - pLen - 20, cyb - 16, cxb - 20, cyb - 16, C.curve1, 2.4, 8);
    text(ctx, 'força da rosca', cxb - pLen - 22, cyb - 12, { size: 10.5, color: C.curve1, bold: true, align: 'right' });
    const nLen = k * N * 0.55;
    arrow(ctx, bx + nx * 28, by + ny * 28, bx + nx * (28 + nLen), by + ny * (28 + nLen), C.good, 2, 7);
    text(ctx, 'N', bx + nx * (34 + nLen), by + ny * (34 + nLen), { size: 11, color: C.good, bold: true, align: 'center' });
    const fr = Math.max(6, j.mup * N * k);
    const sx = bx - ux * 18 + nx * 4;
    const sy = by - uy * 18 + ny * 4;
    arrow(ctx, sx, sy, sx - ux * fr, sy - uy * fr, C.amber, 2, 7);
    text(ctx, "atrito μ'N", sx - ux * fr * 0.5, sy - uy * fr * 0.5 + 18, { size: 10.5, color: C.amber, bold: true, align: 'center' });
    // legenda e veredito
    const lx = INCL.x + INCL.w - 12;
    const ok = j.lock;
    text(ctx, ok ? "λ < φ': autotravante" : "λ > φ': desce sozinha", lx, INCL.y + 20, { size: 12.5, color: ok ? C.good : C.bad, align: 'right', bold: true });
    text(ctx, `λ = ${f1(j.lambda)}° (hélice)`, lx, INCL.y + 40, { size: 11.5, color: C.curve1, align: 'right', bold: true });
    text(ctx, `φ' = ${f1(j.phi)}° (atrito, - - -)`, lx, INCL.y + 58, { size: 11.5, color: C.amber, align: 'right', bold: true });
    rich(ctx, [['tg λ = L/(π·d', false], ['m', true], [")", false]], lx, INCL.y + 78, 11, C.dim, 'right', false);
    text(ctx, `tg φ' = μ' = μ/cos ${THREAD_HALF[Math.round(v.perfil ?? 1)]}° = ${fmt(j.mup, 3)}`, lx, INCL.y + 96, { size: 11, color: C.dim, align: 'right' });
  }

  function drawEta(ctx: CanvasRenderingContext2D, j: JackState): void {
    const ch = new Chart(ctx, { x: 438, y: 302, w: 196, h: 190, x0: 0, x1: 45, y0: 0, y1: 100 });
    ch.frame('Rendimento × λ', 'λ (°)', 'η (%)', [0, 15, 30, 45], [0, 25, 50, 75, 100]);
    ctx.fillStyle = 'rgba(95,211,138,0.12)';
    ctx.fillRect(ch.X(0), ch.b.y, ch.X(Math.min(45, j.phi)) - ch.X(0), ch.b.h);
    text(ctx, 'autotravante', ch.X(Math.min(45, j.phi)) - 4, ch.b.y + ch.b.h - 8, { size: 10, color: C.good, align: 'right', bold: true });
    ctx.strokeStyle = C.dim;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ch.X(0), ch.Y(50));
    ctx.lineTo(ch.X(45), ch.Y(50));
    ctx.stroke();
    ctx.setLineDash([]);
    ch.fn((deg) => Math.max(0, screwEta(Math.tan(Math.max(0.01, deg) * DEG), j.mup) * 100), C.curve1, 2.4);
    marker(ch, ctx, Math.min(45, j.lambda), j.eta * 100);
    tag(ctx, `η = ${f1(j.eta * 100)} %`, Math.min(ch.X(j.lambda) + 8, ch.b.x + ch.b.w - 70), Math.max(ch.b.y + 16, ch.Y(j.eta * 100) - 12), C.text, 'left', 11);
  }

  function drawNumbers(ctx: CanvasRenderingContext2D, j: JackState, v: LabValues): void {
    panel(ctx, NUM, 'Contas');
    const x = NUM.x + 12;
    let y = NUM.y + 44;
    const line = (parts: [string, boolean][], color: string = C.text, bold = false) => {
      rich(ctx, parts, x, y, 11.5, color, 'left', bold);
      y += 21;
    };
    const starts = Math.round(v.ent ?? 0) + 1;
    line([[`avanço L = ${starts} × ${f0(v.pas ?? 6)} = ${f0(j.L)} mm por volta`, false]]);
    line([[`λ = ${f2(j.lambda)}°   φ' = ${f2(j.phi)}°`, false]]);
    line([['T', false], ['subir', true], [` = W·r·(tg λ + μ')/(1 − μ'·tg λ)`, false]], C.dim);
    line([[`     = ${f1(j.Tup)} N·m`, false]], C.curve1, true);
    line([['T', false], ['descer', true], [` = W·r·(μ' − tg λ)/(1 + μ'·tg λ)`, false]], C.dim);
    line([[`     = ${f1(j.Tdown)} N·m`, false], [j.Tdown < 0 ? '  (desce sozinha)' : '', false]], j.Tdown < 0 ? C.bad : C.good, true);
    line([[`mão na manivela: ${f1(j.Tup)}/${f2(j.R)} = ${f0(j.Fman)} N`, false]]);
    line([[`η = W·L/(2π·T`, false], ['subir', true], [`) = ${f1(j.eta * 100)} %`, false]], j.eta < 0.5 ? C.text : C.amber, true);
    text(ctx, 'autotravante ⇒ rendimento abaixo de 50 %', x, NUM.y + NUM.h - 12, { size: 10.5, color: C.dim });
  }

  // ---------------------------------------------------------------- animação do macaco
  function stepJack(j: JackState, dt: number): void {
    if (lastLock !== j.lock) {
      lastLock = j.lock;
      if (mode === 'held') mode = 'idle';
    }
    if (mode === 'up') {
      const dTh = TAU * 1.1 * dt;
      crank += dTh;
      lift = Math.min(LIFT_MAX, lift + (j.L * dTh) / TAU);
      modeT -= dt;
      if (modeT <= 0 || lift >= LIFT_MAX) mode = 'idle';
    } else if (mode === 'fall') {
      // desce acelerando: a hélice "empurra" o parafuso de volta (quanto mais λ passa de φ', mais rápido)
      const push = Math.max(0.15, (j.tanL - j.mup) / Math.max(0.02, j.tanL));
      fallV += 60 * push * dt;
      const dz = Math.min(lift, fallV * dt);
      lift -= dz;
      crank -= (dz / Math.max(0.5, j.L)) * TAU;
      if (lift <= 0) {
        lift = 0;
        mode = 'idle';
      }
    } else if (mode === 'held') {
      modeT -= dt;
      if (modeT <= 0) mode = 'idle';
    }
  }

  const isJackV = (v: LabValues) => Math.round(v.modo ?? 0) === 1;

  return {
    draw(ctx, v, _o, dt) {
      if (isJackV(v)) {
        const j = jackState(v);
        stepJack(j, dt);
        drawJack(ctx, j, v);
        drawIncline(ctx, j, v);
        drawEta(ctx, j);
        drawNumbers(ctx, j, v);
        return;
      }
      const s = springState(v);
      scale = approach(scale, fitScale(s), dt, 6);
      drawPress(ctx, s);
      drawFd(ctx, s, dt);
      drawWire(ctx, s);
    },
    status(v) {
      if (isJackV(v)) {
        const j = jackState(v);
        if (mode === 'fall') return { text: `A carga desce sozinha: λ = ${f1(j.lambda)}° passa do ângulo de atrito φ' = ${f1(j.phi)}°. Para segurar, seria preciso um freio na manivela.`, tone: 'bad' };
        if (!j.lock) return { text: `Não é autotravante (λ = ${f1(j.lambda)}° > φ' = ${f1(j.phi)}°): solta, a carga desce sozinha. Rendimento ${f1(j.eta * 100)} %.`, tone: 'warn' };
        if (j.Fman > 300) return { text: `Força na manivela de ${f0(j.Fman)} N: pesado para uma pessoa. Manivela mais longa, menos atrito ou passo menor.`, tone: 'warn' };
        return { text: `Autotravante (λ = ${f1(j.lambda)}° < φ' = ${f1(j.phi)}°): para descer é preciso girar ao contrário (${f1(j.Tdown)} N·m). Rendimento ${f1(j.eta * 100)} %.`, tone: 'ok' };
      }
      const s = springState(v);
      const g = s.geom;
      if (s.solid) return { text: `Mola fechada: as espiras encostaram (cada mola fecha com ${f0(g.Fs)} N). Daí em diante ela é um bloco maciço — uma mola nunca deve trabalhar assim.`, tone: 'bad' };
      if (s.FS < 1) return { text: `O fio passa da tensão admissível (${f0(s.tau)} MPa > ${f0(s.tauAdm)} MPa): a mola cede e não volta ao comprimento livre.`, tone: 'bad' };
      if (g.C < 4) return { text: `Índice C = ${f2(g.C)} abaixo de 4: mola difícil de enrolar e com a tensão muito concentrada do lado de dentro.`, tone: 'warn' };
      if (g.C > 12) return { text: `Índice C = ${f2(g.C)} acima de 12: mola mole e "solta", que embaraça e flamba fácil.`, tone: 'warn' };
      if (s.buckle) return { text: `L₀/D = ${f2(g.L0 / g.D)}: mola esbelta, pode flambar. Use uma haste ou um tubo de guia.`, tone: 'warn' };
      return { text: `k = ${f2(s.keq)} N/mm: com ${f0(s.F)} N o conjunto encolhe ${f1(s.defl)} mm. τ = ${f0(s.tau)} MPa (FS ${f2(s.FS)}).`, tone: 'ok' };
    },
    pointer(kind, x, y, v): LabValues | null {
      if (isJackV(v)) return null;
      const s = springState(v);
      const yTop = Y_BASE - (s.height0 - s.defl) * scale;
      if (kind === 'down') dragPlate = x > CX - 125 && x < CX + 125 && Math.abs(y - (yTop - 5)) < 18;
      if (kind === 'up') {
        const was = dragPlate;
        dragPlate = false;
        if (!was) return null;
      }
      if (!dragPlate) return null;
      const defl = Math.max(0, s.height0 - (Y_BASE - y) / scale);
      return { F: Math.min(2000, Math.max(0, s.keq * defl)) };
    },
    cursor(x, y, v) {
      if (isJackV(v)) return 'default';
      const s = springState(v);
      const yTop = Y_BASE - (s.height0 - s.defl) * scale;
      return x > CX - 125 && x < CX + 125 && Math.abs(y - (yTop - 5)) < 18 ? 'ns-resize' : 'default';
    },
    actions: [
      {
        label: '▶ Girar a manivela (subir)',
        title: 'Macaco: gira a manivela por alguns segundos e levanta a carga.',
        run(api) {
          if (Math.round(api.get().modo ?? 0) !== 1) {
            if (api.isLocked('modo')) return;
            api.set({ modo: 1 });
          }
          if (lift >= LIFT_MAX) lift = LIFT0;
          mode = 'up';
          modeT = 3;
          fallV = 0;
        },
      },
      {
        label: '▶ Soltar a manivela',
        title: 'Macaco: larga a manivela. Se o parafuso não for autotravante, a carga desce sozinha.',
        run(api) {
          if (Math.round(api.get().modo ?? 0) !== 1) {
            if (api.isLocked('modo')) return;
            api.set({ modo: 1 });
          }
          const j = jackState({ ...api.get(), modo: 1 });
          if (lift <= 0.5) lift = LIFT0;
          fallV = 0;
          if (j.lock) {
            mode = 'held';
            modeT = 2.5;
          } else mode = 'fall';
        },
      },
    ],
    reset() {
      lift = LIFT0;
      crank = 0;
      mode = 'idle';
      fallV = 0;
      dragPlate = false;
    },
  };
}
