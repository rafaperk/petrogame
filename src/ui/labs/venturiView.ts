/** Desenho da bancada do Venturi: tubo, piezômetros, Pitot, linhas de energia/piezométrica, manômetro e balanço de energia. */
import { VENTURI, venturiSections } from '../../learning/labs/venturi';
import type { LabValues } from '../../learning/types';
import { arrow, C, fmt, roundRect, tag, text } from './draw';
import type { LabView } from './views';

const TAU = Math.PI * 2;
const X1 = 170;
const X2 = 480;
const X3 = 790;
const XL = 44;
const XR = 916;
const R0 = 38; // raio desenhado do tubo de 100 mm
const CONV = [222, 425] as const;
const THROAT = [425, 535] as const;
const DIFF = [535, 740] as const;
const Y_BASE = 346;
const Y_TOP = 34;

const radiusAt = (x: number, rt: number) => {
  if (x <= CONV[0]) return R0;
  if (x < CONV[1]) return R0 + ((rt - R0) * (x - CONV[0])) / (CONV[1] - CONV[0]);
  if (x <= THROAT[1]) return rt;
  if (x < DIFF[1]) return rt + ((R0 - rt) * (x - DIFF[0])) / (DIFF[1] - DIFF[0]);
  return R0;
};

interface Dot {
  x: number;
  lane: number;
}

export function venturiView(): LabView {
  const dots: Dot[] = [];
  for (let i = 0; i < 70; i++) dots.push({ x: XL + Math.random() * (XR - XL), lane: [-0.72, -0.38, 0, 0.38, 0.72][i % 5] + (Math.random() - 0.5) * 0.1 });
  const bubbles: { x: number; lane: number; size: number }[] = [];
  const flashes: { x: number; y: number; t: number }[] = [];
  let dragThroat = false;
  let lastGeom = { s: 30, rt: 19, dz: 0 };

  function geometry(v: LabValues) {
    const href = Math.max(v.p1 / 9.81 + 1.6, 2 * v.dz + 1.6, 4);
    const s = Math.min(34, (Y_BASE - Y_TOP - 8) / href);
    const rt = (R0 * v.d2) / 100;
    lastGeom = { s, rt, dz: v.dz };
    return { s, rt };
  }
  /** Cota do eixo (m) e posição na tela (px). */
  const zAt = (x: number, dz: number) => (2 * dz * (x - X1)) / (X3 - X1);
  const yAxis = (x: number, dz: number, s: number) => Y_BASE - zAt(x, dz) * s;

  return {
    draw(ctx, v, o, dt) {
      const { s, rt } = geometry(v);
      const { s: sec } = venturiSections(v);
      const Q = v.Q / 1000;
      const A1 = (Math.PI * VENTURI.D * VENTURI.D) / 4;
      const velAt = (x: number) => (Q / A1) * (R0 / radiusAt(x, rt)) ** 2;
      const g = VENTURI.g;
      // carga total ao longo do tubo: cai nas perdas (contração até a garganta, difusor depois)
      const Hat = (x: number) => {
        if (x <= X1) return sec[0].H;
        if (x <= X2) return sec[0].H + ((sec[1].H - sec[0].H) * (x - X1)) / (X2 - X1);
        if (x <= X3) return sec[1].H + ((sec[2].H - sec[1].H) * (x - X2)) / (X3 - X2);
        return sec[2].H;
      };
      const yH = (H: number) => Y_BASE - H * s;

      // ---------------- tubo
      ctx.fillStyle = C.bg2;
      roundRect(ctx, 8, 8, 944, 408, 10);
      ctx.fill();
      const top: [number, number][] = [];
      const bot: [number, number][] = [];
      for (let x = XL; x <= XR; x += 4) {
        const yc = yAxis(x, v.dz, s);
        const r = radiusAt(x, rt);
        top.push([x, yc - r]);
        bot.push([x, yc + r]);
      }
      const body = new Path2D();
      top.forEach(([x, y], i) => (i ? body.lineTo(x, y) : body.moveTo(x, y)));
      for (let i = bot.length - 1; i >= 0; i--) body.lineTo(bot[i][0], bot[i][1]);
      body.closePath();
      const grd = ctx.createLinearGradient(XL, 0, XR, 0);
      // cor = pressão local (azul escuro = alta, claro = baixa)
      for (let i = 0; i <= 10; i++) {
        const x = XL + ((XR - XL) * i) / 10;
        const hp = Hat(x) - zAt(x, v.dz) - velAt(x) ** 2 / (2 * g);
        const k = Math.max(0, Math.min(1, (hp + 2) / (sec[0].hp + 4)));
        grd.addColorStop(i / 10, `rgb(${Math.round(150 - 110 * k)},${Math.round(205 - 80 * k)},${Math.round(250 - 40 * k)})`);
      }
      ctx.fillStyle = o.cav ? '#bfe3ff' : grd;
      ctx.fill(body);
      ctx.strokeStyle = C.metalLight;
      ctx.lineWidth = 4;
      ctx.beginPath();
      top.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.beginPath();
      bot.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();

      // ---------------- partículas (rápidas na garganta: continuidade)
      for (const d of dots) {
        d.x += (velAt(d.x) * 22 + (v.Q > 0 ? 6 : 0)) * dt;
        if (d.x > XR) d.x = XL + Math.random() * 10;
        const yc = yAxis(d.x, v.dz, s);
        const r = radiusAt(d.x, rt);
        const fast = Math.min(1, velAt(d.x) / 14);
        ctx.fillStyle = `rgba(255,255,255,${0.55 + 0.4 * fast})`;
        ctx.beginPath();
        ctx.ellipse(d.x, yc + d.lane * r * 0.92, 2 + 5 * fast, 2, 0, 0, TAU);
        ctx.fill();
      }
      // cavitação: bolhas nascem na garganta e implodem no difusor
      if (o.cav && Math.random() < dt * 30) bubbles.push({ x: THROAT[0] + 40 + Math.random() * 60, lane: (Math.random() - 0.5) * 1.6, size: 1 });
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.x += velAt(b.x) * 22 * dt;
        b.size = Math.min(4, b.size + dt * 8);
        const yc = yAxis(b.x, v.dz, s);
        const r = radiusAt(b.x, rt);
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(b.x, yc + b.lane * r * 0.6, b.size, 0, TAU);
        ctx.stroke();
        if (b.x > DIFF[0] + 70 + Math.random() * 40) {
          flashes.push({ x: b.x, y: yc + b.lane * r * 0.6, t: 0 });
          bubbles.splice(i, 1);
        }
      }
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.t += dt;
        const k = 1 - f.t / 0.25;
        ctx.strokeStyle = `rgba(255,236,150,${Math.max(0, k)})`;
        for (let j = 0; j < 6; j++) {
          const a = (TAU * j) / 6;
          ctx.beginPath();
          ctx.moveTo(f.x + Math.cos(a) * 2, f.y + Math.sin(a) * 2);
          ctx.lineTo(f.x + Math.cos(a) * (3 + 6 * (1 - k)), f.y + Math.sin(a) * (3 + 6 * (1 - k)));
          ctx.stroke();
        }
        if (f.t > 0.25) flashes.splice(i, 1);
      }

      // ---------------- linhas de energia (LE) e piezométrica (LP)
      ctx.save();
      ctx.beginPath();
      ctx.rect(12, 12, 936, 400);
      ctx.clip();
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.amber;
      ctx.beginPath();
      for (let x = XL; x <= XR; x += 6) (x === XL ? ctx.moveTo : ctx.lineTo).call(ctx, x, yH(Hat(x)));
      ctx.stroke();
      ctx.strokeStyle = C.curve1;
      ctx.beginPath();
      for (let x = XL; x <= XR; x += 4) {
        const hpz = Hat(x) - velAt(x) ** 2 / (2 * g); // z + p/ρg
        const y = yH(Math.max(hpz, zAt(x, v.dz) - 10.1));
        if (x === XL) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      text(ctx, 'LE — linha de energia', X3 + 12, Math.max(24, yH(Hat(XR)) - 8), { size: 11, color: C.amber, bold: true });
      text(ctx, 'LP — linha piezométrica', X3 + 12, Math.min(404, Math.max(40, yH(Hat(XR) - velAt(XR) ** 2 / (2 * g)) + 16)), { size: 11, color: C.curve1, bold: true });

      // ---------------- piezômetros e Pitot
      const tube = (x: number, i: 0 | 1 | 2, label: string) => {
        const yc = yAxis(x, v.dz, s);
        const r = radiusAt(x, rt);
        ctx.strokeStyle = 'rgba(210,230,250,0.75)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 6, Y_TOP, 12, yc - r - Y_TOP);
        const hp = sec[i].hp;
        if (hp > 0) {
          const yTop = Math.max(Y_TOP, yc - hp * s);
          ctx.fillStyle = 'rgba(80,160,240,0.85)';
          ctx.fillRect(x - 4, yTop, 8, yc - r - yTop);
          ctx.fillStyle = '#d8eeff';
          ctx.fillRect(x - 4, yTop, 8, 2);
        }
        text(ctx, label, x - 16, yc - r - 8, { size: 14, align: 'center', bold: true, color: C.amber });
        const pTxt = `p ${fmt(sec[i].p, 1)} kPa`;
        const vTxt = `v ${fmt(sec[i].v, 2)} m/s`;
        const ty = Math.min(yc + r + 20, 408);
        tag(ctx, `${vTxt} · ${pTxt}`, x, ty, hp < 0 ? C.bad : C.text, 'center', 11);
        if (hp <= 0) tag(ctx, i === 1 && o.cav ? 'pressão de vapor!' : 'vácuo (p < 0)', x + 8, yc - r - 14, C.bad, 'left', 10);
      };
      tube(X1, 0, '1');
      tube(v.pitot ? X2 - 22 : X2, 1, '2');
      tube(X3, 2, '3');
      if (v.pitot) {
        const xp = X2 + 22;
        const yc = yAxis(xp, v.dz, s);
        const hst = sec[1].H - sec[1].z; // carga de estagnação acima do eixo
        ctx.strokeStyle = C.amber;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(xp - 24, yc);
        ctx.lineTo(xp, yc);
        ctx.lineTo(xp, Y_TOP);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,201,77,0.8)';
        const yTop = Math.max(Y_TOP, yc - hst * s);
        ctx.fillRect(xp - 3, yTop, 6, yc - rt - yTop);
        tag(ctx, 'Pitot: p + ½ρv²', xp + 8, Math.max(Y_TOP + 16, yTop - 6), C.amber, 'left', 10);
      }
      // seta da vazão
      arrow(ctx, 22, 52, 96, 52, C.text, 2, 8);
      text(ctx, `Q = ${fmt(v.Q, 1)} L/s`, 22, 74, { size: 13, bold: true });
      text(ctx, `escala vertical: 1 m = ${fmt(s, 0)} px · diâmetros fora de escala`, 940, 26, { size: 10, color: C.dim, align: 'right' });

      // ---------------- manômetro diferencial de mercúrio (entre 1 e 2)
      ctx.fillStyle = C.bg2;
      roundRect(ctx, 8, 424, 536, 128, 10);
      ctx.fill();
      text(ctx, 'Manômetro diferencial (mercúrio) entre 1 e 2', 20, 442, { size: 12, bold: true });
      // tubo em U compacto: duas pernas ligadas por baixo, mercúrio no fundo
      const mx1 = 110;
      const mx2 = 250;
      const uTop = 456;
      const uBot = 540;
      const mid = 500;
      const dhPx = Math.max(-38, Math.min(38, (o.dh / 100) * 380));
      const lvl1 = mid + dhPx / 2; // lado de maior pressão: mercúrio mais baixo
      const lvl2 = mid - dhPx / 2;
      ctx.fillStyle = '#c9d1da';
      ctx.fillRect(mx1 - 5, lvl1, 10, uBot - lvl1);
      ctx.fillRect(mx2 - 5, lvl2, 10, uBot - lvl2);
      ctx.fillRect(mx1 - 5, uBot - 10, mx2 - mx1 + 10, 10);
      ctx.fillStyle = 'rgba(80,160,240,0.85)';
      ctx.fillRect(mx1 - 5, uTop, 10, lvl1 - uTop);
      ctx.fillRect(mx2 - 5, uTop, 10, lvl2 - uTop);
      ctx.strokeStyle = C.metalLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx1 - 7, uTop);
      ctx.lineTo(mx1 - 7, uBot + 2);
      ctx.lineTo(mx2 + 7, uBot + 2);
      ctx.lineTo(mx2 + 7, uTop);
      ctx.moveTo(mx1 + 7, uTop);
      ctx.lineTo(mx1 + 7, uBot - 12);
      ctx.lineTo(mx2 - 7, uBot - 12);
      ctx.lineTo(mx2 - 7, uTop);
      ctx.stroke();
      ctx.strokeStyle = C.amber;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(mx1 + 9, lvl1);
      ctx.lineTo(mx2 + 30, lvl1);
      ctx.moveTo(mx2 + 9, lvl2);
      ctx.lineTo(mx2 + 30, lvl2);
      ctx.stroke();
      ctx.setLineDash([]);
      if (Math.abs(dhPx) > 6) arrow(ctx, mx2 + 24, lvl1, mx2 + 24, lvl2 + 3, C.amber, 1.5, 6);
      text(ctx, `Δh = ${fmt(o.dh, 1)} cm`, mx2 + 38, mid + 5, { size: 15, bold: true, color: C.amber });
      text(ctx, 'tomada 1', mx1 - 12, uTop + 10, { size: 10, color: C.dim, align: 'right' });
      text(ctx, 'tomada 2', mx2 + 12, uTop + 10, { size: 10, color: C.dim });
      text(ctx, '(p₁ + ρgz₁) − (p₂ + ρgz₂)', 400, 524, { size: 10, color: C.dim });
      text(ctx, '= (ρHg − ρ)·g·Δh', 400, 538, { size: 10, color: C.dim });

      // ---------------- balanço de energia (Bernoulli) por seção
      ctx.fillStyle = C.bg2;
      roundRect(ctx, 552, 424, 400, 128, 10);
      ctx.fill();
      text(ctx, 'Bernoulli: z + p/ρg + v²/2g (m)', 566, 442, { size: 12, bold: true });
      const hmax = Math.max(sec[0].H, ...sec.map((q) => q.z + Math.max(0, q.hp) + q.hv), 1);
      const bx = 600;
      const bw = 330;
      const k = bw / hmax;
      sec.forEach((q, i) => {
        const y = 456 + i * 30;
        text(ctx, String(i + 1), 584, y + 14, { size: 13, bold: true, color: C.amber, align: 'center' });
        let x = bx;
        const seg = (len: number, color: string) => {
          if (len <= 0) return;
          ctx.fillStyle = color;
          ctx.fillRect(x, y, len * k, 18);
          x += len * k;
        };
        seg(q.z, '#7d8a98');
        seg(Math.max(0, q.hp), C.curve1);
        seg(q.hv, C.amber);
        const lost = sec[0].H - q.H;
        if (lost > 0.005) {
          ctx.strokeStyle = C.bad;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(x, y, lost * k, 18);
          ctx.setLineDash([]);
        }
        if (q.hp < 0) tag(ctx, `p/ρg = ${fmt(q.hp, 1)} m (vácuo)`, bx + 4, y + 13, C.bad, 'left', 10);
      });
      const lg: [string, string][] = [
        ['z', '#7d8a98'],
        ['p/ρg', C.curve1],
        ['v²/2g', C.amber],
        ['perda', C.bad],
      ];
      lg.forEach(([l, c], i) => {
        ctx.fillStyle = c;
        ctx.fillRect(760 + i * 48, 433, 10, 10);
        text(ctx, l, 774 + i * 48, 442, { size: 10, color: C.dim });
      });
    },
    status(v, o) {
      if (o.cav) return { tone: 'bad', text: '💥 Cavitação na garganta: a pressão absoluta chegou à pressão de vapor (≈ 2,3 kPa) e a água ferve a frio.' };
      if (v.Q <= 0) return { tone: 'ok', text: 'Sem vazão: os três piezômetros ficam no mesmo nível — é a hidrostática (p + ρgz constante).' };
      if (o.p2 < 0) return { tone: 'warn', text: '⚠️ Pressão manométrica negativa na garganta (vácuo parcial) — ainda acima da pressão de vapor.' };
      if (v.real) return { tone: 'warn', text: `Fluido real: a linha de energia cai ${fmt(o.loss, 2)} m da entrada à saída (perda de carga).` };
      return { tone: 'ok', text: 'Fluido ideal: a linha de energia é horizontal — z + p/ρg + v²/2g se conserva.' };
    },
    pointer(kind, x, y) {
      const yc = Y_BASE - ((2 * lastGeom.dz * (X2 - X1)) / (X3 - X1)) * lastGeom.s;
      const near = Math.abs(x - X2) < 70 && Math.abs(y - yc) < R0 + 20;
      if (kind === 'down') dragThroat = near;
      if (kind === 'up') dragThroat = false;
      if (!dragThroat) return null;
      const r = Math.max(4, Math.abs(y - yc));
      return { d2: Math.round(Math.min(100, Math.max(40, (r / R0) * 100)) / 5) * 5 };
    },
    cursor(x, y) {
      const yc = Y_BASE - ((2 * lastGeom.dz * (X2 - X1)) / (X3 - X1)) * lastGeom.s;
      return Math.abs(x - X2) < 70 && Math.abs(y - yc) < R0 + 20 ? 'ns-resize' : 'default';
    },
  };
}
