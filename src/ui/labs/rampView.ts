/**
 * Desenho da bancada da rampa: a rampa com o corpo e o diagrama de corpo livre (peso e componentes, normal, atrito,
 * força F e aceleração), o gráfico atrito × F (caixa) ou aceleração × inclinação (corpos que rolam), a corrida dos
 * quatro corpos soltos juntos e as contas. A rampa sobe para a direita; "rampa acima" é o sentido da força F.
 */
import { G, RAMP_L, rampState, releaseOf, REST, ROLL, ROLL_SLIP, SHAPES, SLIDE, type RampState } from '../../learning/labs/ramp';
import type { LabValues } from '../../learning/types';
import { approach, arrow, C, Chart, fmt, marker, niceAxis, roundRect, tag, text, ticksOf } from './draw';
import type { LabView } from './views';

const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
const f2 = (x: number) => fmt(x, 2);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const DEG = Math.PI / 180;

// ------------------------------------------------------------------ cena
const PIV = { x: 46, y: 498 };
const LPX = 410;
const BOX = { w: 80, h: 50 };
const THMAX = 60;
const rPx = (r: number) => 12 + 64 * r;

const CH = { x: 590, y: 52, w: 326, h: 158 };
const RACE = { x: 542, y: 284, w: 392, h: 262 };
const TRACK = { x0: 640, x1: 868 };

const SHAPE_COLOR = ['#d39b5c', C.curve2, C.curve1, C.curve3];
const FORCE = { P: '#ff8a7a', N: '#7ec8ff', f: '#ffc94d', F: '#c79bff', a: '#7ee08a' } as const;
const FSTEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];

interface Geom {
  th: number;
  u: { x: number; y: number };
  n: { x: number; y: number };
  top: { x: number; y: number };
}

/** u = direção rampa acima; n = normal para fora da superfície. */
function geom(thetaDeg: number): Geom {
  const th = thetaDeg * DEG;
  const u = { x: Math.cos(th), y: -Math.sin(th) };
  const n = { x: -Math.sin(th), y: -Math.cos(th) };
  return { th, u, n, top: { x: PIV.x + LPX * u.x, y: PIV.y + LPX * u.y } };
}

function dashArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string): void {
  if (Math.hypot(x2 - x1, y2 - y1) < 6) return;
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.setLineDash([5, 4]);
  arrow(ctx, x1, y1, x2, y2, color, 1.6, 7);
  ctx.restore();
}

function forceArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string): void {
  if (Math.hypot(x2 - x1, y2 - y1) < 4) return;
  // contorno escuro para destacar sobre o corpo
  arrow(ctx, x1, y1, x2, y2, 'rgba(8,14,22,0.85)', 6, 12);
  arrow(ctx, x1, y1, x2, y2, color, 3, 10);
}

const dirWord = (st: RampState) => (st.dir === 0 ? '' : st.theta < 0.5 ? (st.dir < 0 ? 'no sentido de F' : '') : st.dir < 0 ? 'rampa acima' : 'rampa abaixo');

/** Desenha um corpo (caixa ou que rola) centrado em (0, 0), já girado. */
function shapeIcon(ctx: CanvasRenderingContext2D, body: number, R: number, phi: number, color: string, dim = false): void {
  ctx.save();
  ctx.rotate(phi);
  ctx.globalAlpha = dim ? 0.55 : 1;
  if (body === 0) {
    const w = R * 2.6;
    const h = R * 1.7;
    ctx.fillStyle = color;
    roundRect(ctx, -w / 2, -h / 2, w, h, 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,24,10,0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (body === 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2.5, R * 0.22);
    ctx.beginPath();
    ctx.arc(0, 0, R - ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, R - ctx.lineWidth / 2, -0.35, 0.35);
    ctx.stroke();
  } else if (body === 2) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,20,35,0.6)';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * R * 0.85, Math.sin(a) * R * 0.85);
      ctx.stroke();
    }
    ctx.fillStyle = '#e8f1fb';
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1.5, R * 0.12), 0, Math.PI * 2);
    ctx.fill();
  } else {
    const gr = ctx.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
    gr.addColorStop(0, '#d9ffe0');
    gr.addColorStop(0.45, color);
    gr.addColorStop(1, '#2c6b3a');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,30,15,0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 0.35, R * 0.95, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function rampView(): LabView {
  // movimento do corpo na rampa
  let lastKey = '';
  let runT = 0;
  let hold = 0.4;
  let endHold = 0;
  let dist = 0;
  let speed = 1;
  // corrida
  let raceKey = '';
  let raceT = 0;
  // escalas suavizadas
  let fScale = 0;
  let xTop = 0;
  let yTop = 0;
  let dragging: 'top' | 'chart' | null = null;

  function restart(): void {
    runT = 0;
    hold = 0.4;
    endHold = 0;
    dist = 0;
  }

  function update(st: RampState, dt: number): void {
    const key = [st.body, st.theta.toFixed(2), st.regime, st.dir, st.a.toFixed(4), st.r.toFixed(3)].join('|');
    if (key !== lastKey) {
      lastKey = key;
      restart();
    }
    if (st.a <= 0) return;
    const tTot = Math.sqrt((2 * RAMP_L) / st.a);
    speed = tTot > 6 ? tTot / 6 : 1;
    if (hold > 0) {
      hold -= dt;
      return;
    }
    if (dist >= RAMP_L) {
      endHold += dt;
      if (endHold > 0.9) restart();
      return;
    }
    runT += dt * speed;
    dist = Math.min(RAMP_L, 0.5 * st.a * runT * runT);
  }

  // ---------------------------------------------------------------- contas
  function drawCalc(ctx: CanvasRenderingContext2D, st: RampState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 14, 12, 470, 112, 8);
    ctx.fill();
    let y = 32;
    const L = (s: string, color: string = C.text, bold = false) => {
      text(ctx, s, 26, y, { size: 11.5, color, bold });
      y += 18;
    };
    if (!st.rolling) {
      L(`Caixa (g = ${f0(G)} m/s²)`, C.amber, true);
      L(`P = m·g = ${f0(st.P)} N`);
      L(`N = P·cos θ = ${f1(st.N)} N`);
      L(`P∥ = P·sen θ = ${f1(st.Pt)} N`);
      L(`fat,máx = μe·N = ${f1(st.fmax)} N`, C.dim);
    } else {
      const sh = st.shape;
      L(`${sh.name}: ${sh.inertia}`, C.amber, true);
      L(`β = I/(m·r²) = ${fmt(sh.beta, 1)}`);
      L(`fat p/ rolar = P∥·β/(1+β) = ${f1(st.fneed)} N`);
      L(`fat,máx = μe·N = ${f1(st.fmax)} N`);
      L(`limite: tg θ = μe(1+β)/β → ${f1(st.thLim)}°`, C.dim);
    }
    y = 32;
    const R = (s: string, color: string = C.text, bold = false) => {
      text(ctx, s, 268, y, { size: 11.5, color, bold });
      y += 18;
    };
    if (!st.rolling) {
      if (st.regime === REST) {
        R('Parada: atrito estático', C.amber, true);
        R(`F − P∥ = ${f1(st.F - st.Pt)} N`);
        R('|F − P∥| ≤ fat,máx → não desliza');
        R(`fat = ${f1(st.f)} N (só o necessário)`);
        R('a = 0', C.dim);
      } else {
        R('Desliza: atrito cinético', C.amber, true);
        R(`|F − P∥| = ${f1(st.fneed)} N > fat,máx`);
        R(`fat = μc·N = ${f1(st.f)} N`);
        R('a = (|F − P∥| − fat)/m');
        R(`a = ${f2(st.a)} m/s² ${dirWord(st)}`, C.dim);
      }
    } else if (st.regime === ROLL) {
      R('Rola sem deslizar', C.amber, true);
      R(`a = g·sen θ/(1+β) = ${f2(st.a)} m/s²`);
      R(`α = a/r = ${f2(st.alpha)} rad/s²`);
      R('atrito estático: não dissipa');
      R(`Ec na rotação = β/(1+β) = ${f0(st.erot * 100)} %`, C.dim);
    } else if (st.regime === ROLL_SLIP) {
      R('Rola e escorrega', C.amber, true);
      R(`a = g(sen θ − μc·cos θ) = ${f2(st.a)} m/s²`);
      R(`fat = μc·N = ${f1(st.f)} N`);
      R(`α = fat·r/I = ${f2(st.alpha)} rad/s²`);
      R('α·r < a: gira menos do que anda', C.dim);
    } else {
      R('Parado', C.amber, true);
      R('piso plano: nada empurra o corpo');
      R('fat = 0 e a = 0');
    }
  }

  // ---------------------------------------------------------------- rampa, corpo e forças
  function drawScene(ctx: CanvasRenderingContext2D, st: RampState, dt: number): void {
    const g = geom(st.theta);
    // piso
    ctx.fillStyle = '#16283b';
    ctx.fillRect(14, PIV.y, 512, 548 - PIV.y);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, PIV.y);
    ctx.lineTo(526, PIV.y);
    ctx.stroke();
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    for (let x = 20; x < 526; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, PIV.y + 2);
      ctx.lineTo(x - 8, PIV.y + 12);
      ctx.stroke();
    }
    // rampa
    if (st.theta > 0.2) {
      ctx.fillStyle = '#34495f';
      ctx.beginPath();
      ctx.moveTo(PIV.x, PIV.y);
      ctx.lineTo(g.top.x, PIV.y);
      ctx.lineTo(g.top.x, g.top.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#4c6580';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.strokeStyle = C.metalLight;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(PIV.x, PIV.y);
    ctx.lineTo(g.top.x, g.top.y);
    ctx.stroke();
    // ângulo
    if (st.theta > 0.2) {
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(PIV.x, PIV.y, 60, -g.th, 0);
      ctx.stroke();
      const am = g.th / 2;
      text(ctx, `θ = ${f0(st.theta)}°`, PIV.x + 70 * Math.cos(am) + 4, PIV.y - 70 * Math.sin(am) + 4, { size: 12, color: C.amber, bold: true });
    } else text(ctx, 'piso plano (θ = 0°)', PIV.x + 6, PIV.y + 20, { size: 11.5, color: C.amber, bold: true });
    // alça para arrastar a inclinação
    ctx.fillStyle = C.amber;
    ctx.strokeStyle = '#0b1420';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(g.top.x, g.top.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (!dragging) text(ctx, 'arraste', g.top.x + 10, g.top.y - 8, { size: 10.5, color: C.dim });

    // posição do corpo ao longo da rampa (px a partir da base)
    const R = st.rolling ? rPx(st.r) : BOX.h / 2;
    const half = st.rolling ? R : BOX.w / 2;
    const margin = half + 6;
    const track = LPX - 2 * margin;
    const pxm = track / RAMP_L;
    let s: number;
    if (st.dir > 0) s = LPX - margin - dist * pxm;
    else if (st.dir < 0) s = margin + dist * pxm;
    else s = LPX * 0.56;
    const contact = { x: PIV.x + g.u.x * s, y: PIV.y + g.u.y * s };
    const c = { x: contact.x + g.n.x * R, y: contact.y + g.n.y * R };
    ctx.save();
    ctx.translate(c.x, c.y);
    if (!st.rolling) {
      ctx.rotate(-g.th);
      ctx.fillStyle = SHAPE_COLOR[0];
      roundRect(ctx, -BOX.w / 2, -BOX.h / 2, BOX.w, BOX.h, 3);
      ctx.fill();
      ctx.strokeStyle = '#6b4626';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(107,70,38,0.7)';
      ctx.lineWidth = 1.2;
      for (const yy of [-BOX.h / 6, BOX.h / 6]) {
        ctx.beginPath();
        ctx.moveTo(-BOX.w / 2 + 3, yy);
        ctx.lineTo(BOX.w / 2 - 3, yy);
        ctx.stroke();
      }
      text(ctx, `${f0(st.m)} kg`, 0, 5, { size: 12, bold: true, align: 'center', color: '#2b1a0c' });
      // corda da força F
      if (st.F > 0) {
        ctx.strokeStyle = '#d8c7a5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(BOX.w / 2, 0);
        ctx.lineTo(BOX.w / 2 + 10, 0);
        ctx.stroke();
      }
    } else {
      // rolando rampa abaixo (para a esquerda) o corpo gira no sentido anti-horário
      const phi = -(st.spin * dist * pxm) / R;
      shapeIcon(ctx, st.body, R, phi, SHAPE_COLOR[st.body]);
    }
    ctx.restore();

    // ------------------------------------------------ diagrama de corpo livre
    const fmaxDraw = Math.max(st.P, st.F, 1e-9);
    const kT = 118 / fmaxDraw;
    fScale = fScale > 0 ? approach(fScale, kT, dt, 6) : kT;
    const k = fScale;
    // peso e componentes
    const pTip = { x: c.x, y: c.y + st.P * k };
    if (st.theta > 0.5) {
      dashArrow(ctx, c.x, c.y, c.x - g.u.x * st.Pt * k, c.y - g.u.y * st.Pt * k, FORCE.P);
      dashArrow(ctx, c.x, c.y, c.x - g.n.x * st.N * k, c.y - g.n.y * st.N * k, FORCE.P);
      const tipT = { x: c.x - g.u.x * st.Pt * k, y: c.y - g.u.y * st.Pt * k };
      if (st.Pt * k > 24) text(ctx, 'P·sen θ', tipT.x - 6, tipT.y - 6, { size: 10.5, color: FORCE.P, align: 'right', shadow: true });
      const tipN = { x: c.x - g.n.x * st.N * k, y: c.y - g.n.y * st.N * k };
      if (st.N * k > 24) text(ctx, 'P·cos θ', tipN.x + 6, tipN.y + 12, { size: 10.5, color: FORCE.P, shadow: true });
    }
    forceArrow(ctx, c.x, c.y, pTip.x, pTip.y, FORCE.P);
    tag(ctx, `P = ${f0(st.P)} N`, pTip.x + 8, pTip.y + 4, FORCE.P, 'left', 11);
    // normal: sai do ponto de contato, um pouco deslocada rampa acima para não cobrir o peso
    const nOff = st.rolling ? 0 : BOX.w * 0.24;
    const n0 = { x: contact.x + g.u.x * nOff, y: contact.y + g.u.y * nOff };
    const nTip = { x: n0.x + g.n.x * st.N * k, y: n0.y + g.n.y * st.N * k };
    forceArrow(ctx, n0.x, n0.y, nTip.x, nTip.y, FORCE.N);
    tag(ctx, `N = ${f0(st.N)} N`, nTip.x - 4, nTip.y - 6, FORCE.N, 'right', 11);
    // atrito, na superfície
    if (st.f > 1e-6) {
      // na superfície de contato; na caixa, sai da quina do lado para onde aponta (fica visível)
      const edge = st.rolling ? 0 : (st.fdir * BOX.w) / 2;
      const f0p = { x: contact.x + g.u.x * edge + g.n.x * 3, y: contact.y + g.u.y * edge + g.n.y * 3 };
      const fLen = Math.max(14, st.f * k);
      const fTip = { x: f0p.x + g.u.x * st.fdir * fLen, y: f0p.y + g.u.y * st.fdir * fLen };
      forceArrow(ctx, f0p.x, f0p.y, fTip.x, fTip.y, FORCE.f);
      const kind = st.regime === SLIDE || st.regime === ROLL_SLIP ? 'cinético' : 'estático';
      const lx = fTip.x - g.n.x * 18;
      const ly = fTip.y - g.n.y * 18 + 4;
      tag(ctx, `fat = ${f0(st.f)} N (${kind})`, lx, ly, FORCE.f, st.fdir > 0 ? 'left' : 'right', 11);
    }
    // força F
    if (!st.rolling && st.F > 0) {
      const F0 = { x: c.x + g.u.x * (BOX.w / 2 + 10), y: c.y + g.u.y * (BOX.w / 2 + 10) };
      const FTip = { x: F0.x + g.u.x * st.F * k, y: F0.y + g.u.y * st.F * k };
      forceArrow(ctx, F0.x, F0.y, FTip.x, FTip.y, FORCE.F);
      tag(ctx, `F = ${f0(st.F)} N`, FTip.x + 6, FTip.y - 8, FORCE.F, 'left', 11);
    }
    // aceleração: indicador fixo no canto, com a seta paralela à rampa
    const aBox = { x: 26, y: 140 };
    text(ctx, st.a > 1e-9 ? `a = ${f2(st.a)} m/s² ${dirWord(st)}` : 'a = 0 (parado)', aBox.x, aBox.y + 12, { size: 12, color: FORCE.a, bold: true });
    if (st.a > 1e-9) {
      const len = clamp(st.a * 12, 14, 110);
      const sgn = st.dir > 0 ? -1 : 1;
      const a0 = { x: aBox.x + 60 - (sgn * g.u.x * len) / 2, y: aBox.y + 44 - (sgn * g.u.y * len) / 2 };
      arrow(ctx, a0.x, a0.y, a0.x + g.u.x * sgn * len, a0.y + g.u.y * sgn * len, FORCE.a, 3, 10);
    }
    if (speed > 1.05 && st.a > 0) text(ctx, `${fmt(speed, 1)}× mais rápido`, 520, 540, { size: 10.5, color: C.dim, align: 'right' });
  }

  // ---------------------------------------------------------------- gráficos
  function drawFriction(ctx: CanvasRenderingContext2D, st: RampState, dt: number): void {
    const xMax = Math.max(st.Fpush * 1.35, st.F * 1.08, 20);
    xTop = xTop > 0 ? approach(xTop, xMax, dt) : xMax;
    const ax = niceAxis(xTop, FSTEPS, 5);
    const muk = st.muk * st.N;
    const yMax = Math.max(st.fmax, muk, Math.min(st.fneed, st.fmax)) * 1.3 + 1e-6;
    yTop = yTop > 0 ? approach(yTop, yMax, dt) : yMax;
    const ay = niceAxis(Math.max(yTop, 1), FSTEPS, 4);
    const ch = new Chart(ctx, { ...CH, x0: 0, x1: ax.top, y0: 0, y1: ay.top });
    ch.frame('Atrito × força F (caixa)', 'F (N)', 'atrito (N)', ticksOf(0, ax.top, ax.step), ticksOf(0, ay.top, ay.step));
    // faixa em que a caixa fica parada
    const xa = ch.X(Math.min(st.Fhold, ax.top));
    const xb = ch.X(Math.min(st.Fpush, ax.top));
    ctx.fillStyle = 'rgba(95,211,138,0.13)';
    ctx.fillRect(xa, CH.y, Math.max(0, xb - xa), CH.h);
    if (xb - xa > 46) text(ctx, 'parada', (xa + xb) / 2, CH.y + 14, { size: 11, color: C.good, bold: true, align: 'center' });
    ch.fn(() => st.fmax, C.good, 1.5, [6, 4]);
    ch.fn(() => muk, C.amber, 1.5, [2, 4]);
    text(ctx, 'μe·N', CH.x + CH.w - 4, ch.Y(st.fmax) - 5, { size: 10.5, color: C.good, align: 'right' });
    text(ctx, 'μc·N', CH.x + CH.w - 4, ch.Y(muk) + (Math.abs(ch.Y(muk) - ch.Y(st.fmax)) < 14 ? 13 : -5), { size: 10.5, color: C.amber, align: 'right' });
    // curva atrito(F): V dentro da faixa, μc·N fora (com o salto nas bordas)
    const fOf = (F: number) => (Math.abs(F - st.Pt) <= st.fmax + 1e-9 ? Math.abs(F - st.Pt) : muk);
    const segs: [number, number][][] = [[]];
    const n = 220;
    let prev = fOf(0);
    for (let i = 0; i <= n; i++) {
      const F = (ax.top * i) / n;
      const fv = fOf(F);
      if (i > 0 && Math.abs(fv - prev) > ay.top * 0.06) segs.push([]);
      segs[segs.length - 1].push([F, fv]);
      prev = fv;
    }
    for (const sg of segs) if (sg.length > 1) ch.poly(sg, C.curve1, 2.5);
    for (const Fe of [st.Fhold, st.Fpush]) {
      if (Fe <= 0 || Fe >= ax.top) continue;
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = C.curve1;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ch.X(Fe), ch.Y(st.fmax));
      ctx.lineTo(ch.X(Fe), ch.Y(muk));
      ctx.stroke();
      ctx.restore();
    }
    if (st.Pt > 0 && st.Pt < ax.top) text(ctx, 'F = P∥', ch.X(st.Pt), ch.Y(0) - 6, { size: 10, color: C.dim, align: 'center' });
    marker(ch, ctx, Math.min(st.F, ax.top), st.f);
  }

  function drawAccel(ctx: CanvasRenderingContext2D, st: RampState): void {
    const ch = new Chart(ctx, { ...CH, x0: 0, x1: THMAX, y0: 0, y1: 10 });
    ch.frame('Aceleração × inclinação', 'θ (°)', 'a (m/s²)', ticksOf(0, THMAX, 10), ticksOf(0, 10, 2));
    ch.fn((t) => G * Math.sin(t * DEG), C.violet, 1.5, [5, 4]);
    for (let b = 0; b < SHAPES.length; b++) {
      const beta = SHAPES[b].beta;
      ch.fn((t) => releaseOf(beta, t, st.mus, st.mukRaw).a, SHAPE_COLOR[b], b === st.body ? 3.2 : 1.6, b === 0 ? [7, 4] : []);
    }
    // limite de rolar sem deslizar do corpo escolhido
    if (st.thLim < THMAX && st.thLim > 0) {
      const x = ch.X(st.thLim);
      ctx.strokeStyle = SHAPE_COLOR[st.body];
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(x, CH.y);
      ctx.lineTo(x, CH.y + CH.h);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'escorrega →', x + 3, CH.y + CH.h - 6, { size: 10, color: SHAPE_COLOR[st.body] });
    }
    ctx.fillStyle = 'rgba(10,18,28,0.82)';
    roundRect(ctx, CH.x + 4, CH.y + 2, 128, 86, 5);
    ctx.fill();
    ch.legend(
      [
        ['g·sen θ (sem atrito)', C.violet, [5, 4]],
        ['caixa', SHAPE_COLOR[0], [7, 4]],
        ['esfera', SHAPE_COLOR[3]],
        ['cilindro', SHAPE_COLOR[2]],
        ['aro', SHAPE_COLOR[1]],
      ],
      CH.x + 10,
      CH.y + 16,
    );
    marker(ch, ctx, st.theta, st.a);
  }

  function drawRace(ctx: CanvasRenderingContext2D, st: RampState, dt: number): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, RACE.x, RACE.y, RACE.w, RACE.h, 8);
    ctx.fill();
    text(ctx, `Corrida: ${f0(RAMP_L)} m rampa abaixo`, RACE.x + 14, RACE.y + 22, { size: 13, bold: true });
    text(ctx, `soltos juntos, sem F · θ = ${f0(st.theta)}°`, RACE.x + RACE.w - 12, RACE.y + 22, { size: 11, color: C.dim, align: 'right' });
    const runs = SHAPES.map((_, b) => rampState({ body: b, theta: st.theta, mus: st.mus, muk: st.mukRaw, m: st.m, r: 0.2, F: 0 }));
    const times = runs.map((r) => (r.a > 0 ? Math.sqrt((2 * RAMP_L) / r.a) : Infinity));
    const finite = times.filter((t) => Number.isFinite(t));
    const tMax = finite.length ? Math.max(...finite) : 0;
    const key = [st.theta.toFixed(2), st.mus.toFixed(3), st.mukRaw.toFixed(3)].join('|');
    if (key !== raceKey) {
      raceKey = key;
      raceT = -0.4;
    }
    const k = tMax > 6 ? tMax / 6 : 1;
    raceT += dt * k;
    if (finite.length && raceT > tMax + 1.4 * k) raceT = -0.4;
    const order = [...finite].sort((a, b) => a - b);
    const lanes = [3, 2, 1, 0];
    lanes.forEach((b, row) => {
      const y = RACE.y + 58 + row * 50;
      const sel = b === st.body;
      if (sel) {
        ctx.fillStyle = 'rgba(255,201,77,0.08)';
        roundRect(ctx, RACE.x + 6, y - 22, RACE.w - 12, 44, 6);
        ctx.fill();
      }
      text(ctx, SHAPES[b].short, RACE.x + 14, y + 4, { size: 12.5, bold: sel, color: sel ? C.amber : C.text });
      // pista
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(TRACK.x0, y + 12);
      ctx.lineTo(TRACK.x1, y + 12);
      ctx.stroke();
      ctx.strokeStyle = C.text;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(TRACK.x1, y - 16);
      ctx.lineTo(TRACK.x1, y + 16);
      ctx.stroke();
      ctx.setLineDash([]);
      const r = runs[b];
      const t = Math.max(0, raceT);
      const p = r.a > 0 ? Math.min(1, (0.5 * r.a * t * t) / RAMP_L) : 0;
      const iconR = 9;
      const x = TRACK.x0 + iconR + p * (TRACK.x1 - TRACK.x0 - 2 * iconR);
      ctx.save();
      ctx.translate(x, y + 12 - iconR);
      shapeIcon(ctx, b, iconR, b === 0 ? 0 : (r.spin * p * (TRACK.x1 - TRACK.x0)) / iconR, SHAPE_COLOR[b], !sel && r.a <= 0);
      ctx.restore();
      const tb = times[b];
      if (Number.isFinite(tb)) {
        const rank = order.findIndex((q) => Math.abs(q - tb) < 1e-9) + 1;
        text(ctx, `${f2(tb)} s`, RACE.x + RACE.w - 12, y + 2, { size: 12, bold: true, align: 'right', color: sel ? C.amber : C.text });
        text(ctx, `${rank}º${r.regime === ROLL_SLIP ? ' · escorrega' : ''}`, RACE.x + RACE.w - 12, y + 17, { size: 10.5, align: 'right', color: C.dim });
      } else text(ctx, 'não sai', RACE.x + RACE.w - 12, y + 6, { size: 11.5, align: 'right', color: C.dim });
    });
    const note =
      st.mus === 0
        ? 'Sem atrito ninguém gira: todos escorregam com a = g·sen θ.'
        : 'A ordem não depende da massa nem do raio: só de I/(m·r²).';
    text(ctx, note, RACE.x + 14, RACE.y + RACE.h - 12, { size: 11, color: C.dim });
  }

  // ---------------------------------------------------------------- interação
  const nearTop = (x: number, y: number, v: LabValues) => {
    const g = geom(v.theta ?? 30);
    return Math.hypot(x - g.top.x, y - g.top.y) < 24;
  };
  const inChart = (x: number, y: number) => x >= CH.x - 8 && x <= CH.x + CH.w + 8 && y >= CH.y - 8 && y <= CH.y + CH.h + 8;
  const thetaAt = (x: number, y: number) => {
    const t = Math.atan2(PIV.y - y, Math.max(1, x - PIV.x)) / DEG;
    return Math.round(clamp(t, 0, THMAX));
  };

  return {
    reset() {
      lastKey = '';
      raceKey = '';
      restart();
      fScale = 0;
      xTop = 0;
      yTop = 0;
      dragging = null;
    },
    actions: [
      {
        label: '↻ Soltar de novo',
        title: 'Recomeça o movimento na rampa e a corrida.',
        run() {
          restart();
          raceT = -0.4;
        },
      },
    ],
    pointer(kind, x, y, v) {
      const box = Math.round(v.body ?? 0) === 0;
      if (kind === 'down') {
        dragging = nearTop(x, y, v) ? 'top' : inChart(x, y) ? 'chart' : null;
      }
      if (!dragging) return null;
      let out: LabValues | null = null;
      if (dragging === 'top') out = { theta: thetaAt(x, y) };
      else if (box) {
        const ax = niceAxis(xTop || 100, FSTEPS, 5);
        out = { F: Math.round(clamp(((x - CH.x) / CH.w) * ax.top, 0, 3000) / 10) * 10 };
      } else out = { theta: Math.round(clamp(((x - CH.x) / CH.w) * THMAX, 0, THMAX)) };
      if (kind === 'up') dragging = null;
      return out;
    },
    cursor(x, y, v) {
      if (nearTop(x, y, v)) return 'grab';
      if (inChart(x, y)) return 'ew-resize';
      return 'default';
    },
    draw(ctx, v, _o, dt) {
      const st = rampState(v);
      const d = Math.min(dt, 0.05);
      update(st, d);
      drawCalc(ctx, st);
      drawScene(ctx, st, d);
      if (st.rolling) drawAccel(ctx, st);
      else drawFriction(ctx, st, d);
      drawRace(ctx, st, d);
    },
    status(v) {
      const st = rampState(v);
      const plano = st.theta < 0.5;
      if (!st.rolling) {
        if (st.mukRaw > st.mus + 1e-9) return { tone: 'warn', text: `μc maior que μe não acontece na prática: a bancada usa μc = μe = ${f2(st.mus)}.` };
        if (st.regime === REST) {
          if (plano && st.F === 0) return { tone: 'ok', text: 'Caixa parada no piso, sem força puxando: o atrito é zero — ele só aparece quando algo tenta mover a caixa.' };
          if (plano) return { tone: 'ok', text: `F = ${f0(st.F)} N não vence o atrito estático máximo (${f0(st.fmax)} N): a caixa não sai do lugar e o atrito vale ${f0(st.f)} N, igual a F. Usar μc aqui é a pegadinha.` };
          if (st.F === 0) return { tone: 'ok', text: `Parada: tg θ = ${f2(Math.tan(st.th))} ≤ μe = ${f2(st.mus)}. O atrito estático vale só o necessário (${f1(st.f)} N = P·sen θ), não μe·N.` };
          return { tone: 'ok', text: `Parada: F está entre ${f0(st.Fhold)} N e ${f0(st.Fpush)} N. ${st.fdir > 0 ? 'O atrito aponta rampa acima (a caixa tende a descer).' : st.fdir < 0 ? 'O atrito aponta rampa abaixo (a caixa tende a subir).' : 'F = P∥: nem precisa de atrito.'}` };
        }
        if (st.dir < 0) return { tone: 'warn', text: `${plano ? 'Desliza no sentido de F' : 'Sobe a rampa'}: F venceu ${plano ? 'o atrito estático máximo' : 'P∥ + atrito estático máximo'}; agora o atrito é o cinético, μc·N = ${f0(st.f)} N, e a = ${f2(st.a)} m/s².` };
        return { tone: 'warn', text: `Desce escorregando: ${st.F > 0 ? `F = ${f0(st.F)} N é menor que a F mínima para segurar (${f0(st.Fhold)} N)` : `tg θ = ${f2(Math.tan(st.th))} > μe = ${f2(st.mus)}`}. Com o atrito cinético, a = ${f2(st.a)} m/s².` };
      }
      if (st.regime === REST) return { tone: 'ok', text: 'No plano, nada empurra o corpo: sem inclinação ele fica parado (ou rola com velocidade constante).' };
      if (st.mus === 0) return { tone: 'warn', text: 'Sem atrito não há torque em torno do centro: o corpo desce escorregando, sem girar, com a = g·sen θ.' };
      if (st.regime === ROLL) return { tone: 'ok', text: `Rola sem deslizar (v = ω·r): o atrito estático de ${f1(st.f)} N faz o corpo girar e não dissipa energia. ${f0(st.erot * 100)} % da energia cinética está na rotação.` };
      return { tone: 'bad', text: `Inclinação acima de ${f1(st.thLim)}°: o atrito estático máximo (${f1(st.fmax)} N) não dá o torque necessário — o ${st.shape.short.toLowerCase()} rola e escorrega, e o atrito cinético dissipa energia.` };
    },
  };
}
