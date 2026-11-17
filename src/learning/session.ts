/**
 * Sessões de estudo: quais questões entram (planejamento) e o que acontece a cada resposta (execução).
 * Não depende de interface — a UI apenas "dirige" o SessionRunner.
 */
import { REWARDS, SESSION, SIMULADO } from '../config';
import { events } from '../core/events';
import { shuffle } from '../core/rng';
import { state, type SimuladoPart } from '../core/state';
import { dayKey } from '../core/time';
import { content } from './content';
import { dueQuestions, plantStage, questionScore, topicMastery, topicTier, type PlantStage } from './mastery';
import { materialize } from './gen';
import { getCard, gradeFor, reviewQuestion, type Grade } from './srs';
import type { Question, StaticQuestion, Subject, Topic } from './types';

export type SessionKind = 'learn' | 'practice' | 'review' | 'challenge' | 'calc' | 'simulado';

export interface SessionPlan {
  kind: SessionKind;
  title: string;
  subjectId?: string;
  topicIds: string[];
  questionIds: string[];
  allowHints: boolean;
  /** Repetir no fim da sessão as questões erradas (recuperação imediata após o feedback). */
  retryWrong: boolean;
  timeLimitSec?: number;
  /** Simulado: rápido (20 questões) ou completo (70). */
  simulado?: 'rapido' | 'completo';
}

export interface SessionItem {
  questionId: string;
  /** Questão pronta para exibir (as geradas já vêm com os números sorteados). */
  question: StaticQuestion;
  /** Veio de um gerador (valores sorteados)? */
  generated: boolean;
  topic: Topic;
  attempt: number;
  /** Posição entre as questões originais (1..total); repetições não contam. */
  position: number;
  total: number;
}

export interface AnswerOutcome {
  correct: boolean;
  grade: Grade;
  xp: number;
  coins: number;
  nextDue: Date;
  willRetry: boolean;
}

export interface TopicDelta {
  topicId: string;
  name: string;
  before: number;
  after: number;
  stageBefore: PlantStage;
  stageAfter: PlantStage;
}

export interface SessionSummary {
  kind: SessionKind;
  title: string;
  subjectId?: string;
  total: number;
  answered: number;
  correctFirstTry: number;
  xp: number;
  coins: number;
  durationMs: number;
  timeUp: boolean;
  passed?: boolean;
  topics: TopicDelta[];
  /** Acertos por matéria (Português, Inglês, Blocos...), na ordem do edital. */
  parts: SimuladoPart[];
  simulado?: 'rapido' | 'completo';
}

const unique = <T>(items: T[]) => [...new Set(items)];
const learnedTopics = (subject: Subject) => subject.topics.filter((t) => state.isTopicLearned(t.id));

// ---------------------------------------------------------------- planejamento

/** Prática guiada logo após a lição: questões novas, das mais fáceis às mais difíceis. */
export function planLearn(topic: Topic, now: Date = new Date()): SessionPlan {
  const unseen = topic.questions.filter((q) => !getCard(q.id)).sort((a, b) => a.difficulty - b.difficulty);
  let picked = unseen.filter((q) => q.difficulty <= 2).slice(0, SESSION.learnSize);
  if (picked.length < SESSION.learnSize) {
    const rest = topic.questions
      .filter((q) => !picked.includes(q))
      .sort((a, b) => a.difficulty - b.difficulty || questionScore(a.id, now) - questionScore(b.id, now));
    picked = [...picked, ...rest].slice(0, SESSION.learnSize).sort((a, b) => a.difficulty - b.difficulty);
  }
  return {
    kind: 'learn',
    title: `Prática guiada · ${topic.name}`,
    subjectId: topic.subjectId,
    topicIds: [topic.id],
    questionIds: picked.map((q) => q.id),
    allowHints: true,
    retryWrong: true,
  };
}

/** Revisão das questões vencidas (as plantas murchas). */
export function planReview(topics: Topic[], now: Date = new Date(), limit = SESSION.reviewSize): SessionPlan | null {
  const due = topics.flatMap((t) => dueQuestions(t, now).map((id) => ({ id, topic: t, due: getCard(id)!.dueAt.getTime() })));
  if (!due.length) return null;
  due.sort((a, b) => a.due - b.due);
  const chosen = shuffle(due.slice(0, limit));
  const single = topics.length === 1 ? topics[0] : undefined;
  return {
    kind: 'review',
    title: single ? `Regando · ${single.name}` : 'Revisão do dia',
    subjectId: single?.subjectId,
    topicIds: unique(chosen.map((c) => c.topic.id)),
    questionIds: chosen.map((c) => c.id),
    allowHints: true,
    retryWrong: true,
  };
}

/** Treino intercalado da matéria: vencidas + fracas + algumas novas, tudo misturado. */
export function planPractice(subject: Subject, now: Date = new Date(), limit = SESSION.practiceSize): SessionPlan | null {
  const topics = learnedTopics(subject);
  if (!topics.length) return null;
  const pool: string[] = [];
  const add = (id: string) => {
    if (pool.length < limit && !pool.includes(id)) pool.push(id);
  };
  const inTier = (t: Topic, q: Question) => q.difficulty <= topicTier(t, now);

  topics.flatMap((t) => dueQuestions(t, now)).slice(0, Math.ceil(limit / 2)).forEach(add);
  const fresh = shuffle(topics.flatMap((t) => t.questions.filter((q) => !getCard(q.id) && inTier(t, q))));
  fresh.slice(0, Math.max(1, Math.floor(limit / 4))).forEach((q) => add(q.id));
  topics
    .flatMap((t) => t.questions.filter((q) => getCard(q.id) && inTier(t, q)))
    .sort((a, b) => questionScore(a.id, now) - questionScore(b.id, now))
    .forEach((q) => add(q.id));
  fresh.forEach((q) => add(q.id));
  shuffle(topics.flatMap((t) => t.questions)).forEach((q) => add(q.id));

  return {
    kind: 'practice',
    title: `Treino misto · ${subject.short}`,
    subjectId: subject.id,
    topicIds: topics.map((t) => t.id),
    questionIds: shuffle(pool),
    allowHints: true,
    retryWrong: true,
  };
}

/** Treino focado em um único tópico (pela horta). */
export function planTopicPractice(topic: Topic, now: Date = new Date(), limit = 6): SessionPlan {
  const tier = topicTier(topic, now);
  const ranked = [...topic.questions].sort((a, b) => {
    const aw = a.difficulty <= tier ? 0 : 1;
    const bw = b.difficulty <= tier ? 0 : 1;
    return aw - bw || questionScore(a.id, now) - questionScore(b.id, now);
  });
  return {
    kind: 'practice',
    title: `Treino · ${topic.name}`,
    subjectId: topic.subjectId,
    topicIds: [topic.id],
    questionIds: shuffle(ranked.slice(0, limit).map((q) => q.id)),
    allowHints: true,
    retryWrong: true,
  };
}

/** Ordem de serviço: problemas de cálculo do tópico, com valores sorteados (completa com outras questões se precisar). */
export function planCalc(topic: Topic, now: Date = new Date(), limit = 4): SessionPlan | null {
  const gens = shuffle(topic.questions.filter((q) => q.type === 'gen'));
  if (!gens.length) return null;
  const extra = [...topic.questions]
    .filter((q) => q.type !== 'gen' && q.difficulty <= topicTier(topic, now))
    .sort((a, b) => questionScore(a.id, now) - questionScore(b.id, now));
  const picked = [...gens, ...extra].slice(0, Math.max(limit, Math.min(gens.length, 6)));
  return {
    kind: 'calc',
    title: `Ordem de serviço · ${topic.name}`,
    subjectId: topic.subjectId,
    topicIds: [topic.id],
    questionIds: picked.map((q) => q.id),
    allowHints: true,
    retryWrong: true,
  };
}

/**
 * Treino por roteiro: questões do mesmo tipo em sequência, da mais fácil para a mais difícil, para fixar o
 * método (as geradas mudam os números). É escolha do jogador treinar o tipo, então todos os níveis entram;
 * entre as de mesmo nível, as mais fracas primeiro.
 */
export function planRoteiro(name: string, items: { question: Question; topic: Topic }[], now: Date = new Date(), limit = 6): SessionPlan | null {
  if (!items.length) return null;
  const picked = shuffle(items)
    .sort((a, b) => questionScore(a.question.id, now) - questionScore(b.question.id, now))
    .slice(0, limit)
    .sort((a, b) => a.question.difficulty - b.question.difficulty);
  const subjects = unique(picked.map((p) => p.topic.subjectId));
  return {
    kind: 'practice',
    title: `Roteiro · ${name}`,
    subjectId: subjects.length === 1 ? subjects[0] : undefined,
    topicIds: unique(picked.map((p) => p.topic.id)),
    questionIds: picked.map((p) => p.question.id),
    allowHints: true,
    retryWrong: true,
  };
}

/** Desafio do mentor: estilo prova, com tempo, sem dicas e sem segunda chance. */
export function planChallenge(subject: Subject): SessionPlan | null {
  const topics = learnedTopics(subject);
  if (!topics.length) return null;
  const all = topics.flatMap((t) => t.questions);
  const hard = shuffle(all.filter((q) => q.difficulty >= 2));
  const easy = shuffle(all.filter((q) => q.difficulty < 2));
  const picked = [...hard, ...easy].slice(0, SESSION.challengeSize);
  return {
    kind: 'challenge',
    title: `Desafio · ${subject.place}`,
    subjectId: subject.id,
    topicIds: topics.map((t) => t.id),
    questionIds: shuffle(picked.map((q) => q.id)),
    allowHints: false,
    retryWrong: false,
    timeLimitSec: picked.length * SESSION.challengeSecondsPerQuestion,
  };
}

/** Matérias na ordem da prova (Básicos, depois Específicos). */
export function examSubjects(): Subject[] {
  const partRank = (s: Subject) => (s.exam?.part === 'basicos' ? 0 : 1);
  return content.subjects.filter((s) => s.exam).sort((a, b) => partRank(a) - partRank(b) || a.order - b.order);
}

/** Quantas questões de cada matéria entram num simulado de `size` questões (proporcional à prova). */
export function simuladoQuotas(size: number): { subject: Subject; quota: number }[] {
  const subjects = examSubjects();
  const total = subjects.reduce((s, x) => s + (x.exam?.questions ?? 0), 0);
  return subjects.map((subject) => ({ subject, quota: Math.round(((subject.exam?.questions ?? 0) * size) / total) }));
}

/**
 * Simulado: a prova em miniatura. Mesma divisão por matéria, só de tópicos já estudados, priorizando
 * nível prova e múltipla escolha (o formato da Cesgranrio), sem dicas e com o tempo proporcional ao da prova.
 */
export function planSimulado(kind: 'rapido' | 'completo'): SessionPlan | null {
  const picked: string[] = [];
  const topicIds = new Set<string>();
  for (const { subject, quota } of simuladoQuotas(SIMULADO[kind])) {
    const topics = learnedTopics(subject);
    if (!topics.length || !quota) continue;
    const rank = (q: Question) => (q.type === 'ce' ? 9 : 3 - q.difficulty);
    const queues = new Map(
      topics.map((t) => [t.id, shuffle(t.questions).sort((a, b) => rank(a) - rank(b))]),
    );
    const rotation = shuffle(topics.flatMap((t) => Array<Topic>(t.weight).fill(t)));
    let added = 0;
    for (let i = 0; added < quota && i < quota * 40; i++) {
      const topic = rotation[i % rotation.length];
      const q = queues.get(topic.id)?.shift();
      if (!q) continue;
      picked.push(q.id);
      topicIds.add(topic.id);
      added += 1;
    }
  }
  if (!picked.length) return null;
  return {
    kind: 'simulado',
    title: kind === 'rapido' ? 'Simulado rápido' : 'Simulado completo',
    topicIds: [...topicIds],
    questionIds: picked,
    allowHints: false,
    retryWrong: false,
    timeLimitSec: Math.round(picked.length * SIMULADO.minutesPerQuestion * 60),
    simulado: kind,
  };
}

/** Critérios do edital: Básicos e Específicos com pelo menos 50% e sem zerar Português nem Inglês. */
export function simuladoVerdict(parts: SimuladoPart[]): { basicos: number | null; especificos: number | null; zeroed: string[]; ok: boolean } {
  const sum = (part: string) => {
    const ps = parts.filter((p) => content.subjectById.get(p.subjectId)?.exam?.part === part);
    const total = ps.reduce((s, p) => s + p.total, 0);
    return total ? ps.reduce((s, p) => s + p.correct, 0) / total : null;
  };
  const basicos = sum('basicos');
  const especificos = sum('especificos');
  const zeroed = parts
    .filter((p) => content.subjectById.get(p.subjectId)?.exam?.part === 'basicos' && p.total > 0 && p.correct === 0)
    .map((p) => content.subjectById.get(p.subjectId)?.short ?? p.subjectId);
  const ok = (basicos === null || basicos >= 0.5) && (especificos === null || especificos >= 0.5) && !zeroed.length && (basicos !== null || especificos !== null);
  return { basicos, especificos, zeroed, ok };
}

// ---------------------------------------------------------------- execução

export class SessionRunner {
  readonly plan: SessionPlan;
  timeUp = false;
  private queue: { questionId: string; attempt: number; position: number }[];
  private firstResults = new Map<string, boolean>();
  private xp = 0;
  private coins = 0;
  private readonly startedAt = Date.now();
  private readonly before = new Map<string, number>();

  constructor(plan: SessionPlan, now: Date = new Date()) {
    this.plan = plan;
    this.queue = plan.questionIds.map((questionId, i) => ({ questionId, attempt: 1, position: i + 1 }));
    for (const id of plan.topicIds) {
      const topic = content.topicById.get(id);
      if (topic) this.before.set(id, topicMastery(topic, now));
    }
  }

  get total(): number {
    return this.plan.questionIds.length;
  }

  get answered(): number {
    return this.firstResults.size;
  }

  get correctFirstTry(): number {
    return [...this.firstResults.values()].filter(Boolean).length;
  }

  next(): SessionItem | null {
    while (this.queue.length) {
      const entry = this.queue.shift()!;
      const found = content.questionById.get(entry.questionId);
      if (!found) continue;
      // geradas: números novos a cada aparição (inclusive na repetição — o que se treina é o método)
      const seed = Math.floor(Math.random() * 2 ** 32);
      return {
        ...entry,
        question: materialize(found.question, seed),
        generated: found.question.type === 'gen',
        topic: found.topic,
        total: this.total,
      };
    }
    return null;
  }

  answer(item: SessionItem, correct: boolean, usedHint: boolean, now: Date = new Date()): AnswerOutcome {
    const first = item.attempt === 1;
    const grade = gradeFor(correct, usedHint);
    const card = reviewQuestion(item.questionId, grade, now);
    const data = state.data;

    const stat = (data.qstats[item.questionId] ??= { seen: 0, correct: 0, lastSeen: '' });
    stat.seen += 1;
    if (correct) stat.correct += 1;
    stat.lastSeen = now.toISOString();

    if (first) {
      this.firstResults.set(item.questionId, correct);
      data.stats.answered += 1;
      if (correct) data.stats.correct += 1;
      const day = (data.stats.byDay[dayKey(now)] ??= { answered: 0, correct: 0 });
      day.answered += 1;
      if (correct) day.correct += 1;
      if (correct && !usedHint) {
        data.stats.run += 1;
        data.stats.bestRun = Math.max(data.stats.bestRun, data.stats.run);
        if (item.question.difficulty === 3) data.stats.hardCorrect += 1;
      } else data.stats.run = 0;
    }

    let xp = 0;
    let coins = 0;
    if (first) {
      xp = correct ? REWARDS.correctXp[item.question.difficulty] * (usedHint ? REWARDS.hintFactor : 1) : REWARDS.wrongXp;
      coins = correct && !usedHint ? REWARDS.coinsPerCorrect : 0;
    } else if (correct) {
      xp = REWARDS.retryCorrectXp;
    }
    xp = Math.round(xp * state.xpFactor(now));
    this.xp += xp;
    this.coins += coins;
    state.addXp(xp);
    state.addCoins(coins);
    state.registerStudyDay(now);

    const willRetry = !correct && this.plan.retryWrong && item.attempt < 2;
    if (willRetry) this.queue.push({ questionId: item.questionId, attempt: item.attempt + 1, position: item.position });

    state.touch();
    events.emit('answer', { questionId: item.questionId, topicId: item.topic.id, correct, firstAttempt: first, difficulty: item.question.difficulty });
    return { correct, grade, xp, coins, nextDue: card.dueAt, willRetry };
  }

  finish(now: Date = new Date()): SessionSummary {
    const data = state.data;
    const { kind } = this.plan;
    const durationMs = Date.now() - this.startedAt;
    const correct = this.correctFirstTry;
    let passed: boolean | undefined;

    if (this.answered > 0) {
      data.stats.sessions += 1;
      // sessão esquecida aberta não vira "horas de estudo"
      data.stats.studyMs += Math.min(durationMs, Math.max(1, this.total) * 5 * 60_000);
      if (kind === 'review') {
        data.stats.reviewSessions += 1;
        this.bonus(REWARDS.reviewSessionXp, REWARDS.reviewSessionCoins);
      }
      if (kind === 'practice' || kind === 'calc') data.stats.practiceSessions += 1;
      if (kind === 'calc') data.stats.calcSessions += 1;
    }

    const partMap = new Map<string, SimuladoPart>();
    for (const id of this.plan.questionIds) {
      const found = content.questionById.get(id);
      if (!found) continue;
      const sid = found.topic.subjectId;
      const part = partMap.get(sid) ?? { subjectId: sid, total: 0, correct: 0 };
      part.total += 1;
      if (this.firstResults.get(id)) part.correct += 1;
      partMap.set(sid, part);
    }
    const order = examSubjects().map((s) => s.id);
    const parts = [...partMap.values()].sort((a, b) => order.indexOf(a.subjectId) - order.indexOf(b.subjectId));

    if (kind === 'simulado' && this.plan.simulado && this.answered > 0) {
      const sim = this.plan.simulado;
      data.simulados.push({ date: now.toISOString(), kind: sim, total: this.total, correct, parts });
      if (data.simulados.length > 30) data.simulados.splice(0, data.simulados.length - 30);
      passed = simuladoVerdict(parts).ok;
      // bônus só para quem foi até o fim (ou quase)
      if (this.answered >= this.total * 0.8) this.bonus(SIMULADO.xpBonus[sim], SIMULADO.coinsBonus[sim]);
    }

    if (kind === 'challenge' && this.plan.subjectId) {
      const rate = this.total ? correct / this.total : 0;
      passed = rate >= SESSION_PASS_RATE;
      const progress = state.subject(this.plan.subjectId);
      progress.challengeBest = Math.max(progress.challengeBest ?? 0, rate);
      if (passed) {
        const firstPass = !progress.challengePassedAt;
        progress.challengePassedAt ??= now.toISOString();
        data.stats.challengesPassed += 1;
        this.bonus(firstPass ? REWARDS.challengePassXp : Math.round(REWARDS.challengePassXp / 4), firstPass ? REWARDS.challengePassCoins : 10);
      }
    }

    const topics: TopicDelta[] = [];
    for (const [id, before] of this.before) {
      const topic = content.topicById.get(id);
      if (!topic) continue;
      const after = topicMastery(topic, now);
      topics.push({ topicId: id, name: topic.name, before, after, stageBefore: plantStage(before), stageAfter: plantStage(after) });
    }

    state.touch();
    const summary: SessionSummary = {
      kind,
      title: this.plan.title,
      subjectId: this.plan.subjectId,
      total: this.total,
      answered: this.answered,
      correctFirstTry: correct,
      xp: this.xp,
      coins: this.coins,
      durationMs,
      timeUp: this.timeUp,
      passed,
      topics,
      parts,
      simulado: this.plan.simulado,
    };
    if (this.answered > 0) events.emit('session:completed', summary);
    return summary;
  }

  private bonus(baseXp: number, coins: number): void {
    const xp = Math.round(baseXp * state.xpFactor());
    this.xp += xp;
    this.coins += coins;
    state.addXp(xp);
    state.addCoins(coins);
  }
}

const SESSION_PASS_RATE = SESSION.challengePassRate;
