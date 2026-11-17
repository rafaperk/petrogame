/**
 * Progressão do jogo: níveis dos minijogos, folga e cafezinho, loja, cargos, conquistas e simulados.
 */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { state } from '../src/core/state';
import { dayKey } from '../src/core/time';
import { ACHIEVEMENTS, collectAchievements } from '../src/game/achievements';
import { rankIndex, RANKS } from '../src/game/career';
import { buy, canBuy, drinkCoffee, equip, itemById, ITEMS, owns, playerLook } from '../src/game/items';
import { content } from '../src/learning/content';
import { applyGameResult, gameLevel, nextGameLevel, type GameResult } from '../src/learning/games';
import { planSimulado, simuladoQuotas, simuladoVerdict } from '../src/learning/session';
import { initSrs } from '../src/learning/srs';

beforeAll(async () => {
  await initSrs();
});

beforeEach(() => {
  state.newGame('Teste');
});

const result = (correct: number, total = 10, completed = true): GameResult => ({
  total,
  correctFirstTry: correct,
  mistakes: total - correct,
  bestStreak: correct,
  durationMs: 60_000,
  completed,
  missed: [],
});

const learnAll = (filter: (subjectId: string) => boolean = () => true) => {
  for (const subject of content.subjects) {
    if (!filter(subject.id)) continue;
    for (const t of subject.topics) state.data.topics[t.id] = { learnedAt: new Date().toISOString() };
  }
};

describe('níveis dos minijogos', () => {
  it('sobem com 90% de acertos, descem abaixo de 50% e não mudam em partida abandonada', () => {
    expect(nextGameLevel(1, result(9))).toBe(2);
    expect(nextGameLevel(3, result(10))).toBe(3);
    expect(nextGameLevel(2, result(7))).toBe(2);
    expect(nextGameLevel(2, result(4))).toBe(1);
    expect(nextGameLevel(1, result(0))).toBe(1);
    expect(nextGameLevel(2, result(10, 10, false))).toBe(2);
  });

  it('a partida guarda o nível e o nível 2 rende mais XP e moedas', () => {
    const { game, topic } = [...content.gameById.values()].find((g) => g.game.type === 'sort')!;
    expect(gameLevel(game.id)).toBe(1);
    const first = applyGameResult(game, topic, result(10));
    expect(first.level).toBe(1);
    expect(first.levelAfter).toBe(2);
    expect(gameLevel(game.id)).toBe(2);
    const second = applyGameResult(game, topic, result(10));
    expect(second.level).toBe(2);
    expect(second.xp).toBeGreaterThan(first.xp);
    expect(second.coins).toBeGreaterThan(first.coins);
  });
});

describe('ofensiva e cafezinho', () => {
  it('uma folga programada cobre um dia sem estudo', () => {
    const today = new Date('2026-03-10T12:00:00');
    const twoDaysAgo = new Date('2026-03-08T12:00:00');
    state.data.streak = { count: 5, best: 5, lastDay: dayKey(twoDaysAgo) };
    expect(state.currentStreak(today)).toBe(0);
    state.data.inventory.folga = 1;
    expect(state.currentStreak(today)).toBe(5);
    state.registerStudyDay(today);
    expect(state.data.streak.count).toBe(6);
    expect(state.data.inventory.folga).toBe(0);
  });

  it('sem folga, a ofensiva recomeça', () => {
    state.data.streak = { count: 5, best: 5, lastDay: dayKey(new Date('2026-03-08T12:00:00')) };
    state.registerStudyDay(new Date('2026-03-10T12:00:00'));
    expect(state.data.streak.count).toBe(1);
    expect(state.data.streak.best).toBe(5);
  });

  it('o cafezinho dá +50% de XP por 30 minutos', () => {
    const now = new Date('2026-03-10T12:00:00');
    expect(drinkCoffee(now)).toBe(false);
    state.data.inventory.cafe = 1;
    expect(drinkCoffee(now)).toBe(true);
    expect(state.xpFactor(new Date(now.getTime() + 29 * 60_000))).toBe(1.5);
    expect(state.xpFactor(new Date(now.getTime() + 31 * 60_000))).toBe(1);
  });
});

describe('armazém e carreira', () => {
  it('cada item tem id único, preço e, se for visual, uma parte do corpo', () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    for (const i of ITEMS) {
      expect(i.price, i.id).toBeGreaterThan(0);
      if (i.kind === 'cosmetic') expect(i.slot && i.look, i.id).toBeTruthy();
    }
    for (const r of RANKS) for (const g of r.gift ?? []) expect(itemById.has(g), `presente ${g}`).toBe(true);
    for (const a of ACHIEVEMENTS) if (a.reward.item) expect(itemById.has(a.reward.item), a.id).toBe(true);
  });

  it('não vende sem moedas nem acima do cargo; vende, desconta e veste', () => {
    const amarelo = itemById.get('capacete-amarelo')!;
    const branco = itemById.get('capacete-branco')!;
    expect(canBuy(amarelo)).toBe('coins');
    state.data.coins = 500;
    expect(canBuy(branco)).toBe('rank');
    expect(buy(amarelo)).toBe('ok');
    expect(state.data.coins).toBe(500 - amarelo.price);
    expect(owns('capacete-amarelo')).toBe(true);
    expect(canBuy(amarelo)).toBe('owned');
    equip('hat', 'capacete-amarelo');
    expect(playerLook().hat).toBe('hardhat');
    equip('hat', null);
    expect(playerLook().hat).toBeUndefined();
  });

  it('o cargo acompanha o nível', () => {
    expect(rankIndex(1)).toBe(0);
    expect(RANKS[rankIndex(10)].title).toBe('Engenheiro(a) Júnior');
    expect(rankIndex(99)).toBe(RANKS.length - 1);
  });
});

describe('conquistas', () => {
  it('desbloqueiam uma vez só', () => {
    state.data.stats.answered = 50;
    const first = collectAchievements().map((a) => a.id);
    expect(first).toContain('a-50q');
    expect(collectAchievements().map((a) => a.id)).not.toContain('a-50q');
  });

  it('todas as conquistas têm ids únicos e progresso válido', () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    for (const a of ACHIEVEMENTS) {
      const [value, target] = a.progress();
      expect(Number.isFinite(value) && Number.isFinite(target) && target > 0, a.id).toBe(true);
    }
  });
});

describe('simulado', () => {
  it('a divisão segue a prova: 70 = 10 + 10 + 20 + 15 + 15', () => {
    const quotas = simuladoQuotas(70).map((q) => q.quota);
    expect(quotas).toEqual([10, 10, 20, 15, 15]);
    expect(simuladoQuotas(20).reduce((s, q) => s + q.quota, 0)).toBe(20);
  });

  it('usa só tópicos estudados, sem repetir questão, e com o tempo da prova', () => {
    learnAll((id) => id === 'bloco1');
    const plan = planSimulado('rapido')!;
    expect(plan.questionIds.length).toBeGreaterThan(0);
    expect(new Set(plan.questionIds).size).toBe(plan.questionIds.length);
    for (const id of plan.questionIds) expect(content.questionById.get(id)!.topic.subjectId).toBe('bloco1');
    expect(plan.allowHints).toBe(false);
    expect(plan.timeLimitSec).toBeCloseTo(plan.questionIds.length * (240 / 70) * 60, -1);
  });

  it('com tudo estudado, cada parte recebe a sua cota', () => {
    learnAll();
    const plan = planSimulado('completo')!;
    const quotas = simuladoQuotas(70);
    for (const { subject, quota } of quotas) {
      const n = plan.questionIds.filter((id) => content.questionById.get(id)!.topic.subjectId === subject.id).length;
      const available = subject.topics.reduce((s, t) => s + t.questions.length, 0);
      expect(n, subject.id).toBe(Math.min(quota, available));
    }
  });

  it('o veredito segue o edital: 50% em cada parte e sem zerar Português nem Inglês', () => {
    const parts = (pt: number, en: number, b1: number) => [
      { subjectId: 'portugues', total: 10, correct: pt },
      { subjectId: 'ingles', total: 10, correct: en },
      { subjectId: 'bloco1', total: 20, correct: b1 },
    ];
    expect(simuladoVerdict(parts(6, 5, 10)).ok).toBe(true);
    expect(simuladoVerdict(parts(10, 0, 20)).ok).toBe(false);
    expect(simuladoVerdict(parts(5, 4, 20)).ok).toBe(false);
    expect(simuladoVerdict(parts(6, 6, 9)).ok).toBe(false);
  });
});
