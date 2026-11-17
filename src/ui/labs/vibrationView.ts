/**
 * Desenho da bancada de vibrações: o motor sobre molas e amortecedor (com o disco desbalanceado e o absorvedor
 * dinâmico opcional), o sinal x(t) no "analisador", a curva amplitude × rotação (vibração forçada), a comparação dos
 * regimes de amortecimento (vibração livre) ou os modos naturais (2 graus de liberdade) e as contas.
 * Convenção: x > 0 para cima. Os deslocamentos aparecem ampliados e em câmera lenta.
 */
import { ARRANGEMENTS, forced, freeX, MU, stepFree, UNB, vibState, X0, type FreeSim, type VibState } from '../../learning/labs/vibration';
import type { LabValues } from '../../learning/types';
import { approach, arrow, C, Chart, fmt, marker, niceAxis, roundRect, tag, text, ticksOf } from './draw';
import type { LabView } from './views';

const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
const f2 = (x: number) => fmt(x, 2);
const f3 = (x: number) => fmt(x, 3);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const TAU = Math.PI * 2;

// ------------------------------------------------------------------ cena
const CX = 214;
const BODY = { x: 128, w: 172, top: 292, bot: 358 };
const Y_SHAFT = 325;
const PLATE = { x: 96, w: 248, top: 358, h: 12 };
const FLOOR_Y = 452;
const ABS = { w: 60, h: 24, spring: 40 };
const DISK = { x: 352, r: 24 };
/** px por mm na faixa linear; os deslocamentos grandes saturam suavemente em LIM px. */
const PX_MM = 16;
const LIM = 46;
const disp = (x: number) => LIM * Math.tanh((x * 1000 * PX_MM) / LIM);

const SCOPE = { x: 548, y: 46, w: 372, h: 148 };
const LOW = { x: 548, y: 292, w: 372, h: 138 };
const RULER = { x: 548, y: 512, w: 372 };
const NMAX = 3000;
const ZMAX = 1.5;

const MOTOR_COLOR = C.curve1;
const ABS_COLOR = C.curve2;

interface Pt {
  t: number;
  x1: number;
  x2: number;
}

type Req = 'pull' | 'm1' | 'm2';

function springPath(ctx: CanvasRenderingContext2D, x: number, yTop: number, yBot: number, w: number, coils: number, color: string, lw = 2.4): void {
  const L = yBot - yTop;
  const cap = Math.min(6, Math.abs(L) * 0.14);
  const n = coils * 2;
  const seg = (L - 2 * cap) / n;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x, yTop);
  ctx.lineTo(x, yTop + cap);
  for (let i = 0; i < n; i++) ctx.lineTo(x + (i % 2 ? -w / 2 : w / 2), yTop + cap + seg * (i + 0.5));
  ctx.lineTo(x, yBot - cap);
  ctx.lineTo(x, yBot);
  ctx.stroke();
}

/** Posições das molas de cada arranjo e do amortecedor. */
function layoutOf(arr: number): { xs: number[]; series: boolean; damperX: number } {
  if (arr === 0) return { xs: [CX], series: false, damperX: 304 };
  if (arr === 1) return { xs: [134, 294], series: false, damperX: CX };
  if (arr === 2) return { xs: [118, 172, 256, 310], series: false, damperX: CX };
  return { xs: [CX], series: true, damperX: 304 };
}

export function vibrationView(): LabView {
  // traço do "analisador": tempo simulado (s) e deslocamentos (m)
  let trace: Pt[] = [];
  let tsim = 0;
  let theta = 0;
  let lastMode = -1;
  let lastKey = '';
  let slow = 1;
  // vibração livre
  let phase: 'hold' | 'drag' | 'run' = 'hold';
  let holdT = 0.7;
  let req: Req = 'pull';
  let sim: FreeSim = { x1: -X0, v1: 0, x2: -X0, v2: 0 };
  let dragX = -X0;
  let tRel = 0;
  let recording = true;
  let grab: { y: number; x: number } | null = null;
  let dragTarget: 'motor' | 'rpm' | 'zeta' | null = null;
  // posições atuais (m) e escalas suavizadas dos gráficos (mm)
  let x1Now = 0;
  let x2Now = 0;
  let scopeA = 1;
  let lowTop = 1;
  let modeT = 0;

  const w1Of = (st: VibState) => (st.n1 * TAU) / 60;
  const w2Of = (st: VibState) => (st.n2 * TAU) / 60;

  /** Condição inicial da vibração livre: puxado para baixo, ou na forma de um modo. */
  function initial(st: VibState, r: Req, x0 = -X0): FreeSim {
    if (st.abs && (r === 'm1' || r === 'm2')) {
      const a = r === 'm1' ? st.a1 : st.a2;
      const s = X0 / Math.max(1, Math.abs(a));
      return { x1: -s, v1: 0, x2: -s * a, v2: 0 };
    }
    return { x1: x0, v1: 0, x2: x0, v2: 0 };
  }

  function restartFree(): void {
    phase = 'hold';
    holdT = 0.7;
    trace = [];
    tRel = 0;
    recording = true;
  }

  /** Janela do traço livre (s): 6 períodos do modo mais lento (3 se não oscila). */
  function freeWindow(st: VibState): number {
    const w = st.abs ? w1Of(st) : st.wn;
    return ((st.abs || st.regime <= 1 ? 6 : 3) * TAU) / w;
  }

  function update(st: VibState, dt: number): void {
    const modeNow = st.free ? 0 : 1;
    if (modeNow !== lastMode) {
      lastMode = modeNow;
      trace = [];
      tsim = 0;
      if (st.free) restartFree();
    }
    modeT += dt;
    if (st.free) {
      const key = [st.m, st.arr, st.k, st.zeta, st.abs ? 1 : 0, st.wa].map((x) => x.toFixed(4)).join('|');
      if (key !== lastKey) {
        if (lastKey && phase !== 'drag') restartFree();
        lastKey = key;
      }
      const wMax = st.abs ? w2Of(st) : st.wn;
      slow = Math.max(1, wMax / TAU / 0.9);
      if (phase === 'hold') {
        sim = initial(st, req);
        holdT -= dt;
        if (holdT <= 0) {
          phase = 'run';
          tRel = 0;
          trace = [{ t: 0, x1: sim.x1, x2: sim.x2 }];
          req = 'pull';
        }
      } else if (phase === 'drag') {
        sim = { x1: dragX, v1: 0, x2: dragX, v2: 0 };
      } else {
        const hs = dt / slow;
        const hMax = TAU / wMax / 60;
        const n = Math.max(1, Math.ceil(hs / hMax));
        const win = freeWindow(st);
        for (let i = 0; i < n; i++) {
          sim = stepFree(st, sim, hs / n);
          tRel += hs / n;
          if (recording) {
            trace.push({ t: tRel, x1: sim.x1, x2: sim.x2 });
            if (tRel >= win) recording = false;
          }
        }
      }
      x1Now = sim.x1;
      x2Now = sim.x2;
      return;
    }
    // forçada: regime permanente, com a fase acumulada (a rotação pode mudar aos poucos)
    lastKey = '';
    const fExc = st.rpm / 60;
    slow = Math.max(1, fExc / 1.0);
    const hs = dt / slow;
    theta += st.w * hs;
    tsim += hs;
    const r = st.resp;
    const X = Number.isFinite(r.X) ? r.X : 0.05;
    const Xa = Number.isFinite(r.Xa) ? r.Xa : 0.05;
    x1Now = X * Math.sin(theta - r.phase);
    x2Now = st.abs ? Xa * Math.sin(theta - r.phaseA) : x1Now;
    trace.push({ t: tsim, x1: x1Now, x2: x2Now });
    const win = st.rpm > 0 ? (4 * 60) / Math.max(st.rpm, 30) : 0.5;
    while (trace.length > 2 && trace[0].t < tsim - win) trace.shift();
  }

  // ---------------------------------------------------------------- cena
  function drawScene(ctx: CanvasRenderingContext2D, st: VibState): void {
    const d1 = disp(x1Now);
    const d2 = disp(x2Now);
    // chão (bloco de concreto)
    ctx.fillStyle = '#3a4656';
    ctx.fillRect(40, FLOOR_Y, 400, 16);
    ctx.strokeStyle = '#4c5a6c';
    ctx.lineWidth = 1;
    for (let x = 46; x < 440; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y + 16);
      ctx.lineTo(x + 10, FLOOR_Y + 4);
      ctx.stroke();
    }
    ctx.fillStyle = '#56657a';
    ctx.fillRect(40, FLOOR_Y, 400, 3);
    const plateBot = PLATE.top + PLATE.h - d1;
    const lay = layoutOf(st.arr);
    // amortecedor: cilindro preso ao chão, haste presa à base
    if (st.zeta > 0) {
      const x = lay.damperX;
      const cylTop = FLOOR_Y - 56;
      ctx.globalAlpha = 0.5 + 0.5 * Math.min(1, st.zeta / 0.3);
      ctx.fillStyle = '#5b6b80';
      roundRect(ctx, x - 11, cylTop, 22, 56, 3);
      ctx.fill();
      ctx.fillStyle = '#41505f';
      ctx.fillRect(x - 8, cylTop + 3, 16, 50);
      const pistonY = clamp(plateBot + 54, cylTop + 6, FLOOR_Y - 6);
      ctx.strokeStyle = C.metalLight;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, plateBot);
      ctx.lineTo(x, pistonY);
      ctx.stroke();
      ctx.fillStyle = C.metalLight;
      ctx.fillRect(x - 7, pistonY - 2, 14, 4);
      ctx.globalAlpha = 1;
      text(ctx, 'c', x + 15, cylTop + 18, { size: 12, bold: true, color: C.dim });
    }
    // molas
    const coils = 5;
    if (lay.series) {
      const mid = (plateBot + FLOOR_Y) / 2;
      springPath(ctx, CX, plateBot, mid - 3, 30, 3, C.metalLight);
      springPath(ctx, CX, mid + 3, FLOOR_Y, 30, 3, C.metalLight);
      ctx.fillStyle = C.metal;
      ctx.fillRect(CX - 22, mid - 3, 44, 6);
      text(ctx, 'k', CX - 30, (plateBot + mid) / 2 + 4, { size: 12, bold: true, color: C.dim, align: 'right' });
      text(ctx, 'k', CX - 30, (mid + FLOOR_Y) / 2 + 4, { size: 12, bold: true, color: C.dim, align: 'right' });
    } else {
      lay.xs.forEach((x, i) => {
        springPath(ctx, x, plateBot, FLOOR_Y, 26, coils, C.metalLight);
        if (i === 0) text(ctx, 'k', x - 18, (plateBot + FLOOR_Y) / 2 + 4, { size: 12, bold: true, color: C.dim, align: 'right' });
      });
    }
    // base e pés
    ctx.fillStyle = '#4a5a6e';
    roundRect(ctx, PLATE.x, PLATE.top - d1, PLATE.w, PLATE.h, 3);
    ctx.fill();
    ctx.fillStyle = '#5d6f86';
    ctx.fillRect(PLATE.x, PLATE.top - d1, PLATE.w, 3);
    ctx.fillStyle = '#2f3b4a';
    for (const x of [BODY.x + 22, BODY.x + BODY.w - 44]) ctx.fillRect(x, BODY.bot - 4 - d1, 22, 6);
    // carcaça do motor (cilindro deitado, com aletas)
    const top = BODY.top - d1;
    const g = ctx.createLinearGradient(0, top, 0, top + BODY.bot - BODY.top);
    g.addColorStop(0, '#5f8fd0');
    g.addColorStop(0.45, '#3d6fb0');
    g.addColorStop(1, '#274a7a');
    ctx.fillStyle = g;
    roundRect(ctx, BODY.x, top, BODY.w, BODY.bot - BODY.top - 4, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15,30,50,0.55)';
    ctx.lineWidth = 2;
    for (let x = BODY.x + 18; x < BODY.x + BODY.w - 10; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, top + 6);
      ctx.lineTo(x, top + BODY.bot - BODY.top - 10);
      ctx.stroke();
    }
    ctx.fillStyle = '#27466f';
    ctx.beginPath();
    ctx.ellipse(BODY.x + 4, top + 31, 9, 30, 0, 0, TAU);
    ctx.fill();
    // caixa de ligação
    ctx.fillStyle = '#35609a';
    roundRect(ctx, 140, top - 12, 32, 13, 2);
    ctx.fill();
    // eixo e disco desbalanceado
    const sy = Y_SHAFT - d1;
    ctx.fillStyle = C.metal;
    ctx.fillRect(BODY.x + BODY.w, sy - 4, DISK.x - BODY.x - BODY.w, 8);
    ctx.fillStyle = '#9aa7b6';
    ctx.beginPath();
    ctx.arc(DISK.x, sy, DISK.r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#5f6d7d';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#6f7d8d';
    ctx.beginPath();
    ctx.arc(DISK.x, sy, 5, 0, TAU);
    ctx.fill();
    const running = !st.free && st.rpm > 0;
    const th = running ? theta : Math.PI / 2;
    const ux = Math.cos(th);
    const uy = -Math.sin(th);
    ctx.fillStyle = C.bad;
    ctx.beginPath();
    ctx.arc(DISK.x + ux * 15, sy + uy * 15, 5, 0, TAU);
    ctx.fill();
    if (running) {
      const L = 10 + 34 * Math.tanh(st.resp.F0 / 150);
      arrow(ctx, DISK.x + ux * 20, sy + uy * 20, DISK.x + ux * (22 + L), sy + uy * (22 + L), C.bad, 2.5, 8);
      text(ctx, 'F₀ = (m·e)·ω²', 330, sy + DISK.r + 40, { size: 11, color: C.bad, bold: true });
      // sentido de rotação
      ctx.strokeStyle = C.dim;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(DISK.x, sy, DISK.r + 6, -2.4, -0.9);
      ctx.stroke();
    }
    // absorvedor dinâmico em cima do motor
    if (st.abs) {
      const mb = top - ABS.spring - (d2 - d1);
      springPath(ctx, CX, mb, top, 20, 3, ABS_COLOR, 2.2);
      const ag = ctx.createLinearGradient(0, mb - ABS.h, 0, mb);
      ag.addColorStop(0, '#ffcf7d');
      ag.addColorStop(1, '#c9822e');
      ctx.fillStyle = ag;
      roundRect(ctx, CX - ABS.w / 2, mb - ABS.h, ABS.w, ABS.h, 4);
      ctx.fill();
      text(ctx, 'mₐ', CX, mb - 7, { size: 12, bold: true, color: '#3a2a10', align: 'center' });
      text(ctx, 'kₐ', CX + 16, top - ABS.spring / 2 + 4, { size: 11, bold: true, color: ABS_COLOR });
    }
    text(ctx, 'm', BODY.x + BODY.w / 2 + 34, top + 38, { size: 15, bold: true, color: 'rgba(255,255,255,0.85)', align: 'center' });
    // equilíbrio e deslocamento atual
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(44, PLATE.top + PLATE.h);
    ctx.lineTo(PLATE.x - 4, PLATE.top + PLATE.h);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'equilíbrio', 46, PLATE.top + PLATE.h + 14, { size: 10, color: C.dim });
    if (Math.abs(d1) > 1.5) arrow(ctx, 70, PLATE.top + PLATE.h, 70, plateBot, MOTOR_COLOR, 2, 7);
    tag(ctx, `x = ${f2(x1Now * 1000)} mm`, 70, PLATE.top - 52, MOTOR_COLOR, 'center', 11);
    if (st.abs) tag(ctx, `xₐ = ${f2(x2Now * 1000)} mm`, CX + ABS.w / 2 + 52, top - ABS.spring - ABS.h + 6, ABS_COLOR, 'center', 11);
    // rodapé da cena
    const notes = [`câmera lenta ${slow > 1.05 ? `${f0(slow)}×` : '(tempo real)'} · deslocamentos ampliados`];
    if (!st.free) notes.push(`desbalanceamento: m·e = ${fmt(UNB, 2)} kg·m (100 g a 10 cm do eixo)`);
    else if (phase === 'hold') notes.push('soltando…');
    else if (phase === 'run') notes.push('arraste o motor para puxar e soltar de novo');
    notes.forEach((s, i) => text(ctx, s, 44, FLOOR_Y + 36 + i * 16, { size: 11, color: C.dim }));
  }

  // ---------------------------------------------------------------- contas
  function drawCalc(ctx: CanvasRenderingContext2D, st: VibState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 14, 12, 470, 112, 8);
    ctx.fill();
    let y = 32;
    const L = (s: string, color: string = C.text, bold = false) => {
      text(ctx, s, 26, y, { size: 11.5, color, bold });
      y += 18;
    };
    const kk = st.k / 1000;
    const keq = st.keq / 1000;
    L(st.abs ? 'Motor nas molas (sem o absorvedor)' : 'Sistema de 1 grau de liberdade', C.amber, true);
    L(`${ARRANGEMENTS[st.arr].rule} = ${f1(keq)} kN/m  (k = ${f0(kk)})`);
    L(`ωn = √(keq/m) = √(${fmt(st.keq, 0)}/${f0(st.m)}) = ${f1(st.wn)} rad/s`);
    L(`fn = ωn/2π = ${f2(st.fn)} Hz → n = 60·fn = ${f0(st.ncrit)} rpm`);
    L(`δst = m·g/keq = ${f2(st.dst * 1000)} mm`, C.dim);
    y = 32;
    const R = (s: string, color: string = C.text, bold = false) => {
      text(ctx, s, 300, y, { size: 11.5, color, bold });
      y += 18;
    };
    if (st.abs) {
      R('Absorvedor (2 graus)', C.amber, true);
      R(`mₐ = ${fmt(MU, 1)}·m = ${f0(st.ma)} kg`);
      R(`kₐ = mₐ·ωₐ² = ${f1(st.ka / 1000)} kN/m`);
      R(`n₁ = ${f0(st.n1)} · n₂ = ${f0(st.n2)} rpm`);
      if (st.free) R(`xₐ/x: ${st.a1 > 0 ? '+' : ''}${f2(st.a1)} e ${f2(st.a2)}`, C.dim);
      else R(`X = ${f3(st.resp.X * 1000)} · Xₐ = ${f3(st.resp.Xa * 1000)} mm`, C.dim);
    } else if (st.free) {
      R('Vibração livre', C.amber, true);
      R(`cc = 2√(keq·m) = ${f0(st.cc)} N·s/m`);
      R(`c = ζ·cc = ${f0(st.c)} N·s/m`);
      if (st.regime <= 1) {
        R(`ωd = ωn√(1 − ζ²) = ${f1(st.wd)} rad/s`);
        R(`δ = 2πζ/√(1 − ζ²) = ${f3(st.dec)}`, C.dim);
      } else R(`ζ ${st.regime === 2 ? '= 1' : '> 1'}: não oscila`, C.dim);
    } else {
      R('Vibração forçada', C.amber, true);
      R(`ω = 2π·n/60 = ${f1(st.w)} rad/s`);
      R(`r = ω/ωn = ${f2(st.r)}`);
      R(`F₀ = m·e·ω² = ${f0(st.resp.F0)} N`);
      R(`X = ${f3(st.resp.X * 1000)} mm · TR = ${f2(st.TR)}`, C.dim);
    }
  }

  // ---------------------------------------------------------------- analisador: x(t)
  function drawScope(ctx: CanvasRenderingContext2D, st: VibState, dt: number): void {
    const free = st.free;
    const win = free ? freeWindow(st) : st.rpm > 0 ? (4 * 60) / Math.max(st.rpm, 30) : 0.5;
    const t0 = free ? 0 : Math.max(0, tsim - win);
    let peak = 0;
    for (const p of trace) peak = Math.max(peak, Math.abs(p.x1), st.abs ? Math.abs(p.x2) : 0);
    if (!free) peak = Math.max(peak, Number.isFinite(st.resp.X) ? st.resp.X : 0, st.abs && Number.isFinite(st.resp.Xa) ? st.resp.Xa : 0);
    if (free && phase !== 'run') peak = Math.max(peak, Math.abs(sim.x1), Math.abs(sim.x2));
    const want = niceAxis(Math.max(peak * 1000 * 1.1, 0.01), [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100], 4).top;
    scopeA = approach(scopeA, want, dt, 6);
    const A = scopeA;
    const tStep = niceAxis(win, [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5], 5).step;
    const ch = new Chart(ctx, { ...SCOPE, x0: 0, x1: win, y0: -A, y1: A });
    const yd = A < 0.1 ? 3 : A < 1 ? 2 : 1;
    ch.frame('Sinal de vibração x(t)', free ? 't desde que soltou (s)' : 't (s)', 'x (mm)', ticksOf(0, win, tStep), [-A, -A / 2, 0, A / 2, A], yd, tStep < 0.01 ? 3 : tStep < 0.1 ? 2 : 1);
    const pts1: [number, number][] = trace.map((p) => [p.t - t0, p.x1 * 1000]);
    if (st.abs) ch.poly(trace.map((p) => [p.t - t0, p.x2 * 1000]), ABS_COLOR, 1.8);
    ch.poly(pts1, MOTOR_COLOR, 2.2);
    if (st.abs) ch.legend([['motor', MOTOR_COLOR], ['absorvedor', ABS_COLOR]], SCOPE.x + SCOPE.w - 104, SCOPE.y + 14);
    // anotações
    if (free && !st.abs && st.regime === 1 && phase === 'run' && tRel > st.Td) {
      const x1 = Math.abs(freeX(st.zeta, st.wn, X0, 0));
      const x2 = Math.abs(freeX(st.zeta, st.wn, X0, st.Td));
      const yA = -x1 * 1000;
      const yB = -x2 * 1000;
      ch.dot(0, yA, C.amber, 4);
      ch.dot(st.Td, yB, C.amber, 4);
      const yy = ch.Y(-A) - 8;
      arrow(ctx, ch.X(st.Td * 0.5), yy, ch.X(0) + 2, yy, C.amber, 1.5, 6);
      arrow(ctx, ch.X(st.Td * 0.5), yy, ch.X(st.Td) - 2, yy, C.amber, 1.5, 6);
      text(ctx, `Td = ${f3(st.Td)} s`, ch.X(st.Td) + 6, yy + 4, { size: 11, color: C.amber, bold: true });
      tag(ctx, `x₁/x₂ = ${f2(x1 / x2)} → δ = ln(x₁/x₂) = ${f3(st.dec)}`, SCOPE.x + SCOPE.w - 6, SCOPE.y + 16, C.amber, 'right', 11);
    } else if (free && phase !== 'run') {
      text(ctx, phase === 'drag' ? 'solte o motor…' : 'puxando o motor para baixo…', SCOPE.x + 10, SCOPE.y + 20, { size: 12, color: C.dim });
    } else if (!free && st.rpm > 0 && trace.length > 4) {
      // período entre dois picos do motor
      const T = 60 / st.rpm;
      let ip = -1;
      for (let i = trace.length - 2; i > 0; i--) {
        if (trace[i].x1 >= trace[i - 1].x1 && trace[i].x1 >= trace[i + 1].x1 && trace[i].x1 > 0) {
          ip = i;
          break;
        }
      }
      const tp = ip > 0 ? trace[ip].t - t0 : win;
      if (tp - T >= 0) {
        const yy = ch.Y(Math.min(A, Math.max(...trace.map((p) => p.x1 * 1000)))) - 8;
        arrow(ctx, ch.X(tp - T / 2), yy, ch.X(tp - T) + 2, yy, C.amber, 1.5, 6);
        arrow(ctx, ch.X(tp - T / 2), yy, ch.X(tp) - 2, yy, C.amber, 1.5, 6);
      }
      tag(ctx, `T = 60/n = ${f3(T)} s → f = n/60 = ${f1(st.rpm / 60)} Hz`, SCOPE.x + 8, SCOPE.y + 16, C.amber, 'left', 11);
    } else if (!free) text(ctx, 'motor parado', SCOPE.x + 10, SCOPE.y + 20, { size: 12, color: C.dim });
  }

  // ---------------------------------------------------------------- amplitude × rotação
  function drawResponse(ctx: CanvasRenderingContext2D, st: VibState, dt: number): void {
    const N = 300;
    const base = { ...st, abs: false };
    const ptsMain: [number, number][] = [];
    const ptsRef: [number, number][] = [];
    let ymax = 0;
    for (let i = 0; i <= N; i++) {
      const n = (NMAX * i) / N;
      const w = (n * TAU) / 60;
      const X = forced(st, w).X * 1000;
      ptsMain.push([n, X]);
      if (Number.isFinite(X)) ymax = Math.max(ymax, X);
      if (st.abs) {
        const X1 = forced(base, w).X * 1000;
        ptsRef.push([n, X1]);
      }
    }
    // refina perto das ressonâncias e da sintonia
    const extra = st.abs ? [st.n1, st.n2, st.wa * 60 / TAU] : [st.ncrit];
    for (const nc of extra) {
      for (let j = -12; j <= 12; j++) {
        const n = nc * (1 + j * 0.004);
        if (n < 0 || n > NMAX) continue;
        const X = forced(st, (n * TAU) / 60).X * 1000;
        ptsMain.push([n, X]);
        if (Number.isFinite(X)) ymax = Math.max(ymax, X);
      }
    }
    ptsMain.sort((a, b) => a[0] - b[0]);
    const unit = (UNB / st.m) * 1000;
    const cap = 25 * unit;
    const cur = Number.isFinite(st.resp.X) ? st.resp.X * 1000 : Infinity;
    const want = niceAxis(Math.max(Math.min(ymax, cap), Math.min(cur, cap) * 1.15, unit * 1.5), [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100], 4).top;
    lowTop = approach(lowTop, want, dt, 5);
    const top = lowTop;
    const ch = new Chart(ctx, { ...LOW, x0: 0, x1: NMAX, y0: 0, y1: top });
    const yStep = niceAxis(top, [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50], 4).step;
    ch.frame('Amplitude do motor × rotação', 'rotação n (rpm)', 'X (mm)', ticksOf(0, NMAX, 500), ticksOf(0, top, yStep), yStep < 0.1 ? 2 : yStep < 1 ? 1 : 0);
    if (!st.abs) {
      // região de isolamento: r > √2
      const ni = Math.SQRT2 * st.ncrit;
      if (ni < NMAX) {
        ctx.fillStyle = 'rgba(95,211,138,0.10)';
        ctx.fillRect(ch.X(ni), LOW.y, ch.X(NMAX) - ch.X(ni), LOW.h);
        ctx.strokeStyle = 'rgba(95,211,138,0.6)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ch.X(ni), LOW.y);
        ctx.lineTo(ch.X(ni), LOW.y + LOW.h);
        ctx.stroke();
        ctx.setLineDash([]);
        const lx = Math.min(ch.X(ni) + 6, LOW.x + LOW.w - 120);
        text(ctx, 'isolamento: TR < 1', lx, LOW.y + 44, { size: 10, color: C.good, bold: true });
        text(ctx, `(n > √2·nres = ${f0(ni)} rpm)`, lx, LOW.y + 58, { size: 10, color: C.good });
      }
    }
    // linhas das ressonâncias
    const vline = (n: number, color: string, label: string, dy: number, side?: CanvasTextAlign) => {
      if (!(n > 0 && n < NMAX)) return;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ch.X(n), LOW.y);
      ctx.lineTo(ch.X(n), LOW.y + LOW.h);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      const align = side ?? (ch.X(n) > LOW.x + LOW.w - 70 ? 'right' : ch.X(n) < LOW.x + 70 ? 'left' : 'center');
      tag(ctx, label, ch.X(n) + (align === 'right' ? -3 : align === 'left' ? 3 : 0), LOW.y + dy, color, align, 10);
    };
    if (st.abs) {
      ch.poly(ptsRef, 'rgba(142,164,186,0.7)', 1.6, [5, 4]);
      vline(st.n1, C.bad, `1ª: ${f0(st.n1)}`, 14, 'right');
      vline(st.n2, C.bad, `2ª: ${f0(st.n2)}`, 14, 'left');
      vline((st.wa * 60) / TAU, C.good, `sintonia ${f0((st.wa * 60) / TAU)}`, 34);
      ch.legend([['com absorvedor', MOTOR_COLOR], ['sem absorvedor', 'rgba(142,164,186,0.9)', [5, 4]]], LOW.x + LOW.w - 128, LOW.y + 54);
    } else vline(st.ncrit, C.bad, `ressonância: ${f0(st.ncrit)} rpm`, 14);
    ch.poly(ptsMain.map(([n, X]) => [n, Math.min(X, top * 1.5)]), MOTOR_COLOR, 2.4);
    // ponto atual
    if (cur <= top) marker(ch, ctx, st.rpm, cur);
    else {
      arrow(ctx, ch.X(st.rpm), LOW.y + 26, ch.X(st.rpm), LOW.y + 4, C.amber, 2.5, 8);
      tag(ctx, Number.isFinite(cur) ? `${f1(cur)} mm` : '∞', ch.X(st.rpm), LOW.y + 44, C.amber, 'center', 10);
    }
    text(ctx, `alta rotação: X → (m·e)/m_motor = ${f3(unit)} mm`, LOW.x + LOW.w - 4, ch.Y(unit) - 5, { size: 10, color: C.dim, align: 'right' });
  }

  // ---------------------------------------------------------------- livre: comparação dos regimes e régua de ζ
  function drawRegimes(ctx: CanvasRenderingContext2D, st: VibState): void {
    const ch = new Chart(ctx, { ...LOW, x0: 0, x1: 3, y0: -1, y1: 1 });
    ch.frame('Resposta ao soltar: efeito do amortecimento', 't / Tn', 'x / x₀', [0, 0.5, 1, 1.5, 2, 2.5, 3], [-1, -0.5, 0, 0.5, 1], 1, 1);
    const refs: [number, string, number[]][] = [
      [0, 'rgba(142,164,186,0.55)', [2, 3]],
      [0.1, 'rgba(90,184,255,0.45)', []],
      [1, 'rgba(95,211,138,0.8)', [6, 4]],
      [1.5, 'rgba(180,140,255,0.8)', [6, 4]],
    ];
    for (const [z, col, dash] of refs) ch.fn((u) => -freeX(z, TAU, 1, u), col, 1.6, dash);
    ch.fn((u) => -freeX(st.zeta, TAU, 1, u), C.amber, 3);
    if (phase === 'run') {
      const u = Math.min(3, (tRel * st.wn) / TAU);
      ch.dot(u, -freeX(st.zeta, TAU, 1, u), C.amber, 5);
    }
    ctx.fillStyle = 'rgba(18,32,49,0.85)';
    roundRect(ctx, LOW.x + LOW.w - 120, LOW.y + 1, 118, 84, 6);
    ctx.fill();
    ch.legend(
      [
        ['ζ = 0', 'rgba(142,164,186,0.8)', [2, 3]],
        ['ζ = 0,1', 'rgba(90,184,255,0.8)'],
        ['ζ = 1 (crítico)', C.good, [6, 4]],
        ['ζ = 1,5', C.violet, [6, 4]],
        [`atual: ζ = ${f2(st.zeta)}`, C.amber],
      ],
      LOW.x + LOW.w - 112,
      LOW.y + 12,
    );
    // régua de ζ (arraste)
    const X = (z: number) => RULER.x + (z / ZMAX) * RULER.w;
    const y = RULER.y;
    text(ctx, 'Fração de amortecimento ζ (arraste)', RULER.x - 36, y - 22, { size: 12, bold: true });
    ctx.fillStyle = 'rgba(90,184,255,0.35)';
    ctx.fillRect(X(0), y - 5, X(1) - X(0), 10);
    ctx.fillStyle = 'rgba(180,140,255,0.35)';
    ctx.fillRect(X(1), y - 5, X(ZMAX) - X(1), 10);
    ctx.fillStyle = C.good;
    ctx.fillRect(X(1) - 2, y - 9, 4, 18);
    ctx.fillStyle = C.dim;
    ctx.fillRect(X(0) - 1, y - 9, 3, 18);
    text(ctx, 'subamortecido (oscila)', (X(0) + X(1)) / 2, y + 22, { size: 10, color: C.curve1, align: 'center' });
    text(ctx, 'crítico', X(1), y + 22, { size: 10, color: C.good, align: 'center', bold: true });
    text(ctx, 'superamortecido', (X(1) + X(ZMAX)) / 2 + 12, y + 22, { size: 10, color: C.violet, align: 'center' });
    text(ctx, '0', X(0), y - 12, { size: 10, color: C.dim, align: 'center' });
    text(ctx, '1', X(1), y - 12, { size: 10, color: C.dim, align: 'center' });
    text(ctx, '1,5', X(ZMAX), y - 12, { size: 10, color: C.dim, align: 'center' });
    const mx = X(clamp(st.zeta, 0, ZMAX));
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mx, y, 7, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  // ---------------------------------------------------------------- livre com absorvedor: modos naturais
  function drawModes(ctx: CanvasRenderingContext2D, st: VibState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, LOW.x - 44, LOW.y - 26, LOW.w + 58, LOW.h + 62 + 60, 8);
    ctx.fill();
    text(ctx, 'Modos naturais (2 graus de liberdade)', LOW.x - 36, LOW.y - 9, { size: 13, bold: true });
    const groundY = LOW.y + LOW.h + 70;
    const w1 = w1Of(st);
    const w2 = w2Of(st);
    const cols: [number, number, number, string, string][] = [
      [LOW.x + 70, st.a1, w1, '1º modo', 'em fase'],
      [LOW.x + 270, st.a2, w2, '2º modo', 'em oposição'],
    ];
    cols.forEach(([x, a, w, name, kind], i) => {
      const s = 1 / Math.max(1, Math.abs(a));
      const ph = Math.sin(modeT * TAU * 0.55 * (w / w1));
      const dm = 26 * s * ph;
      const da = 26 * s * a * ph;
      const yM = groundY - 70 - dm;
      const yA = groundY - 140 - da;
      ctx.fillStyle = '#3a4656';
      ctx.fillRect(x - 40, groundY, 80, 8);
      springPath(ctx, x, yM + 20, groundY, 18, 4, C.metalLight, 2);
      springPath(ctx, x, yA + 14, yM, 14, 3, ABS_COLOR, 2);
      ctx.fillStyle = '#3d6fb0';
      roundRect(ctx, x - 30, yM, 60, 20, 4);
      ctx.fill();
      text(ctx, 'm', x, yM + 15, { size: 12, bold: true, align: 'center' });
      ctx.fillStyle = '#d99a45';
      roundRect(ctx, x - 20, yA, 40, 14, 3);
      ctx.fill();
      text(ctx, 'mₐ', x, yA + 11, { size: 11, bold: true, color: '#3a2a10', align: 'center' });
      // setas da forma modal (amplitude relativa)
      const ax = x + 46;
      arrow(ctx, ax, groundY - 60, ax, groundY - 60 - 26 * s, MOTOR_COLOR, 2, 7);
      arrow(ctx, ax + 16, groundY - 133, ax + 16, groundY - 133 - 26 * s * a, ABS_COLOR, 2, 7);
      const n = (w * 60) / TAU;
      text(ctx, `${name}: ${f0(n)} rpm (${f1(n / 60)} Hz)`, x - 60, LOW.y + 14, { size: 12, bold: true, color: i === 0 ? C.curve3 : C.curve4 });
      text(ctx, `xₐ/x = ${a > 0 ? '+' : ''}${f2(a)} · ${kind}`, x - 60, LOW.y + 30, { size: 11, color: C.dim });
    });
    text(ctx, 'Solte num modo ("1º modo" / "2º modo") e o sistema vibra só naquela frequência.', LOW.x - 36, groundY + 30, { size: 11, color: C.dim });
  }

  const inLow = (x: number, y: number) => x >= LOW.x - 8 && x <= LOW.x + LOW.w + 8 && y >= LOW.y - 12 && y <= LOW.y + LOW.h + 12;
  const inRuler = (x: number, y: number) => x >= RULER.x - 12 && x <= RULER.x + RULER.w + 12 && y >= RULER.y - 18 && y <= RULER.y + 18;
  const onMotor = (x: number, y: number) => {
    const d = disp(x1Now);
    return x >= PLATE.x - 6 && x <= DISK.x + DISK.r + 6 && y >= BODY.top - 16 - d && y <= PLATE.top + PLATE.h + 8 - d;
  };

  function release(r: Req): void {
    req = r;
    phase = 'hold';
    holdT = 0.35;
    trace = [];
    tRel = 0;
    recording = true;
  }

  return {
    reset() {
      trace = [];
      tsim = 0;
      theta = 0;
      lastMode = -1;
      lastKey = '';
      phase = 'hold';
      holdT = 0.7;
      req = 'pull';
      tRel = 0;
      recording = true;
      dragTarget = null;
      grab = null;
    },
    actions: [
      {
        label: '↓ Puxar e soltar',
        title: 'Desloca o motor 2 mm para baixo e solta (vibração livre).',
        run(api) {
          if (!api.isLocked('mode')) api.set({ mode: 0 });
          release('pull');
        },
      },
      {
        label: '1º modo',
        title: 'Liga o absorvedor e solta o sistema na forma do 1º modo natural.',
        run(api) {
          const set: LabValues = {};
          if (!api.isLocked('mode')) set.mode = 0;
          if (!api.isLocked('abs')) set.abs = 1;
          api.set(set);
          release('m1');
        },
      },
      {
        label: '2º modo',
        title: 'Liga o absorvedor e solta o sistema na forma do 2º modo natural.',
        run(api) {
          const set: LabValues = {};
          if (!api.isLocked('mode')) set.mode = 0;
          if (!api.isLocked('abs')) set.abs = 1;
          api.set(set);
          release('m2');
        },
      },
    ],
    pointer(kind, x, y, v) {
      const free = Math.round(v.mode ?? 1) === 0;
      const abs = Math.round(v.abs ?? 0) === 1;
      if (kind === 'down') {
        dragTarget = null;
        if (free && onMotor(x, y)) {
          dragTarget = 'motor';
          grab = { y, x: phase === 'run' ? x1Now : sim.x1 };
          dragX = clamp(grab.x, -3 * X0 / 2, (3 * X0) / 2);
          phase = 'drag';
        } else if (!free && inLow(x, y)) dragTarget = 'rpm';
        else if (free && !abs && inRuler(x, y)) dragTarget = 'zeta';
      }
      if (!dragTarget) return null;
      if (dragTarget === 'motor') {
        if (grab) dragX = clamp(grab.x - (y - grab.y) / (PX_MM * 1000), (-3 * X0) / 2, (3 * X0) / 2);
        if (kind === 'up') {
          phase = 'run';
          sim = { x1: dragX, v1: 0, x2: dragX, v2: 0 };
          tRel = 0;
          trace = [{ t: 0, x1: dragX, x2: dragX }];
          recording = true;
          dragTarget = null;
          grab = null;
        }
        return null;
      }
      const out: LabValues = {};
      if (dragTarget === 'rpm') out.rpm = Math.round(clamp(((x - LOW.x) / LOW.w) * NMAX, 0, NMAX) / 10) * 10;
      else out.zeta = Math.round(clamp(((x - RULER.x) / RULER.w) * ZMAX, 0, ZMAX) * 100) / 100;
      if (kind === 'up') dragTarget = null;
      return out;
    },
    cursor(x, y, v) {
      const free = Math.round(v.mode ?? 1) === 0;
      if (free && onMotor(x, y)) return 'ns-resize';
      if (!free && inLow(x, y)) return 'ew-resize';
      if (free && Math.round(v.abs ?? 0) !== 1 && inRuler(x, y)) return 'ew-resize';
      return 'default';
    },
    draw(ctx, v, _o, dt) {
      const st = vibState(v);
      update(st, Math.min(dt, 0.05));
      drawCalc(ctx, st);
      drawScene(ctx, st);
      drawScope(ctx, st, dt);
      if (!st.free) drawResponse(ctx, st, dt);
      else if (st.abs) drawModes(ctx, st);
      else drawRegimes(ctx, st);
    },
    status(v) {
      const st = vibState(v);
      if (st.free) {
        if (st.abs) return { tone: 'ok', text: `Dois graus de liberdade → duas frequências naturais (${f0(st.n1)} e ${f0(st.n2)} rpm) e dois modos. Solto de um jeito qualquer, o movimento mistura os dois modos.` };
        if (st.regime === 0) return { tone: 'warn', text: `Sem amortecimento: depois de solto, o motor oscila para sempre na frequência natural (${f2(st.fn)} Hz), com a mesma amplitude.` };
        if (st.regime === 1) return { tone: 'ok', text: `Subamortecido (0 < ζ < 1): oscila com amplitude decrescente, na frequência amortecida ωd = ${f1(st.wd)} rad/s — um pouco abaixo de ωn.` };
        if (st.regime === 2) return { tone: 'ok', text: 'Amortecimento crítico (ζ = 1): volta ao equilíbrio no menor tempo possível sem oscilar.' };
        return { tone: 'warn', text: `Superamortecido (ζ = ${f2(st.zeta)} > 1): volta sem oscilar, porém mais devagar que no amortecimento crítico.` };
      }
      if (st.rpm === 0) return { tone: 'ok', text: 'Motor parado: sem força de desbalanceamento, sem vibração forçada. Aumente a rotação.' };
      if (st.abs) {
        const na = (st.wa * 60) / TAU;
        if (Math.abs(st.rpm - na) / na < 0.03) return { tone: 'ok', text: `Rotação na sintonia do absorvedor: o motor quase para (X = ${f3(st.resp.X * 1000)} mm). A mola do absorvedor faz no motor uma força igual e oposta à do desbalanceamento.` };
        for (const n of [st.n1, st.n2]) if (Math.abs(st.rpm - n) / n < 0.06) return { tone: 'bad', text: `Ressonância do sistema de 2 graus: a rotação está perto de uma das duas frequências naturais (${f0(st.n1)} ou ${f0(st.n2)} rpm).` };
        return { tone: 'warn', text: `O absorvedor só anula a vibração perto da rotação de sintonia (${f0(na)} rpm) — e criou duas ressonâncias novas, em ${f0(st.n1)} e ${f0(st.n2)} rpm.` };
      }
      if (st.r > 0.85 && st.r < 1.18) return { tone: 'bad', text: `Ressonância! A rotação (${f0(st.rpm)} rpm) está perto da natural (${f0(st.ncrit)} rpm): amplitude ${f2(st.resp.X * 1000)} mm, limitada só pelo amortecimento.` };
      if (st.r < 0.85) return { tone: 'ok', text: `Abaixo da ressonância (r = ${f2(st.r)}): o motor acompanha a força quase em fase; aqui as molas não isolam (TR = ${f2(st.TR)} > 1).` };
      if (st.r < Math.SQRT2) return { tone: 'warn', text: `Acima da ressonância, mas r = ${f2(st.r)} < √2: a força no piso ainda é maior que a do desbalanceamento (TR = ${f2(st.TR)}).` };
      return { tone: 'ok', text: `Isolamento: r = ${f2(st.r)} > √2, a força no piso é ${f0(st.TR * 100)} % da força do desbalanceamento. Molas mais macias isolam ainda mais.` };
    },
  };
}
