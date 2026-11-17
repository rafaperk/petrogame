/** Desenho da bancada do trocador bitubular: fluidos coloridos pela temperatura, fluxo de calor e perfis T(x). */
import { exchanger, profiles } from '../../learning/labs/exchanger';
import { arrow, C, Chart, fmt, roundRect, tag, tempColor, text } from './draw';
import type { LabView } from './views';

const TAU = Math.PI * 2;
const XA = 130; // início do trocador
const XB = 830; // fim
const SHELL = [104, 236] as const; // anular (parede externa)
const TUBE = [148, 192] as const; // tubo interno
const T_MIN = 10;
const T_MAX = 95;

interface Dot {
  u: number; // posição 0..1 ao longo do trocador
  y: number;
}

const interpArr = (arr: number[], u: number) => {
  const f = Math.max(0, Math.min(1, u)) * (arr.length - 1);
  const i = Math.floor(f);
  const k = f - i;
  return i >= arr.length - 1 ? arr[arr.length - 1] : arr[i] * (1 - k) + arr[i + 1] * k;
};

export function exchangerView(): LabView {
  const hot: Dot[] = [];
  const cold: Dot[] = [];
  for (let i = 0; i < 46; i++) hot.push({ u: Math.random(), y: TUBE[0] + 6 + Math.random() * (TUBE[1] - TUBE[0] - 12) });
  for (let i = 0; i < 80; i++) {
    const upper = i % 2 === 0;
    cold.push({ u: Math.random(), y: upper ? SHELL[0] + 6 + Math.random() * (TUBE[0] - SHELL[0] - 14) : TUBE[1] + 8 + Math.random() * (SHELL[1] - TUBE[1] - 14) });
  }
  let flux = 0;

  return {
    draw(ctx, v, o, dt) {
      const st = exchanger(v);
      const pr = profiles(v, 60);
      const X = (u: number) => XA + u * (XB - XA);
      const counter = st.counter;

      ctx.fillStyle = C.bg2;
      roundRect(ctx, 8, 8, 944, 300, 10);
      ctx.fill();
      text(ctx, 'Trocador bitubular (tubo dentro de tubo)', 22, 30, { size: 13, bold: true });
      text(ctx, counter ? 'Contracorrente: os fluidos andam em sentidos opostos' : 'Paralelo: os dois fluidos andam no mesmo sentido', 22, 48, { size: 11, color: C.dim });

      // anular (água fria) com cor por temperatura
      const gc = ctx.createLinearGradient(XA, 0, XB, 0);
      const gh = ctx.createLinearGradient(XA, 0, XB, 0);
      for (let i = 0; i <= 12; i++) {
        const u = i / 12;
        gc.addColorStop(u, tempColor(interpArr(pr.tc, u), T_MIN, T_MAX, 0.55));
        gh.addColorStop(u, tempColor(interpArr(pr.th, u), T_MIN, T_MAX, 0.75));
      }
      ctx.fillStyle = gc;
      ctx.fillRect(XA, SHELL[0], XB - XA, SHELL[1] - SHELL[0]);
      ctx.fillStyle = gh;
      ctx.fillRect(XA, TUBE[0], XB - XA, TUBE[1] - TUBE[0]);

      // partículas
      const vh = (40 + 230 * v.mh) / (XB - XA);
      const vc = (40 + 230 * v.mc) / (XB - XA);
      for (const d of hot) {
        d.u += vh * dt;
        if (d.u > 1) d.u -= 1;
        ctx.fillStyle = tempColor(interpArr(pr.th, d.u), T_MIN, T_MAX);
        ctx.beginPath();
        ctx.arc(X(d.u), d.y, 3, 0, TAU);
        ctx.fill();
      }
      for (const d of cold) {
        d.u += (counter ? -vc : vc) * dt;
        if (d.u > 1) d.u -= 1;
        if (d.u < 0) d.u += 1;
        ctx.fillStyle = tempColor(interpArr(pr.tc, d.u), T_MIN, T_MAX);
        ctx.beginPath();
        ctx.arc(X(d.u), d.y, 3, 0, TAU);
        ctx.fill();
      }
      // paredes
      ctx.strokeStyle = C.metalLight;
      ctx.lineWidth = 3;
      for (const y of TUBE) {
        ctx.beginPath();
        ctx.moveTo(XA - 40, y);
        ctx.lineTo(XB + 40, y);
        ctx.stroke();
      }
      ctx.strokeStyle = C.metal;
      ctx.lineWidth = 7;
      ctx.strokeRect(XA, SHELL[0], XB - XA, SHELL[1] - SHELL[0]);
      // fluxo de calor atravessando a parede do tubo (proporcional ao ΔT local)
      flux += dt * 40;
      for (let i = 0; i < 12; i++) {
        const u = (i + 0.5) / 12;
        const dT = interpArr(pr.th, u) - interpArr(pr.tc, u);
        const len = Math.max(0, Math.min(1, dT / 60));
        if (len < 0.03) continue;
        const x = X(u);
        const wob = Math.sin(flux * 0.2 + i) * 2;
        ctx.globalAlpha = 0.4 + 0.6 * len;
        arrow(ctx, x + wob, TUBE[0] + 4, x + wob, TUBE[0] - 6 - 26 * len, '#ffd2a6', 1.5 + 2 * len, 6);
        arrow(ctx, x - wob, TUBE[1] - 4, x - wob, TUBE[1] + 6 + 26 * len, '#ffd2a6', 1.5 + 2 * len, 6);
        ctx.globalAlpha = 1;
      }
      // bocais e termômetros
      const hotIn = tempColor(v.thi, T_MIN, T_MAX);
      ctx.fillStyle = hotIn;
      ctx.fillRect(XA - 70, TUBE[0] + 8, 70, TUBE[1] - TUBE[0] - 16);
      ctx.fillStyle = tempColor(st.tho, T_MIN, T_MAX);
      ctx.fillRect(XB, TUBE[0] + 8, 70, TUBE[1] - TUBE[0] - 16);
      arrow(ctx, XA - 64, 170, XA - 20, 170, '#fff', 2, 7);
      arrow(ctx, XB + 20, 170, XB + 64, 170, '#fff', 2, 7);
      tag(ctx, `quente entra ${fmt(v.thi, 0)} °C`, XA - 60, 294, C.hot, 'left', 11);
      tag(ctx, `quente sai ${fmt(st.tho, 1)} °C`, XB + 70, 294, C.hot, 'right', 11);
      // bocais do anular: entrada à esquerda (paralelo) ou à direita (contracorrente)
      const coldInX = counter ? XB - 40 : XA + 40;
      const coldOutX = counter ? XA + 40 : XB - 40;
      ctx.fillStyle = tempColor(v.tci, T_MIN, T_MAX);
      ctx.fillRect(coldInX - 12, SHELL[0] - 38, 24, 38);
      ctx.fillStyle = tempColor(st.tco, T_MIN, T_MAX);
      ctx.fillRect(coldOutX - 12, SHELL[1], 24, 38);
      arrow(ctx, coldInX, SHELL[0] - 36, coldInX, SHELL[0] - 4, '#fff', 2, 7);
      arrow(ctx, coldOutX, SHELL[1] + 4, coldOutX, SHELL[1] + 36, '#fff', 2, 7);
      tag(ctx, `fria entra ${fmt(v.tci, 0)} °C`, coldInX + (counter ? -18 : 18), SHELL[0] - 22, C.cold, counter ? 'right' : 'left', 11);
      tag(ctx, `fria sai ${fmt(st.tco, 1)} °C`, coldOutX + (counter ? 18 : -18), SHELL[1] + 26, C.cold, counter ? 'left' : 'right', 11);
      text(ctx, 'água quente (tubo interno)', (XA + XB) / 2, 175, { size: 12, align: 'center', bold: true, shadow: true });
      text(ctx, 'água fria (espaço anular)', (XA + XB) / 2, SHELL[0] + 18, { size: 11, align: 'center', shadow: true });
      if (v.foul) {
        ctx.strokeStyle = 'rgba(140,100,60,0.95)';
        ctx.lineWidth = 3;
        ctx.setLineDash([2, 4]);
        for (const y of [TUBE[0] + 3, TUBE[1] - 3]) {
          ctx.beginPath();
          ctx.moveTo(XA, y);
          ctx.lineTo(XB, y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        tag(ctx, 'incrustação nas paredes', (XA + XB) / 2, TUBE[1] + 32, '#d8a36a', 'center', 10);
      }

      // ---------------- perfis de temperatura
      const ch = new Chart(ctx, { x: 92, y: 352, w: 470, h: 160, x0: 0, x1: 100, y0: 0, y1: 100 });
      ch.frame('Perfis de temperatura', 'posição (% do comprimento)', 'T (°C)', [0, 25, 50, 75, 100], [0, 25, 50, 75, 100]);
      ch.poly(pr.x.map((x, i) => [x * 100, pr.th[i]] as [number, number]), C.hot, 3);
      ch.poly(pr.x.map((x, i) => [x * 100, pr.tc[i]] as [number, number]), C.cold, 3);
      // setas de sentido sobre as curvas
      const mid = Math.floor(pr.x.length / 2);
      arrow(ctx, ch.X(46), ch.Y(pr.th[mid]) - 10, ch.X(56), ch.Y(pr.th[mid]) - 10, C.hot, 2, 7);
      if (counter) arrow(ctx, ch.X(56), ch.Y(pr.tc[mid]) + 12, ch.X(46), ch.Y(pr.tc[mid]) + 12, C.cold, 2, 7);
      else arrow(ctx, ch.X(46), ch.Y(pr.tc[mid]) + 12, ch.X(56), ch.Y(pr.tc[mid]) + 12, C.cold, 2, 7);
      // ΔT nas extremidades
      const dtEnd = (u: number, th: number, tc: number, label: string) => {
        const x = ch.X(u * 100) + (u ? -10 : 10);
        ctx.strokeStyle = C.amber;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, ch.Y(th));
        ctx.lineTo(x, ch.Y(tc));
        ctx.stroke();
        ctx.setLineDash([]);
        tag(ctx, `${label} ${fmt(th - tc, 1)} °C`, x + (u ? -6 : 6), (ch.Y(th) + ch.Y(tc)) / 2 + 4, C.amber, u ? 'right' : 'left', 11);
      };
      dtEnd(0, pr.th[0], pr.tc[0], 'ΔT₁');
      dtEnd(1, pr.th[pr.th.length - 1], pr.tc[pr.tc.length - 1], 'ΔT₂');
      ch.legend([
        ['água quente', C.hot],
        ['água fria', C.cold],
      ], ch.X(70), ch.b.y + 14);

      // ---------------- quadro de cálculo
      ctx.fillStyle = C.bg2;
      roundRect(ctx, 600, 322, 352, 230, 10);
      ctx.fill();
      text(ctx, 'Contas do trocador', 616, 344, { size: 13, bold: true });
      const lines: [string, string][] = [
        ['Arranjo', counter ? 'contracorrente' : 'paralelo'],
        ['ΔT₁ · ΔT₂', `${fmt(st.dt1, 1)} · ${fmt(st.dt2, 1)} °C`],
        ['MLDT = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂)', `${fmt(st.lmtd, 1)} °C`],
        ['q = U·A·MLDT', `${fmt(st.ua / v.area, 2)} × ${fmt(v.area, 1)} × ${fmt(st.lmtd, 1)} = ${fmt(st.q, 1)} kW`],
        ['C = ṁ·cp (quente · fria)', `${fmt(st.ch, 2)} · ${fmt(st.cc, 2)} kW/K`],
        ['q máx = Cmín·(Tq,e − Tf,e)', `${fmt(st.cmin * (v.thi - v.tci), 1)} kW`],
        ['Efetividade ε = q / q máx', `${fmt(st.eff * 100, 0)} %`],
        ['NUT = U·A / Cmín', fmt(st.ntu, 2)],
      ];
      lines.forEach(([k, val], i) => {
        text(ctx, k, 616, 370 + i * 22, { size: 11, color: C.dim });
        text(ctx, val, 938, 370 + i * 22, { size: 12, bold: true, align: 'right' });
      });
      if (o.cross > 0.05) tag(ctx, `cruzamento: a fria sai ${fmt(o.cross, 1)} °C acima da saída quente`, 776, 548, C.good, 'center', 11);
    },
    status(v, o) {
      const st = exchanger(v);
      if (o.cross > 0.05) return { tone: 'ok', text: `🔀 Cruzamento de temperaturas: a água fria sai ${fmt(o.cross, 1)} °C mais quente que a água quente sai — só a contracorrente permite isso.` };
      if (Math.min(st.dt1, st.dt2) < 2) return { tone: 'warn', text: '🤏 As temperaturas quase se encontram numa ponta: mais área agora quase não aumenta a troca.' };
      if (v.foul) return { tone: 'warn', text: `🧱 Incrustação: U caiu de 1,00 para ${fmt(st.ua / v.area, 2)} kW/m²·K — a troca diminui.` };
      if (!st.counter) return { tone: 'ok', text: 'Paralelo: ΔT enorme na entrada e pequeno na saída. A saída fria nunca passa da saída quente.' };
      return { tone: 'ok', text: 'Contracorrente: ΔT mais uniforme ao longo do trocador → MLDT maior → mais calor trocado com a mesma área.' };
    },
  };
}
