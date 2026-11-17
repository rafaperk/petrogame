/**
 * Desenho da bancada do ensaio de tração: máquina universal (colunas com fuso, travessa móvel, célula de
 * carga, garras e extensômetro), o corpo de prova alongando, formando o pescoço e rompendo; o diagrama σ × ε
 * (com a tensão verdadeira e as curvas dos outros materiais ao fundo), a ampliação do trecho elástico com a
 * paralela a 0,2 % e as contas.
 */
import {
  curveKnots,
  curveStress,
  MATERIALS,
  matOf,
  OFFSET,
  SPECIMEN,
  tensileState,
  trueStress,
  type TensileMat,
  type TensileState,
} from '../../learning/labs/tensile';
import { arrow, C, Chart, fmt, marker, roundRect, tag, text, ticksOf } from './draw';
import type { LabView } from './views';

const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
const f2 = (x: number) => fmt(x, 2);
const f3 = (x: number) => fmt(x, 3);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

/** Cor de cada material nos gráficos. */
const MAT_COLORS = [C.curve1, C.curve2, C.curve3, C.curve4];
/** Cor do metal no desenho. */
const METAL = ['#9aa7b4', '#7f8c9c', '#c9d2dc', '#5f6670'];

// ------------------------------------------------------------------ máquina (coordenadas lógicas)
const MX = 150;
/** Escala do corpo de prova: px por mm. */
const PXMM = 3;
const G0 = SPECIMEN.L0 * PXMM;
const Y_GAUGE = 170;
const SHOULDER = 18;
const HEAD = 44;
const HEAD_W = 52;
const COLS = [36, 264];
const TOP_Y0 = 28;
const TOP_Y1 = 70;
const BASE_Y = 500;

// ------------------------------------------------------------------ gráficos
const MAIN = { x: 372, y: 42, w: 556, h: 196, x0: 0, x1: 35, y0: 0, y1: 1000 };
const ZOOM = { x: 372, y: 318, w: 236, h: 184, x0: 0, x1: 1, y0: 0, y1: 1000 };
const ZOOM_MAX = 0.01;

/** Curva de carregamento amostrada (ε em fração, σ em MPa), densa perto de zero e com as quinas exatas. */
const CURVES: [number, number][][] = MATERIALS.map((m) => {
  const es = new Set<number>();
  const N = 320;
  for (let i = 0; i <= N; i++) es.add(m.ef * (i / N) ** 2);
  for (let i = 0; i <= 120; i++) es.add(Math.min(m.ef, (ZOOM_MAX * i) / 120));
  for (const k of curveKnots(m)) es.add(k);
  return [...es].sort((a, b) => a - b).map((e) => [e, curveStress(m, e)] as [number, number]);
});

/** Trecho da curva de 0 até `e` (inclusive), em % × MPa. */
function traced(idx: number, e: number, fn: (m: TensileMat, e: number) => number = curveStress): [number, number][] {
  const m = MATERIALS[idx];
  const end = Math.min(e, m.ef);
  const out: [number, number][] = [];
  for (const [x, s] of CURVES[idx]) {
    if (x > end) break;
    out.push([x * 100, fn === curveStress ? s : fn(m, x)]);
  }
  if (end > 0) out.push([end * 100, fn(m, end)]);
  return out;
}

const PHASE_NAME: Record<TensileState['phase'], string> = {
  zero: 'Sem carga',
  elastic: 'Regime elástico',
  yield: 'Escoamento',
  hardening: 'Encruamento',
  necking: 'Estricção',
  broken: 'Rompido',
  unloaded: 'Descarregado',
};

export function tensileView(): LabView {
  let running = false;
  /** Deformação "contínua" do ensaio automático (o controle anda de 0,01 em 0,01 %). */
  let runEps = 0;
  let screw = 0;
  /** Tempo desde a ruptura (o estalo) e se já estava rompido no quadro anterior. */
  let crackT = 0;
  let wasBroken = false;
  let lastMat = -1;

  // ---------------------------------------------------------------- corpo de prova
  /** Meia largura (px) do trecho útil a `t` (0 a 1) do comprimento, com o pescoço no meio. */
  function halfWidth(t: number, uniform: number, neck: number): number {
    if (neck >= uniform - 1e-6) return uniform;
    const z = (t - 0.5) / 0.11;
    return uniform - (uniform - neck) * Math.exp(-z * z);
  }

  /** Contorno de um pedaço do corpo de prova entre y0 e y1 (px), com a meia largura dada por `hw(y)`. */
  function piece(ctx: CanvasRenderingContext2D, y0: number, y1: number, hw: (y: number) => number, color: string, endTop?: (x: number) => number, endBottom?: (x: number) => number): void {
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    const step = 2;
    for (let y = y0; y <= y1 + 0.01; y += step) {
      const yy = Math.min(y, y1);
      const w = hw(yy);
      left.push([MX - w, yy]);
      right.push([MX + w, yy]);
    }
    const g = ctx.createLinearGradient(MX - HEAD_W / 2, 0, MX + HEAD_W / 2, 0);
    g.addColorStop(0, '#eef3f8');
    g.addColorStop(0.25, color);
    g.addColorStop(0.75, color);
    g.addColorStop(1, '#3d454f');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#1b2430';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // ponta de cima (superfície de fratura, se houver)
    if (endTop) {
      const w = hw(y0);
      for (let i = 0; i <= 8; i++) {
        const x = MX - w + (2 * w * i) / 8;
        ctx.lineTo(x, y0 + endTop((x - MX) / Math.max(1, w)));
      }
    } else {
      ctx.moveTo(left[0][0], left[0][1]);
      ctx.lineTo(right[0][0], right[0][1]);
    }
    for (const p of right) ctx.lineTo(p[0], p[1]);
    if (endBottom) {
      const w = hw(y1);
      for (let i = 0; i <= 8; i++) {
        const x = MX + w - (2 * w * i) / 8;
        ctx.lineTo(x, y1 + endBottom((x - MX) / Math.max(1, w)));
      }
    }
    for (let i = left.length - 1; i >= 0; i--) ctx.lineTo(left[i][0], left[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawMachine(ctx: CanvasRenderingContext2D, st: TensileState, dt: number): void {
    const m = st.m;
    // forma das partes e posição da travessa (que fica onde a máquina parou)
    const eShape = st.broken ? st.along : st.unloaded ? st.ep : st.e;
    const eCross = st.broken ? Math.max(st.e, m.ef) : eShape;
    const G = G0 * (1 + eShape);
    const Gc = G0 * (1 + eCross);
    const lowHeadTop = Y_GAUGE + Gc + SHOULDER;
    const lowHeadBot = lowHeadTop + HEAD;
    const crossY = lowHeadBot + 4;

    // base e colunas com fuso (as roscas andam quando a máquina puxa)
    if (running) screw = (screw + dt * 26) % 12;
    ctx.fillStyle = '#26384c';
    roundRect(ctx, 8, BASE_Y, 284, 50, 6);
    ctx.fill();
    for (const cx of COLS) {
      ctx.fillStyle = '#5b6878';
      ctx.fillRect(cx - 6, TOP_Y1, 12, BASE_Y - TOP_Y1);
      ctx.strokeStyle = 'rgba(20,28,38,0.6)';
      ctx.lineWidth = 1.4;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - 6, TOP_Y1, 12, BASE_Y - TOP_Y1);
      ctx.clip();
      for (let y = TOP_Y1 - 12 + screw; y < BASE_Y; y += 12) {
        ctx.beginPath();
        ctx.moveTo(cx - 6, y);
        ctx.lineTo(cx + 6, y + 5);
        ctx.stroke();
      }
      ctx.restore();
    }
    // travessa superior (fixa) com o mostrador de força
    ctx.fillStyle = '#2f6f9f';
    roundRect(ctx, 16, TOP_Y0, 268, TOP_Y1 - TOP_Y0, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(16, TOP_Y0 + 3, 268, 5);
    ctx.fillStyle = '#0b1420';
    roundRect(ctx, 186, TOP_Y0 + 8, 90, 26, 4);
    ctx.fill();
    text(ctx, `${f1(st.F)} kN`, 270, TOP_Y0 + 27, { size: 14, bold: true, color: C.amber, align: 'right' });
    text(ctx, 'força', 192, TOP_Y0 + 19, { size: 8, color: C.dim });
    text(ctx, 'Máquina universal de ensaios', 24, TOP_Y0 + 25, { size: 10, bold: true, color: '#d6e6f5' });
    // célula de carga
    ctx.fillStyle = '#c8d1db';
    roundRect(ctx, MX - 20, TOP_Y1, 40, 24, 3);
    ctx.fill();
    ctx.fillStyle = '#56616e';
    ctx.fillRect(MX - 20, TOP_Y1 + 10, 40, 3);
    text(ctx, 'célula de carga', MX + 26, TOP_Y1 + 16, { size: 9, color: C.dim });

    // travessa móvel e garra inferior
    ctx.fillStyle = '#2f6f9f';
    roundRect(ctx, 16, crossY, 268, 30, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(16, crossY + 3, 268, 4);
    for (const cx of COLS) {
      ctx.fillStyle = '#1f4f75';
      ctx.fillRect(cx - 11, crossY - 3, 22, 36);
    }
    text(ctx, 'travessa móvel', COLS[1] - 16, crossY + 20, { size: 9, color: '#d6e6f5', align: 'right' });

    // corpo de prova
    const metal = METAL[st.idx];
    const wU = ((SPECIMEN.d0 * PXMM) / 2) * (m.brittle ? 1 : 1 / Math.sqrt(1 + Math.min(eShape, m.eu)));
    const wN = (st.d * PXMM) / 2;
    const headHW = HEAD_W / 2;
    const upHeadTop = Y_GAUGE - SHOULDER - HEAD;
    const shoulder = (y: number, yA: number, yB: number, wA: number, wB: number) => {
      const t = clamp((y - yA) / (yB - yA), 0, 1);
      return wA + (wB - wA) * (0.5 - 0.5 * Math.cos(Math.PI * t));
    };
    const neckOn = st.phase === 'necking' || (st.broken && !m.brittle) || (st.unloaded && st.e > m.eu);
    const gaugeHW = (y: number, top: number, len: number) => (neckOn ? halfWidth((y - top) / len, wU, wN) : st.broken ? wU : (st.d * PXMM) / 2);
    const upperHW = (yTopGauge: number, len: number) => (y: number) => {
      if (y < Y_GAUGE - SHOULDER) return headHW;
      if (y < Y_GAUGE) return shoulder(y, Y_GAUGE - SHOULDER, Y_GAUGE, headHW, gaugeHW(Y_GAUGE, yTopGauge, len));
      return gaugeHW(y, yTopGauge, len);
    };
    if (!st.broken) {
      const yEnd = Y_GAUGE + G;
      const hw = (y: number) => {
        if (y <= Y_GAUGE) return upperHW(Y_GAUGE, G)(y);
        if (y <= yEnd) return gaugeHW(y, Y_GAUGE, G);
        if (y <= yEnd + SHOULDER) return shoulder(y, yEnd, yEnd + SHOULDER, gaugeHW(yEnd, Y_GAUGE, G), headHW);
        return headHW;
      };
      piece(ctx, upHeadTop, yEnd + SHOULDER + HEAD, hw, metal);
      // marcas de referência (L₀)
      ctx.strokeStyle = '#1b2430';
      ctx.lineWidth = 2;
      for (const y of [Y_GAUGE, yEnd]) {
        ctx.beginPath();
        ctx.moveTo(MX - hw(y) + 2, y);
        ctx.lineTo(MX + hw(y) - 2, y);
        ctx.stroke();
      }
    } else {
      // duas partes: cada uma com meio pescoço; fratura em taça e cone (dúctil) ou plana (frágil)
      const half = G / 2;
      const gap = Math.max(5, Gc - G);
      const yBreakUp = Y_GAUGE + half - 2;
      const yBreakLow = Y_GAUGE + half + gap - 2;
      const lowGaugeEnd = Y_GAUGE + Gc;
      // a ponta de cima (cone) encaixa na de baixo (taça): o mesmo perfil nas duas faces
      const frac = m.brittle ? (u: number) => Math.sin(u * 9) * 1.2 : (u: number) => 5 * (1 - Math.abs(u));
      const hwUp = (y: number) => upperHW(Y_GAUGE, G)(y);
      piece(ctx, upHeadTop, yBreakUp, hwUp, metal, undefined, frac);
      const shift = lowGaugeEnd - (Y_GAUGE + G);
      const hwLow = (y: number) => {
        const yy = y - shift;
        const yEnd = Y_GAUGE + G;
        if (yy <= yEnd) return gaugeHW(Math.max(yy, Y_GAUGE + half), Y_GAUGE, G);
        if (yy <= yEnd + SHOULDER) return shoulder(yy, yEnd, yEnd + SHOULDER, gaugeHW(yEnd, Y_GAUGE, G), headHW);
        return headHW;
      };
      piece(ctx, yBreakLow, lowGaugeEnd + SHOULDER + HEAD, hwLow, metal, frac);
      ctx.strokeStyle = '#1b2430';
      ctx.lineWidth = 2;
      for (const [y, w] of [
        [Y_GAUGE, hwUp(Y_GAUGE)],
        [lowGaugeEnd, hwLow(lowGaugeEnd)],
      ]) {
        ctx.beginPath();
        ctx.moveTo(MX - w + 2, y);
        ctx.lineTo(MX + w - 2, y);
        ctx.stroke();
      }
      // estalo da ruptura
      if (crackT > 0) {
        const a = clamp(crackT / 0.7, 0, 1);
        const yc = (yBreakUp + yBreakLow) / 2;
        ctx.strokeStyle = `rgba(255,230,140,${a})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
          const ang = (i / 10) * Math.PI * 2 + 0.3;
          const r0 = 8 + (1 - a) * 10;
          const r1 = r0 + 10 + 8 * a;
          ctx.beginPath();
          ctx.moveTo(MX + Math.cos(ang) * r0, yc + Math.sin(ang) * r0 * 0.6);
          ctx.lineTo(MX + Math.cos(ang) * r1, yc + Math.sin(ang) * r1 * 0.6);
          ctx.stroke();
        }
      }
    }

    // garras (cunhas) por cima das cabeças
    const jaws = (y0: number, y1: number) => {
      for (const side of [-1, 1]) {
        const xIn = MX + side * (headHW + 1);
        const xOut = MX + side * (headHW + 14);
        ctx.fillStyle = '#3e4a58';
        ctx.beginPath();
        ctx.moveTo(xIn, y0);
        ctx.lineTo(xOut, y0);
        ctx.lineTo(xOut, y1);
        ctx.lineTo(xIn, y1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#8b98a7';
        ctx.lineWidth = 1;
        for (let y = y0 + 4; y < y1 - 2; y += 5) {
          ctx.beginPath();
          ctx.moveTo(xIn, y);
          ctx.lineTo(xIn + side * 3, y + 2);
          ctx.stroke();
        }
      }
    };
    ctx.fillStyle = '#56616e';
    ctx.fillRect(MX - headHW - 14, TOP_Y1 + 24, HEAD_W + 28, upHeadTop + 6 - (TOP_Y1 + 24));
    jaws(upHeadTop + 2, Y_GAUGE - SHOULDER - 2);
    ctx.fillStyle = '#56616e';
    ctx.fillRect(MX - headHW - 14, lowHeadBot - 6, HEAD_W + 28, crossY - (lowHeadBot - 6));
    jaws(lowHeadTop + 2, lowHeadBot - 2);

    // extensômetro (sai depois do escoamento, antes de estragar no pescoço)
    if (!st.broken && st.e < 0.02) {
      const yA = Y_GAUGE;
      const yB = Y_GAUGE + G;
      const x0 = MX + 42;
      ctx.fillStyle = '#d9a441';
      roundRect(ctx, x0, yA + 22, 18, yB - yA - 44, 3);
      ctx.fill();
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 2;
      for (const y of [yA, yB]) {
        ctx.beginPath();
        ctx.moveTo(x0 + 9, y < (yA + yB) / 2 ? yA + 22 : yB - 22);
        ctx.lineTo(x0 + 9, y);
        ctx.lineTo(MX + wU + 1, y);
        ctx.stroke();
      }
      // rótulo de pé, dentro do corpo do extensômetro (ao lado fica a coluna da máquina)
      ctx.save();
      ctx.translate(x0 + 12, (yA + yB) / 2);
      ctx.rotate(-Math.PI / 2);
      text(ctx, 'extensômetro', 0, 0, { size: 8, bold: true, color: '#3a2a08', align: 'center' });
      ctx.restore();
    } else if (!st.broken) {
      text(ctx, 'extensômetro', MX + 34, Y_GAUGE + 20, { size: 9, color: C.dim });
      text(ctx, 'retirado', MX + 34, Y_GAUGE + 32, { size: 9, color: C.dim });
    }

    // cota do comprimento entre marcas
    const xd = MX - 50;
    const yTop = Y_GAUGE;
    const yBot = Y_GAUGE + (st.broken ? Gc : G);
    ctx.strokeStyle = C.dim;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (const y of [yTop, yBot]) {
      ctx.beginPath();
      ctx.moveTo(xd - 4, y);
      ctx.lineTo(MX - 22, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    arrow(ctx, xd, (yTop + yBot) / 2, xd, yTop + 1, C.dim, 1.2, 6);
    arrow(ctx, xd, (yTop + yBot) / 2, xd, yBot - 1, C.dim, 1.2, 6);
    const lenTxt = st.broken ? `Lf = ${(st.along < 0.01 ? f3 : f1)(SPECIMEN.L0 * (1 + st.along))} mm` : st.e <= 0 ? 'L₀ = 50 mm' : `L = ${f2(SPECIMEN.L0 * (1 + eShape))} mm`;
    tag(ctx, lenTxt, xd - 6, (yTop + yBot) / 2 + 4, C.text, 'right', 10);
    if (st.broken) text(ctx, '(partes juntas)', xd - 8, (yTop + yBot) / 2 + 20, { size: 9, color: C.dim, align: 'right' });
    // diâmetro na seção mais fina (com o extensômetro preso, o lugar é dele — e d quase não muda)
    if (st.e >= 0.02 || st.broken) {
      const yd = st.broken ? Y_GAUGE + G / 2 - 6 : Y_GAUGE + G / 2;
      text(ctx, `d = ${f2(st.d)} mm`, MX + 34, yd + 32, { size: 9, color: C.dim });
    }

    // painel da base: deformação e etapa
    ctx.fillStyle = '#0b1420';
    roundRect(ctx, 20, BASE_Y + 10, 118, 30, 4);
    ctx.fill();
    text(ctx, 'ε', 28, BASE_Y + 30, { size: 11, color: C.dim });
    text(ctx, `${f2(st.eNow * 100)} %`, 132, BASE_Y + 31, { size: 15, bold: true, color: C.good, align: 'right' });
    const tone = st.phase === 'broken' ? C.bad : st.phase === 'necking' ? C.amber : st.phase === 'unloaded' ? C.violet : C.text;
    tag(ctx, PHASE_NAME[st.phase], 216, BASE_Y + 30, tone, 'center', 11);
    text(ctx, m.name, 150, BASE_Y - 8, { size: 10, bold: true, color: MAT_COLORS[st.idx], align: 'center' });
  }

  // ---------------------------------------------------------------- diagrama completo
  function drawMain(ctx: CanvasRenderingContext2D, st: TensileState): void {
    const ch = new Chart(ctx, MAIN);
    ch.frame('Diagrama tensão × deformação', 'ε (%)', 'σ (MPa)', ticksOf(0, 35, 5), ticksOf(0, 1000, 200));
    const m = st.m;
    // os outros materiais ao fundo, com o nome na ruptura
    MATERIALS.forEach((mm, i) => {
      if (i === st.idx) return;
      const pts = traced(i, mm.ef);
      pts.push([mm.ef * 100, 0]);
      ch.poly(pts, MAT_COLORS[i] + '55', 1.4, [4, 3]);
      const xr = ch.X(mm.ef * 100);
      const yr = ch.Y(mm.sf);
      text(ctx, mm.short, xr + 5, mm.brittle ? yr + 14 : yr - 4, { size: 10, color: MAT_COLORS[i] + 'aa' });
    });
    const col = MAT_COLORS[st.idx];
    const reached = Math.min(st.e, m.ef);
    // tensão verdadeira (tracejada) e a curva de engenharia percorrida
    if (reached > 0) {
      ch.poly(traced(st.idx, reached, trueStress), C.violet, 1.8, [6, 4]);
      const eng = traced(st.idx, reached);
      ch.area(eng, col + '22');
      ch.poly(eng, col, 2.8);
    }
    // limites já medidos
    const seen = (e: number) => st.e >= e;
    if (!m.brittle && seen(st.eY)) {
      ch.poly(
        [
          [0, st.se],
          [35, st.se],
        ],
        col + '66',
        1,
        [2, 4],
      );
      // abaixo da linha, longe das retas que a cruzam (descarga e ruptura)
      const busy: number[] = [];
      if (st.unloaded && st.e > 0) busy.push(st.e * 100, st.ep * 100);
      if (st.broken) busy.push(m.ef * 100);
      const xTag = [9, 22, 27].find((x) => busy.every((b) => Math.abs(b - x) > 3.4)) ?? 9;
      tag(ctx, `σe = ${f0(st.se)} MPa`, ch.X(xTag), ch.Y(st.se) + 14, col, 'center', 10);
    }
    if (seen(m.eu)) {
      ch.poly(
        [
          [0, m.sr],
          [35, m.sr],
        ],
        col + '66',
        1,
        [2, 4],
      );
      ch.dot(m.eu * 100, m.sr, col, 4);
      tag(ctx, `σr = ${f0(m.sr)} MPa`, ch.X(m.brittle ? 2 : m.eu * 100), ch.Y(m.sr) - 10, col, m.brittle ? 'left' : 'center', 10);
    }
    if (st.broken) {
      ch.poly(
        [
          [m.ef * 100, m.sf],
          [m.ef * 100, 0],
        ],
        C.bad,
        2,
        [3, 3],
      );
      const x = ch.X(m.ef * 100);
      const y = ch.Y(m.sf);
      ctx.strokeStyle = C.bad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 6);
      ctx.lineTo(x + 6, y + 6);
      ctx.moveTo(x + 6, y - 6);
      ctx.lineTo(x - 6, y + 6);
      ctx.stroke();
      text(ctx, 'ruptura', x + 9, y + 14, { size: 10, bold: true, color: C.bad });
    }
    // descarga: reta paralela à elástica até sobrar εp
    if (st.unloaded && st.e > 0) {
      ch.poly(
        [
          [st.e * 100, st.sCurve],
          [st.ep * 100, 0],
        ],
        C.violet,
        2.2,
      );
      marker(ch, ctx, st.ep * 100, 0);
    } else if (!st.broken && st.e > 0) {
      marker(ch, ctx, st.e * 100, st.s);
    }
    // legenda
    const lx = ch.X(16.2);
    const ly = ch.b.y + 10;
    const items: [string, string, number[]][] = [
      [`${m.short} (engenharia: F/A₀)`, col, []],
      ['tensão verdadeira (F/A)', C.violet, [6, 4]],
      ['outros materiais', 'rgba(226,235,245,0.45)', [4, 3]],
    ];
    items.forEach(([label, c, dash], i) => {
      const y = ly + i * 14;
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.2;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(lx, y - 4);
      ctx.lineTo(lx + 18, y - 4);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, label, lx + 24, y, { size: 10, color: C.text });
    });
  }

  // ---------------------------------------------------------------- ampliação do trecho elástico
  function drawZoom(ctx: CanvasRenderingContext2D, st: TensileState): void {
    const ch = new Chart(ctx, ZOOM);
    ch.frame('Ampliação: início do ensaio', 'ε (%)', 'σ (MPa)', [0, 0.2, 0.4, 0.6, 0.8, 1], ticksOf(0, 1000, 200), 0, 1);
    const m = st.m;
    const col = MAT_COLORS[st.idx];
    MATERIALS.forEach((mm, i) => {
      if (i === st.idx) return;
      const pts = traced(i, Math.min(mm.ef, ZOOM_MAX));
      if (mm.ef <= ZOOM_MAX) pts.push([mm.ef * 100, 0]);
      ch.poly(pts, MAT_COLORS[i] + '55', 1.4, [4, 3]);
    });
    // resiliência: o triângulo sob a reta elástica até o escoamento
    if (!m.brittle && st.e >= st.eY) {
      const eEl = st.se / m.E;
      ch.area(
        [
          [0, 0],
          [eEl * 100, st.se],
          [eEl * 100, 0],
        ],
        'rgba(255,201,77,0.28)',
        true,
      );
      text(ctx, 'Ur', ch.X(eEl * 100) - 4, ch.Y(st.se * 0.3), { size: 11, bold: true, color: C.amber, align: 'right' });
    }
    // paralela a 0,2 %
    if (!m.brittle) {
      const eTop = OFFSET + ZOOM.y1 / m.E;
      ch.poly(
        [
          [OFFSET * 100, 0],
          [eTop * 100, ZOOM.y1],
        ],
        'rgba(226,235,245,0.55)',
        1.3,
        [5, 4],
      );
      text(ctx, '0,2 %', ch.X(OFFSET * 100) + 3, ch.Y(0) - 5, { size: 9, color: C.dim });
    }
    const reached = Math.min(st.e, m.ef, ZOOM_MAX);
    if (reached > 0) ch.poly(traced(st.idx, reached), col, 2.8);
    if (!m.brittle && st.e >= st.eY) {
      ch.dot(st.eY * 100, st.se, C.amber, 4.5);
      tag(ctx, `σe ${f0(st.se)}`, ch.X(st.eY * 100) + 8, ch.Y(st.se) - 8, C.amber, 'left', 10);
    }
    if (m.brittle && st.broken) {
      text(ctx, 'rompe sem escoar', ch.X(m.ef * 100) + 6, ch.Y(m.sf) - 6, { size: 10, bold: true, color: C.bad });
    }
    if (st.unloaded && st.e > 0) {
      ch.poly(
        [
          [st.e * 100, st.sCurve],
          [st.ep * 100, 0],
        ],
        C.violet,
        2.2,
      );
      if (st.ep * 100 <= ZOOM.x1) marker(ch, ctx, st.ep * 100, 0);
    } else if (!st.broken && st.e > 0 && st.e * 100 <= ZOOM.x1) {
      marker(ch, ctx, st.e * 100, st.s);
    }
    text(ctx, 'arraste aqui para o ajuste fino', ch.b.x, ch.b.y + ch.b.h + 30, { size: 9, color: C.dim });
  }

  // ---------------------------------------------------------------- contas
  function drawCalc(ctx: CanvasRenderingContext2D, st: TensileState): void {
    const x0 = 640;
    const y0 = 292;
    ctx.fillStyle = C.bg2;
    roundRect(ctx, x0, y0, 312, 258, 10);
    ctx.fill();
    const m = st.m;
    text(ctx, m.name, x0 + 14, y0 + 22, { size: 12.5, bold: true, color: MAT_COLORS[st.idx] });
    text(ctx, `A₀ = 100 mm² · L₀ = 50 mm · E = ${f0(m.E / 1000)} GPa`, x0 + 14, y0 + 38, { size: 10, color: C.dim });
    const rows: [string, string][] = [];
    const ePct = st.eNow * 100;
    rows.push(['Tensão: σ = F/A₀', st.s > 0 ? `= ${f1(st.F)} kN / 100 mm² = ${f0(st.s)} MPa` : st.broken ? '= 0 (rompido)' : st.unloaded ? '= 0 (carga retirada)' : '= 0']);
    rows.push(['Deformação: ε = ΔL/L₀', `= ${f2(st.dL)} mm / 50 mm = ${f2(ePct)} %`]);
    if (st.phase === 'elastic' && !m.brittle) rows.push(['Lei de Hooke: σ = E·ε', `= ${f0(m.E)} MPa × ${fmt(st.e, 4)} = ${f0(st.s)} MPa`]);
    else if (st.e > 0 && !st.broken)
      rows.push(['Permanente: εp = ε − σ/E', `= ${f2(st.e * 100)} − ${f3((st.sCurve / m.E) * 100)} = ${f2(st.ep * 100)} %`]);
    if (m.brittle) rows.push(['Escoamento', 'não há: rompe antes de escoar']);
    else if (st.e >= st.eY) {
      rows.push(['Escoamento', m.plateau ? `σe = ${f0(st.se)} MPa (patamar; superior ${f0(m.sp)})` : `σe = ${f0(st.se)} MPa (paralela a 0,2 %)`]);
      rows.push(['Resiliência: Ur = σe²/(2E)', `= ${f0(st.se)}² / (2 × ${fmt(m.E, 0)}) = ${f3(st.Ur)} MJ/m³`]);
    }
    if (st.e >= m.eu) rows.push(['Resistência: σr = Fmáx/A₀', `= ${f1(m.sr / 10)} kN / 100 mm² = ${f0(m.sr)} MPa`]);
    if (st.broken) {
      rows.push(['Alongamento: (Lf − L₀)/L₀', `= (${(st.along < 0.01 ? f3 : f1)(SPECIMEN.L0 * (1 + st.along))} − 50)/50 = ${(st.along < 0.01 ? f2 : f1)(st.along * 100)} %`]);
      if (!m.brittle) rows.push(['Estricção: (A₀ − Af)/A₀', `= (100 − ${f0(st.A)})/100 = ${f0(m.ra * 100)} %`]);
    }
    rows.push([st.broken ? 'Tenacidade (área até romper)' : 'Energia absorvida (área sob a curva)', `${f2(st.U)} MJ/m³`]);
    const top = y0 + 60;
    const dy = Math.min(30, (y0 + 250 - top) / rows.length);
    rows.forEach(([k, v], i) => {
      const y = top + i * dy;
      text(ctx, k, x0 + 14, y, { size: 10, color: C.dim });
      text(ctx, v, x0 + 22, y + 13, { size: 11, bold: true });
    });
  }

  return {
    reset() {
      running = false;
      runEps = 0;
      crackT = 0;
      wasBroken = false;
    },
    actions: [
      {
        label: '▶ Ensaiar / ⏸ Parar',
        title: 'A máquina puxa o corpo de prova devagar até romper.',
        run(api) {
          if (running) {
            running = false;
            return;
          }
          if (api.isLocked('eps')) return;
          const v = api.get();
          const m = MATERIALS[matOf(v)];
          if (v.eps >= m.ef * 100) {
            api.set({ eps: 0, unload: 0 });
            runEps = 0;
          } else {
            if (Math.round(v.unload) === 1) {
              if (api.isLocked('unload')) return;
              api.set({ unload: 0 });
            }
            runEps = v.eps;
          }
          running = true;
        },
      },
      {
        label: '↺ Novo corpo de prova',
        run(api) {
          running = false;
          runEps = 0;
          api.set({ eps: 0, unload: 0 });
        },
      },
    ],
    tick(v, dt) {
      if (!running) return null;
      if (Math.round(v.unload) === 1 || Math.abs(v.eps - runEps) > 0.011) {
        // alguém mexeu nos controles: a máquina para
        running = false;
        return null;
      }
      const m = MATERIALS[matOf(v)];
      const stopAt = Math.min(36, m.ef * 100 + 0.6);
      runEps = Math.min(stopAt, runEps + (0.15 + 0.25 * runEps) * dt);
      if (runEps >= stopAt - 1e-9) running = false;
      return { eps: runEps };
    },
    pointer(kind, x, y) {
      if (kind === 'up') return null;
      const inMain = x >= MAIN.x - 8 && x <= MAIN.x + MAIN.w + 8 && y >= MAIN.y - 12 && y <= MAIN.y + MAIN.h + 12;
      const inZoom = x >= ZOOM.x - 8 && x <= ZOOM.x + ZOOM.w + 8 && y >= ZOOM.y - 12 && y <= ZOOM.y + ZOOM.h + 12;
      if (!inMain && !inZoom) return null;
      running = false;
      const box = inMain ? MAIN : ZOOM;
      const eps = clamp(((x - box.x) / box.w) * (box.x1 - box.x0), 0, inMain ? 36 : ZOOM.x1);
      runEps = eps;
      return { eps };
    },
    cursor(x, y) {
      const inMain = x >= MAIN.x && x <= MAIN.x + MAIN.w && y >= MAIN.y && y <= MAIN.y + MAIN.h;
      const inZoom = x >= ZOOM.x && x <= ZOOM.x + ZOOM.w && y >= ZOOM.y && y <= ZOOM.y + ZOOM.h;
      return inMain || inZoom ? 'ew-resize' : 'default';
    },
    draw(ctx, v, _o, dt) {
      const st = tensileState(v);
      if (st.idx !== lastMat) {
        lastMat = st.idx;
        wasBroken = st.broken;
      }
      if (st.broken && !wasBroken) crackT = 0.7;
      wasBroken = st.broken;
      crackT = Math.max(0, crackT - dt);
      drawMachine(ctx, st, dt);
      drawMain(ctx, st);
      drawZoom(ctx, st);
      drawCalc(ctx, st);
      if (running) tag(ctx, '● ensaiando', 296, 18, C.good, 'right', 10);
    },
    status(v) {
      const st = tensileState(v);
      const m = st.m;
      switch (st.phase) {
        case 'zero':
          return { tone: 'ok', text: 'Corpo de prova montado, sem carga. Aperte ▶ Ensaiar ou arraste a deformação (no gráfico ampliado, o ajuste é fino).' };
        case 'elastic':
          if (m.brittle) return { tone: 'ok', text: `Ferro fundido cinzento: a curva já não é bem uma reta (as lamelas de grafita trincam por dentro). Ele vai romper perto de ${f0(m.sr)} MPa sem escoar e sem pescoço.` };
          return { tone: 'ok', text: `Regime elástico: σ = E·ε = ${f0(st.s)} MPa. Retirando a carga agora, o corpo de prova volta ao comprimento original — nada de deformação permanente.` };
        case 'yield':
          if (m.plateau) return { tone: 'ok', text: `Patamar de escoamento: a deformação cresce sem a força subir (a tensão caiu de ${f0(m.sp)} para ${f0(m.plateau.lower)} MPa). Daqui em diante sobra deformação permanente.` };
          return { tone: 'ok', text: `Escoamento contínuo, sem patamar: o limite convencional é onde a paralela a 0,2 % cruza a curva (σe ≈ ${f0(st.se)} MPa).` };
        case 'hardening':
          return { tone: 'ok', text: `Encruamento: para deformar mais é preciso mais força. Se descarregar agora, sobram ${f2(st.ep * 100)} % de deformação permanente.` };
        case 'necking':
          return { tone: 'warn', text: `Estricção: passou de σr = ${f0(m.sr)} MPa, a deformação se concentra no pescoço e a força cai. A tensão verdadeira, porém, sobe: ${f0(st.sv)} MPa.` };
        case 'broken':
          if (m.brittle) return { tone: 'bad', text: `Ruptura frágil a ${f0(m.sr)} MPa: fratura plana, sem pescoço, alongamento de só ${f2(st.along * 100)} %. Energia absorvida: ${f2(st.Ut)} MJ/m³.` };
          return { tone: 'bad', text: `Rompeu: alongamento de ${f1(st.along * 100)} % e estricção de ${f0(m.ra * 100)} % (fratura em taça e cone, típica de material dúctil). Tenacidade: ${f0(st.Ut)} MJ/m³.` };
        case 'unloaded':
          if (st.ep <= 0) return { tone: 'ok', text: 'Descarregado ainda no regime elástico: voltou tudo, nenhuma deformação permanente.' };
          return {
            tone: 'ok',
            text: `Descarregou pela reta paralela à elástica: voltaram ${f3((st.sCurve / m.E) * 100)} %, ficaram ${f2(st.ep * 100)} %. Recarregando, ele só escoa de novo em ${f0(st.sCurve)} MPa — é o encruamento.`,
          };
      }
    },
  };
}
