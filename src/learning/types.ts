/**
 * Esquema do conteúdo de estudo. Para adicionar matérias/tópicos, veja docs/CONTEUDO.md.
 *
 * Texto aceita uma marcação leve: **negrito**, *itálico*, `código`, ==destaque==,
 * x_{sub} e x^{sup}, listas com "- " no início da linha e parágrafos separados por linha em branco.
 */

/** 1 = básico, 2 = intermediário, 3 = nível de prova. */
export type Difficulty = 1 | 2 | 3;

/** Onde os tópicos da matéria aparecem no mundo: plantas na Horta do Saber ou equipamentos na Refinaria. */
export type Field = 'horta' | 'refinaria';

/** Equipamentos desenhados para a Refinaria (cada tópico de Específicos vira um). */
export const EQUIPMENT_KINDS = [
  'pump',
  'compressor',
  'turbine',
  'boiler',
  'exchanger',
  'vessel',
  'tester',
  'furnace',
  'welder',
  'panel',
  'pipe',
  'engine',
  'motor',
  'gearbox',
  'chiller',
  'crane',
  'mill',
  'pendulum',
  'isolator',
  'absorber',
  'ramp',
  'winch',
  'cell',
  'rectifier',
  'generator',
  'bearing',
  'spring',
] as const;
export type EquipmentKind = (typeof EQUIPMENT_KINDS)[number];

/** Um item do conteúdo programático do edital (para o "edital verticalizado"). */
export interface ExamItem {
  id: string;
  text: string;
}

export interface SubjectExam {
  /** Parte da prova (ver src/content/cargo.ts). */
  part: string;
  /** Quantas questões da prova são desta matéria/bloco. */
  questions: number;
  items: ExamItem[];
}

export interface SubjectDef {
  /** Igual ao nome da pasta em src/content/<id>/ */
  id: string;
  name: string;
  /** Rótulo curto para HUD e canteiros (ex.: "Português"). */
  short: string;
  /** Cor da matéria (hex). Usada nas flores da horta e na interface. */
  color: string;
  /** Emoji/ícone da matéria. */
  icon: string;
  /** NPC mentor (id em src/game/npcs.ts). */
  mentorId: string;
  /** Nome do lugar onde o mentor ensina. */
  place: string;
  description: string;
  order: number;
  /** Horta (padrão) ou Refinaria. */
  field?: Field;
  /** Equipamento padrão dos tópicos desta matéria na Refinaria. */
  equipment?: EquipmentKind;
  /** Como a matéria aparece no edital. */
  exam?: SubjectExam;
}

export interface LessonCard {
  title: string;
  body: string;
  /** Exemplo resolvido / frase modelo. */
  example?: string;
  /** Macete ou técnica de memorização. */
  tip?: string;
  /** "Sempre cai": o que a banca repete, com as provas em que caiu. */
  hot?: string;
  /** Pegadinha comum da banca. */
  trap?: string;
  /** Botão "Ver na bancada": abre a simulação interativa já ajustada para este card. */
  lab?: LabLink;
}

export interface ChoiceOption {
  text: string;
  /** Por que esta alternativa está certa/errada. É aqui que o aprendizado acontece. */
  why?: string;
}

/**
 * Roteiro de resolução: o passo a passo de um TIPO de questão. A prova repete os tipos (mudam os números
 * e o contexto), então o roteiro vale para todas as questões parecidas. Os de formato (I/II/III, EXCETO,
 * Certo/Errado...) são globais, com id "fmt.*", em content/roteiros.ts; os de conteúdo ficam no tópico.
 */
export interface Roteiro {
  id: string;
  /** Nome do tipo de questão, ex.: "Bernoulli numa mudança de seção". */
  name: string;
  /** Como reconhecer na prova: as palavras e os dados que denunciam este tipo. */
  when: string;
  /** O que fazer em cada passo, sem números (a resolução de cada questão fica nos `steps` dela). */
  steps: string[];
  /** Para as próximas: atalho, conferência rápida ou pegadinha que vale para a família toda. */
  note?: string;
}

/**
 * Passo de uma questão. Só o texto revelado (string): o "o que fazer" vem do roteiro, na mesma posição.
 * Objeto: o par completo (para passos próprios da questão).
 */
export type StepDef = string | { do: string; show: string };

/** Passo pronto para exibir. */
export interface SolveStep {
  /** O que fazer — a pista, sem o resultado. */
  do: string;
  /** A conta ou o raciocínio com os dados desta questão (oculto até o jogador pedir). */
  show: string;
}

interface QuestionBase {
  /** Identificador estável e único (o progresso fica preso a ele — não renomeie). */
  id: string;
  difficulty: Difficulty;
  prompt: string;
  /** Explicação geral, mostrada após responder (com roteiro, vira o "texto corrido" opcional). */
  explanation: string;
  /** Dica opcional (usar dica reduz a nota da revisão). Questões com roteiro usam o passo a passo. */
  hint?: string;
  /** Id do roteiro (do tópico ou "fmt.*"). */
  roteiro?: string;
  /** Resolução em passos, revelados um a um. */
  steps?: StepDef[];
  /** Índice do card da lição relacionado (para "rever a lição"). */
  lessonRef?: number;
  /** Origem: "Autoral", "Cesgranrio 2018 – Petrobras", etc. */
  source?: string;
  tags?: string[];
}

/** Múltipla escolha (estilo Cesgranrio: A–E). */
export interface MultipleChoiceQuestion extends QuestionBase {
  type?: 'mc';
  options: ChoiceOption[];
  /** Índice da alternativa correta em `options`. */
  answer: number;
  /** Embaralhar alternativas? (padrão: sim). Use false para "todas as anteriores", "I e II" etc. */
  shuffle?: boolean;
}

/** Certo ou Errado (estilo Cebraspe). */
export interface TrueFalseQuestion extends QuestionBase {
  type: 'ce';
  answer: boolean;
}

/** O que um gerador de questão devolve a cada sorteio. */
export interface GeneratedInstance {
  prompt: string;
  options: ChoiceOption[];
  answer: number;
  /** Resolução em texto corrido, com os números sorteados. */
  explanation: string;
  hint?: string;
  /** Passos do roteiro com os números sorteados (alinhados aos passos do roteiro da questão). */
  steps?: StepDef[];
  /** Embaralhar as alternativas? Padrão: não (valores em ordem crescente, como na prova). */
  shuffle?: boolean;
}

/**
 * Questão de cálculo com valores sorteados ("Ordem de serviço"): cada vez que aparece, os números mudam.
 * Assim você aprende o método, não decora a resposta. Veja os ajudantes em learning/gen.ts.
 */
export interface GeneratedQuestion {
  type: 'gen';
  id: string;
  difficulty: Difficulty;
  /** Nome curto do problema (aparece em listas). */
  title: string;
  lessonRef?: number;
  source?: string;
  tags?: string[];
  /** Id do roteiro; os passos com números vêm de `generate` (campo `steps`). */
  roteiro?: string;
  /** Sorteia os valores e monta a questão. `rng()` devolve números em [0, 1). */
  generate: (rng: () => number) => GeneratedInstance;
}

/** Questão pronta para exibir (geradas viram múltipla escolha ao serem sorteadas). */
export type StaticQuestion = MultipleChoiceQuestion | TrueFalseQuestion;
export type Question = StaticQuestion | GeneratedQuestion;

// ------------------------------------------------------------------ minijogos

interface GameBase {
  /** Identificador estável e único no jogo todo (vira um cartão de revisão — não renomeie). */
  id: string;
  title: string;
  /** Instrução/contexto curto mostrado antes de começar. */
  intro?: string;
  /** Card da lição relacionado. */
  lessonRef?: number;
}

export interface SortItem {
  text: string;
  /** Índice da categoria correta em `bins`. */
  bin: number;
  why?: string;
}

/** Esteira: classifique cada item na categoria certa antes que ele passe. */
export interface SortGame extends GameBase {
  type: 'sort';
  /** 2 a 4 categorias. */
  bins: string[];
  items: SortItem[];
  /** Não usado: o nível do jogo decide quantos itens entram (config GAMES.sortItems). */
  perRound?: number;
}

export interface MatchPair {
  left: string;
  right: string;
  why?: string;
}

/** Conexões: ligue cada termo à sua definição. */
export interface MatchGame extends GameBase {
  type: 'match';
  pairs: MatchPair[];
  leftLabel?: string;
  rightLabel?: string;
  /** Não usado: o nível do jogo decide quantos pares entram (config GAMES.matchPairs). */
  perRound?: number;
}

export interface OrderStep {
  text: string;
  why?: string;
}

/** Procedimento: monte a sequência correta, passo a passo. */
export interface OrderGame extends GameBase {
  type: 'order';
  /** Passos na ordem correta (o jogo embaralha). */
  steps: OrderStep[];
}

// ------------------------------------------------------------------ bancadas (simulações interativas)

/** Simulações disponíveis (modelos em learning/labs, desenho em ui/labs). */
export type LabId = 'pump' | 'venturi' | 'exchanger' | 'fec' | 'piston' | 'cycle' | 'vapor' | 'compressor' | 'tensile' | 'beam' | 'coldwork' | 'charpy' | 'vibration' | 'ramp' | 'gears' | 'corrosion' | 'motor' | 'shaft' | 'spring';
export type LabValues = Record<string, number>;

/** Liga um card da lição (ou um menu) a uma bancada já ajustada. */
export interface LabLink {
  lab: LabId;
  /** Valores iniciais dos controles (os não citados ficam no padrão). */
  preset?: LabValues;
  /** Texto do botão (padrão: "Ver na bancada"). */
  label?: string;
}

interface LabTaskBase {
  /** Controles no início da tarefa (os não citados voltam ao padrão). */
  setup?: LabValues;
  /** Controles travados durante a tarefa. */
  lock?: string[];
  /** O porquê, mostrado depois da resposta. */
  why: string;
}

/** Preveja e observe: o jogador aposta no que vai acontecer; depois a bancada aplica a mudança e mostra. */
export interface LabPredictTask extends LabTaskBase {
  kind: 'predict';
  prompt: string;
  /** Mudança aplicada (animada) depois do palpite. Sem `change`, a pergunta é sobre o que está na tela. */
  change?: LabValues;
  options: string[];
  answer: number;
  /** Conferido pelo `npm test`: como cada leitura deve variar com a mudança. */
  expect?: { out: string; trend: 'up' | 'down' | 'same' }[];
}

/** Missão: mexa nos controles até cumprir todas as metas. */
export interface LabGoalTask extends LabTaskBase {
  kind: 'goal';
  prompt: string;
  /** Faixas que as leituras precisam atingir ao mesmo tempo. `label` esconde a faixa (para não entregar a resposta). */
  goals: { out: string; min?: number; max?: number; label?: string }[];
  hint: string;
  /** Uma solução (conferida pelo `npm test` e mostrada se o jogador desistir). */
  solution: LabValues;
}

export type LabTask = LabPredictTask | LabGoalTask;

/** Bancada: simulação de verdade + tarefas de prever-observar e de atingir metas. Vira um cartão de revisão. */
export interface LabGame extends GameBase {
  type: 'lab';
  lab: LabId;
  tasks: LabTask[];
  /** Tarefas sorteadas por partida (o nível limita a 3, 4 ou 5); sem este campo, todas, na ordem. */
  perRound?: number;
}

export type GameDef = SortGame | MatchGame | OrderGame | LabGame;
export type GameKind = GameDef['type'];

// ------------------------------------------------------------------ tópicos e matérias

export interface TopicDef {
  /** Identificador estável e único, ex.: "pt.crase". */
  id: string;
  name: string;
  summary: string;
  /** Ordem dentro da matéria (define a posição na horta/refinaria). */
  order?: number;
  /** Relevância na prova, 1 (baixa) a 3 (alta). Pesa na profundidade. */
  weight?: 1 | 2 | 3;
  /** Ids de tópicos que precisam ser estudados antes. */
  requires?: string[];
  /** Itens do edital cobertos por este tópico (ids de `exam.items` da matéria). */
  edital?: string[];
  /** Equipamento que representa o tópico na Refinaria (padrão: o da matéria). */
  equipment?: EquipmentKind;
  lesson: LessonCard[];
  /** Roteiros de resolução dos tipos de questão deste tópico (as questões apontam pelo id). */
  roteiros?: Roteiro[];
  questions: Question[];
  /** Minijogos do tópico (esteira, conexões, procedimento). */
  games?: GameDef[];
}

export interface Topic extends Required<Omit<TopicDef, 'requires' | 'edital' | 'equipment' | 'games' | 'roteiros'>> {
  subjectId: string;
  requires: string[];
  edital: string[];
  games: GameDef[];
  roteiros: Roteiro[];
  equipment?: EquipmentKind;
}

export interface Subject extends Omit<SubjectDef, 'field'> {
  field: Field;
  topics: Topic[];
}

export const defineSubject = (subject: SubjectDef): SubjectDef => subject;
export const defineTopic = (topic: TopicDef): TopicDef => topic;

export function isTrueFalse(q: Question): q is TrueFalseQuestion {
  return q.type === 'ce';
}

export function isGenerated(q: Question): q is GeneratedQuestion {
  return q.type === 'gen';
}
