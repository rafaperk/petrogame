/**
 * Maestria = memória de longo prazo, não "quantas vezes você acertou hoje".
 * Cada item (questão ou minijogo) vale R × (0,3 + 0,7 × min(1, S / 21 dias)), onde R é a chance de lembrar
 * agora e S a estabilidade da memória (FSRS). Assim a planta/equipamento só melhora com revisões espaçadas.
 */
import { MASTERY, MAX_DEPTH_METERS } from '../config';
import { state } from '../core/state';
import { allTopics, content } from './content';
import { getCard, isDue, retrievability } from './srs';
import type { Difficulty, Field, GameDef, Topic } from './types';

export type PlantStage = 0 | 1 | 2 | 3 | 4;
export const STAGE_NAMES = ['Semente', 'Broto', 'Muda', 'Florindo', 'Frutificando'] as const;
export const EQUIPMENT_STAGE_NAMES = ['Em montagem', 'Em teste', 'Operando', 'Estável', 'Otimizado'] as const;
const STAGE_EMOJI: Record<Field, string[]> = {
  horta: ['🌰', '🌱', '🌿', '🌷', '🍎'],
  refinaria: ['🔩', '🔧', '⚙️', '✅', '⭐'],
};

export function fieldOf(topic: Topic): Field {
  return content.subjectById.get(topic.subjectId)?.field ?? 'horta';
}

export function stageName(topic: Topic, stage: PlantStage): string {
  return (fieldOf(topic) === 'refinaria' ? EQUIPMENT_STAGE_NAMES : STAGE_NAMES)[stage];
}

export function stageEmoji(topic: Topic, stage: PlantStage): string {
  return STAGE_EMOJI[fieldOf(topic)][stage];
}

/** Ids de tudo que tem cartão de memória no tópico: questões e minijogos. */
export function itemIds(topic: Topic): string[] {
  return [...topic.questions.map((q) => q.id), ...topic.games.map((g) => g.id)];
}

export function questionScore(itemId: string, now: Date = new Date()): number {
  const card = getCard(itemId);
  if (!card || !card.lastReviewAt) return 0;
  const consolidation = Math.min(1, card.stability / MASTERY.targetStabilityDays);
  return retrievability(card, now) * (0.3 + 0.7 * consolidation);
}

export function topicMastery(topic: Topic, now: Date = new Date()): number {
  const ids = itemIds(topic);
  const seen = ids.filter((id) => getCard(id)?.lastReviewAt);
  if (!seen.length) return 0;
  const avg = seen.reduce((sum, id) => sum + questionScore(id, now), 0) / seen.length;
  const needed = Math.min(ids.length, MASTERY.cardsForFullCoverage);
  return avg * Math.min(1, seen.length / needed);
}

export function plantStage(mastery: number): PlantStage {
  const t = MASTERY.stageThresholds;
  let stage = 0;
  for (let i = 0; i < t.length; i++) if (mastery >= t[i]) stage = i;
  return stage as PlantStage;
}

const due = (id: string, now: Date) => {
  const card = getCard(id);
  return card !== null && isDue(card, now);
};

/** Questões vencidas (revisadas no quiz). */
export function dueQuestions(topic: Topic, now: Date = new Date()): string[] {
  return topic.questions.map((q) => q.id).filter((id) => due(id, now));
}

/** Minijogos vencidos (revisados jogando de novo). */
export function dueGames(topic: Topic, now: Date = new Date()): GameDef[] {
  return topic.games.filter((g) => due(g.id, now));
}

/** Tudo o que precisa de revisão no tópico (questões + jogos). */
export function dueCount(topic: Topic, now: Date = new Date()): number {
  return dueQuestions(topic, now).length + dueGames(topic, now).length;
}

export function nextDueDate(topic: Topic): Date | null {
  let next: Date | null = null;
  for (const id of itemIds(topic)) {
    const card = getCard(id);
    if (card && (!next || card.dueAt < next)) next = card.dueAt;
  }
  return next;
}

/** Nível de questões liberado no tópico: 1 sempre; 2 e 3 conforme a maestria. */
export function topicTier(topic: Topic, now: Date = new Date()): Difficulty {
  const m = topicMastery(topic, now);
  if (m >= MASTERY.tier3) return 3;
  if (m >= MASTERY.tier2) return 2;
  return 1;
}

export type TopicStatus = 'locked' | 'available' | 'learned';

export function topicStatus(topic: Topic, now: Date = new Date()): TopicStatus {
  if (state.isTopicLearned(topic.id)) return 'learned';
  return missingRequirements(topic, now).length ? 'locked' : 'available';
}

/** Pré-requisitos que ainda faltam (não estudados ou com maestria baixa demais). */
export function missingRequirements(topic: Topic, now: Date = new Date()): Topic[] {
  return topic.requires
    .map((id) => content.topicById.get(id))
    .filter((t): t is Topic => Boolean(t))
    .filter((req) => !state.isTopicLearned(req.id) || topicMastery(req, now) < MASTERY.prerequisiteMastery);
}

export function subjectMastery(subjectId: string, now: Date = new Date()): number {
  const subject = content.subjectById.get(subjectId);
  if (!subject || !subject.topics.length) return 0;
  const total = subject.topics.reduce((s, t) => s + t.weight, 0);
  return subject.topics.reduce((s, t) => s + topicMastery(t, now) * t.weight, 0) / total;
}

/** Cobertura do edital: para cada item, a maestria média dos tópicos que o cobrem (0 se ainda não há conteúdo). */
export function examCoverage(subjectId: string, now: Date = new Date()): { itemId: string; text: string; topics: Topic[]; mastery: number }[] {
  const subject = content.subjectById.get(subjectId);
  if (!subject?.exam) return [];
  return subject.exam.items.map((item) => {
    // um tópico pode cobrir itens de outro bloco (ex.: Rankine aparece no Bloco 1 e no Bloco 2)
    const topics = allTopics().filter((t) => t.edital.includes(item.id));
    const mastery = topics.length ? topics.reduce((s, t) => s + topicMastery(t, now), 0) / topics.length : 0;
    return { itemId: item.id, text: item.text, topics, mastery };
  });
}

export function totalDue(now: Date = new Date()): number {
  return allTopics().reduce((sum, t) => sum + (state.isTopicLearned(t.id) ? dueCount(t, now) : 0), 0);
}

/** Profundidade do "poço" (0 a 7.000 m): progresso global ponderado pela relevância dos tópicos. */
export function depthMeters(now: Date = new Date()): number {
  const topics = allTopics();
  const total = topics.reduce((s, t) => s + t.weight, 0);
  if (!total) return 0;
  const reached = topics.reduce((s, t) => s + topicMastery(t, now) * t.weight, 0);
  // arredonda de 10 em 10 m para o número não "tremer" com a queda contínua da memória
  return Math.round(((reached / total) * MAX_DEPTH_METERS) / 10) * 10;
}

export function depthLayer(meters: number): string {
  if (meters >= MAX_DEPTH_METERS) return 'Pré-sal alcançado!';
  if (meters >= 5000) return 'Camada de sal';
  if (meters >= 2000) return 'Pós-sal';
  if (meters > 0) return "Lâmina d'água";
  return 'Superfície';
}
