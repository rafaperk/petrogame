/**
 * Pátio de equipamentos da Refinaria: um equipamento (2×2 tiles) por tópico de Conhecimentos Específicos.
 * Estado do equipamento = maestria (lâmpada: vermelha → laranja → amarela → verde → azul).
 * Parado/cinza = ainda não estudado; cadeado = pré-requisito pendente; chave inglesa = revisão vencida.
 */
import Phaser from 'phaser';
import { TILE } from '../config';
import { state } from '../core/state';
import { content } from '../learning/content';
import { dueCount, plantStage, topicMastery, topicStatus } from '../learning/mastery';
import type { EquipmentKind, Subject, Topic } from '../learning/types';
import type { YardDef } from './mapTypes';

export interface Station {
  tileX: number;
  tileY: number;
  subject: Subject;
  topic?: Topic;
}

interface StationView {
  sprite: Phaser.GameObjects.Image;
  lamp?: Phaser.GameObjects.Image;
  badge?: Phaser.GameObjects.Image;
  badgeKey?: string;
  puffTimer?: Phaser.Time.TimerEvent;
  stage?: number;
}

const TINT_IDLE = 0x9a9aa6;
const TINT_LOCKED = 0x5f6068;

export class Yard {
  readonly stations: Station[] = [];
  private readonly views = new Map<Station, StationView>();
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, defs: YardDef[]) {
    this.scene = scene;
    for (const def of defs) {
      const subject = content.subjectById.get(def.subjectId);
      if (!subject) continue;
      const step = def.step ?? 3;
      for (let row = 0; row < def.rows; row++) {
        for (let col = 0; col < def.cols; col++) {
          const i = row * def.cols + col;
          this.stations.push({ tileX: def.x + col * step, tileY: def.y + row * step, subject, topic: subject.topics[i] });
        }
      }
      if (subject.topics.length > def.rows * def.cols) {
        console.warn(`[refinaria] ${subject.id}: ${subject.topics.length} tópicos para ${def.rows * def.cols} bases — aumente o pátio em maps/refinaria.ts.`);
      }
    }
    for (const st of this.stations) {
      const x = (st.tileX + 1) * TILE;
      const bottom = (st.tileY + 2) * TILE;
      const kind: EquipmentKind | undefined = st.topic ? (st.topic.equipment ?? st.subject.equipment ?? 'panel') : undefined;
      const sprite = scene.add.image(x, bottom, kind ? `eq-${kind}` : 'eq-empty').setOrigin(0.5, 1).setDepth(bottom - 1);
      this.views.set(st, { sprite });
    }
    this.refresh();
  }

  /** Área (em px) ocupada pelo equipamento, para colisão: só a metade de baixo é sólida. */
  bodyOf(st: Station): [number, number, number, number] {
    return [st.tileX * TILE + 2, st.tileY * TILE + 14, TILE * 2 - 4, TILE * 2 - 16];
  }

  refresh(now: Date = new Date()): void {
    for (const st of this.stations) {
      const view = this.views.get(st)!;
      const topic = st.topic;
      if (!topic) continue;
      const x = (st.tileX + 1) * TILE;
      const top = st.tileY * TILE;
      const learned = state.isTopicLearned(topic.id);
      if (!learned) {
        const locked = topicStatus(topic, now) === 'locked';
        view.sprite.setTint(locked ? TINT_LOCKED : TINT_IDLE);
        view.lamp?.destroy();
        view.lamp = undefined;
        view.puffTimer?.remove();
        view.puffTimer = undefined;
        this.setBadge(view, locked ? 'icon-lock' : undefined, x, top);
        continue;
      }
      view.sprite.clearTint();
      const stage = plantStage(topicMastery(topic, now));
      if (view.stage !== undefined && stage > view.stage) this.sparkle(x, top + 10);
      view.stage = stage;
      if (!view.lamp) {
        view.lamp = this.scene.add.image(x + 12, top + 6, `lamp-${stage}`).setDepth(top + 2 * TILE);
      }
      view.lamp.setTexture(`lamp-${stage}`);
      const due = dueCount(topic, now) > 0;
      this.scene.tweens.killTweensOf(view.lamp);
      view.lamp.setAlpha(1);
      if (due) {
        view.lamp.setTexture('lamp-0');
        this.scene.tweens.add({ targets: view.lamp, alpha: 0.25, duration: 420, yoyo: true, repeat: -1 });
      }
      this.setBadge(view, due ? 'icon-wrench' : undefined, x, top);
      // equipamentos operando (estágio ≥ 2) soltam um pouco de vapor
      if (stage >= 2 && !due && !view.puffTimer) {
        view.puffTimer = this.scene.time.addEvent({ delay: 1400 + Math.random() * 900, loop: true, callback: () => this.puff(x - 6, top + 2) });
      } else if ((stage < 2 || due) && view.puffTimer) {
        view.puffTimer.remove();
        view.puffTimer = undefined;
      }
    }
  }

  stationAt(tileX: number, tileY: number): Station | undefined {
    return this.stations.find((s) => tileX >= s.tileX && tileX < s.tileX + 2 && tileY >= s.tileY && tileY < s.tileY + 2);
  }

  private setBadge(view: StationView, key: string | undefined, x: number, top: number): void {
    if (view.badgeKey === key) return;
    view.badge?.destroy();
    view.badge = undefined;
    view.badgeKey = key;
    if (!key) return;
    view.badge = this.scene.add.image(x, top - 6, key).setDepth(10_000);
    if (key === 'icon-wrench') {
      this.scene.tweens.add({ targets: view.badge, y: top - 9, angle: { from: -12, to: 12 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
  }

  private puff(x: number, y: number): void {
    const p = this.scene.add.image(x, y, 'puff').setDepth(10_000).setAlpha(0.8).setScale(0.6);
    this.scene.tweens.add({ targets: p, y: y - 14, x: x + 4, alpha: 0, scale: 1.4, duration: 1500, ease: 'Sine.Out', onComplete: () => p.destroy() });
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
