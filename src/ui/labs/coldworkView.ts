/**
 * Desenho da bancada de encruamento e recozimento: a tira passando no laminador (cilindros girando; a tira sai mais
 * fina e mais rápida), o forno de recozimento, o "microscópio" com os grãos (achatados e com bandas de deslizamento
 * quando encruados; grãos novos nascendo nos contornos na recristalização, com maclas no cobre e no latão; crescendo
 * depois) e dois gráficos: propriedades × %TF e propriedades × temperatura de recozimento.
 */
import { coldProps, cwState, seAnn, STRIP, T_AMB, TF_CRIT, type CwState } from '../../learning/labs/coldwork';
import { arrow, C, Chart, fmt, FONT, marker, roundRect, tag, tempColor, text, ticksOf } from './draw';
import type { LabValues } from '../../learning/types';
import type { LabView } from './views';

const f0 = (x: number) => fmt(x, 0);
const f1 = (x: number) => fmt(x, 1);
const f2 = (x: number) => fmt(x, 2);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
/** Expoente em sobrescrito (10¹⁵). */
const sup = (n: number) => String(n).replace(/[0-9-]/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] ?? '⁻');

// ------------------------------------------------------------------ microscópio
const MIC = 232;
/** Campo de visão (μm) de cada material. */
const FOV = [400, 400, 250];
type RGB = readonly [number, number, number];
const MAT_RGB: RGB[] = [
  [214, 142, 100],
  [222, 190, 104],
  [224, 222, 212],
];
const PEARLITE: RGB = [96, 86, 78];
/** Cor do metal no laminador. */
const METAL = ['#cf8a5c', '#d8b65a', '#a9b3bd'];

function hash(i: number, j: number, salt: number): number {
  let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(salt, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** As duas sementes mais próximas numa grade com sementes sorteadas (coordenadas da grade). */
function nearest2(qx: number, qy: number, salt: number): { i: number; j: number; ax: number; ay: number; bx: number; by: number } {
  const ci = Math.floor(qx);
  const cj = Math.floor(qy);
  let d1 = Infinity;
  let d2 = Infinity;
  let i1 = 0;
  let j1 = 0;
  let ax = 0;
  let ay = 0;
  let bx = 0;
  let by = 0;
  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      const i = ci + di;
      const j = cj + dj;
      const sx = i + 0.04 + 0.92 * hash(i, j, salt);
      const sy = j + 0.04 + 0.92 * hash(i, j, salt + 7);
      const d = (sx - qx) ** 2 + (sy - qy) ** 2;
      if (d < d1) {
        d2 = d1;
        bx = ax;
        by = ay;
        d1 = d;
        i1 = i;
        j1 = j;
        ax = sx;
        ay = sy;
      } else if (d < d2) {
        d2 = d;
        bx = sx;
        by = sy;
      }
    }
  }
  return { i: i1, j: j1, ax, ay, bx, by };
}

/** Distância (px de tela) de p até a mediatriz entre as sementes a e b (já em px de tela). */
function edgeDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const ux = bx - ax;
  const uy = by - ay;
  const len = Math.hypot(ux, uy) || 1;
  return Math.abs((px - (ax + bx) / 2) * ux + (py - (ay + by) / 2) * uy) / len;
}

class GrainScope {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly img: ImageData;
  private key = '';
  private lastAt = -1;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = MIC;
    this.canvas.height = MIC;
    this.ctx = this.canvas.getContext('2d')!;
    this.img = this.ctx.createImageData(MIC, MIC);
  }

  update(st: CwState, time: number): void {
    const px = MIC / FOV[st.idx];
    const k = st.hot ? 1 : st.aspect;
    const cOld = Math.max(3, st.dOld * px);
    const cNew = Math.max(3, st.dNew * px);
    const X = st.X;
    const slip = !st.hot && st.tf > 0 ? Math.min(1, st.tf / 30) * (1 - 0.75 * st.rec) : 0;
    const key = [st.idx, cOld.toFixed(1), cNew.toFixed(1), k.toFixed(2), Math.round(X * 300), slip.toFixed(2)].join('|');
    if (key === this.key) return;
    // no máximo ~20 quadros por segundo enquanto o controle é arrastado
    if (this.key && time - this.lastAt < 0.05) return;
    this.key = key;
    this.lastAt = time;
    const data = this.img.data;
    const R = MIC / 2;
    const base = MAT_RGB[st.idx];
    const steel = st.idx === 2;
    const fcc = st.m.crystal === 'CFC';
    const spacing = 7 - 3.5 * Math.min(1, st.tf / 50);
    for (let y = 0; y < MIC; y++) {
      for (let x = 0; x < MIC; x++) {
        const o = (y * MIC + x) * 4;
        const dx = x - R + 0.5;
        const dy = y - R + 0.5;
        if (dx * dx + dy * dy > R * R) {
          data[o + 3] = 0;
          continue;
        }
        // grão antigo (deformado: comprido na direção de laminação e fino na espessura)
        const no = nearest2(dx / k / cOld, (dy * k) / cOld, 11);
        const eOld = edgeDist(dx, dy, no.ax * cOld * k, (no.ay * cOld) / k, no.bx * cOld * k, (no.by * cOld) / k);
        const pearl = steel && hash(no.i, no.j, 3) < 0.11;
        let rgb: RGB = pearl ? PEARLITE : base;
        let shade = (hash(no.i, no.j, 5) - 0.5) * 0.34;
        let edge = eOld;
        let edgeW = clamp(0.1 * Math.min(cOld, cOld / k), 0.5, 0.85);
        let isNew = false;
        if (X > 0 && !pearl) {
          const nn = nearest2(dx / cNew, dy / cNew, 23);
          // núcleos perto dos contornos antigos aparecem primeiro
          const sx = nn.ax * cNew;
          const sy = nn.ay * cNew;
          const ns = nearest2(sx / k / cOld, (sy * k) / cOld, 11);
          const eSeed = edgeDist(sx, sy, ns.ax * cOld * k, (ns.ay * cOld) / k, ns.bx * cOld * k, (ns.by * cOld) / k);
          const rank = 0.55 * hash(nn.i, nn.j, 29) + 0.45 * Math.min(1, eSeed / Math.max(2, (0.5 * cOld) / k));
          if (st.hot || rank < X) {
            isNew = true;
            edge = edgeDist(dx, dy, nn.ax * cNew, nn.ay * cNew, nn.bx * cNew, nn.by * cNew);
            edgeW = clamp(0.1 * cNew, 0.45, 0.85);
            shade = (hash(nn.i, nn.j, 31) - 0.5) * 0.34;
            // maclas de recozimento (CFC): uma faixa reta atravessando parte dos grãos novos
            if (fcc && hash(nn.i, nn.j, 37) < 0.45) {
              const a = hash(nn.i, nn.j, 41) * Math.PI;
              const u = (dx * Math.cos(a) + dy * Math.sin(a)) / (cNew * 0.8) + hash(nn.i, nn.j, 43);
              if (Math.abs((u - Math.floor(u)) - 0.5) < 0.11) shade += 0.16;
            }
          }
        }
        if (!isNew && pearl) {
          // perlita: lamelas escuras e claras
          const a = hash(no.i, no.j, 47) * Math.PI;
          const u = (dx * Math.cos(a) + dy * Math.sin(a)) / 2.6;
          rgb = u - Math.floor(u) < 0.45 ? PEARLITE : [196, 188, 172];
        } else if (!isNew && slip > 0) {
          // bandas de deslizamento (discordâncias), ~45° da direção de laminação
          const a = 0.785 + (hash(no.i, no.j, 53) - 0.5) * 1.1;
          const u = (dx * Math.cos(a) + dy * Math.sin(a)) / spacing + hash(no.i, no.j, 59);
          if (u - Math.floor(u) < 0.17) shade -= 0.3 * slip;
          shade -= 0.08 * slip;
        }
        const sh = 1 + shade;
        if (edge < edgeW) {
          data[o] = steel ? 64 : 70;
          data[o + 1] = steel ? 64 : 48;
          data[o + 2] = steel ? 66 : 38;
        } else {
          data[o] = clamp(rgb[0] * sh, 0, 255);
          data[o + 1] = clamp(rgb[1] * sh, 0, 255);
          data[o + 2] = clamp(rgb[2] * sh, 0, 255);
        }
        data[o + 3] = 255;
      }
    }
    this.ctx.putImageData(this.img, 0, 0);
  }
}

// ------------------------------------------------------------------ layout
const ROLL_X = 196;
const STRIP_Y = 146;
/** px por mm na espessura da tira. */
const PX_MM = 3.6;
const ROLL_R = 44;
const STRIP_X0 = 14;
const FURN = { x: 334, y: 58, w: 124, h: 142 };
const MIC_C = { x: 140, y: 404 };
const TOPC = { x: 548, y: 46, w: 352, h: 168, x0: 0, x1: 70, y0: 0, y1: 800 };
const BOTC = { x: 548, y: 318, w: 352, h: 168, x0: 25, x1: 700, y0: 0, y1: 800 };

/** Nome do estado da tira. */
function stage(st: CwState): string {
  if (st.tf === 0) return st.annealed && st.d > st.m.d0 + 0.5 ? 'Grão cresceu' : 'Recozida';
  if (st.hot) return 'Laminada a quente';
  if (!st.annealed) return 'Encruada';
  if (!st.canRx) return 'Só recuperada';
  if (st.X < 0.05) return st.res < 50 ? 'Tensões aliviadas' : 'Encruada';
  if (st.X < 0.95) return `Recristalizando: ${f0(st.X * 100)} %`;
  if (st.dNew > st.dRx * 1.15) return 'Grão crescendo';
  return 'Recristalizada';
}

export function coldworkView(): LabView {
  const scope = new GrainScope();
  let spin = 0;
  let feed = 0;
  let topMax = 800;

  // ---------------------------------------------------------------- laminador e forno
  function drawMill(ctx: CanvasRenderingContext2D, st: CwState, dt: number): void {
    const hIn = STRIP.h0 * PX_MM;
    const hOut = st.h * PX_MM;
    const vIn = 26;
    const vOut = (vIn * STRIP.h0) / Math.max(1, st.h);
    spin += (dt * vOut) / ROLL_R;
    feed += dt;
    const hot = st.hot;
    const stripColor = hot ? tempColor(st.m.tHot, 0, 1100) : METAL[st.idx];
    // gaiola do laminador (atrás dos cilindros)
    ctx.fillStyle = '#2a3a4f';
    roundRect(ctx, ROLL_X - 62, 38, 124, 224, 8);
    ctx.fill();
    ctx.fillStyle = '#1d2a3b';
    ctx.fillRect(ROLL_X - 46, 48, 92, 204);
    // tira: entrada grossa, mordida nos cilindros e saída fina
    const dh = (hIn - hOut) / 2;
    const lc = Math.sqrt(Math.max(0, 2 * ROLL_R * dh));
    const top = (x: number) => {
      if (x <= ROLL_X - lc) return STRIP_Y - hIn / 2;
      if (x >= ROLL_X) return STRIP_Y - hOut / 2;
      const u = ROLL_X - x;
      return STRIP_Y - hOut / 2 - (ROLL_R - Math.sqrt(Math.max(0, ROLL_R * ROLL_R - u * u)));
    };
    const pts: [number, number][] = [];
    for (let x = STRIP_X0; x <= FURN.x + 30; x += 2) pts.push([x, top(x)]);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], 2 * STRIP_Y - pts[i][1]);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, STRIP_Y - hIn / 2, 0, STRIP_Y + hIn / 2);
    g.addColorStop(0, '#f4f6f8');
    g.addColorStop(0.3, stripColor);
    g.addColorStop(1, '#2c333b');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#141c26';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    if (hot) {
      ctx.fillStyle = 'rgba(255,140,60,0.18)';
      ctx.fillRect(STRIP_X0, STRIP_Y - hIn / 2 - 6, ROLL_X - STRIP_X0, hIn + 12);
    }
    // marcas na tira: andam mais rápido depois dos cilindros (continuidade: v·h = constante)
    ctx.strokeStyle = 'rgba(20,28,38,0.55)';
    ctx.lineWidth = 1;
    const sp = 22;
    const offIn = (feed * vIn) % sp;
    for (let x = STRIP_X0 + offIn; x < ROLL_X - lc - 2; x += sp) {
      ctx.beginPath();
      ctx.moveTo(x, STRIP_Y - hIn / 2 + 3);
      ctx.lineTo(x, STRIP_Y + hIn / 2 - 3);
      ctx.stroke();
    }
    const spOut = (sp * STRIP.h0) / Math.max(1, st.h);
    const offOut = (feed * vOut) % spOut;
    for (let x = ROLL_X + 4 + offOut; x < FURN.x; x += spOut) {
      ctx.beginPath();
      ctx.moveTo(x, STRIP_Y - hOut / 2 + 1.5);
      ctx.lineTo(x, STRIP_Y + hOut / 2 - 1.5);
      ctx.stroke();
    }
    // cilindros de trabalho
    for (const s of [-1, 1]) {
      const cy = STRIP_Y + s * (hOut / 2 + ROLL_R);
      const rg = ctx.createRadialGradient(ROLL_X - 16, cy - 16, 6, ROLL_X, cy, ROLL_R);
      rg.addColorStop(0, '#eef2f6');
      rg.addColorStop(0.6, '#8d99a6');
      rg.addColorStop(1, '#4a5562');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(ROLL_X, cy, ROLL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1b2430';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(40,52,66,0.65)';
      ctx.lineWidth = 3;
      for (let a = 0; a < 3; a++) {
        const ang = -s * spin + (a * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.moveTo(ROLL_X + Math.cos(ang) * 12, cy + Math.sin(ang) * 12);
        ctx.lineTo(ROLL_X + Math.cos(ang) * (ROLL_R - 9), cy + Math.sin(ang) * (ROLL_R - 9));
        ctx.stroke();
      }
      ctx.fillStyle = '#2b3542';
      ctx.beginPath();
      ctx.arc(ROLL_X, cy, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    // força de laminação
    if (st.F > 0) {
      const len = 10 + 18 * Math.min(1, st.F / 1600);
      const yTop = STRIP_Y - hOut / 2 - 2 * ROLL_R - 2;
      arrow(ctx, ROLL_X, yTop - len, ROLL_X, yTop, C.amber, 3, 9);
      tag(ctx, `F = ${f0(st.F)} kN`, ROLL_X + 12, yTop - len / 2 + 4, C.amber, 'left', 11);
    }
    // cotas
    text(ctx, `h₀ = ${f0(STRIP.h0)} mm`, STRIP_X0 + 2, STRIP_Y - hIn / 2 - 8, { size: 11, color: C.dim });
    text(ctx, `h = ${f1(st.h)} mm`, ROLL_X + 62, STRIP_Y + Math.max(hOut / 2, 6) + 16, { size: 11, color: C.dim });
    const lab = st.tf === 0 ? 'sem redução' : `${st.hot ? 'a quente' : 'a frio'}: ${f0(st.tf)} % de redução`;
    text(ctx, lab, STRIP_X0 + 2, 24, { size: 12, bold: true, color: st.hot ? C.hot : C.text });
    if (st.hot) text(ctx, `${fmt(st.m.tHot, 0)} °C`, STRIP_X0 + 2, STRIP_Y + hIn / 2 + 16, { size: 11, color: C.hot, bold: true });
    // forno
    const on = st.annealed;
    ctx.fillStyle = '#7a3b2c';
    roundRect(ctx, FURN.x, FURN.y, FURN.w, FURN.h, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    for (let y = FURN.y + 10; y < FURN.y + FURN.h; y += 10) {
      ctx.beginPath();
      ctx.moveTo(FURN.x + 2, y);
      ctx.lineTo(FURN.x + FURN.w - 2, y);
      ctx.stroke();
    }
    const inner = { x: FURN.x + 14, y: FURN.y + 30, w: FURN.w - 28, h: FURN.h - 52 };
    ctx.fillStyle = on ? tempColor(st.ta, 0, 900, 1) : '#1a1f27';
    ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    if (on) {
      const glow = ctx.createRadialGradient(inner.x + inner.w / 2, inner.y + inner.h, 4, inner.x + inner.w / 2, inner.y + inner.h, inner.w);
      glow.addColorStop(0, 'rgba(255,255,220,0.55)');
      glow.addColorStop(1, 'rgba(255,255,220,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    }
    // bobina dentro do forno
    ctx.fillStyle = on ? 'rgba(40,20,10,0.55)' : METAL[st.idx];
    ctx.beginPath();
    ctx.ellipse(inner.x + inner.w / 2, inner.y + inner.h - 26, 26, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    for (let r = 6; r < 24; r += 5) {
      ctx.beginPath();
      ctx.ellipse(inner.x + inner.w / 2, inner.y + inner.h - 26, r, r * 0.85, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    text(ctx, 'Forno (1 h)', FURN.x + FURN.w / 2, FURN.y + 19, { size: 12, bold: true, align: 'center', color: '#ffe2d0' });
    text(ctx, on ? `${f0(st.ta)} °C` : 'desligado', FURN.x + FURN.w / 2, FURN.y + FURN.h - 8, { size: 12, bold: true, align: 'center', color: on ? C.amber : C.dim });
  }

  // ---------------------------------------------------------------- microscópio e contas
  function drawScope(ctx: CanvasRenderingContext2D, st: CwState, time: number): void {
    scope.update(st, time);
    const R = MIC / 2;
    ctx.fillStyle = '#0c141e';
    ctx.beginPath();
    ctx.arc(MIC_C.x, MIC_C.y, R + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(scope.canvas, MIC_C.x - R, MIC_C.y - R);
    ctx.strokeStyle = '#56616e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(MIC_C.x, MIC_C.y, R + 2, 0, Math.PI * 2);
    ctx.stroke();
    // barra de escala
    const um = st.idx === 2 ? 50 : 100;
    const len = (um / FOV[st.idx]) * MIC;
    const bx = MIC_C.x - len / 2;
    const by = MIC_C.y + R - 18;
    ctx.fillStyle = 'rgba(10,16,24,0.75)';
    roundRect(ctx, bx - 8, by - 16, len + 16, 24, 5);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx, by, len, 3);
    text(ctx, `${um} μm`, MIC_C.x, by - 4, { size: 10, bold: true, align: 'center', color: '#fff' });
    text(ctx, 'Microscópio', MIC_C.x - R - 4, MIC_C.y - R - 14, { size: 13, bold: true });
    text(ctx, stage(st), MIC_C.x + R + 6, MIC_C.y - R - 14, { size: 12, bold: true, color: C.amber, align: 'right' });
    text(ctx, '↔ direção de laminação', MIC_C.x, MIC_C.y + R + 22, { size: 10, color: C.dim, align: 'center' });
  }

  function drawCalc(ctx: CanvasRenderingContext2D, st: CwState): void {
    const x = 284;
    let y = 296;
    const w = 190;
    ctx.fillStyle = C.bg2;
    roundRect(ctx, x - 10, y - 18, w + 8, 262, 8);
    ctx.fill();
    const head = (s: string) => {
      text(ctx, s, x, y, { size: 12, bold: true, color: C.amber });
      y += 16;
    };
    const line = (s: string, color: string = C.text) => {
      text(ctx, s, x, y, { size: 11, color });
      y += 15;
    };
    const m = st.m;
    head('Trabalho a frio');
    if (st.hot) {
      line('a quente não há %TF:');
      line('recristaliza no passe');
    } else {
      line(`%TF = (h₀ − h)/h₀`);
      line(`= (10 − ${f1(st.h)})/10 = ${f0(st.tf)} %`);
    }
    y += 6;
    head('Hall-Petch');
    line('σe = σ₀ + k/√d');
    const d = st.hot || st.X >= 0.5 ? st.dNew : st.dOld;
    line(`= ${f0(m.s0)} + ${f0(m.ky)}/√${f0(d)} = ${f0(seAnn(m, d))} MPa`, C.dim);
    if (!st.hot && st.tf > 0 && st.X < 0.5) line('+ encruamento', C.dim);
    y += 6;
    head('Recristalização (1 h)');
    if (st.hot) line('já recristalizada', C.dim);
    else if (st.tf < TF_CRIT) line(`abaixo do %TF crítico (${TF_CRIT} %)`, C.dim);
    else {
      const ratio = (st.trx + 273) / (m.Tf + 273);
      line(`completa a ≈ ${f0(st.trx)} °C`);
      line(`= ${f2(ratio)}·Tf (em kelvin)`, C.dim);
    }
    y += 6;
    head('Força no laminador');
    line(st.F > 0 ? `F ≈ 1,15·σ̄·w·√(R·Δh)` : 'sem redução, sem força');
    if (st.F > 0) line(`σ̄ = ${f0(st.sMean)} MPa → ${f0(st.F)} kN`, C.dim);
  }

  // ---------------------------------------------------------------- gráficos
  /** Eixo da direita (alongamento, 0 a 70 %), na cor da curva. */
  function axisRight(ctx: CanvasRenderingContext2D, ch: Chart): void {
    const b = ch.b;
    for (const v of [0, 20, 40, 60]) {
      const y = b.y + b.h - (v / 70) * b.h;
      text(ctx, `${f0(v)}%`, b.x + b.w + 6, y + 4, { size: 11, color: C.curve3 });
    }
  }
  /** Legenda numa linha só, ao lado do título. */
  function hLegend(ctx: CanvasRenderingContext2D, items: [string, string][], x: number, y: number): void {
    let xx = x;
    for (const [label, color] of items) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(xx, y - 4);
      ctx.lineTo(xx + 16, y - 4);
      ctx.stroke();
      text(ctx, label, xx + 20, y, { size: 11 });
      ctx.font = `600 11px ${FONT}`;
      xx += 30 + ctx.measureText(label).width;
    }
  }
  const yEl = (ch: Chart, v: number) => ch.b.y + ch.b.h - (v / 70) * ch.b.h;

  function drawTop(ctx: CanvasRenderingContext2D, st: CwState): void {
    const m = st.m;
    const ch = new Chart(ctx, { ...TOPC, y1: topMax });
    ctx.fillStyle = C.bg2;
    roundRect(ctx, TOPC.x - 44, TOPC.y - 26, TOPC.w + 84, TOPC.h + 62, 8);
    ctx.fill();
    ch.frame('Laminado, sem recozer', '% de redução', '', ticksOf(0, 70, 10), ticksOf(0, topMax, topMax > 600 ? 200 : 100));
    axisRight(ctx, ch);
    hLegend(
      ctx,
      [
        ['σr (MPa)', C.curve2],
        ['σe (MPa)', C.curve1],
        ['alongamento (%)', C.curve3],
      ],
      TOPC.x + 132,
      TOPC.y - 9,
    );
    const xs = Array.from({ length: 71 }, (_, i) => i);
    ch.poly(xs.map((x) => [x, coldProps(m, x).sr]), C.curve2, 2.5);
    ch.poly(xs.map((x) => [x, coldProps(m, x).se]), C.curve1, 2.5);
    // alongamento no eixo da direita
    ctx.save();
    ctx.strokeStyle = C.curve3;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    xs.forEach((x, i) => {
      const px = ch.X(x);
      const py = yEl(ch, coldProps(m, x).el);
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    });
    ctx.stroke();
    ctx.restore();
    if (st.hot) {
      const hot = xs.map((x) => [x, cwState({ mat: st.idx, cw: x, proc: 1, ta: T_AMB }).se] as [number, number]);
      ch.poly(hot, C.hot, 2, [6, 4]);
      tag(ctx, 'σe a quente: não encrua', ch.X(20), ch.Y(hot[20][1]) - 12, C.hot, 'center', 10);
    }
    // estado atual
    const x = st.tf;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ch.X(x), TOPC.y);
    ctx.lineTo(ch.X(x), TOPC.y + TOPC.h);
    ctx.stroke();
    ctx.setLineDash([]);
    const cp = coldProps(m, x);
    if (!st.hot) {
      marker(ch, ctx, x, cp.se);
      marker(ch, ctx, x, cp.sr);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = C.curve3;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ch.X(x), yEl(ch, cp.el), 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else marker(ch, ctx, x, st.se);
  }

  function drawBottom(ctx: CanvasRenderingContext2D, st: CwState): void {
    const ch = new Chart(ctx, { ...BOTC, y1: topMax });
    ctx.fillStyle = C.bg2;
    roundRect(ctx, BOTC.x - 44, BOTC.y - 26, BOTC.w + 84, BOTC.h + 62, 8);
    ctx.fill();
    const title = st.hot ? 'Recozimento após laminar a quente' : `Recozimento por 1 h após ${f0(st.tf)} % de TF`;
    ch.frame(title, 'temperatura (°C)', '', ticksOf(100, 700, 100), ticksOf(0, topMax, topMax > 600 ? 200 : 100));
    axisRight(ctx, ch);
    const v0 = { mat: st.idx, cw: st.tf, proc: st.hot ? 1 : 0 };
    const temps: number[] = [];
    for (let t = BOTC.x0; t <= BOTC.x1; t += 5) temps.push(t);
    const states = temps.map((t) => cwState({ ...v0, ta: t }));
    // faixas: recuperação, recristalização, crescimento de grão
    const band = (t0: number, t1: number, color: string, label: string, short: string) => {
      const a = ch.X(clamp(t0, BOTC.x0, BOTC.x1));
      const b = ch.X(clamp(t1, BOTC.x0, BOTC.x1));
      if (b - a < 2) return;
      ctx.fillStyle = color;
      ctx.fillRect(a, BOTC.y, b - a, BOTC.h);
      ctx.font = `700 10px ${FONT}`;
      const fit = [label, short].find((s) => ctx.measureText(s).width + 6 <= b - a);
      if (fit) text(ctx, fit, (a + b) / 2, BOTC.y + 13, { size: 10, bold: true, color: C.dim, align: 'center' });
    };
    if (!st.hot && st.canRx) {
      const t5 = st.t50 - 15 * Math.log(19);
      band(BOTC.x0, t5, 'rgba(90,184,255,0.08)', 'Recuperação', 'Recup.');
      band(t5, st.trx, 'rgba(255,201,77,0.10)', 'Recristalização', 'Recrist.');
      band(st.trx + 30, BOTC.x1, 'rgba(126,224,138,0.08)', 'Crescimento de grão', 'Cresc.');
      ctx.strokeStyle = C.amber;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(ch.X(st.trx), BOTC.y);
      ctx.lineTo(ch.X(st.trx), BOTC.y + BOTC.h);
      ctx.stroke();
      ctx.setLineDash([]);
      tag(ctx, `recristalização ≈ ${f0(st.trx)} °C`, ch.X(st.trx) + (st.trx > 520 ? -4 : 4), BOTC.y + BOTC.h - 8, C.amber, st.trx > 520 ? 'right' : 'left', 10);
    } else {
      const note = st.hot ? 'já recristalizou no passe: o forno só faz o grão crescer' : st.tf === 0 ? 'sem trabalho a frio: nada para recristalizar' : `só ${f0(st.tf)} % de TF (abaixo do crítico): não recristaliza`;
      text(ctx, note, BOTC.x + BOTC.w / 2, BOTC.y + 14, { size: 11, color: C.dim, align: 'center', bold: true });
    }
    ch.poly(states.map((s, i) => [temps[i], s.sr]), C.curve2, 2.5);
    ch.poly(states.map((s, i) => [temps[i], s.se]), C.curve1, 2.5);
    ctx.save();
    ctx.strokeStyle = C.curve3;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    states.forEach((s, i) => {
      const px = ch.X(temps[i]);
      const py = yEl(ch, s.el);
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    });
    ctx.stroke();
    ctx.restore();
    // estado atual
    const x = st.ta;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ch.X(x), BOTC.y);
    ctx.lineTo(ch.X(x), BOTC.y + BOTC.h);
    ctx.stroke();
    ctx.setLineDash([]);
    marker(ch, ctx, x, st.se);
    marker(ch, ctx, x, st.sr);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = C.curve3;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ch.X(x), yEl(ch, st.el), 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (!st.annealed) text(ctx, 'sem recozimento', ch.X(x) + 8, BOTC.y + 32, { size: 10, color: C.dim });
  }

  return {
    reset() {
      spin = 0;
      feed = 0;
    },
    actions: [
      {
        label: '↺ Tira nova',
        title: 'Volta à tira recozida, sem laminar e sem forno.',
        run(api) {
          api.set({ cw: 0, ta: T_AMB, proc: 0 });
        },
      },
    ],
    pointer(kind, x, y) {
      if (kind === 'up') return null;
      const inTop = x >= TOPC.x - 8 && x <= TOPC.x + TOPC.w + 8 && y >= TOPC.y - 12 && y <= TOPC.y + TOPC.h + 12;
      const inBot = x >= BOTC.x - 8 && x <= BOTC.x + BOTC.w + 8 && y >= BOTC.y - 12 && y <= BOTC.y + BOTC.h + 12;
      const out: LabValues = {};
      if (inTop) out.cw = Math.round(clamp(((x - TOPC.x) / TOPC.w) * 70, 0, 70));
      else if (inBot) out.ta = Math.round(clamp(BOTC.x0 + ((x - BOTC.x) / BOTC.w) * (BOTC.x1 - BOTC.x0), T_AMB, 700) / 5) * 5;
      else return null;
      return out;
    },
    cursor(x, y) {
      const inTop = x >= TOPC.x && x <= TOPC.x + TOPC.w && y >= TOPC.y && y <= TOPC.y + TOPC.h;
      const inBot = x >= BOTC.x && x <= BOTC.x + BOTC.w && y >= BOTC.y && y <= BOTC.y + BOTC.h;
      return inTop || inBot ? 'ew-resize' : 'default';
    },
    draw(ctx, v, _o, dt, time) {
      const st = cwState(v);
      const target = Math.max(400, Math.ceil((coldProps(st.m, 70).sr * 1.12) / 100) * 100);
      topMax = target;
      drawMill(ctx, st, dt);
      drawScope(ctx, st, time);
      drawCalc(ctx, st);
      drawTop(ctx, st);
      drawBottom(ctx, st);
    },
    status(v) {
      const st = cwState(v);
      const m = st.m;
      const ann = coldProps(m, 0);
      if (st.tf === 0) {
        if (st.annealed && st.d > m.d0 + 0.5) return { tone: 'ok', text: `Sem deformação não há o que recristalizar; a ${f0(st.ta)} °C o grão só cresce (${f0(st.d)} μm) e σe cai um pouco (Hall-Petch).` };
        return { tone: 'ok', text: `${m.name} recozido, grão de ${f0(m.d0)} μm: σe = ${f0(ann.se)} MPa e alongamento de ${f0(ann.el)} %. Aumente a redução no laminador (ou arraste no gráfico de cima).` };
      }
      if (st.hot) {
        const cold = cwState({ ...v, proc: 0, ta: T_AMB });
        return { tone: 'ok', text: `Laminado a quente (${fmt(m.tHot, 0)} °C, acima da temperatura de recristalização): recristalizou durante o passe e não encruou (σe = ${f0(st.se)} MPa). Força de ${f0(st.F)} kN — a frio seriam ${f0(cold.F)} kN.` };
      }
      if (!st.annealed) {
        return { tone: 'ok', text: `Encruado com ${f0(st.tf)} % de TF: σe foi de ${f0(ann.se)} para ${f0(st.se)} MPa e o alongamento caiu de ${f0(ann.el)} para ${f0(st.el)} %. Os grãos achataram e se encheram de discordâncias (~10${sup(Math.round(st.rho))} m⁻²).` };
      }
      if (!st.canRx) return { tone: 'warn', text: `Com só ${f0(st.tf)} % de TF (abaixo do crítico, ~${TF_CRIT} %), falta energia armazenada para nuclear grãos novos: o recozimento só recupera.` };
      if (st.X < 0.05) {
        if (st.res < 60) return { tone: 'ok', text: `Recuperação: as tensões residuais caíram para ${f0(st.res)} % e a dureza quase não mudou (${f0(st.hv)} HV). É o recozimento de alívio de tensões — ainda sem grãos novos.` };
        return { tone: 'ok', text: `A ${f0(st.ta)} °C quase nada acontece em 1 h. A recristalização deste material com ${f0(st.tf)} % de TF completa por volta de ${f0(st.trx)} °C.` };
      }
      if (st.X < 0.95) return { tone: 'warn', text: `Recristalização em andamento: ${f0(st.X * 100)} % da área já tem grãos novos, equiaxiais e livres de deformação. σe já caiu para ${f0(st.se)} MPa.` };
      if (st.dNew > st.dRx * 1.15) return { tone: 'ok', text: `Crescimento de grão: d = ${f0(st.dNew)} μm (recristalizou com ${f0(st.dRx)} μm). Menos contorno, menos energia — e, pela Hall-Petch, σe cai para ${f0(st.se)} MPa.` };
      return { tone: 'ok', text: `Recristalizado: grãos novos de ${f0(st.dNew)} μm, σe = ${f0(st.se)} MPa e alongamento de ${f0(st.el)} %. Mais trabalho a frio antes → mais núcleos → grão mais fino.` };
    },
  };
}
