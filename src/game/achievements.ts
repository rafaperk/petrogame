/**
 * Conquistas: metas de longo prazo com recompensa (moedas, XP e às vezes um item).
 * Ficam na aba "Conquistas" do Caderno; cada uma é verificada quando algo muda no progresso.
 */
import { state } from '../core/state';
import { allTopics, content } from '../learning/content';
import { gameLevel } from '../learning/games';
import { depthMeters, plantStage, topicMastery, totalDue } from '../learning/mastery';
import { simuladoVerdict } from '../learning/session';

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
  reward: { coins: number; xp: number; item?: string };
  /** Progresso atual e meta (para a barra). */
  progress: () => [number, number];
}

const learned = () => allTopics().filter((t) => state.isTopicLearned(t.id));
const count = (n: number, target: number): [number, number] => [Math.min(n, target), target];
const flag = (ok: boolean): [number, number] => [ok ? 1 : 0, 1];

function partLearned(part: 'basicos' | 'especificos' | string): [number, number] {
  const topics = allTopics().filter((t) => {
    const s = content.subjectById.get(t.subjectId);
    return part === 'basicos' ? s?.exam?.part === 'basicos' : t.subjectId === part;
  });
  return [topics.filter((t) => state.isTopicLearned(t.id)).length, Math.max(1, topics.length)];
}

const bestStage = () => Math.max(0, ...learned().map((t) => plantStage(topicMastery(t))));
const labsPlayed = () => [...content.gameById.values()].filter(({ game }) => game.type === 'lab' && (state.data.gstats[game.id]?.plays ?? 0) > 0).length;
const challengeSubjects = () => content.subjects.filter((s) => s.topics.length);

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'a-licao', icon: '📖', title: 'Primeira lição', desc: 'Estude o primeiro tópico com um mentor.', reward: { coins: 10, xp: 10 }, progress: () => count(learned().length, 1) },
  { id: 'a-5-topicos', icon: '🌱', title: 'Canteiro cheio', desc: 'Estude 5 tópicos.', reward: { coins: 25, xp: 30 }, progress: () => count(learned().length, 5) },
  { id: 'a-15-topicos', icon: '🏭', title: 'Meia refinaria', desc: 'Estude 15 tópicos.', reward: { coins: 50, xp: 60, item: 'cafe' }, progress: () => count(learned().length, 15) },
  { id: 'a-todos', icon: '🗺️', title: 'Edital percorrido', desc: 'Estude todos os tópicos do jogo.', reward: { coins: 120, xp: 150, item: 'folga' }, progress: () => count(learned().length, allTopics().length) },
  { id: 'a-basicos', icon: '📚', title: 'Base sólida', desc: 'Estude todos os tópicos de Português e Inglês.', reward: { coins: 40, xp: 50 }, progress: () => partLearned('basicos') },
  { id: 'a-bloco1', icon: '⚙️', title: 'Laboratório em operação', desc: 'Estude todos os tópicos do Bloco 1.', reward: { coins: 60, xp: 80 }, progress: () => partLearned('bloco1') },
  { id: 'a-bloco2', icon: '🔧', title: 'Casa de Máquinas', desc: 'Estude todos os tópicos do Bloco 2.', reward: { coins: 60, xp: 80 }, progress: () => partLearned('bloco2') },
  { id: 'a-bloco3', icon: '🔥', title: 'Oficina completa', desc: 'Estude todos os tópicos do Bloco 3.', reward: { coins: 60, xp: 80 }, progress: () => partLearned('bloco3') },

  { id: 'a-50q', icon: '✍️', title: 'Aquecimento', desc: 'Responda 50 questões.', reward: { coins: 15, xp: 20 }, progress: () => count(state.data.stats.answered, 50) },
  { id: 'a-250q', icon: '✍️', title: 'Ritmo de prova', desc: 'Responda 250 questões.', reward: { coins: 40, xp: 60, item: 'cafe' }, progress: () => count(state.data.stats.answered, 250) },
  { id: 'a-1000q', icon: '🏋️', title: 'Mil questões', desc: 'Responda 1.000 questões.', reward: { coins: 120, xp: 200, item: 'folga' }, progress: () => count(state.data.stats.answered, 1000) },
  { id: 'a-seq10', icon: '🎯', title: 'Dez seguidas', desc: 'Acerte 10 questões seguidas de primeira (sem dica).', reward: { coins: 30, xp: 40 }, progress: () => count(state.data.stats.bestRun, 10) },
  { id: 'a-seq25', icon: '🎯', title: 'Mira de prova', desc: 'Acerte 25 questões seguidas de primeira (sem dica).', reward: { coins: 70, xp: 100 }, progress: () => count(state.data.stats.bestRun, 25) },
  { id: 'a-prova25', icon: '⭐', title: 'Nível prova', desc: 'Acerte de primeira 25 questões nível prova (★★★).', reward: { coins: 50, xp: 80 }, progress: () => count(state.data.stats.hardCorrect, 25) },
  { id: 'a-prova100', icon: '🌟', title: 'Cabeça de banca', desc: 'Acerte de primeira 100 questões nível prova.', reward: { coins: 120, xp: 200 }, progress: () => count(state.data.stats.hardCorrect, 100) },
  { id: 'a-calc10', icon: '🧮', title: 'Calculista', desc: 'Conclua 10 ordens de serviço (contas com números sorteados).', reward: { coins: 40, xp: 60 }, progress: () => count(state.data.stats.calcSessions, 10) },

  { id: 'a-rega10', icon: '💧', title: 'Mão boa para regar', desc: 'Faça 10 sessões de revisão.', reward: { coins: 30, xp: 40 }, progress: () => count(state.data.stats.reviewSessions, 10) },
  { id: 'a-emdia', icon: '🌤️', title: 'Tudo em dia', desc: 'Tenha 5 ou mais tópicos estudados e nenhuma revisão pendente.', reward: { coins: 30, xp: 40 }, progress: () => flag(learned().length >= 5 && totalDue() === 0) },
  { id: 'a-ofensiva7', icon: '🔥', title: 'Uma semana', desc: 'Estude 7 dias seguidos.', reward: { coins: 40, xp: 60, item: 'folga' }, progress: () => count(state.data.streak.best, 7) },
  { id: 'a-ofensiva30', icon: '🔥', title: 'Um mês', desc: 'Estude 30 dias seguidos.', reward: { coins: 150, xp: 250 }, progress: () => count(state.data.streak.best, 30) },
  { id: 'a-flor', icon: '🌷', title: 'Primeira flor', desc: 'Leve um tópico ao 4º estágio (Florindo ou Estável).', reward: { coins: 30, xp: 50 }, progress: () => count(bestStage(), 3) },
  { id: 'a-fruto', icon: '🍎', title: 'Maestria', desc: 'Leve um tópico ao estágio máximo (Frutificando ou Otimizado).', reward: { coins: 60, xp: 100 }, progress: () => count(bestStage(), 4) },

  { id: 'a-jogos10', icon: '🎮', title: 'Freguês do Salão', desc: 'Jogue 10 partidas de minijogos.', reward: { coins: 20, xp: 30 }, progress: () => count(state.data.stats.gamesPlayed, 10) },
  { id: 'a-nivel3', icon: '🏅', title: 'Nível 3', desc: 'Leve um minijogo ao Nível 3 · Prova.', reward: { coins: 30, xp: 50 }, progress: () => count(Math.max(1, ...[...content.gameById.keys()].map((id) => gameLevel(id))), 3) },
  { id: 'a-bancadas', icon: '🔬', title: 'Laboratorista', desc: 'Jogue 5 bancadas diferentes.', reward: { coins: 40, xp: 60 }, progress: () => count(labsPlayed(), 5) },

  { id: 'a-desafio', icon: '🏆', title: 'Primeiro desafio', desc: 'Vença o desafio de um mentor.', reward: { coins: 20, xp: 30 }, progress: () => count(state.data.stats.challengesPassed, 1) },
  { id: 'a-desafios', icon: '🏆', title: 'Todos os mentores', desc: 'Vença o desafio de todas as matérias.', reward: { coins: 100, xp: 150, item: 'cafe' }, progress: () => count(challengeSubjects().filter((s) => state.subject(s.id).challengePassedAt).length, challengeSubjects().length) },
  { id: 'a-simulado', icon: '📝', title: 'Primeiro simulado', desc: 'Faça um simulado no Centro de Pesquisas.', reward: { coins: 20, xp: 30 }, progress: () => count(state.data.simulados.length, 1) },
  { id: 'a-aprovado', icon: '🎓', title: 'Passaria na prova', desc: 'Cumpra os mínimos do edital num simulado de 20 ou mais questões.', reward: { coins: 60, xp: 100 }, progress: () => flag(state.data.simulados.some((s) => s.total >= 20 && simuladoVerdict(s.parts).ok)) },
  { id: 'a-simulado70', icon: '🎓', title: 'Nota de classificação', desc: 'Acerte 70% ou mais num simulado completo (70 questões).', reward: { coins: 150, xp: 250, item: 'folga' }, progress: () => flag(state.data.simulados.some((s) => s.kind === 'completo' && s.correct / s.total >= 0.7)) },

  { id: 'a-1000m', icon: '⛏', title: '1.000 m', desc: 'Alcance 1.000 m de profundidade.', reward: { coins: 20, xp: 30 }, progress: () => count(state.data.stats.maxDepth, 1000) },
  { id: 'a-2000m', icon: '🌊', title: 'Abaixo da lâmina d’água', desc: 'Alcance 2.000 m de profundidade.', reward: { coins: 40, xp: 60 }, progress: () => count(state.data.stats.maxDepth, 2000) },
  { id: 'a-5000m', icon: '💠', title: 'Camada de sal', desc: 'Alcance 5.000 m de profundidade.', reward: { coins: 100, xp: 150 }, progress: () => count(state.data.stats.maxDepth, 5000) },
  { id: 'a-7000m', icon: '🛢️', title: 'Pré-sal!', desc: 'Alcance 7.000 m: o conteúdo todo dominado.', reward: { coins: 300, xp: 500 }, progress: () => count(state.data.stats.maxDepth, 7000) },

  { id: 'a-epi', icon: '⛑️', title: 'EPI completo', desc: 'Use capacete, colete e óculos de segurança ao mesmo tempo.', reward: { coins: 20, xp: 20 }, progress: () => flag(Boolean(state.data.outfit.vest && state.data.outfit.glasses && state.data.outfit.hat?.startsWith('capacete'))) },
];

export function isUnlocked(id: string): boolean {
  return Boolean(state.data.achievements[id]);
}

/** Atualiza a profundidade máxima e devolve as conquistas recém-desbloqueadas (já marcadas no save). */
export function collectAchievements(now = new Date()): AchievementDef[] {
  const depth = depthMeters(now);
  if (depth > state.data.stats.maxDepth) state.data.stats.maxDepth = depth;
  const fresh: AchievementDef[] = [];
  for (const a of ACHIEVEMENTS) {
    if (isUnlocked(a.id)) continue;
    const [value, target] = a.progress();
    if (value < target) continue;
    state.data.achievements[a.id] = now.toISOString();
    fresh.push(a);
  }
  return fresh;
}
