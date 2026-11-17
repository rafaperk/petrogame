/**
 * Minijogos: avaliação e efeitos (revisão FSRS, XP, estatísticas). Sem interface — a UI fica em ui/games/.
 *
 * Cada jogo é UM cartão de memória: quando ele vence, o tópico pede revisão e você joga de novo.
 * A nota da revisão vem do aproveitamento de primeira (≥ 90% = Bom, ≥ 70% = Difícil, abaixo = Errou).
 */
import { GAMES } from '../config';
import { events } from '../core/events';
import { state } from '../core/state';
import { dayKey } from '../core/time';
import { plantStage, topicMastery, type PlantStage } from './mastery';
import { getCard, Rating, reviewQuestion, type Grade } from './srs';
import type { GameDef, GameKind, Topic } from './types';

export const GAME_INFO: Record<GameKind, { name: string; icon: string; how: string }> = {
  sort: {
    name: 'Esteira',
    icon: '📦',
    how: 'Os itens chegam pela esteira. Mande cada um para a **categoria certa** antes que ele passe. Errou? Leia o porquê — é aí que você aprende.',
  },
  match: {
    name: 'Conexões',
    icon: '🔗',
    how: 'Ligue cada termo da esquerda à definição certa da direita. Cada erro conta — pense antes de clicar.',
  },
  order: {
    name: 'Procedimento',
    icon: '📋',
    how: 'Monte a sequência correta escolhendo **o próximo passo**. Se errar, o passo volta e você tenta de novo.',
  },
  lab: {
    name: 'Bancada',
    icon: '🔬',
    how: 'Uma simulação de verdade. Nas tarefas **🔮 Preveja e observe**, aposte no que vai acontecer *antes* de ver — depois a bancada mostra. Nas **🎯 Missões**, mexa nos controles até cumprir as metas. Usar a dica ou desistir conta como erro na revisão.',
  },
};

export interface MissedItem {
  text: string;
  /** A resposta certa (categoria, definição ou posição). */
  answer: string;
  why?: string;
}

export interface GameResult {
  /** Itens avaliados (itens da esteira, pares, passos). */
  total: number;
  correctFirstTry: number;
  mistakes: number;
  bestStreak: number;
  durationMs: number;
  /** Chegou ao fim? (sair no meio conta como revisão errada) */
  completed: boolean;
  missed: MissedItem[];
}

export interface GameOutcome {
  grade: Grade;
  accuracy: number;
  xp: number;
  coins: number;
  nextDue: Date;
  before: number;
  after: number;
  stageBefore: PlantStage;
  stageAfter: PlantStage;
  best: number;
  newRecord: boolean;
  firstTime: boolean;
  /** Nível em que a partida foi jogada e o nível para a próxima. */
  level: number;
  levelAfter: number;
}

export const MAX_GAME_LEVEL = 3;

/** Nível atual do minijogo (1 = Treino, 2 = Campo, 3 = Prova). */
export function gameLevel(gameId: string): number {
  const level = state.data.gstats[gameId]?.level ?? 1;
  return Math.min(MAX_GAME_LEVEL, Math.max(1, Math.round(level)));
}

export function levelName(level: number): string {
  return `Nível ${level} · ${GAMES.levelNames[level - 1] ?? ''}`;
}

/** Próximo nível depois de uma partida: sobe com ≥ 90%, desce com < 50%, só se a partida chegou ao fim. */
export function nextGameLevel(level: number, r: GameResult): number {
  if (!r.completed) return level;
  const acc = gameAccuracy(r);
  if (acc >= GAMES.levelUpAccuracy) return Math.min(MAX_GAME_LEVEL, level + 1);
  if (acc < GAMES.levelDownAccuracy) return Math.max(1, level - 1);
  return level;
}

/** Valor da tabela de níveis (config GAMES) para o nível dado. */
export function byLevel<T>(table: readonly T[], level: number): T {
  return table[Math.min(table.length, Math.max(1, level)) - 1];
}

export function gameAccuracy(r: GameResult): number {
  return r.total ? r.correctFirstTry / r.total : 0;
}

export function gradeGame(r: GameResult): Grade {
  const acc = gameAccuracy(r);
  if (!r.completed) return Rating.Again;
  if (acc >= GAMES.goodAccuracy) return Rating.Good;
  if (acc >= GAMES.hardAccuracy) return Rating.Hard;
  return Rating.Again;
}

/** Registra a partida: agenda a próxima revisão do jogo, dá XP/moedas e atualiza estatísticas. */
export function applyGameResult(game: GameDef, topic: Topic, r: GameResult, now: Date = new Date()): GameOutcome {
  const before = topicMastery(topic, now);
  const firstTime = !getCard(game.id);
  const grade = gradeGame(r);
  const card = reviewQuestion(game.id, grade, now);
  const accuracy = gameAccuracy(r);
  const level = gameLevel(game.id);
  const levelAfter = nextGameLevel(level, r);
  const xp = r.completed ? Math.round((GAMES.xpBase + GAMES.xpPerCorrect * r.correctFirstTry) * byLevel(GAMES.levelXp, level) * state.xpFactor(now)) : 0;
  const coins = !r.completed ? 0 : (accuracy >= GAMES.goodAccuracy ? GAMES.coinsGood : GAMES.coinsBase) + (level - 1);
  state.addXp(xp);
  state.addCoins(coins);
  state.registerStudyDay(now);

  const data = state.data;
  data.stats.gamesPlayed += 1;
  // partida esquecida aberta não vira "horas de estudo"
  data.stats.studyMs += Math.min(r.durationMs, 20 * 60_000);
  const day = (data.stats.byDay[dayKey(now)] ??= { answered: 0, correct: 0 });
  day.answered += r.total;
  day.correct += r.correctFirstTry;
  const stat = (data.gstats[game.id] ??= { plays: 0, best: 0, last: '' });
  const newRecord = r.completed && accuracy > stat.best && stat.plays > 0;
  stat.plays += 1;
  if (r.completed) stat.best = Math.max(stat.best, accuracy);
  stat.last = now.toISOString();
  stat.level = levelAfter;
  state.touch();

  const after = topicMastery(topic, now);
  events.emit('game:completed', { gameId: game.id, topicId: topic.id, accuracy, level });
  return {
    grade,
    accuracy,
    xp,
    coins,
    nextDue: card.dueAt,
    before,
    after,
    stageBefore: plantStage(before),
    stageAfter: plantStage(after),
    best: stat.best,
    newRecord,
    firstTime,
    level,
    levelAfter,
  };
}

/** Situação do jogo para menus: novo, vencido (revisar) ou em dia (com o recorde). */
export function gameStatus(game: GameDef, now: Date = new Date()): { label: string; due: boolean; fresh: boolean } {
  const card = getCard(game.id);
  if (!card) return { label: 'novo', due: false, fresh: true };
  const due = card.dueAt.getTime() <= now.getTime();
  const best = state.data.gstats[game.id]?.best ?? 0;
  const level = `nível ${gameLevel(game.id)}`;
  return { label: due ? `revisar (${level})` : `${level} · recorde ${Math.round(best * 100)}%`, due, fresh: false };
}
