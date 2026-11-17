/**
 * Desenho da bancada do eixo: a árvore em vista lateral (motor, acoplamento, mancais em corte, engrenagem e o pinhão
 * da máquina movida), com a flecha e a vibração exageradas; os diagramas de momento fletor e de torque; a seção sob a
 * engrenagem girando (flexão alternada × torção constante); a curva de vibração × rotação com a velocidade crítica; e
 * os mancais: rolamentos de frente (zona de carga e vida L10) ou a bucha com o filme de óleo, a curva de Stribeck e a
 * viscosidade dos óleos × temperatura. A animação roda em câmera lenta.
 */
import { journalOf, frictionOf, oilVisc, OILS, ROUGH, SPAN, SY, BEARINGS, shaftState, type ShaftState } from '../../learning/labs/shaft';
import { approach, arrow, C, Chart, fmt, marker, niceAxis, roundRect, tag, text, ticksOf } from './draw';
import type { LabValues } from '../../learning/types';
import type { LabView } from './views';

const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
const f2 = (x: number) => fmt(x, 2);
const TAU = Math.PI * 2;

// ------------------------------------------------------------------ cena (vista lateral)
const SC = { x: 16, y: 12, w: 508, h: 222 };
const Y0 = 112;
const XA = 168;
const XB = 488;
const PX = (XB - XA) / SPAN;
const X_COUP = 120;
const X_END = 508;
const DG = { x: 16, y: 242, w: 508, h: 150 };
const ST = { x: 16, y: 400, w: 508, h: 148 };
const BR = { x: 536, y: 262, w: 408, h: 286 };

const STEEL = '#aeb9c6';
const BRONZE = '#c9894a';
const OIL = '#e0a43a';

const gearX = (a: number) => XA + a * PX;
const shaftHalf = (d: number) => (4 + d * 0.3) / 2;

/** Forma da linha elástica (1 sob a engrenagem), com o trecho fora do vão seguindo a inclinação dos apoios. */
function shapeAt(xp: number, a: number): number {
  const L = SPAN;
  const b = L - a;
  const x = (xp - XA) / PX;
  if (x < 0) {
    const slope = (L * L - b * b) / (2 * a * a * b);
    return slope * x;
  }
  if (x > L) {
    const slope = (L * L - a * a) / (2 * a * b * b);
    return -slope * (x - L);
  }
  if (x <= a) return (x * (L * L - b * b - x * x)) / (2 * a * a * b);
  const u = L - x;
  return (u * (L * L - a * a - u * u)) / (2 * a * b * b);
}

function panel(ctx: CanvasRenderingContext2D, r: { x: number; y: number; w: number; h: number }, title?: string): void {
  ctx.fillStyle = C.bg2;
  roundRect(ctx, r.x, r.y, r.w, r.h, 8);
  ctx.fill();
  if (title) text(ctx, title, r.x + 10, r.y + 18, { size: 13, bold: true });
}

/** Rótulo com índice (R_A, h_0...): o trecho depois de "_" sai menor e mais baixo. */
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

const fsColor = (fs: number) => (fs < 1 ? C.bad : fs < 1.5 ? C.amber : C.good);

function hours(h: number): string {
  if (h >= 1e7 - 1) return '> 10 milhões de h';
  if (h >= 1e6) return `${fmt(h / 1e6, 1)} milhões de h`;
  if (h >= 1e4) return `${f0(h / 1000)} mil h`;
  return `${f0(h)} h`;
}

export function shaftView(): LabView {
  let spin = 0;
  let mScale = 300;
  let tScale = 150;
  let sScale = 60;
  let xMaxCrit = 4000;
  let dragGear = false;
  let dragRpm = false;

  // ---------------------------------------------------------------- cena
  function drawMotor(ctx: CanvasRenderingContext2D): void {
    const x0 = 24;
    const x1 = 96;
    const top = Y0 - 34;
    const bot = Y0 + 34;
    // pés e base
    ctx.fillStyle = '#3a4654';
    ctx.fillRect(x0 + 6, bot, x1 - x0 - 12, 10);
    // tampa do ventilador
    ctx.fillStyle = '#4c6a86';
    roundRect(ctx, x0 - 4, top + 6, 14, bot - top - 12, 4);
    ctx.fill();
    // carcaça aletada
    ctx.fillStyle = '#5b7ea3';
    roundRect(ctx, x0 + 8, top, x1 - x0 - 8, bot - top, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,18,28,0.35)';
    ctx.lineWidth = 1.5;
    for (let x = x0 + 16; x < x1 - 4; x += 7) {
      ctx.beginPath();
      ctx.moveTo(x, top + 4);
      ctx.lineTo(x, bot - 4);
      ctx.stroke();
    }
    // caixa de ligação
    ctx.fillStyle = '#466484';
    ctx.fillRect(x0 + 30, top - 10, 26, 10);
    text(ctx, 'Motor', (x0 + x1) / 2 + 4, bot + 24, { size: 11, color: C.dim, align: 'center', bold: true });
  }

  function drawCoupling(ctx: CanvasRenderingContext2D, yOff: number, hs: number): void {
    const h = Math.max(hs * 2 + 14, 26);
    ctx.fillStyle = '#7c8794';
    ctx.fillRect(X_COUP - 12, Y0 - h / 2, 10, h);
    ctx.fillRect(X_COUP + 2, Y0 + yOff - h / 2, 10, h);
    ctx.fillStyle = '#2b2f35';
    ctx.fillRect(X_COUP - 2, Y0 + yOff / 2 - h / 2 + 3, 4, h - 6);
    ctx.strokeStyle = 'rgba(142,164,186,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X_COUP, Y0 - 46);
    ctx.lineTo(X_COUP, Y0 - h / 2 - 2);
    ctx.stroke();
    text(ctx, 'acoplamento', X_COUP, Y0 - 50, { size: 10, color: C.dim, align: 'center' });
  }

  /** Mancal em corte (vista lateral): mancal de pedestal com rolamento (esferas ou rolos) ou bucha. */
  function drawBearingSide(ctx: CanvasRenderingContext2D, x: number, hs: number, brg: number, label: string): void {
    const inner = hs;
    const ring = 4;
    const roll = 8;
    const outerTop = inner + ring + roll + ring;
    // pedestal
    ctx.fillStyle = '#556271';
    ctx.beginPath();
    ctx.moveTo(x - 24, Y0 + outerTop + 18);
    ctx.lineTo(x - 22, Y0 - outerTop - 6);
    ctx.quadraticCurveTo(x, Y0 - outerTop - 16, x + 22, Y0 - outerTop - 6);
    ctx.lineTo(x + 24, Y0 + outerTop + 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#46515e';
    ctx.fillRect(x - 36, Y0 + outerTop + 18, 72, 8);
    ctx.fillStyle = '#8b98a7';
    ctx.fillRect(x - 32, Y0 + outerTop + 14, 6, 5);
    ctx.fillRect(x + 26, Y0 + outerTop + 14, 6, 5);
    // corte
    const w = 13;
    for (const s of [-1, 1]) {
      const yIn = Y0 + s * inner;
      if (brg === 2) {
        // bucha de bronze com o filme de óleo
        ctx.fillStyle = BRONZE;
        ctx.fillRect(x - w, s > 0 ? yIn + 2 : yIn - 12, 2 * w, 10);
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - w, s > 0 ? yIn + 2 : yIn - 12, 2 * w, 10);
        ctx.fillStyle = OIL;
        ctx.fillRect(x - w, s > 0 ? yIn : yIn - 2, 2 * w, 2);
      } else {
        ctx.fillStyle = '#c3ccd6';
        ctx.fillRect(x - w, s > 0 ? yIn : yIn - ring, 2 * w, ring);
        ctx.fillRect(x - w, s > 0 ? yIn + ring + roll : yIn - 2 * ring - roll, 2 * w, ring);
        const yc = yIn + s * (ring + roll / 2);
        ctx.fillStyle = '#e8edf2';
        ctx.strokeStyle = '#26303b';
        ctx.lineWidth = 1;
        if (brg === 0) {
          ctx.beginPath();
          ctx.arc(x, yc, roll / 2, 0, TAU);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(x - 6, yc - roll / 2, 12, roll);
          ctx.strokeRect(x - 6, yc - roll / 2, 12, roll);
        }
      }
    }
    if (brg === 2) {
      // copo de óleo
      ctx.fillStyle = OIL;
      ctx.fillRect(x - 4, Y0 - outerTop - 26, 8, 12);
      ctx.strokeStyle = '#26303b';
      ctx.strokeRect(x - 4, Y0 - outerTop - 26, 8, 12);
    }
    text(ctx, label, x, Y0 - outerTop - 30, { size: 13, bold: true, align: 'center' });
  }

  function drawGearSide(ctx: CanvasRenderingContext2D, x: number, yc: number, R: number, w: number, phase: number, fill: string, dir: number): void {
    ctx.fillStyle = fill;
    roundRect(ctx, x - w / 2, yc - R, w, 2 * R, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(8,14,22,0.7)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // dentes passando nas bordas (o giro)
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - w / 2, yc - R, w, 2 * R);
    ctx.clip();
    ctx.strokeStyle = 'rgba(10,18,28,0.45)';
    ctx.lineWidth = 2;
    const step = 7;
    const off = (((phase * dir * R) % step) + step) % step;
    for (let y = yc - R - step + off; y < yc + R + step; y += step) {
      const edge = Math.abs(y - yc) > R * 0.8;
      if (!edge) continue;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y);
      ctx.lineTo(x + w / 2, y);
      ctx.stroke();
    }
    ctx.restore();
    // alma e cubo
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x - w / 2 + 3, yc - R * 0.72, w - 6, R * 1.44);
    ctx.fillStyle = '#d6dee8';
    ctx.fillRect(x - w / 2 - 3, yc - R * 0.28, w + 6, R * 0.56);
  }

  function drawScene(ctx: CanvasRenderingContext2D, s: ShaftState, time: number): void {
    panel(ctx, SC, 'Árvore em dois mancais');
    const hs = shaftHalf(s.d);
    const xg = gearX(s.a);
    // flecha estática e vibração (exageradas)
    const yStatic = 28 * Math.tanh(s.defl / 1.5);
    const yDyn = 22 * Math.tanh(s.amp / 150);
    const whirl = Math.sin(spin);
    const yAt = (x: number) => shapeAt(x, s.a) * (yStatic + yDyn * whirl);
    drawMotor(ctx);
    // pinhão da máquina movida (acima da engrenagem) e o eixo dele
    const yg = Y0 + yAt(xg);
    const Rg = (250 / 2) * PX;
    const Rp = (100 / 2) * PX;
    const yp = Y0 - Rg - Rp;
    ctx.strokeStyle = '#7e8a98';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(xg, yp);
    ctx.lineTo(SC.x + SC.w - 6, yp);
    ctx.stroke();
    text(ctx, 'para a máquina →', SC.x + SC.w - 10, yp - 10, { size: 10, color: C.dim, align: 'right' });
    drawGearSide(ctx, xg, yp, Rp, 20, spin * 2.5, '#6f8fae', -1);
    // eixo (árvore)
    drawCoupling(ctx, yAt(X_COUP + 8), hs);
    ctx.strokeStyle = STEEL;
    ctx.lineWidth = 2 * hs;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(96, Y0);
    ctx.lineTo(X_COUP - 12, Y0);
    ctx.stroke();
    ctx.beginPath();
    for (let x = X_COUP + 2; x <= X_END; x += 3) {
      const y = Y0 + yAt(x);
      if (x === X_COUP + 2) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // brilho e marcas de giro
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = Math.max(1.5, hs * 0.35);
    ctx.beginPath();
    for (let x = X_COUP + 2; x <= X_END; x += 3) {
      const y = Y0 + yAt(x) - hs * 0.45;
      if (x === X_COUP + 2) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(20,30,42,0.45)';
    ctx.lineWidth = 2;
    const gap = 26;
    const off = ((spin * 8) % gap + gap) % gap;
    for (let x = X_COUP + 6 + off; x < X_END - 2; x += gap) {
      const y = Y0 + yAt(x);
      ctx.beginPath();
      ctx.moveTo(x - 3, y - hs + 1);
      ctx.lineTo(x + 3, y + hs - 1);
      ctx.stroke();
    }
    // engrenagem
    drawGearSide(ctx, xg, yg, Rg, 24, spin * 1, '#c98e3e', 1);
    // mancais
    drawBearingSide(ctx, XA, hs, s.brg, 'A');
    drawBearingSide(ctx, XB, hs, s.brg, 'B');
    // força nos dentes (para baixo: o pinhão empurra a engrenagem)
    arrow(ctx, xg + 26, yg - Rg + 6, xg + 26, yg - 4, C.hot, 3, 10);
    const fLabel = `F = ${f0(s.F)} N`;
    const fRight = xg + 32 + 70 < XB - 30 || xg < (XA + XB) / 2;
    tag(ctx, fLabel, fRight ? xg + 34 : xg - 34, yg - Rg + 22, C.hot, fRight ? 'left' : 'right', 11);
    // reações
    const outerTop = hs + 16;
    const baseY = Y0 + outerTop + 26;
    for (const [x, R, nm] of [
      [XA, s.RA, 'A'],
      [XB, s.RB, 'B'],
    ] as [number, number, string][]) {
      const len = 10 + 26 * Math.min(1, R / Math.max(s.RA, s.RB, 1));
      arrow(ctx, x, baseY + 6 + len, x, baseY + 4, C.good, 2.5, 9);
      rich(ctx, [['R', false], [nm, true], [` = ${f0(R)} N`, false]], x, Math.min(SC.y + SC.h - 6, baseY + len + 20), 11, C.good, 'center');
    }
    // cotas a e b
    const yDim = Y0 + 64;
    ctx.strokeStyle = 'rgba(142,164,186,0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(XA + 28, yDim);
    ctx.lineTo(xg - 16, yDim);
    ctx.moveTo(xg + 16, yDim);
    ctx.lineTo(XB - 28, yDim);
    ctx.stroke();
    ctx.setLineDash([]);
    if (xg - XA > 74) text(ctx, `a = ${f0(s.a)} mm`, (XA + xg) / 2, yDim - 4, { size: 10, color: C.dim, align: 'center' });
    if (XB - xg > 74) text(ctx, `b = ${f0(s.b)} mm`, (xg + XB) / 2, yDim - 4, { size: 10, color: C.dim, align: 'center' });
    // aviso de exagero e da vibração
    if (s.amp > 60 && Math.abs(time % 1) < 2) {
      text(ctx, 'vibração forte!', xg, yg + Rg + 16, { size: 11, bold: true, color: C.bad, align: 'center' });
    }
    text(ctx, 'flecha e vibração exageradas', SC.x + 10, SC.y + 34, { size: 10, color: C.dim });
  }

  // ---------------------------------------------------------------- diagramas M e T
  function drawDiagrams(ctx: CanvasRenderingContext2D, s: ShaftState, dt: number): void {
    panel(ctx, DG);
    const xg = gearX(s.a);
    mScale = approach(mScale, Math.max(20, s.M * 1.15), dt, 4);
    tScale = approach(tScale, Math.max(10, s.T * 1.15), dt, 4);
    // momento fletor
    const baseM = DG.y + 66;
    const hM = 46;
    text(ctx, 'Momento fletor', DG.x + 10, DG.y + 18, { size: 12, bold: true, color: C.curve1 });
    const yPeak = baseM - (s.M / mScale) * hM;
    ctx.fillStyle = 'rgba(90,184,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(XA, baseM);
    ctx.lineTo(xg, yPeak);
    ctx.lineTo(XB, baseM);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.curve1;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(XA, baseM);
    ctx.lineTo(xg, yPeak);
    ctx.lineTo(XB, baseM);
    ctx.stroke();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X_COUP, baseM);
    ctx.lineTo(X_END, baseM);
    ctx.stroke();
    const mLabel = `M máx = ${f1(s.M)} N·m`;
    const right = xg < (XA + XB) / 2 + 40;
    tag(ctx, mLabel, right ? xg + 10 : xg - 10, Math.max(DG.y + 16, yPeak + 4), C.curve1, right ? 'left' : 'right', 11);
    // torque
    const baseT = DG.y + 136;
    const hT = 40;
    text(ctx, 'Torque', DG.x + 10, DG.y + 92, { size: 12, bold: true, color: C.curve2 });
    const yT = baseT - (s.T / tScale) * hT;
    ctx.fillStyle = 'rgba(255,174,66,0.25)';
    ctx.fillRect(X_COUP, yT, xg - X_COUP, baseT - yT);
    ctx.strokeStyle = C.curve2;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(X_COUP, baseT);
    ctx.lineTo(X_COUP, yT);
    ctx.lineTo(xg, yT);
    ctx.lineTo(xg, baseT);
    ctx.lineTo(X_END, baseT);
    ctx.stroke();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X_COUP, baseT);
    ctx.lineTo(X_END, baseT);
    ctx.stroke();
    const tLabel = `T = ${f1(s.T)} N·m`;
    tag(ctx, tLabel, Math.max(X_COUP + 52, (X_COUP + xg) / 2), Math.max(DG.y + 98, yT - 4), C.curve2, 'center', 11);
    if (XB - xg > 60) text(ctx, 'T = 0', (xg + X_END) / 2, baseT - 6, { size: 11, color: C.dim, align: 'center', bold: true });
    // linhas de referência (mancais e engrenagem)
    ctx.strokeStyle = 'rgba(142,164,186,0.25)';
    ctx.setLineDash([2, 4]);
    for (const x of [XA, XB, xg]) {
      ctx.beginPath();
      ctx.moveTo(x, DG.y + 8);
      ctx.lineTo(x, DG.y + DG.h - 6);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // ---------------------------------------------------------------- tensões na seção
  function drawStress(ctx: CanvasRenderingContext2D, s: ShaftState, dt: number): void {
    panel(ctx, ST, 'Seção sob a engrenagem');
    const cx = 84;
    const cy = ST.y + 86;
    const R = 40;
    // tração embaixo (o eixo enverga para baixo), compressão em cima: fixas no espaço
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.clip();
    const grad = ctx.createLinearGradient(0, cy - R, 0, cy + R);
    grad.addColorStop(0, 'rgba(59,155,232,0.85)');
    grad.addColorStop(0.5, 'rgba(200,209,219,0.9)');
    grad.addColorStop(1, 'rgba(239,91,67,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    ctx.restore();
    ctx.strokeStyle = '#26303b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = 'rgba(20,30,42,0.6)';
    ctx.beginPath();
    ctx.moveTo(cx - R, cy);
    ctx.lineTo(cx + R, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'compressão', cx, cy - R - 6, { size: 10, color: C.cold, align: 'center', bold: true });
    text(ctx, 'tração', cx, cy + R + 14, { size: 10, color: C.hot, align: 'center', bold: true });
    // ponto da superfície girando com o eixo
    const th = spin;
    const px = cx + Math.sin(th) * R;
    const py = cy + Math.cos(th) * R;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // σ(t) de um ponto da superfície
    sScale = approach(sScale, Math.max(10, Math.max(s.sig, s.tau) * 1.2), dt, 4);
    const ch = new Chart(ctx, { x: 176, y: ST.y + 40, w: 196, h: 70, x0: 0, x1: 360, y0: -sScale, y1: sScale });
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ch.X(0), ch.Y(0));
    ctx.lineTo(ch.X(360), ch.Y(0));
    ctx.stroke();
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.moveTo(ch.X(0), ch.b.y);
    ctx.lineTo(ch.X(0), ch.b.y + ch.b.h);
    ctx.stroke();
    ch.fn((deg) => s.sig * Math.cos((deg * Math.PI) / 180), C.hot, 2.4);
    ch.fn(() => s.tau, C.curve2, 2, [5, 4]);
    const deg = ((((th * 180) / Math.PI) % 360) + 360) % 360;
    marker(ch, ctx, deg, s.sig * Math.cos(th));
    text(ctx, 'tensão no ponto ao longo de uma volta', ch.b.x, ST.y + 32, { size: 10, color: C.dim });
    text(ctx, '— flexão: ±σ, alternada (fadiga)', ch.b.x, ch.b.y + ch.b.h + 15, { size: 10.5, color: C.hot, bold: true });
    text(ctx, '- - torção: τ, constante', ch.b.x, ch.b.y + ch.b.h + 31, { size: 10.5, color: C.curve2, bold: true });
    // números
    const xN = 386;
    let y = ST.y + 36;
    const line = (s1: string, color: string = C.text, bold = false) => {
      text(ctx, s1, xN, y, { size: 11.5, color, bold });
      y += 17;
    };
    line(`σ = ±${f1(s.sig)} MPa`, C.hot, true);
    line(`τ = ${f1(s.tau)} MPa`, C.curve2, true);
    line(`von Mises: ${f1(s.svm)} MPa`);
    line(`Tresca: τmáx ${f1(s.tmax)} MPa`);
    line(`FS escoamento: ${f2(s.FS)}`, fsColor(s.FS), true);
    line(`FS fadiga: ${f2(s.FSf)}`, fsColor(s.FSf), true);
    text(ctx, `SAE 1045: σe = ${f0(SY)} MPa`, xN, ST.y + ST.h - 10, { size: 10, color: C.dim });
  }

  // ---------------------------------------------------------------- velocidade crítica
  function drawCritical(ctx: CanvasRenderingContext2D, s: ShaftState, dt: number): void {
    const want = Math.max(3600, s.nc * 1.3);
    const ax = niceAxis(want, [500, 1000, 2000, 2500, 5000], 6);
    xMaxCrit = approach(xMaxCrit, ax.top, dt, 4);
    const ch = new Chart(ctx, { x: 588, y: 46, w: 340, h: 166, x0: 0, x1: xMaxCrit, y0: 0, y1: 360 });
    const step = xMaxCrit > 6000 ? 2000 : 1000;
    ch.frame('Vibração × rotação', 'rotação (rpm)', 'amplitude (µm)', ticksOf(0, xMaxCrit, step), [0, 100, 200, 300]);
    // faixa a evitar: ±20 % da crítica
    const lo = s.nc * 0.8;
    const hi = Math.min(xMaxCrit, s.nc * 1.2);
    if (lo < xMaxCrit) {
      ctx.fillStyle = 'rgba(255,107,94,0.12)';
      ctx.fillRect(ch.X(lo), ch.b.y, ch.X(hi) - ch.X(lo), ch.b.h);
      text(ctx, 'evitar', (ch.X(lo) + ch.X(hi)) / 2, ch.b.y + 12, { size: 10, color: C.bad, align: 'center', bold: true });
    }
    const z = 0.03;
    const e = 20;
    ch.fn((n) => {
      const r = n / s.nc;
      return (e * r * r) / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2);
    }, C.curve1, 2.4);
    if (s.nc < xMaxCrit) {
      ctx.strokeStyle = C.amber;
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ch.X(s.nc), ch.b.y);
      ctx.lineTo(ch.X(s.nc), ch.b.y + ch.b.h);
      ctx.stroke();
      ctx.setLineDash([]);
      const rightSide = ch.X(s.nc) < ch.b.x + ch.b.w - 120;
      rich(ctx, [['n', false], ['c', true], [` = ${f0(s.nc)} rpm`, false]], ch.X(s.nc) + (rightSide ? 6 : -6), ch.b.y + 30, 11.5, C.amber, rightSide ? 'left' : 'right');
    } else {
      text(ctx, `crítica em ${f0(s.nc)} rpm →`, ch.b.x + ch.b.w - 4, ch.b.y + 30, { size: 11, color: C.amber, align: 'right', bold: true });
    }
    marker(ch, ctx, Math.min(s.n, xMaxCrit), Math.min(355, s.amp));
    tag(ctx, `${f0(s.n)} rpm · ${f0(s.amp)} µm`, Math.min(ch.X(s.n), ch.b.x + ch.b.w - 70), Math.max(ch.b.y + 52, ch.Y(Math.min(355, s.amp)) - 14), C.text, 'center', 11);
    text(ctx, 'clique no gráfico para mudar a rotação', ch.b.x - 36, ch.b.y + ch.b.h + 30, { size: 10, color: C.dim });
  }

  // ---------------------------------------------------------------- mancais
  function drawRolling(ctx: CanvasRenderingContext2D, s: ShaftState): void {
    panel(ctx, BR, 'Rolamentos: vida L10');
    const B = BEARINGS[s.brg === 1 ? 1 : 0];
    const items: [number, number, number, string][] = [
      [BR.x + 104, s.RA, s.LA, 'A'],
      [BR.x + 304, s.RB, s.LB, 'B'],
    ];
    const maxR = Math.max(s.RA, s.RB, 1);
    for (const [cx, R, L, nm] of items) {
      const cy = BR.y + 100;
      const Ro = 58;
      const Ri = 28;
      const rb = (Ro + Ri) / 2;
      ctx.fillStyle = '#9aa6b3';
      ctx.beginPath();
      ctx.arc(cx, cy, Ro, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1d2733';
      ctx.beginPath();
      ctx.arc(cx, cy, Ro - 6, 0, TAU);
      ctx.fill();
      // elementos rolantes: os de baixo levam a carga (zona de carga)
      const nb = s.brg === 1 ? 14 : 9;
      const cage = spin * 0.4;
      for (let i = 0; i < nb; i++) {
        const ang = cage + (i * TAU) / nb;
        const bx = cx + Math.cos(ang) * rb;
        const by = cy + Math.sin(ang) * rb;
        const share = Math.max(0, Math.sin(ang)) ** 1.5 * (R / maxR);
        ctx.fillStyle = share > 0.05 ? `rgba(255,${Math.round(220 - 140 * share)},${Math.round(120 - 80 * share)},1)` : '#e8edf2';
        ctx.strokeStyle = '#26303b';
        ctx.lineWidth = 1;
        if (s.brg === 1) {
          // rolos vistos de topo: círculos menores, com o furo de centro
          ctx.beginPath();
          ctx.arc(bx, by, 6, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(38,48,59,0.5)';
          ctx.beginPath();
          ctx.arc(bx, by, 1.6, 0, TAU);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(bx, by, 7.5, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.fillStyle = '#c3ccd6';
      ctx.beginPath();
      ctx.arc(cx, cy, Ri + 5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = STEEL;
      ctx.beginPath();
      ctx.arc(cx, cy, Ri - 2, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#26303b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(spin) * (Ri - 4), cy + Math.sin(spin) * (Ri - 4));
      ctx.stroke();
      // carga do eixo sobre o rolamento
      arrow(ctx, cx, cy - 14, cx, cy + 16, C.hot, 3, 9);
      text(ctx, `Mancal ${nm}`, cx, BR.y + 36, { size: 12, bold: true, align: 'center' });
      let y = cy + Ro + 22;
      text(ctx, `carga P = ${f0(R)} N`, cx, y, { size: 11.5, align: 'center', color: C.hot, bold: true });
      y += 17;
      const L10 = Math.pow((B.C * 1000) / R, B.p);
      text(ctx, `L10 = (C/P)${s.brg === 1 ? '^(10/3)' : '³'} = ${L10 >= 1e7 ? '> 10.000.000' : f0(L10)}`, cx, y, { size: 11, align: 'center' });
      y += 15;
      text(ctx, 'milhões de rotações', cx, y, { size: 10, align: 'center', color: C.dim });
      y += 18;
      const tone = L < 5000 ? C.bad : L < 20000 ? C.amber : C.good;
      text(ctx, `≈ ${hours(L)}`, cx, y, { size: 12.5, align: 'center', color: tone, bold: true });
    }
    text(ctx, `${s.brg === 1 ? 'Rolos cilíndricos' : 'Esferas'}: C = ${f0(B.C)} kN, p = ${s.brg === 1 ? '10/3' : '3'}`, BR.x + BR.w / 2, BR.y + BR.h - 30, { size: 11, color: C.dim, align: 'center' });
    text(ctx, 'horas = L10 · 10⁶ ÷ (60 · n)', BR.x + BR.w / 2, BR.y + BR.h - 12, { size: 11, color: C.dim, align: 'center' });
  }

  function drawJournal(ctx: CanvasRenderingContext2D, s: ShaftState, v: Record<string, number>): void {
    panel(ctx, BR, 'Bucha com óleo');
    const jr = s.jr;
    const cx = BR.x + 78;
    const cy = BR.y + 112;
    const Rb = 58;
    const gap = 12;
    const Rj = Rb - gap;
    const phi = ((85 - 70 * jr.eps) * Math.PI) / 180;
    // giro anti-horário na tela: o eixo se desloca para baixo, girado de φ no sentido do giro
    const ang = Math.PI / 2 - phi;
    const ex = Math.cos(ang) * jr.eps * gap;
    const ey = Math.sin(ang) * jr.eps * gap;
    // carcaça e bucha
    ctx.fillStyle = '#556271';
    roundRect(ctx, cx - Rb - 14, cy - Rb - 14, 2 * Rb + 28, 2 * Rb + 28, 10);
    ctx.fill();
    ctx.fillStyle = BRONZE;
    ctx.beginPath();
    ctx.arc(cx, cy, Rb + 6, 0, TAU);
    ctx.fill();
    // filme de óleo, colorido pela espessura (fino = vermelho)
    const N = 72;
    for (let i = 0; i < N; i++) {
      const a0 = (i * TAU) / N;
      const a1 = ((i + 1) * TAU) / N;
      const am = (a0 + a1) / 2;
      const hLocal = 1 - jr.eps * Math.cos(am - ang);
      const t = Math.min(1, Math.max(0, (hLocal - (1 - jr.eps)) / (2 * jr.eps + 1e-6)));
      const thin = 1 - t;
      ctx.fillStyle = `rgba(${Math.round(230 + 20 * thin)},${Math.round(190 - 130 * thin)},${Math.round(80 - 50 * thin)},0.95)`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, Rb, a0, a1 + 0.01);
      ctx.closePath();
      ctx.fill();
    }
    // eixo
    const jx = cx + ex;
    const jy = cy + ey;
    ctx.fillStyle = STEEL;
    ctx.beginPath();
    ctx.arc(jx, jy, Rj, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#26303b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(jx, jy);
    ctx.lineTo(jx + Math.cos(-spin) * (Rj - 6), jy + Math.sin(-spin) * (Rj - 6));
    ctx.stroke();
    // seta de giro (anti-horário) e carga
    ctx.strokeStyle = C.text;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(jx, jy, Rj * 0.55, -0.4, -2.0, true);
    ctx.stroke();
    const ea = -2.0;
    arrow(ctx, jx + Math.cos(ea + 0.25) * Rj * 0.55, jy + Math.sin(ea + 0.25) * Rj * 0.55, jx + Math.cos(ea) * Rj * 0.55, jy + Math.sin(ea) * Rj * 0.55, C.text, 1.8, 7);
    arrow(ctx, jx, jy - 10, jx, jy + 18, C.hot, 3, 9);
    // h0: ponto do filme mais fino
    const hx = cx + Math.cos(ang) * Rb;
    const hy = cy + Math.sin(ang) * Rb;
    ctx.fillStyle = C.bad;
    ctx.beginPath();
    ctx.arc(hx, hy, 3.5, 0, TAU);
    ctx.fill();
    rich(ctx, [['h', false], ['0', true]], hx + (Math.cos(ang) >= 0 ? 8 : -8), hy + 14, 12, C.bad, Math.cos(ang) >= 0 ? 'left' : 'right');
    // leituras
    let y = cy + Rb + 38;
    const regimes = ['limítrofe', 'mista', 'hidrodinâmica'];
    const tone = jr.regime === 0 ? C.bad : jr.regime === 1 ? C.amber : C.good;
    text(ctx, `S = ${fmt(jr.S, jr.S < 0.01 ? 4 : jr.S < 1 ? 3 : 2)}`, cx, y, { size: 12, align: 'center', bold: true });
    y += 18;
    rich(ctx, [['h', false], ['0', true], [` = ${f1(jr.h0)} µm  (c = ${f0(jr.c)} µm)`, false]], cx, y, 11.5, C.text, 'center', false);
    y += 18;
    text(ctx, `lubrificação ${regimes[jr.regime]}`, cx, y, { size: 12, align: 'center', color: tone, bold: true });

    // Stribeck
    const lx0 = -10;
    const lx1 = -5;
    const st = new Chart(ctx, { x: 746, y: 300, w: 184, h: 92, x0: lx0, x1: lx1, y0: -3, y1: -0.6 });
    st.frame('Curva de Stribeck', 'μN/P', 'atrito f', [], []);
    const cr = (v.cr ?? 1) / 1000;
    const c = (cr * s.d * 1000) / 2;
    const fAt = (lh: number) => {
      const S = Math.pow(10, lh) / (cr * cr);
      const { eps, rcf } = journalOf(S);
      const lambda = (c * (1 - eps)) / ROUGH;
      return { f: frictionOf(rcf, cr, lambda), lambda };
    };
    // faixas dos regimes
    let xb = lx0;
    let xm = lx0;
    for (let lh = lx0; lh <= lx1; lh += 0.01) {
      const { lambda } = fAt(lh);
      if (lambda < 1) xb = lh;
      if (lambda < 3) xm = lh;
    }
    ctx.fillStyle = 'rgba(255,107,94,0.14)';
    ctx.fillRect(st.X(lx0), st.b.y, st.X(xb) - st.X(lx0), st.b.h);
    ctx.fillStyle = 'rgba(255,201,77,0.14)';
    ctx.fillRect(st.X(xb), st.b.y, st.X(xm) - st.X(xb), st.b.h);
    ctx.fillStyle = 'rgba(95,211,138,0.12)';
    ctx.fillRect(st.X(xm), st.b.y, st.X(lx1) - st.X(xm), st.b.h);
    st.fn((lh) => Math.log10(fAt(lh).f), C.curve1, 2.2);
    for (const e of [-10, -8, -6]) {
      text(ctx, `10${e === -10 ? '⁻¹⁰' : e === -8 ? '⁻⁸' : '⁻⁶'}`, st.X(e), st.b.y + st.b.h + 14, { size: 10, color: C.dim, align: 'center' });
    }
    for (const [lf, lab] of [
      [-3, '0,001'],
      [-2, '0,01'],
      [-1, '0,1'],
    ] as [number, string][]) {
      text(ctx, lab, st.b.x - 4, st.Y(lf) + 4, { size: 10, color: C.dim, align: 'right' });
    }
    const lh = Math.log10(jr.hersey);
    marker(st, ctx, Math.min(lx1, Math.max(lx0, lh)), Math.min(-0.6, Math.max(-3, Math.log10(jr.f))));

    // viscosidade × temperatura
    const vc = new Chart(ctx, { x: 746, y: 458, w: 184, h: 56, x0: 0, x1: 120, y0: Math.log10(3), y1: Math.log10(2000) });
    vc.frame('Viscosidade × temperatura', '°C', 'cSt', [0, 40, 80, 120], []);
    const oil = Math.round(v.oil ?? 1);
    const colors = [C.curve1, C.curve2, C.curve3];
    OILS.forEach((_, i) => {
      vc.fn((t) => Math.log10(oilVisc(i, t)), colors[i], i === oil ? 2.6 : 1.2, i === oil ? [] : [4, 3]);
    });
    for (const [lv, lab] of [
      [1, '10'],
      [2, '100'],
      [3, '1000'],
    ] as [number, string][]) {
      text(ctx, lab, vc.b.x - 4, vc.Y(lv) + 4, { size: 10, color: C.dim, align: 'right' });
    }
    marker(vc, ctx, v.temp ?? 60, Math.log10(jr.nu));
    text(ctx, `${OILS[oil]}: ${f1(jr.nu)} cSt`, vc.b.x + vc.b.w, vc.b.y + 10, { size: 10.5, color: colors[oil], align: 'right', bold: true });
  }

  // ---------------------------------------------------------------- contrato
  return {
    draw(ctx, v, _o, dt, time) {
      const s = shaftState(v);
      // câmera lenta: 3.600 rpm aparecem como 1,5 volta por segundo
      spin += TAU * Math.min(1.5, (s.n / 3600) * 1.5) * dt;
      drawScene(ctx, s, time);
      drawDiagrams(ctx, s, dt);
      drawStress(ctx, s, dt);
      drawCritical(ctx, s, dt);
      if (s.brg === 2) drawJournal(ctx, s, v);
      else drawRolling(ctx, s);
    },
    status(v) {
      const s = shaftState(v);
      if (s.FS < 1) return { text: `O eixo escoa: von Mises dá ${f0(s.svm)} MPa, acima dos ${f0(SY)} MPa do aço. Engrosse o eixo, aproxime a engrenagem de um mancal ou tire torque.`, tone: 'bad' };
      if (s.FSf < 1) return { text: `O eixo quebra por fadiga: girando, a flexão de ±${f0(s.sig)} MPa se alterna a cada volta, e isso é demais para o aço. Engrosse o eixo ou diminua o momento.`, tone: 'bad' };
      if (s.r > 0.8 && s.r < 1.2) return { text: `Perto da velocidade crítica (${f0(s.nc)} rpm): o eixo vibra ${f0(s.amp)} µm. Afaste a rotação uns 20 % da crítica, engrosse o eixo ou leve a engrenagem para perto de um mancal.`, tone: 'bad' };
      if (s.brg === 2 && s.jr.regime === 0) return { text: `Lubrificação limítrofe: o filme de ${f1(s.jr.h0)} µm é menor que a rugosidade. Metal raspa no metal: desgaste e calor. Mais rotação, óleo mais viscoso (ou mais frio) ou menos carga.`, tone: 'bad' };
      if (s.brg === 2 && s.jr.regime === 1) return { text: `Lubrificação mista: o filme (${f1(s.jr.h0)} µm) já não separa todas as rugosidades. S = ${fmt(s.jr.S, 4)}.`, tone: 'warn' };
      const Lmin = Math.min(s.LA, s.LB);
      if (s.brg !== 2 && Lmin < 5000) return { text: `O rolamento ${s.worst ? 'B' : 'A'} dura só ${hours(Lmin)}: a carga dele é ${f0(Math.max(s.RA, s.RB))} N. Rolamento maior, rolos ou menos carga.`, tone: 'warn' };
      if (s.r >= 1.2) return { text: `Acima da crítica (${f0(s.nc)} rpm): o eixo é "flexível" e vibra pouco, mas passa pela crítica a cada partida e parada. FS = ${f2(s.FS)}.`, tone: 'warn' };
      if (s.brg === 2) return { text: `Filme completo de óleo (h₀ = ${f1(s.jr.h0)} µm): o eixo flutua sem tocar a bucha. S = ${fmt(s.jr.S, 3)}, f = ${fmt(s.jr.f, 4)}.`, tone: 'ok' };
      return { text: `Eixo seguro: von Mises ${f1(s.svm)} MPa (FS ${f2(s.FS)}), fadiga FS ${f2(s.FSf)}, crítica a ${f0(s.nc)} rpm (${f0(s.r * 100)} % dela).`, tone: 'ok' };
    },
    pointer(kind, x, y, v): LabValues | null {
      const s = shaftState(v);
      const xg = gearX(s.a);
      if (kind === 'down') {
        dragGear = Math.abs(x - xg) < 22 && y > Y0 - 70 && y < Y0 + 70;
        dragRpm = !dragGear && x > 588 && x < 928 && y > 46 && y < 212;
      }
      if (kind === 'up') {
        const was = dragGear || dragRpm;
        dragGear = false;
        dragRpm = false;
        if (!was) return null;
      }
      if (dragGear) return { a: Math.min(720, Math.max(80, (x - XA) / PX)) };
      if (dragRpm) return { n: Math.min(3600, Math.max(50, ((x - 588) / 340) * xMaxCrit)) };
      return null;
    },
    cursor(x, y, v) {
      const s = shaftState(v);
      if (Math.abs(x - gearX(s.a)) < 22 && y > Y0 - 70 && y < Y0 + 70) return 'ew-resize';
      if (x > 588 && x < 928 && y > 46 && y < 212) return 'pointer';
      return 'default';
    },
    reset() {
      dragGear = false;
      dragRpm = false;
    },
  };
}
