/**
 * Missões: uma trilha principal (tutorial que ensina o ciclo de estudo) + 3 missões diárias.
 */
import { events } from '../core/events';
import { hashString, mulberry32, shuffle } from '../core/rng';
import { state } from '../core/state';
import { dayKey } from '../core/time';
import { allTopics, content } from '../learning/content';
import { depthMeters, topicTier } from '../learning/mastery';
import { toast } from '../ui/toasts';
import { grant, itemById } from './items';

export interface MainMission {
  id: string;
  title: string;
  hint: string;
  done: () => boolean;
  reward: { xp: number; coins: number };
}

const learnedCount = () => allTopics().filter((t) => state.isTopicLearned(t.id)).length;

export const MAIN_MISSIONS: MainMission[] = [
  { id: 'm-joaquim', title: 'Chegada à vila', hint: 'Converse com **Seu Joaquim**, perto da fonte da praça.', done: () => state.flag('talked:joaquim'), reward: { xp: 10, coins: 5 } },
  { id: 'm-primeira-licao', title: 'Primeira lição', hint: 'Aprenda um tópico com um mentor — a **Profª Lúcia** fica na Biblioteca, ao norte.', done: () => learnedCount() >= 1, reward: { xp: 20, coins: 10 } },
  { id: 'm-horta', title: 'A Horta do Saber', hint: 'Visite a **Horta do Saber** (ao lado da sua casa) e veja sua primeira muda.', done: () => state.flag('visited:horta'), reward: { xp: 15, coins: 10 } },
  { id: 'm-refinaria', title: 'Refinaria Escola', hint: 'Siga a estrada para o **leste** até a **Refinaria Escola**: lá ficam os Conhecimentos Específicos.', done: () => state.flag('visited:refinaria'), reward: { xp: 20, coins: 10 } },
  { id: 'm-jogo', title: 'Hora do jogo', hint: 'Jogue um **minijogo** (📦 Esteira, 🔗 Conexões, 📋 Procedimento ou 🔬 Bancada): nos equipamentos, com os mentores ou no **Salão de Jogos**.', done: () => state.data.stats.gamesPlayed >= 1, reward: { xp: 25, coins: 15 } },
  { id: 'm-tres-topicos', title: 'Planta em operação', hint: 'Aprenda **3 tópicos** — os equipamentos parados da Refinaria esperam por você.', done: () => learnedCount() >= 3, reward: { xp: 40, coins: 20 } },
  { id: 'm-regar', title: 'Hora de regar', hint: 'Quando uma planta **murchar**, regue-a (faça a revisão). Volte amanhã se nada murchou ainda!', done: () => state.data.stats.reviewSessions >= 1, reward: { xp: 40, coins: 20 } },
  { id: 'm-desafio', title: 'Primeiro desafio', hint: 'Vença o **desafio** de um mentor (70% de acertos).', done: () => state.data.stats.challengesPassed >= 1, reward: { xp: 60, coins: 30 } },
  { id: 'm-1000m', title: 'Rumo ao fundo', hint: 'Alcance **1.000 m** de profundidade. Revisões espaçadas fazem o poço avançar!', done: () => depthMeters() >= 1000, reward: { xp: 80, coins: 40 } },
  { id: 'm-ofensiva', title: 'Constância', hint: 'Estude **5 dias seguidos** (ofensiva 🔥 5).', done: () => state.data.streak.best >= 5, reward: { xp: 100, coins: 50 } },
  { id: 'm-armazem', title: 'Equipamento de proteção', hint: 'Gaste suas moedas: compre um item no **Armazém da Dona Cida**, na praça. A mochila abre com **I**.', done: () => state.data.stats.itemsBought >= 1, reward: { xp: 30, coins: 20 } },
  { id: 'm-nivel-prova', title: 'Nível prova', hint: 'Revise um tópico ao longo dos dias até liberar as questões **nível prova** (★★★) nele.', done: () => allTopics().some((t) => state.isTopicLearned(t.id) && topicTier(t) === 3), reward: { xp: 80, coins: 40 } },
  { id: 'm-simulado', title: 'Hora do simulado', hint: 'Faça um **simulado** no **Centro de Pesquisas**, a leste da praça: a prova em miniatura, com tempo e sem dicas.', done: () => state.data.simulados.length >= 1, reward: { xp: 60, coins: 30 } },
  { id: 'm-bloco1', title: 'Laboratório de Fundamentos', hint: 'Estude **todos os tópicos do Bloco 1** (Engº Otávio): é o bloco que mais pesa — 20 questões.', done: () => subjectDone('bloco1'), reward: { xp: 120, coins: 60 } },
  { id: 'm-2000m', title: 'Abaixo da lâmina d’água', hint: 'Alcance **2.000 m** de profundidade: revise o que já estudou para a maestria crescer.', done: () => state.data.stats.maxDepth >= 2000, reward: { xp: 120, coins: 60 } },
  { id: 'm-bloco2', title: 'Casa de Máquinas', hint: 'Estude **todos os tópicos do Bloco 2** (Engª Beatriz).', done: () => subjectDone('bloco2'), reward: { xp: 120, coins: 60 } },
  { id: 'm-bloco3', title: 'Oficina de Manutenção', hint: 'Estude **todos os tópicos do Bloco 3** (Mestra Dandara).', done: () => subjectDone('bloco3'), reward: { xp: 120, coins: 60 } },
  { id: 'm-basicos', title: 'Sem zerar a base', hint: 'Estude **todos os tópicos de Português e Inglês**: zerar qualquer um dos dois elimina.', done: () => subjectDone('portugues') && subjectDone('ingles'), reward: { xp: 100, coins: 50 } },
  { id: 'm-desafios', title: 'Todos os mentores', hint: 'Vença o **desafio** de cada matéria (70% de acertos, com tempo e sem dicas).', done: () => content.subjects.filter((s) => s.topics.length).every((s) => state.subject(s.id).challengePassedAt), reward: { xp: 150, coins: 80 } },
  { id: 'm-simulado-completo', title: 'Ensaio geral', hint: 'Faça o **simulado completo** (70 questões, 4 h) e acerte **70%** ou mais.', done: () => state.data.simulados.some((s) => s.kind === 'completo' && s.correct / s.total >= 0.7), reward: { xp: 250, coins: 120 } },
  { id: 'm-5000m', title: 'Camada de sal', hint: 'Alcance **5.000 m** de profundidade.', done: () => state.data.stats.maxDepth >= 5000, reward: { xp: 200, coins: 100 } },
  { id: 'm-pre-sal', title: 'Pré-sal', hint: 'Alcance **7.000 m**: todo o conteúdo dominado. Depois disso, só a prova!', done: () => state.data.stats.maxDepth >= 7000, reward: { xp: 500, coins: 300 } },
];

function subjectDone(subjectId: string): boolean {
  const subject = content.subjectById.get(subjectId);
  return Boolean(subject?.topics.length) && subject!.topics.every((t) => state.isTopicLearned(t.id));
}

export function currentMainMission(): MainMission | null {
  return MAIN_MISSIONS.find((m) => !state.data.missions.done.includes(m.id)) ?? null;
}

// ---------------------------------------------------------------- diárias

export type DailyCounter = 'answered' | 'correct' | 'reviewSessions' | 'practiceSessions' | 'learned' | 'challenges' | 'games' | 'calc' | 'hard' | 'gameLevel2';

export interface DailyMission {
  id: string;
  title: string;
  counter: DailyCounter;
  target: number;
  reward: { xp: number; coins: number };
}

export const DAILY_POOL: DailyMission[] = [
  { id: 'd-responder-10', title: 'Responda 10 questões', counter: 'answered', target: 10, reward: { xp: 20, coins: 15 } },
  { id: 'd-acertar-8', title: 'Acerte 8 questões de primeira', counter: 'correct', target: 8, reward: { xp: 25, coins: 20 } },
  { id: 'd-regar', title: 'Regue a horta (1 revisão)', counter: 'reviewSessions', target: 1, reward: { xp: 25, coins: 20 } },
  { id: 'd-treino', title: 'Faça um treino misto com um mentor', counter: 'practiceSessions', target: 1, reward: { xp: 20, coins: 15 } },
  { id: 'd-aprender', title: 'Aprenda um tópico novo', counter: 'learned', target: 1, reward: { xp: 25, coins: 15 } },
  { id: 'd-responder-25', title: 'Maratona: responda 25 questões', counter: 'answered', target: 25, reward: { xp: 45, coins: 30 } },
  { id: 'd-desafio', title: 'Encare um desafio de mentor', counter: 'challenges', target: 1, reward: { xp: 30, coins: 20 } },
  { id: 'd-jogos', title: 'Jogue 2 minijogos', counter: 'games', target: 2, reward: { xp: 25, coins: 20 } },
  { id: 'd-ordem', title: 'Conclua uma ordem de serviço (cálculos)', counter: 'calc', target: 1, reward: { xp: 25, coins: 20 } },
  { id: 'd-prova', title: 'Acerte 3 questões nível prova (★★★)', counter: 'hard', target: 3, reward: { xp: 35, coins: 25 } },
  { id: 'd-nivel2', title: 'Jogue um minijogo no nível 2 ou 3', counter: 'gameLevel2', target: 1, reward: { xp: 25, coins: 20 } },
];

/** Baú do dia: aberto ao concluir as 3 missões diárias. */
export const DAILY_CHEST = { coins: 20, xp: 20 };

export function ensureDaily(now = new Date()): void {
  const today = dayKey(now);
  const daily = state.data.missions.daily;
  if (daily.day === today) return;
  const r = mulberry32(hashString(today + state.data.createdAt));
  const ids = shuffle(DAILY_POOL, r).slice(0, 3).map((m) => m.id);
  state.data.missions.daily = { day: today, ids, counters: {}, claimed: [] };
  state.touch();
}

export function dailyMissions(): { mission: DailyMission; progress: number; claimed: boolean }[] {
  ensureDaily();
  const daily = state.data.missions.daily;
  return daily.ids
    .map((id) => DAILY_POOL.find((m) => m.id === id))
    .filter((m): m is DailyMission => Boolean(m))
    .map((mission) => ({ mission, progress: Math.min(mission.target, daily.counters[mission.counter] ?? 0), claimed: daily.claimed.includes(mission.id) }));
}

function bump(counter: DailyCounter, amount = 1): void {
  ensureDaily();
  const c = state.data.missions.daily.counters;
  c[counter] = (c[counter] ?? 0) + amount;
}

// ---------------------------------------------------------------- verificação

export function checkMissions(): void {
  let changed = false;
  for (let guard = 0; guard < MAIN_MISSIONS.length; guard++) {
    const m = currentMainMission();
    if (!m || !m.done()) break;
    state.data.missions.done.push(m.id);
    state.addXp(m.reward.xp);
    state.addCoins(m.reward.coins);
    toast(`Missão concluída: **${m.title}** (+${m.reward.xp} XP, +${m.reward.coins} 💰)`, 'mission', '🏅');
    events.emit('mission:completed', { id: m.id, title: m.title });
    changed = true;
  }
  const dailies = dailyMissions();
  for (const { mission, progress, claimed } of dailies) {
    if (claimed || progress < mission.target) continue;
    state.data.missions.daily.claimed.push(mission.id);
    state.addXp(mission.reward.xp);
    state.addCoins(mission.reward.coins);
    toast(`Missão diária: **${mission.title}** (+${mission.reward.coins} 💰)`, 'mission', '📜');
    changed = true;
  }
  const daily = state.data.missions.daily;
  if (!daily.chest && dailies.length && dailies.every((d) => daily.claimed.includes(d.mission.id))) {
    daily.chest = true;
    state.data.stats.dailyChests += 1;
    state.addXp(DAILY_CHEST.xp);
    state.addCoins(DAILY_CHEST.coins);
    const bonus = chestBonus(daily.day);
    if (bonus) grant(bonus);
    const item = bonus ? itemById.get(bonus) : undefined;
    toast(`🎁 **Baú do dia** aberto: +${DAILY_CHEST.coins} 💰${item ? ` e ${item.icon} ${item.name}` : ''}!`, 'mission', '🎁');
    changed = true;
  }
  if (changed) state.touch();
}

/** Item extra do baú (sorteio fixo por dia): às vezes um cafezinho, raramente uma folga. */
function chestBonus(day: string): string | null {
  const r = mulberry32(hashString(`bau${day}${state.data.createdAt}`))();
  if (r < 0.12) return 'folga';
  if (r < 0.5) return 'cafe';
  return null;
}

let bound = false;

export function bindMissionTracking(): void {
  if (bound) return;
  bound = true;
  events.on('answer', ({ correct, firstAttempt, difficulty }) => {
    if (!firstAttempt) return;
    bump('answered');
    if (correct) bump('correct');
    if (correct && difficulty === 3) bump('hard');
  });
  events.on('session:completed', (s) => {
    if (s.kind === 'review') bump('reviewSessions');
    if (s.kind === 'practice') bump('practiceSessions');
    if (s.kind === 'challenge') bump('challenges');
    if (s.kind === 'calc') bump('calc');
    checkMissions();
  });
  events.on('game:completed', ({ level }) => {
    bump('games');
    if (level >= 2) bump('gameLevel2');
    checkMissions();
  });
  events.on('topic:learned', () => {
    bump('learned');
    checkMissions();
  });
  events.on('state:changed', () => {
    // verificação barata e sem efeitos quando nada mudou
    const m = currentMainMission();
    if (m?.done()) queueMicrotask(checkMissions);
  });
}
