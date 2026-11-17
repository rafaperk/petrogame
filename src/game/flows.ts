/**
 * Fluxos de jogo (roteiros assíncronos): conversar com mentores, aprender, revisar, jogar, desafiar...
 * Cada fluxo usa os componentes de interface com async/await, então ler o código = ler o roteiro.
 */
import { portraitOf } from '../art/characters';
import { CARGO } from '../content/cargo';
import { REWARDS, SIMULADO } from '../config';
import { sfx } from '../core/audio';
import { events } from '../core/events';
import { pick } from '../core/rng';
import { state } from '../core/state';
import { formatUntil } from '../core/time';
import { allTopics, content } from '../learning/content';
import { applyGameResult, GAME_INFO, gameStatus, type GameOutcome } from '../learning/games';
import {
  dueCount,
  dueGames,
  fieldOf,
  missingRequirements,
  nextDueDate,
  plantStage,
  stageEmoji,
  stageName,
  topicMastery,
  topicStatus,
  topicTier,
  type PlantStage,
} from '../learning/mastery';
import { planCalc, planChallenge, planLearn, planPractice, planReview, planSimulado, planTopicPractice, SessionRunner, simuladoQuotas, simuladoVerdict, type SessionPlan, type SessionSummary } from '../learning/session';
import type { GameDef, Subject, Topic } from '../learning/types';
import { choose, say, type Speaker } from '../ui/dialog';
import { pct } from '../ui/dom';
import { playLab } from '../ui/games/lab';
import { playMatch } from '../ui/games/match';
import { playOrder } from '../ui/games/order';
import type { GameContext } from '../ui/games/shell';
import { playSort } from '../ui/games/sort';
import { labName, openLab, topicLabs } from '../ui/labs';
import { showLesson } from '../ui/lesson';
import { runQuiz } from '../ui/quiz';
import { showResults } from '../ui/results';
import { openBackpack, openShop } from '../ui/shop';
import { toast } from '../ui/toasts';
import { checkMissions } from './missions';
import { npcById, type NpcDef } from './npcs';

const TIER_LABEL = ['', 'básico', 'intermediário', 'nível prova'];

export function speakerOf(npc: NpcDef): Speaker {
  return { name: npc.name, title: npc.title, portrait: portraitOf(`npc-${npc.id}`) };
}

function mentorOf(subject: Subject): NpcDef | undefined {
  return npcById.get(subject.mentorId);
}

const learnedOf = (topics: Topic[]) => topics.filter((t) => state.isTopicLearned(t.id));

function toastStage(topic: Topic, before: PlantStage, after: PlantStage): void {
  if (after <= before) return;
  const verb = fieldOf(topic) === 'refinaria' ? 'melhorou' : 'cresceu';
  toast(`**${topic.name}** ${verb}: ${stageName(topic, before)} → ${stageName(topic, after)}`, 'good', stageEmoji(topic, after));
}

// ---------------------------------------------------------------- sessões

export async function runSession(plan: SessionPlan | null): Promise<SessionSummary | null> {
  if (!plan || !plan.questionIds.length) {
    await say(null, 'Não há questões disponíveis para esta sessão agora.');
    return null;
  }
  const runner = new SessionRunner(plan);
  await runQuiz(runner);
  const summary = runner.finish();
  if (summary.answered > 0) {
    await showResults(summary);
    for (const t of summary.topics) {
      const topic = content.topicById.get(t.topicId);
      if (topic) toastStage(topic, t.stageBefore, t.stageAfter);
    }
  }
  events.emit('garden:changed');
  checkMissions();
  return summary;
}

// ---------------------------------------------------------------- minijogos

export async function playGameFlow(game: GameDef, topic: Topic): Promise<GameOutcome | null> {
  const subject = content.subjectById.get(topic.subjectId)!;
  const ctx: GameContext = { topic, subject, finish: (r) => applyGameResult(game, topic, r) };
  const outcome = await (game.type === 'sort'
    ? playSort(game, ctx)
    : game.type === 'match'
      ? playMatch(game, ctx)
      : game.type === 'lab'
        ? playLab(game, ctx)
        : playOrder(game, ctx));
  if (outcome) toastStage(topic, outcome.stageBefore, outcome.stageAfter);
  events.emit('garden:changed');
  checkMissions();
  return outcome;
}

function gameLabel(game: GameDef, topic: Topic | null): string {
  const info = GAME_INFO[game.type];
  const st = gameStatus(game);
  const status = st.due ? '💧 revisar' : st.fresh ? '✨ novo' : st.label;
  return `${info.icon} ${info.name}: ${game.title}${topic ? ` · *${topic.name}*` : ''} — ${status}`;
}

/** Lista os jogos dos tópicos já estudados (vencidos primeiro, depois os novos). */
export async function gamesMenu(topics: Topic[], speaker: Speaker | null, prompt = 'Qual jogo?'): Promise<void> {
  for (;;) {
    const entries = learnedOf(topics)
      .flatMap((t) => t.games.map((g) => ({ g, t, st: gameStatus(g) })))
      .sort((a, b) => Number(b.st.due) - Number(a.st.due) || Number(b.st.fresh) - Number(a.st.fresh));
    if (!entries.length) {
      await say(speaker, 'Ainda não há jogos liberados aqui. Estude um tópico e os jogos dele aparecem!');
      return;
    }
    const showTopic = new Set(entries.map((e) => e.t.id)).size > 1;
    const idx = await choose(speaker, prompt, [...entries.map((e) => gameLabel(e.g, showTopic ? e.t : null)), 'Voltar'], { cancel: entries.length });
    if (idx >= entries.length) return;
    await playGameFlow(entries[idx].g, entries[idx].t);
  }
}

/** Salão de Jogos da vila: todos os jogos, de todas as matérias. */
export async function arcadeFlow(): Promise<void> {
  const withGames = allTopics().filter((t) => t.games.length);
  const unlocked = learnedOf(withGames);
  if (!unlocked.length) {
    await say(null, [
      '**Salão de Jogos** 🎮\nAqui ficam os minijogos de **todas as matérias**: Esteira 📦, Conexões 🔗, Procedimento 📋 e as **Bancadas** 🔬 (simulações de bomba, Venturi, trocador de calor, diagrama Fe-C, cilindro com pistão, ciclos Otto, Diesel e Brayton, usina a vapor, refrigerador, compressor alternativo, ensaio de tração, viga em flexão, encruamento e recozimento, ensaio de impacto Charpy, motor sobre molas com vibração livre, ressonância e absorvedor, rampa com atrito e rolamento, o redutor de engrenagens de um guincho, a pilha de corrosão com proteção catódica, o motor de indução com o alternador, a árvore em dois mancais com a bucha lubrificada e a prensa de molas com o macaco de parafuso).',
      'Os jogos de um tópico são liberados quando você o estuda com um mentor (ou direto no equipamento da Refinaria). Volte depois da primeira lição!',
    ]);
    return;
  }
  const subjects = content.subjects.filter((s) => unlocked.some((t) => t.subjectId === s.id));
  for (;;) {
    const due = unlocked.flatMap((t) => dueGames(t).map((g) => ({ g, t })));
    const options = [due.length ? `💧 Revisar jogando (${due.length} ${due.length > 1 ? 'jogos vencidos' : 'jogo vencido'})` : '🎲 Jogo surpresa', ...subjects.map((s) => `${s.icon} ${s.name}`), 'Sair'];
    const idx = await choose(null, '**Salão de Jogos** 🎮 — escolha uma matéria ou deixe a sorte decidir.', options, { cancel: options.length - 1 });
    if (idx === options.length - 1) return;
    if (idx === 0) {
      const pool = due.length ? due : unlocked.flatMap((t) => t.games.map((g) => ({ g, t })));
      const choice = pick(pool);
      await playGameFlow(choice.g, choice.t);
      continue;
    }
    const subject = subjects[idx - 1];
    await gamesMenu(subject.topics, null, `${subject.icon} **${subject.name}** — qual jogo?`);
  }
}

// ---------------------------------------------------------------- aprender e revisar

export async function learnTopicFlow(topic: Topic, speaker?: Speaker): Promise<void> {
  const result = await showLesson(topic, { finishLabel: 'Praticar agora ✍️' });
  if (result === 'closed') {
    if (speaker) await say(speaker, 'Sem pressa. Quando quiser continuar, é só voltar aqui.');
    return;
  }
  if (!state.isTopicLearned(topic.id)) {
    state.data.topics[topic.id] = { learnedAt: new Date().toISOString() };
    state.addXp(REWARDS.learnTopicXp);
    state.touch();
    events.emit('topic:learned', { topicId: topic.id });
    events.emit('garden:changed');
    const where = fieldOf(topic) === 'refinaria' ? 'Novo equipamento em teste na Refinaria' : 'Nova muda na Horta do Saber';
    toast(`${where}: **${topic.name}** (+${REWARDS.learnTopicXp} XP)`, 'good', fieldOf(topic) === 'refinaria' ? '🔧' : '🌱');
  }
  if (speaker) await say(speaker, 'Agora vamos fixar. Responda com calma e **leia a explicação** de cada questão — inclusive quando acertar.');
  const summary = await runSession(planLearn(topic));
  if (!summary?.answered) return;
  const fresh = topic.games.find((g) => gameStatus(g).fresh);
  if (fresh) {
    const info = GAME_INFO[fresh.type];
    const go = await choose(speaker ?? null, `Quer fixar de outro jeito? Tem um jogo deste tópico: ${info.icon} **${info.name}: ${fresh.title}**.`, ['▶ Jogar agora', 'Depois'], { cancel: 1 });
    if (go === 0) await playGameFlow(fresh, topic);
  }
}

export async function reviewTopicsFlow(topics: Topic[], emptyText?: string): Promise<void> {
  const plan = planReview(topics);
  const games = learnedOf(topics).flatMap((t) => dueGames(t).map((g) => ({ g, t })));
  if (!plan && !games.length) {
    const next = topics
      .map((t) => nextDueDate(t))
      .filter((d): d is Date => Boolean(d))
      .sort((a, b) => a.getTime() - b.getTime())[0];
    await say(null, emptyText ?? `Nada para revisar agora 🌤️${next ? ` — a próxima revisão é ${formatUntil(next)}.` : '.'}`);
    return;
  }
  sfx.water();
  if (plan) await runSession(plan);
  for (const { g, t } of games.slice(0, 3)) {
    const info = GAME_INFO[g.type];
    const go = await choose(null, `Revisão em forma de jogo: ${info.icon} **${info.name}: ${g.title}** (${t.name}).`, ['▶ Jogar', 'Fica para depois'], { cancel: 1 });
    if (go !== 0) break;
    await playGameFlow(g, t);
  }
}

export async function reviewAllFlow(): Promise<void> {
  const learned = learnedOf(allTopics());
  if (!learned.length) {
    await say(null, 'Você ainda não estudou nenhum tópico. Visite um mentor para aprender o primeiro!');
    return;
  }
  await reviewTopicsFlow(learned);
}

// ---------------------------------------------------------------- mentores

function topicLabel(topic: Topic): string {
  const status = topicStatus(topic);
  if (status === 'locked') return `🔒 ${topic.name}`;
  if (status === 'available') return `✨ ${topic.name} — *novo*`;
  const m = topicMastery(topic);
  const stage = plantStage(m);
  return `${stageEmoji(topic, stage)} ${topic.name} — ${stageName(topic, stage)} (${pct(m)})`;
}

async function learnMenu(subject: Subject, speaker: Speaker): Promise<void> {
  const topics = subject.topics;
  if (!topics.length) {
    await say(speaker, 'Ainda estou preparando os tópicos desta matéria. Volte em breve!');
    return;
  }
  const idx = await choose(speaker, 'Qual tópico você quer estudar?', [...topics.map(topicLabel), 'Voltar'], { cancel: topics.length });
  if (idx >= topics.length) return;
  const topic = topics[idx];
  const status = topicStatus(topic);
  if (status === 'locked') {
    const missing = missingRequirements(topic).map((t) => `**${t.name}**`).join(', ');
    await say(speaker, `Antes de **${topic.name}**, você precisa estudar (e lembrar bem de) ${missing}. Um passo de cada vez!`);
    return;
  }
  if (status === 'learned') {
    const again = await choose(speaker, `Você já estudou **${topic.name}**. Quer rever a lição e treinar de novo?`, ['Sim, rever e treinar', 'Voltar'], { cancel: 1 });
    if (again === 0) await learnTopicFlow(topic, speaker);
    return;
  }
  await say(speaker, `**${topic.name}**: ${topic.summary}`);
  await learnTopicFlow(topic, speaker);
}

async function lessonMenu(subject: Subject, speaker: Speaker): Promise<void> {
  const learned = learnedOf(subject.topics);
  const idx = await choose(speaker, 'Qual lição você quer rever?', [...learned.map((t) => `📖 ${t.name}`), 'Voltar'], { cancel: learned.length });
  if (idx < learned.length) await showLesson(learned[idx], { finishLabel: 'Fechar' });
}

async function challengeFlow(subject: Subject, speaker: Speaker): Promise<void> {
  const plan = planChallenge(subject);
  if (!plan) {
    await say(speaker, 'Aprenda pelo menos um tópico antes de encarar o desafio!');
    return;
  }
  const best = state.subject(subject.id).challengeBest;
  const minutes = Math.round((plan.timeLimitSec ?? 0) / 60);
  const go = await choose(
    speaker,
    `**Desafio:** ${plan.questionIds.length} questões no estilo da prova, **${minutes} min**, sem dicas. Para vencer: **70%** de acertos.${best ? ` Seu recorde: **${pct(best)}**.` : ''}`,
    ['Valendo! 🏁', 'Agora não'],
    { cancel: 1 },
  );
  if (go !== 0) return;
  const summary = await runSession(plan);
  if (!summary || summary.answered === 0) return;
  await say(speaker, summary.passed ? 'Mandou muito bem! Esse é o nível da prova — agora é manter com revisões.' : 'Faltou pouco. Treine os tópicos mais fracos e volte quando quiser tentar de novo.');
}

export async function talkToMentor(npc: NpcDef): Promise<void> {
  const speaker = speakerOf(npc);
  const subject = npc.subjectId ? content.subjectById.get(npc.subjectId) : undefined;
  if (!subject) {
    await say(speaker, 'Ainda estou preparando minhas aulas. Volte em breve!');
    return;
  }
  const progress = state.subject(subject.id);
  if (!progress.introSeen) {
    await say(speaker, npc.intro ?? [`Olá, {nome}! Eu ensino ${subject.name}.`]);
    progress.introSeen = true;
    state.touch();
  } else {
    await say(speaker, pick(npc.lines));
  }
  for (;;) {
    const learned = learnedOf(subject.topics);
    const available = subject.topics.filter((t) => topicStatus(t) === 'available');
    const due = learned.reduce((sum, t) => sum + dueCount(t), 0);
    const games = learned.reduce((sum, t) => sum + t.games.length, 0);
    const options: { label: string; run: () => Promise<void> }[] = [
      { label: `📖 Aprender um tópico${available.length ? ` (${available.length} novo${available.length > 1 ? 's' : ''})` : ''}`, run: () => learnMenu(subject, speaker) },
    ];
    if (learned.length) {
      if (due) options.push({ label: `💧 Revisar o que venceu (${due})`, run: () => reviewTopicsFlow(learned) });
      options.push({ label: '✍️ Treino misto', run: async () => void (await runSession(planPractice(subject))) });
      if (games) options.push({ label: `🎮 Jogos (${games})`, run: () => gamesMenu(subject.topics, speaker) });
      options.push({ label: `🏆 Desafio: ${subject.place}`, run: () => challengeFlow(subject, speaker) });
      options.push({ label: '📚 Rever uma lição', run: () => lessonMenu(subject, speaker) });
    }
    options.push({ label: 'Até mais!', run: async () => {} });
    const idx = await choose(speaker, 'O que vamos fazer?', options.map((o) => o.label), { cancel: options.length - 1 });
    if (idx === options.length - 1) return;
    await options[idx].run();
  }
}

// ---------------------------------------------------------------- outros NPCs

function examExplanation(): string[] {
  const [basicos, especificos] = CARGO.parts;
  const blocks = content.subjects
    .filter((s) => s.exam?.part === 'especificos')
    .map((s) => `**${s.short}** (${s.exam!.questions})`)
    .join(', ');
  return [
    `Seu cargo: **${CARGO.name}**. Ainda não saiu edital novo, então usamos o último da Cesgranrio para ele: *${CARGO.reference}*.`,
    `São **${basicos.questions + especificos.questions} questões** de múltipla escolha (A a E). **${basicos.name}**: ${basicos.questions} — Português e Inglês, 10 de cada. ${basicos.rule}`,
    `**${especificos.name}**: ${especificos.questions} — ${blocks}. ${especificos.rule}`,
    'Tradução: os **Específicos decidem a sua colocação** — eles moram na **Refinaria Escola**, a leste. Mas não descuide da base: zerar Português ou Inglês elimina!',
    'No **Caderno** (tecla **C**), a aba **Edital** mostra cada item do conteúdo programático e o quanto você já domina dele.',
  ];
}

export async function talkToGuide(npc: NpcDef): Promise<void> {
  const speaker = speakerOf(npc);
  if (!state.flag('talked:joaquim')) {
    await say(speaker, npc.intro ?? npc.lines);
    state.setFlag('talked:joaquim');
    checkMissions();
    return;
  }
  for (;;) {
    const idx = await choose(speaker, pick(['Precisa de algo, {nome}?', 'Como vão os estudos?', 'Diga lá!']), [
      '💬 Uma dica de estudo',
      '📋 Como é a prova?',
      '🎮 Para que servem os minijogos?',
      '🌱 Como funcionam a Horta e a Refinaria?',
      '⛏ O que é a profundidade?',
      'Até logo!',
    ], { cancel: 5 });
    if (idx === 5) return;
    if (idx === 0) await say(speaker, pick(npc.lines));
    if (idx === 1) await say(speaker, examExplanation());
    if (idx === 2) {
      await say(speaker, [
        'Cada jogo treina a memória de um jeito: na **Esteira** 📦 você separa conceitos parecidos (é o que a banca explora nas pegadinhas); em **Conexões** 🔗 liga termos às definições; no **Procedimento** 📋 monta sequências — partida de bomba, ciclos, etapas de processo.',
        'Nas **Bancadas** 🔬 você mexe numa simulação de verdade — a bomba cavitando, o Venturi, o trocador, o diagrama ferro-carbono, o pistão, o motor de 4 tempos, a turbina a gás, a usina a vapor, a geladeira, o compressor de ar, o corpo de prova rompendo na máquina de tração, a viga flechando, a chapa encruando no laminador, o pêndulo do Charpy quebrando o aço gelado, o motor sacudindo nas molas até a ressonância, a caixa que não sai do lugar na rampa, as engrenagens do guincho trocando rotação por torque, o zinco se sacrificando para salvar o aço, o campo girante arrastando o rotor do motor, a árvore chicoteando na velocidade crítica, o macaco que desce sozinho — e **aposta antes de ver** o que vai acontecer. Errar a previsão e ver o motivo grava muito mais do que ler.',
        'Nas **Ordens de serviço** 🧮 os números das contas mudam a cada vez: você treina o **método**, não decora a resposta.',
        'E todo jogo entra na revisão espaçada, igual às questões: quando ele vence, o tópico pede revisão e você joga de novo. Os jogos aparecem com os mentores, nos equipamentos da Refinaria e no **Salão de Jogos** da praça.',
      ]);
    }
    if (idx === 3) {
      await say(speaker, [
        'Cada tópico de **Português** e **Inglês** vira uma **planta** na Horta do Saber. Os **Específicos** viram **equipamentos** na Refinaria: bomba, turbina, forno, painel...',
        'Os dois funcionam igual: crescem (ou melhoram) conforme a sua **memória de longo prazo** fica mais forte. Quando a chance de você lembrar cai, a planta **murcha** — ou o equipamento pede **manutenção** 🔧. É a hora certa de revisar.',
        'Revisar na hora certa é o que mais fixa conteúdo. E quanto mais firme o tópico, mais **difíceis** ficam as questões liberadas: do básico até o nível da prova.',
      ]);
    }
    if (idx === 4) {
      await say(speaker, [
        'A **profundidade** é o seu progresso geral. Ela soma a maestria de todos os tópicos, pesando os que mais caem na prova.',
        'Lá pelos **2.000 m** você sai da lâmina d’água; depois dos **5.000 m** atravessa a camada de sal. Aos **7.000 m**... pré-sal: conteúdo dominado!',
        'Mas atenção: memória que não é revisada enfraquece — e o poço perde profundidade. Por isso, revisão diária!',
      ]);
    }
  }
}

export async function talkToVillager(npc: NpcDef): Promise<void> {
  const speaker = speakerOf(npc);
  const key = `talked:${npc.id}`;
  if (!state.flag(key) && npc.intro) {
    await say(speaker, npc.intro);
    state.setFlag(key);
    return;
  }
  state.setFlag(key);
  await say(speaker, pick(npc.lines));
}

/** Dona Cida: conversa e abre o armazém. */
export async function talkToShopkeeper(npc: NpcDef): Promise<void> {
  const speaker = speakerOf(npc);
  const key = `talked:${npc.id}`;
  if (!state.flag(key) && npc.intro) {
    await say(speaker, npc.intro);
    state.setFlag(key);
  } else await say(speaker, pick(npc.lines));
  await openShop();
  await say(speaker, pick(['Volte sempre, {nome}!', 'Bons estudos! E não esquece do cafezinho.', 'Até mais! Capacete na cabeça, hein?']));
}

export async function talkTo(npcId: string): Promise<void> {
  const npc = npcById.get(npcId);
  if (!npc) return;
  if (npc.role === 'mentor') return talkToMentor(npc);
  if (npc.role === 'guide') return talkToGuide(npc);
  if (npc.role === 'shopkeeper') return talkToShopkeeper(npc);
  return talkToVillager(npc);
}

// ---------------------------------------------------------------- casa e simulados

export async function homeFlow(): Promise<void> {
  const idx = await choose(null, '**Sua casa** 🏠\nO armário com os uniformes e a mochila ficam aqui.', ['🎒 Mochila e guarda-roupa', 'Sair'], { cancel: 1 });
  if (idx === 0) await openBackpack('visual');
}

function simuladoHistory(): string {
  const list = state.data.simulados.slice(-6).reverse();
  if (!list.length) return 'Você ainda não fez nenhum simulado.';
  return list
    .map((s) => {
      const parts = s.parts.map((p) => `${content.subjectById.get(p.subjectId)?.short ?? p.subjectId} ${p.correct}/${p.total}`).join(' · ');
      const verdict = simuladoVerdict(s.parts).ok ? '✅' : '❌';
      return `${verdict} **${new Date(s.date).toLocaleDateString('pt-BR')}** · ${s.kind === 'completo' ? 'completo' : 'rápido'} · **${pct(s.correct / s.total)}** (${s.correct}/${s.total})\n${parts}`;
    })
    .join('\n');
}

/** Centro de Pesquisas: simulados no formato da prova (só com tópicos estudados). */
export async function simuladoFlow(): Promise<void> {
  const learned = learnedOf(allTopics());
  const intro = '**Centro de Pesquisas — sala de simulados** 📝\nA prova em miniatura: mesma divisão por matéria (Português, Inglês e os três blocos), questões **nível prova** primeiro, **sem dicas** e com o tempo da prova (4 h para 70 questões).';
  if (learned.length < SIMULADO.minTopics) {
    await say(null, `${intro}\nO simulado usa só os tópicos que você já estudou. Volte quando tiver estudado pelo menos **${SIMULADO.minTopics} tópicos** (agora: ${learned.length}).`);
    return;
  }
  for (;;) {
    const missing = simuladoQuotas(SIMULADO.completo)
      .filter(({ subject }) => !learnedOf(subject.topics).length)
      .map(({ subject }) => subject.short);
    const last = state.data.simulados.at(-1);
    const best = Math.max(0, ...state.data.simulados.filter((s) => s.total >= 20).map((s) => s.correct / s.total));
    const minutes = (n: number) => Math.round(n * SIMULADO.minutesPerQuestion);
    const lines = [
      intro,
      missing.length ? `Ainda sem tópico estudado (fica fora do simulado): **${missing.join(', ')}**.` : 'Todas as partes da prova já entram. 💪',
      last ? `Último: **${pct(last.correct / last.total)}** (${last.correct}/${last.total})${best ? ` · melhor (20+ questões): **${pct(best)}**` : ''}.` : '',
    ].filter(Boolean);
    const idx = await choose(null, lines.join('\n'), [`📝 Simulado rápido (${SIMULADO.rapido} questões, ~${minutes(SIMULADO.rapido)} min)`, `📋 Simulado completo (${SIMULADO.completo} questões, ~${Math.round(minutes(SIMULADO.completo) / 60)} h)`, '📊 Meus simulados', 'Sair'], { cancel: 3 });
    if (idx === 3) return;
    if (idx === 2) {
      await say(null, simuladoHistory());
      continue;
    }
    const kind = idx === 0 ? 'rapido' : 'completo';
    const plan = planSimulado(kind);
    if (!plan) {
      await say(null, 'Não há questões suficientes nos tópicos estudados. Estude mais um tópico e volte!');
      return;
    }
    const go = await choose(
      null,
      `**${plan.title}:** ${plan.questionIds.length} questões, **${Math.round((plan.timeLimitSec ?? 0) / 60)} min**, sem dicas e sem segunda chance. Para "passar": pelo menos **50%** nos Básicos e nos Específicos, sem zerar Português nem Inglês. Para brigar pela vaga, mire em **70%** ou mais.`,
      ['Valendo! 🏁', 'Agora não'],
      { cancel: 1 },
    );
    if (go !== 0) continue;
    const summary = await runSession(plan);
    if (!summary?.answered) continue;
    const verdict = simuladoVerdict(summary.parts);
    await say(
      null,
      verdict.ok
        ? 'Dentro dos mínimos do edital! Agora o jogo é subir a nota: revise as questões que errou (elas voltam na revisão) e repita o simulado daqui a alguns dias.'
        : 'Abaixo de algum mínimo do edital desta vez. Veja no resultado qual parte puxou para baixo, treine os tópicos dela e tente de novo.',
    );
  }
}

/** Abre a mochila (também pelo menu e pela tecla I). */
export { openBackpack };

// ---------------------------------------------------------------- horta e refinaria

/** Canteiro (horta) ou equipamento (refinaria): o "centro de comando" de um tópico. */
export async function topicFlow(topic: Topic): Promise<void> {
  const subject = content.subjectById.get(topic.subjectId)!;
  const refinery = subject.field === 'refinaria';
  const thing = refinery ? 'Equipamento' : 'Canteiro';
  if (!state.isTopicLearned(topic.id)) {
    const status = topicStatus(topic);
    if (status === 'locked') {
      await say(null, `${thing} de **${topic.name}** (${subject.short}). 🔒 Antes, estude: ${missingRequirements(topic).map((t) => `**${t.name}**`).join(', ')}.`);
      return;
    }
    const mentor = mentorOf(subject);
    const idx = await choose(
      null,
      `${thing} de **${topic.name}** (${subject.short}).\n${topic.summary}\n${refinery ? 'Ainda parado: estude o tópico para colocá-lo em operação.' : 'Aprenda o tópico para plantar aqui.'}`,
      ['📖 Estudar agora (lição + prática)', mentor ? `Depois (também dá para estudar com ${mentor.name})` : 'Depois'],
      { cancel: 1 },
    );
    if (idx === 0) await learnTopicFlow(topic);
    return;
  }
  for (;;) {
    const mastery = topicMastery(topic);
    const stage = plantStage(mastery);
    const due = dueCount(topic);
    const next = nextDueDate(topic);
    const lines = [
      `${stageEmoji(topic, stage)} **${topic.name}** · ${stageName(topic, stage)} — maestria **${pct(mastery)}**`,
      due
        ? `${refinery ? '🔧' : '💧'} **${due}** ${due === 1 ? 'item precisa' : 'itens precisam'} de revisão agora.`
        : next
          ? `🌤️ Tudo em dia. Próxima revisão: ${formatUntil(next)}.`
          : '🌤️ Tudo em dia.',
      `Questões liberadas: até o nível **${TIER_LABEL[topicTier(topic)]}**.`,
    ];
    const options: { label: string; run: () => Promise<void> }[] = [];
    if (due) options.push({ label: `${refinery ? '🔧 Manutenção' : '💧 Regar'} (revisar ${due})`, run: () => reviewTopicsFlow([topic]) });
    if (topic.questions.some((q) => q.type === 'gen')) {
      options.push({ label: '🧮 Ordem de serviço (cálculos com valores sorteados)', run: async () => void (await runSession(planCalc(topic))) });
    }
    for (const lab of topicLabs(topic)) {
      options.push({ label: `🔬 Bancada livre — ${labName(lab.id)} (explore à vontade)`, run: () => openLab(lab.id, { topic, preset: lab.preset }) });
    }
    for (const g of topic.games) options.push({ label: gameLabel(g, null), run: async () => void (await playGameFlow(g, topic)) });
    options.push({ label: '✍️ Treinar este tópico', run: async () => void (await runSession(planTopicPractice(topic))) });
    options.push({ label: '📖 Rever a lição', run: async () => void (await showLesson(topic, { finishLabel: 'Fechar' })) });
    options.push({ label: 'Sair', run: async () => {} });
    const idx = await choose(null, lines.join('\n'), options.map((o) => o.label), { cancel: options.length - 1 });
    if (idx === options.length - 1) return;
    await options[idx].run();
  }
}

export async function gardenRowFlow(subject: Subject): Promise<void> {
  const learned = learnedOf(subject.topics);
  const wilted = learned.filter((t) => dueCount(t) > 0);
  const text = `Fileira de **${subject.name}** ${subject.icon}\n${learned.length}/${subject.topics.length} tópicos plantados${wilted.length ? ` · **${wilted.length}** murcha${wilted.length > 1 ? 's' : ''}` : ''}.`;
  if (!wilted.length) {
    await say(null, text);
    return;
  }
  const idx = await choose(null, text, [`💧 Regar a fileira toda`, 'Sair'], { cancel: 1 });
  if (idx === 0) await reviewTopicsFlow(wilted);
}

/** Placa de uma unidade da Refinaria: resumo do bloco e manutenção em lote. */
export async function unitFlow(subject: Subject): Promise<void> {
  const learned = learnedOf(subject.topics);
  const needs = learned.filter((t) => dueCount(t) > 0);
  const exam = subject.exam ? ` · **${subject.exam.questions} questões** na prova` : '';
  const text = `${subject.icon} **${subject.place}** — ${subject.name}${exam}\n${subject.description}\n${learned.length}/${subject.topics.length} equipamentos em operação${needs.length ? ` · **${needs.length}** pedindo manutenção 🔧` : ''}.`;
  if (!needs.length) {
    await say(null, text);
    return;
  }
  const idx = await choose(null, text, ['🔧 Fazer a manutenção de todos', 'Sair'], { cancel: 1 });
  if (idx === 0) await reviewTopicsFlow(needs);
}

/** Primeira chegada à Refinaria. */
export async function refinariaWelcome(): Promise<void> {
  state.setFlag('intro:refinaria');
  await say(null, [
    'Você chega à **Refinaria Escola**. Aqui ficam os **Conhecimentos Específicos** de Engenharia Mecânica: 50 das 70 questões da prova — e a parte que decide a classificação.',
    'São três unidades, uma por bloco do edital: **Bloco 1** no Laboratório de Fundamentos (Engº Otávio), **Bloco 2** na Casa de Máquinas (Engª Beatriz) e **Bloco 3** na Oficina de Manutenção (Mestra Dandara).',
    'Cada **equipamento** do pátio é um tópico. Cinza = parado: estude o tópico (com o mentor ou direto no equipamento) para colocá-lo em operação.',
    'A lâmpada mostra a maestria, de 🔴 a 🔵, e a **chave inglesa** 🔧 avisa que chegou a hora da manutenção (revisão). Bases vazias são espaço para novos tópicos.',
  ]);
}

export async function infoFlow(title: string, text: string): Promise<void> {
  await say(null, `**${title}**\n\n${text}`);
}
