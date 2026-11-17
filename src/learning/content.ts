/**
 * Registro de conteúdo. Descobre automaticamente todos os arquivos em:
 *   src/content/<materia>/materia.ts        -> defineSubject({...})
 *   src/content/<materia>/topicos/<x>.ts    -> defineTopic({...})
 * Para adicionar conteúdo basta criar arquivos — nenhuma outra parte do código precisa mudar.
 */
import { FORMAT_ROTEIROS } from '../content/roteiros';
import { materialize } from './gen';
import { LAB_MODELS } from './labs';
import type { GameDef, LabGame, LabValues, Question, Roteiro, SolveStep, StaticQuestion, Subject, SubjectDef, Topic, TopicDef } from './types';
import { EQUIPMENT_KINDS, isTrueFalse } from './types';

export interface ContentRegistry {
  subjects: Subject[];
  subjectById: Map<string, Subject>;
  topicById: Map<string, Topic>;
  questionById: Map<string, { question: Question; topic: Topic }>;
  gameById: Map<string, { game: GameDef; topic: Topic }>;
  errors: string[];
}

const folderOf = (path: string, fromEnd: number) => path.split('/').at(-fromEnd) ?? '';

// ---------------------------------------------------------------- roteiros

export const formatRoteiros: Roteiro[] = FORMAT_ROTEIROS;
const formatById = new Map(FORMAT_ROTEIROS.map((r) => [r.id, r]));

/** Roteiro pelo id: os "fmt.*" são globais; os demais, do tópico. */
export function findRoteiro(topic: Pick<Topic, 'roteiros'>, id: string): Roteiro | undefined {
  return id.startsWith('fmt.') ? formatById.get(id) : topic.roteiros?.find((r) => r.id === id);
}

/** Resolução pronta para exibir: o roteiro (se houver) e os passos com o "o que fazer" preenchido. */
export interface Solve {
  roteiro?: Roteiro;
  steps: SolveStep[];
}

export function solveOf(q: StaticQuestion, topic: Pick<Topic, 'roteiros'>): Solve | null {
  if (!q.steps?.length) return null;
  const roteiro = q.roteiro ? findRoteiro(topic, q.roteiro) : undefined;
  const steps = q.steps.map((s, i) => (typeof s === 'string' ? { do: roteiro?.steps[i] ?? '', show: s } : { do: s.do, show: s.show }));
  return { roteiro, steps };
}

/** Problemas nos passos de uma questão pronta (também usado pelo teste que sorteia as geradas). */
export function stepProblems(q: StaticQuestion, topic: Pick<Topic, 'roteiros'>): string[] {
  const out: string[] = [];
  const roteiro = q.roteiro ? findRoteiro(topic, q.roteiro) : undefined;
  if (q.roteiro && !roteiro) out.push(`roteiro inexistente "${q.roteiro}".`);
  if (q.roteiro && !q.steps?.length) out.push(`tem roteiro "${q.roteiro}" mas nenhum passo (steps).`);
  q.steps?.forEach((s, i) => {
    if (typeof s === 'string') {
      if (!s.trim()) out.push(`passo ${i + 1} vazio.`);
      if (!roteiro) out.push(`passo ${i + 1} só tem o texto revelado, mas a questão não tem roteiro (use { do, show }).`);
      else if (!roteiro.steps[i]) out.push(`passo ${i + 1} não existe no roteiro "${roteiro.id}" (${roteiro.steps.length} passos): use { do, show }.`);
    } else if (!s?.do?.trim() || !s?.show?.trim()) out.push(`passo ${i + 1} precisa de "do" e "show".`);
  });
  const text = (q.steps ?? []).map((s) => (typeof s === 'string' ? s : `${s.do} ${s.show}`)).join(' ');
  if (/NaN|Infinity|undefined/.test(text)) out.push('número inválido nos passos.');
  return out;
}

function validateRoteiro(r: Roteiro, where: string, errors: string[]): void {
  if (!r.id?.trim()) errors.push(`${where}: roteiro sem id.`);
  if (!r.name?.trim() || !r.when?.trim()) errors.push(`${where} › roteiro ${r.id}: precisa de "name" e "when".`);
  if (!r.steps?.length || r.steps.some((s) => !s?.trim())) errors.push(`${where} › roteiro ${r.id}: precisa de passos não vazios.`);
}

function validateStatic(q: StaticQuestion, where: string, errors: string[]): void {
  if (!q.prompt?.trim()) errors.push(`${where}: enunciado vazio.`);
  if (!q.explanation?.trim()) errors.push(`${where}: falta a explicação.`);
  if (isTrueFalse(q)) {
    if (typeof q.answer !== 'boolean') errors.push(`${where}: questão C/E precisa de answer true/false.`);
    return;
  }
  if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 5) {
    errors.push(`${where}: múltipla escolha precisa de 2 a 5 alternativas.`);
  } else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) {
    errors.push(`${where}: answer deve ser o índice (0..${q.options.length - 1}) da alternativa correta.`);
  }
}

function validateGame(game: GameDef, where: string, topic: Topic, errors: string[]): void {
  if (!game.title?.trim()) errors.push(`${where}: jogo sem título.`);
  if (game.lessonRef !== undefined && (game.lessonRef < 0 || game.lessonRef >= topic.lesson.length)) {
    errors.push(`${where}: lessonRef ${game.lessonRef} fora do intervalo da lição.`);
  }
  switch (game.type) {
    case 'sort': {
      if (!Array.isArray(game.bins) || game.bins.length < 2 || game.bins.length > 4) errors.push(`${where}: a esteira precisa de 2 a 4 categorias (bins).`);
      if (!Array.isArray(game.items) || game.items.length < 4) errors.push(`${where}: a esteira precisa de pelo menos 4 itens.`);
      game.items?.forEach((it, i) => {
        if (!it.text?.trim()) errors.push(`${where}: item ${i} sem texto.`);
        if (!Number.isInteger(it.bin) || it.bin < 0 || it.bin >= (game.bins?.length ?? 0)) errors.push(`${where}: item "${it.text}" com bin inválido.`);
      });
      const texts = new Set(game.items?.map((it) => it.text));
      if (texts.size !== (game.items?.length ?? 0)) errors.push(`${where}: itens repetidos na esteira.`);
      break;
    }
    case 'match': {
      if (!Array.isArray(game.pairs) || game.pairs.length < 3) errors.push(`${where}: conexões precisam de pelo menos 3 pares.`);
      const lefts = new Set(game.pairs?.map((p) => p.left));
      const rights = new Set(game.pairs?.map((p) => p.right));
      if (lefts.size !== game.pairs?.length || rights.size !== game.pairs?.length) errors.push(`${where}: termos ou definições repetidos nas conexões.`);
      break;
    }
    case 'order': {
      if (!Array.isArray(game.steps) || game.steps.length < 3) errors.push(`${where}: o procedimento precisa de pelo menos 3 passos.`);
      const texts = new Set(game.steps?.map((s) => s.text));
      if (texts.size !== (game.steps?.length ?? 0)) errors.push(`${where}: passos repetidos no procedimento.`);
      break;
    }
    case 'lab':
      validateLab(game, where, errors);
      break;
    default:
      errors.push(`${where}: tipo de jogo desconhecido "${(game as { type?: string }).type}".`);
  }
}

/** Confere as tarefas de uma bancada contra o modelo: controles, leituras e faixas existem. */
function validateLab(game: LabGame, where: string, errors: string[]): void {
  const model = LAB_MODELS[game.lab];
  if (!model) {
    errors.push(`${where}: bancada inexistente "${game.lab}".`);
    return;
  }
  if (!Array.isArray(game.tasks) || game.tasks.length < 2) errors.push(`${where}: a bancada precisa de pelo menos 2 tarefas.`);
  const params = new Map(model.params.map((p) => [p.id, p]));
  const outs = new Set(model.outputs.map((o) => o.id));
  const checkValues = (vals: LabValues | undefined, what: string, i: number) => {
    for (const [k, v] of Object.entries(vals ?? {})) {
      const p = params.get(k);
      if (!p) errors.push(`${where}: tarefa ${i + 1} — ${what} usa o controle inexistente "${k}".`);
      else if (!(v >= p.min && v <= p.max)) errors.push(`${where}: tarefa ${i + 1} — ${what}.${k} = ${v} fora de ${p.min}..${p.max}.`);
    }
  };
  game.tasks?.forEach((t, i) => {
    if (!t.prompt?.trim() || !t.why?.trim()) errors.push(`${where}: tarefa ${i + 1} sem enunciado ou sem explicação (why).`);
    checkValues(t.setup, 'setup', i);
    for (const id of t.lock ?? []) if (!params.has(id)) errors.push(`${where}: tarefa ${i + 1} trava o controle inexistente "${id}".`);
    if (t.kind === 'predict') {
      checkValues(t.change, 'change', i);
      if (!Array.isArray(t.options) || t.options.length < 2 || t.options.length > 5) errors.push(`${where}: tarefa ${i + 1} precisa de 2 a 5 alternativas.`);
      if (!Number.isInteger(t.answer) || t.answer < 0 || t.answer >= (t.options?.length ?? 0)) errors.push(`${where}: tarefa ${i + 1} com resposta fora do intervalo.`);
      if (new Set(t.options).size !== t.options?.length) errors.push(`${where}: tarefa ${i + 1} com alternativas repetidas.`);
      for (const e of t.expect ?? []) if (!outs.has(e.out)) errors.push(`${where}: tarefa ${i + 1} — expect usa a leitura inexistente "${e.out}".`);
    } else if (t.kind === 'goal') {
      if (!t.goals?.length) errors.push(`${where}: tarefa ${i + 1} sem metas.`);
      if (!t.hint?.trim()) errors.push(`${where}: tarefa ${i + 1} sem dica.`);
      checkValues(t.solution, 'solution', i);
      for (const k of Object.keys(t.solution ?? {})) if (t.lock?.includes(k)) errors.push(`${where}: tarefa ${i + 1} — a solução mexe no controle travado "${k}".`);
      for (const g of t.goals ?? []) {
        if (!outs.has(g.out)) errors.push(`${where}: tarefa ${i + 1} — meta com a leitura inexistente "${g.out}".`);
        if (g.min === undefined && g.max === undefined) errors.push(`${where}: tarefa ${i + 1} — meta sem min/max.`);
        if (g.min !== undefined && g.max !== undefined && g.min > g.max) errors.push(`${where}: tarefa ${i + 1} — meta com min > max.`);
      }
    } else errors.push(`${where}: tarefa ${i + 1} de tipo desconhecido.`);
  });
}

export function buildRegistry(
  subjectModules: Record<string, SubjectDef>,
  topicModules: Record<string, TopicDef>,
): ContentRegistry {
  const errors: string[] = [];
  const subjectById = new Map<string, Subject>();
  const topicById = new Map<string, Topic>();
  const questionById = new Map<string, { question: Question; topic: Topic }>();
  const gameById = new Map<string, { game: GameDef; topic: Topic }>();
  const itemIds = new Set<string>();

  for (const r of FORMAT_ROTEIROS) {
    validateRoteiro(r, 'content/roteiros.ts', errors);
    if (!r.id.startsWith('fmt.')) errors.push(`content/roteiros.ts: o roteiro de formato "${r.id}" deve começar com "fmt.".`);
  }

  for (const [path, def] of Object.entries(subjectModules)) {
    const folder = folderOf(path, 2);
    if (!def?.id) {
      errors.push(`${path}: matéria sem "id" (use export default defineSubject({...})).`);
      continue;
    }
    if (def.id !== folder) errors.push(`${path}: o id "${def.id}" deve ser igual ao nome da pasta "${folder}".`);
    if (subjectById.has(def.id)) errors.push(`Matéria duplicada: ${def.id}`);
    if (def.equipment && !EQUIPMENT_KINDS.includes(def.equipment)) errors.push(`${def.id}: equipamento desconhecido "${def.equipment}".`);
    const examIds = new Set<string>();
    for (const item of def.exam?.items ?? []) {
      if (examIds.has(item.id)) errors.push(`${def.id}: item de edital repetido "${item.id}".`);
      examIds.add(item.id);
    }
    subjectById.set(def.id, { ...def, field: def.field ?? 'horta', topics: [] });
  }

  for (const [path, def] of Object.entries(topicModules)) {
    const subjectId = folderOf(path, 3);
    const subject = subjectById.get(subjectId);
    const where = `${subjectId}/topicos/${folderOf(path, 1)}`;
    if (!subject) {
      errors.push(`${where}: a pasta "${subjectId}" não tem materia.ts.`);
      continue;
    }
    if (!def?.id) {
      errors.push(`${where}: tópico sem "id" (use export default defineTopic({...})).`);
      continue;
    }
    if (topicById.has(def.id)) errors.push(`${where}: id de tópico duplicado "${def.id}".`);
    if (!def.lesson?.length) errors.push(`${where}: o tópico precisa de pelo menos um card de lição.`);
    def.lesson?.forEach((card, i) => {
      if (!card.lab) return;
      const model = LAB_MODELS[card.lab.lab];
      if (!model) errors.push(`${where}: card ${i} aponta para a bancada inexistente "${card.lab.lab}".`);
      else for (const k of Object.keys(card.lab.preset ?? {})) if (!model.params.some((p) => p.id === k)) errors.push(`${where}: card ${i} — preset com o controle inexistente "${k}".`);
    });
    if (!def.questions?.length) errors.push(`${where}: o tópico precisa de pelo menos uma questão.`);
    if (def.equipment && !EQUIPMENT_KINDS.includes(def.equipment)) errors.push(`${where}: equipamento desconhecido "${def.equipment}".`);

    const topic: Topic = {
      ...def,
      subjectId,
      order: def.order ?? 99,
      weight: def.weight ?? 2,
      requires: def.requires ?? [],
      edital: def.edital ?? [],
      games: def.games ?? [],
      roteiros: def.roteiros ?? [],
      lesson: def.lesson ?? [],
      questions: def.questions ?? [],
    };
    topicById.set(topic.id, topic);
    subject.topics.push(topic);

    const roteiroIds = new Set<string>();
    for (const r of topic.roteiros) {
      validateRoteiro(r, where, errors);
      if (r.id?.startsWith('fmt.')) errors.push(`${where}: "fmt.*" é reservado aos roteiros de formato (content/roteiros.ts).`);
      if (roteiroIds.has(r.id)) errors.push(`${where}: roteiro repetido "${r.id}".`);
      roteiroIds.add(r.id);
      if (!topic.questions.some((q) => q.roteiro === r.id)) errors.push(`${where}: o roteiro "${r.id}" não é usado por nenhuma questão.`);
    }

    const examIds = new Set([...subjectById.values()].flatMap((s) => s.exam?.items.map((i) => i.id) ?? []));
    for (const ref of topic.edital) {
      if (!examIds.has(ref)) errors.push(`${where}: item de edital "${ref}" não existe em nenhuma matéria (exam.items em materia.ts).`);
    }

    const claimId = (id: string | undefined, label: string): boolean => {
      if (!id) {
        errors.push(`${label}: sem id.`);
        return false;
      }
      if (itemIds.has(id)) {
        errors.push(`${label}: id repetido (questões e jogos compartilham o mesmo espaço de ids).`);
        return false;
      }
      itemIds.add(id);
      return true;
    };

    for (const q of topic.questions) {
      const qWhere = `${where} › ${q.id ?? '(sem id)'}`;
      if (claimId(q.id, qWhere)) questionById.set(q.id, { question: q, topic });
      if (![1, 2, 3].includes(q.difficulty)) errors.push(`${qWhere}: difficulty deve ser 1, 2 ou 3.`);
      if (q.lessonRef !== undefined && (q.lessonRef < 0 || q.lessonRef >= topic.lesson.length)) {
        errors.push(`${qWhere}: lessonRef ${q.lessonRef} fora do intervalo da lição.`);
      }
      if (q.type === 'gen') {
        if (!q.title?.trim()) errors.push(`${qWhere}: questão gerada precisa de "title".`);
        if (typeof q.generate !== 'function') {
          errors.push(`${qWhere}: questão gerada precisa da função generate(rng).`);
          continue;
        }
        try {
          const m = materialize(q, 1);
          validateStatic(m, qWhere, errors);
          for (const p of stepProblems(m, topic)) errors.push(`${qWhere}: ${p}`);
        } catch (err) {
          errors.push(`${qWhere}: o gerador falhou (${String(err)}).`);
        }
      } else {
        validateStatic(q, qWhere, errors);
        for (const p of stepProblems(q, topic)) errors.push(`${qWhere}: ${p}`);
      }
    }

    for (const game of topic.games) {
      const gWhere = `${where} › jogo ${game.id ?? '(sem id)'}`;
      if (claimId(game.id, gWhere)) gameById.set(game.id, { game, topic });
      validateGame(game, gWhere, topic, errors);
    }
  }

  for (const topic of topicById.values()) {
    for (const req of topic.requires) {
      if (!topicById.has(req)) errors.push(`${topic.id}: pré-requisito inexistente "${req}".`);
    }
  }

  const subjects = [...subjectById.values()].sort((a, b) => a.order - b.order);
  for (const s of subjects) s.topics.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  return { subjects, subjectById, topicById, questionById, gameById, errors };
}

const subjectModules = import.meta.glob<SubjectDef>('../content/*/materia.ts', { eager: true, import: 'default' });
const topicModules = import.meta.glob<TopicDef>('../content/*/topicos/*.ts', { eager: true, import: 'default' });

export const content: ContentRegistry = buildRegistry(subjectModules, topicModules);

if (content.errors.length) {
  console.error(`[conteúdo] ${content.errors.length} problema(s) encontrado(s):\n- ${content.errors.join('\n- ')}`);
}

/** Questões que seguem um roteiro: as do tópico (roteiro de conteúdo) ou de todos os `topics` dados ("fmt.*"). */
export function roteiroQuestions(roteiroId: string, topics: Topic[]): { question: Question; topic: Topic }[] {
  return topics.flatMap((topic) => topic.questions.filter((q) => q.roteiro === roteiroId).map((question) => ({ question, topic })));
}

export function topicOfQuestion(questionId: string): Topic | undefined {
  return content.questionById.get(questionId)?.topic;
}

export function allTopics(): Topic[] {
  return content.subjects.flatMap((s) => s.topics);
}
