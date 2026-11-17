/**
 * Desenho da bancada da viga: apoios, cargas e reações; a viga deformada (ampliada) com as fibras tracionadas
 * e comprimidas coloridas; os diagramas de esforço cortante e de momento fletor alinhados com o vão; a seção
 * transversal com a distribuição de tensões σ = M·y/I num corte que dá para arrastar; e as contas.
 */
import { beamState, type BeamState } from '../../learning/labs/beam';
import type { LabValues } from '../../learning/types';
import { approach, arrow, C, fmt, FONT, niceAxis, roundRect, tag, text } from './draw';
import type { LabView } from './views';

const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
const f2 = (x: number) => fmt(x, 2);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

/** px por metro de vão; o vão fica centrado em AREA_CX. */
const PXM = 85;
const AREA_CX = 318;
const BEAM_Y = 104;
const BEAM_H = 16;
const V_BASE = 256;
const V_H = 30;
const M_TOP = 324;
const M_BOT = 432;
/** Ampliações possíveis da deformada. */
const EXAG = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];

const TENS = (a: number) => `rgba(239,91,67,${a})`;
const COMP = (a: number) => `rgba(59,155,232,${a})`;

export function beamView(): LabView {
  /** Corte escolhido pelo jogador (m); null = seção crítica (|M| máximo). */
  let probe: number | null = null;
  let drag: 'load' | 'probe' | null = null;
  let exag = 50;
  const sc = { V: 10, M: 10, base: 1, init: false };

  const x0Of = (L: number) => AREA_CX - (PXM * L) / 2;

  function updateScales(st: BeamState, dt: number): void {
    const vTop = niceAxis(Math.max(st.Vmax, 0.5), [1, 2, 5, 10, 20, 50, 100, 200], 1).top;
    const mTop = niceAxis(Math.max(st.Mmax, 0.5), [1, 2, 5, 10, 20, 50, 100, 200, 500], 1).top;
    const base = st.cant ? 0 : 1;
    if (!sc.init) {
      Object.assign(sc, { V: vTop, M: mTop, base, init: true });
    } else {
      sc.V = approach(sc.V, vTop, dt, 4);
      sc.M = approach(sc.M, mTop, dt, 4);
      sc.base = approach(sc.base, base, dt, 6);
    }
    // ampliação da deformada: muda só quando a flecha desenhada fica pequena ou grande demais
    const px = st.ymax * (PXM / 1000);
    const drawn = px * exag;
    if (drawn > 60 || drawn < 14) {
      let best = EXAG[0];
      for (const n of EXAG) if (px * n <= 40) best = n;
      exag = best;
    }
  }

  // ---------------------------------------------------------------- viga, apoios e cargas
  function drawBeam(ctx: CanvasRenderingContext2D, st: BeamState): void {
    const L = st.L;
    const X0 = x0Of(L);
    const X = (x: number) => X0 + PXM * x;
    // flecha absurda (viga escoando) mesmo sem ampliar: reduz a escala toda, sem achatar a ponta
    const shrink = Math.min(1, 60 / Math.max(1e-9, st.ymax * (PXM / 1000) * exag));
    const kpx = (PXM / 1000) * exag * shrink;
    const yb = (x: number) => BEAM_Y + clamp(st.y(x) * kpx, -70, 70);
    const failed = st.FS < 1;

    // posição sem carga (fantasma)
    ctx.strokeStyle = 'rgba(226,235,245,0.22)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeRect(X(0), BEAM_Y - BEAM_H / 2, PXM * L, BEAM_H);
    ctx.setLineDash([]);

    // apoios
    const ground = (x: number, y: number, w: number) => {
      ctx.strokeStyle = C.metal;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y);
      ctx.lineTo(x + w / 2, y);
      ctx.stroke();
      ctx.lineWidth = 1;
      for (let i = x - w / 2 + 3; i < x + w / 2; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, y);
        ctx.lineTo(i - 5, y + 6);
        ctx.stroke();
      }
    };
    const yS = BEAM_Y + BEAM_H / 2;
    if (st.cant) {
      ctx.fillStyle = '#3a4a5c';
      ctx.fillRect(X(0) - 20, BEAM_Y - 48, 20, 96);
      ctx.strokeStyle = C.metal;
      ctx.lineWidth = 1;
      for (let y = BEAM_Y - 46; y < BEAM_Y + 48; y += 7) {
        ctx.beginPath();
        ctx.moveTo(X(0) - 20, y + 6);
        ctx.lineTo(X(0) - 13, y);
        ctx.stroke();
      }
      ctx.strokeStyle = C.metalLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X(0), BEAM_Y - 48);
      ctx.lineTo(X(0), BEAM_Y + 48);
      ctx.stroke();
      text(ctx, 'A', X(0) - 10, BEAM_Y - 54, { size: 12, bold: true, align: 'center' });
    } else {
      // A: apoio fixo (articulação)
      ctx.fillStyle = '#56616e';
      ctx.beginPath();
      ctx.moveTo(X(0), yS);
      ctx.lineTo(X(0) - 13, yS + 22);
      ctx.lineTo(X(0) + 13, yS + 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = C.metalLight;
      ctx.beginPath();
      ctx.arc(X(0), yS + 3, 3, 0, Math.PI * 2);
      ctx.fill();
      ground(X(0), yS + 23, 34);
      // B: apoio móvel (roletes)
      const yB = yb(L) + BEAM_H / 2;
      ctx.fillStyle = '#56616e';
      ctx.beginPath();
      ctx.moveTo(X(L), yB);
      ctx.lineTo(X(L) - 13, yB + 16);
      ctx.lineTo(X(L) + 13, yB + 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = C.metalLight;
      for (const dx of [-8, 0, 8]) {
        ctx.beginPath();
        ctx.arc(X(L) + dx, yB + 19, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ground(X(L), yS + 23, 34);
      text(ctx, 'A', X(0) - 20, yS + 16, { size: 12, bold: true, align: 'center' });
      text(ctx, 'B', X(L) + 20, yS + 16, { size: 12, bold: true, align: 'center' });
    }

    // a viga deformada, com as fibras coloridas pela tensão
    const N = 90;
    for (let i = 0; i < N; i++) {
      const xa = (L * i) / N;
      const xb = (L * (i + 1)) / N;
      const Mx = st.M((xa + xb) / 2);
      const s = (Mx * 1e6) / st.W;
      const k = clamp((Math.abs(s) / st.mat.se) * 1.6, 0, 1);
      const yaTop = yb(xa) - BEAM_H / 2;
      const ybTop = yb(xb) - BEAM_H / 2;
      const half = BEAM_H / 2;
      for (const [dy, tension] of [
        [0, s < 0],
        [half, s > 0],
      ] as [number, boolean][]) {
        ctx.fillStyle = '#8b98a7';
        ctx.beginPath();
        ctx.moveTo(X(xa), yaTop + dy);
        ctx.lineTo(X(xb) + 0.6, ybTop + dy);
        ctx.lineTo(X(xb) + 0.6, ybTop + dy + half);
        ctx.lineTo(X(xa), yaTop + dy + half);
        ctx.closePath();
        ctx.fill();
        if (k > 0.01) {
          ctx.fillStyle = tension ? TENS(k) : COMP(k);
          ctx.fill();
        }
      }
    }
    ctx.strokeStyle = failed ? C.bad : '#1b2430';
    ctx.lineWidth = failed ? 2.5 : 1.5;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const x = (L * i) / N;
      if (i) ctx.lineTo(X(x), yb(x) - BEAM_H / 2);
      else ctx.moveTo(X(x), yb(x) - BEAM_H / 2);
    }
    for (let i = N; i >= 0; i--) {
      const x = (L * i) / N;
      ctx.lineTo(X(x), yb(x) + BEAM_H / 2);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const x = (L * i) / N;
      if (i) ctx.lineTo(X(x), yb(x));
      else ctx.moveTo(X(x), yb(x));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // cargas
    if (st.dist) {
      if (st.w > 0) {
        const n = Math.max(4, Math.round((PXM * L) / 22));
        const len = 16 + 26 * clamp(st.w / 20, 0, 1);
        ctx.strokeStyle = C.amber;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(X(0), yb(0) - BEAM_H / 2 - 4 - len);
        for (let i = 0; i <= n; i++) {
          const x = (L * i) / n;
          ctx.lineTo(X(x), yb(x) - BEAM_H / 2 - 4 - len);
        }
        ctx.stroke();
        for (let i = 0; i <= n; i++) {
          const x = (L * i) / n;
          const yt = yb(x) - BEAM_H / 2 - 2;
          arrow(ctx, X(x), yt - len - 2, X(x), yt, C.amber, 1.6, 6);
        }
        tag(ctx, `w = ${f1(st.w)} kN/m`, X(L / 2), yb(L / 2) - BEAM_H / 2 - len - 14, C.amber, 'center', 11);
      }
    } else if (st.P > 0) {
      const xa = X(st.a);
      const yt = yb(st.a) - BEAM_H / 2 - 2;
      const len = 26 + 34 * clamp(st.P / 40, 0, 1);
      arrow(ctx, xa, yt - len, xa, yt, C.amber, 4, 12);
      tag(ctx, `P = ${f0(st.P)} kN`, xa, yt - len - 8, C.amber, 'center', 11);
      if (drag === 'load') {
        ctx.strokeStyle = 'rgba(255,201,77,0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(xa - 14, yt - len - 4, 28, len + 6);
      }
    }

    // reações
    const reactionY = yS + 62;
    const reaction = (x: number, R: number, label: string, side: 'left' | 'right') => {
      if (R < 1e-6) return;
      const y1 = (st.cant ? BEAM_Y + BEAM_H / 2 + 2 : yS + 30);
      const y0 = Math.max(y1 + 18, reactionY - 4);
      arrow(ctx, x, y0, x, y1, C.good, 3, 10);
      // por fora do vão; se não couber (vão longo, pouco espaço até a borda/painel), vai para dentro
      ctx.font = `700 10.5px ${FONT}`;
      const w = ctx.measureText(label).width;
      const out = side === 'left' ? x - 8 - w >= 4 : x + 8 + w <= 612;
      const toLeft = side === 'left' ? out : !out;
      text(ctx, label, toLeft ? x - 8 : x + 8, y0 - 4, { size: 10.5, bold: true, color: C.good, align: toLeft ? 'right' : 'left' });
    };
    if (st.cant) {
      reaction(X(0) + 10, st.RA, `RA = ${f2(st.RA)} kN`, 'right');
      if (st.MA > 1e-6) {
        // momento de engastamento: segura a viga "para cima" (anti-horário)
        const cx = X(0) - 30;
        const cy = BEAM_Y;
        ctx.strokeStyle = C.good;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, Math.PI * 0.55, Math.PI * 1.45);
        ctx.stroke();
        const a = Math.PI * 0.55;
        arrow(ctx, cx + Math.cos(a + 0.25) * 20, cy + Math.sin(a + 0.25) * 20, cx + Math.cos(a) * 20 + 3, cy + Math.sin(a) * 20 + 1, C.good, 2.5, 9);
        // embaixo da parede, em duas linhas (à direita fica o rótulo de RA; à esquerda, pouco espaço com L grande)
        text(ctx, 'MA =', X(0) - 10, BEAM_Y + 62, { size: 10.5, bold: true, color: C.good, align: 'center' });
        text(ctx, `${f2(st.MA)} kN·m`, X(0) - 10, BEAM_Y + 76, { size: 10.5, bold: true, color: C.good, align: 'center' });
      }
    } else {
      reaction(X(0), st.RA, `RA = ${f2(st.RA)} kN`, 'left');
      reaction(X(L), st.RB, `RB = ${f2(st.RB)} kN`, 'right');
    }

    // cotas
    const yd = yS + 78;
    const dim = (xa: number, xb: number, y: number, label: string) => {
      if (xb - xa < 6) return;
      ctx.strokeStyle = C.dim;
      ctx.lineWidth = 1;
      arrow(ctx, (xa + xb) / 2, y, xa + 1, y, C.dim, 1, 6);
      arrow(ctx, (xa + xb) / 2, y, xb - 1, y, C.dim, 1, 6);
      text(ctx, label, (xa + xb) / 2, y - 4, { size: 10, color: C.dim, align: 'center' });
    };
    if (!st.dist && st.P > 0 && st.a > 0.05 && st.a < L - 0.05) {
      dim(X(0), X(st.a), yd, `a = ${f1(st.a)} m`);
      dim(X(st.a), X(L), yd, `b = ${f1(L - st.a)} m`);
      text(ctx, `L = ${f1(L)} m`, X(L) + 5, yd + 4, { size: 10, color: C.dim });
    } else {
      dim(X(0), X(L), yd, `L = ${f1(L)} m`);
    }
    const exLabel = shrink < 1 ? 'deformada fora de escala (flecha enorme)' : `deformada ampliada ${exag}×`;
    text(ctx, exLabel, 20, 24, { size: 10, color: C.dim });
    // no alto, ao lado do aviso de escala (embaixo da viga ficam reações e cotas)
    if (failed) tag(ctx, '⚠ escoou: σ > σe', 20 + ctx.measureText(exLabel).width + 12, 22, C.bad, 'left', 11);
  }

  // ---------------------------------------------------------------- diagramas V e M
  function drawDiagrams(ctx: CanvasRenderingContext2D, st: BeamState, xp: number): void {
    const L = st.L;
    const X0 = x0Of(L);
    const X = (x: number) => X0 + PXM * x;
    const N = 160;
    const sample = (f: (x: number) => number) => {
      const pts: [number, number][] = [];
      for (let i = 0; i <= N; i++) {
        const x = (L * i) / N;
        pts.push([x, f(x)]);
        // degrau sob a carga concentrada
        if (!st.dist && x < st.a && (L * (i + 1)) / N > st.a) pts.push([st.a, f(st.a)], [st.a + 1e-9, f(st.a + 1e-9)]);
      }
      return pts;
    };
    const panel = (y0: number, y1: number, title: string, unit: string) => {
      ctx.fillStyle = C.bg2;
      roundRect(ctx, X0 - 64, y0 - 8, PXM * L + 92, y1 - y0 + 16, 8);
      ctx.fill();
      text(ctx, title, X0 - 56, y0 + 8, { size: 12, bold: true });
      text(ctx, unit, X0 - 56, y0 + 22, { size: 10, color: C.dim });
    };
    const plot = (pts: [number, number][], base: number, scale: number, col: string, fill: string) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(X(pts[0][0]), base);
      for (const [x, v] of pts) ctx.lineTo(X(x), base - v * scale);
      ctx.lineTo(X(pts[pts.length - 1][0]), base);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      pts.forEach(([x, v], i) => (i ? ctx.lineTo(X(x), base - v * scale) : ctx.moveTo(X(x), base - v * scale)));
      ctx.stroke();
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(X(0), base);
      ctx.lineTo(X(L), base);
      ctx.stroke();
    };

    // cortante
    panel(V_BASE - V_H - 8, V_BASE + V_H + 4, 'Cortante', 'V (kN)');
    const vScale = V_H / sc.V;
    const vPts = sample(st.V);
    plot(vPts, V_BASE, vScale, C.curve1, 'rgba(90,184,255,0.22)');
    // momento
    panel(M_TOP, M_BOT, 'Fletor', 'M (kN·m)');
    const mBase = M_TOP + 6 + (M_BOT - M_TOP - 12) * sc.base;
    const mScale = (M_BOT - M_TOP - 16) / sc.M;
    const mPts = sample(st.M);
    plot(mPts, mBase, mScale, C.curve2, 'rgba(255,174,66,0.22)');

    // valores notáveis
    if (st.Vmax > 1e-6) {
      if (st.cant) tag(ctx, `${f2(st.V(0))}`, X(0) + 4, V_BASE - st.V(0) * vScale - 6, C.curve1, 'left', 10);
      else {
        tag(ctx, `${f2(st.RA)}`, X(0) + 4, V_BASE - st.RA * vScale - 6, C.curve1, 'left', 10);
        tag(ctx, `−${f2(st.RB)}`, X(L) - 4, V_BASE + st.RB * vScale + 16, C.curve1, 'right', 10);
      }
    }
    if (st.Mmax > 1e-6) {
      const mAt = st.M(st.xM);
      const yTop = mBase - mAt * mScale;
      ctx.fillStyle = C.curve2;
      ctx.beginPath();
      ctx.arc(X(st.xM), yTop, 4, 0, Math.PI * 2);
      ctx.fill();
      const txt = `|M| máx = ${f2(st.Mmax)}`;
      const right = X(st.xM) > X0 + PXM * L - 90;
      tag(ctx, txt, X(st.xM) + (right ? -8 : 8), yTop + (st.cant ? 18 : -6), C.curve2, right ? 'right' : 'left', 10);
      // na biapoiada o máximo fica onde o cortante muda de sinal
      if (!st.cant) {
        ctx.strokeStyle = 'rgba(255,174,66,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(X(st.xM), V_BASE);
        ctx.lineTo(X(st.xM), yTop);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = C.text;
        ctx.beginPath();
        ctx.arc(X(st.xM), V_BASE, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // do lado em que o diagrama não ocupa: à direita, V < 0 (acima da base livre); à esquerda, V > 0
        const onLeft = X(st.xM) > X0 + PXM * L - 150;
        text(ctx, 'V muda de sinal → M máximo', X(st.xM) + (onLeft ? -8 : 8), onLeft ? V_BASE + 13 : V_BASE - 6, {
          size: 9,
          color: C.dim,
          align: onLeft ? 'right' : 'left',
        });
      }
    }

    // corte (sonda)
    const xs = X(xp);
    ctx.strokeStyle = C.violet;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(xs, BEAM_Y - 30);
    ctx.lineTo(xs, M_BOT + 4);
    ctx.stroke();
    ctx.setLineDash([]);
    const Vp = st.V(xp);
    const Mp = st.M(xp);
    const left = xs > X0 + PXM * L - 70;
    tag(ctx, `V = ${f2(Vp)}`, xs + (left ? -6 : 6), V_BASE - V_H + 2, C.violet, left ? 'right' : 'left', 10);
    // na seção crítica a etiqueta de |M| máx já mostra o valor
    if (st.Mmax <= 1e-6 || Math.abs(xs - X(st.xM)) > 3) tag(ctx, `M = ${f2(Mp)}`, xs + (left ? -6 : 6), M_TOP + 14, C.violet, left ? 'right' : 'left', 10);
    // embaixo dos diagramas (em cima ficam a carga e o engaste), sem passar das pontas do vão
    const pAlign = xs < X0 + 70 ? 'left' : xs > X0 + PXM * L - 70 ? 'right' : 'center';
    text(ctx, probe === null ? 'corte na seção crítica' : 'corte (arraste nos diagramas)', xs + (pAlign === 'left' ? 4 : pAlign === 'right' ? -4 : 0), M_BOT + 23, {
      size: 9,
      color: C.violet,
      align: pAlign,
    });
  }

  // ---------------------------------------------------------------- seção transversal no corte
  function drawSection(ctx: CanvasRenderingContext2D, st: BeamState, xp: number): void {
    const x0 = 620;
    const y0 = 8;
    ctx.fillStyle = C.bg2;
    roundRect(ctx, x0, y0, 332, 262, 10);
    ctx.fill();
    const Mp = st.M(xp);
    text(ctx, `Seção no corte x = ${f2(xp)} m`, x0 + 14, y0 + 20, { size: 12.5, bold: true });
    text(ctx, `${st.sec.name} · ${st.mat.name}`, x0 + 14, y0 + 36, { size: 10, color: C.dim });
    const cx = 700;
    const cy = 146;
    const sec = st.sec;
    const hpx = sec.h;
    const bpx = sec.b;
    // forma
    const shape = () => {
      ctx.beginPath();
      if (sec.kind === 'round') ctx.arc(cx, cy, sec.h / 2, 0, Math.PI * 2);
      else if (sec.kind === 'rect') ctx.rect(cx - bpx / 2, cy - hpx / 2, bpx, hpx);
      else {
        const tf = sec.tf ?? 10;
        const tw = sec.tw ?? 6;
        ctx.moveTo(cx - bpx / 2, cy - hpx / 2);
        ctx.lineTo(cx + bpx / 2, cy - hpx / 2);
        ctx.lineTo(cx + bpx / 2, cy - hpx / 2 + tf);
        ctx.lineTo(cx + tw / 2, cy - hpx / 2 + tf);
        ctx.lineTo(cx + tw / 2, cy + hpx / 2 - tf);
        ctx.lineTo(cx + bpx / 2, cy + hpx / 2 - tf);
        ctx.lineTo(cx + bpx / 2, cy + hpx / 2);
        ctx.lineTo(cx - bpx / 2, cy + hpx / 2);
        ctx.lineTo(cx - bpx / 2, cy + hpx / 2 - tf);
        ctx.lineTo(cx - tw / 2, cy + hpx / 2 - tf);
        ctx.lineTo(cx - tw / 2, cy - hpx / 2 + tf);
        ctx.lineTo(cx - bpx / 2, cy - hpx / 2 + tf);
        ctx.closePath();
      }
    };
    const sFiber = (Mp * 1e6) / st.W; // fibra de baixo (+ = tração)
    const k = clamp((Math.abs(sFiber) / st.mat.se) * 1.6, 0, 1);
    shape();
    ctx.fillStyle = '#8b98a7';
    ctx.fill();
    ctx.save();
    shape();
    ctx.clip();
    const g = ctx.createLinearGradient(0, cy - hpx / 2, 0, cy + hpx / 2);
    const top = sFiber > 0 ? COMP(k) : TENS(k);
    const bot = sFiber > 0 ? TENS(k) : COMP(k);
    g.addColorStop(0, top);
    g.addColorStop(0.5, 'rgba(0,0,0,0)');
    g.addColorStop(1, bot);
    ctx.fillStyle = g;
    ctx.fillRect(cx - 80, cy - 90, 160, 180);
    ctx.restore();
    shape();
    ctx.strokeStyle = '#1b2430';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // altura escrita de pé, colada à face esquerda (a linha neutra começa depois dela)
    ctx.save();
    ctx.translate(cx - bpx / 2 - 7, cy);
    ctx.rotate(-Math.PI / 2);
    text(ctx, `${f0(sec.h)} mm`, 0, 0, { size: 9, color: C.dim, align: 'center' });
    ctx.restore();
    text(ctx, sec.kind === 'round' ? `Ø ${f0(sec.b)} mm` : `${f0(sec.b)} mm`, cx, cy + hpx / 2 + 13, { size: 9, color: C.dim, align: 'center' });

    // distribuição de σ ao longo da altura (linear, zero na linha neutra)
    const ax = 866;
    const full = 56; // px para σ = σe
    const sTop = -sFiber;
    const wTop = clamp((sTop / st.mat.se) * full, -66, 66);
    const wBot = clamp((sFiber / st.mat.se) * full, -66, 66);
    ctx.strokeStyle = 'rgba(226,235,245,0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(ax + s * full, cy - hpx / 2 - 6);
      ctx.lineTo(ax + s * full, cy + hpx / 2 + 6);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const tri =(yEdge: number, w: number) => {
      ctx.fillStyle = w < 0 ? COMP(0.55) : TENS(0.55);
      ctx.beginPath();
      ctx.moveTo(ax, cy);
      ctx.lineTo(ax + w, yEdge);
      ctx.lineTo(ax, yEdge);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = w < 0 ? C.cold : C.hot;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ax, cy);
      ctx.lineTo(ax + w, yEdge);
      ctx.stroke();
    };
    tri(cy - hpx / 2, wTop);
    tri(cy + hpx / 2, wBot);
    // ao lado das linhas tracejadas (em cima fica a tensão da fibra de cima; no perfil I, alto, o subtítulo)
    text(ctx, '−σe', ax - full - 3, cy - hpx / 2 + 4, { size: 9, color: C.dim, align: 'right', shadow: true });
    text(ctx, '+σe', ax + full + 3, cy - hpx / 2 + 4, { size: 9, color: C.dim, align: 'left', shadow: true });
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, cy - hpx / 2 - 4);
    ctx.lineTo(ax, cy + hpx / 2 + 4);
    ctx.stroke();
    // linha neutra
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(cx - bpx / 2 - 2, cy);
    ctx.lineTo(ax + 70, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'LN', cx + bpx / 2 + 6, cy - 4, { size: 10, bold: true, color: C.amber });
    if (Math.abs(sFiber) > 1e-6) {
      const fmtS = (s: number) => `${s > 0 ? '+' : '−'}${f1(Math.abs(s))} MPa`;
      text(ctx, `${fmtS(sTop)} ${sTop < 0 ? '(compressão)' : '(tração)'}`, ax, cy - hpx / 2 - 12, { size: 10, bold: true, color: sTop < 0 ? C.cold : C.hot, align: 'center' });
      text(ctx, `${fmtS(sFiber)} ${sFiber > 0 ? '(tração)' : '(compressão)'}`, ax, cy + hpx / 2 + 20, { size: 10, bold: true, color: sFiber > 0 ? C.hot : C.cold, align: 'center' });
    } else {
      text(ctx, 'M = 0 neste corte: σ = 0', ax, cy + hpx / 2 + 20, { size: 10, color: C.dim, align: 'center' });
    }
    text(ctx, `I = ${f0(sec.I / 1e4)} cm⁴ · W = ${f1(st.W / 1e3)} cm³ · A = ${f1(sec.A / 100)} cm²`, x0 + 14, y0 + 254, { size: 10.5, bold: true });
  }

  // ---------------------------------------------------------------- contas
  function drawCalc(ctx: CanvasRenderingContext2D, st: BeamState): void {
    const x0 = 620;
    const y0 = 280;
    ctx.fillStyle = C.bg2;
    roundRect(ctx, x0, y0, 332, 272, 10);
    ctx.fill();
    const { L, P, a, w, sec } = st;
    const b = L - a;
    const rows: [string, string][] = [];
    // reações
    if (st.cant) rows.push(['Reações no engaste', st.dist ? `RA = wL = ${f2(st.RA)} kN · MA = wL²/2 = ${f2(st.MA)} kN·m` : `RA = P = ${f2(st.RA)} kN · MA = P·a = ${f2(st.MA)} kN·m`]);
    else if (st.dist) rows.push(['Reações: ΣF = 0 e ΣM = 0', `RA = RB = wL/2 = ${f1(w)} × ${f1(L)}/2 = ${f2(st.RA)} kN`]);
    else rows.push(['Reações: ΣF = 0 e ΣM = 0', `RA = P·b/L = ${f2(st.RA)} kN · RB = P·a/L = ${f2(st.RB)} kN`]);
    // momento máximo
    let mTxt: string;
    if (st.cant) mTxt = st.dist ? `wL²/2 = ${f1(w)} × ${f1(L)}²/2 = ${f2(st.Mmax)} kN·m (engaste)` : `P·a = ${f0(P)} × ${f1(a)} = ${f2(st.Mmax)} kN·m (engaste)`;
    else if (st.dist) mTxt = `wL²/8 = ${f1(w)} × ${f1(L)}²/8 = ${f2(st.Mmax)} kN·m (meio)`;
    else if (Math.abs(a - L / 2) < 1e-6) mTxt = `PL/4 = ${f0(P)} × ${f1(L)}/4 = ${f2(st.Mmax)} kN·m (meio)`;
    else mTxt = `P·a·b/L = ${f0(P)} × ${f1(a)} × ${f1(b)}/${f1(L)} = ${f2(st.Mmax)} kN·m`;
    rows.push(['Momento fletor máximo', `|M| = ${mTxt}`]);
    // módulo de resistência
    if (sec.kind === 'rect') rows.push(['Módulo de resistência: W = b·h²/6', `= ${f0(sec.b)} × ${f0(sec.h)}²/6 = ${fmt(st.W, 0)} mm³ = ${f0(st.W / 1e3)} cm³`]);
    else if (sec.kind === 'round') rows.push(['Módulo de resistência: W = π·d³/32', `= π × ${f0(sec.b)}³/32 = ${f1(st.W / 1e3)} cm³`]);
    else rows.push(['Módulo de resistência: W = I/c', `= ${f1(sec.I / 1e4)} cm⁴ / ${f1(sec.c / 10)} cm = ${f1(st.W / 1e3)} cm³`]);
    rows.push(['Flexão: σ = M/W', `= ${f2(st.Mmax)} kN·m / ${f1(st.W / 1e3)} cm³ = ${f1(st.sig)} MPa → FS = ${f0(st.mat.se)}/${f1(st.sig)} = ${st.FS >= 99 ? '—' : f2(st.FS)}`]);
    if (sec.kind === 'rect') rows.push(['Cisalhamento: τ = 1,5·V/A', `= 1,5 × ${f2(st.Vmax)} kN / ${fmt(sec.A, 0)} mm² = ${f2(st.tau)} MPa`]);
    else if (sec.kind === 'round') rows.push(['Cisalhamento: τ = 4V/(3A)', `= 4 × ${f2(st.Vmax)} kN / (3 × ${fmt(sec.A, 0)} mm²) = ${f2(st.tau)} MPa`]);
    else rows.push(['Cisalhamento: τ = V·Q/(I·t), quase todo na alma', `= ${f2(st.tau)} MPa (≈ V/A_alma = ${f2((st.Vmax * 1000) / ((sec.h - 2 * (sec.tf ?? 0)) * (sec.tw ?? 1)))} MPa)`]);
    let yTxt: string;
    if (st.cant) yTxt = st.dist ? 'δ = wL⁴/(8EI)' : Math.abs(a - L) < 1e-6 ? 'δ = PL³/(3EI)' : 'δ = P·a²·(3L − a)/(6EI)';
    else if (st.dist) yTxt = 'δ = 5wL⁴/(384EI)';
    else yTxt = Math.abs(a - L / 2) < 1e-6 ? 'δ = PL³/(48EI)' : 'δ = P·b·(L² − b²)^1,5/(9√3·EIL)';
    const ratio = st.ymax > 1e-9 ? ` = L/${f0((L * 1000) / st.ymax)}` : '';
    rows.push([`Flecha: ${yTxt}`, `= ${f2(st.ymax)} mm${ratio} · EI = ${f2(st.EI / 1e6)} MN·m²`]);
    text(ctx, 'Contas', x0 + 14, y0 + 22, { size: 12.5, bold: true });
    text(ctx, `E = ${f0(st.mat.E)} GPa · σe = ${f0(st.mat.se)} MPa · peso próprio desprezado`, x0 + 72, y0 + 22, { size: 10, color: C.dim });
    const topY = y0 + 44;
    const dy = (y0 + 262 - topY) / rows.length;
    rows.forEach(([k, v], i) => {
      const y = topY + i * dy;
      text(ctx, k, x0 + 14, y, { size: 10, color: C.dim });
      text(ctx, v, x0 + 20, y + 14, { size: 10.5, bold: true });
    });
  }

  // ---------------------------------------------------------------- medidores
  function drawGauges(ctx: CanvasRenderingContext2D, st: BeamState): void {
    const y = 478;
    const bar = (x: number, w: number, label: string, frac: number, col: string, value: string, marks: [number, string][]) => {
      text(ctx, label, x, y, { size: 10, color: C.dim });
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      roundRect(ctx, x, y + 8, w, 14, 4);
      ctx.fill();
      ctx.fillStyle = col;
      roundRect(ctx, x, y + 8, Math.max(2, w * clamp(frac, 0, 1)), 14, 4);
      ctx.fill();
      for (const [f, t] of marks) {
        ctx.strokeStyle = C.text;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + w * f, y + 5);
        ctx.lineTo(x + w * f, y + 25);
        ctx.stroke();
        text(ctx, t, x + w * f, y + 36, { size: 9, color: C.dim, align: 'center' });
      }
      text(ctx, value, x, y + 54, { size: 11.5, bold: true, color: col });
    };
    const fsCol = st.FS < 1 ? C.bad : st.FS < 1.5 ? C.amber : C.good;
    bar(24, 172, 'Fator de segurança σe/σ', st.FS / 4, fsCol, st.FS >= 99 ? 'sem flexão' : `FS = ${f2(st.FS)}`, [
      [0.25, '1'],
      [0.5, '2'],
      [0.75, '3'],
    ]);
    const lim = (st.L * 1000) / 250;
    const yr = st.ymax / lim;
    const yCol = yr > 1 ? C.amber : C.good;
    bar(214, 172, 'Flecha (limite usual L/250)', yr / 2, yCol, `${f2(st.ymax)} mm (limite ${f0(lim)} mm)`, [[0.5, 'L/250']]);
    const kgMax = 62;
    bar(404, 172, 'Massa da viga', st.kg / kgMax, C.violet, `${f1(st.kg)} kg/m · ${f0(st.kg * st.L)} kg no vão`, []);
  }

  return {
    reset() {
      probe = null;
      drag = null;
      sc.init = false;
    },
    actions: [
      {
        label: '📍 Seção crítica',
        title: 'Leva o corte para onde |M| é máximo.',
        run() {
          probe = null;
        },
      },
    ],
    pointer(kind, x, y, v) {
      const st = beamState(v);
      const X0 = x0Of(st.L);
      const xm = clamp((x - X0) / PXM, 0, st.L);
      if (kind === 'up') {
        drag = null;
        return null;
      }
      if (kind === 'down') {
        drag = null;
        const yLoad = BEAM_Y - BEAM_H / 2;
        if (!st.dist && Math.abs(x - (X0 + PXM * st.a)) < 18 && y > yLoad - 80 && y < BEAM_Y + 14) drag = 'load';
        else if (x >= X0 - 12 && x <= X0 + PXM * st.L + 12 && y > BEAM_Y - 40 && y < M_BOT + 8) drag = 'probe';
      }
      if (drag === 'load') return { a: (xm / st.L) * 100 };
      // de 5 em 5 cm: o corte cai em cotas "de prova" (x = 3 m, não 3,004 m)
      if (drag === 'probe') probe = clamp(Math.round(xm / 0.05) * 0.05, 0, st.L);
      return null;
    },
    cursor(x, y, v) {
      const st = beamState(v);
      const X0 = x0Of(st.L);
      if (!st.dist && Math.abs(x - (X0 + PXM * st.a)) < 18 && y > BEAM_Y - 90 && y < BEAM_Y + 14) return 'ew-resize';
      if (x >= X0 - 12 && x <= X0 + PXM * st.L + 12 && y > BEAM_Y - 40 && y < M_BOT + 8) return 'crosshair';
      return 'default';
    },
    draw(ctx, v: LabValues, _o, dt) {
      const st = beamState(v);
      updateScales(st, dt);
      const xp = probe === null ? st.xM : clamp(probe, 0, st.L);
      drawDiagrams(ctx, st, xp);
      drawBeam(ctx, st);
      drawSection(ctx, st, xp);
      drawCalc(ctx, st);
      drawGauges(ctx, st);
    },
    status(v, o) {
      const st = beamState(v);
      const load = st.dist ? st.w : st.P;
      if (load <= 0) return { tone: 'ok', text: 'Sem carga: sem reações, sem esforços, sem flecha.' };
      if (!st.dist && !st.cant && (st.a <= 1e-6 || st.a >= st.L - 1e-6)) {
        return { tone: 'ok', text: 'A carga está em cima do apoio: vai direto para ele e a viga não flete (M = 0 no vão todo).' };
      }
      if (st.FS < 1) {
        return { tone: 'bad', text: `σ = ${f1(st.sig)} MPa passa do escoamento (${f0(st.mat.se)} MPa): a viga deformaria para sempre. Aumente W (perfil mais alto, perfil I, viga em pé) ou reduza a carga ou o vão.` };
      }
      const lim = (st.L * 1000) / 250;
      if (st.ymax > lim) {
        return { tone: 'warn', text: `Resiste (FS = ${f2(st.FS)}), mas a flecha de ${f2(st.ymax)} mm = L/${f0(o.Lr)} passa do limite usual L/250 (${f0(lim)} mm). Flecha depende da rigidez E·I: aumente I ou use um material de E maior.` };
      }
      if (st.FS < 1.5) return { tone: 'warn', text: `FS = ${f2(st.FS)}: pouca folga até o escoamento. σ = M/W = ${f1(st.sig)} MPa.` };
      if (st.cant) {
        return { tone: 'ok', text: `No balanço, o momento máximo (${f2(st.Mmax)} kN·m) fica no engaste e traciona as fibras de cima. Flecha na ponta: ${f2(st.ymax)} mm.` };
      }
      if (st.dist) {
        return { tone: 'ok', text: `M máx = wL²/8 = ${f2(st.Mmax)} kN·m no meio do vão, exatamente onde V = 0. Embaixo, tração; em cima, compressão. FS = ${f2(st.FS)}.` };
      }
      return { tone: 'ok', text: `M máx = ${f2(st.Mmax)} kN·m sob a carga, onde o cortante troca de sinal. σ = M/W = ${f1(st.sig)} MPa (FS = ${f2(st.FS)}); flecha de ${f2(st.ymax)} mm.` };
    },
  };
}
