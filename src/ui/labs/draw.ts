/**
 * Utilitários de desenho das bancadas (Canvas 2D). Todas as bancadas desenham num quadro lógico
 * de 960 × 560 ("tela da sala de controle"), escalado para o tamanho real com nitidez (devicePixelRatio).
 */
import { fmt } from '../../learning/gen';

export const W = 960;
export const H = 560;

export const C = {
  bg: '#122031',
  bg2: '#18293d',
  grid: '#22364d',
  line: '#33506e',
  text: '#e2ebf5',
  dim: '#8ea4ba',
  metal: '#8b98a7',
  metalDark: '#56616e',
  metalLight: '#c8d1db',
  water: '#3b8fe0',
  waterDeep: '#2563a8',
  hot: '#ef5b43',
  cold: '#3b9be8',
  amber: '#ffc94d',
  good: '#5fd38a',
  bad: '#ff6b5e',
  violet: '#b48cff',
  curve1: '#5ab8ff',
  curve2: '#ffae42',
  curve3: '#7ee08a',
  curve4: '#ff6b5e',
} as const;

export const FONT = '"Nunito", system-ui, sans-serif';

/** Ajusta o canvas ao tamanho na tela e devolve o fator de escala lógico → pixels. */
export function fitCanvas(canvas: HTMLCanvasElement): number {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return w / W;
}

export function clear(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

export function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  opts: { size?: number; color?: string; align?: CanvasTextAlign; base?: CanvasTextBaseline; bold?: boolean; shadow?: boolean } = {},
): void {
  ctx.font = `${opts.bold ? 700 : 600} ${opts.size ?? 13}px ${FONT}`;
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = opts.base ?? 'alphabetic';
  if (opts.shadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillText(s, x + 1, y + 1);
  }
  ctx.fillStyle = opts.color ?? C.text;
  ctx.fillText(s, x, y);
}

/** Etiqueta com fundo (para leituras sobre o desenho). */
export function tag(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, color: string = C.text, align: CanvasTextAlign = 'center', size = 12): void {
  ctx.font = `700 ${size}px ${FONT}`;
  const w = ctx.measureText(s).width + 10;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.fillStyle = 'rgba(10,18,28,0.82)';
  roundRect(ctx, x0, y - size + 1, w, size + 7, 5);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x0 + 5, y + 3);
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width = 2, head = 8): void {
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(a) * head * 0.6, y2 - Math.sin(a) * head * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - 0.45) * head, y2 - Math.sin(a - 0.45) * head);
  ctx.lineTo(x2 - Math.cos(a + 0.45) * head, y2 - Math.sin(a + 0.45) * head);
  ctx.closePath();
  ctx.fill();
}

/** Cor de temperatura: azul (frio) → ciano → amarelo → vermelho (quente). */
export function tempColor(t: number, tmin: number, tmax: number, alpha = 1): string {
  const u = Math.min(1, Math.max(0, (t - tmin) / (tmax - tmin)));
  const stops: [number, number, number, number][] = [
    [0, 40, 110, 230],
    [0.35, 40, 200, 230],
    [0.65, 250, 210, 60],
    [1, 235, 60, 45],
  ];
  let i = 1;
  while (i < stops.length - 1 && u > stops[i][0]) i++;
  const [u0, r0, g0, b0] = stops[i - 1];
  const [u1, r1, g1, b1] = stops[i];
  const k = (u - u0) / (u1 - u0 || 1);
  const r = Math.round(r0 + (r1 - r0) * k);
  const g = Math.round(g0 + (g1 - g0) * k);
  const b = Math.round(b0 + (b1 - b0) * k);
  return `rgba(${r},${g},${b},${alpha})`;
}

export interface ChartBox {
  x: number;
  y: number;
  w: number;
  h: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** Gráfico simples: eixos, grade, rótulos e conversão de coordenadas. */
export class Chart {
  constructor(
    readonly ctx: CanvasRenderingContext2D,
    readonly b: ChartBox,
  ) {}

  X(v: number): number {
    return this.b.x + ((v - this.b.x0) / (this.b.x1 - this.b.x0)) * this.b.w;
  }

  Y(v: number): number {
    return this.b.y + this.b.h - ((v - this.b.y0) / (this.b.y1 - this.b.y0)) * this.b.h;
  }

  frame(title: string, xLabel: string, yLabel: string, xTicks: number[], yTicks: number[], digits = 0, xDigits = 0): void {
    const { ctx, b } = this;
    ctx.fillStyle = C.bg2;
    roundRect(ctx, b.x - 44, b.y - 26, b.w + 58, b.h + 62, 8);
    ctx.fill();
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    for (const t of yTicks) {
      const y = this.Y(t);
      ctx.beginPath();
      ctx.moveTo(b.x, y);
      ctx.lineTo(b.x + b.w, y);
      ctx.stroke();
      text(ctx, fmt(t, digits), b.x - 6, y + 4, { size: 11, color: C.dim, align: 'right' });
    }
    for (const t of xTicks) {
      const x = this.X(t);
      ctx.beginPath();
      ctx.moveTo(x, b.y);
      ctx.lineTo(x, b.y + b.h);
      ctx.stroke();
      text(ctx, fmt(t, xDigits), x, b.y + b.h + 15, { size: 11, color: C.dim, align: 'center' });
    }
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x, b.y + b.h);
    ctx.lineTo(b.x + b.w, b.y + b.h);
    ctx.stroke();
    text(ctx, title, b.x - 36, b.y - 9, { size: 13, bold: true });
    text(ctx, xLabel, b.x + b.w, b.y + b.h + 30, { size: 11, color: C.dim, align: 'right' });
    text(ctx, yLabel, b.x + b.w, b.y - 9, { size: 11, color: C.dim, align: 'right' });
  }

  /** Curva y = f(x) recortada à área do gráfico. */
  fn(f: (x: number) => number, color: string, width = 2.5, dash: number[] = [], from = this.b.x0, to = this.b.x1): void {
    const pts: [number, number][] = [];
    const n = 80;
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      pts.push([x, f(x)]);
    }
    this.poly(pts, color, width, dash);
  }

  poly(pts: [number, number][], color: string, width = 2.5, dash: number[] = []): void {
    const { ctx, b } = this;
    ctx.save();
    ctx.beginPath();
    ctx.rect(b.x, b.y - 2, b.w + 2, b.h + 4);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(this.X(x), this.Y(y)) : ctx.moveTo(this.X(x), this.Y(y))));
    ctx.stroke();
    ctx.restore();
  }

  /** Pinta a área sob a linha (até y0) ou, com `closed`, o polígono fechado. */
  area(pts: [number, number][], color: string, closed = false): void {
    const { ctx, b } = this;
    if (pts.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(b.x, b.y - 2, b.w + 2, b.h + 4);
    ctx.clip();
    ctx.fillStyle = color;
    ctx.beginPath();
    if (!closed) ctx.moveTo(this.X(pts[0][0]), this.Y(b.y0));
    pts.forEach(([x, y], i) => (i || !closed ? ctx.lineTo(this.X(x), this.Y(y)) : ctx.moveTo(this.X(x), this.Y(y))));
    if (!closed) ctx.lineTo(this.X(pts[pts.length - 1][0]), this.Y(b.y0));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  dot(x: number, y: number, color: string, r = 6): void {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.strokeStyle = '#0b1420';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.X(x), this.Y(y), r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  legend(items: [string, string, number[]?][], x = this.b.x + 8, y = this.b.y + 14): void {
    const { ctx } = this;
    items.forEach(([label, color, dash], i) => {
      const yy = y + i * 16;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash(dash ?? []);
      ctx.beginPath();
      ctx.moveTo(x, yy - 4);
      ctx.lineTo(x + 18, yy - 4);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, label, x + 24, yy, { size: 11, color: C.text });
    });
  }
}

/** Rótulos dos estados: cada um vai para fora do ciclo, sem cair fora do gráfico nem colar em outro. */
export function labelPoints(ch: Chart, ctx: CanvasRenderingContext2D, pts: [number, number][], names: string[]): void {
  const cxp = pts.reduce((a, q) => a + ch.X(q[0]), 0) / pts.length;
  const cyp = pts.reduce((a, q) => a + ch.Y(q[1]), 0) / pts.length;
  const at = pts.map(([x, y]) => ({ x: ch.X(x), y: ch.Y(y) }));
  const inside = (x: number, y: number) => x > ch.b.x + 4 && x < ch.b.x + ch.b.w - 4 && y > ch.b.y + 6 && y < ch.b.y + ch.b.h - 6;
  const ring = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)]);
  const placed: { x: number; y: number }[] = [];
  // cada rótulo vai para fora do ciclo; se cair fora do gráfico ou colado em outro rótulo/ponto, tenta as 8 direções
  at.forEach((p0, i) => {
    const d = Math.hypot(p0.x - cxp, p0.y - cyp) || 1;
    const cands = [[(p0.x - cxp) / d, (p0.y - cyp) / d], ...ring];
    let best = { x: p0.x, y: p0.y };
    let bestScore = -Infinity;
    cands.forEach(([ux, uy], k) => {
      const x = p0.x + ux * 13;
      const y = p0.y + uy * 13;
      let room = 24;
      for (const q of placed) room = Math.min(room, Math.hypot(q.x - x, q.y - y));
      at.forEach((q, j) => {
        if (j !== i) room = Math.min(room, Math.hypot(q.x - x, q.y - y) + 6);
      });
      const score = (inside(x, y) ? 0 : -1000) + room + (k === 0 ? 2 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    });
    placed.push(best);
  });
  pts.forEach(([x, y], i) => {
    ch.dot(x, y, C.amber, 4);
    text(ctx, names[i], placed[i].x, placed[i].y + 4, { size: 12, bold: true, align: 'center', shadow: true });
  });
}

/** Marcador do estado atual num diagrama. */
export function marker(ch: Chart, ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(ch.X(x), ch.Y(y), 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/** Topo "redondo" de um eixo: o menor passo da lista que cubra `max` em até `divisions` divisões. */
export function niceAxis(max: number, steps: number[], divisions = 5): { top: number; step: number } {
  for (const step of steps) if (max / step <= divisions) return { top: Math.max(step, Math.ceil(max / step - 1e-9) * step), step };
  const step = steps[steps.length - 1];
  return { top: Math.ceil(max / step) * step, step };
}

/** Marcas de eixo: múltiplos de `step` entre `from` e `to`. */
export function ticksOf(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let i = Math.ceil(from / step - 1e-9); i * step <= to + 1e-9; i++) out.push(Math.abs(i * step) < 1e-9 ? 0 : i * step);
  return out;
}

/** Aproxima `cur` de `target` suavemente (escalas de gráfico que se ajustam sem pular). */
export const approach = (cur: number, target: number, dt: number, rate = 5) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

/** Gerador pseudoaleatório determinístico (para texturas estáveis entre quadros). */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export { fmt };
