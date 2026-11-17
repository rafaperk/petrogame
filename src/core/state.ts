/**
 * Estado persistente do jogador (progresso, revisões, missões) + salvamento em localStorage.
 * Tudo que precisa sobreviver a um F5 mora aqui.
 */
import { SAVE_KEY, xpToNextLevel } from '../config';
import { events } from './events';
import { dayKey, daysBetween } from './time';

export type Facing = 'down' | 'up' | 'left' | 'right';

/** Cartão FSRS serializado (datas em ISO). Ver learning/srs.ts. */
export type StoredCard = Record<string, unknown> & { dueAt: string; lastReviewAt: string | null };

export interface QuestionStat {
  seen: number;
  correct: number;
  lastSeen: string;
}

export interface GameStat {
  plays: number;
  /** Melhor aproveitamento (0..1). */
  best: number;
  last: string;
  /** Nível do minijogo (1 = Treino, 2 = Campo, 3 = Prova). Sobe com ≥ 90% e desce abaixo de 50%. */
  level?: number;
}

/** Parte da prova num simulado (Português, Inglês, Bloco 1...). */
export interface SimuladoPart {
  subjectId: string;
  total: number;
  correct: number;
}

export interface SimuladoRecord {
  date: string;
  kind: 'rapido' | 'completo';
  total: number;
  correct: number;
  parts: SimuladoPart[];
}

/** Partes do visual do personagem que dá para trocar (ver game/items.ts). */
export type OutfitSlot = 'hat' | 'vest' | 'glasses' | 'uniform';

export interface TopicProgress {
  learnedAt: string;
}

export interface SubjectProgress {
  introSeen?: boolean;
  challengeBest?: number;
  challengePassedAt?: string;
}

export interface DailyState {
  day: string;
  ids: string[];
  counters: Record<string, number>;
  claimed: string[];
  /** Baú do dia (as 3 missões diárias concluídas) já aberto? */
  chest?: boolean;
}

export interface SaveData {
  version: number;
  createdAt: string;
  updatedAt: string;
  player: { name: string; map: string; x: number; y: number; facing: Facing };
  level: number;
  xp: number;
  coins: number;
  streak: { count: number; best: number; lastDay: string | null };
  cards: Record<string, StoredCard>;
  qstats: Record<string, QuestionStat>;
  gstats: Record<string, GameStat>;
  topics: Record<string, TopicProgress>;
  subjects: Record<string, SubjectProgress>;
  missions: { done: string[]; daily: DailyState };
  flags: Record<string, boolean>;
  /** Itens de consumo na mochila (id → quantidade). */
  inventory: Record<string, number>;
  /** Peças de visual compradas ou ganhas. */
  owned: string[];
  /** Visual em uso (parte → id do item). */
  outfit: Partial<Record<OutfitSlot, string>>;
  /** Cafezinho: XP extra até esta data (ISO). */
  boostUntil: string | null;
  /** Conquistas desbloqueadas (id → data). */
  achievements: Record<string, string>;
  /** Maior cargo já alcançado (índice em game/career.ts), para os avisos de promoção. */
  rank: number;
  simulados: SimuladoRecord[];
  stats: {
    answered: number;
    correct: number;
    sessions: number;
    reviewSessions: number;
    practiceSessions: number;
    challengesPassed: number;
    gamesPlayed: number;
    studyMs: number;
    byDay: Record<string, { answered: number; correct: number }>;
    /** Acertos de primeira em questões nível prova. */
    hardCorrect: number;
    /** Acertos de primeira seguidos (atual e recorde). */
    run: number;
    bestRun: number;
    calcSessions: number;
    /** Maior profundidade já alcançada (as amostras do poço não se perdem). */
    maxDepth: number;
    itemsBought: number;
    dailyChests: number;
  };
  settings: { sound: boolean };
}

const CURRENT_VERSION = 1;

function defaults(name = 'Trainee'): SaveData {
  const now = new Date().toISOString();
  return {
    version: CURRENT_VERSION,
    createdAt: now,
    updatedAt: now,
    player: { name, map: 'vila', x: -1, y: -1, facing: 'down' },
    level: 1,
    xp: 0,
    coins: 0,
    streak: { count: 0, best: 0, lastDay: null },
    cards: {},
    qstats: {},
    gstats: {},
    topics: {},
    subjects: {},
    missions: { done: [], daily: { day: '', ids: [], counters: {}, claimed: [] } },
    flags: {},
    inventory: {},
    owned: [],
    outfit: {},
    boostUntil: null,
    achievements: {},
    rank: 0,
    simulados: [],
    stats: {
      answered: 0,
      correct: 0,
      sessions: 0,
      reviewSessions: 0,
      practiceSessions: 0,
      challengesPassed: 0,
      gamesPlayed: 0,
      studyMs: 0,
      byDay: {},
      hardCorrect: 0,
      run: 0,
      bestRun: 0,
      calcSessions: 0,
      maxDepth: 0,
      itemsBought: 0,
      dailyChests: 0,
    },
    settings: { sound: true },
  };
}

/** Completa campos ausentes (saves antigos continuam funcionando quando o jogo ganha recursos novos). */
function migrate(raw: unknown): SaveData {
  if (!raw || typeof raw !== 'object') throw new Error('Arquivo de save inválido.');
  const data = raw as Partial<SaveData>;
  if (typeof data.version !== 'number' || !data.player) throw new Error('Arquivo de save inválido.');
  const base = defaults(data.player.name);
  return {
    ...base,
    ...data,
    player: { ...base.player, ...data.player },
    streak: { ...base.streak, ...data.streak },
    missions: {
      done: data.missions?.done ?? [],
      daily: { ...base.missions.daily, ...data.missions?.daily },
    },
    inventory: { ...data.inventory },
    owned: [...(data.owned ?? [])],
    outfit: { ...data.outfit },
    achievements: { ...data.achievements },
    simulados: [...(data.simulados ?? [])],
    stats: { ...base.stats, ...data.stats },
    settings: { ...base.settings, ...data.settings },
    version: CURRENT_VERSION,
  } as SaveData;
}

/** XP extra do cafezinho. */
export const BOOST_FACTOR = 1.5;

class GameState {
  data: SaveData = defaults();
  private saveTimer: ReturnType<typeof setTimeout> | undefined;
  private listenersBound = false;

  hasSave(): boolean {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }

  load(): boolean {
    try {
      const text = localStorage.getItem(SAVE_KEY);
      if (!text) return false;
      this.data = migrate(JSON.parse(text));
      this.bindLifecycle();
      return true;
    } catch (err) {
      console.warn('[save] não foi possível carregar o save', err);
      return false;
    }
  }

  newGame(name: string): void {
    this.data = defaults(name.trim() || 'Trainee');
    this.bindLifecycle();
    this.saveNow();
  }

  /** Marca o estado como alterado: avisa a interface e agenda o salvamento. */
  touch(): void {
    this.data.updatedAt = new Date().toISOString();
    events.emit('state:changed');
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveNow(), 600);
  }

  saveNow(): void {
    clearTimeout(this.saveTimer);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.error('[save] falha ao salvar', err);
    }
  }

  exportJson(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importJson(text: string): void {
    this.data = migrate(JSON.parse(text));
    this.saveNow();
  }

  wipe(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignora */
    }
  }

  // ---------- progresso ----------

  addXp(amount: number): void {
    if (amount <= 0) return;
    this.data.xp += Math.round(amount);
    while (this.data.xp >= xpToNextLevel(this.data.level)) {
      this.data.xp -= xpToNextLevel(this.data.level);
      this.data.level += 1;
      events.emit('level:up', { level: this.data.level });
    }
  }

  addCoins(amount: number): void {
    this.data.coins = Math.max(0, this.data.coins + Math.round(amount));
  }

  /**
   * Atualiza a ofensiva (dias seguidos estudando). Chamado ao responder questões e jogar.
   * Cada 🛡️ Folga programada na mochila cobre um dia sem estudo (e é gasta quando você volta).
   */
  registerStudyDay(now = new Date()): void {
    const today = dayKey(now);
    const streak = this.data.streak;
    if (streak.lastDay === today) return;
    const gap = streak.lastDay ? daysBetween(streak.lastDay, today) : Infinity;
    const missed = gap - 1;
    const folgas = this.data.inventory.folga ?? 0;
    if (gap === 1) streak.count += 1;
    else if (missed >= 1 && missed <= folgas && streak.count > 0) {
      this.data.inventory.folga = folgas - missed;
      streak.count += 1;
      events.emit('streak:saved', { days: missed });
    } else streak.count = 1;
    streak.best = Math.max(streak.best, streak.count);
    streak.lastDay = today;
  }

  /** Ofensiva "viva": estudou hoje ou ontem (ou os dias perdidos estão cobertos por folgas). */
  currentStreak(now = new Date()): number {
    const { lastDay, count } = this.data.streak;
    if (!lastDay) return 0;
    return daysBetween(lastDay, dayKey(now)) <= 1 + (this.data.inventory.folga ?? 0) ? count : 0;
  }

  /** Multiplicador de XP (☕ cafezinho ativo = 1,5). */
  xpFactor(now = new Date()): number {
    const until = this.data.boostUntil;
    return until && new Date(until).getTime() > now.getTime() ? BOOST_FACTOR : 1;
  }

  flag(name: string): boolean {
    return this.data.flags[name] === true;
  }

  setFlag(name: string, value = true): void {
    if (this.data.flags[name] === value) return;
    this.data.flags[name] = value;
    this.touch();
  }

  isTopicLearned(topicId: string): boolean {
    return Boolean(this.data.topics[topicId]?.learnedAt);
  }

  subject(subjectId: string): SubjectProgress {
    return (this.data.subjects[subjectId] ??= {});
  }

  private bindLifecycle(): void {
    if (this.listenersBound || typeof window === 'undefined') return;
    this.listenersBound = true;
    const flush = () => this.saveNow();
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
  }
}

export const state = new GameState();
