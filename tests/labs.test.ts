/**
 * Bancadas: a física dos modelos e a coerência das tarefas com o modelo.
 * - cada previsão com `expect` precisa acontecer de verdade na simulação;
 * - cada missão começa sem estar cumprida e a `solution` cumpre todas as metas.
 */
import { describe, expect, it } from 'vitest';
import { allTopics } from '../src/learning/content';
import { LAB_IDS, LAB_MODELS } from '../src/learning/labs';
import { COMP, compState, type Stage } from '../src/learning/labs/compressor';
import { BEAM_MATS, beamState, SECTIONS } from '../src/learning/labs/beam';
import { ALPHA0, CH_MATS, chState, E0, PENDULUM } from '../src/learning/labs/charpy';
import { CW_MATS, cwState, dRxOf, seAnn, STRIP, TF_CRIT, trxOf } from '../src/learning/labs/coldwork';
import { cycleState } from '../src/learning/labs/cycle';
import { ACID, cellState, COPPER, DEAER, E_OVER, E_PROT_STEEL, FRESH, GRAPHITE, massFactor, METALS, rateFactor, SEA, STEEL } from '../src/learning/labs/corrosion';
import { exchanger } from '../src/learning/labs/exchanger';
import { FEC, regionOf, Region } from '../src/learning/labs/fec';
import { G as GG, gearState, MODULE } from '../src/learning/labs/gears';
import { K0, R134A, satP, satT, stateFromPh, stateFromPs, stateFromPT, WATER } from '../src/learning/labs/fluids';
import { goalMet, withDefaults } from '../src/learning/labs/model';
import { genFreq, nameplate, POLES, syncRpm } from '../src/learning/labs/motor';
import { GAS } from '../src/learning/labs/piston';
import { G as RG, RAMP_L, rampState, releaseOf, REST, ROLL, ROLL_SLIP, SHAPES, SLIDE } from '../src/learning/labs/ramp';
import { curveStress, energyTo, MATERIALS, OFFSET, SPECIMEN, tensileState, yieldOf } from '../src/learning/labs/tensile';
import { BEARINGS, E_STEEL, ECC, GEAR_D, GEAR_M, journalOf, journalState, oilVisc, PRESSURE, shaftState, SPAN, SY, ZETA } from '../src/learning/labs/shaft';
import { jackState, SPRING_MATS, springOf, springState, wahl } from '../src/learning/labs/spring';
import { rankineState, refrigState } from '../src/learning/labs/vapor';
import { ARRANGEMENTS, energyOf, forced, freeX, modesOf, stepFree, systemOf, UNB, vibState, X0, type FreeSim } from '../src/learning/labs/vibration';
import type { LabGame, LabValues } from '../src/learning/types';

const run = (lab: keyof typeof LAB_MODELS, values: LabValues = {}) => LAB_MODELS[lab].compute(withDefaults(LAB_MODELS[lab], values));

describe('modelos das bancadas', () => {
  it('nunca devolvem NaN/Infinity em qualquer combinação de controles', () => {
    let seed = 12345;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    for (const id of LAB_IDS) {
      const model = LAB_MODELS[id];
      for (let i = 0; i < 400; i++) {
        const v: LabValues = {};
        for (const p of model.params) v[p.id] = p.choices ? Math.floor(rnd() * p.choices.length) : p.min + rnd() * (p.max - p.min);
        const o = model.compute(v);
        for (const out of model.outputs) expect(Number.isFinite(o[out.id]), `${id}.${out.id} com ${JSON.stringify(v)}`).toBe(true);
      }
    }
  });

  it('bomba: estrangular sobe pela curva; afinidade H ∝ n²; água quente derruba o NPSHd', () => {
    const open = run('pump', { valve: 100 });
    const throttled = run('pump', { valve: 30 });
    expect(throttled.Q).toBeLessThan(open.Q);
    expect(throttled.H).toBeGreaterThan(open.H);
    const a = run('pump', { valve: 0, rpm: 1500 });
    const b = run('pump', { valve: 0, rpm: 1800 });
    expect(b.H / a.H).toBeCloseTo(1.44, 2);
    expect(run('pump', { temp: 80 }).npshd).toBeLessThan(run('pump', { temp: 25 }).npshd);
    expect(run('pump', { valve: 0 }).P).toBeLessThan(open.P); // potência mínima em shutoff (radial)
    expect(run('pump', { primed: 0 }).Q).toBe(0);
  });

  it('Venturi: continuidade, Δh ∝ Q² e manômetro diferencial cego à inclinação', () => {
    const o = run('venturi', { Q: 12, d2: 50 });
    expect(o.v2 / o.v1).toBeCloseTo(4, 6);
    expect(run('venturi', { Q: 20 }).dh / run('venturi', { Q: 10 }).dh).toBeCloseTo(4, 6);
    expect(run('venturi', { Q: 12, dz: 2 }).dh).toBeCloseTo(o.dh, 9);
    expect(run('venturi', { Q: 12, real: 0 }).p3).toBeCloseTo(run('venturi', { Q: 12 }).p1, 9);
  });

  it('trocador: balanço de energia, q = U·A·MLDT e contracorrente ≥ paralelo', () => {
    for (const arr of [0, 1]) {
      for (const [mh, mc, area] of [
        [0.3, 0.3, 2],
        [0.2, 0.6, 5],
        [0.9, 0.1, 1],
      ]) {
        const v = withDefaults(LAB_MODELS.exchanger, { arr, mh, mc, area });
        const st = exchanger(v);
        expect(st.ch * (v.thi - st.tho)).toBeCloseTo(st.q, 6);
        expect(st.cc * (st.tco - v.tci)).toBeCloseTo(st.q, 6);
        expect(st.ua * st.lmtd).toBeCloseTo(st.q, 4);
      }
    }
    expect(run('exchanger', { arr: 1 }).q).toBeGreaterThan(run('exchanger', { arr: 0 }).q);
  });

  it('Fe-C: pontos notáveis, regra da alavanca e frações somando 100%', () => {
    expect(run('fec', { c: 0.76, t: 700 }).fPerlita).toBeCloseTo(100, 6);
    expect(run('fec', { c: 0.4, t: 700 }).fPerlita).toBeCloseTo(((0.4 - 0.022) / (0.76 - 0.022)) * 100, 6);
    expect(regionOf(0.4, 800)).toBe(Region.AlphaGamma);
    expect(regionOf(0.4, 900)).toBe(Region.Gamma);
    expect(regionOf(1.2, 800)).toBe(Region.GammaFe3C);
    expect(regionOf(0.4, 600)).toBe(Region.AlphaFe3C);
    expect(regionOf(1.0, 1600)).toBe(Region.L);
    expect(regionOf(2.0, FEC.tEut + 2)).toBe(Region.Gamma);
    expect(regionOf(2.1, FEC.tEut + 2)).toBe(Region.LGamma);
    for (let c = 0; c <= 6.67; c += 0.05) {
      for (let t = 320; t <= 1600; t += 20) {
        const o = run('fec', { c, t });
        const phases = o.fAlpha + o.fGamma + o.fFe3C + o.fL + o.fDelta;
        expect(phases, `fases em ${c} %C, ${t} °C`).toBeCloseTo(100, 6);
        if (t <= 727) {
          const micro = o.fFerritaPro + o.fPerlita + o.fCementitaPro + o.fLedeburita + o.fCemPrim;
          expect(micro, `constituintes em ${c} %C, ${t} °C`).toBeCloseTo(100, 6);
        }
      }
    }
  });

  it('pistão: 1ª lei, adiabático Q = 0, isotérmico Q = W, isobárico W/Q = R/cp e ΔS com o sinal de Q', () => {
    for (const t2 of [-50, 127, 327, 600]) {
      const o = run('piston', { proc: 0, t2 });
      expect(o.P2).toBeCloseTo(100, 9);
      expect(o.W).toBeCloseTo(100 * (o.V2 - 1), 9);
      expect(o.wq).toBeCloseTo((GAS.R / GAS.cp) * 100, 9);
    }
    const isoV = run('piston', { proc: 1, t2: 327 });
    expect(isoV.W).toBe(0);
    expect(isoV.Q).toBeCloseTo(isoV.dU, 9);
    expect(isoV.P2).toBeCloseTo(200, 9);
    const isoT = run('piston', { proc: 2, v2: 2 });
    expect(isoT.dU).toBeCloseTo(0, 9);
    expect(isoT.Q).toBeCloseTo(isoT.W, 9);
    expect(isoT.W).toBeCloseTo(100 * Math.log(2), 9);
    for (const v2 of [0.2, 0.5, 2, 3]) {
      const o = run('piston', { proc: 3, v2 });
      expect(o.Q).toBeCloseTo(0, 9);
      expect(o.dS).toBeCloseTo(0, 9);
      expect(o.T2K).toBeCloseTo(300 * Math.pow(1 / v2, 0.4), 6);
    }
    // politrópico: n = 1 é o isotérmico e n = k é o adiabático
    expect(run('piston', { proc: 4, n: 1, v2: 2 }).W).toBeCloseTo(isoT.W, 9);
    expect(run('piston', { proc: 4, n: 1.4, v2: 0.5 }).Q).toBeCloseTo(0, 9);
    // processos reversíveis: ΔS tem o sinal de Q
    for (const n of [0, 0.5, 1.2, 1.6, 2]) {
      for (const v2 of [0.4, 2]) {
        const o = run('piston', { proc: 4, n, v2 });
        expect(Math.sign(o.dS), `n = ${n}, V₂ = ${v2}`).toBe(Math.sign(o.Q));
      }
    }
  });

  it('ciclos: η de Otto, Diesel e Brayton, balanço de energia, Carnot como teto e regenerador', () => {
    const K = 1.4;
    for (const r of [4, 8, 12, 18, 22]) {
      expect(run('cycle', { cyc: 0, r, t3: 2000 }).eta).toBeCloseTo((1 - 1 / Math.pow(r, K - 1)) * 100, 6);
    }
    for (const [r, t3] of [
      [14, 1400],
      [18, 1800],
      [22, 2000],
    ]) {
      const st = cycleState(withDefaults(LAB_MODELS.cycle, { cyc: 1, r, t3 }));
      expect(st.invalid).toBe(0);
      expect(st.eta).toBeCloseTo(1 - (1 / Math.pow(r, K - 1)) * ((Math.pow(st.rc, K) - 1) / (K * (st.rc - 1))), 9);
      expect(st.eta).toBeLessThan(1 - 1 / Math.pow(r, K - 1)); // mesmo r: Diesel rende menos que o Otto
    }
    for (const rp of [2, 8, 16, 30]) {
      expect(run('cycle', { cyc: 2, rp, t3: 2000, regen: 0 }).eta).toBeCloseTo((1 - 1 / Math.pow(rp, (K - 1) / K)) * 100, 6);
    }
    for (const cyc of [0, 1, 2]) {
      for (const regen of [0, 1]) {
        const st = cycleState(withDefaults(LAB_MODELS.cycle, { cyc, regen, r: 10, rp: 6, t3: 1200 }));
        expect(st.wnet).toBeCloseTo(st.qin - st.qout, 6);
        expect(st.wnet).toBeCloseTo(st.wt - st.wc, 6);
        expect(st.eta).toBeLessThan(st.etaC);
      }
    }
    // regenerador: ajuda com rp baixo (T₄ > T₂) e é inútil com rp alto; com ele, η cai quando rp sobe
    const low = run('cycle', { cyc: 2, rp: 4, t3: 1100, regen: 1 });
    expect(low.regenUseful).toBe(1);
    expect(low.eta).toBeGreaterThan(run('cycle', { cyc: 2, rp: 4, t3: 1100, regen: 0 }).eta);
    expect(run('cycle', { cyc: 2, rp: 8, t3: 1100, regen: 1 }).eta).toBeLessThan(low.eta);
    expect(run('cycle', { cyc: 2, rp: 24, t3: 800, regen: 1 }).regenUseful).toBe(0);
    // T₃ impossível é sinalizado
    expect(run('cycle', { cyc: 0, r: 22, t3: 700 }).invalid).toBe(1);
    expect(run('cycle', { cyc: 1, r: 4, t3: 2000 }).invalid).toBe(2);
  });

  it('tabelas de vapor: coerência, ida e volta e pontos de tabela', () => {
    for (const [f, tmax] of [
      [WATER, 370],
      [R134A, 60],
    ] as const) {
      for (const r of f.sat) if (r[0] <= tmax) expect(Math.abs(((r[6] - r[5]) * (r[0] + K0)) / (r[4] - r[3]) - 1), `${f.name} a ${r[0]} °C`).toBeLessThan(0.004);
    }
    for (const P of [7.5, 10, 75, 1000, 4000, 15000]) expect(satT(WATER, satP(WATER, P).T).P).toBeCloseTo(P, 6);
    expect(satP(WATER, 10).T).toBeCloseTo(45.81, 2);
    expect(satP(WATER, 4000).hg).toBeCloseTo(2800.8, 1);
    expect(satP(R134A, 800).T).toBeCloseTo(31.31, 2);
    // superaquecido: pontos da tabela saem exatos; entre isobaras, perto da tabela (3,5 MPa e 400 °C: 3222,2 e 6,8427)
    expect(stateFromPT(WATER, 3000, 350).h).toBeCloseTo(3116.1, 1);
    expect(stateFromPT(WATER, 4000, 400).s).toBeCloseTo(6.7714, 3);
    expect(stateFromPT(WATER, 15000, 600).h).toBeCloseTo(3583.1, 1);
    expect(Math.abs(stateFromPT(WATER, 3500, 400).h - 3222.2)).toBeLessThan(4);
    expect(Math.abs(stateFromPT(WATER, 3500, 400).s - 6.8427)).toBeLessThan(0.006);
    for (const [P, s] of [
      [2000, 7.0],
      [10, 8.6],
      [500, 7.3],
      [10, 7.0],
    ]) {
      const st = stateFromPs(WATER, P, s);
      expect(stateFromPh(WATER, P, st.h).s).toBeCloseTo(s, 4);
      expect(stateFromPT(WATER, P, st.T).h).toBeCloseTo(st.h, st.phase === 'vap' ? 3 : -9);
    }
  });

  it('Rankine: exemplos clássicos de livro, balanços e os efeitos de cada melhoria', () => {
    const rk = (pb: number, t3: number, pc: number, mod = 0, etat = 100, opts = {}) => rankineState({ cyc: 0, mod, pb, t3, pc, etat, te: 0, tc: 40, cap: 1 }, opts);
    // Çengel: 3 MPa/350 °C/75 kPa → η = 26,0 %; 3 MPa/350 °C/10 kPa → 33,4 % e x = 0,813; 600 °C → 37,3 % e 0,915; 15 MPa/600 °C → 43,0 % e 0,804
    const cases: [number, number, number, number, number][] = [
      [3, 350, 75, 0.26, 0.886],
      [3, 350, 10, 0.334, 0.813],
      [3, 600, 10, 0.373, 0.915],
      [15, 600, 10, 0.43, 0.804],
    ];
    for (const [pb, t3, pc, eta, x] of cases) {
      const st = rk(pb, t3, pc);
      expect(Math.abs(st.eta - eta), `η em ${pb} MPa/${t3} °C/${pc} kPa: ${st.eta}`).toBeLessThan(0.003);
      expect(Math.abs(st.xt - x), `x em ${pb} MPa/${t3} °C/${pc} kPa: ${st.xt}`).toBeLessThan(0.004);
    }
    // reaquecimento a 4 MPa até 600 °C → η = 45,0 % e x₆ = 0,896; aquecedor aberto a 1,2 MPa → y = 0,227 e η = 46,3 %
    const rh = rk(15, 600, 10, 1, 100, { prh: 4000 });
    expect(Math.abs(rh.eta - 0.45)).toBeLessThan(0.003);
    expect(Math.abs(rh.xt - 0.896)).toBeLessThan(0.004);
    const rg = rk(15, 600, 10, 2, 100, { pext: 1200 });
    expect(Math.abs(rg.y - 0.227)).toBeLessThan(0.003);
    expect(Math.abs(rg.eta - 0.463)).toBeLessThan(0.003);
    // balanços e teto de Carnot
    for (const mod of [0, 1, 2]) {
      for (const etat of [100, 80]) {
        for (const [pb, t3, pc] of [
          [1, 250, 100],
          [4, 400, 10],
          [15, 600, 5],
          [10, 300, 10],
        ]) {
          const st = rk(pb, t3, pc, mod, etat);
          expect(st.wnet).toBeCloseTo(st.qin - st.qout, 6);
          expect(st.eta).toBeLessThan(st.etaC);
          expect(st.wp).toBeGreaterThan(0);
          expect(st.wp / st.wt).toBeLessThan(0.02);
        }
      }
    }
    // reaquecer: título sobe muito, η sobe pouco; regenerar: η sobe, título igual e trabalho por kg cai
    const simple = rk(15, 600, 10);
    expect(rk(15, 600, 10, 1).xt).toBeGreaterThan(simple.xt + 0.05);
    expect(rk(15, 600, 10, 1).eta).toBeGreaterThan(simple.eta);
    expect(rk(15, 600, 10, 2).eta).toBeGreaterThan(simple.eta);
    expect(rk(15, 600, 10, 2).xt).toBeCloseTo(simple.xt, 9);
    expect(rk(15, 600, 10, 2).wnet).toBeLessThan(simple.wnet);
    // turbina real: menos trabalho, menos η, vapor mais seco
    const real = rk(4, 400, 10, 0, 85);
    expect(real.wt).toBeLessThan(rk(4, 400, 10).wt);
    expect(real.xt).toBeGreaterThan(rk(4, 400, 10).xt);
    // T₃ abaixo da saturação vira vapor saturado
    expect(rk(15, 300, 10).invalid).toBe(1);
    expect(rk(15, 300, 10).T3).toBeCloseTo(satP(WATER, 15000).T, 6);
  });

  it('refrigeração: exemplo de livro, q_H = q_L + w, COP da bomba de calor = COP + 1 e Carnot como teto', () => {
    // Çengel, ex. 11-1: R-134a entre 0,14 e 0,8 MPa → q_L = 143,7, w = 36,2 kJ/kg, COP = 3,97
    const ex = refrigState({ te: satP(R134A, 140).T, tc: satP(R134A, 800).T, cap: 1 });
    expect(Math.abs(ex.qL - 143.7)).toBeLessThan(0.3);
    expect(Math.abs(ex.wc - 36.2)).toBeLessThan(0.4);
    expect(Math.abs(ex.cop - 3.97)).toBeLessThan(0.05);
    for (const [te, tc] of [
      [-30, 60],
      [-10, 40],
      [10, 20],
    ]) {
      const st = refrigState({ te, tc, cap: 10 });
      expect(st.qH).toBeCloseTo(st.qL + st.wc, 9);
      expect(st.copHP).toBeCloseTo(st.cop + 1, 9);
      expect(st.cop).toBeLessThan(st.copC);
      expect(st.xv).toBeGreaterThan(0);
      expect(st.xv).toBeLessThan(1);
      expect(st.T2).toBeGreaterThan(tc);
      expect(st.mdot * st.qL).toBeCloseTo(10 * 3.517, 9);
    }
    // evaporar mais quente ou condensar mais frio sobe o COP
    expect(refrigState({ te: 0, tc: 40, cap: 1 }).cop).toBeGreaterThan(refrigState({ te: -20, tc: 40, cap: 1 }).cop);
    expect(refrigState({ te: -10, tc: 30, cap: 1 }).cop).toBeGreaterThan(refrigState({ te: -10, tc: 50, cap: 1 }).cop);
  });

  it('compressor: ηᵥ da fórmula, área do P–V = trabalho, espaço morto não muda w e 2 estágios com Pᵢ ótima', () => {
    const cs = (p2: number, c: number, n: number, stages = 0) => compState({ p2, c, n, stages });
    // ηᵥ = 1 + c − c·(P₂/P₁)^(1/n); exemplo: c = 5 %, 100 → 700 kPa, n = 1,3 → 82,7 %
    expect(run('compressor', { p2: 700, c: 5, n: 1.3 }).etav).toBeCloseTo(82.66, 1);
    for (const [p2, c, n] of [
      [300, 2, 1],
      [800, 8, 1.25],
      [1600, 4, 1.4],
    ]) {
      expect(cs(p2, c, n).etav).toBeCloseTo(1 + c / 100 - (c / 100) * Math.pow(p2 / 100, 1 / n), 9);
    }
    // área do ciclo (fórmula de Gauss no P–V, kPa·L = J) = trabalho por volta
    const loopArea = (s: Stage, n: number) => {
      const [p1, p2, p3, p4] = s.pts;
      const poly: [number, number][] = [];
      const N = 400;
      for (let i = 0; i <= N; i++) {
        const V = p1.V + ((p2.V - p1.V) * i) / N;
        poly.push([V, p1.P * Math.pow(p1.V / V, n)]);
      }
      for (let i = 0; i <= N; i++) {
        const V = p3.V + ((p4.V - p3.V) * i) / N;
        poly.push([V, p3.P * Math.pow(p3.V / V, n)]);
      }
      let a = 0;
      poly.forEach(([x, y], i) => {
        const [x2, y2] = poly[(i + 1) % poly.length];
        a += x * y2 - x2 * y;
      });
      return Math.abs(a) / 2 / 1000;
    };
    for (const stages of [0, 1]) {
      for (const [p2, c, n] of [
        [700, 5, 1.3],
        [1200, 10, 1.2],
        [400, 15, 1.4],
      ]) {
        const st = cs(p2, c, n, stages);
        for (const s of st.stages) expect(loopArea(s, n) / s.W).toBeCloseTo(1, 3);
        expect(st.power).toBeCloseTo(st.mdot * st.w, 9);
        expect(st.fad).toBeCloseTo((st.etav * COMP.Vd * COMP.rpm) / 1000, 9);
      }
    }
    // espaço morto: menos vazão, mesmo trabalho por kg e mesma descarga
    const c0 = run('compressor', { p2: 700, c: 0 });
    const c15 = run('compressor', { p2: 700, c: 15 });
    expect(c0.etav).toBeCloseTo(100, 9);
    expect(c15.fad).toBeLessThan(c0.fad);
    expect(c15.w).toBeCloseTo(c0.w, 9);
    expect(c15.T2).toBeCloseTo(c0.T2, 9);
    // razão máxima (1 + 1/c)ⁿ: acima dela não entra ar
    const rmax = Math.pow(1 + 1 / 0.2, 1.3);
    expect(run('compressor', { p2: 1000, c: 20, n: 1.3 }).rmax).toBeCloseTo(rmax, 9);
    expect(run('compressor', { p2: 1000, c: 20, n: 1.3 }).etav).toBeGreaterThan(0);
    const dead = run('compressor', { p2: 1200, c: 20, n: 1.3 });
    expect(dead.etav).toBe(0);
    expect(dead.fad).toBe(0);
    expect(dead.Pw).toBe(0);
    // T₂ = T₁·r^((n−1)/n); isotérmico: rendimento isotérmico de 100 %
    expect(run('compressor', { p2: 800, n: 1.4 }).T2 + COMP.K0).toBeCloseTo(300 * Math.pow(8, 0.4 / 1.4), 9);
    expect(run('compressor', { p2: 800, n: 1 }).etaiso).toBeCloseTo(100, 9);
    expect(run('compressor', { p2: 800, n: 1.4 }).etaiso).toBeLessThan(run('compressor', { p2: 800, n: 1.2 }).etaiso);
    // 2 estágios: Pᵢ = √(P₁·P₂), trabalhos e descargas iguais, menos trabalho que 1 estágio
    for (const n of [1.2, 1.3, 1.4]) {
      const two = cs(900, 6, n, 1);
      expect(two.Pi).toBeCloseTo(300, 9);
      expect(two.stages[1].W).toBeCloseTo(two.stages[0].W, 9);
      expect(two.stages[1].T2).toBeCloseTo(two.stages[0].T2, 9);
      expect(two.stages[1].pts[0].P * two.stages[1].pts[0].V).toBeCloseTo(two.stages[0].pts[0].P * two.stages[0].pts[0].V, 9); // mesma isoterma
      expect(two.w).toBeLessThan(two.w1);
      expect(two.T2).toBeLessThan(cs(900, 6, n).T2);
      expect(two.etav).toBeGreaterThan(cs(900, 6, n).etav);
    }
    // com compressão isotérmica, dividir em estágios não economiza nada
    expect(cs(900, 6, 1, 1).w).toBeCloseTo(cs(900, 6, 1).w, 9);
  });

  it('tração: Hooke, escoamento a 0,2 %, máximo em σr, descarga paralela, ruptura e energia', () => {
    const ts = (mat: number, eps: number, unload = 0) => tensileState({ mat, eps, unload });
    const [aco, tr, al, ff] = [0, 1, 2, 3];
    // reta de Hooke e σ = F/A₀
    for (const mat of [aco, tr, al]) {
      const st = ts(mat, 0.1);
      expect(st.s).toBeCloseTo(MATERIALS[mat].E * 0.001, 9);
      expect(st.F).toBeCloseTo((st.s * SPECIMEN.A0) / 1000, 9);
      expect(st.ep).toBe(0);
    }
    // mesmo E nos dois aços: mesma tensão na mesma deformação elástica; alumínio = 0,35 × aço
    expect(ts(tr, 0.12).s).toBeCloseTo(ts(aco, 0.12).s, 9);
    expect(ts(al, 0.12).s / ts(aco, 0.12).s).toBeCloseTo(0.35, 9);
    // escoamento convencional perto do nominal (no 1020, o próprio patamar)
    expect(yieldOf(aco).s).toBeCloseTo(250, 6);
    expect(Math.abs(yieldOf(tr).s - 700)).toBeLessThan(15);
    expect(Math.abs(yieldOf(al).s - 275)).toBeLessThan(5);
    for (const mat of [aco, tr, al]) {
      const y = yieldOf(mat);
      expect(y.s).toBeCloseTo(MATERIALS[mat].E * (y.e - OFFSET), 3);
    }
    // joelho suave: sai da reta com a inclinação E
    for (const mat of [tr, al]) {
      const m = MATERIALS[mat];
      const e1 = m.sp / m.E;
      const h = 1e-7;
      expect((curveStress(m, e1 + h) - curveStress(m, e1)) / h / m.E).toBeCloseTo(1, 2);
    }
    // σr é o máximo da curva, atingido em εu
    for (const m of MATERIALS) {
      let top = 0;
      for (let i = 0; i <= 4000; i++) top = Math.max(top, curveStress(m, (m.ef * i) / 4000));
      expect(top).toBeCloseTo(m.sr, 3);
      expect(curveStress(m, m.eu)).toBeCloseTo(m.sr, 3);
    }
    // descarga: volta paralela à reta elástica e sobra ε − σ/E; recarregar devolve a tensão
    for (const [mat, eps] of [
      [aco, 1],
      [aco, 10],
      [tr, 4],
      [al, 9],
    ]) {
      const on = ts(mat, eps);
      const off = ts(mat, eps, 1);
      expect(off.s).toBe(0);
      expect(off.ep).toBeCloseTo(eps / 100 - on.s / MATERIALS[mat].E, 12);
      expect(on.ep).toBeCloseTo(off.ep, 12);
      expect(off.dL).toBeCloseTo(off.ep * SPECIMEN.L0, 12);
      expect(off.U).toBeCloseTo(on.U - (on.s * on.s) / (2 * MATERIALS[mat].E), 9);
    }
    // ruptura: força zero, alongamento ε_f − σ_f/E, estricção; o frágil quase não deforma
    for (const m of MATERIALS) {
      const idx = MATERIALS.indexOf(m);
      const st = ts(idx, m.ef * 100 + 0.01);
      expect(st.broken).toBe(true);
      expect(st.F).toBe(0);
      expect(st.along).toBeCloseTo(m.ef - m.sf / m.E, 12);
      expect(st.U).toBeCloseTo(st.Ut, 9);
      expect(st.A).toBeCloseTo(m.brittle ? SPECIMEN.A0 / (1 + st.along) : SPECIMEN.A0 * (1 - m.ra), 9);
    }
    expect(ts(ff, 0.3).broken).toBe(false);
    expect(ts(ff, 0.46).broken).toBe(true);
    expect(ts(ff, 1).along).toBeLessThan(0.005);
    // tensão verdadeira maior que a de engenharia e subindo no pescoço, enquanto a força cai
    let lastSv = 0;
    let lastF = Infinity;
    for (let eps = 20.5; eps < 32; eps += 0.5) {
      const st = ts(aco, eps);
      expect(st.sv).toBeGreaterThan(st.s);
      expect(st.sv).toBeGreaterThan(lastSv);
      expect(st.F).toBeLessThan(lastF);
      lastSv = st.sv;
      lastF = st.F;
    }
    // energia: área sob a curva; resiliência σe²/2E (o alumínio guarda mais que o aço 1020)
    expect(energyTo(aco, 0.001)).toBeCloseTo((200_000 * 0.001 ** 2) / 2, 4);
    expect(ts(aco, 0.5).Ur).toBeCloseTo(250 ** 2 / 400_000, 9);
    expect(ts(al, 0).Ur).toBeGreaterThan(3 * ts(aco, 0).Ur);
    expect(ts(aco, 0).Ut).toBeGreaterThan(ts(al, 0).Ut);
    expect(ts(aco, 0).Ut).toBeGreaterThan(100 * ts(ff, 0).Ut);
    for (let eps = 0.05; eps < 31; eps *= 1.6) expect(ts(aco, Math.min(31.9, eps * 1.6)).U).toBeGreaterThan(ts(aco, eps).U);
  });

  it('viga: equilíbrio, dM/dx = V, EI·y" = −M, apoios, casos de tabela e propriedades da seção', () => {
    const bs = (v: Record<string, number>) => beamState({ sup: 0, load: 0, P: 10, a: 50, w: 5, L: 4, sec: 0, mat: 0, ...v });
    // propriedades das seções: retângulo b·h³/12 (em pé / deitado = 4), redonda π·d⁴/64, perfil I por Steiner
    expect(SECTIONS[0].I / 1e4).toBeCloseTo(864, 9);
    expect(SECTIONS[0].I / SECTIONS[0].c / 1e3).toBeCloseTo(144, 9);
    expect(SECTIONS[1].I / 1e4).toBeCloseTo(216, 9);
    expect(SECTIONS[3].I).toBeCloseTo((Math.PI * 100 ** 4) / 64, 6);
    const flange = (100 * 10 ** 3) / 12 + 100 * 10 * 70 ** 2;
    expect(SECTIONS[2].I).toBeCloseTo(2 * flange + (6 * 130 ** 3) / 12, 6);
    const loadCases: Record<string, number>[] = [
      { sup: 0, load: 0, a: 50 },
      { sup: 0, load: 0, a: 20 },
      { sup: 0, load: 0, a: 85 },
      { sup: 0, load: 1 },
      { sup: 1, load: 0, a: 100 },
      { sup: 1, load: 0, a: 40 },
      { sup: 1, load: 1 },
    ];
    for (const cases of loadCases) {
      for (const L of [2, 3.5, 6]) {
        const st = bs({ ...cases, L });
        const where = `${JSON.stringify(cases)} L = ${L}`;
        const total = st.dist ? st.w * L : st.P;
        // equilíbrio de forças e de momentos em torno de A
        expect(st.RA + st.RB, where).toBeCloseTo(total, 9);
        const momentLoads = st.dist ? (st.w * L * L) / 2 : st.P * st.a;
        expect(st.cant ? st.MA : st.RB * L, where).toBeCloseTo(momentLoads, 9);
        // dM/dx = V e E·I·y" = −M (longe da carga concentrada)
        const h = 1e-4;
        for (const f of [0.13, 0.37, 0.61, 0.9]) {
          const x = f * L;
          if (!st.dist && Math.abs(x - st.a) < 0.01) continue;
          expect((st.M(x + h) - st.M(x - h)) / (2 * h), `${where} dM/dx em ${x}`).toBeCloseTo(st.V(x), 4);
          const curv = (st.y(x + h) - 2 * st.y(x) + st.y(x - h)) / (h * h) / 1000;
          expect((curv * st.EI) / 1000, `${where} EI·y" em ${x}`).toBeCloseTo(-st.M(x), 2);
        }
        // apoios: biapoiada y(0) = y(L) = 0; engaste y(0) = 0 e y'(0) = 0
        expect(st.y(0)).toBeCloseTo(0, 12);
        if (st.cant) expect((st.y(h) - st.y(0)) / h / 1000).toBeCloseTo(0, 5);
        else expect(st.y(L)).toBeCloseTo(0, 9);
        // máximos coerentes com o desenho
        let top = 0;
        let topM = 0;
        for (let i = 0; i <= 600; i++) {
          top = Math.max(top, st.y((L * i) / 600));
          topM = Math.max(topM, Math.abs(st.M((L * i) / 600)));
        }
        expect(st.ymax, where).toBeGreaterThanOrEqual(top - 1e-9);
        expect(st.ymax, where).toBeCloseTo(top, 3);
        expect(st.Mmax, where).toBeCloseTo(topM, 6);
        expect(st.y(st.xy), where).toBeCloseTo(st.ymax, 9);
      }
    }
    // casos de tabela: PL/4, wL²/8, PL, wL²/2 e as flechas PL³/48EI, 5wL⁴/384EI, PL³/3EI, wL⁴/8EI
    const EI = 200e9 * 864e4 * 1e-12;
    const mid = bs({});
    expect(mid.Mmax).toBeCloseTo((10 * 4) / 4, 9);
    expect(mid.ymax).toBeCloseTo(((10e3 * 4 ** 3) / (48 * EI)) * 1000, 9);
    const dist = bs({ load: 1 });
    expect(dist.Mmax).toBeCloseTo((5 * 16) / 8, 9);
    expect(dist.ymax).toBeCloseTo(((5 * 5e3 * 4 ** 4) / (384 * EI)) * 1000, 9);
    const tip = bs({ sup: 1, a: 100 });
    expect(tip.Mmax).toBeCloseTo(40, 9);
    expect(tip.ymax).toBeCloseTo(((10e3 * 4 ** 3) / (3 * EI)) * 1000, 9);
    const cdist = bs({ sup: 1, load: 1 });
    expect(cdist.Mmax).toBeCloseTo(40, 9);
    expect(cdist.ymax).toBeCloseTo(((5e3 * 4 ** 4) / (8 * EI)) * 1000, 9);
    // σ = M/W (10 kN·m em 144 cm³ = 69,4 MPa); τ do retângulo = 1,5·V/A
    expect(mid.sig).toBeCloseTo(10e6 / 144e3, 9);
    expect(mid.tau).toBeCloseTo((1.5 * 5000) / 7200, 9);
    // material: mesma tensão, flecha na razão dos módulos; deitar: σ × 2 e flecha × 4
    const al = bs({ mat: 1 });
    expect(al.sig).toBeCloseTo(mid.sig, 9);
    expect(al.ymax / mid.ymax).toBeCloseTo(BEAM_MATS[0].E / BEAM_MATS[1].E, 9);
    const flat = bs({ sec: 1 });
    expect(flat.sig / mid.sig).toBeCloseTo(2, 9);
    expect(flat.ymax / mid.ymax).toBeCloseTo(4, 9);
    // vão em dobro: flecha × 8 (concentrada) e × 16 (distribuída)
    expect(bs({ L: 6 }).ymax / bs({ L: 3 }).ymax).toBeCloseTo(8, 9);
    expect(bs({ L: 6, load: 1 }).ymax / bs({ L: 3, load: 1 }).ymax).toBeCloseTo(16, 9);
    // carga sobre o apoio não flete
    expect(bs({ a: 0 }).Mmax).toBe(0);
    expect(bs({ a: 0 }).FS).toBeCloseTo(99.9, 9);
  });
});

describe('bancadas de materiais', () => {
  it('encruamento: TF sobe σe e derruba o alongamento; recristalização, Hall-Petch, crescimento de grão e laminação a quente', () => {
    CW_MATS.forEach((m, mat) => {
      let prev = cwState({ mat, cw: 0 });
      // recebido = recozido, com o grão de partida (Hall-Petch)
      expect(prev.se).toBeCloseTo(seAnn(m, m.d0), 9);
      expect(prev.F).toBe(0);
      for (let cw = 5; cw <= 70; cw += 5) {
        const s = cwState({ mat, cw });
        expect(s.se, `${m.short} ${cw} %`).toBeGreaterThan(prev.se);
        expect(s.sr, `${m.short} ${cw} %: σr > σe`).toBeGreaterThan(s.se);
        expect(s.el).toBeLessThan(prev.el);
        expect(s.hv).toBeGreaterThan(prev.hv);
        expect(s.rho).toBeGreaterThan(prev.rho);
        expect(s.h).toBeCloseTo(STRIP.h0 * (1 - cw / 100), 9);
        expect(s.res).toBe(100);
        expect(s.X).toBe(0);
        // força de laminação: F = 1,15·σ̄·w·√(R·Δh)
        expect(s.F).toBeCloseTo((1.15 * s.sMean * STRIP.w * Math.sqrt(STRIP.R * (STRIP.h0 - s.h))) / 1000, 6);
        if (cw - 5 >= TF_CRIT) {
          // mais trabalho a frio: recristaliza mais cedo e com grão mais fino
          expect(trxOf(m, cw)).toBeLessThan(trxOf(m, cw - 5));
          expect(dRxOf(m, cw)).toBeLessThan(dRxOf(m, cw - 5));
        }
        prev = s;
      }
      // regra de bolso: T_rx entre 0,3 e 0,6 da temperatura de fusão em kelvin
      for (const cw of [20, 50, 70]) {
        const ratio = (trxOf(m, cw) + 273) / (m.Tf + 273);
        expect(ratio, `${m.short} ${cw} %`).toBeGreaterThan(0.3);
        expect(ratio, `${m.short} ${cw} %`).toBeLessThan(0.6);
      }
      // recozimento: X cresce com T, vale 95 % em T_rx; σe só cai; tensões residuais somem antes da recristalização
      const trx = trxOf(m, 50);
      expect(cwState({ mat, cw: 50, ta: trx }).X).toBeCloseTo(0.95, 6);
      let last = cwState({ mat, cw: 50, ta: 25 });
      for (let ta = 30; ta <= 700; ta += 5) {
        const s = cwState({ mat, cw: 50, ta });
        expect(s.X).toBeGreaterThanOrEqual(last.X);
        expect(s.se).toBeLessThanOrEqual(last.se + 1e-9);
        expect(s.el).toBeGreaterThanOrEqual(last.el - 1e-9);
        last = s;
      }
      const relieved = cwState({ mat, cw: 50, ta: trx - 100 });
      expect(relieved.res, `${m.short}: alívio de tensões antes de recristalizar`).toBeLessThan(30);
      expect(relieved.X).toBeLessThan(0.05);
      // recristalizado por completo: grão novo e Hall-Petch; depois o grão cresce e σe cai
      const done = cwState({ mat, cw: 50, ta: trx + 30 });
      expect(done.dNew).toBeCloseTo(dRxOf(m, 50), 9);
      const hotter = cwState({ mat, cw: 50, ta: 700 });
      expect(hotter.dNew).toBeGreaterThan(done.dNew);
      expect(hotter.se).toBeCloseTo(seAnn(m, hotter.dNew), 1);
      expect(hotter.el).toBeCloseTo(m.el, 3);
      // abaixo do TF crítico não recristaliza, nem a 700 °C
      expect(cwState({ mat, cw: TF_CRIT - 1, ta: 700 }).X).toBe(0);
      // a quente: sem encruamento (σe = Hall-Petch do grão) e com muito menos força
      const hot = cwState({ mat, cw: 50, proc: 1 });
      expect(hot.se).toBeCloseTo(seAnn(m, hot.d), 9);
      expect(hot.el).toBe(m.el);
      expect(hot.F).toBeLessThan(cwState({ mat, cw: 50 }).F / 2);
      expect(hot.res).toBe(0);
    });
  });

  it('Charpy: E = m·g·(h₀ − h_f), transição nos aços, CFC sem transição, carbono e grão', () => {
    const { m, g, h0, L } = PENDULUM;
    expect(E0).toBeCloseTo(m * g * h0, 9);
    expect(1 - Math.cos(ALPHA0)).toBeCloseTo(h0 / L, 9);
    CH_MATS.forEach((mat, idx) => {
      for (const grain of mat.steel ? [0, 1] : [0]) {
        let prevE = -Infinity;
        for (let T = -120; T <= 120; T += 10) {
          const s = chState({ mat: idx, grain, T });
          // conservação de energia: o que o corpo de prova absorve sai da altura do martelo
          expect(s.E + m * g * s.hf).toBeCloseTo(E0, 9);
          expect(s.E).toBeGreaterThan(0);
          expect(s.E).toBeLessThan(E0 * 0.8);
          expect(L * (1 - Math.cos(s.beta))).toBeCloseTo(s.hf, 9);
          expect(s.E).toBeGreaterThan(prevE);
          prevE = s.E;
          if (!mat.steel) expect(s.shear).toBe(100);
        }
        if (mat.steel) {
          const s = chState({ mat: idx, grain, T: 0 });
          const up = chState({ mat: idx, grain, T: 400 }).E;
          const low = chState({ mat: idx, grain, T: -400 }).E;
          expect(chState({ mat: idx, grain, T: s.tt }).E).toBeCloseTo((up + low) / 2, 6);
          expect(chState({ mat: idx, grain, T: s.tt }).shear).toBeCloseTo(50, 6);
          expect(chState({ mat: idx, grain, T: s.t27 }).E).toBeCloseTo(27, 6);
          expect(chState({ mat: idx, grain, T: -120 }).mode).toBe('brittle');
        } else {
          // CFC: sem transição, a energia muda pouco
          const lo = chState({ mat: idx, T: -120 }).E;
          const hi = chState({ mat: idx, T: 120 }).E;
          expect(hi / lo).toBeLessThan(1.4);
          expect(chState({ mat: idx, T: -120 }).mode).toBe('ductile');
        }
      }
    });
    // mais carbono: patamar superior menor e transição mais alta; grão fino: transição mais baixa
    const c2 = chState({ mat: 0, T: 0 });
    const c6 = chState({ mat: 1, T: 0 });
    expect(c6.tt).toBeGreaterThan(c2.tt);
    expect(chState({ mat: 1, T: 200 }).E).toBeLessThan(chState({ mat: 0, T: 200 }).E);
    for (const mat of [0, 1]) {
      expect(chState({ mat, grain: 1, T: 0 }).tt).toBeLessThan(chState({ mat, grain: 0, T: 0 }).tt);
      expect(chState({ mat, grain: 1, T: -20 }).E).toBeGreaterThan(chState({ mat, grain: 0, T: -20 }).E);
    }
  });
});

describe('bancada de vibrações', () => {
  const V = (v: LabValues = {}) => vibState(withDefaults(LAB_MODELS.vibration, v));
  const wOf = (rpm: number) => (rpm * 2 * Math.PI) / 60;

  it('1 grau: k equivalente, ω_n = √(k/m), deflexão estática e regimes de amortecimento', () => {
    const k = 60;
    expect(V({ arr: 0, k }).keq).toBeCloseTo(60e3, 6);
    expect(V({ arr: 1, k }).keq).toBeCloseTo(120e3, 6);
    expect(V({ arr: 2, k }).keq).toBeCloseTo(240e3, 6);
    expect(V({ arr: 3, k }).keq).toBeCloseTo(30e3, 6); // série: 1/keq = 1/k + 1/k
    expect(ARRANGEMENTS).toHaveLength(4);
    const s = V({ m: 40, arr: 2, k: 100 });
    expect(s.wn).toBeCloseTo(Math.sqrt(400e3 / 40), 9);
    expect(s.ncrit).toBeCloseTo((s.wn * 60) / (2 * Math.PI), 9);
    expect(s.wn).toBeCloseTo(Math.sqrt(9.81 / s.dst), 9); // ω_n = √(g/δ_st)
    expect(V({ zeta: 0 }).regime).toBe(0);
    expect(V({ zeta: 0.3 }).regime).toBe(1);
    expect(V({ zeta: 1 }).regime).toBe(2);
    expect(V({ zeta: 1.3 }).regime).toBe(3);
    expect(V({ zeta: 0.3 }).c).toBeCloseTo(0.3 * 2 * Math.sqrt(V({ zeta: 0.3 }).keq * 50), 9);
  });

  it('vibração livre: integração bate com a solução exata, δ = ln(x₁/x₂) e energia conservada sem amortecimento', () => {
    for (const zeta of [0, 0.05, 0.3, 1, 1.5]) {
      const s = systemOf(withDefaults(LAB_MODELS.vibration, { zeta, abs: 0 }));
      const h = (2 * Math.PI) / s.wn / 400;
      let y: FreeSim = { x1: -X0, v1: 0, x2: -X0, v2: 0 };
      for (let i = 1; i <= 2400; i++) {
        y = stepFree(s, y, h);
        expect(y.x1).toBeCloseTo(freeX(zeta, s.wn, -X0, i * h), 9);
      }
      if (zeta >= 1) for (let t = 0; t < 2; t += 0.01) expect(freeX(zeta, s.wn, -X0, t)).toBeLessThanOrEqual(1e-15); // não cruza o equilíbrio
    }
    const st = V({ zeta: 0.1 });
    expect(Math.log(freeX(0.1, st.wn, X0, 0) / freeX(0.1, st.wn, X0, st.Td))).toBeCloseTo(st.dec, 9);
    for (const abs of [0, 1]) {
      const s = systemOf(withDefaults(LAB_MODELS.vibration, { zeta: 0, abs }));
      let y: FreeSim = { x1: X0, v1: 0, x2: 0, v2: 0 };
      const e0 = energyOf(s, y);
      for (let i = 0; i < 20000; i++) y = stepFree(s, y, 2e-4);
      expect(energyOf(s, y) / e0).toBeCloseTo(1, 5);
    }
  });

  it('forçada: ressonância X = (F₀/k)/(2ζ) com 90° de fase, T_R = 1 em r = √2 e X → m·e/m em alta rotação', () => {
    for (const zeta of [0.02, 0.05, 0.3]) {
      const s = V({ zeta });
      const r1 = forced(s, s.wn);
      expect(r1.X).toBeCloseTo(r1.F0 / s.keq / (2 * zeta), 12);
      expect((r1.phase * 180) / Math.PI).toBeCloseTo(90, 9);
      const rq = forced(s, Math.SQRT2 * s.wn);
      expect(rq.FT / rq.F0).toBeCloseTo(1, 9);
      const above = forced(s, 2.5 * s.wn);
      expect(above.FT / above.F0).toBeLessThan(1);
      const below = forced(s, 0.8 * s.wn);
      expect(below.FT / below.F0).toBeGreaterThan(1);
    }
    const s = V({ zeta: 0.05 });
    expect(forced(s, 50 * s.wn).X).toBeCloseTo(UNB / s.m, 6);
    // isolamento: mais amortecimento piora acima de √2 e melhora na ressonância
    expect(forced(V({ zeta: 0.5 }), 3 * s.wn).FT).toBeGreaterThan(forced(V({ zeta: 0.05 }), 3 * s.wn).FT);
    expect(forced(V({ zeta: 0.5 }), s.wn).X).toBeLessThan(forced(V({ zeta: 0.05 }), s.wn).X);
    // amplitude máxima perto de r = 1
    let best = 0;
    let bestRpm = 0;
    for (let n = 10; n <= 3000; n += 1) {
      const X = forced(s, wOf(n)).X;
      if (X > best) {
        best = X;
        bestRpm = n;
      }
    }
    expect(Math.abs(bestRpm - s.ncrit) / s.ncrit).toBeLessThan(0.01);
  });

  it('absorvedor: motor parado na sintonia, X_a = F₀/k_a e duas frequências naturais em volta', () => {
    for (const na of [500, 600, 1200, 2000]) {
      const s = V({ abs: 1, na, rpm: na });
      expect(s.resp.X).toBeLessThan(1e-12);
      expect(s.resp.Xa).toBeCloseTo(s.resp.F0 / s.ka, 12);
      const lo = Math.min(s.ncrit, na);
      const hi = Math.max(s.ncrit, na);
      expect(s.n1).toBeLessThan(lo);
      expect(s.n2).toBeGreaterThan(hi);
      const md = modesOf(s);
      expect(md.a1).toBeGreaterThan(0); // 1º modo: em fase
      expect(md.a2).toBeLessThan(0); // 2º modo: em oposição
      // det([K] − ω²[M]) = 0 nas duas frequências
      for (const w of [md.w1, md.w2]) {
        const det = (s.keq + s.ka - s.m * w * w) * (s.ka - s.ma * w * w) - s.ka * s.ka;
        expect(Math.abs(det) / (s.keq * s.ka)).toBeLessThan(1e-9);
      }
      // solto na forma de um modo (sem amortecimento), a razão entre as amplitudes não muda
      const s0 = systemOf(withDefaults(LAB_MODELS.vibration, { abs: 1, na, zeta: 0 }));
      const m0 = modesOf(s0);
      for (const a of [m0.a1, m0.a2]) {
        let y: FreeSim = { x1: 1e-3, v1: 0, x2: 1e-3 * a, v2: 0 };
        const h = (2 * Math.PI) / m0.w2 / 200;
        for (let i = 0; i < 4000; i++) {
          y = stepFree(s0, y, h);
          if (Math.abs(y.x1) > 2e-4) expect(y.x2 / y.x1).toBeCloseTo(a, 6);
        }
      }
    }
    // frequências naturais não dependem da rotação (excitação)
    expect(V({ abs: 1, rpm: 300 }).n1).toBeCloseTo(V({ abs: 1, rpm: 2500 }).n1, 12);
  });
});

describe('bancadas de dinâmica', () => {
  const R = (v: LabValues = {}) => rampState(withDefaults(LAB_MODELS.ramp, v));
  const Gs = (v: LabValues = {}) => gearState(withDefaults(LAB_MODELS.gears, v));
  const rad = (d: number) => (d * Math.PI) / 180;

  it('rampa (caixa): N e P∥, atrito estático "só o necessário", ângulo de repouso e atrito cinético', () => {
    const s = R({ body: 0, theta: 25, m: 30, mus: 0.6, muk: 0.4, F: 0 });
    expect(s.N).toBeCloseTo(30 * RG * Math.cos(rad(25)), 9);
    expect(s.Pt).toBeCloseTo(30 * RG * Math.sin(rad(25)), 9);
    expect(s.regime).toBe(REST);
    expect(s.f).toBeCloseTo(s.Pt, 9); // vale P·sen θ, não μe·N
    expect(s.f).toBeLessThan(s.fmax);
    // repouso até tg θ = μe, para qualquer massa
    const lim = (Math.atan(0.5) * 180) / Math.PI;
    for (const m of [2, 40, 400]) {
      expect(R({ body: 0, theta: Math.floor(lim), m, mus: 0.5, muk: 0.3 }).regime).toBe(REST);
      expect(R({ body: 0, theta: Math.ceil(lim), m, mus: 0.5, muk: 0.3 }).regime).toBe(SLIDE);
    }
    expect(R({ mus: 0.5 }).thRep).toBeCloseTo(lim, 9);
    // piso plano puxado: abaixo de μe·N não sai do lugar; acima, a = (F − μc·N)/m
    const parado = R({ body: 0, theta: 0, m: 50, mus: 0.5, muk: 0.4, F: 240 });
    expect(parado.a).toBe(0);
    expect(parado.f).toBeCloseTo(240, 9);
    const anda = R({ body: 0, theta: 0, m: 50, mus: 0.5, muk: 0.4, F: 300 });
    expect(anda.a).toBeCloseTo((300 - 0.4 * 500) / 50, 9);
    expect(anda.dir).toBe(-1);
    // descendo sem F: a = g(sen θ − μc·cos θ), independe da massa
    const d1 = R({ body: 0, theta: 40, m: 5, mus: 0.4, muk: 0.25 });
    const d2 = R({ body: 0, theta: 40, m: 500, mus: 0.4, muk: 0.25 });
    expect(d1.a).toBeCloseTo(RG * (Math.sin(rad(40)) - 0.25 * Math.cos(rad(40))), 9);
    expect(d2.a).toBeCloseTo(d1.a, 9);
    // faixa de F em que fica parada; fora dela, sobe ou desce
    const base = { body: 0, theta: 35, m: 20, mus: 0.4, muk: 0.3 };
    const b0 = R(base);
    expect(b0.Fhold).toBeCloseTo(b0.Pt - b0.fmax, 9);
    expect(b0.Fpush).toBeCloseTo(b0.Pt + b0.fmax, 9);
    expect(R({ ...base, F: Math.ceil(b0.Fhold) }).regime).toBe(REST);
    expect(R({ ...base, F: Math.floor(b0.Fpush) }).regime).toBe(REST);
    expect(R({ ...base, F: Math.floor(b0.Fhold) - 1 }).dir).toBe(1);
    expect(R({ ...base, F: Math.ceil(b0.Fpush) + 1 }).dir).toBe(-1);
    const sobe = R({ ...base, F: 220 });
    expect(sobe.a).toBeCloseTo((220 - sobe.Pt - 0.3 * sobe.N) / 20, 9);
    // μc > μe não é físico: a conta usa μc = μe
    expect(R({ body: 0, theta: 45, mus: 0.3, muk: 0.8 }).a).toBeCloseTo(R({ body: 0, theta: 45, mus: 0.3, muk: 0.3 }).a, 12);
  });

  it('rampa (rolamento): a = g·sen θ/(1+β), corrida esfera > cilindro > aro, energia e o limite de escorregar', () => {
    const betas = [1, 0.5, 0.4];
    for (const [k, beta] of betas.entries()) {
      const s = R({ body: k + 1, theta: 30, mus: 0.9, muk: 0.5, m: 12, r: 0.3 });
      expect(SHAPES[k + 1].beta).toBe(beta);
      expect(s.regime).toBe(ROLL);
      expect(s.a).toBeCloseTo((RG * 0.5) / (1 + beta), 9);
      expect(s.alpha).toBeCloseTo(s.a / 0.3, 9);
      expect(s.f).toBeCloseTo(s.m * s.a * beta, 9); // f·r = I·α
      // energia: m·g·h = ½·m·v² + ½·I·ω² ao fim de RAMP_L
      const h = RAMP_L * Math.sin(rad(30));
      const w = s.v / 0.3;
      expect(12 * RG * h).toBeCloseTo(0.5 * 12 * s.v * s.v + 0.5 * s.I * w * w, 9);
      expect(s.erot).toBeCloseTo(beta / (1 + beta), 9);
      // não depende da massa nem do raio
      expect(R({ body: k + 1, theta: 30, mus: 0.9, m: 300, r: 0.07 }).a).toBeCloseTo(s.a, 12);
    }
    const t = [3, 2, 1].map((b) => R({ body: b, theta: 30 }).t);
    expect(t[0]).toBeLessThan(t[1]);
    expect(t[1]).toBeLessThan(t[2]);
    // limite: tg θ = μe(1+β)/β
    const lim = (Math.atan((0.25 * 2) / 1) * 180) / Math.PI;
    expect(R({ body: 1, mus: 0.25 }).thLim).toBeCloseTo(lim, 9);
    expect(R({ body: 1, theta: Math.floor(lim), mus: 0.25, muk: 0.2 }).regime).toBe(ROLL);
    const esc = R({ body: 1, theta: Math.ceil(lim), mus: 0.25, muk: 0.2 });
    expect(esc.regime).toBe(ROLL_SLIP);
    expect(esc.a).toBeCloseTo(RG * (Math.sin(esc.th) - 0.2 * Math.cos(esc.th)), 9);
    expect(esc.alpha * esc.r).toBeLessThan(esc.a); // gira menos do que anda
    // sem atrito: escorrega sem girar
    const liso = R({ body: 3, theta: 30, mus: 0, muk: 0 });
    expect(liso.a).toBeCloseTo(RG * 0.5, 9);
    expect(liso.alpha).toBe(0);
    expect(releaseOf(0.4, 0, 0.5, 0.3).a).toBe(0);
  });

  it('redutor: i = produto das relações, intermediária só inverte, P = T·ω conservada (ou η^k) e τ = 16T/(πd³)', () => {
    const s = Gs({ z1: 18, z2: 54, two: 1, z3: 20, z4: 80, n1: 1800, mass: 400, R: 0.2, eta: 1, d: 50 });
    expect(s.i).toBeCloseTo((18 / 54) * (20 / 80), 12);
    expect(s.nt).toBeCloseTo(1800 * s.i, 9);
    expect(s.ni).toBeCloseTo(1800 / 3, 9);
    expect(s.Tt).toBeCloseTo(400 * GG * 0.2, 9);
    expect(s.Ti).toBeCloseTo(s.Tt / 4, 9);
    expect(s.Tm).toBeCloseTo(s.Tt * s.i, 9);
    expect(s.Pm).toBeCloseTo(s.Pout, 9);
    expect(s.Pout).toBeCloseTo(400 * GG * s.v, 9);
    expect(s.v).toBeCloseTo(((s.nt * 2 * Math.PI) / 60) * 0.2, 12);
    expect(s.taut / s.taum).toBeCloseTo(s.Tt / s.Tm, 9);
    expect(s.taut).toBeCloseTo((16 * s.Tt * 1000) / (Math.PI * 50 ** 3), 9);
    expect(s.Ft1).toBeCloseTo((2 * s.Tm * 1000) / (MODULE * 18), 9);
    // a intermediária não muda relação nem torques; só o sentido e a rotação dela
    for (const zi of [12, 30, 77]) {
      const a = Gs({ two: 0, idler: 0, z1: 20, z2: 60 });
      const b = Gs({ two: 0, idler: 1, zi, z1: 20, z2: 60 });
      expect(b.i).toBeCloseTo(a.i, 12);
      expect(b.Tm).toBeCloseTo(a.Tm, 12);
      expect(b.dirT).toBe(-a.dirT);
      expect(b.nId).toBeCloseTo((1800 * 20) / zi, 9);
    }
    // com perdas: cada engrenamento multiplica a potência por η
    const p = Gs({ two: 1, idler: 1, eta: 0.9 });
    expect(p.meshes).toBe(3);
    expect(p.Pout / p.Pm).toBeCloseTo(0.9 ** 3, 12);
    expect(p.loss).toBeCloseTo(p.Pm - p.Pout, 9);
    // multiplicador: coroa menor que o pinhão
    const mult = Gs({ two: 0, z1: 40, z2: 20 });
    expect(mult.nt).toBeCloseTo(2 * mult.n1, 9);
    expect(mult.Tm).toBeCloseTo(2 * mult.Tt, 9);
  });
});

describe('bancada de corrosão', () => {
  const ZN = 1;
  const MG = 0;
  const AL = 2;
  const SN = 4;
  const cor = (v: LabValues) => run('corrosion', v);

  it('Faraday: aço a 1 A/m² ≈ 1,16 mm/ano e 1 A·ano ≈ 9,1 kg', () => {
    expect(rateFactor(METALS[STEEL])).toBeCloseTo(1.16, 2);
    expect(massFactor(METALS[STEEL]) / 1000).toBeCloseTo(9.13, 1);
    // zinco: 65,38 g/mol, n = 2 → ~10,7 kg por A·ano
    expect(massFactor(METALS[ZN]) / 1000).toBeCloseTo(10.69, 1);
  });

  it('circuito aberto: cada placa na sua taxa, sem corrente; metais iguais não formam pilha', () => {
    const o = cor({ metA: STEEL, metB: COPPER, link: 0 });
    expect(o.I).toBe(0);
    expect(o.rA).toBeCloseTo(o.rA0, 12);
    expect(o.rB).toBeCloseTo(o.rB0, 12);
    expect(o.dE).toBeCloseTo(0.33, 9);
    const same = cor({ metA: STEEL, metB: STEEL, link: 1 });
    expect(same.I).toBe(0);
    expect(same.anode).toBe(-1);
  });

  it('pilha: o mais ativo é o anodo, o catodo fica protegido e o potencial misto fica entre os dois', () => {
    for (const [a, b] of [
      [STEEL, COPPER],
      [COPPER, STEEL],
      [ZN, STEEL],
      [STEEL, GRAPHITE],
    ]) {
      const st = cellState({ metA: a, metB: b, env: SEA, link: 1, aA: 100, aB: 100 });
      const an = METALS[a].E < METALS[b].E ? st.A : st.B;
      const ca = an === st.A ? st.B : st.A;
      expect(an.role).toBe('anode');
      expect(ca.role).toBe('cathode');
      expect(an.r).toBeGreaterThan(an.r0);
      expect(ca.r).toBeLessThanOrEqual(ca.r0);
      expect(ca.E).toBeLessThan(ca.metal.E);
      expect(an.E).toBeGreaterThan(an.metal.E);
      // a dissolução do anodo ativo = a dele sozinho + a corrente da pilha
      expect(an.j * an.A).toBeCloseTo(an.j0 * an.A + st.I, 12);
    }
  });

  it('relação de áreas: no limite do O₂ o aço corrói (1 + Ac/Aa) vezes mais; catodo pequeno quase não muda nada', () => {
    for (const [aA, aB] of [
      [100, 100],
      [100, 500],
      [10, 100],
      [50, 150],
    ]) {
      expect(cor({ metA: STEEL, metB: COPPER, aA, aB }).kAn).toBeCloseTo(1 + aB / aA, 6);
    }
    expect(cor({ metA: STEEL, metB: COPPER, aA: 1000, aB: 10 }).kAn).toBeCloseTo(1.01, 6);
    // muito catodo para pouco anodo: a reta do anodo e o eletrólito já limitam, mas a taxa ainda explode
    expect(cor({ metA: STEEL, metB: COPPER, aA: 10, aB: 1000 }).kAn).toBeGreaterThan(50);
  });

  it('meio: sem O₂ a corrosão quase para; água doce limita a corrente; o cobre não corrói no ácido sem O₂', () => {
    const sea = cor({ metA: STEEL, metB: COPPER });
    const deaer = cor({ metA: STEEL, metB: COPPER, env: DEAER });
    expect(deaer.rA).toBeLessThan(sea.rA / 20);
    const fresh = cor({ metA: STEEL, metB: COPPER, env: FRESH, aA: 10, aB: 1000 });
    expect(fresh.I).toBeLessThan(cor({ metA: STEEL, metB: COPPER, aA: 10, aB: 1000 }).I / 10);
    const cuAcid = cor({ metA: COPPER, metB: COPPER, env: ACID, link: 0 });
    expect(cuAcid.rA).toBe(0);
    // zinco e cobre no ácido: o H₂ sai no cobre (catodo) e o zinco corrói mais
    const znCu = cor({ metA: ZN, metB: COPPER, env: ACID });
    expect(znCu.H2).toBeCloseTo(znCu.I, 9);
    expect(znCu.kAn).toBeGreaterThan(1.5);
  });

  it('anodo de sacrifício: zinco protege o aço sem H₂, magnésio superprotege, alumínio comum protege só em parte', () => {
    const zn = cellState({ metA: ZN, metB: STEEL, aA: 100, aB: 1000 });
    expect(zn.B.prot).toBe(1);
    expect(zn.B.r).toBe(0);
    expect(zn.B.E).toBeLessThan(E_PROT_STEEL);
    expect(zn.B.E).toBeGreaterThan(E_OVER);
    expect(zn.B.h2).toBe(0);
    const mg = cellState({ metA: MG, metB: STEEL, aA: 100, aB: 1000 });
    expect(mg.B.E).toBeLessThan(E_OVER);
    expect(mg.B.h2).toBeGreaterThan(0.5 * mg.I);
    const al = cellState({ metA: AL, metB: STEEL, aA: 100, aB: 1000 });
    expect(al.B.prot).toBeGreaterThan(0.5);
    expect(al.B.prot).toBeLessThan(0.99);
    // água doce: o magnésio, com mais ΔE, protege melhor que o zinco
    const zF = cor({ metA: ZN, metB: STEEL, env: FRESH, aA: 100, aB: 1000 });
    const mF = cor({ metA: MG, metB: STEEL, env: FRESH, aA: 100, aB: 1000 });
    expect(mF.protB).toBeGreaterThan(zF.protB);
    // galvanizado riscado protege; folha de flandres riscada fura
    expect(cor({ metA: STEEL, metB: ZN, aA: 10, aB: 1000 }).rA).toBe(0);
    expect(cor({ metA: STEEL, metB: SN, aA: 10, aB: 1000 }).kAn).toBeGreaterThan(30);
  });

  it('corrente impressa: precisa vencer o par, protege numa janela e superprotege acima; polaridade invertida corrói', () => {
    const at = (V: number) => cellState({ metA: GRAPHITE, metB: STEEL, link: 2, V, aA: 100, aB: 1000 });
    expect(at(1).I).toBe(0);
    for (const V of [2, 2.1, 2.2]) {
      const st = at(V);
      expect(st.B.E).toBeLessThanOrEqual(E_PROT_STEEL);
      expect(st.B.E).toBeGreaterThanOrEqual(E_OVER);
      expect(st.A.loss).toBe(0); // grafite: gás, sem perder massa
    }
    expect(at(3).B.h2).toBeGreaterThan(0);
    let last = -1;
    for (const V of [1.9, 2, 2.5, 3, 4]) {
      const I = at(V).I;
      expect(I).toBeGreaterThanOrEqual(last);
      last = I;
    }
    const rev = cor({ metA: STEEL, metB: GRAPHITE, link: 2, V: 2 });
    expect(rev.kAn).toBeGreaterThan(10);
  });
});

describe('bancada do motor e do alternador', () => {
  const mot = (v: LabValues) => run('motor', { maq: 0, ...v });
  const gen = (v: LabValues) => run('motor', { maq: 1, ...v });
  const w = (rpm: number) => (2 * Math.PI * rpm) / 60;

  it('rotação síncrona = 120·f/p e frequência gerada = p·n/120', () => {
    POLES.forEach((p, i) => {
      for (const f of [30, 50, 60, 90]) expect(mot({ poles: i, f }).ns).toBeCloseTo((120 * f) / p, 9);
      for (const rpm of [600, 1200, 1800, 3600]) expect(gen({ poles: i, rpm }).fg).toBeCloseTo((p * rpm) / 120, 9);
    });
    expect(syncRpm(60, 4)).toBe(1800);
    expect(genFreq(1200, 6)).toBe(60);
  });

  it('placa do motor de 4 polos com números típicos de um motor de 7,5 kW', () => {
    const pl = nameplate(4);
    expect(pl.n).toBeGreaterThan(1720);
    expect(pl.n).toBeLessThan(1775);
    expect(pl.I220).toBeGreaterThan(22);
    expect(pl.I220).toBeLessThan(28);
    expect(pl.I220 / pl.I380).toBeCloseTo(Math.sqrt(3), 9);
    expect(pl.fp).toBeGreaterThan(0.8);
    expect(pl.fp).toBeLessThan(0.9);
    expect(pl.eta).toBeGreaterThan(0.86);
    expect(pl.eta).toBeLessThan(0.94);
    expect(pl.IpIn).toBeGreaterThan(5);
    expect(pl.IpIn).toBeLessThan(8);
    expect(pl.TpTn).toBeGreaterThan(1.5);
    expect(pl.TpTn).toBeLessThan(3);
    expect(pl.TmaxTn).toBeGreaterThan(2.2);
    expect(pl.TmaxTn).toBeLessThan(3.5);
    expect(mot({ load: 100 }).Pout).toBeCloseTo(7.5, 1);
  });

  it('escorregamento cresce com a carga e nunca zera; o conjugado iguala a carga e P = T·ω', () => {
    let last = -1;
    for (const load of [0, 25, 50, 100, 150, 200]) {
      const o = mot({ load });
      expect(o.s).toBeGreaterThan(last);
      last = o.s;
      expect(o.n).toBeLessThan(o.ns);
      expect(o.T).toBeCloseTo((load / 100) * o.TN, 6);
      expect(o.fr).toBeCloseTo((o.s / 100) * 60, 9);
      expect(o.Pout * 1000).toBeCloseTo(o.T * w(o.n), 0);
    }
    expect(mot({ load: 0 }).s).toBeGreaterThan(0);
    expect(mot({ load: 0 }).s).toBeLessThan(0.5);
  });

  it('tomba acima do conjugado máximo; acima do conjugado de partida gira, mas não parte', () => {
    expect(mot({ load: 300 }).stall).toBe(0);
    const st = mot({ load: 350 });
    expect(st.stall).toBe(1);
    expect(st.n).toBe(0);
    expect(st.I).toBeCloseTo(st.Ip, 9);
    expect(st.Pout).toBe(0);
    const heavy = mot({ load: 250 });
    expect(heavy.stall).toBe(0);
    expect(heavy.parte).toBe(0);
    expect(mot({ load: 100 }).parte).toBe(1);
  });

  it('estrela e triângulo: mesma potência, corrente √3 menor em 380 V, partida em estrela ÷ 3, triângulo em 380 V queima', () => {
    const d220 = mot({ rede: 0, lig: 0 });
    const y380 = mot({ rede: 1, lig: 1 });
    expect(d220.Vbob).toBeCloseTo(220, 9);
    expect(y380.Vbob).toBeCloseTo(380 / Math.sqrt(3), 9);
    expect(d220.Pout).toBeCloseTo(y380.Pout, 1);
    expect(d220.I / y380.I).toBeCloseTo(Math.sqrt(3), 1);
    const y220 = mot({ rede: 0, lig: 1, load: 30 });
    const d220b = mot({ rede: 0, lig: 0, load: 30 });
    expect(y220.Ip / d220b.Ip).toBeCloseTo(1 / 3, 3);
    expect(y220.Tp / d220b.Tp).toBeCloseTo(1 / 3, 3);
    expect(y220.over).toBe(0);
    const burn = mot({ rede: 1, lig: 0 });
    expect(burn.over).toBe(1);
    expect(burn.I).toBeGreaterThan(3 * y380.I);
  });

  it('inversor: a rotação acompanha f; com V/f constante a corrente quase não muda e a potência cai junto', () => {
    const f60 = mot({ f: 60 });
    const f30 = mot({ f: 30 });
    expect(f30.ns).toBeCloseTo(900, 9);
    expect(f30.Pout / f60.Pout).toBeGreaterThan(0.45);
    expect(f30.Pout / f60.Pout).toBeLessThan(0.52);
    expect(Math.abs(f30.I / f60.I - 1)).toBeLessThan(0.05);
    // acima de 60 Hz a tensão para no máximo: o fluxo e o conjugado máximo caem
    expect(mot({ f: 90 }).Tmax).toBeLessThan(0.6 * f60.Tmax);
  });

  it('capacitores: a rede vê menos reativa e menos corrente, com a mesma potência ativa; a vazio o cos φ despenca', () => {
    const a = mot({ load: 25, cap: 0 });
    const b = mot({ load: 25, cap: 3 });
    expect(b.P).toBeCloseTo(a.P, 12);
    expect(b.I).toBeCloseTo(a.I, 12);
    expect(b.Q).toBeCloseTo(a.Q - 3, 9);
    expect(b.fpRede).toBeGreaterThan(a.fpRede);
    expect(b.Irede).toBeLessThan(a.Irede);
    expect(b.S ** 2).toBeCloseTo(b.P ** 2 + b.Q ** 2, 9);
    // com inversor, os capacitores saem da conta
    expect(mot({ f: 50, cap: 3 }).Q).toBeCloseTo(mot({ f: 50, cap: 0 }).Q, 12);
    expect(mot({ load: 0 }).fp).toBeLessThan(0.2);
  });

  it('trocar duas fases só inverte o sentido', () => {
    const a = mot({ seq: 0 });
    const b = mot({ seq: 1 });
    expect(a.dir).toBe(1);
    expect(b.dir).toBe(-1);
    expect(b.n).toBe(a.n);
    expect(b.I).toBe(a.I);
  });

  it('alternador: E ∝ n·Φ, sem excitação não gera, a carga derruba a tensão e pede mais torque', () => {
    const base = gen({ poles: 1, rpm: 1800, exc: 100, kw: 0 });
    expect(base.fg).toBeCloseTo(60, 9);
    expect(base.E).toBeCloseTo(220, 9);
    expect(base.V).toBeCloseTo(base.E, 9);
    expect(base.Ig).toBe(0);
    expect(gen({ poles: 1, rpm: 900, exc: 100, kw: 0 }).E).toBeCloseTo(110, 9);
    expect(gen({ poles: 1, rpm: 1800, exc: 0, kw: 5 }).E).toBe(0);
    // saturação: 50 % a mais de excitação dá bem menos que 50 % a mais de tensão
    expect(gen({ poles: 1, rpm: 1800, exc: 150, kw: 0 }).E / base.E).toBeLessThan(1.2);
    let lastV = Infinity;
    let lastT = 0;
    for (const kw of [0, 2, 5, 8, 12]) {
      const o = gen({ poles: 1, rpm: 1800, exc: 100, kw });
      expect(o.V).toBeLessThan(lastV);
      expect(o.Tt).toBeGreaterThan(lastT);
      lastV = o.V;
      lastT = o.Tt;
      expect(o.Pt).toBeGreaterThan(o.Pg);
      expect(o.Tt).toBeCloseTo((o.Pt * 1000) / w(1800), 9);
    }
  });
});

describe('bancada do eixo, dos mancais e da lubrificação', () => {
  const sh = (v: LabValues) => run('shaft', v);
  const w = (rpm: number) => (2 * Math.PI * rpm) / 60;

  it('T = P/ω, Ft = 2T/D, F = Ft/cos 20°, reações somam F e M = F·a·b/L (F·L/4 no meio)', () => {
    for (const [P, n, a] of [
      [15, 1150, 400],
      [30, 600, 120],
      [7.5, 1750, 600],
    ]) {
      const o = sh({ P, n, a });
      expect(o.T).toBeCloseTo((P * 1000) / w(n), 9);
      expect(o.Ft).toBeCloseTo((2 * o.T * 1000) / GEAR_D, 9);
      expect(o.F).toBeCloseTo(o.Ft / Math.cos((PRESSURE * Math.PI) / 180), 9);
      expect(o.RA + o.RB).toBeCloseTo(o.F, 9);
      expect(o.RA * a).toBeCloseTo(o.RB * (SPAN - a), 6);
      expect(o.M).toBeCloseTo((o.F * a * (SPAN - a)) / SPAN / 1000, 9);
    }
    const mid = sh({ a: 400 });
    expect(mid.M).toBeCloseTo((mid.F * SPAN) / 4 / 1000, 9);
  });

  it('tensões: σ = 32M/πd³, τ = 16T/πd³, von Mises, Tresca e os fatores de segurança', () => {
    const o = sh({ P: 30, n: 600, d: 40 });
    expect(o.sig).toBeCloseTo((32 * o.M * 1000) / (Math.PI * 40 ** 3), 9);
    expect(o.tau).toBeCloseTo((16 * o.T * 1000) / (Math.PI * 40 ** 3), 9);
    expect(o.svm).toBeCloseTo(Math.hypot(o.sig, Math.sqrt(3) * o.tau), 9);
    expect(o.tmax).toBeCloseTo(Math.hypot(o.sig / 2, o.tau), 9);
    expect(o.FS).toBeCloseTo(SY / o.svm, 9);
    // Tresca é mais conservador que von Mises
    expect(o.FStr).toBeLessThanOrEqual(o.FS);
    // eixo girando: a fadiga (flexão alternada) aperta mais que o escoamento
    expect(o.FSf).toBeLessThan(o.FS);
    // tensões ∝ 1/d³
    const big = sh({ P: 30, n: 600, d: 70 });
    expect(big.sig).toBeCloseTo((o.sig * 40 ** 3) / 70 ** 3, 9);
  });

  it('engrenagem perto de um mancal: momento menor, esse mancal leva quase tudo, crítica mais alta', () => {
    const mid = sh({ P: 30, n: 600, a: 400 });
    const near = sh({ P: 30, n: 600, a: 120 });
    expect(near.M).toBeLessThan(mid.M);
    expect(near.RA).toBeGreaterThan(mid.RA);
    expect(near.RB).toBeLessThan(mid.RB);
    expect(near.nc).toBeGreaterThan(mid.nc);
    // o torque não depende da posição
    expect(near.T).toBeCloseTo(mid.T, 9);
  });

  it('velocidade crítica: n_c = (60/2π)·√(k/m), k = 3EIL/(a²b²), n_c ∝ d² e pico ≈ e/(2ζ)', () => {
    for (const [d, a] of [
      [30, 400],
      [40, 200],
      [55, 600],
    ]) {
      const I = (Math.PI * d ** 4) / 64;
      const b = SPAN - a;
      const k = ((3 * E_STEEL * I * SPAN) / (a * a * b * b)) * 1000;
      expect(sh({ d, a }).nc).toBeCloseTo((Math.sqrt(k / GEAR_M) * 60) / (2 * Math.PI), 6);
    }
    expect(sh({ d: 60 }).nc / sh({ d: 30 }).nc).toBeCloseTo(4, 9);
    const nc = sh({ d: 30 }).nc;
    const st = shaftState({ d: 30, n: nc, P: 7.5, a: 400 });
    expect(st.amp).toBeCloseTo(ECC / (2 * ZETA), 6);
    // perto da crítica vibra muito mais que longe dela
    expect(sh({ d: 30, n: 1750, P: 7.5 }).amp).toBeGreaterThan(5 * sh({ d: 40, n: 1750, P: 7.5 }).amp);
  });

  it('rolamentos: L10 = (C/P)^p milhões de rotações; carga dobrada divide a vida por 8 (esferas) ou 10 (rolos)', () => {
    const o = sh({ brg: 0, P: 30, n: 600 });
    const ball = BEARINGS[0];
    expect(o.LA).toBeCloseTo(((((ball.C * 1000) / o.RA) ** 3) * 1e6) / (60 * 600), 3);
    const twice = sh({ brg: 0, P: 30, n: 300 });
    // mesma potência na metade da rotação: torque e carga dobram
    expect(twice.RA).toBeCloseTo(2 * o.RA, 6);
    // em rotações a vida cai 8 vezes; em horas, 4 (cada rotação demora o dobro)
    expect(o.LA / twice.LA).toBeCloseTo(4, 6);
    const rol = sh({ brg: 1, P: 30, n: 600 });
    const rol2 = sh({ brg: 1, P: 30, n: 300 });
    expect(rol.LA / rol2.LA).toBeCloseTo(2 ** (10 / 3) / 2, 6);
    expect(rol.LA).toBeGreaterThan(o.LA);
  });

  it('bucha: S = (r/c)²·μN/P, Petroff com eixo centrado e filme que afina com menos rotação, óleo quente ou mais carga', () => {
    const j = journalState(2000, 40, 600, 0.001, 1, 60);
    const N = 600 / 60;
    const p = 2000 / 0.04 ** 2;
    expect(j.S).toBeCloseTo((1 / 0.001) ** 2 * ((j.mu * N) / p), 9);
    expect(j.c).toBeCloseTo(20, 9);
    // Petroff: com S grande, (r/c)·f = 2π²·S
    expect(journalOf(5).rcf).toBeCloseTo(2 * Math.PI ** 2 * 5, 9);
    expect(journalOf(0.0188).eps).toBeCloseTo(0.9, 9);
    const slow = journalState(2000, 40, 60, 0.001, 1, 60);
    const hot = journalState(2000, 40, 600, 0.001, 1, 110);
    const heavy = journalState(8000, 40, 600, 0.001, 1, 60);
    for (const x of [slow, hot, heavy]) {
      expect(x.S).toBeLessThan(j.S);
      expect(x.h0).toBeLessThan(j.h0);
    }
    // parado quase sem rotação, com óleo fino e quente: contato metal-metal
    const boundary = journalState(5000, 40, 20, 0.001, 0, 110);
    expect(boundary.regime).toBe(0);
    expect(boundary.f).toBeGreaterThan(0.08);
    expect(j.regime).toBe(2);
    expect(j.f).toBeLessThan(0.02);
  });

  it('óleos: viscosidade cai com a temperatura; o 10W-30 é um SAE 10 no frio e um SAE 30 a 100 °C', () => {
    for (const oil of [0, 1, 2]) expect(oilVisc(oil, 20)).toBeGreaterThan(oilVisc(oil, 80));
    expect(oilVisc(0, 40)).toBeCloseTo(32, 6);
    expect(oilVisc(1, 100)).toBeCloseTo(11.5, 6);
    expect(oilVisc(2, 0)).toBeCloseTo(oilVisc(0, 0), 9);
    expect(oilVisc(2, 100)).toBeCloseTo(oilVisc(1, 100), 9);
    expect(oilVisc(2, 40)).toBeGreaterThan(oilVisc(0, 40));
    expect(oilVisc(2, 40)).toBeLessThan(oilVisc(1, 40));
  });
});

describe('bancada de molas e do macaco de parafuso', () => {
  const sp = (v: LabValues) => run('spring', { modo: 0, ...v });
  const jk = (v: LabValues) => run('spring', { modo: 1, ...v });

  it('mola: k = G·d⁴/(8·D³·n), C = D/d e o fator de Wahl', () => {
    for (const [d, D, n, mat] of [
      [6, 48, 8, 0],
      [4, 30, 12, 1],
      [9.5, 70, 5, 2],
    ]) {
      const g = springOf(d, D, n, mat);
      expect(g.k).toBeCloseTo((SPRING_MATS[mat].G * d ** 4) / (8 * D ** 3 * n), 9);
      expect(g.C).toBeCloseTo(D / d, 9);
      expect(g.Kw).toBeCloseTo((4 * g.C - 1) / (4 * g.C - 4) + 0.615 / g.C, 9);
      expect(g.Ls).toBeCloseTo((n + 2) * d, 9);
    }
    // fio 2× mais grosso: 16× mais rígida; diâmetro 2× maior: 8× mais mole
    expect(springOf(8, 48, 8, 0).k / springOf(4, 48, 8, 0).k).toBeCloseTo(16, 9);
    expect(springOf(6, 40, 8, 0).k / springOf(6, 80, 8, 0).k).toBeCloseTo(8, 9);
    expect(wahl(8)).toBeGreaterThan(1);
  });

  it('cortar espiras endurece na proporção n/n′; a tensão no fio não depende de n nem de G', () => {
    const ten = sp({ na: 10 });
    const eight = sp({ na: 8 });
    expect(eight.k / ten.k).toBeCloseTo(10 / 8, 9);
    expect(eight.tau).toBeCloseTo(ten.tau, 9);
    const bronze = sp({ mat: 2 });
    const steel = sp({ mat: 0 });
    expect(bronze.k).toBeLessThan(steel.k);
    expect(bronze.tau).toBeCloseTo(steel.tau, 9);
    expect(steel.tau).toBeCloseTo((steel.Kw * 8 * 400 * 48) / (Math.PI * 6 ** 3), 9);
  });

  it('série: k/2 e o dobro da deflexão; paralelo: 2k e metade da tensão em cada fio', () => {
    const one = sp({ arr: 0 });
    const ser = sp({ arr: 1 });
    const par = sp({ arr: 2 });
    expect(ser.keq).toBeCloseTo(one.k / 2, 9);
    expect(par.keq).toBeCloseTo(2 * one.k, 9);
    expect(ser.defl).toBeCloseTo(2 * one.defl, 9);
    expect(par.defl).toBeCloseTo(one.defl / 2, 9);
    expect(ser.tau).toBeCloseTo(one.tau, 9);
    expect(par.tau).toBeCloseTo(one.tau / 2, 9);
    // energia = F·δ/2 = F²/(2·k_eq)
    for (const o of [one, ser, par]) expect(o.U).toBeCloseTo((400 * o.defl) / 2 / 1000, 9);
  });

  it('mola fechada: a deflexão para no curso até encostar as espiras e a torção no fio para de crescer', () => {
    const st = springState({ F: 1800 });
    expect(st.solid).toBe(true);
    expect(st.de).toBeCloseTo(st.geom.L0 - st.geom.Ls, 9);
    const a = sp({ F: 1800 });
    const b = sp({ F: 2000 });
    expect(b.defl).toBeCloseTo(a.defl, 9);
    expect(b.tau).toBeCloseTo(a.tau, 9);
    expect(sp({ F: 0 }).FS).toBeGreaterThan(10);
  });

  it('macaco: L = entradas × passo, tg λ = L/(π·dₘ), autotravante ⇔ μ\' > tg λ, e então η < 50 %', () => {
    const j = jackState({ perfil: 1, ent: 0, pas: 6, dmed: 33, mu: 0.15, W: 10 });
    expect(j.L).toBe(6);
    expect(j.tanL).toBeCloseTo(6 / (Math.PI * 33), 12);
    expect(j.mup).toBeCloseTo(0.15 / Math.cos((15 * Math.PI) / 180), 12);
    // o rendimento bate com o trabalho: W·L = η·2π·T
    expect(j.eta).toBeCloseTo((j.W * (j.L / 1000)) / (2 * Math.PI * j.Tup), 9);
    for (const ent of [0, 1, 2])
      for (const mu of [0.05, 0.1, 0.15, 0.3])
        for (const pas of [2, 6, 12]) {
          const x = jackState({ perfil: 1, ent, pas, dmed: 33, mu, W: 10 });
          expect(x.lock).toBe(x.Tdown > 0);
          if (x.lock) expect(x.eta).toBeLessThan(0.5);
        }
    expect(jk({ ent: 2 }).lock).toBe(0);
    expect(jk({ mu: 0.05 }).lock).toBe(0);
    expect(jk({}).lock).toBe(1);
  });

  it('macaco: torque ∝ carga, rendimento independe da carga, rosca quadrada rende mais que a trapezoidal', () => {
    const a = jk({ W: 10 });
    const b = jk({ W: 20 });
    expect(b.Tup).toBeCloseTo(2 * a.Tup, 9);
    expect(b.eta).toBeCloseTo(a.eta, 9);
    expect(jk({ perfil: 0 }).eta).toBeGreaterThan(jk({ perfil: 1 }).eta);
    expect(jk({ W: 20, R: 0.5 }).Fman).toBeCloseTo(b.Tup / 0.5, 9);
  });
});

describe('tarefas das bancadas (conteúdo × modelo)', () => {
  const labs = allTopics().flatMap((t) => t.games.filter((g): g is LabGame => g.type === 'lab').map((g) => ({ g, t })));

  it('existe pelo menos uma bancada com tarefas no conteúdo', () => {
    expect(labs.length).toBeGreaterThan(0);
  });

  for (const { g } of labs) {
    describe(`${g.id} (${g.lab})`, () => {
      const model = LAB_MODELS[g.lab];
      g.tasks.forEach((task, i) => {
        it(`tarefa ${i + 1}: ${task.kind}`, () => {
          const start = withDefaults(model, task.setup);
          const o0 = model.compute(start);
          if (task.kind === 'predict') {
            if (!task.change) return;
            const o1 = model.compute({ ...start, ...task.change });
            for (const e of task.expect ?? []) {
              const a = o0[e.out];
              const b = o1[e.out];
              const tol = 1e-6 * Math.max(1, Math.abs(a));
              if (e.trend === 'up') expect(b, `${e.out} deveria subir`).toBeGreaterThan(a + tol);
              else if (e.trend === 'down') expect(b, `${e.out} deveria cair`).toBeLessThan(a - tol);
              else expect(Math.abs(b - a), `${e.out} deveria ficar igual`).toBeLessThanOrEqual(tol);
            }
          } else {
            expect(task.goals.every((goal) => goalMet(goal, o0)), 'a missão não pode começar cumprida').toBe(false);
            const o1 = model.compute({ ...start, ...task.solution });
            for (const goal of task.goals) expect(goalMet(goal, o1), `a solução não cumpre ${goal.out} (${o1[goal.out]})`).toBe(true);
          }
        });
      });
    });
  }
});
