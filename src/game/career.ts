/**
 * Carreira: o nível de XP vira um cargo. Cada promoção libera peças novas no Armazém e algumas vêm de presente.
 */
export interface Rank {
  level: number;
  title: string;
  /** Itens dados de presente na promoção (ids de game/items.ts). */
  gift?: string[];
}

export const RANKS: Rank[] = [
  { level: 1, title: 'Trainee' },
  { level: 3, title: 'Estagiário(a)', gift: ['capacete-amarelo'] },
  { level: 6, title: 'Assistente de engenharia', gift: ['cafe'] },
  { level: 10, title: 'Engenheiro(a) Júnior', gift: ['capacete-branco'] },
  { level: 15, title: 'Engenheiro(a) Pleno', gift: ['folga'] },
  { level: 21, title: 'Engenheiro(a) Sênior', gift: ['cafe', 'folga'] },
  { level: 28, title: 'Especialista', gift: ['quepe'] },
  { level: 36, title: 'Consultor(a)', gift: ['folga', 'folga'] },
];

/** Índice do cargo para um nível de XP. */
export function rankIndex(level: number): number {
  let index = 0;
  RANKS.forEach((r, i) => {
    if (level >= r.level) index = i;
  });
  return index;
}

export function rankOf(level: number): Rank {
  return RANKS[rankIndex(level)];
}

export function nextRank(level: number): Rank | null {
  return RANKS[rankIndex(level) + 1] ?? null;
}
