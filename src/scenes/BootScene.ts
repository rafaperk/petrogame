import Phaser from 'phaser';
import { generateArt } from '../art';

/** Gera as texturas procedurais e passa para o mundo. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    generateArt(this);
    this.scene.start('world');
  }
}
