/**
 * Desenho da bancada do redutor (guincho): as engrenagens de frente, girando engrenadas (o motor atrás do pinhão e o
 * tambor à frente da última coroa, em perspectiva oblíqua), a carga subindo, a vista de cima com o torque em cada
 * trecho dos eixos, as barras de rotação × torque × potência e as contas. A animação roda em câmera lenta.
 */
import { gearState, MODULE, type GearState } from '../../learning/labs/gears';
import { approach, arrow, C, fmt, roundRect, tag, text } from './draw';
import type { LabView } from './views';

const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
const f2 = (x: number) => fmt(x, 2);
const f3 = (x: number) => fmt(x, 3);
const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

// ------------------------------------------------------------------ cena
const AREA = { x0: 26, x1: 516, y0: 140, y1: 430 };
const LOAD_BOTTOM = 540;
const MOTOR_OFF = { x: -34, y: -27 };
/** Direção do eixo de profundidade (para a frente) na perspectiva oblíqua. */
const DEPTH = { x: 0.78, y: 0.62 };
const PLAN = { x: 542, y: 12, w: 392, h: 256 };
const BARS = { x: 542, y: 280, w: 392, h: 266 };

/** Cores por eixo: motor, intermediário, tambor; e a engrenagem intermediária. */
const SHAFT = { m: '#5ab8ff', i: '#7ee08a', t: '#ffae42', idler: '#aab6c4' } as const;
const FILL = { m: '#5f8fbf', i: '#5e9f72', t: '#c98e3e', idler: '#7d8996' } as const;

type Role = keyof typeof SHAFT;

interface P {
  x: number;
  y: number;
}

interface GearDraw {
  c: P;
  z: number;
  rp: number;
  role: Role;
  ang: number;
  /** Pinhão do 2º par: mais claro, para destacar da coroa do mesmo eixo. */
  light?: boolean;
}

/** Posições (mm) dos centros: pinhão 1 na origem. */
function layoutMM(st: GearState): { g1: P; gi: P | null; g2: P; g4: P | null } {
  const r1 = st.D1 / 2;
  const r2 = st.D2 / 2;
  const ri = st.Di / 2;
  const g1 = { x: 0, y: 0 };
  let gi: P | null = null;
  let g2: P;
  if (st.idler) {
    const a = -42 * DEG;
    gi = { x: (r1 + ri) * Math.cos(a), y: (r1 + ri) * Math.sin(a) };
    g2 = { x: gi.x + (ri + r2) * Math.cos(-a), y: gi.y + (ri + r2) * Math.sin(-a) };
  } else g2 = { x: r1 + r2, y: 0 };
  let g4: P | null = null;
  if (st.two) {
    const c = -22 * DEG;
    const d = (st.D3 + st.D4) / 2;
    g4 = { x: g2.x + d * Math.cos(c), y: g2.y + d * Math.sin(c) };
  }
  return { g1, gi, g2, g4 };
}

/** O tambor fica à frente da última coroa, no mesmo eixo, afastado o bastante para não cobri-la (vista explodida). */
function drumOffset(st: GearState, s: number): P {
  const rOut = ((st.two ? st.D4 : st.D2) / 2 + MODULE) * s;
  const d = rOut + st.R * 1000 * s + 14;
  return { x: DEPTH.x * d, y: DEPTH.y * d };
}

/** Escala (px/mm) e deslocamento para caber na área, contando o motor atrás e o tambor à frente. */
function fit(st: GearState): { s: number; ox: number; oy: number } {
  const L = layoutMM(st);
  const out = st.two ? L.g4! : L.g2;
  const add = MODULE * 1.1;
  const circles: { c: P; r: number; off: P }[] = [
    { c: L.g1, r: st.D1 / 2 + add, off: { x: 0, y: 0 } },
    { c: L.g2, r: st.D2 / 2 + add, off: { x: 0, y: 0 } },
  ];
  if (L.gi) circles.push({ c: L.gi, r: st.Di / 2 + add, off: { x: 0, y: 0 } });
  if (L.g4) circles.push({ c: L.g4, r: st.D4 / 2 + add, off: { x: 0, y: 0 } });
  const bbox = (s: number) => {
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    const put = (x: number, y: number, r: number) => {
      x0 = Math.min(x0, x - r);
      x1 = Math.max(x1, x + r);
      y0 = Math.min(y0, y - r);
      y1 = Math.max(y1, y + r);
    };
    for (const q of circles) put(q.c.x * s + q.off.x, q.c.y * s + q.off.y, q.r * s);
    put(MOTOR_OFF.x, MOTOR_OFF.y, Math.max((st.D1 / 2 + 8) * s, 30) + 4);
    const dOff = drumOffset(st, s);
    put(out.x * s + dOff.x, out.y * s + dOff.y, st.R * 1000 * s + 6);
    // etiqueta do tambor, abaixo dele
    put(out.x * s + dOff.x, out.y * s + dOff.y + st.R * 1000 * s + 24, 4);
    return { x0, x1, y0, y1 };
  };
  const W = AREA.x1 - AREA.x0;
  const H = AREA.y1 - AREA.y0;
  let lo = 0.02;
  let hi = 1.1;
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    const b = bbox(mid);
    if (b.x1 - b.x0 <= W && b.y1 - b.y0 <= H) lo = mid;
    else hi = mid;
  }
  const b = bbox(lo);
  return { s: lo, ox: AREA.x0 + (W - (b.x1 - b.x0)) / 2 - b.x0, oy: AREA.y0 + (H - (b.y1 - b.y0)) / 2 - b.y0 };
}

function gearShape(ctx: CanvasRenderingContext2D, g: GearDraw, s: number): void {
  const m = MODULE * s;
  const rp = g.rp;
  const ra = rp + m * 0.95;
  const rf = Math.max(rp * 0.5, rp - m * 1.15);
  const pa = TAU / g.z;
  const prof: [number, number][] = [
    [-0.5, rf],
    [-0.27, rf],
    [-0.15, ra],
    [0.15, ra],
    [0.27, rf],
  ];
  ctx.beginPath();
  for (let k = 0; k < g.z; k++) {
    const a = g.ang + k * pa;
    prof.forEach(([t, r], i) => {
      const x = g.c.x + Math.cos(a + t * pa) * r;
      const y = g.c.y + Math.sin(a + t * pa) * r;
      if (k === 0 && i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
  }
  ctx.closePath();
  ctx.fillStyle = g.light ? '#93d4a6' : FILL[g.role];
  ctx.fill();
  ctx.strokeStyle = 'rgba(8,14,22,0.75)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // alma, furos de alívio, cubo e uma marca para ver o giro
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath();
  ctx.arc(g.c.x, g.c.y, rf * 0.84, 0, TAU);
  ctx.fill();
  if (rp > 30) {
    ctx.fillStyle = 'rgba(10,18,28,0.55)';
    for (let k = 0; k < 5; k++) {
      const a = g.ang + (k * TAU) / 5 + pa / 2;
      ctx.beginPath();
      ctx.arc(g.c.x + Math.cos(a) * rf * 0.55, g.c.y + Math.sin(a) * rf * 0.55, rf * 0.13, 0, TAU);
      ctx.fill();
    }
  }
  const hub = Math.max(4, rp * 0.24);
  ctx.fillStyle = '#d6dee8';
  ctx.beginPath();
  ctx.arc(g.c.x, g.c.y, hub, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = SHAFT[g.role];
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#1b2533';
  ctx.beginPath();
  ctx.arc(g.c.x, g.c.y, Math.max(2.2, hub * 0.45), 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(g.c.x + Math.cos(g.ang) * hub, g.c.y + Math.sin(g.ang) * hub);
  ctx.lineTo(g.c.x + Math.cos(g.ang) * rf * 0.8, g.c.y + Math.sin(g.ang) * rf * 0.8);
  ctx.stroke();
}

/** Seta curva em volta de uma engrenagem: +1 = horário. */
function spinArrow(ctx: CanvasRenderingContext2D, c: P, R: number, dir: number, color: string, at: number): void {
  const span = 0.9;
  const a0 = at - span / 2;
  const a1 = at + span / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c.x, c.y, R, a0, a1);
  ctx.stroke();
  const end = dir > 0 ? a1 : a0;
  const tx = -Math.sin(end) * dir;
  const ty = Math.cos(end) * dir;
  const ex = c.x + Math.cos(end) * R;
  const ey = c.y + Math.sin(end) * R;
  arrow(ctx, ex - tx * 6, ey - ty * 6, ex + tx * 3, ey + ty * 3, color, 2, 8);
}

export function gearsView(): LabView {
  let phi = 0;
  let lift = 0;
  let sS = 0;
  let oX = 0;
  let oY = 0;
  let lastLayout = '';

  // ---------------------------------------------------------------- contas
  function drawCalc(ctx: CanvasRenderingContext2D, st: GearState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 14, 12, 470, 112, 8);
    ctx.fill();
    let y = 32;
    const L = (s: string, color: string = C.text, bold = false) => {
      text(ctx, s, 26, y, { size: 11.5, color, bold });
      y += 18;
    };
    L('Relação de transmissão (n saída/n entrada)', C.amber, true);
    L(`i₁ = z₁/z₂ = ${st.z1}/${st.z2} = ${f3(st.i1)}`);
    if (st.two) L(`i₂ = z₃/z₄ = ${st.z3}/${st.z4} = ${f3(st.i2)}`);
    else if (st.idler) L('intermediária: só inverte o sentido', C.dim);
    L(`i = ${st.two ? 'i₁·i₂' : 'i₁'} = ${fmt(st.i, 4)} → redução ${f2(1 / st.i)} : 1`);
    L(`n tambor = n motor·i = ${f1(st.nt)} rpm`, C.dim);
    y = 32;
    const R = (s: string, color: string = C.text, bold = false) => {
      text(ctx, s, 300, y, { size: 11.5, color, bold });
      y += 18;
    };
    const etaTxt = st.eta < 0.9999 ? `/η${st.meshes > 1 ? (st.meshes === 2 ? '²' : '³') : ''}` : '';
    R('Torque e potência (g = 10 m/s²)', C.amber, true);
    R(`T tambor = m·g·R = ${f0(st.Tt)} N·m`);
    R(`T motor = T tambor·i${etaTxt} = ${f2(st.Tm)} N·m`);
    R(`P = T·ω = ${f2(st.Pout / 1000)} kW na carga`);
    R(`v carga = ω·R = ${f2(st.v)} m/s`, C.dim);
  }

  // ---------------------------------------------------------------- engrenagens, tambor e carga
  function drawScene(ctx: CanvasRenderingContext2D, st: GearState, dt: number): void {
    const target = fit(st);
    const key = [st.z1, st.z2, st.z3, st.z4, st.zi, st.idler, st.two, st.R.toFixed(3)].join('|');
    if (!lastLayout) {
      sS = target.s;
      oX = target.ox;
      oY = target.oy;
    } else {
      sS = approach(sS, target.s, dt, 6);
      oX = approach(oX, target.ox, dt, 6);
      oY = approach(oY, target.oy, dt, 6);
    }
    lastLayout = key;
    const s = sS;
    const L = layoutMM(st);
    const px = (q: P): P => ({ x: oX + q.x * s, y: oY + q.y * s });
    // câmera lenta: o motor aparece a no máximo 40 rpm
    const slow = Math.max(1, st.n1 / 40);
    phi += ((st.n1 / slow) * TAU * dt) / 60;
    phi %= TAU * 3600;

    // fases: cada par engrenado gira ao contrário, na razão dos dentes, com dente encaixando no vão
    const mesh = (a: GearDraw, cB: P, zB: number): number => {
      const gamma = Math.atan2(cB.y - a.c.y, cB.x - a.c.x);
      return gamma + Math.PI + Math.PI / zB - (a.ang - gamma) * (a.z / zB);
    };
    const c1 = px(L.g1);
    const g1: GearDraw = { c: c1, z: st.z1, rp: (st.D1 / 2) * s, role: 'm', ang: phi };
    const gears: GearDraw[] = [];
    let prev = g1;
    let gI: GearDraw | null = null;
    if (L.gi) {
      const ci = px(L.gi);
      gI = { c: ci, z: st.zi, rp: (st.Di / 2) * s, role: 'idler', ang: mesh(g1, ci, st.zi) };
      prev = gI;
    }
    const c2 = px(L.g2);
    const g2: GearDraw = { c: c2, z: st.z2, rp: (st.D2 / 2) * s, role: st.two ? 'i' : 't', ang: mesh(prev, c2, st.z2) };
    let g3: GearDraw | null = null;
    let g4: GearDraw | null = null;
    if (st.two && L.g4) {
      g3 = { c: c2, z: st.z3, rp: (st.D3 / 2) * s, role: 'i', ang: g2.ang, light: true };
      const c4 = px(L.g4);
      g4 = { c: c4, z: st.z4, rp: (st.D4 / 2) * s, role: 't', ang: mesh(g3, c4, st.z4) };
    }

    // motor (atrás do pinhão)
    const mc = { x: c1.x + MOTOR_OFF.x, y: c1.y + MOTOR_OFF.y };
    const mh = Math.max((st.D1 / 2 + 8) * s, 30);
    ctx.fillStyle = '#27466b';
    roundRect(ctx, mc.x - mh, mc.y - mh, mh * 2, mh * 2, 8);
    ctx.fill();
    ctx.strokeStyle = '#3d6fb0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(120,170,230,0.35)';
    ctx.lineWidth = 1.5;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(mc.x - mh + 6, mc.y + k * mh * 0.32);
      ctx.lineTo(mc.x + mh - 6, mc.y + k * mh * 0.32);
      ctx.stroke();
    }
    text(ctx, 'MOTOR', mc.x - mh + 4, mc.y - mh - 6, { size: 11, bold: true, color: SHAFT.m });
    ctx.strokeStyle = C.metalLight;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(mc.x, mc.y);
    ctx.lineTo(c1.x, c1.y);
    ctx.stroke();

    gears.push(g1);
    if (gI) gears.push(gI);
    gears.push(g2);
    if (g3) gears.push(g3);
    if (g4) gears.push(g4);
    for (const g of gears) gearShape(ctx, g, s);

    // tambor (à frente da última coroa) e carga
    const out = g4 ?? g2;
    const dOff = drumOffset(st, s);
    const dc = { x: out.c.x + dOff.x, y: out.c.y + dOff.y };
    const Rd = st.R * 1000 * s;
    ctx.strokeStyle = C.metalLight;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(out.c.x, out.c.y);
    ctx.lineTo(dc.x, dc.y);
    ctx.stroke();
    ctx.strokeStyle = '#4a5a6e';
    ctx.lineWidth = 1;
    ctx.stroke();
    const angT = out.ang;
    ctx.fillStyle = '#5a4632';
    ctx.beginPath();
    ctx.arc(dc.x, dc.y, Rd + 4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#8a6a48';
    ctx.beginPath();
    ctx.arc(dc.x, dc.y, Rd, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,26,14,0.8)';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 6; k++) {
      const a = angT + (k * TAU) / 6;
      ctx.beginPath();
      ctx.moveTo(dc.x + Math.cos(a) * Rd * 0.3, dc.y + Math.sin(a) * Rd * 0.3);
      ctx.lineTo(dc.x + Math.cos(a) * Rd * 0.92, dc.y + Math.sin(a) * Rd * 0.92);
      ctx.stroke();
    }
    ctx.fillStyle = '#d6dee8';
    ctx.beginPath();
    ctx.arc(dc.x, dc.y, Math.max(4, Rd * 0.22), 0, TAU);
    ctx.fill();
    // o cabo sai do lado que sobe: tambor horário → lado esquerdo sobe
    const side = st.dirT > 0 ? -1 : 1;
    const ropeX = dc.x + side * Rd;
    const yTop = dc.y + Rd + 26;
    const loadH = 34;
    const yBot = LOAD_BOTTOM - loadH;
    const travel = Math.max(10, yBot - yTop);
    const vPx = (st.v * 1000 * s) / slow;
    lift += vPx * dt;
    if (lift > travel) lift = 0;
    const ly = yBot - lift;
    ctx.strokeStyle = '#d8c7a5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ropeX, dc.y);
    ctx.lineTo(ropeX, ly);
    ctx.stroke();
    const lw = 58;
    ctx.fillStyle = '#6b737a';
    roundRect(ctx, ropeX - lw / 2, ly, lw, loadH, 3);
    ctx.fill();
    ctx.strokeStyle = '#2b3138';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, `${f0(st.mass)} kg`, ropeX, ly + loadH / 2 + 4, { size: 11.5, bold: true, align: 'center', color: '#f2f5f8' });
    if (st.v > 0) arrow(ctx, ropeX + side * (lw / 2 + 12), ly + loadH, ropeX + side * (lw / 2 + 12), ly + 4, C.good, 2, 8);
    tag(ctx, `v = ${f2(st.v)} m/s`, ropeX + side * (lw / 2 + 18), ly + loadH / 2 + 4, C.good, side > 0 ? 'left' : 'right', 11);

    // sentidos de giro e leituras de cada eixo
    spinArrow(ctx, c1, g1.rp + MODULE * s + 8, 1, SHAFT.m, -Math.PI / 2 - 0.9);
    if (gI) spinArrow(ctx, gI.c, gI.rp + MODULE * s + 8, -1, SHAFT.idler, -Math.PI / 2);
    spinArrow(ctx, c2, g2.rp + MODULE * s + 8, st.dir2, SHAFT[g2.role], Math.PI / 2 + 0.5);
    if (g4) spinArrow(ctx, g4.c, g4.rp + MODULE * s + 8, st.dirT, SHAFT.t, -Math.PI / 2);
    tag(ctx, `${f0(st.n1)} rpm · ${f1(st.Tm)} N·m`, mc.x - mh + 2, mc.y + mh + 16, SHAFT.m, 'left', 11);
    if (gI) tag(ctx, `${f0(st.nId)} rpm · T = 0`, gI.c.x, gI.c.y - gI.rp - MODULE * s - 18, SHAFT.idler, 'center', 11);
    if (st.two) tag(ctx, `${f0(st.ni)} rpm · ${f1(st.Ti)} N·m`, c2.x, c2.y + g2.rp + MODULE * s + 22, SHAFT.i, 'center', 11);
    const tagX = Math.min(AREA.x1 - 4, Math.max(AREA.x0 + 150, dc.x + 75));
    tag(ctx, `tambor: ${f1(st.nt)} rpm · ${f0(st.Tt)} N·m`, tagX, dc.y + Rd + 22, SHAFT.t, 'right', 11);
    if (slow > 1.05) text(ctx, `câmera lenta ${f0(slow)}×`, AREA.x0, 548, { size: 10.5, color: C.dim });
  }

  // ---------------------------------------------------------------- vista de cima com os trechos de torque
  function drawPlan(ctx: CanvasRenderingContext2D, st: GearState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, PLAN.x, PLAN.y, PLAN.w, PLAN.h, 8);
    ctx.fill();
    text(ctx, 'Vista de cima: torque em cada trecho', PLAN.x + 14, PLAN.y + 22, { size: 13, bold: true });
    const xM = PLAN.x + 32;
    const xA = PLAN.x + 140;
    const xB = PLAN.x + 262;
    const xD = PLAN.x + 346;
    const rows = st.two ? [PLAN.y + 70, PLAN.y + 132, PLAN.y + 194] : [PLAN.y + 82, PLAN.y + 178];
    const y1 = rows[0];
    const y2 = rows[1];
    const yOut = rows[rows.length - 1];
    const Tmax = Math.max(st.Tm, st.Ti, st.Tt, 1e-9);
    const seg = (xa: number, xb: number, y: number, T: number, color: string, label: boolean) => {
      const loaded = T > 1e-9;
      ctx.strokeStyle = loaded ? color : '#4a5b70';
      ctx.lineWidth = loaded ? 3 + 9 * Math.sqrt(T / Tmax) : 2.5;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(xa, y);
      ctx.lineTo(xb, y);
      ctx.stroke();
      if (label && loaded) text(ctx, `T = ${f1(T)} N·m`, (xa + xb) / 2, y - 12, { size: 11, bold: true, align: 'center', color, shadow: true });
    };
    const bearing = (x: number, y: number) => {
      ctx.fillStyle = '#2a3646';
      ctx.fillRect(x - 5, y - 9, 10, 18);
      ctx.strokeStyle = '#56616e';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 5, y - 9, 10, 18);
    };
    const gearRect = (x: number, y: number, h: number, role: Role) => {
      ctx.fillStyle = FILL[role];
      ctx.fillRect(x - 7, y - h / 2, 14, h);
      ctx.strokeStyle = 'rgba(8,14,22,0.8)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x - 7, y - h / 2, 14, h);
      for (let yy = y - h / 2 + 3; yy < y + h / 2 - 1; yy += 4) {
        ctx.strokeStyle = 'rgba(8,14,22,0.35)';
        ctx.beginPath();
        ctx.moveTo(x - 7, yy);
        ctx.lineTo(x + 7, yy);
        ctx.stroke();
      }
    };
    // 1º par (com a intermediária, três engrenagens em linha), alturas em escala dentro do par
    const k1 = (2 * (y2 - y1)) / (st.D1 + st.D2 + (st.idler ? 2 * st.Di : 0));
    const yI = y1 + (k1 * (st.D1 + st.Di)) / 2;
    // eixo do motor
    seg(xM + 18, xA, y1, st.Tm, SHAFT.m, true);
    seg(xA, xA + 34, y1, 0, SHAFT.m, false);
    bearing(xA + 34, y1);
    ctx.fillStyle = '#27466b';
    roundRect(ctx, xM - 18, y1 - 20, 36, 40, 5);
    ctx.fill();
    ctx.strokeStyle = SHAFT.m;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, 'M', xM, y1 + 5, { size: 13, bold: true, align: 'center', color: SHAFT.m });
    // intermediária: eixo próprio, sem torque
    if (st.idler) {
      seg(xA - 30, xA + 30, yI, 0, SHAFT.idler, false);
      bearing(xA - 30, yI);
      bearing(xA + 30, yI);
      text(ctx, 'T = 0', xA + 38, yI + 4, { size: 10.5, color: C.dim });
    }
    if (st.two) {
      seg(xA - 34, xA, y2, 0, SHAFT.i, false);
      seg(xA, xB, y2, st.Ti, SHAFT.i, true);
      seg(xB, xB + 34, y2, 0, SHAFT.i, false);
      bearing(xA - 34, y2);
      bearing(xB + 34, y2);
      seg(xB - 34, xB, yOut, 0, SHAFT.t, false);
      seg(xB, xD, yOut, st.Tt, SHAFT.t, true);
      bearing(xB - 34, yOut);
    } else {
      seg(xA - 34, xA, yOut, 0, SHAFT.t, false);
      seg(xA, xD, yOut, st.Tt, SHAFT.t, true);
      bearing(xA - 34, yOut);
    }
    // engrenagens
    gearRect(xA, y1, k1 * st.D1, 'm');
    if (st.idler) gearRect(xA, yI, k1 * st.Di, 'idler');
    gearRect(xA, y2, k1 * st.D2, st.two ? 'i' : 't');
    if (st.two) {
      const k2 = (2 * (yOut - y2)) / (st.D3 + st.D4);
      gearRect(xB, y2, k2 * st.D3, 'i');
      gearRect(xB, yOut, k2 * st.D4, 't');
    }
    // tambor
    ctx.fillStyle = '#8a6a48';
    ctx.fillRect(xD - 4, yOut - 22, 30, 44);
    ctx.strokeStyle = '#5a4632';
    ctx.lineWidth = 2;
    ctx.strokeRect(xD - 4, yOut - 22, 30, 44);
    for (let yy = yOut - 18; yy < yOut + 20; yy += 5) {
      ctx.strokeStyle = 'rgba(216,199,165,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xD - 4, yy);
      ctx.lineTo(xD + 26, yy + 2);
      ctx.stroke();
    }
    text(ctx, 'tambor', xD + 11, yOut + 38, { size: 10.5, color: SHAFT.t, align: 'center' });
    text(ctx, 'Trecho grosso = transmite torque. Fora dele, T = 0.', PLAN.x + 14, PLAN.y + PLAN.h - 12, { size: 11, color: C.dim });
  }

  // ---------------------------------------------------------------- barras: rotação × torque × potência
  function drawBars(ctx: CanvasRenderingContext2D, st: GearState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, BARS.x, BARS.y, BARS.w, BARS.h, 8);
    ctx.fill();
    text(ctx, 'Rotação, torque e potência', BARS.x + 14, BARS.y + 22, { size: 13, bold: true });
    const wOf = (n: number) => (n * TAU) / 60;
    const groups: { name: string; n: number; T: number; color: string }[] = [{ name: 'motor', n: st.n1, T: st.Tm, color: SHAFT.m }];
    if (st.two) groups.push({ name: 'eixo 2', n: st.ni, T: st.Ti, color: SHAFT.i });
    groups.push({ name: 'tambor', n: st.nt, T: st.Tt, color: SHAFT.t });
    const nMax = Math.max(...groups.map((g) => g.n), 1e-9);
    const TMax = Math.max(...groups.map((g) => g.T), 1e-9);
    const base = BARS.y + 196;
    const hMax = 132;
    const gw = (BARS.w - 40) / groups.length;
    groups.forEach((g, i) => {
      const x0 = BARS.x + 24 + i * gw;
      const bw = Math.min(40, gw / 3);
      const hn = (g.n / nMax) * hMax;
      const hT = (g.T / TMax) * hMax;
      ctx.fillStyle = C.curve1;
      ctx.fillRect(x0 + gw / 2 - bw - 3, base - hn, bw, hn);
      ctx.fillStyle = C.curve2;
      ctx.fillRect(x0 + gw / 2 + 3, base - hT, bw, hT);
      text(ctx, `${f0(g.n)}`, x0 + gw / 2 - bw / 2 - 3, base - hn - 5, { size: 10.5, align: 'center', color: C.curve1, bold: true });
      text(ctx, `${f1(g.T)}`, x0 + gw / 2 + bw / 2 + 3, base - hT - 5, { size: 10.5, align: 'center', color: C.curve2, bold: true });
      text(ctx, g.name, x0 + gw / 2, base + 16, { size: 12, bold: true, align: 'center', color: g.color });
      text(ctx, `P = ${f2((g.T * wOf(g.n)) / 1000)} kW`, x0 + gw / 2, base + 32, { size: 11, align: 'center', color: C.text });
    });
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(BARS.x + 16, base);
    ctx.lineTo(BARS.x + BARS.w - 16, base);
    ctx.stroke();
    // legenda
    ctx.fillStyle = C.curve1;
    ctx.fillRect(BARS.x + BARS.w - 170, BARS.y + 13, 10, 10);
    text(ctx, 'rpm', BARS.x + BARS.w - 155, BARS.y + 22, { size: 11, color: C.text });
    ctx.fillStyle = C.curve2;
    ctx.fillRect(BARS.x + BARS.w - 116, BARS.y + 13, 10, 10);
    text(ctx, 'torque (N·m)', BARS.x + BARS.w - 101, BARS.y + 22, { size: 11, color: C.text });
    const note =
      st.eta < 0.9999
        ? `Cada engrenamento perde ${f0((1 - st.eta) * 100)} %: a potência cai de eixo em eixo.`
        : 'Sem perdas: P = T·ω é a mesma em todos os eixos.';
    text(ctx, note, BARS.x + 14, BARS.y + BARS.h - 14, { size: 11, color: C.dim });
  }

  return {
    reset() {
      phi = 0;
      lift = 0;
      lastLayout = '';
    },
    draw(ctx, v, _o, dt) {
      const st = gearState(v);
      const d = Math.min(dt, 0.05);
      drawCalc(ctx, st);
      drawScene(ctx, st, d);
      drawPlan(ctx, st);
      drawBars(ctx, st);
    },
    status(v) {
      const st = gearState(v);
      if (st.mass === 0) return { tone: 'ok', text: 'Sem carga no cabo: o torque em todos os eixos é zero (num redutor real, sobraria só o atrito).' };
      if (st.n1 === 0) return { tone: 'warn', text: `Motor parado: para segurar a carga ele ainda precisa de ${f2(st.Tm)} N·m (ou de um freio). Torque não depende da rotação; a potência, sim.` };
      if (st.taut > 120) return { tone: 'bad', text: `O eixo do tambor (o de maior torque) está com τ = ${f0(st.taut)} MPa: aumente o diâmetro — τ = 16·T/(π·d³) cai com d³.` };
      if (st.idler) return { tone: 'ok', text: `A intermediária inverteu o sentido do tambor (o cabo passa a sair do outro lado), mas a relação continua z₁/z₂ = ${f3(st.i1)}. Ela gira a ${f0(st.nId)} rpm, e o eixo dela não transmite torque.` };
      if (st.i > 1.0001) return { tone: 'warn', text: `Multiplicador (i = ${f2(st.i)} > 1): o tambor gira mais rápido que o motor e recebe ${f2(st.i)} vezes menos torque.` };
      if (st.eta < 0.9999) return { tone: 'warn', text: `Com perdas: só ${f0(st.etaTot * 100)} % da potência do motor chega à carga. Sem perdas o motor faria ${f2(st.Tt * st.i)} N·m; precisa de ${f2(st.Tm)} N·m.` };
      return { tone: 'ok', text: `Redução ${f2(1 / st.i)} : 1: o tambor gira ${f2(1 / st.i)} vezes mais devagar que o motor e recebe ${f2(1 / st.i)} vezes o torque. A potência P = T·ω é a mesma em todos os eixos.` };
    },
  };
}
