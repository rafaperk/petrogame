/**
 * Desenho da bancada de corrosão: a cuba com as duas placas, o fio com a chave e o amperímetro (ou a fonte), os
 * elétrons no fio (sempre do anodo para o catodo), os íons saindo do metal que se dissolve, o OH⁻ ou as bolhas de H₂
 * no catodo e o produto de corrosão que se deposita no fundo; a série galvânica com as placas marcadas (dá para
 * escolher os metais clicando nela); as barras das taxas sozinha × agora; e as contas (ΔE, corrente e Faraday).
 */
import { cellState, E_OVER, E_PROT_STEEL, METALS, STEEL, type CellState, type Plate } from '../../learning/labs/corrosion';
import type { LabValues } from '../../learning/types';
import { approach, C, fmt, niceAxis, roundRect, seeded, tag, text, ticksOf } from './draw';
import type { LabView } from './views';

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const f2 = (x: number) => fmt(x, 2);
/** Potencial com sinal e duas casas (−0,65 V). */
const fE = (E: number) => `${E < -0.0005 ? '−' : E > 0.0005 ? '+' : ''}${Math.abs(E).toFixed(2).replace('.', ',')}`;
/** Taxa em mm/ano com casas conforme o tamanho. */
const fr = (r: number) => (r <= 0 ? '0' : r < 0.001 ? '< 0,001' : fmt(r, r < 0.1 ? 3 : r < 10 ? 2 : 1));
const fI = (mA: number) => fmt(mA, mA < 0.1 ? 3 : mA < 10 ? 2 : 1);
const fk = (k: number) => fmt(k, k < 10 ? 1 : 0);

// ------------------------------------------------------------------ cena
const TANK = { x: 34, y: 214, w: 472, h: 326 };
const SURF = 238;
const PLATE_TOP = 252;
const CX = [150, 390];
const HMAX = 262;
const WIRE_Y = 172;
const DEV = { x: 222, y: 150, w: 96, h: 46 };
const BOTTOM = TANK.y + TANK.h - 4;

// ------------------------------------------------------------------ painéis
const SER = { x: 540, y: 12, w: 406, h: 284 };
const ROW0 = 80;
const ROWH = 25;
const BTN_X = [898, 926];
const BARS = { x: 540, y: 306, w: 406, h: 242 };
const RATE_STEPS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];

const ROLE_COLOR = { anode: '#ff7a6b', cathode: '#6fc3ff', alone: C.dim } as const;
const ROLE_WORD = { anode: 'ANODO', cathode: 'CATODO', alone: 'sozinha' } as const;

function plateRect(cm2: number, i: number): { x: number; y: number; w: number; h: number } {
  const h = HMAX * Math.sqrt(clamp(cm2, 10, 1000) / 1000);
  const w = Math.max(11, h * 0.55);
  return { x: CX[i] - w / 2, y: PLATE_TOP, w, h };
}

/** Metais na série, do mais nobre (em cima) ao mais ativo. */
const ROWS = METALS.map((_, i) => i).sort((a, b) => METALS[b].E - METALS[a].E);
const rowY = (metal: number) => ROW0 + ROWS.indexOf(metal) * ROWH;

/** Reação anódica da placa que é anodo (ou do metal sozinho). */
function anodicText(p: Plate, st: CellState): string {
  const m = p.metal;
  if (m.kind === 'inert') return st.med.acid || st.medIdx === 1 ? '2H₂O → O₂ + 4H⁺ + 4e⁻' : '2Cl⁻ → Cl₂ + 2e⁻';
  if (m.kind === 'passive') return 'Cr₂O₃: quase nada dissolve';
  const n = m.n;
  return `${m.sym} → ${m.ion} + ${n}e⁻`;
}

/** Reação catódica dominante no catodo. */
function cathodicText(p: Plate, st: CellState): string {
  if (p.h2 > 0.5 * Math.max(1e-12, st.I) && !st.med.acid) return '2H₂O + 2e⁻ → H₂ + 2OH⁻';
  return st.med.cathodic;
}

interface Part {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  kind: 'ion' | 'oh' | 'h2' | 'floc' | 'gas';
  color: string;
  r: number;
  label?: string;
  /** Vira floco (produto de corrosão) ao fim da vida. */
  floc?: string;
}

export function corrosionView(): LabView {
  let parts: Part[] = [];
  // acumuladores de emissão: 0–1 íons (A, B); 2–5 OH⁻ e H₂ de cada placa; 6–7 gás no anodo inerte
  const emit = [0, 0, 0, 0, 0, 0, 0, 0];
  let sediment: { h: number; color: string }[] = Array.from({ length: 59 }, () => ({ h: 0, color: '#7a5a3a' }));
  let lastKey = '';
  const attack = [0, 0];
  let rateTop = 0;
  let dragging = -1;
  let hover = -1;
  const rnd = seeded(7);

  function clearTank(): void {
    parts = [];
    sediment = sediment.map(() => ({ h: 0, color: '#7a5a3a' }));
    emit.fill(0);
  }

  // ---------------------------------------------------------------- contas
  function drawCalc(ctx: CanvasRenderingContext2D, st: CellState): void {
    ctx.fillStyle = C.bg2;
    roundRect(ctx, 14, 12, 512, 116, 8);
    ctx.fill();
    const { A, B } = st;
    let y = 32;
    const L = (s: string, color: string = C.text, bold = false) => {
      text(ctx, s, 26, y, { size: 11.5, color, bold });
      y += 18.5;
    };
    const an = st.anode === 0 ? A : st.anode === 1 ? B : null;
    const ca = st.anode === 0 ? B : st.anode === 1 ? A : null;
    if (st.link === 0 || !an || !ca) {
      L(st.link === 0 ? 'Circuito aberto: cada placa sozinha' : st.link === 2 ? 'Fonte ligada, mas sem corrente' : 'Fio ligado, mas sem pilha', C.amber, true);
      L(`ΔE = |E_A − E_B| = |${fE(A.metal.E)} − (${fE(B.metal.E)})| = ${f2(st.dE)} V`);
      if (st.link === 0) L('cada metal corrói por micropilhas');
      else if (st.link === 2) L(`a fonte (${f2(st.Vs)} V) ainda não vence o ΔE do par`);
      else L('metais iguais: ΔE = 0, não há anodo nem catodo');
      L(`reação catódica: ${st.med.cathodic}`, C.dim);
      L(`meio: ${st.med.name} (ρ = ${fmt(st.med.rho, 2)} Ω·m)`, C.dim);
    } else {
      L(`Pilha: anodo ${an === A ? 'A' : 'B'} (${an.metal.label}) · catodo ${ca === A ? 'A' : 'B'} (${ca.metal.label})`, C.amber, true);
      L(`ΔE = |${fE(A.metal.E)} − (${fE(B.metal.E)})| = ${f2(st.dE)} V${st.link === 2 ? ` · fonte ${f2(st.Vs)} V` : ''}`);
      L(st.link === 2 ? 'o polo + da fonte faz da placa A o anodo' : 'o mais ativo (mais negativo) é o anodo');
      L(`I = ${fI(st.I * 1000)} mA · eletrólito: R = ${fmt(st.Rs, st.Rs < 10 ? 1 : 0)} Ω`);
      L(`catodo: ${cathodicText(ca, st)}`, C.dim);
    }
    y = 32;
    const R = (s: string, color: string = C.text, bold = false) => {
      text(ctx, s, 290, y, { size: 11.5, color, bold });
      y += 18.5;
    };
    R('Taxa (Faraday) = i·M/(n·F·ρ)', C.amber, true);
    if (!an || !ca) {
      for (const [k, p] of [['A', A] as const, ['B', B] as const]) R(`${k}: i = ${fmt(p.j, 4)} A/m² → ${fr(p.r)} mm/ano`);
      R(`${A.metal.label} ${fE(A.E)} V · ${B.metal.label} ${fE(B.E)} V (× Ag/AgCl)`, C.dim);
    } else {
      if (an.metal.kind === 'active') {
        R(`anodo: i = ${fmt(an.j0, 3)} + I/A = ${fmt(an.j, 3)} A/m²`);
        R(`→ ${fr(an.r)} mm/ano (×${fk(an.r0 > 0 ? an.r / an.r0 : 1)}) · ${fmt(an.loss, an.loss < 10 ? 1 : 0)} g/ano`);
      } else {
        R(`anodo de ${an.metal.label.toLowerCase()}: ${an.metal.kind === 'inert' ? 'inerte, gera gás' : 'passivo'}`);
        R('→ quase não perde massa');
      }
      R(`áreas: catodo/anodo = ${fmt(ca.cm2 / an.cm2, ca.cm2 / an.cm2 < 1 ? 2 : 1)}`);
      const steel = ca.metal === METALS[STEEL];
      R(steel ? `aço a ${fE(ca.E)} V: ${fmt(ca.prot * 100, 0)} % protegido (≤ ${fE(E_PROT_STEEL)} V)` : `catodo a ${fE(ca.E)} V: ${fmt(ca.prot * 100, 0)} % protegido`, C.dim);
    }
  }

  // ---------------------------------------------------------------- partículas
  function spawnIon(st: CellState, i: number, other: number, dt: number, current: number, ionLabel: string, color: string, floc: string | null): void {
    // partículas por segundo ~ log da corrente de dissolução (A)
    const rate = 12 * Math.log10(1 + 1000 * current);
    emit[i] += rate * dt;
    const r = plateRect(i === 0 ? st.A.cm2 : st.B.cm2, i);
    while (emit[i] >= 1) {
      emit[i] -= 1;
      if (parts.length > 260) continue;
      const toward = other >= 0 ? Math.sign(CX[other] - CX[i]) : rnd() < 0.5 ? -1 : 1;
      const x = toward > 0 ? r.x + r.w : r.x;
      parts.push({
        x: x + toward * 2,
        y: r.y + 6 + rnd() * Math.max(4, r.h - 12),
        vx: toward * (18 + rnd() * 22),
        vy: (rnd() - 0.5) * 10,
        life: 0,
        max: 1.6 + rnd() * 1.4,
        kind: 'ion',
        color,
        r: 3.2,
        label: rnd() < 0.3 ? ionLabel : undefined,
        floc: floc && rnd() < 0.6 ? floc : undefined,
      });
    }
  }

  function spawnCathodic(st: CellState, slot: number, i: number, dt: number, ohCurrent: number, h2Current: number): void {
    const r = plateRect(i === 0 ? st.A.cm2 : st.B.cm2, i);
    emit[slot] += 10 * Math.log10(1 + 1000 * ohCurrent) * dt;
    emit[slot + 1] += 14 * Math.log10(1 + 1000 * h2Current) * dt;
    while (emit[slot] >= 1) {
      emit[slot] -= 1;
      if (parts.length > 260) continue;
      const side = rnd() < 0.5 ? -1 : 1;
      parts.push({
        x: CX[i] + (side * r.w) / 2 + side * 2,
        y: r.y + 6 + rnd() * Math.max(4, r.h - 12),
        vx: side * (8 + rnd() * 10),
        vy: (rnd() - 0.5) * 8,
        life: 0,
        max: 1.2 + rnd(),
        kind: 'oh',
        color: '#8fd3ff',
        r: 2.4,
        label: rnd() < 0.25 ? 'OH⁻' : undefined,
      });
    }
    while (emit[slot + 1] >= 1) {
      emit[slot + 1] -= 1;
      if (parts.length > 260) continue;
      parts.push({
        x: r.x + rnd() * r.w,
        y: r.y + 4 + rnd() * Math.max(4, r.h - 8),
        vx: (rnd() - 0.5) * 6,
        vy: -(30 + rnd() * 30),
        life: 0,
        max: 6,
        kind: 'h2',
        color: '#e8f6ff',
        r: 1.8 + rnd() * 2.2,
      });
    }
  }

  function spawnGas(st: CellState, i: number, dt: number, current: number): void {
    const r = plateRect(i === 0 ? st.A.cm2 : st.B.cm2, i);
    emit[6 + i] += 10 * Math.log10(1 + 1000 * current) * dt;
    while (emit[6 + i] >= 1) {
      emit[6 + i] -= 1;
      if (parts.length > 260) continue;
      parts.push({ x: r.x + rnd() * r.w, y: r.y + 4 + rnd() * Math.max(4, r.h - 8), vx: (rnd() - 0.5) * 6, vy: -(28 + rnd() * 26), life: 0, max: 6, kind: 'gas', color: '#d9f2c4', r: 1.6 + rnd() * 1.8 });
    }
  }

  function update(st: CellState, dt: number): void {
    const key = [st.A.metal.sym, st.B.metal.sym, st.medIdx].join('|');
    if (key !== lastKey) {
      lastKey = key;
      clearTank();
    }
    const plates = [st.A, st.B];
    plates.forEach((p, i) => {
      const other = st.anode >= 0 ? 1 - i : -1;
      const product = !st.med.acid && p.metal.kind === 'active' ? p.metal.product : null;
      // dissolução (íons) — sozinha ou como anodo
      if (p.metal.kind !== 'inert') spawnIon(st, i, p.role === 'anode' ? other : -1, dt, p.j * p.A, p.metal.ion, p.metal.color, product);
      // reação catódica local (micropilhas) quando sozinha ou no anodo: OH⁻ ou H₂ no próprio metal
      if (p.role !== 'cathode') {
        const localC = p.j0 * p.A;
        spawnCathodic(st, 2 + 2 * i, i, dt * 0.6, st.med.o2 ? Math.max(0, localC - p.h2) : 0, p.h2);
      }
      attack[i] = approach(attack[i], clamp(Math.log10(Math.max(1e-6, p.r) / 0.004) / 3, 0, 1), dt, 1.2);
    });
    // catodo da pilha
    if (st.anode >= 0) {
      const ci = 1 - st.anode;
      const ca = plates[ci];
      const oh = st.med.acid ? 0 : Math.max(0, st.I - ca.h2);
      spawnCathodic(st, 2 + 2 * ci, ci, dt, oh, st.med.acid ? st.I : ca.h2);
      const an = plates[st.anode];
      if (an.gas > 0) spawnGas(st, st.anode, dt, an.gas);
    }
    // movimento
    const keep: Part[] = [];
    for (const q of parts) {
      q.life += dt;
      if (q.kind === 'h2' || q.kind === 'gas') {
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        if (q.y > SURF + 2) keep.push(q);
        continue;
      }
      if (q.kind === 'floc') {
        q.y += q.vy * dt;
        q.x += q.vx * dt;
        const bin = clamp(Math.floor((q.x - TANK.x - 4) / 8), 0, sediment.length - 1);
        if (q.y >= BOTTOM - sediment[bin].h) {
          sediment[bin].h = Math.min(16, sediment[bin].h + 0.35);
          sediment[bin].color = q.color;
        } else keep.push(q);
        continue;
      }
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vx *= 1 - 0.6 * dt;
      if (q.life < q.max && q.x > TANK.x + 6 && q.x < TANK.x + TANK.w - 6) keep.push(q);
      else if (q.floc && q.life >= q.max && rnd() < 0.5) keep.push({ x: q.x, y: q.y, vx: (rnd() - 0.5) * 4, vy: 14 + rnd() * 10, life: 0, max: 20, kind: 'floc', color: q.floc, r: 2.2 + rnd() * 1.5 });
    }
    parts = keep;
  }

  // ---------------------------------------------------------------- cuba, placas e fio
  function wirePath(from: number, to: number): [number, number][] {
    return [
      [CX[from], PLATE_TOP],
      [CX[from], WIRE_Y],
      [CX[to], WIRE_Y],
      [CX[to], PLATE_TOP],
    ];
  }

  function drawPlate(ctx: CanvasRenderingContext2D, p: Plate, i: number): void {
    const r = plateRect(p.cm2, i);
    const m = p.metal;
    // haste até o fio
    ctx.strokeStyle = '#c9a25a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CX[i], WIRE_Y);
    ctx.lineTo(CX[i], r.y);
    ctx.stroke();
    ctx.fillStyle = m.color;
    roundRect(ctx, r.x, r.y, r.w, r.h, 2);
    ctx.fill();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(r.x + r.w * 0.18, r.y + 2, Math.max(1.5, r.w * 0.12), r.h - 4);
    ctx.globalAlpha = 1;
    // ataque: pites e manchas proporcionais à taxa
    const n = Math.round(attack[i] * (8 + (r.w * r.h) / 260));
    const g = seeded(31 + i * 97 + m.sym.length);
    for (let k = 0; k < n; k++) {
      const px = r.x + 2 + g() * (r.w - 4);
      const py = r.y + 3 + g() * (r.h - 6);
      const rr = 1 + g() * (1.2 + attack[i] * 2.2);
      if (m === METALS[STEEL]) {
        ctx.fillStyle = 'rgba(194,98,43,0.55)';
        ctx.beginPath();
        ctx.arc(px, py, rr + 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(28,20,14,0.7)';
      ctx.beginPath();
      ctx.ellipse(px, py, rr, rr * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = p.role === 'cathode' && p.prot > 0.99 ? '#8fdcff' : 'rgba(10,16,24,0.8)';
    ctx.lineWidth = p.role === 'cathode' && p.prot > 0.99 ? 2.5 : 1.5;
    roundRect(ctx, r.x, r.y, r.w, r.h, 2);
    ctx.stroke();
    // alça da área
    const by = r.y + r.h;
    ctx.fillStyle = dragging === i || hover === i ? '#ffe08a' : C.amber;
    roundRect(ctx, CX[i] - 9, by - 2, 18, 5, 2);
    ctx.fill();
    text(ctx, `${fmt(p.cm2, 0)} cm² · ${fE(p.E)} V`, CX[i], Math.min(BOTTOM - 4, by + 17), { size: 11, color: C.text, align: 'center', bold: true, shadow: true });
  }

  function drawScene(ctx: CanvasRenderingContext2D, st: CellState, time: number): void {
    const med = st.med;
    // bancada
    ctx.fillStyle = '#16283b';
    ctx.fillRect(14, TANK.y + TANK.h, 512, 548 - TANK.y - TANK.h);
    // água
    ctx.fillStyle = med.color;
    ctx.globalAlpha = 0.42;
    ctx.fillRect(TANK.x + 3, SURF, TANK.w - 6, TANK.y + TANK.h - SURF - 3);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(200,235,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = TANK.x + 3; x <= TANK.x + TANK.w - 3; x += 6) {
      const yy = SURF + Math.sin(x * 0.08 + time * 2) * 1.2;
      if (x === TANK.x + 3) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
    text(ctx, med.name, 26, 146, { size: 11, color: '#bfe3f2', bold: true });
    // sedimento (produto de corrosão)
    sediment.forEach((s, k) => {
      if (s.h <= 0) return;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(TANK.x + 4 + k * 8, BOTTOM - s.h, 8, s.h);
      ctx.globalAlpha = 1;
    });
    // placas
    drawPlate(ctx, st.A, 0);
    drawPlate(ctx, st.B, 1);
    // partículas
    for (const q of parts) {
      const fade = q.kind === 'ion' || q.kind === 'oh' ? clamp(1.4 - q.life / q.max, 0, 1) : 1;
      ctx.globalAlpha = fade;
      if (q.kind === 'h2' || q.kind === 'gas') {
        ctx.strokeStyle = q.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = q.color;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
        ctx.fill();
        if (q.kind === 'ion') {
          ctx.strokeStyle = 'rgba(10,16,24,0.7)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        if (q.label) text(ctx, q.label, q.x, q.y - 6, { size: 9.5, color: q.kind === 'oh' ? '#bfe8ff' : '#ffe2c4', align: 'center', bold: true, shadow: true });
      }
      ctx.globalAlpha = 1;
    }
    // vidro da cuba
    ctx.strokeStyle = 'rgba(190,220,245,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(TANK.x, TANK.y);
    ctx.lineTo(TANK.x, TANK.y + TANK.h);
    ctx.lineTo(TANK.x + TANK.w, TANK.y + TANK.h);
    ctx.lineTo(TANK.x + TANK.w, TANK.y);
    ctx.stroke();
    // fio, elétrons e aparelho
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CX[0], WIRE_Y);
    ctx.lineTo(DEV.x, WIRE_Y);
    ctx.moveTo(DEV.x + DEV.w, WIRE_Y);
    ctx.lineTo(CX[1], WIRE_Y);
    ctx.stroke();
    if (st.anode >= 0 && st.I > 0) drawElectrons(ctx, st, time);
    drawDevice(ctx, st);
    // rótulos das placas: papel e reação
    [st.A, st.B].forEach((p, i) => {
      const role = p.role;
      tag(ctx, `${i === 0 ? 'A' : 'B'} · ${p.metal.name} — ${ROLE_WORD[role]}`, CX[i], 206, ROLE_COLOR[role], 'center', 11.5);
      const reac = role === 'cathode' ? cathodicText(p, st) : p.metal.kind === 'inert' && role !== 'anode' ? 'inerte' : anodicText(p, st);
      text(ctx, reac, CX[i], 229, { size: 11, color: role === 'cathode' ? '#bfe8ff' : role === 'anode' ? '#ffd2c8' : C.dim, align: 'center', bold: true, shadow: true });
    });
  }

  function drawElectrons(ctx: CanvasRenderingContext2D, st: CellState, time: number): void {
    const pts = wirePath(st.anode, 1 - st.anode);
    const segs: number[] = [];
    let total = 0;
    for (let k = 1; k < pts.length; k++) {
      const d = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      segs.push(d);
      total += d;
    }
    const speed = 22 + 26 * Math.log10(1 + 1000 * st.I);
    const gap = 20;
    const off = (time * speed) % gap;
    ctx.fillStyle = '#ffe36b';
    for (let s = off; s < total; s += gap) {
      let rem = s;
      let k = 0;
      while (k < segs.length - 1 && rem > segs[k]) rem -= segs[k++];
      const t = rem / segs[k];
      const x = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t;
      const y = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t;
      if (x > DEV.x - 2 && x < DEV.x + DEV.w + 2 && Math.abs(y - WIRE_Y) < 3) continue;
      if (y > SURF - 2) continue;
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    const dir = st.anode === 0 ? 1 : -1;
    const ax = dir > 0 ? 96 : 444;
    text(ctx, `e⁻ ${dir > 0 ? '→' : '←'}`, ax, WIRE_Y - 9, { size: 12, color: '#ffe36b', align: 'center', bold: true });
  }

  function drawDevice(ctx: CanvasRenderingContext2D, st: CellState): void {
    const { x, y, w, h } = DEV;
    const cx = x + w / 2;
    ctx.fillStyle = st.link === 2 ? '#3a2f12' : '#1d3047';
    ctx.strokeStyle = st.link === 2 ? C.amber : '#5d7a99';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 7);
    ctx.fill();
    ctx.stroke();
    if (st.link === 0) {
      // chave aberta + voltímetro
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + h / 2 + 6);
      ctx.lineTo(x + 34, y + h / 2 - 12);
      ctx.stroke();
      ctx.fillStyle = '#d9a441';
      ctx.beginPath();
      ctx.arc(x + 10, y + h / 2 + 6, 3, 0, Math.PI * 2);
      ctx.arc(x + 40, y + h / 2 + 6, 3, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, 'aberta', x + 66, y + 20, { size: 11, color: C.dim, align: 'center', bold: true });
      text(ctx, `${f2(st.dE)} V`, x + 66, y + 37, { size: 12, color: C.amber, align: 'center', bold: true });
      text(ctx, 'voltímetro: ΔE', cx, y - 6, { size: 10.5, color: C.dim, align: 'center' });
    } else if (st.link === 1) {
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + h / 2);
      ctx.lineTo(x + 28, y + h / 2);
      ctx.moveTo(x + w - 28, y + h / 2);
      ctx.lineTo(x + w - 6, y + h / 2);
      ctx.stroke();
      ctx.fillStyle = '#0f1b29';
      ctx.strokeStyle = '#9fd0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, y + h / 2, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      text(ctx, 'mA', cx, y + h / 2 + 4, { size: 11, color: '#9fd0ff', align: 'center', bold: true });
      text(ctx, `I = ${fI(st.I * 1000)} mA`, cx, y - 6, { size: 11.5, color: C.amber, align: 'center', bold: true });
    } else {
      text(ctx, 'FONTE', cx, y + 18, { size: 11, color: C.amber, align: 'center', bold: true });
      text(ctx, `${f2(st.Vs)} V`, cx, y + 36, { size: 12, color: C.text, align: 'center', bold: true });
      text(ctx, '+', x + 10, y + 30, { size: 16, color: '#ff8a7a', align: 'center', bold: true });
      text(ctx, '−', x + w - 10, y + 30, { size: 16, color: '#7ec8ff', align: 'center', bold: true });
      text(ctx, `I = ${fI(st.I * 1000)} mA`, cx, y - 6, { size: 11.5, color: C.amber, align: 'center', bold: true });
    }
  }

  // ---------------------------------------------------------------- série galvânica
  function drawSeries(ctx: CanvasRenderingContext2D, st: CellState, v: LabValues): void {
    const { x, y, w, h } = SER;
    ctx.fillStyle = C.bg2;
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    text(ctx, 'Série galvânica em água do mar', x + 12, y + 22, { size: 13, bold: true });
    text(ctx, 'potencial de corrosão (V × Ag/AgCl) · clique A ou B', x + 12, y + 39, { size: 10.5, color: C.dim });
    text(ctx, '↑ mais nobre (catódico)', x + 60, ROW0 - 17, { size: 10.5, color: '#6fc3ff', bold: true });
    text(ctx, '↓ mais ativo (anódico): corrói', x + 60, ROW0 + 8 * ROWH - 4, { size: 10.5, color: '#ff7a6b', bold: true });
    const mA = Math.round(v.metA ?? STEEL);
    const mB = Math.round(v.metB ?? 5);
    // linha da reação catódica do meio (ácido / sem O₂): só corroem os metais abaixo dela
    if (!st.med.o2) {
      const Eh = st.med.Eh;
      let r = ROWS.findIndex((mi) => METALS[mi].E < Eh);
      if (r < 0) r = ROWS.length;
      const yy = ROW0 + (r - 0.5) * ROWH;
      ctx.strokeStyle = '#d9f27a';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 58, yy);
      ctx.lineTo(x + w - 12, yy);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, `- - - ${st.med.acid ? 'H⁺ → H₂' : 'H₂O → H₂'} (${fE(Eh)} V): sem O₂, só corroem os metais abaixo da linha`, x + 60, y + h - 6, { size: 9.5, color: '#d9f27a', bold: true });
    }
    ROWS.forEach((mi, r) => {
      const m = METALS[mi];
      const yy = ROW0 + r * ROWH;
      const isA = mi === mA;
      const isB = mi === mB;
      const plate = isA ? st.A : isB ? st.B : null;
      const role = plate ? plate.role : null;
      if (role === 'anode' || role === 'cathode') {
        ctx.fillStyle = role === 'anode' ? 'rgba(255,122,107,0.16)' : 'rgba(111,195,255,0.14)';
        roundRect(ctx, x + 56, yy - 10, 288, 20, 6);
        ctx.fill();
      }
      ctx.fillStyle = m.color;
      ctx.strokeStyle = 'rgba(10,16,24,0.8)';
      ctx.lineWidth = 1;
      roundRect(ctx, x + 64, yy - 7, 22, 14, 3);
      ctx.fill();
      ctx.stroke();
      text(ctx, m.name, x + 94, yy + 4, { size: 11.5, color: plate ? C.text : '#b7c6d6', bold: !!plate });
      text(ctx, fE(m.E), x + 298, yy + 4, { size: 11.5, color: plate ? C.amber : C.dim, align: 'right', bold: true });
      if (role === 'anode' || role === 'cathode') text(ctx, role === 'anode' ? 'anodo' : 'catodo', x + 304, yy + 4, { size: 10, color: ROLE_COLOR[role], bold: true });
      ['A', 'B'].forEach((lbl, k) => {
        const on = k === 0 ? isA : isB;
        const bx = BTN_X[k];
        ctx.fillStyle = on ? (k === 0 ? '#e0a52a' : '#4aa3e8') : '#22364d';
        ctx.strokeStyle = on ? '#0b1420' : '#3b5878';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx, yy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        text(ctx, lbl, bx, yy + 4, { size: 10.5, color: on ? '#0b1420' : C.dim, align: 'center', bold: true });
      });
    });
    // chave de ΔE entre as placas
    if (mA !== mB) {
      const ya = rowY(mA);
      const yb = rowY(mB);
      const top = Math.min(ya, yb);
      const bot = Math.max(ya, yb);
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 58, top);
      ctx.lineTo(x + 52, top);
      ctx.lineTo(x + 52, bot);
      ctx.lineTo(x + 58, bot);
      ctx.stroke();
      text(ctx, 'ΔE', x + 47, (top + bot) / 2 - 3, { size: 10.5, color: C.amber, align: 'right', bold: true });
      text(ctx, f2(st.dE), x + 47, (top + bot) / 2 + 10, { size: 10.5, color: C.amber, align: 'right', bold: true });
    }
  }

  // ---------------------------------------------------------------- barras das taxas
  function drawBars(ctx: CanvasRenderingContext2D, st: CellState, dt: number): void {
    const { x, y, w, h } = BARS;
    ctx.fillStyle = C.bg2;
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    text(ctx, 'Taxa de corrosão (mm/ano)', x + 12, y + 22, { size: 13, bold: true });
    const plates = [st.A, st.B];
    const max = Math.max(0.01, ...plates.flatMap((p) => [p.r, p.r0]));
    const ax = niceAxis(max * 1.12, RATE_STEPS, 4);
    rateTop = rateTop > 0 ? approach(rateTop, ax.top, dt, 4) : ax.top;
    const top = rateTop;
    const box = { x: x + 58, y: y + 46, w: w - 76, h: h - 92 };
    const Y = (r: number) => box.y + box.h - (clamp(r, 0, top) / top) * box.h;
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    const step = niceAxis(top, RATE_STEPS, 4).step;
    for (const t of ticksOf(0, top, step)) {
      const yy = Y(t);
      ctx.beginPath();
      ctx.moveTo(box.x, yy);
      ctx.lineTo(box.x + box.w, yy);
      ctx.stroke();
      text(ctx, fmt(t, t < 0.1 ? 2 : t < 1 ? 1 : 0), box.x - 6, yy + 4, { size: 10.5, color: C.dim, align: 'right' });
    }
    // legenda
    ctx.fillStyle = 'rgba(160,180,200,0.35)';
    ctx.fillRect(x + w - 168, y + 13, 12, 10);
    text(ctx, 'sozinha', x + w - 152, y + 22, { size: 10.5, color: C.dim });
    ctx.fillStyle = C.amber;
    ctx.fillRect(x + w - 96, y + 13, 12, 10);
    text(ctx, 'agora', x + w - 80, y + 22, { size: 10.5, color: C.dim });
    plates.forEach((p, i) => {
      const gx = box.x + box.w * (i === 0 ? 0.27 : 0.73);
      const bw = 40;
      const base = box.y + box.h;
      // sozinha
      ctx.fillStyle = 'rgba(160,180,200,0.35)';
      ctx.fillRect(gx - bw - 4, Y(p.r0), bw, base - Y(p.r0));
      text(ctx, fr(p.r0), gx - bw / 2 - 4, Math.min(Y(p.r0) - 5, base - 5), { size: 10.5, color: C.dim, align: 'center', bold: true });
      // agora
      const col = p.role === 'anode' ? '#ff7a6b' : p.role === 'cathode' ? '#6fc3ff' : C.amber;
      ctx.fillStyle = col;
      ctx.fillRect(gx + 4, Y(p.r), bw, base - Y(p.r));
      text(ctx, fr(p.r), gx + 4 + bw / 2, Math.min(Y(p.r) - 5, base - 5), { size: 10.5, color: col, align: 'center', bold: true });
      const note =
        p.role === 'anode'
          ? p.metal.kind === 'active'
            ? `×${fk(p.r0 > 0 ? p.r / p.r0 : 1)}`
            : 'gás, sem perder massa'
          : p.role === 'cathode'
            ? p.r0 > 0
              ? `${fmt(p.prot * 100, 0)} % protegida`
              : 'não corrói'
            : '';
      if (note) text(ctx, note, gx, box.y - 6, { size: 11, color: col, align: 'center', bold: true });
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx - bw - 12, base);
      ctx.lineTo(gx + bw + 12, base);
      ctx.stroke();
      text(ctx, `${i === 0 ? 'A' : 'B'} · ${p.metal.label}`, gx, base + 16, { size: 11.5, color: C.text, align: 'center', bold: true });
      text(ctx, `${fmt(p.loss, p.loss < 1 ? 2 : 1)} g/ano`, gx, base + 31, { size: 10.5, color: C.dim, align: 'center' });
    });
  }

  // ---------------------------------------------------------------- interação
  const seriesHit = (x: number, y: number): { side: 0 | 1; metal: number } | null => {
    for (let r = 0; r < ROWS.length; r++) {
      const yy = ROW0 + r * ROWH;
      for (let k = 0; k < 2; k++) if (Math.hypot(x - BTN_X[k], y - yy) <= 11) return { side: k as 0 | 1, metal: ROWS[r] };
    }
    return null;
  };
  const inDev = (x: number, y: number) => x >= DEV.x - 4 && x <= DEV.x + DEV.w + 4 && y >= DEV.y - 4 && y <= DEV.y + DEV.h + 4;
  const plateAt = (x: number, y: number, v: LabValues): number => {
    for (let i = 0; i < 2; i++) {
      const r = plateRect(i === 0 ? (v.aA ?? 100) : (v.aB ?? 100), i);
      if (Math.abs(y - (r.y + r.h)) <= 10 && x >= r.x - 10 && x <= r.x + r.w + 10) return i;
    }
    return -1;
  };
  const areaAt = (y: number) => {
    const hpx = clamp(y - PLATE_TOP, 8, HMAX);
    return clamp(Math.round((1000 * (hpx / HMAX) ** 2) / 10) * 10, 10, 1000);
  };

  return {
    reset() {
      clearTank();
      lastKey = '';
      attack[0] = attack[1] = 0;
      rateTop = 0;
      dragging = -1;
    },
    actions: [
      {
        label: '⇄ Trocar A e B',
        title: 'Troca os metais (e as áreas) das duas placas.',
        run(api) {
          const v = api.get();
          api.set({ metA: v.metB, metB: v.metA, aA: v.aB, aB: v.aA });
        },
      },
      {
        label: '🧽 Limpar a cuba',
        title: 'Tira o produto de corrosão do fundo e as partículas da água.',
        run() {
          clearTank();
        },
      },
    ],
    pointer(kind, x, y, v): LabValues | null {
      if (kind === 'down') {
        const hit = seriesHit(x, y);
        if (hit) return hit.side === 0 ? { metA: hit.metal } : { metB: hit.metal };
        if (inDev(x, y)) return { link: Math.round(v.link ?? 1) === 0 ? 1 : 0 };
        dragging = plateAt(x, y, v);
      }
      if (dragging < 0) return null;
      const out: LabValues = dragging === 0 ? { aA: areaAt(y) } : { aB: areaAt(y) };
      if (kind === 'up') dragging = -1;
      return out;
    },
    cursor(x, y, v) {
      hover = dragging >= 0 ? dragging : plateAt(x, y, v);
      if (seriesHit(x, y) || inDev(x, y)) return 'pointer';
      if (hover >= 0) return 'ns-resize';
      return 'default';
    },
    draw(ctx, v, _o, dt, time) {
      const st = cellState(v);
      const d = Math.min(dt, 0.05);
      update(st, d);
      drawCalc(ctx, st);
      drawScene(ctx, st, time);
      drawSeries(ctx, st, v);
      drawBars(ctx, st, d);
    },
    status(v) {
      const st = cellState(v);
      const { A, B } = st;
      const an = st.anode === 0 ? A : st.anode === 1 ? B : null;
      const ca = st.anode === 0 ? B : st.anode === 1 ? A : null;
      const nm = (p: Plate) => `${p.metal.name.toLowerCase()} (${p === A ? 'A' : 'B'})`;
      if (st.link === 0) return { tone: 'ok', text: `Circuito aberto: cada placa corrói sozinha, com micropilhas na própria superfície. O voltímetro mede ΔE = ${f2(st.dE)} V. Feche o circuito para formar a pilha.` };
      if (!an || !ca) {
        if (st.link === 2) return { tone: 'warn', text: `A fonte de ${f2(st.Vs)} V ainda não vence a diferença de potencial do par: ${A.metal.name.toLowerCase()} no + é mais nobre que ${B.metal.name.toLowerCase()} no −. Aumente a tensão.` };
        return { tone: 'ok', text: 'Os dois metais são iguais: ΔE = 0, não há anodo nem catodo — o fio não muda nada.' };
      }
      if (ca.h2 > 0.3 * st.I && !st.med.acid)
        return { tone: 'bad', text: `Superproteção: o ${ca.metal.name.toLowerCase()} foi a ${fE(ca.E)} V, abaixo de ${fE(E_OVER)} V, e o catodo passou a gerar H₂ (risco de fragilização por hidrogênio e de descolar a pintura).` };
      if (st.link === 2 && an.metal.kind === 'active')
        return { tone: 'bad', text: `O + da fonte está no ${nm(an)}: ele virou o anodo e corrói ${fk(an.r0 > 0 ? an.r / an.r0 : 1)}× mais rápido. Na proteção por corrente impressa, o + vai no anodo inerte e o − na estrutura.` };
      if (st.med.acid) return { tone: 'warn', text: `No ácido o catodo libera H₂ (2H⁺ + 2e⁻ → H₂): as bolhas saem do ${nm(ca)}, mas quem se dissolve é o ${nm(an)}.` };
      if (an.metal.kind !== 'active')
        return { tone: ca.prot > 0.99 ? 'ok' : 'warn', text: `Corrente impressa: o ${an.metal.name.toLowerCase()} no + não se dissolve (gera gás) e o ${nm(ca)} está ${fmt(ca.prot * 100, 0)} % protegido, a ${fE(ca.E)} V.` };
      const kk = fk(an.r0 > 0 ? an.r / an.r0 : 1);
      const steelProtected = ca.metal === METALS[STEEL] && ca.prot > 0.99;
      if (steelProtected) return { tone: 'ok', text: `O ${nm(an)} se sacrifica (corrói ${kk}× mais) e protege o aço, que foi a ${fE(ca.E)} V — abaixo de ${fE(E_PROT_STEEL)} V.` };
      if (ca.metal === METALS[STEEL]) return { tone: 'warn', text: `O ${nm(an)} protege só ${fmt(ca.prot * 100, 0)} % do aço: o aço ficou a ${fE(ca.E)} V, acima de ${fE(E_PROT_STEEL)} V. ${st.medIdx === 1 ? 'A água doce conduz pouco.' : 'Falta diferença de potencial ou área de anodo.'}` };
      const big = ca.cm2 / an.cm2 >= 5 && an.metal.kind === 'active';
      return {
        tone: an.metal === METALS[STEEL] || big ? 'bad' : 'warn',
        text: `O ${nm(an)} é o anodo: corrói ${kk}× mais que sozinho${big ? ' — catodo grande e anodo pequeno é a pior combinação' : ''}. O ${nm(ca)} virou catodo e está ${fmt(ca.prot * 100, 0)} % protegido.`,
      };
    },
  };
}

