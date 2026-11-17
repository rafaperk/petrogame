/** Desenho da bancada Fe-C: diagrama com campos de fase, cursor arrastável, regra da alavanca e microscópio. */
import { FEC, lines, Region, REGION_INFO, regionOf, tieLine } from '../../learning/labs/fec';
import type { LabValues } from '../../learning/types';
import { C, Chart, fmt, roundRect, tag, text } from './draw';
import { Microscope } from './fecMicro';
import type { LabView } from './views';

const TAU = Math.PI * 2;
const BOX = { x: 74, y: 40, w: 486, h: 466 };
const T0 = FEC.tMin;
const T1 = 1600;
const MIC = { x: 780, y: 160, r: 118 };

const REGION_COLOR: Record<Region, string> = {
  [Region.L]: '#4f74ad',
  [Region.LDelta]: '#7466a6',
  [Region.Delta]: '#8a78b8',
  [Region.DeltaGamma]: '#94709a',
  [Region.LGamma]: '#4f8f9b',
  [Region.Gamma]: '#b8743f',
  [Region.AlphaGamma]: '#9c8a4e',
  [Region.Alpha]: '#cfc59c',
  [Region.GammaFe3C]: '#a45f55',
  [Region.AlphaFe3C]: '#64775b',
  [Region.LFe3C]: '#685c8e',
};

/** Temperatura de austenitização usual: ~60 °C acima de A₃ (hipo) ou de Acm (hiper). */
const austenitizing = (c: number) => (c <= FEC.cEutd ? lines.a3inv(c) + 60 : c <= FEC.cGammaMax ? lines.acmInv(c) + 60 : 1100);

const PHASE_COLORS: Record<string, string> = {
  α: '#e9e2c9',
  γ: '#e0a26e',
  'Fe₃C': '#ffffff',
  L: '#6f93c9',
  δ: '#b49ad6',
  Perlita: '#8a7461',
  'Ferrita pro.': '#e9e2c9',
  'Cementita pro.': '#ffffff',
  Ledeburita: '#b9a993',
  'Cementita prim.': '#f3f0e6',
  Martensita: '#8e9bab',
};

export function fecView(): LabView {
  const micro = new Microscope();
  const bgCache = new Map<number, HTMLCanvasElement>();
  let dragging = false;
  let cooling: number | null = null;
  let banner: { text: string; t: number } | null = null;
  let prevT: number | null = null;
  let prevC: number | null = null;
  let full = false;

  const xMax = () => (full ? FEC.cMax : 2.2);
  const chart = (ctx: CanvasRenderingContext2D) => new Chart(ctx, { ...BOX, x0: 0, x1: xMax(), y0: T0, y1: T1 });

  function background(): HTMLCanvasElement {
    const key = full ? 1 : 0;
    const cached = bgCache.get(key);
    if (cached) return cached;
    const cv = document.createElement('canvas');
    const sc = 0.5;
    cv.width = Math.round(BOX.w * sc);
    cv.height = Math.round(BOX.h * sc);
    const g = cv.getContext('2d')!;
    const img = g.createImageData(cv.width, cv.height);
    const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    for (let j = 0; j < cv.height; j++) {
      const t = T1 - ((T1 - T0) * (j + 0.5)) / cv.height;
      for (let i = 0; i < cv.width; i++) {
        const c = (xMax() * (i + 0.5)) / cv.width;
        const [r, gg, b] = hex(REGION_COLOR[regionOf(c, t)]);
        const k = (j * cv.width + i) * 4;
        img.data[k] = r;
        img.data[k + 1] = gg;
        img.data[k + 2] = b;
        img.data[k + 3] = 150;
      }
    }
    g.putImageData(img, 0, 0);
    bgCache.set(key, cv);
    return cv;
  }

  function drawDiagram(ctx: CanvasRenderingContext2D, v: LabValues, o: Record<string, number>): void {
    const ch = chart(ctx);
    ch.frame('Diagrama Fe–Fe₃C', '% de carbono (em massa)', 'T (°C)', full ? [0, 1, 2, 3, 4, 5, 6] : [0, 0.5, 1, 1.5, 2], [400, 600, 800, 1000, 1200, 1400, 1600], 0);
    if (!full) {
      // rótulos 0,5 e 1,5 (o frame arredonda para inteiro)
      for (const t of [0.5, 1.5]) {
        ctx.fillStyle = C.bg2;
        ctx.fillRect(ch.X(t) - 12, BOX.y + BOX.h + 4, 24, 14);
        text(ctx, fmt(t, 1), ch.X(t), BOX.y + BOX.h + 15, { size: 11, color: C.dim, align: 'center' });
      }
    }
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(background(), BOX.x, BOX.y, BOX.w, BOX.h);
    // linhas do diagrama
    const seg = (pts: [number, number][], color = '#f4efe6', width = 2, dash: number[] = []) => ch.poly(pts, color, width, dash);
    seg([
      [0, FEC.tMelt],
      [FEC.cLiqPerit, FEC.tPerit],
      [FEC.cEut, FEC.tEut],
      [FEC.cMax, FEC.tCemLiq],
    ]);
    seg([
      [0, FEC.tMelt],
      [FEC.cDeltaPerit, FEC.tPerit],
      [FEC.cLiqPerit, FEC.tPerit],
    ]);
    seg([
      [FEC.cDeltaPerit, FEC.tPerit],
      [0, FEC.tDeltaGamma],
      [FEC.cGammaPerit, FEC.tPerit],
    ], '#f4efe6', 1.5);
    seg([
      [FEC.cGammaPerit, FEC.tPerit],
      [FEC.cGammaMax, FEC.tEut],
      [FEC.cMax, FEC.tEut],
    ]);
    seg([
      [0, FEC.tA3Fe],
      [FEC.cEutd, FEC.tEutd],
      [FEC.cGammaMax, FEC.tEut],
    ]);
    seg([
      [0, FEC.tA3Fe],
      [FEC.cAlphaMax, FEC.tEutd],
      [lines.alphaLow(T0), T0],
    ], '#f4efe6', 1.5);
    seg([
      [FEC.cAlphaMax, FEC.tEutd],
      [FEC.cMax, FEC.tEutd],
    ]);
    // rótulos dos campos
    const lab = (s: string, c: number, t: number, size = 13) => {
      if (c > xMax()) return;
      text(ctx, s, ch.X(c), ch.Y(t), { size, align: 'center', bold: true, shadow: true });
    };
    if (full) {
      lab('L', 3.6, 1450);
      lab('L + γ', 2.1, 1290);
      lab('L + Fe₃C', 5.5, 1195, 12);
      lab('γ', 0.55, 1060);
      lab('γ + Fe₃C', 3.3, 940);
      lab('α + Fe₃C', 3.3, 520);
    } else {
      lab('L', 1.7, 1530);
      lab('L + γ', 1.45, 1360);
      lab('γ — austenita (CFC)', 0.8, 1040);
      lab('γ + Fe₃C', 1.75, 880);
      lab('α + γ', 0.33, 790, 12);
      lab('α + Fe₃C', 1.2, 590);
      lab('ferrita + perlita', 0.38, 430, 10);
      lab('perlita + cementita', 1.5, 430, 10);
      text(ctx, 'α', ch.X(0.012), ch.Y(820), { size: 11, bold: true, align: 'left', shadow: true });
    }
    // pontos notáveis
    const point = (c: number, t: number, label: string, dx = 8, dy = -8) => {
      if (c > xMax()) return;
      ctx.fillStyle = C.amber;
      ctx.beginPath();
      ctx.arc(ch.X(c), ch.Y(t), 4, 0, TAU);
      ctx.fill();
      text(ctx, label, ch.X(c) + dx, ch.Y(t) + dy, { size: 10, color: C.amber, bold: true, shadow: true });
    };
    point(FEC.cEutd, FEC.tEutd, '0,76% · 727 °C', 6, 16);
    point(FEC.cGammaMax, FEC.tEut, '2,11% · 1.148 °C', full ? 6 : -96, -8);
    point(FEC.cEut, FEC.tEut, '4,3% (eutético)', -40, -10);
    text(ctx, 'A₁ 727 °C', BOX.x + BOX.w - 4, ch.Y(FEC.tEutd) - 5, { size: 10, color: C.text, align: 'right', bold: true, shadow: true });
    text(ctx, '912', BOX.x + 4, ch.Y(FEC.tA3Fe) + 4, { size: 10, color: C.amber, bold: true, shadow: true });
    text(ctx, '1.538', BOX.x + 4, ch.Y(FEC.tMelt) + 12, { size: 10, color: C.amber, bold: true, shadow: true });
    if (!full) {
      text(ctx, 'A₃', ch.X(0.42) + 6, ch.Y(lines.a3inv(0.42)) - 2, { size: 11, color: C.text, bold: true, shadow: true });
      text(ctx, 'Acm', ch.X(1.3) + 6, ch.Y(lines.acmInv(1.3)) + 4, { size: 11, color: C.text, bold: true, shadow: true });
    }

    // cursor: linha da liga, linha de amarração e regra da alavanca
    const x = ch.X(Math.min(v.c, xMax()));
    const y = ch.Y(v.t);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, BOX.y);
    ctx.lineTo(x, BOX.y + BOX.h);
    ctx.stroke();
    ctx.setLineDash([]);
    const tie = tieLine(v.c, v.t);
    if (tie) {
      const xl = ch.X(Math.min(tie.left, xMax()));
      const xr = ch.X(Math.min(tie.right, xMax()));
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(xl, y);
      ctx.lineTo(xr, y);
      ctx.stroke();
      for (const [xx, comp, ph] of [
        [xl, tie.left, tie.leftPhase],
        [xr, tie.right, tie.rightPhase],
      ] as [number, number, string][]) {
        ctx.fillStyle = C.amber;
        ctx.beginPath();
        ctx.arc(xx, y, 5, 0, TAU);
        ctx.fill();
        if (tie.right > xMax() && comp === tie.right) {
          tag(ctx, `${ph} ${fmt(comp, 2)}% →`, BOX.x + BOX.w - 4, y - 12, C.amber, 'right', 10);
        } else tag(ctx, `${ph} ${fmt(comp, comp < 0.1 ? 3 : 2)}%`, xx, y - 12, C.amber, 'center', 10);
      }
      // braços da alavanca: a fração de uma fase é o braço OPOSTO
      const fr = Math.round(tie.fRight * 100);
      tag(ctx, `${tie.rightPhase} = ${fr}%`, (x + xl) / 2, y + 22, C.text, 'center', 10);
      tag(ctx, `${tie.leftPhase} = ${100 - fr}%`, (x + Math.min(xr, BOX.x + BOX.w)) / 2, y + 22, C.text, 'center', 10);
    }
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#0b1420';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, TAU);
    ctx.fill();
    ctx.stroke();
    tag(ctx, `${fmt(v.c, 2)} %C · ${fmt(v.t, 0)} °C`, Math.min(Math.max(x, BOX.x + 60), BOX.x + BOX.w - 60), Math.max(BOX.y + 14, y - 34), '#ffffff', 'center', 11);
    text(ctx, '↔ arraste o ponto ↕', BOX.x + BOX.w / 2 + 40, BOX.y - 9, { size: 10, color: C.dim, align: 'center' });
    void o;
  }

  function drawMicro(ctx: CanvasRenderingContext2D, v: LabValues, o: Record<string, number>): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 606, 8, 346, 544, 10);
    ctx.fill();
    text(ctx, 'Microscópio', 622, 30, { size: 13, bold: true });
    text(ctx, v.t > FEC.tEutd ? 'visão "a quente" (didática)' : 'ataque com nital (estilizado)', 936, 30, { size: 10, color: C.dim, align: 'right' });
    micro.update(o, v.cool);
    ctx.save();
    ctx.beginPath();
    ctx.arc(MIC.x, MIC.y, MIC.r, 0, TAU);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(micro.canvas, MIC.x - MIC.r, MIC.y - MIC.r, MIC.r * 2, MIC.r * 2);
    if (v.t > FEC.tEutd) {
      const glow = Math.min(0.35, (v.t - FEC.tEutd) / 2000);
      ctx.fillStyle = `rgba(255,120,40,${glow})`;
      ctx.fillRect(MIC.x - MIC.r, MIC.y - MIC.r, MIC.r * 2, MIC.r * 2);
    }
    ctx.restore();
    ctx.strokeStyle = C.metal;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(MIC.x, MIC.y, MIC.r + 4, 0, TAU);
    ctx.stroke();
    const info = REGION_INFO[o.region as Region];
    const quenched = o.fMart > 0;
    text(ctx, quenched ? 'Martensita (fora do equilíbrio)' : `${info.name} — ${info.phases}`, MIC.x, MIC.y + MIC.r + 30, { size: 13, bold: true, align: 'center' });

    // barras: fases (regra da alavanca) e microconstituintes
    const bar = (title: string, y: number, parts: [string, number][]) => {
      text(ctx, title, 622, y - 8, { size: 11, color: C.dim, bold: true });
      let x = 622;
      const w = 314;
      const shown = parts.filter(([, f]) => f > 0.5);
      for (const [name, f] of shown) {
        const bw = (w * f) / 100;
        ctx.fillStyle = PHASE_COLORS[name] ?? '#999';
        ctx.fillRect(x, y, bw, 16);
        ctx.strokeStyle = '#0b1420';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, bw, 16);
        x += bw;
      }
      shown.forEach(([name, f], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        ctx.fillStyle = PHASE_COLORS[name] ?? '#999';
        ctx.fillRect(622 + col * 160, y + 24 + row * 16, 9, 9);
        text(ctx, `${name} ${fmt(f, 0)}%`, 636 + col * 160, y + 32 + row * 16, { size: 11 });
      });
    };
    if (quenched) ctx.globalAlpha = 0.45;
    bar(quenched ? 'Fases de equilíbrio (não valem após a têmpera)' : 'Fases (regra da alavanca)', 336, [
      ['α', o.fAlpha],
      ['γ', o.fGamma],
      ['δ', o.fDelta],
      ['L', o.fL],
      ['Fe₃C', o.fFe3C],
    ]);
    ctx.globalAlpha = 1;
    const constituents: [string, number][] = [
      ['Ferrita pro.', o.fFerritaPro],
      ['Perlita', o.fPerlita],
      ['Cementita pro.', o.fCementitaPro],
      ['Ledeburita', o.fLedeburita],
      ['Cementita prim.', o.fCemPrim],
      ['Martensita', o.fMart],
    ];
    if (constituents.some(([, f]) => f > 0.5)) bar('Microconstituintes', 404, constituents);
    // nota do campo (quebra em linhas)
    const castIron = v.c > FEC.cGammaMax && (o.region === Region.GammaFe3C || o.region === Region.AlphaFe3C);
    const note = castIron
      ? 'Ferro fundido branco: a ledeburita (o eutético de 4,3 %C, austenita + cementita) deixa a estrutura dura e quebradiça. Abaixo de 727 °C, a austenita dela vira perlita.'
      : o.fMart > 0 ?'Têmpera: a austenita não teve tempo de se difundir e virou martensita (TCC, agulhas, muito dura e frágil). O diagrama de equilíbrio não mostra isso — veja as curvas TTT.' : info.note;
    ctx.font = `600 11px "Nunito", system-ui, sans-serif`;
    const words = note.split(' ');
    let line = '';
    let ly = 482;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > 316) {
        text(ctx, line, 622, ly, { size: 11, color: C.text });
        line = w;
        ly += 15;
      } else line = test;
    }
    if (line) text(ctx, line, 622, ly, { size: 11, color: C.text });
  }

  return {
    reset() {
      cooling = null;
      banner = null;
      prevT = null;
      prevC = null;
    },
    tick(v, dt) {
      if (cooling === null) return null;
      const next = Math.max(cooling, v.t - 55 * dt);
      if (next <= cooling) {
        const end = cooling;
        cooling = null;
        return { t: end };
      }
      return { t: next };
    },
    actions: [
      {
        label: '❄️ Resfriar devagar',
        title: 'Desce a temperatura aos poucos até 400 °C (resfriamento lento, equilíbrio).',
        run(api) {
          if (api.isLocked('t')) return;
          const cur = api.get();
          // já frio? primeiro austenitiza (acima de A₃/Acm), depois desce devagar
          if (cur.t <= 420) api.set({ t: austenitizing(cur.c) });
          api.set({ cool: 0 });
          cooling = 400;
        },
      },
      {
        label: '💧 Temperar',
        title: 'Resfriamento brusco a partir da temperatura atual.',
        run(api) {
          if (api.isLocked('t') || api.isLocked('cool')) return;
          cooling = null;
          const cur = api.get();
          if (cur.t <= FEC.tEutd) api.set({ t: austenitizing(cur.c) });
          api.set({ cool: 1, t: 300 }, true);
        },
      },
      {
        label: '⏹ Parar',
        run() {
          cooling = null;
        },
      },
    ],
    draw(ctx, v, o, dt) {
      full = v.view >= 1 || v.c > 2.2;
      // avisos ao cruzar as linhas durante o resfriamento
      if (prevT !== null && prevC !== null && Math.abs(prevC - v.c) < 1e-6 && v.t < prevT) {
        const crossed = (line: number) => prevT! > line && v.t <= line;
        if (v.c < FEC.cEutd && v.c > FEC.cAlphaMax && v.t > FEC.tEutd && crossed(lines.a3inv(v.c))) banner = { text: 'Cruzou A₃: a ferrita proeutetoide começa a nascer nos contornos da austenita.', t: 0 };
        if (v.c > FEC.cEutd && v.c <= FEC.cGammaMax && crossed(lines.acmInv(v.c))) banner = { text: 'Cruzou Acm: a cementita proeutetoide precipita como rede nos contornos de grão.', t: 0 };
        if (v.c > FEC.cAlphaMax && crossed(FEC.tEutd)) {
          banner = v.cool >= 1 ? { text: 'Têmpera: sem tempo para difusão — martensita!', t: 0 } : { text: 'Reação eutetoide a 727 °C: γ (0,76 %C) → α + Fe₃C = perlita.', t: 0 };
        }
        if (crossed(lines.liquidus(v.c))) banner = { text: 'Cruzou a linha liquidus: começa a solidificação.', t: 0 };
      }
      prevT = v.t;
      prevC = v.c;
      drawDiagram(ctx, v, o);
      drawMicro(ctx, v, o);
      if (banner) {
        banner.t += dt;
        ctx.globalAlpha = Math.max(0, Math.min(1, 3.5 - banner.t));
        tag(ctx, banner.text, BOX.x + BOX.w / 2 + 20, BOX.y + 22, C.amber, 'center', 12);
        ctx.globalAlpha = 1;
        if (banner.t > 3.5) banner = null;
      }
      if (cooling !== null) tag(ctx, '❄️ resfriando…', BOX.x + 60, BOX.y + BOX.h - 12, C.cold, 'center', 11);
    },
    status(v, o) {
      const info = REGION_INFO[o.region as Region];
      const steel = v.c <= FEC.cGammaMax ? (v.c < FEC.cEutd - 0.02 ? 'aço hipoeutetoide' : v.c > FEC.cEutd + 0.02 ? 'aço hipereutetoide' : 'aço eutetoide') : 'ferro fundido';
      if (o.fMart > 0) return { tone: 'warn', text: `${fmt(v.c, 2)} %C temperado: martensita — fora do equilíbrio (o diagrama Fe-C não prevê; veja curvas TTT).` };
      return { tone: 'ok', text: `${fmt(v.c, 2)} %C (${steel}) a ${fmt(v.t, 0)} °C → campo ${info.name}: ${info.phases}.` };
    },
    pointer(kind, x, y, v) {
      const inBox = x >= BOX.x - 6 && x <= BOX.x + BOX.w + 6 && y >= BOX.y - 6 && y <= BOX.y + BOX.h + 6;
      if (kind === 'down') dragging = inBox;
      if (kind === 'up') dragging = false;
      if (!dragging) return null;
      cooling = null;
      const c = Math.max(0, Math.min(xMax(), ((x - BOX.x) / BOX.w) * xMax()));
      const t = Math.max(T0, Math.min(T1, T1 - ((y - BOX.y) / BOX.h) * (T1 - T0)));
      const step = full ? 0.05 : 0.01;
      return { c: Math.round(c / step) * step, t: Math.round(t / 5) * 5, cool: v.cool && t > FEC.tEutd ? 0 : v.cool };
    },
    cursor(x, y) {
      return x >= BOX.x && x <= BOX.x + BOX.w && y >= BOX.y && y <= BOX.y + BOX.h ? 'crosshair' : 'default';
    },
  };
}
