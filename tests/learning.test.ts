import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { state } from '../src/core/state';
import { content } from '../src/learning/content';
import { applyGameResult, gradeGame, type GameResult } from '../src/learning/games';
import { dueCount, dueGames, dueQuestions, itemIds, plantStage, topicMastery, topicStatus } from '../src/learning/mastery';
import { planLearn, planReview, SessionRunner } from '../src/learning/session';
import { getCard, initSrs, Rating, reviewQuestion } from '../src/learning/srs';
import { md } from '../src/ui/dom';

const topic = (id: string) => content.topicById.get(id)!;

beforeAll(async () => {
  await initSrs();
});

beforeEach(() => {
  state.newGame('Teste');
});

describe('repetição espaçada e maestria', () => {
  it('a maestria cresce com revisões espaçadas ao longo de dias', () => {
    const crase = topic('pt.crase');
    let now = new Date('2026-01-01T12:00:00Z');
    for (const q of crase.questions) reviewQuestion(q.id, Rating.Good, now);
    const first = topicMastery(crase, now);
    for (let round = 0; round < 4; round++) {
      const lastDue = Math.max(...crase.questions.map((q) => getCard(q.id)!.dueAt.getTime()));
      now = new Date(lastDue + 60_000);
      for (const q of crase.questions) reviewQuestion(q.id, Rating.Good, now);
    }
    const later = topicMastery(crase, now);
    expect(later).toBeGreaterThan(first);
    expect(plantStage(later)).toBeGreaterThanOrEqual(3);
  });

  it('a maestria cai com o tempo sem revisão (a planta "murcha")', () => {
    const crase = topic('pt.crase');
    const t0 = new Date('2026-01-01T12:00:00Z');
    for (const q of crase.questions) reviewQuestion(q.id, Rating.Good, t0);
    const fresh = topicMastery(crase, t0);
    const monthLater = new Date('2026-02-01T12:00:00Z');
    expect(topicMastery(crase, monthLater)).toBeLessThan(fresh);
    expect(dueQuestions(crase, monthLater).length).toBe(crase.questions.length);
  });

  it('pré-requisitos bloqueiam tópicos até serem estudados', () => {
    const bombas = topic('mec.bombas-centrifugas');
    expect(topicStatus(bombas)).toBe('locked');
    const fluidos = topic('mec.hidrostatica-bernoulli');
    state.data.topics[fluidos.id] = { learnedAt: new Date().toISOString() };
    for (const q of fluidos.questions) reviewQuestion(q.id, Rating.Good);
    expect(topicStatus(bombas)).toBe('available');
  });
});

describe('sessões', () => {
  it('a prática guiada começa pelas questões mais fáceis', () => {
    const plan = planLearn(topic('pt.crase'));
    const difficulties = plan.questionIds.map((id) => content.questionById.get(id)!.question.difficulty);
    expect(difficulties).toEqual([...difficulties].sort());
    expect(plan.questionIds.length).toBeGreaterThan(0);
  });

  it('questões erradas voltam no fim da sessão e o XP é contabilizado', () => {
    const runner = new SessionRunner(planLearn(topic('mec.gases-1a-lei')));
    const first = runner.next()!;
    const outcome = runner.answer(first, false, false);
    expect(outcome.willRetry).toBe(true);
    let item = runner.next();
    const seen: string[] = [];
    while (item) {
      seen.push(`${item.questionId}#${item.attempt}`);
      runner.answer(item, true, false);
      item = runner.next();
    }
    expect(seen.at(-1)).toBe(`${first.questionId}#2`);
    const summary = runner.finish();
    expect(summary.correctFirstTry).toBe(summary.total - 1);
    expect(summary.xp).toBeGreaterThan(0);
    expect(state.data.stats.answered).toBe(summary.total);
  });

  it('sem questões vencidas não há sessão de revisão', () => {
    expect(planReview([topic('pt.crase')])).toBeNull();
  });
});

describe('minijogos', () => {
  const result = (total: number, correct: number): GameResult => ({ total, correctFirstTry: correct, mistakes: total - correct, bestStreak: correct, durationMs: 60_000, completed: true, missed: [] });

  it('a nota da revisão vem do aproveitamento de primeira', () => {
    expect(gradeGame(result(10, 10))).toBe(Rating.Good);
    expect(gradeGame(result(10, 8))).toBe(Rating.Hard);
    expect(gradeGame(result(10, 5))).toBe(Rating.Again);
    expect(gradeGame({ ...result(10, 10), completed: false })).toBe(Rating.Again);
  });

  it('jogar cria um cartão de revisão que conta na maestria e vence com o tempo', () => {
    const calor = topic('mec.transferencia-calor');
    const game = calor.games[0];
    expect(itemIds(calor)).toContain(game.id);
    const t0 = new Date('2026-03-01T12:00:00Z');
    const outcome = applyGameResult(game, calor, result(10, 10), t0);
    expect(getCard(game.id)).not.toBeNull();
    expect(outcome.after).toBeGreaterThan(0);
    expect(outcome.xp).toBeGreaterThan(0);
    expect(state.data.stats.gamesPlayed).toBe(1);
    state.data.topics[calor.id] = { learnedAt: t0.toISOString() };
    const later = new Date('2026-06-01T12:00:00Z');
    expect(dueGames(calor, later).map((g) => g.id)).toContain(game.id);
    expect(dueCount(calor, later)).toBeGreaterThanOrEqual(1);
  });
});

describe('texto', () => {
  it('a marcação escapa HTML e formata negrito/listas', () => {
    expect(md('<b>oi</b> **forte**')).toBe('<p>&lt;b&gt;oi&lt;/b&gt; <strong>forte</strong></p>');
    expect(md('- a\n- b')).toBe('<ul><li>a</li><li>b</li></ul>');
    expect(md('h_{1} e T^{4}')).toBe('<p>h<sub>1</sub> e T<sup>4</sup></p>');
  });
});
