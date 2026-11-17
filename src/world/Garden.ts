/**
 * Horta do Saber no mundo: uma fileira por matéria, um canteiro por tópico.
 * Estágio da planta = maestria; murcha (tom amarelado + gota) = revisões vencidas.
 */
import Phaser from 'phaser';
import { TILE } from '../config';
import { state } from '../core/state';
import { content } from '../learning/content';
import { dueCount, plantStage, topicMastery } from '../learning/mastery';
import type { Subject, Topic } from '../learning/types';
import type { GardenDef } from './mapTypes';

export interface Plot {
  tileX: number;
  tileY: number;
  subject: Subject;
  topic?: Topic;
}

interface PlotView {
  plant?: Phaser.GameObjects.Image;
  drop?: Phaser.GameObjects.Image;
}

export class Garden {
  readonly plots: Plot[] = [];
  readonly flags: { tileX: number; tileY: number; subject: Subject }[] = [];
  private views = new Map<Plot, PlotView>();
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, def: GardenDef) {
    this.scene = scene;
    content.subjects
      .filter((s) => s.field === 'horta')
      .slice(0, def.rows)
      .forEach((subject, row) => {
      const tileY = def.y + row * def.rowStep;
      this.flags.push({ tileX: def.x - 1, tileY, subject });
      for (let col = 0; col < def.cols; col++) {
        this.plots.push({ tileX: def.x + col, tileY, subject, topic: subject.topics[col] });
      }
    });
    for (const f of this.flags) {
      scene.add
        .image(f.tileX * TILE + 8, f.tileY * TILE + 15, `flag-${f.subject.id}`)
        .setOrigin(0.5, 1)
        .setDepth(f.tileY * TILE + 15);
    }
    this.refresh();
  }

  plotAt(tileX: number, tileY: number): Plot | undefined {
    return this.plots.find((p) => p.tileX === tileX && p.tileY === tileY);
  }

  flagAt(tileX: number, tileY: number) {
    return this.flags.find((f) => f.tileX === tileX && f.tileY === tileY);
  }

  /** Recalcula os estágios (chamado após sessões e periodicamente: o tempo faz plantas murcharem). */
  refresh(now: Date = new Date()): void {
    for (const plot of this.plots) {
      const view = this.views.get(plot) ?? {};
      this.views.set(plot, view);
      const topic = plot.topic;
      if (!topic || !state.isTopicLearned(topic.id)) {
        view.plant?.destroy();
        view.drop?.destroy();
        view.plant = view.drop = undefined;
        continue;
      }
      const stage = plantStage(topicMastery(topic, now));
      const key = `plant-${plot.subject.id}-${stage}`;
      const x = plot.tileX * TILE + 8;
      const y = plot.tileY * TILE + 15;
      if (!view.plant) {
        view.plant = this.scene.add.image(x, y, key).setOrigin(0.5, 1).setDepth(y);
        view.plant.setScale(0.2);
        this.scene.tweens.add({ targets: view.plant, scale: 1, duration: 450, ease: 'Back.Out' });
      } else if (view.plant.texture.key !== key) {
        view.plant.setTexture(key);
        this.scene.tweens.add({ targets: view.plant, scaleX: { from: 1.25, to: 1 }, scaleY: { from: 0.8, to: 1 }, duration: 380, ease: 'Back.Out' });
        this.sparkle(x, y - 10);
      }
      const wilted = dueCount(topic, now) > 0;
      if (wilted) view.plant.setTint(0xc9b07a);
      else view.plant.clearTint();
      if (wilted && !view.drop) {
        view.drop = this.scene.add.image(x, y - 24, 'icon-drop').setDepth(10_000);
        this.scene.tweens.add({ targets: view.drop, y: y - 27, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      } else if (!wilted && view.drop) {
        view.drop.destroy();
        view.drop = undefined;
      }
    }
  }

  private sparkle(x: number, y: number): void {
    const emitter = this.scene.add.particles(x, y, 'sparkle', {
      speed: { min: 20, max: 60 },
      lifespan: 700,
      scale: { start: 1, end: 0 },
      quantity: 10,
      emitting: false,
    });
    emitter.setDepth(10_001);
    emitter.explode(12);
    this.scene.time.delayedCall(900, () => emitter.destroy());
  }
}
