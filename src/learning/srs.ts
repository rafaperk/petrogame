/**
 * Repetição espaçada com FSRS-7 (via ts-fsrs, o mesmo algoritmo usado pelo Anki).
 * Cada questão vira um "cartão" com estabilidade, dificuldade e data da próxima revisão.
 */
import { DefaultScheduler, Rating } from 'ts-fsrs';
import type { DefaultSchedulerCard, Grade } from 'ts-fsrs';
import { SRS_CONFIG } from '../config';
import { state, type StoredCard } from '../core/state';

export type Card = DefaultSchedulerCard;
export { Rating };
export type { Grade };

let scheduler: DefaultScheduler | null = null;

export async function initSrs(): Promise<void> {
  if (scheduler) return;
  scheduler = await DefaultScheduler({
    desiredRetention: SRS_CONFIG.desiredRetention,
    maximumInterval: SRS_CONFIG.maximumInterval,
    enableShortTerm: true,
    learningSteps: [...SRS_CONFIG.learningSteps],
    relearningSteps: [...SRS_CONFIG.relearningSteps],
    enableFuzz: SRS_CONFIG.enableFuzz,
  });
}

function requireScheduler(): DefaultScheduler {
  if (!scheduler) throw new Error('SRS não inicializado: chame initSrs() antes.');
  return scheduler;
}

function toStored(card: Card): StoredCard {
  return JSON.parse(JSON.stringify(card)) as StoredCard;
}

function fromStored(stored: StoredCard): Card {
  return {
    ...stored,
    dueAt: new Date(stored.dueAt),
    lastReviewAt: stored.lastReviewAt ? new Date(stored.lastReviewAt) : null,
  } as unknown as Card;
}

/** Cache de cartões já convertidos (a chave é o objeto salvo: trocar de save invalida sozinho). */
const revived = new WeakMap<StoredCard, Card>();

export function getCard(questionId: string): Card | null {
  const stored = state.data.cards[questionId];
  if (!stored) return null;
  let card = revived.get(stored);
  if (!card) {
    card = fromStored(stored);
    revived.set(stored, card);
  }
  return card;
}

/** Registra uma tentativa de lembrar a questão e reagenda a próxima revisão. */
export function reviewQuestion(questionId: string, grade: Grade, now: Date = new Date()): Card {
  const s = requireScheduler();
  const current = getCard(questionId) ?? s.newCard({ now });
  const { card } = s.review({ card: current, grade, now });
  const stored = toStored(card);
  state.data.cards[questionId] = stored;
  revived.set(stored, card);
  return card;
}

export function isDue(card: Card, now: Date = new Date()): boolean {
  return card.dueAt.getTime() <= now.getTime();
}

/** Probabilidade estimada (0..1) de você lembrar a resposta agora. */
export function retrievability(card: Card, now: Date = new Date()): number {
  if (!card.lastReviewAt) return 0;
  const s = requireScheduler();
  const elapsed = Math.max(0, s.chrono.difference(card.lastReviewAt, now));
  const r = s.model.forgettingCurve(card, elapsed);
  return Number.isFinite(r) ? Math.min(1, Math.max(0, r)) : 0;
}

export function gradeFor(correct: boolean, usedHint: boolean): Grade {
  if (!correct) return Rating.Again;
  return usedHint ? Rating.Hard : Rating.Good;
}
