/**
 * Formato dos mapas. O terreno é desenhado em ASCII (fácil de editar em qualquer editor);
 * prédios, NPCs e objetos interativos ficam em listas com coordenadas em tiles.
 *
 * Legenda do ASCII:
 *   .  grama          ,  grama com flores    =  caminho de terra
 *   #  pedra (praça)  ~  água                :  areia
 *   c  concreto (pátio industrial)
 *   _  deque/trapiche %  terra arada (horta)
 *   T  árvore         P  pinheiro            b  arbusto
 *   r  pedra          f  cerca (conecta sozinha com as vizinhas)
 */
import type { Facing } from '../core/state';
import type { BuildingSpec } from '../art/objects';

export interface BuildingDef extends BuildingSpec {
  id: string;
  name: string;
  x: number;
  y: number;
  /** Texto ao interagir com a porta. */
  doorText?: string;
  /** Ação especial da porta (em vez de só mostrar o texto): Salão de Jogos, simulados ou a sua casa (mochila). */
  action?: 'arcade' | 'simulado' | 'home';
}

export interface NpcPlacement {
  id: string;
  x: number;
  y: number;
  facing?: Facing;
  /** Raio (em tiles) para passear. 0 = parado. */
  wander?: number;
}

export type PropKind = 'fountain' | 'board' | 'lamp' | 'bench' | 'crate' | 'barrel' | 'tank' | 'pumpjack' | 'flare' | 'boat' | 'column' | 'piperack';

export interface PropDef {
  kind: PropKind;
  x: number;
  y: number;
}

export interface SignDef {
  x: number;
  y: number;
  title: string;
  text: string;
  /** Placa de unidade da Refinaria: mostra o resumo da matéria (bloco) em vez do texto. */
  subjectId?: string;
}

export interface GateDef {
  id: string;
  x: number;
  y: number;
  title: string;
  text: string;
  /** Aberto: desenha a cancela levantada e deixa passar. */
  open?: boolean;
}

export interface GardenDef {
  /** Tile do primeiro canteiro (canto superior esquerdo). */
  x: number;
  y: number;
  /** Uma fileira por matéria, separadas por `rowStep` tiles. */
  rows: number;
  rowStep: number;
  cols: number;
}

/** Pátio de equipamentos: um equipamento (2×2 tiles) por tópico da matéria, em grade. */
export interface YardDef {
  subjectId: string;
  /** Tile do canto superior esquerdo do primeiro equipamento. */
  x: number;
  y: number;
  cols: number;
  rows: number;
  /** Distância entre equipamentos, em tiles (padrão 3). */
  step?: number;
}

/** Passagem para outro mapa: pisar na área leva o jogador ao destino. */
export interface WarpDef {
  x: number;
  y: number;
  w: number;
  h: number;
  to: string;
  toX: number;
  toY: number;
  facing: Facing;
}

export interface MapDef {
  id: string;
  name: string;
  rows: string[];
  spawn: { x: number; y: number; facing: Facing };
  buildings: BuildingDef[];
  npcs: NpcPlacement[];
  props: PropDef[];
  signs: SignDef[];
  gates: GateDef[];
  garden?: GardenDef;
  yards?: YardDef[];
  warps?: WarpDef[];
  /** Cor de fundo da câmera (aparece fora do mapa). */
  background?: string;
  /** Áreas que contam como "visitadas" (missões). */
  areas?: { id: string; x: number; y: number; w: number; h: number }[];
}
