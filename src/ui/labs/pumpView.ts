/** Desenho da bancada da bomba centrífuga: corte da voluta, instalação e curvas H×Q e NPSH×Q. */
import { sfx } from '../../core/audio';
import { bepFlow, efficiency, npshAvailable, npshRequired, PUMP, pumpHead, systemHead } from '../../learning/labs/pump';
import type { LabValues } from '../../learning/types';
import { arrow, C, Chart, fmt, roundRect, tag, text } from './draw';
import type { LabView } from './views';

const TAU = Math.PI * 2;
const CX = 250;
const CY = 222;
const R1 = 30; // olho do rotor
const R2 = 95; // ponta das pás
const RV0 = 108; // voluta na lingueta
const RV1 = 153; // voluta no bocal
const TONGUE = Math.PI; // lingueta à esquerda; descarga sobe na vertical
const PIPE_TOP = 26;
const AXIS_Y = 486;
const TANK = { x: 24, y: 420, w: 84, h: 124 };

const wallR = (phi: number) => RV0 + ((RV1 - RV0) * phi) / TAU;
const phiOf = (theta: number) => {
  const p = (theta - TONGUE) % TAU;
  return p < 0 ? p + TAU : p;
};

interface Particle {
  r: number;
  th: number;
  zone: 0 | 1 | 2;
  x: number;
  y: number;
}
interface Bubble {
  r: number;
  th: number;
  size: number;
}

export function pumpView(): LabView {
  const parts: Particle[] = [];
  const bubbles: Bubble[] = [];
  const pits: { r: number; a: number; age: number }[] = [];
  const flashes: { x: number; y: number; t: number }[] = [];
  let rot = 0;
  let heat = 0;
  let dash = 0;
  let crackleAt = 0;
  let draggingTank = false;

  const spawn = (atEye: boolean): Particle => {
    const th = Math.random() * TAU;
    if (atEye) return { r: R1 * (0.35 + 0.65 * Math.random()), th, zone: 0, x: 0, y: 0 };
    const r = R1 + Math.random() * (R2 - R1);
    return { r, th, zone: 0, x: 0, y: 0 };
  };

  function update(v: LabValues, o: Record<string, number>, dt: number, time: number): void {
    const omega = 2.1 * (v.rpm / PUMP.n0);
    rot += omega * dt;
    const flow = v.primed ? o.Q / 110 : 0;
    const want = v.primed ? 170 : 70;
    while (parts.length < want) parts.push(spawn(parts.length > want * 0.7 ? true : false));
    if (parts.length > want) parts.length = want;
    for (const p of parts) {
      if (p.zone === 0) {
        p.th += omega * 0.9 * dt;
        p.r += (5 + 80 * flow) * dt;
        if (p.r >= R2) p.zone = 1;
      } else if (p.zone === 1) {
        const phi = phiOf(p.th);
        const mid = (R2 + 6 + wallR(phi)) / 2;
        p.th += omega * 0.55 * (R2 / p.r) * dt;
        p.r += (mid - p.r) * Math.min(1, dt * 1.6);
        if (phiOf(p.th) > TAU - 0.22 && flow > 0.02) {
          p.zone = 2;
          p.x = CX - (RV0 + 6 + Math.random() * (RV1 - RV0 - 12));
          p.y = CY;
        }
      } else {
        p.y -= (30 + 170 * flow) * dt;
        if (p.y < PIPE_TOP + 4) Object.assign(p, spawn(true));
      }
      if (p.zone !== 2) {
        p.x = CX + p.r * Math.cos(p.th);
        p.y = CY + p.r * Math.sin(p.th);
      }
    }
    // cavitação: bolhas nascem na entrada das pás (pressão mínima) e implodem quando a pressão sobe
    const severity = o.cav ? Math.min(1, Math.max(0.15, -o.margin / 3)) : 0;
    if (severity > 0 && Math.random() < severity * 40 * dt * 4) {
      bubbles.push({ r: R1 + 2 + Math.random() * 10, th: Math.random() * TAU, size: 1 });
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.th += omega * 0.9 * dt;
      b.r += (14 + 60 * flow) * dt;
      b.size = Math.min(4.2, b.size + dt * 6);
      if (b.r > R1 + 38 + Math.random() * 14) {
        flashes.push({ x: CX + b.r * Math.cos(b.th), y: CY + b.r * Math.sin(b.th), t: 0 });
        // a implosão erode a pá: marca no referencial do rotor
        if (pits.length < 60 && Math.random() < 0.25) pits.push({ r: b.r, a: b.th - rot, age: 0 });
        bubbles.splice(i, 1);
        if (time > crackleAt) {
          crackleAt = time + 0.12 + Math.random() * 0.18;
          sfx.blip();
        }
      }
    }
    for (let i = flashes.length - 1; i >= 0; i--) {
      flashes[i].t += dt;
      if (flashes[i].t > 0.25) flashes.splice(i, 1);
    }
    for (const p of pits) p.age += severity > 0 ? 0 : dt;
    for (let i = pits.length - 1; i >= 0; i--) if (pits[i].age > 12) pits.splice(i, 1);
    heat = v.primed && o.Q < 0.5 ? Math.min(1, heat + dt / 8) : Math.max(0, heat - dt / 3);
    dash -= (o.Q / 2.2) * dt * 10;
  }

  function drawCasing(ctx: CanvasRenderingContext2D, v: LabValues, o: Record<string, number>): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 8, 8, 504, 376, 10);
    ctx.fill();
    const path = new Path2D();
    for (let i = 0; i <= 120; i++) {
      const phi = (TAU * i) / 120;
      const r = wallR(phi);
      const x = CX + r * Math.cos(TONGUE + phi);
      const y = CY + r * Math.sin(TONGUE + phi);
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    path.lineTo(CX - RV1, PIPE_TOP);
    path.lineTo(CX - RV0, PIPE_TOP);
    path.closePath();
    // fluido colorido pela pressão: baixa no olho do rotor, alta na voluta
    const g = ctx.createRadialGradient(CX, CY, R1 * 0.6, CX, CY, RV1);
    if (!v.primed) {
      g.addColorStop(0, '#5d6b7a');
      g.addColorStop(1, '#7d8a98');
    } else {
      const shut = o.Q < 0.5;
      g.addColorStop(0, o.cav ? '#a8d8ff' : '#1d5fa8');
      g.addColorStop(0.45, '#2f86c9');
      g.addColorStop(1, heat > 0.05 && shut ? `rgb(${Math.round(200 + 50 * heat)},${Math.round(110 - 40 * heat)},70)` : '#d9813f');
    }
    ctx.fillStyle = g;
    ctx.fill(path);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = C.metalDark;
    ctx.lineWidth = 12;
    ctx.stroke(path);
    ctx.strokeStyle = C.metal;
    ctx.lineWidth = 5;
    ctx.stroke(path);
    // flange da descarga
    ctx.fillStyle = C.metal;
    ctx.fillRect(CX - RV1 - 12, PIPE_TOP - 8, RV1 - RV0 + 24, 8);
    text(ctx, 'Descarga', CX - (RV0 + RV1) / 2, PIPE_TOP - 12, { size: 12, align: 'center', color: C.dim });
    arrow(ctx, CX - (RV0 + RV1) / 2 + 40, 80, CX - (RV0 + RV1) / 2 + 40, 48, C.amber, 2, 8);
  }

  function drawImpeller(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(CX, CY);
    ctx.fillStyle = 'rgba(30,40,55,0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, R2, 0, TAU);
    ctx.fill();
    ctx.rotate(rot);
    // 6 pás curvadas para trás (a ponta "atrasa" em relação ao giro)
    for (let i = 0; i < 6; i++) {
      const a = (TAU * i) / 6;
      const a0 = a;
      const a1 = a - 0.95;
      ctx.strokeStyle = C.metalLight;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(Math.cos(a0) * (R1 + 2), Math.sin(a0) * (R1 + 2));
      const am = a - 0.32;
      ctx.quadraticCurveTo(Math.cos(am) * (R1 + 40), Math.sin(am) * (R1 + 40), Math.cos(a1) * (R2 - 2), Math.sin(a1) * (R2 - 2));
      ctx.stroke();
    }
    for (const p of pits) {
      ctx.fillStyle = 'rgba(40,25,20,0.85)';
      ctx.beginPath();
      ctx.arc(Math.cos(p.a) * p.r, Math.sin(p.a) * p.r, 2.2, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = C.metal;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, TAU);
    ctx.fill();
    ctx.fillStyle = C.metalDark;
    ctx.fillRect(-4, -17, 8, 9);
    ctx.restore();
    ctx.strokeStyle = 'rgba(200,215,230,0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(CX, CY, R1, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawFlow(ctx: CanvasRenderingContext2D, v: LabValues): void {
    for (const p of parts) {
      ctx.fillStyle = v.primed ? 'rgba(235,248,255,0.85)' : 'rgba(230,235,240,0.35)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, v.primed ? 2.1 : 1.5, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 1.4;
    for (const b of bubbles) {
      ctx.beginPath();
      ctx.arc(CX + b.r * Math.cos(b.th), CY + b.r * Math.sin(b.th), b.size, 0, TAU);
      ctx.stroke();
    }
    for (const f of flashes) {
      const k = 1 - f.t / 0.25;
      ctx.strokeStyle = `rgba(255,236,150,${k})`;
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 6; i++) {
        const a = (TAU * i) / 6;
        ctx.beginPath();
        ctx.moveTo(f.x + Math.cos(a) * 2, f.y + Math.sin(a) * 2);
        ctx.lineTo(f.x + Math.cos(a) * (3 + 6 * (1 - k)), f.y + Math.sin(a) * (3 + 6 * (1 - k)));
        ctx.stroke();
      }
    }
  }

  function drawLabels(ctx: CanvasRenderingContext2D, v: LabValues, o: Record<string, number>): void {
    // seta de rotação
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, 26, -2.4, -1.0);
    ctx.stroke();
    arrow(ctx, CX + 26 * Math.cos(-1.15), CY + 26 * Math.sin(-1.15), CX + 26 * Math.cos(-0.95), CY + 26 * Math.sin(-0.95), C.amber, 2, 7);
    text(ctx, `${fmt(v.rpm, 0)} rpm`, CX, CY + 5, { size: 11, align: 'center', bold: true, shadow: true });
    text(ctx, 'câmera lenta', CX, CY + 18, { size: 9, align: 'center', color: C.dim });
    text(ctx, 'Rotor', CX + 70, CY + 112, { size: 12, color: C.dim });
    text(ctx, 'Voluta', CX + 132, CY - 112, { size: 12, color: C.dim });
    text(ctx, 'Olho do rotor: entrada', 300, 375, { size: 11, color: C.dim });
    text(ctx, '(sucção axial, de frente para você)', 300, 388 - 1, { size: 9, color: C.dim });
    // escala de pressão
    const gx = 470;
    const gy = 40;
    const grad = ctx.createLinearGradient(0, gy + 110, 0, gy);
    grad.addColorStop(0, '#1d5fa8');
    grad.addColorStop(0.5, '#2f86c9');
    grad.addColorStop(1, '#d9813f');
    ctx.fillStyle = grad;
    ctx.fillRect(gx, gy, 12, 110);
    text(ctx, 'pressão', gx + 6, gy - 8, { size: 10, color: C.dim, align: 'center' });
    text(ctx, 'alta', gx - 4, gy + 10, { size: 10, color: C.dim, align: 'right' });
    text(ctx, 'baixa', gx - 4, gy + 108, { size: 10, color: C.dim, align: 'right' });
    if (o.cav) tag(ctx, '💥 cavitação: bolhas implodindo', 300, 56, C.bad);
    else if (!v.primed) tag(ctx, 'ar na carcaça: o rotor gira em falso', 300, 56, C.amber);
    else if (o.Q < 0.5) tag(ctx, heat > 0.5 ? '🔥 shutoff: a água esquenta' : 'shutoff: a água só gira', 300, 56, heat > 0.5 ? C.bad : C.amber);
  }

  function drawInstallation(ctx: CanvasRenderingContext2D, v: LabValues, o: Record<string, number>): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 8, 396, 504, 156, 10);
    ctx.fill();
    text(ctx, 'Instalação', 126, 414, { size: 12, bold: true });
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, AXIS_Y);
    ctx.lineTo(506, AXIS_Y);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'eixo da bomba', 500, AXIS_Y - 5, { size: 10, color: C.dim, align: 'right' });
    // tanque de sucção
    const level = AXIS_Y - v.zs * 7;
    ctx.fillStyle = v.temp >= 70 ? 'rgba(220,110,70,0.75)' : 'rgba(59,143,224,0.75)';
    ctx.fillRect(TANK.x, level, TANK.w, TANK.y + TANK.h - level);
    ctx.strokeStyle = C.metalLight;
    ctx.lineWidth = 3;
    ctx.strokeRect(TANK.x, TANK.y, TANK.w, TANK.h);
    ctx.strokeStyle = '#d6ecff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(TANK.x, level);
    ctx.lineTo(TANK.x + TANK.w, level);
    ctx.stroke();
    text(ctx, `${fmt(v.temp, 0)} °C`, TANK.x + TANK.w / 2, TANK.y + TANK.h - 8, { size: 11, align: 'center', bold: true, shadow: true });
    // cota zs
    const zx = TANK.x + TANK.w + 10;
    if (Math.abs(v.zs) > 0.01) arrow(ctx, zx, AXIS_Y, zx, level, C.amber, 1.5, 6);
    text(ctx, `zs = ${v.zs > 0 ? '+' : ''}${fmt(v.zs, 1)} m`, zx + 6, (AXIS_Y + level) / 2 + 4 - (Math.abs(v.zs) < 0.3 ? 12 : 0), { size: 11, color: C.amber, bold: true });
    text(ctx, v.zs > 0 ? '(afogada)' : v.zs < 0 ? '(sucção negativa)' : '', zx + 6, (AXIS_Y + level) / 2 + 17 - (Math.abs(v.zs) < 0.3 ? 12 : 0), { size: 9, color: C.dim });
    text(ctx, 'arraste o nível ↕', TANK.x + TANK.w / 2, TANK.y - 6, { size: 9, color: C.dim, align: 'center' });
    // tubulações (traço animado = vazão)
    const pipe = (pts: [number, number][]) => {
      ctx.lineJoin = 'round';
      ctx.strokeStyle = C.metalDark;
      ctx.lineWidth = 9;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.strokeStyle = v.primed ? C.water : '#7d8a98';
      ctx.lineWidth = 4;
      ctx.stroke();
      if (o.Q > 0.5) {
        ctx.strokeStyle = 'rgba(230,246,255,0.9)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 9]);
        ctx.lineDashOffset = dash;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };
    pipe([
      [TANK.x + TANK.w, 532],
      [212, 532],
      [212, AXIS_Y],
      [236, AXIS_Y],
    ]);
    pipe([
      [252, AXIS_Y - 16],
      [252, 440],
      [470, 440],
      [470, 404],
    ]);
    arrow(ctx, 470, 418, 470, 400, C.amber, 2, 7);
    text(ctx, `para o reservatório (Hest = ${PUMP.hStatic} m)`, 462, 432, { size: 10, color: C.dim, align: 'right' });
    // bomba
    ctx.fillStyle = heat > 0.3 ? `rgb(${Math.round(120 + 120 * heat)},80,70)` : C.metal;
    ctx.beginPath();
    ctx.arc(252, AXIS_Y, 17, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = C.metalDark;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.save();
    ctx.translate(252, AXIS_Y);
    ctx.rotate(rot);
    ctx.strokeStyle = '#2a3646';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.rotate(TAU / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
    }
    ctx.restore();
    // válvula
    const vx = 360;
    const vy = 440;
    ctx.fillStyle = C.metalLight;
    ctx.beginPath();
    ctx.moveTo(vx - 14, vy - 10);
    ctx.lineTo(vx + 14, vy + 10);
    ctx.lineTo(vx + 14, vy - 10);
    ctx.lineTo(vx - 14, vy + 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.metalDark;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.lineTo(vx, vy - 22);
    ctx.stroke();
    ctx.fillStyle = v.valve < 1 ? C.bad : C.good;
    ctx.fillRect(vx - 12, vy - 26, 24, 5);
    text(ctx, `válvula ${fmt(v.valve, 0)}%`, vx, vy + 26, { size: 11, align: 'center', color: C.text, bold: true });
    text(ctx, 'sucção', 150, 548, { size: 10, color: C.dim, align: 'center' });
  }

  function drawCharts(ctx: CanvasRenderingContext2D, v: LabValues, o: Record<string, number>): void {
    const r = v.rpm / PUMP.n0;
    const hq = new Chart(ctx, { x: 588, y: 44, w: 328, h: 226, x0: 0, x1: 200, y0: 0, y1: 80 });
    hq.frame('Curvas H × Q', 'Q (m³/h)', 'H (m)', [0, 50, 100, 150, 200], [0, 20, 40, 60, 80]);
    const head = (q: number) => pumpHead(q, r);
    const qEnd = Math.sqrt((r * r * PUMP.h0) / PUMP.a);
    if (Math.abs(r - 1) > 0.01) hq.fn((q) => pumpHead(q, 1), 'rgba(140,165,190,0.7)', 1.5, [5, 5], 0, Math.sqrt(PUMP.h0 / PUMP.a));
    hq.fn((q) => efficiency(q, r) * 80, C.curve3, 2, [], 0, qEnd);
    if (v.valve >= 1) hq.fn((q) => systemHead(q, v.valve), C.curve2, 2.5);
    hq.fn(head, v.primed ? C.curve1 : 'rgba(90,184,255,0.35)', 3, [], 0, qEnd);
    if (o.cav && o.drop > 1) hq.fn((q) => head(q) * (1 - o.drop / 100), C.bad, 2, [6, 4], 0, qEnd);
    const qb = bepFlow(r);
    hq.dot(qb, head(qb), C.curve3, 4);
    text(ctx, 'BEP', hq.X(qb) + 6, hq.Y(head(qb)) - 8, { size: 10, color: C.curve3, bold: true });
    hq.dot(o.Q, o.H, C.amber, 7);
    tag(ctx, `Q ${fmt(o.Q, 0)} · H ${fmt(o.H, 1)} m · η ${fmt(o.eta, 0)}%`, Math.min(hq.X(o.Q) + 4, 840), hq.Y(o.H) - 14, C.amber, 'left', 11);
    // eixo do rendimento (direita)
    for (const e of [0, 50, 100]) text(ctx, `${e}%`, hq.X(200) + 6, hq.Y(e * 0.8) + 4, { size: 10, color: C.curve3 });
    hq.legend([
      [`bomba (${fmt(v.rpm, 0)} rpm)`, C.curve1],
      ...(Math.abs(r - 1) > 0.01 ? ([['1.750 rpm', 'rgba(140,165,190,0.8)', [5, 5]]] as [string, string, number[]][]) : []),
      ['sistema', C.curve2],
      ['rendimento η', C.curve3],
    ], hq.X(122), hq.b.y + 14);

    const ns = new Chart(ctx, { x: 588, y: 352, w: 328, h: 150, x0: 0, x1: 200, y0: -4, y1: 16 });
    ns.frame('NPSH × Q', 'Q (m³/h)', 'NPSH (m)', [0, 50, 100, 150, 200], [-4, 0, 4, 8, 12, 16]);
    // faixa de cavitação (NPSHd < NPSHr)
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const q = (200 * i) / 60;
      const y = ns.Y(Math.max(-4, Math.min(16, npshRequired(q, r))));
      if (i) ctx.lineTo(ns.X(q), y);
      else ctx.moveTo(ns.X(q), y);
    }
    for (let i = 60; i >= 0; i--) {
      const q = (200 * i) / 60;
      ctx.lineTo(ns.X(q), ns.Y(Math.max(-4, Math.min(npshRequired(q, r), npshAvailable(q, v)))));
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,107,94,0.25)';
    ctx.fill();
    ctx.restore();
    ns.fn((q) => npshRequired(q, r), C.curve4, 2.5);
    ns.fn((q) => npshAvailable(q, v), C.curve1, 2.5);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ns.X(o.Q), ns.b.y);
    ctx.lineTo(ns.X(o.Q), ns.b.y + ns.b.h);
    ctx.stroke();
    ctx.setLineDash([]);
    ns.dot(o.Q, Math.max(-4, o.npshd), C.curve1, 5);
    ns.dot(o.Q, o.npshr, C.curve4, 5);
    ns.legend([
      ['NPSH disponível', C.curve1],
      ['NPSH requerido', C.curve4],
    ], ns.X(118), ns.b.y + 14);
    tag(ctx, `margem ${o.margin >= 0 ? '+' : ''}${fmt(o.margin, 2)} m`, ns.X(o.Q) + (o.Q > 140 ? -6 : 6), ns.Y(Math.max(-3, Math.min(14, (o.npshd + o.npshr) / 2))), o.margin < 0 ? C.bad : C.good, o.Q > 140 ? 'right' : 'left', 11);
  }

  return {
    reset() {
      parts.length = 0;
      bubbles.length = 0;
      pits.length = 0;
      flashes.length = 0;
      heat = 0;
    },
    draw(ctx, v, o, dt, time) {
      update(v, o, dt, time);
      drawCasing(ctx, v, o);
      drawImpeller(ctx);
      drawFlow(ctx, v);
      drawLabels(ctx, v, o);
      drawInstallation(ctx, v, o);
      drawCharts(ctx, v, o);
    },
    status(v, o) {
      if (!v.primed) return { tone: 'bad', text: '⛔ Sem escorva: a carcaça está cheia de ar e o rotor gira em falso — não há sucção. Escorve antes de partir.' };
      if (o.Q < 0.5) return { tone: 'warn', text: '⚠️ Shutoff (vazão zero): altura máxima e potência mínima. Bom para a partida, ruim por muito tempo — a água aquece.' };
      if (o.cav) return { tone: 'bad', text: `💥 Cavitação! NPSH disponível (${fmt(o.npshd, 2)} m) menor que o requerido (${fmt(o.npshr, 2)} m).` };
      if (o.margin < 0.5) return { tone: 'warn', text: `⚠️ No limite: margem de NPSH de apenas ${fmt(o.margin, 2)} m.` };
      if (Math.abs(o.Q - o.bep) / o.bep > 0.25) return { tone: 'warn', text: `↔️ Longe do ponto de melhor rendimento (η = ${fmt(o.eta, 0)}%).` };
      return { tone: 'ok', text: `✅ Operando bem, perto do BEP (η = ${fmt(o.eta, 0)}%).` };
    },
    pointer(kind, x, y) {
      const inTank = x >= TANK.x - 6 && x <= TANK.x + TANK.w + 6 && y >= TANK.y - 30 && y <= TANK.y + TANK.h + 6;
      if (kind === 'down') draggingTank = inTank;
      if (kind === 'up') draggingTank = false;
      if (!draggingTank) return null;
      return { zs: Math.round(((AXIS_Y - y) / 7) * 2) / 2 };
    },
    cursor(x, y) {
      return x >= TANK.x - 6 && x <= TANK.x + TANK.w + 6 && y >= TANK.y - 30 && y <= TANK.y + TANK.h + 6 ? 'ns-resize' : 'default';
    },
  };
}
