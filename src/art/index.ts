/** Gera toda a arte do jogo de uma vez (chamado pela BootScene). */
import type Phaser from 'phaser';
import { NPCS, PLAYER_LOOK } from '../game/npcs';
import { content } from '../learning/content';
import { EQUIPMENT_KINDS } from '../learning/types';
import { registerCharacter } from './characters';
import { registerEquipment } from './equipment';
import { registerProps, registerSubjectArt } from './objects';
import { Tileset } from './tiles';

export const tileset = new Tileset();

export function generateArt(scene: Phaser.Scene): void {
  tileset.ensureTexture(scene);
  registerProps(scene);
  registerEquipment(scene, EQUIPMENT_KINDS);
  for (const subject of content.subjects) registerSubjectArt(scene, subject.id, subject.color);
  registerCharacter(scene, 'player', PLAYER_LOOK);
  for (const npc of NPCS) registerCharacter(scene, `npc-${npc.id}`, npc.look);
}
