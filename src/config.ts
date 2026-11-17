/**
 * Constantes de ajuste do jogo. Mexa aqui para balancear sem caçar números pelo código.
 */

export const GAME_TITLE = 'Rumo ao Pré-Sal';
export const SAVE_KEY = 'rumo-ao-pre-sal/save-v1';

/** Tamanho do tile em pixels de arte (a câmera amplia). */
export const TILE = 16;

export const PLAYER_SPEED = 74; // px de arte por segundo
export const RUN_MULTIPLIER = 1.6;

/** Profundidade-alvo: chegar ao pré-sal = dominar todo o conteúdo cadastrado. */
export const MAX_DEPTH_METERS = 7000;

/** Parâmetros do FSRS (repetição espaçada). */
export const SRS_CONFIG = {
  desiredRetention: 0.9,
  /** Intervalo máximo entre revisões (dias). Mantém tudo "vivo" até a prova. */
  maximumInterval: 120,
  learningSteps: ['10m'] as const,
  relearningSteps: ['10m'] as const,
  enableFuzz: true,
};

/** Como a maestria de um tópico é calculada (ver learning/mastery.ts). */
export const MASTERY = {
  /** Estabilidade (dias) a partir da qual uma questão conta como "consolidada". */
  targetStabilityDays: 21,
  /** Quantas questões vistas bastam para a cobertura máxima do tópico. */
  cardsForFullCoverage: 8,
  /** Limiares de maestria para cada estágio da planta: semente, broto, muda, flor, fruto. */
  stageThresholds: [0, 0.15, 0.35, 0.6, 0.85] as const,
  /** Maestria mínima de um pré-requisito para liberar o próximo tópico. */
  prerequisiteMastery: 0.2,
  /** Maestria para liberar questões nível 2 e nível 3 (prova). */
  tier2: 0.3,
  tier3: 0.6,
};

export const SESSION = {
  learnSize: 5,
  practiceSize: 8,
  reviewSize: 12,
  challengeSize: 8,
  challengePassRate: 0.7,
  challengeSecondsPerQuestion: 120,
};

export const REWARDS = {
  /** XP por acerto de primeira, indexado pela dificuldade (1..3). */
  correctXp: [0, 10, 15, 22],
  wrongXp: 2,
  retryCorrectXp: 3,
  hintFactor: 0.5,
  learnTopicXp: 30,
  reviewSessionXp: 15,
  challengePassXp: 80,
  coinsPerCorrect: 1,
  reviewSessionCoins: 5,
  challengePassCoins: 40,
};

/** Minijogos (esteira, conexões, procedimento). */
export const GAMES = {
  /** Aproveitamento de primeira para a revisão contar como "Bom" / "Difícil" (abaixo disso: errou). */
  goodAccuracy: 0.9,
  hardAccuracy: 0.7,
  xpBase: 8,
  xpPerCorrect: 2,
  coinsBase: 2,
  coinsGood: 5,
  /** Esteira: tempo para cada item = base + por caractere, entre min e max; acelera com a sequência de acertos. */
  sortBaseMs: 3800,
  sortMsPerChar: 60,
  sortMinMs: 5500,
  sortMaxMs: 13000,
  sortSpeedupPerHit: 0.05,
  sortMinFactor: 0.6,
  /**
   * Níveis de cada minijogo (1 = Treino, 2 = Campo, 3 = Prova). Sobe de nível com ≥ 90% de acertos de primeira;
   * desce com menos de 50%. Índice = nível − 1.
   */
  levelNames: ['Treino', 'Campo', 'Prova'],
  levelUpAccuracy: 0.9,
  levelDownAccuracy: 0.5,
  /** Esteira: itens por rodada e tempo de cada item (multiplicador). */
  sortItems: [6, 9, 12],
  sortTime: [1.25, 1, 0.8],
  /** Conexões: pares por rodada. */
  matchPairs: [4, 6, 8],
  /** Procedimento: erros no mesmo passo antes de destacar a resposta (0 = nunca). */
  orderHintAfter: [1, 2, 0],
  /** Bancada (jogos com sorteio de tarefas): tarefas por partida. */
  labTasks: [3, 4, 5],
  /** XP multiplicado pelo nível. */
  levelXp: [1, 1.25, 1.5],
};

/** Simulado no Centro de Pesquisas: mesma divisão da prova, sem dicas e com o tempo da prova (4 h para 70). */
export const SIMULADO = {
  rapido: 20,
  completo: 70,
  minutesPerQuestion: 240 / 70,
  /** Tópicos estudados para liberar o simulado. */
  minTopics: 3,
  xpBonus: { rapido: 40, completo: 150 },
  coinsBonus: { rapido: 15, completo: 60 },
};

/** Cafezinho (item da loja): XP extra por um tempo. */
export const BOOST_MINUTES = 30;

export function xpToNextLevel(level: number): number {
  return 80 + level * 40;
}
