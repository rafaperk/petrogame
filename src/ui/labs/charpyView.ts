/**
 * Desenho da bancada Charpy: a máquina (pêndulo que cai, rompe o corpo de prova e sobe do outro lado, empurrando o
 * ponteiro de arraste do mostrador), o banho térmico, a vista de cima do corpo de prova nos apoios, a curva de
 * transição (energia × temperatura) com os outros materiais ao fundo, a superfície de fratura e as contas.
 */
import { ALPHA0, CH_MATS, charpyEnergy, chState, E0, PENDULUM, type ChState } from '../../learning/labs/charpy';
import { arrow, C, Chart, fmt, marker, roundRect, tag, text, ticksOf } from './draw';
import type { LabView } from './views';

const f0 = (x: number) => fmt(x, 0);
const f2 = (x: number) => fmt(x, 2);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

/** Cor de cada material no gráfico. */
const MAT_COLORS = [C.curve1, C.curve4, C.curve3, C.violet];

// ------------------------------------------------------------------ máquina
const PV = { x: 212, y: 194 };
/** Braço do pêndulo (px) e escala px/m. */
const LP = 168;
const HEAD_R = 25;
const SPEC = { x: PV.x + 37, y: PV.y + LP, s: 15 };
const BASE_Y = PV.y + LP + 24;
const FLOOR_Y = 470;
const CHART = { x: 520, y: 48, w: 404, h: 196, x0: -120, x1: 120, y0: 0, y1: 220 };
const FACE = { x: 480, y: 330, s: 92 };

/** Cor do metal: azulada no frio, alaranjada no quente. */
function specColor(T: number): string {
  const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
  const metal = [169, 179, 189];
  if (T < 0) return mix(metal, [150, 200, 255], Math.min(1, -T / 120));
  if (T > 40) return mix(metal, [255, 170, 110], Math.min(1, (T - 40) / 80));
  return mix(metal, metal, 0);
}

/** Banho: álcool com gelo-seco (frio), água (ambiente) ou óleo (quente). */
function bathColor(T: number): string {
  if (T < 0) return `rgba(${Math.round(120 + T * 0.5)},${Math.round(170 + T * 0.4)},255,0.85)`;
  if (T <= 40) return 'rgba(110,190,235,0.75)';
  return `rgba(235,${Math.round(190 - (T - 40) * 0.8)},90,0.85)`;
}

/** Ângulo final (rad) para uma energia absorvida E (J). */
const betaOf = (E: number) => Math.acos(clamp(1 - (PENDULUM.h0 - E / (PENDULUM.m * PENDULUM.g)) / PENDULUM.L, -1, 1));

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  rest: boolean;
}

type Phase = 'arming' | 'ready' | 'swing' | 'rest';

export function charpyView(): LabView {
  let phase: Phase = 'ready';
  /** Ângulo a partir da vertical, positivo para a esquerda (lado de onde o martelo cai), e velocidade angular. */
  let phi = ALPHA0;
  let omega = 0;
  let readyT = 0.9;
  let broken = false;
  let peaked = false;
  /** Ângulo máximo atingido do lado direito (ponteiro de arraste). */
  let pointer = 0;
  let pieces: Piece[] = [];
  let lastKey = '';
  let flash = 0;

  function rearm(): void {
    phase = 'arming';
    broken = false;
    peaked = false;
    pointer = 0;
    pieces = [];
    omega = 0;
  }

  function step(st: ChState, dt: number): void {
    const key = `${st.idx}|${st.fine ? 1 : 0}|${Math.round(st.T)}`;
    if (key !== lastKey) {
      if (lastKey) rearm();
      lastKey = key;
    }
    flash = Math.max(0, flash - dt);
    if (phase === 'arming') {
      phi = Math.min(ALPHA0, phi + Math.max(0.6, ALPHA0 - phi) * 2.4 * dt + 0.02);
      if (phi >= ALPHA0 - 1e-3) {
        phi = ALPHA0;
        phase = 'ready';
        readyT = 0.45;
      }
    } else if (phase === 'ready') {
      readyT -= dt;
      if (readyT <= 0) {
        phase = 'swing';
        omega = 0;
      }
    } else if (phase === 'swing') {
      const k = PENDULUM.g / PENDULUM.L;
      const n = 8;
      const h = (dt * 0.8) / n;
      for (let i = 0; i < n; i++) {
        const prev = phi;
        omega += -k * Math.sin(phi) * h;
        if (peaked) omega -= 2.6 * omega * h;
        phi += omega * h;
        if (!broken && prev > 0 && phi <= 0) {
          // impacto: o corpo de prova absorve E
          broken = true;
          flash = 0.25;
          const ke = 0.5 * PENDULUM.m * PENDULUM.L ** 2 * omega ** 2;
          const left = Math.max(0, ke - st.E);
          omega = -Math.sqrt((2 * left) / (PENDULUM.m * PENDULUM.L ** 2));
          const speed = st.mode === 'brittle' ? 1 : st.mode === 'mixed' ? 0.7 : 0.45;
          for (const s of [-1, 1]) {
            pieces.push({
              x: SPEC.x + s * 4,
              y: SPEC.y,
              vx: (150 + 160 * speed) * (s > 0 ? 1.15 : 0.85),
              vy: -(60 + 140 * speed) * (s > 0 ? 1 : 0.6),
              rot: 0,
              vr: s * (4 + 8 * speed),
              w: SPEC.s / 2,
              h: SPEC.s,
              rest: false,
            });
          }
        }
        if (broken && phi < 0) pointer = Math.max(pointer, -phi);
        if (broken && !peaked && phi < 0 && omega >= 0) peaked = true;
      }
      if (peaked && Math.abs(omega) < 0.08 && Math.abs(phi) < 0.03) {
        phase = 'rest';
        phi = 0;
        omega = 0;
      }
    }
    // pedaços caindo até o chão
    for (const p of pieces) {
      if (p.rest) continue;
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > FLOOR_Y - 5) {
        p.y = FLOOR_Y - 5;
        p.vy *= -0.25;
        p.vx *= 0.5;
        p.vr *= 0.5;
        if (Math.abs(p.vy) < 30) p.rest = true;
      }
      if (p.x > 452) {
        p.x = 452;
        p.vx = -Math.abs(p.vx) * 0.3;
      }
    }
  }

  // ---------------------------------------------------------------- desenho da máquina
  function drawMachine(ctx: CanvasRenderingContext2D, st: ChState): void {
    // chão e base
    ctx.fillStyle = '#1a2738';
    ctx.fillRect(0, FLOOR_Y, 470, 12);
    ctx.fillStyle = '#3a4b60';
    roundRect(ctx, 76, BASE_Y, 276, FLOOR_Y - BASE_Y, 6);
    ctx.fill();
    ctx.fillStyle = '#2c3a4c';
    ctx.fillRect(84, BASE_Y + 10, 260, 6);
    // colunas e travessa
    for (const x of [106, 318]) {
      const g = ctx.createLinearGradient(x - 9, 0, x + 9, 0);
      g.addColorStop(0, '#6c7c8f');
      g.addColorStop(1, '#3b4757');
      ctx.fillStyle = g;
      ctx.fillRect(x - 9, PV.y - 22, 18, BASE_Y - PV.y + 22);
    }
    ctx.fillStyle = '#4a5a6e';
    roundRect(ctx, 96, PV.y - 34, 232, 18, 5);
    ctx.fill();
    // mostrador com escala em joules (lado direito: o martelo sobe para a direita)
    const DR = 48;
    ctx.fillStyle = '#e9eef3';
    ctx.beginPath();
    ctx.arc(PV.x, PV.y, DR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1b2430';
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let e = 0; e <= 290; e += 10) {
      const b = betaOf(e);
      const major = e % 50 === 0;
      const r0 = major ? DR - 10 : DR - 6;
      ctx.strokeStyle = '#1b2430';
      ctx.lineWidth = major ? 1.6 : 0.8;
      ctx.beginPath();
      ctx.moveTo(PV.x + Math.sin(b) * r0, PV.y + Math.cos(b) * r0);
      ctx.lineTo(PV.x + Math.sin(b) * (DR - 2), PV.y + Math.cos(b) * (DR - 2));
      ctx.stroke();
      if (major) text(ctx, f0(e), PV.x + Math.sin(b) * (DR - 19), PV.y + Math.cos(b) * (DR - 19) + 3, { size: 8, bold: true, color: '#1b2430', align: 'center' });
    }
    text(ctx, 'J', PV.x - 22, PV.y + 4, { size: 9, bold: true, color: '#56616e', align: 'center' });
    // ponteiro de arraste (empurrado pelo braço até o ângulo máximo)
    if (pointer > 0) {
      ctx.strokeStyle = C.bad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(PV.x, PV.y);
      ctx.lineTo(PV.x + Math.sin(pointer) * (DR - 3), PV.y + Math.cos(pointer) * (DR - 3));
      ctx.stroke();
    }
    // apoio e corpo de prova
    ctx.fillStyle = '#56616e';
    ctx.fillRect(SPEC.x - 14, SPEC.y + SPEC.s / 2, 28, BASE_Y - SPEC.y - SPEC.s / 2);
    ctx.fillStyle = '#2b3542';
    ctx.fillRect(SPEC.x - 14, SPEC.y + SPEC.s / 2, 28, 3);
    const metal = specColor(st.T);
    if (!broken) {
      ctx.fillStyle = metal;
      ctx.fillRect(SPEC.x - SPEC.s / 2, SPEC.y - SPEC.s / 2, SPEC.s, SPEC.s);
      ctx.strokeStyle = '#141c26';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(SPEC.x - SPEC.s / 2, SPEC.y - SPEC.s / 2, SPEC.s, SPEC.s);
      if (st.T < -10) {
        // gelo / névoa do banho frio
        ctx.fillStyle = 'rgba(230,245,255,0.55)';
        for (let i = 0; i < 5; i++) ctx.fillRect(SPEC.x - SPEC.s / 2 + i * 3, SPEC.y - SPEC.s / 2 - 1, 2, 2);
      }
    }
    for (const p of pieces) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = metal;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.strokeStyle = '#141c26';
      ctx.lineWidth = 1;
      ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    // braço e martelo
    const hx = PV.x - LP * Math.sin(phi);
    const hy = PV.y + LP * Math.cos(phi);
    ctx.strokeStyle = '#9aa7b4';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(PV.x, PV.y);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-phi);
    const hg = ctx.createRadialGradient(-8, -8, 4, 0, 0, HEAD_R + 4);
    hg.addColorStop(0, '#dfe6ee');
    hg.addColorStop(1, '#5b6775');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1b2430';
    ctx.lineWidth = 2;
    ctx.stroke();
    // cutelo (aresta que bate no corpo de prova), virado para o lado do movimento
    ctx.fillStyle = '#c8d1db';
    ctx.beginPath();
    ctx.moveTo(HEAD_R - 4, -9);
    ctx.lineTo(HEAD_R + 8, 0);
    ctx.lineTo(HEAD_R - 4, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#2b3542';
    ctx.beginPath();
    ctx.arc(PV.x, PV.y, 7, 0, Math.PI * 2);
    ctx.fill();
    if (flash > 0) {
      ctx.fillStyle = `rgba(255,236,170,${flash * 3})`;
      ctx.beginPath();
      ctx.arc(SPEC.x - 4, SPEC.y, 18 * (1 + flash * 2), 0, Math.PI * 2);
      ctx.fill();
    }
    // alturas do centro do martelo, medidas a partir do ponto de impacto
    const yB = PV.y + LP;
    const y0 = PV.y + LP * Math.cos(ALPHA0);
    const dim = (x: number, yTop: number, color: string, label: string, xFrom: number, align: CanvasTextAlign) => {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.55;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xFrom, yTop);
      ctx.lineTo(x, yTop);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      arrow(ctx, x, yB, x, yTop, color, 1.5, 7);
      arrow(ctx, x, yTop, x, yB, color, 1.5, 7);
      text(ctx, label, x + (align === 'left' ? 6 : -6), (yTop + yB) / 2, { size: 11, color, bold: true, align });
    };
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(36, yB);
    ctx.lineTo(440, yB);
    ctx.stroke();
    ctx.setLineDash([]);
    dim(40, y0, C.amber, `h₀ = ${f2(PENDULUM.h0)} m`, PV.x - LP * Math.sin(ALPHA0) - HEAD_R, 'left');
    if (pointer > 0 && (phase === 'rest' || peaked)) {
      const yf = PV.y + LP * Math.cos(pointer);
      dim(440, yf, C.bad, `hf = ${f2(st.hf)} m`, PV.x + LP * Math.sin(pointer) + HEAD_R, 'right');
    }
    // banho térmico
    const bath = { x: 14, y: 398, w: 52, h: 66 };
    ctx.fillStyle = '#d7dde3';
    ctx.fillRect(bath.x, bath.y, bath.w, bath.h);
    ctx.fillStyle = bathColor(st.T);
    ctx.fillRect(bath.x + 4, bath.y + 14, bath.w - 8, bath.h - 18);
    ctx.strokeStyle = '#1b2430';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bath.x, bath.y, bath.w, bath.h);
    text(ctx, 'banho', bath.x + bath.w / 2, bath.y - 18, { size: 10, color: C.dim, align: 'center' });
    text(ctx, `${f0(st.T)} °C`, bath.x + bath.w / 2, bath.y - 5, { size: 12, bold: true, color: C.text, align: 'center' });
    // estado
    const label = phase === 'swing' ? (broken ? '● subindo' : '● caindo') : phase === 'arming' ? 'armando o pêndulo' : phase === 'ready' ? 'pronto' : 'ensaio concluído';
    tag(ctx, label, 452, 20, phase === 'rest' ? C.good : C.amber, 'right', 10);
  }

  /** Vista de cima: barra nos apoios, entalhe do lado oposto ao cutelo. */
  function drawTopView(ctx: CanvasRenderingContext2D, st: ChState): void {
    const x0 = 98;
    const y0 = 494;
    text(ctx, 'vista de cima: 10 × 10 × 55 mm, entalhe em V', 16, y0, { size: 10, color: C.dim });
    const L = 165;
    const t = 16;
    const yc = y0 + 36;
    const xm = x0 + L / 2;
    ctx.fillStyle = '#56616e';
    ctx.fillRect(xm - 66, yc + t / 2, 12, 10);
    ctx.fillRect(xm + 54, yc + t / 2, 12, 10);
    const color = specColor(st.T);
    const half = (sgn: number, bend: number) => {
      ctx.save();
      ctx.translate(xm, yc);
      ctx.rotate(sgn * bend);
      ctx.fillStyle = color;
      ctx.strokeStyle = '#141c26';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (sgn < 0) {
        ctx.moveTo(-L / 2, -t / 2);
        ctx.lineTo(-3, -t / 2);
        ctx.lineTo(0, t / 2 - 4);
        ctx.lineTo(-2, t / 2);
        ctx.lineTo(-L / 2, t / 2);
      } else {
        ctx.moveTo(3, -t / 2);
        ctx.lineTo(L / 2, -t / 2);
        ctx.lineTo(L / 2, t / 2);
        ctx.lineTo(2, t / 2);
        ctx.lineTo(0, t / 2 - 4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    if (!broken) {
      ctx.fillStyle = color;
      ctx.strokeStyle = '#141c26';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xm - L / 2, yc - t / 2);
      ctx.lineTo(xm + L / 2, yc - t / 2);
      ctx.lineTo(xm + L / 2, yc + t / 2);
      ctx.lineTo(xm + 4, yc + t / 2);
      ctx.lineTo(xm, yc + t / 2 - 6);
      ctx.lineTo(xm - 4, yc + t / 2);
      ctx.lineTo(xm - L / 2, yc + t / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // dúctil: as metades dobram e ficam presas; frágil: separam retas
      const bend = st.mode === 'brittle' ? 0 : st.mode === 'mixed' ? 0.12 : 0.26;
      ctx.save();
      ctx.translate(st.mode === 'brittle' ? -8 : 0, 0);
      half(-1, -bend);
      ctx.restore();
      ctx.save();
      ctx.translate(st.mode === 'brittle' ? 8 : 0, 0);
      half(1, -bend);
      ctx.restore();
    }
    // cutelo
    ctx.fillStyle = '#c8d1db';
    ctx.beginPath();
    ctx.moveTo(xm - 7, yc - t / 2 - 13);
    ctx.lineTo(xm + 7, yc - t / 2 - 13);
    ctx.lineTo(xm, yc - t / 2 - 2);
    ctx.closePath();
    ctx.fill();
    text(ctx, 'cutelo', xm + 12, yc - t / 2 - 6, { size: 9, color: C.dim });
  }

  // ---------------------------------------------------------------- gráfico, fratura e contas
  function drawChart(ctx: CanvasRenderingContext2D, st: ChState): void {
    const ch = new Chart(ctx, CHART);
    ch.frame('Energia absorvida × temperatura', 'temperatura (°C)', 'J', ticksOf(-120, 120, 40), ticksOf(0, 200, 50));
    const temps = Array.from({ length: 121 }, (_, i) => -120 + i * 2);
    // os outros materiais, apagados
    CH_MATS.forEach((m, i) => {
      for (const fine of m.steel ? [false, true] : [false]) {
        if (i === st.idx && fine === st.fine) continue;
        const dash = fine ? [5, 4] : [];
        ctx.globalAlpha = i === st.idx ? 0.45 : 0.22;
        ch.poly(
          temps.map((T) => [T, charpyEnergy(m, fine, T)]),
          MAT_COLORS[i],
          2,
          dash,
        );
        ctx.globalAlpha = 1;
      }
    });
    const col = MAT_COLORS[st.idx];
    ch.poly(
      temps.map((T) => [T, charpyEnergy(st.m, st.fine, T)]),
      col,
      3,
    );
    // 27 J
    ctx.strokeStyle = 'rgba(255,201,77,0.55)';
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ch.X(-120), ch.Y(27));
    ctx.lineTo(ch.X(120), ch.Y(27));
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, '27 J', ch.X(120) - 4, ch.Y(27) - 4, { size: 10, color: C.amber, align: 'right' });
    if (st.m.steel) {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(ch.X(st.tt), CHART.y);
      ctx.lineTo(ch.X(st.tt), CHART.y + CHART.h);
      ctx.stroke();
      ctx.setLineDash([]);
      tag(ctx, `transição: ${f0(st.tt)} °C`, ch.X(st.tt), CHART.y + 14, C.text, st.tt > 60 ? 'right' : 'left', 10);
      const up = charpyEnergy(st.m, st.fine, 200);
      const low = charpyEnergy(st.m, st.fine, -300);
      text(ctx, 'patamar superior (dúctil)', ch.X(118), ch.Y(up) + 15, { size: 10, color: C.dim, align: 'right' });
      text(ctx, 'patamar inferior (frágil)', ch.X(-118), ch.Y(low) - 7, { size: 10, color: C.dim });
    } else {
      text(ctx, `${st.m.crystal}: sem transição`, ch.X(0), ch.Y(charpyEnergy(st.m, false, 0)) - 12, { size: 11, bold: true, color: col, align: 'center' });
    }
    marker(ch, ctx, st.T, st.E);
    if (st.E < 40) tag(ctx, `${f0(st.E)} J`, ch.X(st.T), ch.Y(st.E) - 26, C.amber, 'center', 11);
    else tag(ctx, `${f0(st.E)} J`, ch.X(st.T) + (st.T > 60 ? -12 : 12), ch.Y(st.E) + (st.E > 150 ? 22 : -10), C.amber, st.T > 60 ? 'right' : 'left', 11);
    // legenda
    let lx = CHART.x + 4;
    const ly = CHART.y + CHART.h + 44;
    CH_MATS.forEach((m, i) => {
      ctx.strokeStyle = MAT_COLORS[i];
      ctx.lineWidth = i === st.idx ? 3 : 2;
      ctx.globalAlpha = i === st.idx ? 1 : 0.55;
      ctx.beginPath();
      ctx.moveTo(lx, ly - 4);
      ctx.lineTo(lx + 14, ly - 4);
      ctx.stroke();
      ctx.globalAlpha = 1;
      text(ctx, m.short, lx + 18, ly, { size: 11, color: i === st.idx ? C.text : C.dim, bold: i === st.idx });
      lx += 26 + m.short.length * 6.2;
    });
    text(ctx, '- - - grão fino', lx + 6, ly, { size: 11, color: C.dim });
  }

  function drawFracture(ctx: CanvasRenderingContext2D, st: ChState): void {
    const { x, y, s } = FACE;
    text(ctx, 'Superfície de fratura', x - 6, y - 22, { size: 13, bold: true });
    const fib = st.shear / 100;
    const ductile = st.mode !== 'brittle';
    for (let k = 0; k < 2; k++) {
      const x0 = x + k * (s + 18);
      // expansão lateral do lado comprimido (embaixo) quando dúctil
      const bulge = 8 * fib * (st.E / 200);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + s, y);
      ctx.lineTo(x0 + s + bulge, y + s);
      ctx.lineTo(x0 - bulge, y + s);
      ctx.closePath();
      ctx.fillStyle = broken ? '#8f969d' : '#3a4656';
      ctx.fill();
      ctx.clip();
      if (broken) {
        // região cristalina (frágil) no centro: área = 1 − fração fibrosa
        const cr = Math.sqrt(1 - fib);
        const cw = s * 0.86 * cr;
        const chh = s * 0.8 * cr;
        const cx = x0 + s / 2;
        const cy = y + s * 0.5;
        // textura fibrosa (alvéolos)
        for (let i = 0; i < 70; i++) {
          const px = x0 - bulge + ((i * 37) % 100) / 100 * (s + 2 * bulge);
          const py = y + ((i * 61) % 100) / 100 * s;
          ctx.fillStyle = i % 2 ? 'rgba(60,64,70,0.35)' : 'rgba(200,205,210,0.25)';
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        if (cw > 1) {
          ctx.fillStyle = '#d9e2ea';
          ctx.fillRect(cx - cw / 2, cy - chh / 2, cw, chh);
          // facetas de clivagem brilhando
          for (let i = 0; i < 26 * cr; i++) {
            const px = cx - cw / 2 + ((i * 53) % 100) / 100 * cw;
            const py = cy - chh / 2 + ((i * 29) % 100) / 100 * chh;
            ctx.fillStyle = i % 3 ? '#ffffff' : '#9fb1c2';
            ctx.fillRect(px, py, 3, 2);
          }
        }
      } else {
        text(ctx, '?', x0 + s / 2, y + s / 2 + 6, { size: 18, bold: true, color: C.dim, align: 'center' });
      }
      ctx.restore();
      // entalhe em cima
      ctx.fillStyle = C.bg;
      ctx.beginPath();
      ctx.moveTo(x0 + s / 2 - 7, y - 1);
      ctx.lineTo(x0 + s / 2 + 7, y - 1);
      ctx.lineTo(x0 + s / 2, y + 9);
      ctx.closePath();
      ctx.fill();
    }
    text(ctx, 'entalhe', x + s / 2, y - 5, { size: 9, color: C.dim, align: 'center' });
    if (broken) {
      const t = ductile ? (st.mode === 'ductile' ? 'dúctil: fibrosa, opaca' : 'mista') : 'frágil: brilhante (clivagem)';
      text(ctx, t, x - 4, y + s + 22, { size: 11, bold: true, color: ductile ? C.good : C.bad });
      text(ctx, `fibrosa ${f0(st.shear)} % · cristalina ${f0(100 - st.shear)} %`, x - 4, y + s + 38, { size: 11, color: C.dim });
    } else text(ctx, 'rompa o corpo de prova para ver', x - 4, y + s + 22, { size: 11, color: C.dim });
  }

  function drawCalc(ctx: CanvasRenderingContext2D, st: ChState): void {
    const x = 712;
    let y = 316;
    ctx.fillStyle = C.bg2;
    roundRect(ctx, x - 12, y - 20, 248, 196, 8);
    ctx.fill();
    const line = (s: string, color: string = C.text, size = 12, bold = false) => {
      text(ctx, s, x, y, { size, color, bold });
      y += 18;
    };
    const { m, g, h0, L } = PENDULUM;
    line('Energia absorvida', C.amber, 12, true);
    line('E = m·g·(h₀ − hf)');
    line(`= ${f0(m)} × ${fmt(g, 2)} × (${f2(h0)} − ${f2(st.hf)})`, C.dim, 11);
    line(`= ${f0(st.E)} J`, C.text, 13, true);
    y += 4;
    line('Energia do pêndulo', C.amber, 12, true);
    line(`m·g·h₀ = ${f0(E0)} J`, C.dim, 11);
    y += 4;
    line('Altura final pelo ângulo β', C.amber, 12, true);
    line(`hf = L·(1 − cos β), L = ${f2(L)} m`, C.dim, 11);
    line(`β = ${f0((st.beta * 180) / Math.PI)}° → hf = ${f2(st.hf)} m`, C.dim, 11);
  }

  return {
    reset() {
      lastKey = '';
      phi = ALPHA0;
      phase = 'ready';
      readyT = 0.9;
      broken = false;
      peaked = false;
      pointer = 0;
      pieces = [];
    },
    actions: [
      {
        label: '▶ Novo ensaio',
        title: 'Arma o pêndulo, coloca um corpo de prova novo e solta.',
        run() {
          rearm();
        },
      },
    ],
    pointer(kind, x, y) {
      if (kind === 'up') return null;
      const inChart = x >= CHART.x - 8 && x <= CHART.x + CHART.w + 8 && y >= CHART.y - 12 && y <= CHART.y + CHART.h + 12;
      if (!inChart) return null;
      return { T: Math.round(clamp(CHART.x0 + ((x - CHART.x) / CHART.w) * (CHART.x1 - CHART.x0), -120, 120)) };
    },
    cursor(x, y) {
      return x >= CHART.x && x <= CHART.x + CHART.w && y >= CHART.y && y <= CHART.y + CHART.h ? 'ew-resize' : 'default';
    },
    draw(ctx, v, _o, dt) {
      const st = chState(v);
      step(st, Math.min(dt, 0.05));
      drawMachine(ctx, st);
      drawTopView(ctx, st);
      drawChart(ctx, st);
      drawFracture(ctx, st);
      drawCalc(ctx, st);
    },
    status(v) {
      const st = chState(v);
      const m = st.m;
      if (!m.steel) {
        if (st.idx === 2) return { tone: 'ok', text: `Inox austenítico (CFC): sem transição dúctil-frágil. A ${f0(st.T)} °C ainda absorve ${f0(st.E)} J com fratura fibrosa — por isso vai em tanques criogênicos.` };
        return { tone: 'ok', text: `Alumínio (CFC): também sem transição — a fratura é dúctil em qualquer temperatura, mas a energia é baixa (${f0(st.E)} J): resistência e ductilidade menores que as do aço.` };
      }
      if (st.mode === 'ductile') return { tone: 'ok', text: `Patamar superior: fratura dúctil (fibrosa, opaca, com lábios de cisalhamento). O corpo de prova absorveu ${f0(st.E)} J e o martelo só subiu até ${f2(st.hf)} m.` };
      if (st.mode === 'brittle') return { tone: 'bad', text: `Patamar inferior: fratura frágil por clivagem (plana e brilhante). Só ${f0(st.E)} J — o martelo quase volta à altura de partida. Estamos abaixo da temperatura de transição (${f0(st.tt)} °C).` };
      return { tone: 'warn', text: `Região de transição: fratura mista (${f0(st.shear)} % fibrosa). Aqui poucos graus mudam muito a energia — e a dispersão entre corpos de prova é grande.` };
    },
  };
}
