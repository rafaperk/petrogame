/**
 * Desenho da bancada dos ciclos a vapor: a usina (caldeira, turbina, condensador e bomba — com o reaquecedor ou
 * o aquecedor aberto) ou o refrigerador (evaporador, compressor, condensador e válvula). As partículas viram
 * vapor (anel) ou líquido (ponto) conforme o título; o estado de uma parcela anda no diagrama T–s com a cúpula
 * de saturação (e no P–h, na refrigeração).
 */
import { domePh, domeTs, K0, R134A, satP, satT, WATER, type Fluid, type FState } from '../../learning/labs/fluids';
import {
  isRankine,
  legPath,
  legState,
  MOD,
  rankineState,
  refrigState,
  TR_KW,
  X_MIN,
  type RankineState,
  type RefrigState,
  type VLegKind,
} from '../../learning/labs/vapor';
import type { LabValues } from '../../learning/types';
import { arrow, C, Chart, fmt, FONT, labelPoints, marker, roundRect, seeded, tag, tempColor, text, ticksOf } from './draw';
import type { LabView } from './views';

const TAU = Math.PI * 2;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
/** Entropia com 4 casas fixas (a tabela fica alinhada). */
const f4 = (x: number) => x.toFixed(4).replace('.', ',');
const tcW = (T: number, a = 1) => tempColor(T, 20, 600, a);
const tcR = (T: number, a = 1) => tempColor(T, -30, 70, a);
/** Pressão legível: kPa abaixo de 1 MPa. */
const fmtP = (P: number) => (P >= 1000 ? `${fmt(P / 1000, P >= 10000 ? 1 : 2)} MPa` : `${fmt(P, P < 10 ? 1 : 0)} kPa`);

type Pt = [number, number, number]; // x, y e meia-largura do escoamento

interface Phase {
  key: string;
  name: string;
  dur: number;
  a: FState;
  b: FState;
  /** Processo; null = transporte num tubo (estado parado). */
  leg: VLegKind | null;
  path: Pt[];
  /** Estados ao longo da etapa (9 amostras), para colorir as partículas sem recalcular tabela. */
  samp: FState[];
}

interface Scene {
  rankine: boolean;
  fluid: Fluid;
  rk: RankineState | null;
  rf: RefrigState | null;
  pts: FState[];
  eff: number;
  phases: Phase[];
  period: number;
  /** Contorno do ciclo, processo a processo. */
  legs: FState[][];
  kinds: VLegKind[];
  shape: string;
}

// ================================================================== caminhos no desenho
const P_RK: Record<string, Pt[]> = {
  pump1: [
    [238, 388, 2],
    [214, 388, 2],
  ],
  feed: [
    [214, 388, 2],
    [94, 388, 2],
    [94, 312, 2],
  ],
  toFwh: [
    [214, 388, 2],
    [190, 388, 2],
  ],
  fwh: [
    [190, 388, 8],
    [128, 388, 8],
  ],
  pump2: [
    [124, 388, 2],
    [104, 388, 2],
  ],
  feed2: [
    [104, 388, 2],
    [94, 388, 2],
    [94, 312, 2],
  ],
  boil: [
    [94, 310, 2],
    [94, 284, 2],
    [36, 274, 2],
    [94, 260, 2],
    [36, 246, 2],
    [94, 232, 2],
    [36, 218, 2],
    [36, 146, 2],
    [92, 146, 2],
    [92, 136, 2],
    [64, 136, 2],
    [64, 128, 2],
  ],
  main: [
    [64, 128, 2],
    [64, 96, 2],
    [124, 96, 2],
  ],
  turb: [
    [124, 96, 9],
    [236, 96, 30],
    [246, 130, 6],
  ],
  ta: [
    [124, 96, 9],
    [150, 96, 14],
  ],
  tb: [
    [150, 96, 14],
    [236, 96, 30],
    [246, 130, 6],
  ],
  bleed: [
    [150, 116, 2],
    [150, 374, 2],
  ],
  hp: [
    [124, 96, 9],
    [160, 96, 16],
    [166, 117, 3],
  ],
  r4: [
    [166, 117, 2],
    [166, 160, 2],
    [104, 160, 2],
  ],
  rh: [
    [104, 160, 2],
    [70, 160, 2],
    [70, 168, 2],
    [100, 168, 2],
    [100, 176, 2],
    [70, 176, 2],
    [70, 184, 2],
    [100, 184, 2],
    [100, 192, 2],
    [70, 192, 2],
    [70, 198, 2],
    [104, 198, 2],
  ],
  s5: [
    [104, 198, 2],
    [202, 198, 2],
    [202, 120, 2],
  ],
  lp: [
    [202, 120, 3],
    [212, 96, 20],
    [236, 96, 30],
    [246, 130, 6],
  ],
  ex: [
    [246, 130, 6],
    [246, 208, 6],
  ],
  cond: [
    [246, 214, 34],
    [246, 272, 34],
  ],
  l1: [
    [246, 276, 2],
    [246, 388, 2],
    [238, 388, 2],
  ],
};

const P_RF: Record<string, Pt[]> = {
  comp: [
    [264, 252, 2],
    [264, 200, 2],
  ],
  dis: [
    [264, 200, 2],
    [264, 104, 2],
    [250, 104, 2],
  ],
  cond: [
    [250, 104, 2],
    [44, 104, 2],
    [44, 116, 2],
    [250, 116, 2],
    [250, 128, 2],
    [44, 128, 2],
  ],
  liq: [
    [44, 128, 2],
    [34, 128, 2],
    [34, 206, 2],
  ],
  valve: [
    [34, 206, 2],
    [34, 234, 2],
  ],
  l4: [
    [34, 234, 2],
    [34, 330, 2],
    [44, 330, 2],
  ],
  evap: [
    [44, 330, 2],
    [250, 330, 2],
    [250, 342, 2],
    [44, 342, 2],
    [44, 354, 2],
    [250, 354, 2],
  ],
  suc: [
    [250, 354, 2],
    [264, 354, 2],
    [264, 252, 2],
  ],
};

function along(path: Pt[], u: number): { x: number; y: number; hw: number; nx: number; ny: number } {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
  let d = clamp(u, 0, 1) * total;
  for (let i = 1; i < path.length; i++) {
    const [x0, y0, h0] = path[i - 1];
    const [x1, y1, h1] = path[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (d <= len || i === path.length - 1) {
      const k = len > 0 ? Math.min(1, d / len) : 0;
      return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, hw: h0 + (h1 - h0) * k, nx: len > 0 ? -(y1 - y0) / len : 0, ny: len > 0 ? (x1 - x0) / len : 1 };
    }
    d -= len;
  }
  const [x, y, hw] = path[path.length - 1];
  return { x, y, hw, nx: 0, ny: 1 };
}

function locate(phases: Phase[], t: number): { i: number; p: number } {
  let acc = 0;
  for (let i = 0; i < phases.length; i++) {
    if (t < acc + phases[i].dur) return { i, p: (t - acc) / phases[i].dur };
    acc += phases[i].dur;
  }
  return { i: phases.length - 1, p: 1 };
}

/** Estado interpolado nas amostras da etapa (rápido, para as partículas). */
function sampleAt(ph: Phase, p: number): { T: number; x: number } {
  const n = ph.samp.length - 1;
  const k = clamp(p, 0, 1) * n;
  const i = Math.min(n - 1, Math.floor(k));
  const u = k - i;
  const a = ph.samp[i];
  const b = ph.samp[i + 1];
  return { T: a.T + (b.T - a.T) * u, x: a.x + (b.x - a.x) * u };
}

function sceneKey(v: LabValues): string {
  return ['cyc', 'mod', 'pb', 't3', 'pc', 'etat', 'te', 'tc', 'cap'].map((k) => (v[k] ?? 0).toFixed(4)).join('|');
}

function buildScene(v: LabValues): Scene {
  const rankine = isRankine(v);
  const fluid = rankine ? WATER : R134A;
  const rk = rankine ? rankineState(v) : null;
  const rf = rankine ? null : refrigState(v);
  const pts = rk ? rk.pts : (rf as RefrigState).pts;
  const eff = rk ? rk.eff : 1;
  const ph = (key: string, name: string, dur: number, ia: number, ib: number, leg: VLegKind | null, path: Pt[]): Phase => {
    const a = pts[ia];
    const b = pts[ib];
    const samp = leg ? Array.from({ length: 9 }, (_, i) => legState(fluid, a, b, leg, eff, i / 8)) : [a, a];
    return { key, name, dur, a, b, leg, path, samp };
  };
  let phases: Phase[];
  if (rk && rk.mod === MOD.reheat) {
    phases = [
      ph('pump', 'Bomba 1 → 2: eleva a pressão do líquido', 0.5, 0, 1, 'pump', P_RK.pump1),
      ph('l2', 'Alimentação (estado 2): a água comprimida segue para a caldeira', 0.8, 1, 1, null, P_RK.feed),
      ph('boil', 'Caldeira 2 → 3: aquece, vaporiza e superaquece a P constante', 2, 1, 2, 'heat', P_RK.boil),
      ph('s3', 'Vapor vivo (estado 3): segue para a turbina de alta', 0.45, 2, 2, null, P_RK.main),
      ph('hp', 'Turbina de alta 3 → 4: expande até 1/4 da pressão', 0.7, 2, 3, 'expand', P_RK.hp),
      ph('r4', 'Retorno (estado 4): o vapor volta à caldeira para reaquecer', 0.5, 3, 3, null, P_RK.r4),
      ph('rh', 'Reaquecedor 4 → 5: volta à temperatura T₃ a P constante', 0.9, 3, 4, 'heat', P_RK.rh),
      ph('s5', 'Vapor reaquecido (estado 5): segue para a turbina de baixa', 0.5, 4, 4, null, P_RK.s5),
      ph('lp', 'Turbina de baixa 5 → 6: expande até o condensador', 0.9, 4, 5, 'expand', P_RK.lp),
      ph('ex', 'Escape (estado 6): desce da turbina ao condensador', 0.45, 5, 5, null, P_RK.ex),
      ph('cond', 'Condensador 6 → 1: o vapor condensa a P e T constantes', 1.4, 5, 0, 'heat', P_RK.cond),
      ph('l1', 'Condensado (estado 1): líquido saturado volta à bomba', 0.6, 0, 0, null, P_RK.l1),
    ];
  } else if (rk && rk.mod === MOD.regen) {
    phases = [
      ph('pump', 'Bomba 1 → 2: leva o condensado à pressão do aquecedor', 0.45, 0, 1, 'pump', P_RK.pump1),
      ph('l2', 'Condensado (estado 2): entra no aquecedor aberto', 0.3, 1, 1, null, P_RK.toFwh),
      ph('fwh', 'Aquecedor aberto 2 → 3: recebe o vapor extraído; sai líquido saturado', 1, 1, 2, 'heat', P_RK.fwh),
      ph('pump2', 'Bomba 2 → 4: eleva a pressão até a da caldeira', 0.4, 2, 3, 'pump', P_RK.pump2),
      ph('l4', 'Alimentação (estado 4): já pré-aquecida, entra na caldeira', 0.5, 3, 3, null, P_RK.feed2),
      ph('boil', 'Caldeira 4 → 5: aquece, vaporiza e superaquece a P constante', 1.7, 3, 4, 'heat', P_RK.boil),
      ph('s3', 'Vapor vivo (estado 5): segue para a turbina', 0.45, 4, 4, null, P_RK.main),
      ph('ta', 'Turbina 5 → 6: expande até a extração (y sai para o aquecedor)', 0.6, 4, 5, 'expand', P_RK.ta),
      ph('tb', 'Turbina 6 → 7: o restante (1 − y) expande até o fim', 0.6, 5, 6, 'expand', P_RK.tb),
      ph('ex', 'Escape (estado 7): desce da turbina ao condensador', 0.45, 6, 6, null, P_RK.ex),
      ph('cond', 'Condensador 7 → 1: o vapor condensa a P e T constantes', 1.3, 6, 0, 'heat', P_RK.cond),
      ph('l1', 'Condensado (estado 1): líquido saturado volta à bomba', 0.6, 0, 0, null, P_RK.l1),
    ];
  } else if (rk) {
    phases = [
      ph('pump', 'Bomba 1 → 2: eleva a pressão do líquido (pouco trabalho)', 0.5, 0, 1, 'pump', P_RK.pump1),
      ph('l2', 'Alimentação (estado 2): a água comprimida segue para a caldeira', 0.8, 1, 1, null, P_RK.feed),
      ph('boil', 'Caldeira 2 → 3: aquece, vaporiza e superaquece a P constante', 2.1, 1, 2, 'heat', P_RK.boil),
      ph('s3', 'Vapor vivo (estado 3): superaquecido, segue para a turbina', 0.5, 2, 2, null, P_RK.main),
      ph('turb', 'Turbina 3 → 4: o vapor expande e gira o eixo', 1.1, 2, 3, 'expand', P_RK.turb),
      ph('ex', 'Escape (estado 4): desce da turbina ao condensador', 0.45, 3, 3, null, P_RK.ex),
      ph('cond', 'Condensador 4 → 1: o vapor condensa a P e T constantes', 1.4, 3, 0, 'heat', P_RK.cond),
      ph('l1', 'Condensado (estado 1): líquido saturado volta à bomba', 0.6, 0, 0, null, P_RK.l1),
    ];
  } else {
    phases = [
      ph('comp', 'Compressor 1 → 2: comprime o vapor (isentrópico) e o aquece', 0.9, 0, 1, 'compress', P_RF.comp),
      ph('dis', 'Descarga (estado 2): vapor quente a alta pressão', 0.6, 1, 1, null, P_RF.dis),
      ph('cond', 'Condensador 2 → 3: esfria, condensa e rejeita q_H para o ambiente', 1.8, 1, 2, 'heat', P_RF.cond),
      ph('liq', 'Linha de líquido (estado 3): líquido saturado a alta pressão', 0.6, 2, 2, null, P_RF.liq),
      ph('valve', 'Válvula 3 → 4: estrangula a h constante; parte vira vapor (flash)', 0.45, 2, 3, 'throttle', P_RF.valve),
      ph('l4', 'Mistura fria (estado 4): entra no evaporador', 0.6, 3, 3, null, P_RF.l4),
      ph('evap', 'Evaporador 4 → 1: o refrigerante ferve roubando calor da câmara', 2, 3, 0, 'heat', P_RF.evap),
      ph('suc', 'Sucção (estado 1): vapor saturado volta ao compressor', 0.6, 0, 0, null, P_RF.suc),
    ];
  }
  const legs = (rk ? rk.legs : (rf as RefrigState).legs).map((l) => legPath(fluid, pts[l.from], pts[l.to], l.kind, eff, l.kind === 'heat' ? 30 : 16));
  return {
    rankine,
    fluid,
    rk,
    rf,
    pts,
    eff,
    phases,
    period: phases.reduce((a, q) => a + q.dur, 0),
    legs,
    kinds: (rk ? rk.legs : (rf as RefrigState).legs).map((l) => l.kind),
    shape: rk ? `rk${rk.mod}` : 'rf',
  };
}

interface Particle {
  s: number;
  o: number;
  r: number;
}

export function vaporView(): LabView {
  const rnd = seeded(41);
  const parts: Particle[] = Array.from({ length: 120 }, (_, i) => ({ s: i * 0.09, o: rnd() * 2 - 1, r: rnd() }));
  const bleed = Array.from({ length: 14 }, () => ({ t: rnd(), o: rnd() * 2 - 1, r: rnd() }));
  let clock = 0;
  let paused = false;
  let stepNext = false;
  let key = '';
  let scene: Scene | null = null;

  function getScene(v: LabValues): Scene {
    const k = sceneKey(v);
    if (!scene || k !== key) {
      const next = buildScene(v);
      if (!scene || next.shape !== scene.shape) clock = 0;
      scene = next;
      key = k;
    }
    return scene;
  }

  function panel(ctx: CanvasRenderingContext2D, title: string, sub: string): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 8, 8, 300, 544, 10);
    ctx.fill();
    text(ctx, title, 22, 30, { size: 13, bold: true });
    text(ctx, sub, 22, 48, { size: 11, color: C.dim });
  }

  /** Etapa atual em duas linhas: "equipamento a → b" em destaque e, embaixo, o que acontece. */
  function caption(ctx: CanvasRenderingContext2D, name: string, color: string): void {
    const i = name.indexOf(': ');
    const head = i < 0 ? name : name.slice(0, i);
    const body = i < 0 ? '' : name.slice(i + 2);
    text(ctx, head, 18, 431, { size: 11, bold: true, color });
    if (!body) return;
    let size = 10.5;
    for (; size > 8.5; size -= 0.5) {
      ctx.font = `600 ${size}px ${FONT}`;
      if (ctx.measureText(body).width <= 284) break;
    }
    text(ctx, body, 18, 445, { size, color: C.dim });
  }

  function pipe(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string, w = 7): void {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const [col, lw] of [
      ['#0d1824', w + 4],
      [color, w],
    ] as const) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
  }
  const xy = (path: Pt[]) => path.map(([x, y]) => [x, y] as [number, number]);

  /** Partícula de fluido: anel = vapor, ponto = líquido (na mistura, uma fração x vira anel). */
  function blob(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, vap: boolean, alpha = 1): void {
    ctx.globalAlpha = alpha;
    if (vap) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, 2.8, 0, TAU);
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 2.3, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawParticles(ctx: CanvasRenderingContext2D, sc: Scene, tc: (T: number, a?: number) => string): void {
    for (const pt of parts) {
      pt.s %= sc.period;
      const { i, p } = locate(sc.phases, pt.s);
      const ph = sc.phases[i];
      const a = along(ph.path, p);
      const st = sampleAt(ph, p);
      blob(ctx, a.x + a.nx * a.hw * pt.o, a.y + a.ny * a.hw * pt.o, tc(st.T), pt.r < st.x);
    }
    // parcela acompanhada nos diagramas
    const tg = locate(sc.phases, clock);
    const a = along(sc.phases[tg.i].path, tg.p);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(a.x, a.y, 6, 0, TAU);
    ctx.stroke();
  }

  /** Turbina (trapézio com pás girando). */
  function machine(ctx: CanvasRenderingContext2D, x0: number, x1: number, h0: number, h1: number, Tin: number, Tout: number, time: number, label: string): void {
    const y = 96;
    const shape = () => {
      ctx.beginPath();
      ctx.moveTo(x0, y - h0);
      ctx.lineTo(x1, y - h1);
      ctx.lineTo(x1, y + h1);
      ctx.lineTo(x0, y + h0);
      ctx.closePath();
    };
    shape();
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, tcW(Tin, 0.4));
    g.addColorStop(1, tcW(Tout, 0.4));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = 'rgba(220,230,240,0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.lineDashOffset = -time * 40;
    for (let x = x0 + 7; x < x1 - 3; x += 9) {
      ctx.beginPath();
      ctx.moveTo(x, y - 50);
      ctx.lineTo(x, y + 50);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.restore();
    shape();
    ctx.strokeStyle = C.metalLight;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    if (label) text(ctx, label, (x0 + x1) / 2, y + 4, { size: 11, bold: true, align: 'center', shadow: true });
  }

  function pumpIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number, label: string): void {
    ctx.fillStyle = '#2d3a49';
    ctx.strokeStyle = C.metalLight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = C.curve1;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = time * 6 + (i * TAU) / 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
      ctx.stroke();
    }
    text(ctx, label, cx, cy + r + 13, { size: 9, align: 'center', color: C.dim, bold: true });
  }

  // ---------------------------------------------------------------- usina a vapor
  function drawPlant(ctx: CanvasRenderingContext2D, sc: Scene, time: number): void {
    const st = sc.rk as RankineState;
    const reheat = st.mod === MOD.reheat;
    const regen = st.mod === MOD.regen;
    const pts = st.pts;
    const top = pts[regen ? 4 : 2];
    const exit = pts[pts.length - 1];
    const p1 = pts[0];
    const sub = `${fmtP(st.pb)} · ${f0(st.T3)} °C · condensador a ${fmtP(st.pc)}${st.eff < 1 ? ` · turbina ${f0(st.eff * 100)} %` : ''}`;
    panel(ctx, `Usina a vapor — Rankine ${['simples', 'com reaquecimento', 'regenerativo'][st.mod]}`, sub);

    // tubos (por baixo dos equipamentos)
    pipe(ctx, xy(P_RK.main), tcW(top.T, 0.75), 8);
    pipe(ctx, xy(P_RK.ex), tcW(exit.T, 0.6), 13);
    pipe(ctx, xy(P_RK.l1), tcW(p1.T, 0.7), 6);
    if (regen) {
      pipe(ctx, xy(P_RK.toFwh), tcW(pts[1].T, 0.7), 6);
      pipe(ctx, xy(P_RK.feed2), tcW(pts[3].T, 0.7), 6);
      pipe(ctx, xy(P_RK.bleed), tcW(pts[5].T, 0.7), 5);
    } else pipe(ctx, xy(P_RK.feed), tcW(pts[1].T, 0.7), 6);
    if (reheat) {
      pipe(ctx, xy(P_RK.r4), tcW(pts[3].T, 0.7), 7);
      pipe(ctx, xy(P_RK.s5), tcW(pts[4].T, 0.75), 7);
    }

    // caldeira
    const bx = 24;
    const by = 128;
    ctx.fillStyle = '#2a2220';
    roundRect(ctx, bx, by, 80, 184, 6);
    ctx.fill();
    ctx.strokeStyle = '#8a6450';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    roundRect(ctx, bx, by, 80, 184, 6);
    ctx.clip();
    for (let i = 0; i < 5; i++) {
      const x = 32 + i * 12;
      const r = 13 * (0.8 + 0.2 * Math.sin(time * 10 + i * 1.9));
      const g = ctx.createRadialGradient(x, 300, 1, x, 300, r);
      g.addColorStop(0, 'rgba(255,240,170,0.95)');
      g.addColorStop(0.5, 'rgba(255,150,60,0.6)');
      g.addColorStop(1, 'rgba(239,91,67,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, 300 - r, 2 * r, 2 * r);
    }
    // tubos de água (evaporador) com bolhas
    const evTop = reheat ? 206 : 158;
    for (let x = 32; x <= 96; x += 8) {
      ctx.fillStyle = 'rgba(59,143,224,0.25)';
      ctx.fillRect(x - 2, evTop, 4, 278 - evTop);
      for (let k = 0; k < 3; k++) {
        const yy = 278 - ((time * 26 + x * 3.1 + k * 23) % (278 - evTop));
        ctx.strokeStyle = 'rgba(226,235,245,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, yy, 1.6, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.restore();
    const coil = (pts: [number, number][], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.lineJoin = 'miter';
    };
    coil(
      [
        [30, 142],
        [98, 142],
        [98, 148],
        [30, 148],
        [30, 136],
        [98, 136],
      ],
      tcW(top.T, 0.9),
    );
    text(ctx, 'superaquecedor', 68, 156, { size: 8, align: 'center', color: C.dim });
    if (reheat) {
      coil(xy(P_RK.rh), tcW(pts[4].T, 0.9));
      text(ctx, 'reaquecedor', 110, 183, { size: 8, color: C.violet, bold: true });
    }
    text(ctx, 'Caldeira', 64, 326, { size: 11, bold: true, align: 'center' });

    // turbina(s), eixo e gerador
    ctx.strokeStyle = C.metal;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(124, 96);
    ctx.lineTo(270, 96);
    ctx.stroke();
    if (reheat) {
      machine(ctx, 124, 172, 12, 22, top.T, pts[3].T, time, 'AP');
      machine(ctx, 196, 262, 22, 40, pts[4].T, exit.T, time, 'BP');
    } else machine(ctx, 124, 262, 12, 40, top.T, exit.T, time, 'Turbina');
    ctx.fillStyle = '#3b4654';
    roundRect(ctx, 268, 82, 30, 28, 6);
    ctx.fill();
    ctx.strokeStyle = C.good;
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, 'G', 283, 101, { size: 14, bold: true, align: 'center', color: C.good });

    // condensador (água de resfriamento nos tubos)
    ctx.fillStyle = '#1d2b3a';
    roundRect(ctx, 196, 210, 100, 66, 8);
    ctx.fill();
    ctx.strokeStyle = C.metalLight;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(59,155,232,0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.lineDashOffset = time * 30;
    for (const y of [226, 242, 258]) {
      ctx.beginPath();
      ctx.moveTo(200, y);
      ctx.lineTo(292, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    text(ctx, 'Condensador', 238, 291, { size: 10, bold: true, align: 'right' });
    text(ctx, 'água de resfriamento', 296, 206, { size: 8, align: 'right', color: C.cold });

    // bombas e aquecedor aberto
    pumpIcon(ctx, 226, 388, 12, time, regen ? 'Bomba 1' : 'Bomba');
    if (regen) {
      ctx.fillStyle = '#22303f';
      roundRect(ctx, 128, 374, 62, 28, 12);
      ctx.fill();
      ctx.strokeStyle = C.metalLight;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = tcW(pts[2].T, 0.45);
      ctx.fillRect(132, 389, 54, 10);
      text(ctx, 'aquecedor aberto', 159, 414, { size: 9, align: 'center', color: C.dim, bold: true });
      pumpIcon(ctx, 114, 388, 10, time, '2');
      // vapor extraído descendo
      const n = Math.min(bleed.length, Math.round(3 + st.y * 40));
      for (let i = 0; i < n; i++) {
        const b = bleed[i];
        if (!paused) b.t = (b.t + 0.004) % 1;
        const a = along(P_RK.bleed, b.t);
        blob(ctx, a.x + b.o * 1.5, a.y, tcW(pts[5].T), b.r < pts[5].x);
      }
      text(ctx, `y = ${f1(st.y * 100)} %`, 157, 165, { size: 10, bold: true, color: C.violet, shadow: true });
    }

    drawParticles(ctx, sc, tcW);

    // estados
    const stTag = (n: number, q: FState, x: number, y: number, align: CanvasTextAlign = 'center') => {
      const desc = q.phase === 'mix' ? `x = ${fmt(q.x, 2)}` : `${f0(q.T)} °C`;
      tag(ctx, `${n} · ${desc}`, x, y, tcW(q.T), align, 10);
    };
    stTag(1, p1, 240, 340, 'right');
    if (regen) {
      stTag(2, pts[1], 214, 368, 'right');
      stTag(3, pts[2], 128, 368, 'right');
      stTag(5, top, 70, 84);
      stTag(6, pts[5], 156, 142, 'left');
      stTag(7, exit, 240, 186, 'right');
    } else {
      stTag(2, pts[1], 160, 378);
      stTag(3, top, 70, 84);
      if (reheat) {
        stTag(4, pts[3], 160, 150, 'right');
        stTag(5, pts[4], 196, 214, 'right');
        stTag(6, exit, 300, 176, 'right');
      } else stTag(4, exit, 240, 176, 'right');
    }
    tag(ctx, `q_in = ${f0(st.qin)} kJ/kg`, 64, 346, C.curve2, 'center', 10);

    // etapa e trabalhos no eixo
    const tph = sc.phases[locate(sc.phases, clock).i];
    caption(ctx, tph.name, tph.leg === 'heat' ? (tph.key === 'cond' ? C.cold : C.curve2) : C.text);
    const x0 = 18;
    const wMax = 282;
    const k = wMax / st.wt;
    text(ctx, st.mod === MOD.reheat ? 'Turbinas AP + BP: w_t' : 'Turbina: w_t', x0, 458, { size: 10, color: C.dim });
    text(ctx, `${f0(st.wt)} kJ/kg`, x0 + wMax, 458, { size: 10, bold: true, align: 'right', color: C.curve2 });
    ctx.fillStyle = C.curve2;
    ctx.fillRect(x0, 463, wMax, 12);
    text(ctx, `${regen ? 'Bombas' : 'Bomba'}: w_b = ${f1(st.wp)} (${f1(st.bwr * 100)} % de w_t)`, x0, 494, { size: 10, color: C.bad, bold: true });
    text(ctx, `Líquido: ${f0(st.wnet)}`, x0 + wMax, 494, { size: 10, color: C.good, bold: true, align: 'right' });
    ctx.fillStyle = C.bad;
    ctx.fillRect(x0, 499, Math.max(1.5, st.wp * k), 12);
    ctx.fillStyle = C.good;
    ctx.fillRect(x0 + st.wp * k, 499, Math.max(0, st.wnet * k), 12);
    text(ctx, 'Bombear líquido custa quase nada (v·ΔP com v', x0, 530, { size: 10, color: C.dim });
    text(ctx, 'pequeno); no Brayton o compressor come 40–60 %.', x0, 544, { size: 10, color: C.dim });
  }

  // ---------------------------------------------------------------- refrigerador
  function drawFridge(ctx: CanvasRenderingContext2D, sc: Scene, time: number): void {
    const st = sc.rf as RefrigState;
    const [p1, p2, p3, p4] = st.pts;
    panel(ctx, 'Refrigerador por compressão de vapor', `R-134a · evapora a ${f0(st.te)} °C · condensa a ${f0(st.tc)} °C · ${f0(st.QL / TR_KW)} TR`);

    // câmara fria
    ctx.fillStyle = 'rgba(59,155,232,0.09)';
    roundRect(ctx, 20, 290, 276, 112, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(59,155,232,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, 'câmara refrigerada', 50, 305, { size: 9, color: C.cold, bold: true });
    for (const x of [62, 96, 198, 232]) arrow(ctx, x, 396, x, 368, C.cold, 2, 6);
    text(ctx, 'q_L sai da câmara', 147, 397, { size: 9, color: C.cold, align: 'center' });

    // tubos
    pipe(ctx, xy(P_RF.dis), tcR(p2.T, 0.75), 6);
    pipe(ctx, xy(P_RF.liq), tcR(p3.T, 0.75), 5);
    pipe(ctx, xy(P_RF.l4), tcR(p4.T, 0.75), 6);
    pipe(ctx, xy(P_RF.suc), tcR(p1.T, 0.75), 7);

    // serpentinas com aletas
    const fins = (y0: number, y1: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let x = 46; x <= 248; x += 6) {
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
      }
    };
    fins(96, 136, 'rgba(200,210,220,0.35)');
    fins(322, 362, 'rgba(200,225,245,0.4)');
    pipe(ctx, xy(P_RF.cond), tcR((p2.T + p3.T) / 2, 0.8), 5);
    pipe(ctx, xy(P_RF.evap), tcR(st.te, 0.8), 5);
    // gelo no evaporador
    if (st.te < 0) {
      const r = seeded(7);
      ctx.fillStyle = 'rgba(235,245,255,0.75)';
      for (let i = 0; i < 40; i++) ctx.fillRect(46 + r() * 202, 324 + r() * 36, 1.5, 1.5);
    }
    text(ctx, 'Condensador', 147, 90, { size: 10, bold: true, align: 'center' });
    for (const x of [62, 96, 198, 232]) arrow(ctx, x, 86, x, 62, C.curve2, 2, 6);
    text(ctx, 'q_H para o ambiente', 147, 73, { size: 9, align: 'center', color: C.curve2 });
    text(ctx, 'Evaporador', 147, 378, { size: 10, bold: true, align: 'center' });

    // compressor (hermético) com o motor
    ctx.fillStyle = '#34404d';
    roundRect(ctx, 240, 196, 48, 58, 14);
    ctx.fill();
    ctx.strokeStyle = C.metalLight;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = C.bad;
    ctx.lineWidth = 2;
    const a = time * 8;
    ctx.beginPath();
    ctx.arc(264, 225, 9, a, a + 4.2);
    ctx.stroke();
    text(ctx, 'Compressor', 234, 230, { size: 10, bold: true, align: 'right' });
    arrow(ctx, 306, 225, 290, 225, C.bad, 3, 7);
    text(ctx, 'w', 298, 216, { size: 11, bold: true, color: C.bad, align: 'center' });

    // válvula de expansão
    ctx.fillStyle = C.metalLight;
    ctx.beginPath();
    ctx.moveTo(26, 210);
    ctx.lineTo(42, 210);
    ctx.lineTo(26, 230);
    ctx.lineTo(42, 230);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.metalLight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(42, 220);
    ctx.lineTo(54, 220);
    ctx.stroke();
    text(ctx, 'Válvula', 58, 224, { size: 10, bold: true });

    drawParticles(ctx, sc, tcR);

    const stTag = (n: number, q: FState, x: number, y: number, align: CanvasTextAlign) => {
      const desc = q.phase === 'mix' ? `x = ${fmt(q.x, 2)}` : `${f0(q.T)} °C`;
      tag(ctx, `${n} · ${desc}`, x, y, tcR(q.T), align, 10);
    };
    stTag(1, p1, 258, 282, 'right');
    stTag(2, p2, 258, 170, 'right');
    stTag(3, p3, 40, 170, 'left');
    stTag(4, p4, 40, 272, 'left');

    // etapa e balanço por kg
    const tph = sc.phases[locate(sc.phases, clock).i];
    caption(ctx, tph.name, tph.key === 'evap' ? C.cold : tph.key === 'cond' ? C.curve2 : C.text);
    const x0 = 18;
    const wMax = 282;
    const k = wMax / st.qH;
    text(ctx, `q_L = ${f1(st.qL)} (refrigera)`, x0, 458, { size: 10, color: C.cold, bold: true });
    text(ctx, `w = ${f1(st.wc)}`, x0 + wMax, 458, { size: 10, color: C.bad, bold: true, align: 'right' });
    ctx.fillStyle = C.cold;
    ctx.fillRect(x0, 463, st.qL * k, 12);
    ctx.fillStyle = C.bad;
    ctx.fillRect(x0 + st.qL * k, 463, st.wc * k, 12);
    text(ctx, `q_H = q_L + w = ${f1(st.qH)} kJ/kg`, x0, 492, { size: 10, color: C.curve2, bold: true });
    text(ctx, `COP = q_L/w = ${fmt(st.cop, 2)}`, x0, 516, { size: 13, bold: true, color: C.good });
    text(ctx, `${f0(st.QL / TR_KW)} TR = ${f1(st.QL)} kW → ṁ = ${fmt(st.mdot, 3)} kg/s · Ẇ = ${fmt(st.Wc, 2)} kW`, x0, 540, { size: 10, color: C.dim });
  }

  // ---------------------------------------------------------------- diagramas
  function current(sc: Scene): FState {
    const { i, p } = locate(sc.phases, clock);
    const ph = sc.phases[i];
    return ph.leg ? legState(sc.fluid, ph.a, ph.b, ph.leg, sc.eff, p) : ph.a;
  }

  function cyclePoly(sc: Scene, f: (q: FState) => [number, number]): [number, number][] {
    return sc.legs.flatMap((l) => l.map(f));
  }

  /** Contorno do ciclo; os processos irreversíveis (válvula, turbina real) vão tracejados, como nos livros. */
  function strokeCycle(ch: Chart, ctx: CanvasRenderingContext2D, sc: Scene, f: (q: FState) => [number, number]): void {
    ctx.lineCap = 'round';
    sc.legs.forEach((l, i) => {
      const k = sc.kinds[i];
      const dashed = k === 'throttle' || (k === 'expand' && sc.eff < 0.999);
      ch.poly(l.map(f), C.amber, 3, dashed ? [7, 6] : []);
    });
    ctx.lineCap = 'butt';
  }

  function drawTsWater(ctx: CanvasRenderingContext2D, sc: Scene, cur: FState): void {
    const st = sc.rk as RankineState;
    // eixo começa no zero absoluto: as áreas sob as curvas são calor de verdade
    const ch = new Chart(ctx, { x: 362, y: 40, w: 570, h: 212, x0: 0, x1: 10, y0: -K0, y1: 650 });
    ch.frame('Diagrama T–s (água)', 's (kJ/kg·K)', 'T (°C)', ticksOf(0, 10, 1), ticksOf(0, 600, 100));
    text(ctx, '0 K', ch.b.x - 6, ch.b.y + ch.b.h + 4, { size: 10, color: C.dim, align: 'right' });
    const dome = domeTs(WATER);
    ch.area(dome, 'rgba(59,155,232,0.08)', true);
    ch.poly(dome, 'rgba(226,235,245,0.55)', 1.5);
    const tLiq = st.mod === MOD.regen ? Math.min(st.pts[2].T + 80, 330) : 180;
    text(ctx, 'líquido', ch.X(satT(WATER, tLiq).sf) - 6, ch.Y(tLiq), { size: 10, color: C.dim, align: 'right' });
    text(ctx, 'líquido + vapor', ch.X(4.4), ch.Y(120), { size: 10, color: C.dim, align: 'center' });
    text(ctx, 'vapor', ch.X(8.6), ch.Y(470), { size: 10, color: C.dim, align: 'center' });
    // calor rejeitado (área sob a condensação) e trabalho líquido (área do ciclo)
    const condLeg = sc.legs[sc.legs.length - 1];
    ch.area(
      condLeg.map((q) => [q.s, q.T]),
      'rgba(59,155,232,0.3)',
    );
    const poly = cyclePoly(sc, (q) => [q.s, q.T]);
    ch.area(poly, 'rgba(95,211,138,0.28)', true);
    // Carnot entre a condensação e T₃
    const p1 = st.pts[0];
    const top = st.pts[st.mod === MOD.regen ? 4 : 2];
    ch.poly(
      [
        [p1.s, p1.T],
        [top.s, p1.T],
        [top.s, top.T],
        [p1.s, top.T],
        [p1.s, p1.T],
      ],
      'rgba(226,235,245,0.75)',
      1.5,
      [5, 4],
    );
    text(ctx, 'Carnot', ch.X(p1.s) + 5, ch.Y(top.T) + 13, { size: 10 });
    strokeCycle(ch, ctx, sc, (q) => [q.s, q.T]);
    // pressões
    const plateau = (P: number, label: string) => {
      const s = satP(WATER, P);
      text(ctx, label, ch.X((s.sf + s.sg) / 2), ch.Y(s.T) - 5, { size: 10, color: C.dim, align: 'center', shadow: true });
    };
    plateau(st.pb, fmtP(st.pb));
    plateau(st.pc, fmtP(st.pc));
    const midS = (p1.s + condLeg[0].s) / 2;
    if (ch.X(condLeg[0].s) - ch.X(p1.s) > 60) text(ctx, 'q_out', ch.X(midS), ch.Y(-140), { size: 11, bold: true, align: 'center', color: C.cold, shadow: true });
    marker(ch, ctx, cur.s, cur.T);
    labelPoints(
      ch,
      ctx,
      st.pts.map((q) => [q.s, q.T]),
      st.pts.map((_, i) => String(i + 1)),
    );
  }

  function drawPh(ctx: CanvasRenderingContext2D, sc: Scene, cur: FState): void {
    const st = sc.rf as RefrigState;
    const lg = Math.log10;
    const ch = new Chart(ctx, { x: 362, y: 42, w: 244, h: 194, x0: 0, x1: 320, y0: lg(40), y1: lg(5000) });
    ch.frame('Diagrama P–h (R-134a)', 'h (kJ/kg)', 'P (kPa)', ticksOf(0, 320, 100), []);
    for (const P of [50, 100, 200, 500, 1000, 2000]) {
      const y = ch.Y(lg(P));
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ch.b.x, y);
      ctx.lineTo(ch.b.x + ch.b.w, y);
      ctx.stroke();
      text(ctx, f0(P), ch.b.x - 6, y + 4, { size: 11, color: C.dim, align: 'right' });
    }
    const dome = domePh(R134A).map(([h, P]) => [h, lg(P)] as [number, number]);
    ch.area(dome, 'rgba(59,155,232,0.08)', true);
    ch.poly(dome, 'rgba(226,235,245,0.55)', 1.5);
    strokeCycle(ch, ctx, sc, (q) => [q.h, lg(q.P)]);
    const [p1, p2, p3, p4] = st.pts;
    // q_L, w e q_H como cotas horizontais
    const dim = (ha: number, hb: number, P: number, dy: number, color: string, label: string) => {
      const y = ch.Y(lg(P)) + dy;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ch.X(ha), y);
      ctx.lineTo(ch.X(hb), y);
      ctx.stroke();
      for (const h of [ha, hb]) {
        ctx.beginPath();
        ctx.moveTo(ch.X(h), y - 4);
        ctx.lineTo(ch.X(h), y + 4);
        ctx.stroke();
      }
      text(ctx, label, (ch.X(ha) + ch.X(hb)) / 2, y + (dy > 0 ? 13 : -4), { size: 10, bold: true, align: 'center', color, shadow: true });
    };
    dim(p4.h, p1.h, p4.P, 9, C.cold, 'q_L');
    dim(p3.h, p2.h, p2.P, -9, C.curve2, 'q_H');
    dim(p1.h, p2.h, Math.sqrt(p1.P * p2.P), 0, C.bad, 'w');
    marker(ch, ctx, cur.h, lg(cur.P));
    labelPoints(
      ch,
      ctx,
      st.pts.map((q) => [q.h, lg(q.P)]),
      ['1', '2', '3', '4'],
    );
  }

  function drawTsR134a(ctx: CanvasRenderingContext2D, sc: Scene, cur: FState): void {
    const st = sc.rf as RefrigState;
    const ch = new Chart(ctx, { x: 694, y: 42, w: 240, h: 194, x0: 0, x1: 1.1, y0: -40, y1: 110 });
    ch.frame('Diagrama T–s (R-134a)', 's (kJ/kg·K)', 'T (°C)', ticksOf(0, 1.1, 0.2), ticksOf(-40, 110, 40), 0, 1);
    const dome = domeTs(R134A);
    ch.area(dome, 'rgba(59,155,232,0.08)', true);
    ch.poly(dome, 'rgba(226,235,245,0.55)', 1.5);
    const poly = cyclePoly(sc, (q) => [q.s, q.T]);
    ch.area(poly, 'rgba(255,107,94,0.25)', true);
    strokeCycle(ch, ctx, sc, (q) => [q.s, q.T]);
    text(ctx, 'área ≈ w', ch.X(0.95), ch.Y(-25), { size: 10, color: C.bad, align: 'center' });
    marker(ch, ctx, cur.s, cur.T);
    labelPoints(
      ch,
      ctx,
      st.pts.map((q) => [q.s, q.T]),
      ['1', '2', '3', '4'],
    );
  }

  // ---------------------------------------------------------------- contas
  const descRk = [
    ['saída do condensador', 'saída da bomba', 'entrada da turbina', 'saída da turbina'],
    ['saída do condensador', 'saída da bomba', 'entrada da turbina AP', 'saída da turbina AP', 'saída do reaquecedor', 'saída da turbina BP'],
    ['saída do condensador', 'saída da bomba 1', 'saída do aquecedor aberto', 'saída da bomba 2', 'entrada da turbina', 'extração', 'saída da turbina'],
  ];
  const descRf = ['saída do evaporador (vapor sat.)', 'descarga do compressor', 'saída do condensador (líq. sat.)', 'após a válvula'];

  function stateTable(ctx: CanvasRenderingContext2D, pts: FState[], desc: string[], y0: number): number {
    const cols: [string, number][] = [
      ['P', 548],
      ['T (°C)', 598],
      ['h (kJ/kg)', 654],
      ['s', 700],
      ['x', 742],
    ];
    for (const [hd, x] of cols) text(ctx, hd, x, y0, { size: 10, color: C.dim, align: 'right' });
    const dy = pts.length > 5 ? 13 : 14;
    pts.forEach((q, i) => {
      const y = y0 + 16 + i * dy;
      text(ctx, String(i + 1), 332, y, { size: 11, bold: true });
      text(ctx, desc[i], 346, y, { size: 10, color: C.dim });
      const xs = q.phase === 'mix' ? fmt(q.x, 3) : q.phase === 'liq' ? 'líq.' : q.T > satP(scene?.fluid ?? WATER, q.P).T + 0.5 ? 'sup.' : '1';
      [fmtP(q.P), f1(q.T), f1(q.h), f4(q.s), xs].forEach((val, j) => text(ctx, val, cols[j][1], y, { size: 11, bold: true, align: 'right' }));
    });
    return y0 + 16 + (pts.length - 1) * dy;
  }

  function bars(ctx: CanvasRenderingContext2D, qin: number, wnet: number, qout: number, eta: number, etaC: number): void {
    const bx = 766;
    const bw = 176;
    text(ctx, 'Calor fornecido', bx, 332, { size: 10, color: C.dim });
    text(ctx, `${f0(qin)} kJ/kg`, bx + bw, 332, { size: 10, bold: true, align: 'right', color: C.curve2 });
    ctx.fillStyle = C.curve2;
    ctx.fillRect(bx, 338, bw, 16);
    const fw = bw * clamp(wnet / qin, 0, 1);
    text(ctx, `w_líq ${f0(wnet)}`, bx, 372, { size: 10, color: C.good, bold: true });
    text(ctx, `q_out ${f0(qout)}`, bx + bw, 372, { size: 10, color: C.cold, bold: true, align: 'right' });
    ctx.fillStyle = C.good;
    ctx.fillRect(bx, 378, fw, 16);
    ctx.fillStyle = C.cold;
    ctx.fillRect(bx + fw, 378, bw - fw, 16);
    text(ctx, 'Rendimento (0 a 100 %)', bx, 424, { size: 10, color: C.dim });
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(bx, 430, bw, 18);
    ctx.fillRect(bx, 454, bw, 18);
    ctx.fillStyle = C.good;
    ctx.fillRect(bx, 430, bw * clamp(eta, 0, 1), 18);
    ctx.fillStyle = 'rgba(226,235,245,0.22)';
    ctx.fillRect(bx, 454, bw * clamp(etaC, 0, 1), 18);
    ctx.strokeStyle = 'rgba(226,235,245,0.8)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, 454, bw * clamp(etaC, 0, 1), 18);
    ctx.setLineDash([]);
    text(ctx, `ciclo: ${f1(eta * 100)} %`, bx + 6, 444, { size: 11, bold: true, shadow: true });
    text(ctx, `Carnot: ${f1(etaC * 100)} %`, bx + 6, 468, { size: 11, bold: true, shadow: true });
  }

  function drawCalcRk(ctx: CanvasRenderingContext2D, st: RankineState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 316, 290, 636, 262, 10);
    ctx.fill();
    text(ctx, `Rankine ${['simples', 'com reaquecimento', 'regenerativo (aquecedor aberto)'][st.mod]} · por kg de vapor da caldeira`, 332, 312, { size: 13, bold: true });
    let y = stateTable(ctx, st.pts, descRk[st.mod], 332) + 20;
    const h = st.pts.map((q) => q.h);
    let lines: string[];
    if (st.mod === MOD.reheat) {
      lines = [
        `Bomba: w_b = h₂ − h₁ = v₁·(P₂ − P₁) = ${f1(st.wp)} kJ/kg`,
        `Turbinas: w_t = (h₃ − h₄) + (h₅ − h₆) = ${f0(h[2] - h[3])} + ${f0(h[4] - h[5])} = ${f0(st.wt)} kJ/kg`,
        `Caldeira: q_in = (h₃ − h₂) + (h₅ − h₄) = ${f0(h[2] - h[1])} + ${f0(h[4] - h[3])} = ${f0(st.qin)} kJ/kg`,
        `η = (w_t − w_b)/q_in = (${f0(st.wt)} − ${f1(st.wp)})/${f0(st.qin)} = ${f1(st.eta * 100)} %`,
      ];
    } else if (st.mod === MOD.regen) {
      lines = [
        `Aquecedor aberto: y·h₆ + (1 − y)·h₂ = h₃ → y = (h₃ − h₂)/(h₆ − h₂) = ${fmt(st.y, 3)}`,
        `Turbina: w_t = (h₅ − h₆) + (1 − y)·(h₆ − h₇) = ${f0(st.wt)} kJ/kg`,
        `Bombas: w_b = (1 − y)·(h₂ − h₁) + (h₄ − h₃) = ${f1(st.wp)} kJ/kg`,
        `Caldeira: q_in = h₅ − h₄ = ${f0(h[4])} − ${f0(h[3])} = ${f0(st.qin)} kJ/kg → η = ${f1(st.eta * 100)} %`,
      ];
    } else {
      const v1 = (h[1] - h[0]) / (st.pts[1].P - st.pts[0].P);
      lines = [
        `Bomba: w_b = v₁·(P₂ − P₁) = ${fmt(v1, 5)} × ${f0(st.pts[1].P - st.pts[0].P)} = ${f1(st.wp)} kJ/kg`,
        `Turbina: w_t = h₃ − h₄ = ${f0(h[2])} − ${f0(h[3])} = ${f0(st.wt)} kJ/kg`,
        `Caldeira: q_in = h₃ − h₂ = ${f0(h[2])} − ${f0(h[1])} = ${f0(st.qin)} kJ/kg`,
        `η = (w_t − w_b)/q_in = (${f0(st.wt)} − ${f1(st.wp)})/${f0(st.qin)} = ${f1(st.eta * 100)} %`,
      ];
    }
    const ex = st.pts[st.pts.length - 1];
    if (ex.phase === 'mix') {
      const s = satP(WATER, st.pc);
      lines.push(`Título na saída: x = (s − s_l)/s_lv = (${fmt(ex.s, 3)} − ${fmt(s.sf, 3)})/${fmt(s.sfg, 3)} = ${fmt(ex.x, 3)}${st.eff < 1 ? ' (com o h real)' : ''}`);
    }
    for (const l of lines) {
      text(ctx, l, 332, y, { size: 11, bold: true });
      y += 16;
    }
    text(ctx, 'Tabelas de vapor simplificadas (interpolação). Áreas do T–s medidas a partir de 0 K.', 332, 544, { size: 10, color: C.dim });
    bars(ctx, st.qin, st.wnet, st.qout, st.eta, st.etaC);
    text(ctx, st.mod === MOD.regen ? 'Regenerar: menos trabalho por kg,' : 'Carnot entre T_cond e T₃ é o teto:', 766, 494, { size: 10, color: C.dim });
    text(ctx, st.mod === MOD.regen ? 'mas o calor entra mais quente →' : 'boa parte do calor entra bem', 766, 508, { size: 10, color: C.dim });
    text(ctx, st.mod === MOD.regen ? 'rendimento maior.' : 'abaixo de T₃ (aquecendo o líquido).', 766, 522, { size: 10, color: C.dim });
  }

  function drawCalcRf(ctx: CanvasRenderingContext2D, st: RefrigState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 316, 290, 636, 262, 10);
    ctx.fill();
    text(ctx, 'Refrigeração por compressão de vapor · R-134a · por kg de refrigerante', 332, 312, { size: 13, bold: true });
    let y = stateTable(ctx, st.pts, descRf, 332) + 22;
    const [p1, p2, p3, p4] = st.pts.map((q) => q.h);
    const TL = st.te + K0;
    const TH = st.tc + K0;
    const lines = [
      `Efeito refrigerante: q_L = h₁ − h₄ = ${f1(p1)} − ${f1(p4)} = ${f1(st.qL)} kJ/kg`,
      `Compressor: w = h₂ − h₁ = ${f1(p2)} − ${f1(p1)} = ${f1(st.wc)} kJ/kg`,
      `Condensador: q_H = h₂ − h₃ = ${f1(p2)} − ${f1(p3)} = ${f1(st.qH)} kJ/kg (= q_L + w)`,
      `COP = q_L/w = ${fmt(st.cop, 2)} · como bomba de calor: q_H/w = ${fmt(st.copHP, 2)} = COP + 1`,
      `Carnot: T_L/(T_H − T_L) = ${f1(TL)}/(${f1(TH)} − ${f1(TL)}) = ${fmt(st.copC, 2)} (em kelvin)`,
      `${f0(st.QL / TR_KW)} TR = ${f1(st.QL)} kW → ṁ = Q_L/q_L = ${fmt(st.mdot, 3)} kg/s → Ẇ = ṁ·w = ${fmt(st.Wc, 2)} kW`,
    ];
    for (const l of lines) {
      text(ctx, l, 332, y, { size: 11, bold: true });
      y += 16;
    }
    text(ctx, 'A válvula não troca calor nem trabalho: h₄ = h₃.', 332, 544, { size: 10, color: C.dim });
    // q_H = q_L + w e COP × Carnot
    const bx = 766;
    const bw = 176;
    text(ctx, 'Calor rejeitado q_H', bx, 332, { size: 10, color: C.dim });
    text(ctx, `${f0(st.qH)} kJ/kg`, bx + bw, 332, { size: 10, bold: true, align: 'right', color: C.curve2 });
    ctx.fillStyle = C.curve2;
    ctx.fillRect(bx, 338, bw, 16);
    const fl = bw * (st.qL / st.qH);
    text(ctx, `q_L ${f0(st.qL)}`, bx, 372, { size: 10, color: C.cold, bold: true });
    text(ctx, `w ${f0(st.wc)}`, bx + bw, 372, { size: 10, color: C.bad, bold: true, align: 'right' });
    ctx.fillStyle = C.cold;
    ctx.fillRect(bx, 378, fl, 16);
    ctx.fillStyle = C.bad;
    ctx.fillRect(bx + fl, 378, bw - fl, 16);
    const top = Math.max(10, Math.ceil(st.copC / 5) * 5);
    text(ctx, `COP (0 a ${top})`, bx, 424, { size: 10, color: C.dim });
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(bx, 430, bw, 18);
    ctx.fillRect(bx, 454, bw, 18);
    ctx.fillStyle = C.good;
    ctx.fillRect(bx, 430, bw * clamp(st.cop / top, 0, 1), 18);
    ctx.fillStyle = 'rgba(226,235,245,0.22)';
    ctx.fillRect(bx, 454, bw * clamp(st.copC / top, 0, 1), 18);
    ctx.strokeStyle = 'rgba(226,235,245,0.8)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, 454, bw * clamp(st.copC / top, 0, 1), 18);
    ctx.setLineDash([]);
    text(ctx, `ciclo: ${fmt(st.cop, 2)}`, bx + 6, 444, { size: 11, bold: true, shadow: true });
    text(ctx, `Carnot: ${fmt(st.copC, 2)}`, bx + 6, 468, { size: 11, bold: true, shadow: true });
    text(ctx, 'COP > 1 é normal: o compressor só', bx, 494, { size: 10, color: C.dim });
    text(ctx, '"bombeia" calor do frio para o quente,', bx, 508, { size: 10, color: C.dim });
    text(ctx, 'não o produz.', bx, 522, { size: 10, color: C.dim });
  }

  return {
    reset() {
      clock = 0;
      paused = false;
      stepNext = false;
      scene = null;
      key = '';
    },
    actions: [
      {
        label: '⏯ Pausar / continuar',
        run() {
          paused = !paused;
        },
      },
      {
        label: '⏭ Próxima etapa',
        title: 'Avança para o começo da próxima etapa do ciclo e pausa.',
        run() {
          stepNext = true;
        },
      },
    ],
    draw(ctx, v, _o, dt, time) {
      const sc = getScene(v);
      clock %= sc.period;
      if (stepNext) {
        const { i } = locate(sc.phases, clock);
        let acc = 0;
        for (let j = 0; j <= i; j++) acc += sc.phases[j].dur;
        clock = (acc % sc.period) + 1e-4;
        paused = true;
        stepNext = false;
      }
      if (!paused) {
        clock = (clock + dt) % sc.period;
        for (const pt of parts) pt.s = (pt.s + dt) % sc.period;
      }
      const cur = current(sc);
      if (sc.rankine) {
        drawPlant(ctx, sc, paused ? 0 : time);
        drawTsWater(ctx, sc, cur);
        drawCalcRk(ctx, sc.rk as RankineState);
      } else {
        drawFridge(ctx, sc, paused ? 0 : time);
        drawPh(ctx, sc, cur);
        drawTsR134a(ctx, sc, cur);
        drawCalcRf(ctx, sc.rf as RefrigState);
      }
      if (paused) tag(ctx, '⏸ pausado', 296, 26, C.amber, 'right', 10);
    },
    status(v, o) {
      const sc = getScene(v);
      if (!sc.rankine) {
        const st = sc.rf as RefrigState;
        if (st.xv > 0.4) {
          return {
            tone: 'warn',
            text: `Título ${fmt(st.xv, 2)} após a válvula: ${f0(st.xv * 100)} % do líquido já vira vapor na própria válvula (flash) e não refrigera. Condensar mais frio ou evaporar mais quente melhora o COP.`,
          };
        }
        return { tone: 'ok', text: `COP = ${fmt(o.cop, 2)} (Carnot: ${fmt(o.copC, 2)}). Para ${f0(v.cap)} TR o compressor consome ${fmt(o.Wc, 2)} kW; como bomba de calor, o COP seria ${fmt(o.copHP, 2)}.` };
      }
      const st = sc.rk as RankineState;
      const exit = st.pts[st.pts.length - 1];
      if (st.invalid) {
        return {
          tone: 'bad',
          text: `T₃ abaixo da saturação a ${fmtP(st.pb)} (${f0(st.T3)} °C): a caldeira só entrega vapor saturado. Suba T₃ ou baixe a pressão da caldeira.`,
        };
      }
      if (exit.phase === 'vap' && exit.T > st.Tcond + 1) {
        return { tone: 'warn', text: `O vapor sai superaquecido da turbina (${f0(exit.T)} °C): o condensador joga fora calor sensível que ainda poderia virar trabalho.` };
      }
      if (st.xt < X_MIN) {
        return {
          tone: 'warn',
          text: `Título ${fmt(st.xt, 3)} na saída da turbina: ${f0((1 - st.xt) * 100)} % de gotas erodem as últimas pás (o usual é x ≥ ${fmt(X_MIN, 2)}). Superaqueça mais, use reaquecimento ou alivie o vácuo (perde η).`,
        };
      }
      if (st.mod !== MOD.simple) {
        const simple = rankineState({ ...v, mod: MOD.simple });
        if (st.mod === MOD.reheat) {
          return {
            tone: 'ok',
            text: `Reaquecimento a ${fmtP(st.prh)}: título ${fmt(simple.xt, 3)} → ${fmt(st.xt, 3)} e η ${f1(simple.eta * 100)} % → ${f1(st.eta * 100)} % (ganho modesto).`,
          };
        }
        return {
          tone: 'ok',
          text: `Regeneração: ${f1(st.y * 100)} % do vapor sai a ${fmtP(st.pext)} para aquecer a água. η ${f1(simple.eta * 100)} % → ${f1(st.eta * 100)} %, mas o trabalho cai de ${f0(simple.wnet)} para ${f0(st.wnet)} kJ/kg.`,
        };
      }
      if (st.eff < 1) {
        const ideal = rankineState({ ...v, etat: 100 });
        return {
          tone: 'ok',
          text: `Turbina real (${f0(st.eff * 100)} %): w_t cai de ${f0(ideal.wt)} para ${f0(st.wt)} kJ/kg e o vapor sai mais seco (x ${fmt(ideal.xt, 3)} → ${fmt(st.xt, 3)}): a irreversibilidade vira calor no próprio vapor.`,
        };
      }
      return { tone: 'ok', text: `η = ${f1(o.eta)} %. A bomba consome só ${f1(o.bwr)} % do trabalho da turbina — no Brayton, o compressor consome 40 a 60 %.` };
    },
  };
}
