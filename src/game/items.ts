/**
 * Itens: o Armazém da Dona Cida vende consumíveis (cafezinho, folga) e peças de visual (capacetes, coletes,
 * uniformes). As moedas vêm dos estudos; as peças melhores pedem um cargo mais alto (game/career.ts).
 * Também ficam aqui as amostras do poço: uma coleção que cresce com a profundidade máxima alcançada.
 */
import type { CharacterLook } from '../art/characters';
import { BOOST_MINUTES } from '../config';
import { events } from '../core/events';
import { state, type OutfitSlot } from '../core/state';
import { rankIndex, RANKS } from './career';
import { PLAYER_LOOK } from './npcs';

export type ItemKind = 'consumable' | 'cosmetic';

export interface ItemDef {
  id: string;
  name: string;
  icon: string;
  kind: ItemKind;
  price: number;
  desc: string;
  /** Cargo mínimo (índice em RANKS) para comprar. */
  rank?: number;
  slot?: OutfitSlot;
  look?: Partial<CharacterLook>;
  /** Máximo na mochila (consumíveis). */
  max?: number;
}

export const SLOT_NAMES: Record<OutfitSlot, string> = {
  hat: 'Cabeça',
  vest: 'Colete',
  glasses: 'Óculos',
  uniform: 'Uniforme',
};
export const SLOTS: OutfitSlot[] = ['hat', 'vest', 'glasses', 'uniform'];

export const ITEMS: ItemDef[] = [
  { id: 'cafe', name: 'Cafezinho', icon: '☕', kind: 'consumable', price: 30, max: 5, desc: `+50% de XP por ${BOOST_MINUTES} minutos. Tome na mochila (tecla I) antes de uma boa sessão.` },
  { id: 'folga', name: 'Folga programada', icon: '🛡️', kind: 'consumable', price: 80, max: 3, desc: 'Protege a ofensiva 🔥: cada folga cobre um dia sem estudo. É gasta sozinha quando você volta.' },

  { id: 'bone-vermelho', name: 'Boné vermelho', icon: '🧢', kind: 'cosmetic', slot: 'hat', price: 25, look: { hat: 'cap', hatColor: '#c8403a' }, desc: 'Para os dias de folga na vila.' },
  { id: 'bone-azul', name: 'Boné azul-marinho', icon: '🧢', kind: 'cosmetic', slot: 'hat', price: 25, look: { hat: 'cap', hatColor: '#2f4f8f' }, desc: 'Discreto e prático.' },
  { id: 'capacete-amarelo', name: 'Capacete amarelo', icon: '⛑️', kind: 'cosmetic', slot: 'hat', price: 40, look: { hat: 'hardhat', hatColor: '#f2c230' }, desc: 'O clássico da área industrial. Presente na promoção a Estagiário(a).' },
  { id: 'capacete-azul', name: 'Capacete azul', icon: '⛑️', kind: 'cosmetic', slot: 'hat', price: 60, rank: 1, look: { hat: 'hardhat', hatColor: '#3d7cc9' }, desc: 'Combina com o uniforme da vila.' },
  { id: 'capacete-verde', name: 'Capacete verde', icon: '⛑️', kind: 'cosmetic', slot: 'hat', price: 60, rank: 1, look: { hat: 'hardhat', hatColor: '#3f9a52' }, desc: 'Verde de quem cuida da segurança.' },
  { id: 'capacete-laranja', name: 'Capacete laranja', icon: '⛑️', kind: 'cosmetic', slot: 'hat', price: 80, rank: 2, look: { hat: 'hardhat', hatColor: '#ec7c26' }, desc: 'Visível a distância, até no pátio cheio.' },
  { id: 'capacete-branco', name: 'Capacete branco', icon: '⛑️', kind: 'cosmetic', slot: 'hat', price: 150, rank: 3, look: { hat: 'hardhat', hatColor: '#f4f4f0' }, desc: 'Presente na promoção a Engenheiro(a) Júnior.' },
  { id: 'quepe', name: 'Quepe de comandante', icon: '⚓', kind: 'cosmetic', slot: 'hat', price: 300, rank: 5, look: { hat: 'captain', hatColor: '#26354f' }, desc: 'Para quem já comanda o próprio estudo. Presente na promoção a Especialista.' },

  { id: 'colete-laranja', name: 'Colete refletivo laranja', icon: '🎽', kind: 'cosmetic', slot: 'vest', price: 50, look: { vest: '#f07f1d' }, desc: 'Faixa refletiva para ser vista no pátio.' },
  { id: 'colete-limao', name: 'Colete verde-limão', icon: '🎽', kind: 'cosmetic', slot: 'vest', price: 50, rank: 1, look: { vest: '#c4dc3a' }, desc: 'Alta visibilidade, até à noite.' },
  { id: 'oculos', name: 'Óculos de segurança', icon: '👓', kind: 'cosmetic', slot: 'glasses', price: 35, look: { glasses: true }, desc: 'Completa o EPI. Ajuda a enxergar as pegadinhas (dizem).' },

  { id: 'uniforme-laranja', name: 'Uniforme laranja', icon: '👕', kind: 'cosmetic', slot: 'uniform', price: 70, rank: 1, look: { shirt: '#e8762d', pants: '#3a3d4a' }, desc: 'O macacão da equipe de manutenção.' },
  { id: 'uniforme-petroleo', name: 'Uniforme azul-petróleo', icon: '👕', kind: 'cosmetic', slot: 'uniform', price: 70, rank: 2, look: { shirt: '#1f6f78', pants: '#2c3440' }, desc: 'Cor de quem vive embarcado.' },
  { id: 'uniforme-verde', name: 'Uniforme verde', icon: '👕', kind: 'cosmetic', slot: 'uniform', price: 70, rank: 2, look: { shirt: '#3f7d4e', pants: '#2f3a33' }, desc: 'Para as rondas de inspeção.' },
  { id: 'uniforme-cinza', name: 'Uniforme cinza-chumbo', icon: '👕', kind: 'cosmetic', slot: 'uniform', price: 90, rank: 3, look: { shirt: '#7b8794', pants: '#3b4250' }, desc: 'Sóbrio, de quem já assina laudo.' },
  { id: 'jaleco', name: 'Jaleco branco', icon: '👕', kind: 'cosmetic', slot: 'uniform', price: 120, rank: 4, look: { shirt: '#eef0f2', pants: '#4a5568' }, desc: 'Para os dias de laboratório no Centro de Pesquisas.' },
];

export const itemById = new Map(ITEMS.map((i) => [i.id, i]));

export function itemCount(id: string): number {
  return state.data.inventory[id] ?? 0;
}

export function owns(id: string): boolean {
  return state.data.owned.includes(id);
}

export type BuyCheck = 'ok' | 'coins' | 'rank' | 'max' | 'owned';

export function canBuy(item: ItemDef): BuyCheck {
  if (item.kind === 'cosmetic' && owns(item.id)) return 'owned';
  if (item.kind === 'consumable' && itemCount(item.id) >= (item.max ?? 99)) return 'max';
  if ((item.rank ?? 0) > rankIndex(state.data.level)) return 'rank';
  if (state.data.coins < item.price) return 'coins';
  return 'ok';
}

export function rankNeeded(item: ItemDef): string {
  return RANKS[item.rank ?? 0]?.title ?? '';
}

/** Coloca o item na mochila (compra, presente de promoção ou de conquista). */
export function grant(id: string): void {
  const item = itemById.get(id);
  if (!item) return;
  if (item.kind === 'consumable') state.data.inventory[id] = Math.min(item.max ?? 99, itemCount(id) + 1);
  else if (!owns(id)) state.data.owned.push(id);
  state.touch();
}

export function buy(item: ItemDef): BuyCheck {
  const check = canBuy(item);
  if (check !== 'ok') return check;
  state.addCoins(-item.price);
  state.data.stats.itemsBought += 1;
  grant(item.id);
  return 'ok';
}

/** Toma um cafezinho: +50% de XP por 30 min (somando ao tempo que ainda restar). */
export function drinkCoffee(now = new Date()): boolean {
  if (itemCount('cafe') < 1) return false;
  state.data.inventory.cafe = itemCount('cafe') - 1;
  const current = state.data.boostUntil ? new Date(state.data.boostUntil).getTime() : 0;
  const start = Math.max(now.getTime(), current);
  state.data.boostUntil = new Date(start + BOOST_MINUTES * 60_000).toISOString();
  state.touch();
  return true;
}

/** Minutos restantes de cafezinho (0 = sem efeito). */
export function boostMinutesLeft(now = new Date()): number {
  const until = state.data.boostUntil ? new Date(state.data.boostUntil).getTime() : 0;
  return Math.max(0, Math.ceil((until - now.getTime()) / 60_000));
}

export function equip(slot: OutfitSlot, id: string | null): void {
  if (id && (!owns(id) || itemById.get(id)?.slot !== slot)) return;
  if (id) state.data.outfit[slot] = id;
  else delete state.data.outfit[slot];
  state.touch();
  events.emit('player:look');
}

/** Visual do personagem com as peças em uso. */
export function playerLook(): CharacterLook {
  const look: CharacterLook = { ...PLAYER_LOOK };
  for (const slot of SLOTS) {
    const item = itemById.get(state.data.outfit[slot] ?? '');
    if (item?.look) Object.assign(look, item.look);
  }
  return look;
}

/** Visual com uma peça experimentada (prévia na loja). */
export function lookWith(item: ItemDef): CharacterLook {
  return item.look ? { ...playerLook(), ...(item.slot === 'hat' ? { hat: undefined, hatColor: undefined } : {}), ...item.look } : playerLook();
}

// ---------------------------------------------------------------- amostras do poço

export interface SampleDef {
  depth: number;
  id: string;
  name: string;
  icon: string;
  text: string;
}

/** Coleção de amostras: uma a cada marco de profundidade (a maior já alcançada; não se perde). */
export const SAMPLES: SampleDef[] = [
  { depth: 1000, id: 'agua-fria', name: 'Água do fundo do mar', icon: '🌊', text: 'A partir de uns 1.000 m de profundidade a água do mar fica escura e fria, perto de 4 °C — e é por ela que descem os risers até o poço.' },
  { depth: 2000, id: 'lama', name: 'Lama do leito marinho', icon: '🐚', text: 'No polo do pré-sal da Bacia de Santos, o leito do mar fica a mais de 2.000 m da superfície: essa é a lâmina d’água que o poço atravessa antes da rocha.' },
  { depth: 3000, id: 'folhelho', name: 'Folhelho', icon: '⬛', text: 'Rocha de grãos finíssimos (argila compactada). Pode ser a rocha geradora do petróleo e também a "tampa" que veda um reservatório.' },
  { depth: 4000, id: 'arenito', name: 'Arenito', icon: '⏳', text: 'Areia cimentada, com poros entre os grãos. É o reservatório típico do pós-sal, como nos campos da Bacia de Campos.' },
  { depth: 5000, id: 'halita', name: 'Halita (sal-gema)', icon: '💠', text: 'A camada de sal pode passar de 2.000 m de espessura. O sal flui devagar (fluência), então perfurar nele exige cuidado para o poço não se fechar.' },
  { depth: 6000, id: 'anidrita', name: 'Anidrita', icon: '🔷', text: 'Sulfato de cálcio que aparece junto do sal. Outros sais da camada, como a carnalita e a taquidrita, são ainda mais solúveis e móveis.' },
  { depth: 7000, id: 'microbialito', name: 'Microbialito do pré-sal', icon: '🛢️', text: 'Carbonato formado com a ajuda de micróbios em lagos muito antigos. É a rocha-reservatório do pré-sal, com óleo leve (por volta de 28 a 30 °API). Você chegou!' },
];

export function samplesOwned(maxDepth = state.data.stats.maxDepth): SampleDef[] {
  return SAMPLES.filter((s) => maxDepth >= s.depth);
}
