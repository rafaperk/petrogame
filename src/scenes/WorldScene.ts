/**
 * O mundo explorável: terreno em tiles, objetos com colisão, jogador, NPCs, horta, refinaria e interações.
 * Cada mapa (vila, refinaria) é a mesma cena reiniciada com outro MapDef.
 */
import Phaser from 'phaser';
import { tileset } from '../art';
import { idleFrame, replaceCharacter, type Dir } from '../art/characters';
import { registerBuilding } from '../art/objects';
import { E, N, S, TILE_MARGIN, TILE_SPACING, TILESET_KEY, W } from '../art/tiles';
import { PLAYER_SPEED, RUN_MULTIPLIER, TILE } from '../config';
import { events } from '../core/events';
import { input } from '../core/input';
import { hashString } from '../core/rng';
import { state } from '../core/state';
import * as flows from '../game/flows';
import { playerLook } from '../game/items';
import { checkMissions } from '../game/missions';
import { npcById } from '../game/npcs';
import { content } from '../learning/content';
import { dueCount, topicStatus } from '../learning/mastery';
import type { Topic } from '../learning/types';
import { ui } from '../ui/UI';
import { hud } from '../ui/hud';
import { pauseMenu, showMissions } from '../ui/menus';
import { openBackpack } from '../ui/shop';
import { openNotebook, type NotebookActions } from '../ui/notebook';
import { Garden } from '../world/Garden';
import type { MapDef, PropKind, WarpDef } from '../world/mapTypes';
import { refinaria } from '../world/maps/refinaria';
import { vila } from '../world/maps/vila';
import { Yard } from '../world/Yard';

type Sprite = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

const MAPS: Record<string, MapDef> = { vila, refinaria };

/** O visual salvo é aplicado uma vez, na primeira entrada no mapa (a textura sobrevive às trocas de mapa). */
let lookApplied = false;

interface Interactable {
  rect: Phaser.Geom.Rectangle;
  label: () => string;
  run: () => Promise<void>;
}

interface NpcActor {
  id: string;
  name: string;
  sprite: Sprite;
  shadow: Phaser.GameObjects.Image;
  bubble: Phaser.GameObjects.Image;
  home: Phaser.Math.Vector2;
  wander: number;
  facing: Dir;
  defaultFacing: Dir;
  nextDecision: number;
  talking: boolean;
}

interface Placement {
  x: number;
  y: number;
  facing: Dir;
}

interface SceneData {
  mapId?: string;
  /** Já entra jogando nesta posição (troca de mapa ou save em outro mapa). */
  play?: Placement;
  fade?: boolean;
}

const PROPS: Record<PropKind, { key: string; w: number; h: number; body?: [number, number, number, number] }> = {
  fountain: { key: 'fountain', w: 3, h: 2, body: [2, 2, 44, 28] },
  board: { key: 'board', w: 2, h: 1, body: [2, 4, 28, 12] },
  lamp: { key: 'lamp', w: 1, h: 1, body: [5, 9, 6, 6] },
  bench: { key: 'bench', w: 2, h: 1, body: [4, 4, 24, 10] },
  crate: { key: 'crate', w: 1, h: 1, body: [1, 2, 14, 14] },
  barrel: { key: 'barrel', w: 1, h: 1, body: [2, 3, 12, 13] },
  tank: { key: 'tank', w: 3, h: 3, body: [1, 8, 46, 40] },
  pumpjack: { key: 'pumpjack', w: 3, h: 2, body: [2, 12, 44, 20] },
  flare: { key: 'flare', w: 1, h: 1, body: [2, 4, 12, 12] },
  boat: { key: 'boat', w: 3, h: 1 },
  column: { key: 'column', w: 2, h: 1, body: [8, 3, 16, 13] },
  piperack: { key: 'piperack', w: 3, h: 1, body: [2, 6, 44, 10] },
};

const NOTEBOOK_ACTIONS: NotebookActions = {
  reviewAll: () => flows.reviewAllFlow(),
  reviewTopic: (topic) => flows.reviewTopicsFlow([topic]),
  practice: async (plan) => void (await flows.runSession(plan)),
};

let resolveReady: (scene: WorldScene) => void = () => {};
export const worldReady = new Promise<WorldScene>((r) => (resolveReady = r));

const tileRect = (x: number, y: number, w = 1, h = 1) => new Phaser.Geom.Rectangle(x * TILE, y * TILE, w * TILE, h * TILE);
const DIR_VEC: Record<Dir, [number, number]> = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

function stationLabel(topic: Topic): string {
  if (!state.isTopicLearned(topic.id)) return topicStatus(topic) === 'locked' ? `🔒 ${topic.name}` : `Equipamento parado: ${topic.name}`;
  return dueCount(topic) > 0 ? `🔧 Manutenção: ${topic.name}` : `Operar: ${topic.name}`;
}

export class WorldScene extends Phaser.Scene {
  private map: MapDef = vila;
  private ground!: Phaser.Tilemaps.TilemapLayer;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Sprite;
  private playerShadow!: Phaser.GameObjects.Image;
  private facing: Dir = 'down';
  private npcs: NpcActor[] = [];
  private interactables: Interactable[] = [];
  private garden?: Garden;
  private yard?: Yard;
  private target: { label: string; run: () => Promise<void>; npc?: NpcActor } | null = null;
  private busy = false;
  private playing = false;
  private traveling = false;
  private pending: SceneData = {};
  private lastSaveAt = 0;
  private lastAreaCheck = 0;

  constructor() {
    super('world');
  }

  init(data: SceneData): void {
    this.map = MAPS[data?.mapId ?? 'vila'] ?? vila;
    this.pending = data ?? {};
    this.npcs = [];
    this.interactables = [];
    this.garden = undefined;
    this.yard = undefined;
    this.target = null;
    this.busy = false;
    this.playing = false;
    this.traveling = false;
  }

  create(): void {
    const map = this.map;
    const widthPx = map.rows[0].length * TILE;
    const heightPx = map.rows.length * TILE;
    this.physics.world.setBounds(0, 0, widthPx, heightPx);
    this.solids = this.physics.add.staticGroup();

    this.buildGround();
    this.buildAsciiObjects();
    this.buildBuildings();
    this.buildProps();
    this.buildSignsAndGates();
    if (map.garden) this.buildGarden();
    if (map.yards?.length) this.buildYards();
    this.buildPlayer();
    this.buildNpcs();

    const cam = this.cameras.main;
    cam.setBounds(0, 0, widthPx, heightPx);
    cam.setRoundPixels(true);
    cam.setBackgroundColor(map.background ?? '#3f8fcc');
    this.updateZoom();
    this.scale.on('resize', this.updateZoom, this);

    this.time.addEvent({ delay: 420, loop: true, callback: () => tileset.animate() });
    this.time.addEvent({ delay: 30_000, loop: true, callback: () => this.refreshWorld() });
    const offGarden = events.on('garden:changed', () => this.refreshWorld());
    const offRefresh = events.on('world:refresh', () => this.refreshWorld());
    const offLook = events.on('player:look', () => this.applyPlayerLook());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      offGarden();
      offRefresh();
      offLook();
      this.scale.off('resize', this.updateZoom, this);
    });

    input.setWorldHandler((e) => this.onKey(e));
    resolveReady(this);

    if (this.pending.play) this.beginPlay(this.pending.play, Boolean(this.pending.fade));
    else cam.centerOn(28 * TILE, 15 * TILE); // tela de título: a câmera passeia pela vila
  }

  // ---------------------------------------------------------------- construção

  private charAt(x: number, y: number): string | undefined {
    return this.map.rows[y]?.[x];
  }

  private mask(x: number, y: number, connects: (c: string) => boolean): number {
    const test = (cx: number, cy: number) => {
      const c = this.charAt(cx, cy);
      return c === undefined || connects(c);
    };
    return (test(x, y - 1) ? N : 0) | (test(x + 1, y) ? E : 0) | (test(x, y + 1) ? S : 0) | (test(x - 1, y) ? W : 0);
  }

  private groundIndex(ch: string, x: number, y: number): number {
    const ids = tileset.ids;
    const hash = hashString(`${x},${y}`);
    switch (ch) {
      case ',':
        return ids.flowers[hash % ids.flowers.length];
      case '=':
        return ids.path[this.mask(x, y, (c) => c === '=' || c === '#' || c === '_' || c === 'c')];
      case '#':
        return ids.stone[this.mask(x, y, (c) => c === '#' || c === '=' || c === '_' || c === 'c')];
      case 'c':
        return ids.concrete[this.mask(x, y, (c) => c === 'c' || c === '#' || c === '=')];
      case '~':
        return ids.water[this.mask(x, y, (c) => c === '~' || c === '_')];
      case ':':
        return ids.sand[hash % ids.sand.length];
      case '_':
        return ids.dock;
      case '%':
        return ids.soil;
      default:
        return hash % 6 === 0 ? ids.grass[1 + (hash % 3)] : ids.grass[0];
    }
  }

  private buildGround(): void {
    const rows = this.map.rows;
    const tm = this.make.tilemap({ width: rows[0].length, height: rows.length, tileWidth: TILE, tileHeight: TILE });
    const ts = tm.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE, TILE, TILE_MARGIN, TILE_SPACING, 0);
    if (!ts) throw new Error('Falha ao criar o tileset.');
    const layer = tm.createBlankLayer('ground', ts, 0, 0);
    if (!layer) throw new Error('Falha ao criar a camada do mapa.');
    rows.forEach((row, y) => [...row].forEach((ch, x) => layer.putTileAt(this.groundIndex(ch, x, y), x, y)));
    layer.setCollision(tileset.collidingIndexes);
    layer.setDepth(-100);
    this.ground = layer;
  }

  private solid(x: number, y: number, w: number, h: number): void {
    const zone = this.add.zone(x + w / 2, y + h / 2, w, h);
    this.physics.add.existing(zone, true);
    this.solids.add(zone);
  }

  private buildAsciiObjects(): void {
    const isFence = (x: number, y: number) =>
      this.charAt(x, y) === 'f' || this.map.gates.some((g) => !g.open && g.x === x && (g.y === y || g.y + 1 === y));
    this.map.rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const bx = x * TILE + 8;
        const by = y * TILE + 16;
        const hash = hashString(`o${x},${y}`);
        if (ch === 'T' || ch === 'P') {
          const key = ch === 'P' ? 'pine' : hash % 9 === 0 ? 'tree-1' : hash % 11 === 0 ? 'tree-2' : 'tree-0';
          this.add.image(bx, by - 2, 'shadow-lg').setDepth(-50).setAlpha(0.9);
          this.add.image(bx, by, key).setOrigin(0.5, 1).setDepth(by);
          this.solid(x * TILE + 3, y * TILE + 9, 10, 6);
        } else if (ch === 'b') {
          this.add.image(bx, by - 1, 'bush').setOrigin(0.5, 1).setDepth(by - 1);
          this.solid(x * TILE + 2, y * TILE + 6, 12, 9);
        } else if (ch === 'r') {
          this.add.image(bx, by - 2, 'rock').setOrigin(0.5, 1).setDepth(by - 2);
          this.solid(x * TILE + 2, y * TILE + 6, 12, 8);
        } else if (ch === 'f') {
          const m = (isFence(x, y - 1) ? N : 0) | (isFence(x + 1, y) ? E : 0) | (isFence(x, y + 1) ? S : 0) | (isFence(x - 1, y) ? W : 0);
          this.add.image(x * TILE, y * TILE, `fence-${m}`).setOrigin(0, 0).setDepth(y * TILE + 14);
          if (m & (E | W)) this.solid(x * TILE, y * TILE + 5, 16, 10);
          else this.solid(x * TILE + 5, y * TILE, 6, 16);
        }
      });
    });
  }

  private buildBuildings(): void {
    for (const b of this.map.buildings) {
      const key = `bld-${b.id}`;
      registerBuilding(this, key, b);
      this.add.image(b.x * TILE - 1, b.y * TILE - 1, key).setOrigin(0, 0).setDepth((b.y + b.h) * TILE - 1);
      this.solid(b.x * TILE, (b.y + 1) * TILE, b.w * TILE, (b.h - 1) * TILE);
      this.interactables.push({
        rect: tileRect(b.x + b.door, b.y + b.h - 1),
        label: () => (b.action ? `Entrar: ${b.name}` : `Porta: ${b.name}`),
        run: () =>
          b.action === 'arcade'
            ? flows.arcadeFlow()
            : b.action === 'simulado'
              ? flows.simuladoFlow()
              : b.action === 'home'
                ? flows.homeFlow()
                : flows.infoFlow(b.name, b.doorText ?? 'A porta está fechada.'),
      });
    }
  }

  private buildProps(): void {
    for (const p of this.map.props) {
      const cfg = PROPS[p.kind];
      const cx = p.x * TILE + (cfg.w * TILE) / 2;
      const bottom = (p.y + cfg.h) * TILE;
      const img = this.add.image(cx, bottom, cfg.key).setOrigin(0.5, 1).setDepth(p.kind === 'boat' ? -60 : bottom - 1);
      if (cfg.body) {
        const [dx, dy, w, h] = cfg.body;
        this.solid(p.x * TILE + dx, p.y * TILE + dy, w, h);
      }
      if (p.kind === 'flare') {
        const flame = this.add.image(cx, bottom - 50, 'flame').setOrigin(0.5, 1).setDepth(bottom);
        this.tweens.add({ targets: flame, scaleY: { from: 0.85, to: 1.2 }, alpha: { from: 0.85, to: 1 }, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      }
      if (p.kind === 'boat') {
        this.tweens.add({ targets: img, y: bottom + 1, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      }
      if (p.kind === 'board') {
        this.interactables.push({ rect: tileRect(p.x, p.y - 1, cfg.w, cfg.h + 1), label: () => 'Ver o quadro de missões', run: () => this.openMissions() });
      }
      if (p.kind === 'fountain') {
        this.interactables.push({
          rect: tileRect(p.x, p.y, cfg.w, cfg.h),
          label: () => 'Olhar a fonte',
          run: () => flows.infoFlow('Fonte da praça', 'Dizem que quem joga uma moeda aqui e **revisa todo dia** passa no concurso. A parte da moeda é opcional.'),
        });
      }
      if (p.kind === 'column') {
        this.interactables.push({
          rect: tileRect(p.x, p.y - 1, cfg.w, cfg.h + 1),
          label: () => 'Olhar a coluna de destilação',
          run: () =>
            flows.infoFlow(
              'Coluna de destilação',
              'Separa o petróleo em frações pela diferença de volatilidade: os mais leves sobem e saem no topo; os pesados ficam embaixo. Bom lembrete de **equilíbrio de fases** e **transferência de calor**.',
            ),
        });
      }
    }
  }

  private buildSignsAndGates(): void {
    for (const s of this.map.signs) {
      this.add.image(s.x * TILE + 8, s.y * TILE + 16, 'sign').setOrigin(0.5, 1).setDepth(s.y * TILE + 15);
      this.solid(s.x * TILE + 3, s.y * TILE + 9, 10, 6);
      const subject = s.subjectId ? content.subjectById.get(s.subjectId) : undefined;
      this.interactables.push({
        rect: tileRect(s.x, s.y),
        label: () => (subject ? `Placa: ${subject.place}` : `Ler: ${s.title}`),
        run: () => (subject ? flows.unitFlow(subject) : flows.infoFlow(s.title, s.text)),
      });
    }
    for (const g of this.map.gates) {
      if (g.open) {
        // cancela levantada sobre o mourão da cerca, ao lado da estrada
        this.add.image(g.x * TILE, g.y * TILE - 34, 'barrier').setOrigin(0, 0).setDepth(g.y * TILE);
        this.interactables.push({ rect: tileRect(g.x, g.y - 1), label: () => g.title, run: () => flows.infoFlow(g.title, g.text) });
        continue;
      }
      this.add.image(g.x * TILE, g.y * TILE - 2, 'gate').setOrigin(0, 0).setDepth((g.y + 2) * TILE - 1);
      this.solid(g.x * TILE, g.y * TILE, TILE, TILE * 2);
      this.interactables.push({ rect: tileRect(g.x, g.y, 1, 2), label: () => g.title, run: () => flows.infoFlow(g.title, g.text) });
    }
  }

  private buildGarden(): void {
    const garden = new Garden(this, this.map.garden!);
    this.garden = garden;
    for (const plot of garden.plots) {
      this.interactables.push({
        rect: tileRect(plot.tileX, plot.tileY),
        label: () => {
          const t = plot.topic;
          if (!t) return 'Canteiro livre';
          return state.isTopicLearned(t.id) ? `Cuidar: ${t.name}` : `Canteiro: ${t.name}`;
        },
        run: async () => {
          if (plot.topic) await flows.topicFlow(plot.topic);
          else await flows.infoFlow('Canteiro livre', 'Espaço reservado para novos tópicos desta matéria.');
        },
      });
    }
    for (const f of garden.flags) {
      this.solid(f.tileX * TILE + 4, f.tileY * TILE + 10, 8, 6);
      this.interactables.push({ rect: tileRect(f.tileX, f.tileY), label: () => `Fileira: ${f.subject.short}`, run: () => flows.gardenRowFlow(f.subject) });
    }
  }

  private buildYards(): void {
    const yard = new Yard(this, this.map.yards!);
    this.yard = yard;
    for (const st of yard.stations) {
      const [x, y, w, h] = yard.bodyOf(st);
      this.solid(x, y, w, h);
      this.interactables.push({
        rect: tileRect(st.tileX, st.tileY, 2, 2),
        label: () => (st.topic ? stationLabel(st.topic) : `Base livre · ${st.subject.short}`),
        run: async () => {
          if (st.topic) await flows.topicFlow(st.topic);
          else await flows.infoFlow('Base livre', `Espaço reservado para novos tópicos de **${st.subject.name}**. Cada tópico novo cadastrado ganha um equipamento aqui.`);
        },
      });
    }
  }

  private buildPlayer(): void {
    const { spawn } = this.map;
    this.player = this.physics.add.sprite(spawn.x * TILE + 8, spawn.y * TILE + 12, 'player', idleFrame(spawn.facing)).setOrigin(0.5, 1) as Sprite;
    this.player.body.setSize(10, 6).setOffset(3, 18);
    this.player.setCollideWorldBounds(true);
    this.player.setVisible(false);
    this.playerShadow = this.add.image(this.player.x, this.player.y, 'shadow').setDepth(-40).setVisible(false);
    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.player, this.ground);
    this.facing = spawn.facing;
  }

  private buildNpcs(): void {
    for (const placement of this.map.npcs) {
      const def = npcById.get(placement.id);
      if (!def) continue;
      const key = `npc-${def.id}`;
      const facing = placement.facing ?? 'down';
      const sprite = this.physics.add.sprite(placement.x * TILE + 8, placement.y * TILE + 14, key, idleFrame(facing)).setOrigin(0.5, 1) as Sprite;
      sprite.body.setSize(12, 11).setOffset(2, 13);
      sprite.body.setImmovable(true);
      sprite.body.pushable = false;
      const shadow = this.add.image(sprite.x, sprite.y, 'shadow').setDepth(-40);
      const bubble = this.add.image(sprite.x, sprite.y - 28, 'icon-exclaim').setDepth(10_000).setVisible(false);
      this.physics.add.collider(this.player, sprite);
      if (placement.wander) {
        this.physics.add.collider(sprite, this.solids);
        this.physics.add.collider(sprite, this.ground);
        sprite.setCollideWorldBounds(true);
      }
      this.npcs.push({
        id: def.id,
        name: def.name,
        sprite,
        shadow,
        bubble,
        home: new Phaser.Math.Vector2(sprite.x, sprite.y),
        wander: placement.wander ?? 0,
        facing,
        defaultFacing: facing,
        nextDecision: 0,
        talking: false,
      });
    }
    this.refreshBubbles();
  }

  // ---------------------------------------------------------------- estado e mapas

  private spawnOf(map: MapDef): Placement {
    return { x: map.spawn.x * TILE + 8, y: map.spawn.y * TILE + 12, facing: map.spawn.facing };
  }

  /** Chamado depois da tela de título: posiciona o jogador conforme o save (inclusive em outro mapa). */
  startPlaying(): void {
    const saved = state.data.player;
    const mapId = MAPS[saved.map] ? saved.map : 'vila';
    const pos: Placement = saved.x > 0 ? { x: saved.x, y: saved.y, facing: saved.facing } : this.spawnOf(MAPS[mapId]);
    if (mapId !== this.map.id) {
      this.scene.restart({ mapId, play: pos, fade: true } satisfies SceneData);
      return;
    }
    this.beginPlay(pos, false);
  }

  /** Redesenha o jogador com as peças de visual em uso (loja e mochila). */
  applyPlayerLook(): void {
    replaceCharacter(this, 'player', playerLook());
    this.player.anims.stop();
    this.player.setTexture('player', idleFrame(this.facing));
    events.emit('state:changed');
  }

  private beginPlay(pos: Placement, fade: boolean): void {
    if (!lookApplied) {
      lookApplied = true;
      this.applyPlayerLook();
    }
    this.facing = pos.facing;
    this.player.setPosition(pos.x, pos.y).setVisible(true).setFrame(idleFrame(this.facing));
    this.player.body.reset(pos.x, pos.y);
    this.playerShadow.setVisible(true);
    const cam = this.cameras.main;
    cam.startFollow(this.player, true, 0.14, 0.14);
    cam.centerOn(pos.x, pos.y);
    if (fade) cam.fadeIn(280, 0, 0, 0);
    this.playing = true;
    this.savePosition(true);
    this.refreshWorld();
    if (this.map.id === 'refinaria' && !state.flag('intro:refinaria')) {
      this.time.delayedCall(450, () => void this.withBusy(() => flows.refinariaWelcome()));
    }
  }

  /** Atravessa uma passagem: escurece a tela e reabre a cena no outro mapa. */
  private travel(warp: WarpDef, offsetY: number): void {
    const target = MAPS[warp.to];
    if (this.traveling || !target) return;
    this.traveling = true;
    this.playing = false;
    this.player.setVelocity(0, 0);
    this.player.anims.stop();
    hud.setPrompt(null);
    const y = Phaser.Math.Clamp(warp.toY + offsetY, 0, target.rows.length - 1);
    const dest: Placement = { x: warp.toX * TILE + 8, y: y * TILE + 12, facing: warp.facing };
    Object.assign(state.data.player, { map: warp.to, x: dest.x, y: dest.y, facing: dest.facing });
    state.saveNow();
    const cam = this.cameras.main;
    cam.fadeOut(220, 0, 0, 0);
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.restart({ mapId: warp.to, play: dest, fade: true } satisfies SceneData));
  }

  refreshWorld(): void {
    this.garden?.refresh();
    this.yard?.refresh();
    this.refreshBubbles();
  }

  private npcHasNews(id: string): boolean {
    const def = npcById.get(id);
    if (!def) return false;
    if (def.role === 'guide') return !state.flag(`talked:${id}`);
    if (def.role === 'mentor' && def.subjectId) {
      const subject = content.subjectById.get(def.subjectId);
      if (!subject) return false;
      if (!state.subject(subject.id).introSeen) return true;
      const anyLearned = subject.topics.some((t) => state.isTopicLearned(t.id));
      return !anyLearned && subject.topics.some((t) => topicStatus(t) === 'available');
    }
    return Boolean(def.intro) && !state.flag(`talked:${id}`);
  }

  private refreshBubbles(): void {
    for (const npc of this.npcs) npc.bubble.setVisible(this.playing && this.npcHasNews(npc.id));
  }

  private updateZoom(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const zoom = Phaser.Math.Clamp(Math.floor(Math.min(w / (TILE * 18), h / (TILE * 11))), 2, 5);
    this.cameras.main.setSize(w, h);
    this.cameras.main.setZoom(zoom);
  }

  // ---------------------------------------------------------------- entrada

  private onKey(e: KeyboardEvent): void {
    if (!this.playing || this.busy) return;
    if (['KeyE', 'Space', 'Enter', 'NumpadEnter'].includes(e.code)) {
      if (this.target) void this.interact(this.target);
    } else if (e.code === 'KeyC' || e.code === 'Tab') {
      void this.openNotebook();
    } else if (e.code === 'KeyM') {
      void this.openMissions();
    } else if (e.code === 'KeyI') {
      void this.openBackpack();
    } else if (e.code === 'Escape') {
      void this.openMenu();
    }
  }

  private async withBusy(fn: () => Promise<void>): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.player.setVelocity(0, 0);
    this.player.anims.stop();
    this.player.setFrame(idleFrame(this.facing));
    try {
      await fn();
    } catch (err) {
      console.error(err);
    } finally {
      this.busy = false;
      if (this.playing) this.savePosition(true);
      this.refreshWorld();
      checkMissions();
    }
  }

  private async interact(target: NonNullable<WorldScene['target']>): Promise<void> {
    const npc = target.npc;
    await this.withBusy(async () => {
      if (npc) {
        npc.talking = true;
        npc.sprite.setVelocity(0, 0);
        const dx = this.player.x - npc.sprite.x;
        const dy = this.player.y - npc.sprite.y;
        npc.facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
        npc.sprite.anims.stop();
        npc.sprite.setFrame(idleFrame(npc.facing));
      }
      try {
        await target.run();
      } finally {
        if (npc) {
          npc.talking = false;
          if (!npc.wander) {
            npc.facing = npc.defaultFacing;
            npc.sprite.setFrame(idleFrame(npc.facing));
          }
        }
      }
    });
  }

  openNotebook(): Promise<void> {
    return this.withBusy(() => openNotebook(NOTEBOOK_ACTIONS));
  }

  openMissions(): Promise<void> {
    return this.withBusy(() => showMissions());
  }

  openBackpack(): Promise<void> {
    return this.withBusy(() => openBackpack());
  }

  openMenu(): Promise<void> {
    return this.withBusy(() => pauseMenu({ openNotebook: () => openNotebook(NOTEBOOK_ACTIONS), openMissions: showMissions, openBackpack }));
  }

  // ---------------------------------------------------------------- loop

  update(time: number): void {
    this.updateNpcs(time);
    if (!this.playing) {
      if (!this.traveling && !this.pending.play) {
        const cam = this.cameras.main;
        cam.scrollX += Math.sin(time / 6000) * 0.08;
      }
      return;
    }
    this.updatePlayer();
    this.updateTarget();
    this.player.setDepth(this.player.y);
    this.playerShadow.setPosition(this.player.x, this.player.y - 1);
    this.checkWarps();
    if (time - this.lastAreaCheck > 400) {
      this.lastAreaCheck = time;
      this.checkAreas();
    }
    if (time - this.lastSaveAt > 5000) {
      this.lastSaveAt = time;
      this.savePosition(false);
    }
  }

  private updatePlayer(): void {
    const blocked = this.busy || ui.isBlocking();
    const left = !blocked && input.isDown('ArrowLeft', 'KeyA');
    const right = !blocked && input.isDown('ArrowRight', 'KeyD');
    const up = !blocked && input.isDown('ArrowUp', 'KeyW');
    const down = !blocked && input.isDown('ArrowDown', 'KeyS');
    const run = input.isDown('ShiftLeft', 'ShiftRight');
    let vx = (right ? 1 : 0) - (left ? 1 : 0);
    let vy = (down ? 1 : 0) - (up ? 1 : 0);
    if (vx || vy) {
      const len = Math.hypot(vx, vy);
      vx /= len;
      vy /= len;
      const speed = PLAYER_SPEED * (run ? RUN_MULTIPLIER : 1);
      this.player.setVelocity(vx * speed, vy * speed);
      const horizontal: Dir = vx < 0 ? 'left' : 'right';
      const vertical: Dir = vy < 0 ? 'up' : 'down';
      if (vx && !vy) this.facing = horizontal;
      else if (vy && !vx) this.facing = vertical;
      else if (this.facing !== horizontal && this.facing !== vertical) this.facing = vertical;
      this.player.anims.play(`player-walk-${this.facing}`, true);
      this.player.anims.timeScale = run ? 1.5 : 1;
    } else {
      this.player.setVelocity(0, 0);
      if (this.player.anims.isPlaying) this.player.anims.stop();
      this.player.setFrame(idleFrame(this.facing));
    }
  }

  private updateTarget(): void {
    if (this.busy) return;
    const [fx, fy] = DIR_VEC[this.facing];
    let found: WorldScene['target'] = null;
    // testa pontos a distâncias crescentes à frente do jogador: o mais próximo vence
    for (const dist of [6, 12, 19]) {
      const px = this.player.x + fx * dist;
      const py = this.player.y - 4 + fy * dist;
      const npc = this.npcs.find((n) => Phaser.Math.Distance.Between(px, py, n.sprite.x, n.sprite.y - 5) < 10);
      if (npc) {
        found = { label: `Falar com ${npc.name}`, run: () => flows.talkTo(npc.id), npc };
        break;
      }
      const hit = this.interactables.find((it) => it.rect.contains(px, py));
      if (hit) {
        found = { label: hit.label(), run: hit.run };
        break;
      }
    }
    this.target = found;
    hud.setPrompt(found ? found.label : null);
  }

  private updateNpcs(time: number): void {
    for (const npc of this.npcs) {
      const s = npc.sprite;
      s.setDepth(s.y);
      npc.shadow.setPosition(s.x, s.y - 1);
      npc.bubble.setPosition(s.x, Math.round(s.y - 28 + Math.sin(time / 260) * 1.5));
      if (!npc.wander) continue;
      if (npc.talking || !this.playing) {
        s.setVelocity(0, 0);
        s.anims.stop();
        continue;
      }
      if (time > npc.nextDecision) {
        const away = Phaser.Math.Distance.Between(s.x, s.y, npc.home.x, npc.home.y) > npc.wander * TILE;
        if (!away && Math.random() < 0.45) {
          s.setVelocity(0, 0);
          npc.nextDecision = time + 1200 + Math.random() * 2500;
        } else {
          let dir: Dir;
          if (away) {
            const dx = npc.home.x - s.x;
            const dy = npc.home.y - s.y;
            dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
          } else dir = (['up', 'down', 'left', 'right'] as Dir[])[Math.floor(Math.random() * 4)];
          const [dx, dy] = DIR_VEC[dir];
          s.setVelocity(dx * 26, dy * 26);
          npc.facing = dir;
          npc.nextDecision = time + 500 + Math.random() * 1100;
        }
      }
      if (s.body.velocity.lengthSq() > 1) s.anims.play(`npc-${npc.id}-walk-${npc.facing}`, true);
      else {
        s.anims.stop();
        s.setFrame(idleFrame(npc.facing));
      }
    }
  }

  private playerTile(): { tx: number; ty: number } {
    return { tx: Math.floor(this.player.x / TILE), ty: Math.floor((this.player.y - 2) / TILE) };
  }

  private checkWarps(): void {
    if (this.busy || this.traveling) return;
    const { tx, ty } = this.playerTile();
    for (const w of this.map.warps ?? []) {
      if (tx >= w.x && tx < w.x + w.w && ty >= w.y && ty < w.y + w.h) {
        this.travel(w, ty - w.y);
        return;
      }
    }
  }

  private checkAreas(): void {
    const { tx, ty } = this.playerTile();
    for (const a of this.map.areas ?? []) {
      if (tx >= a.x && tx < a.x + a.w && ty >= a.y && ty < a.y + a.h && !state.flag(`visited:${a.id}`)) {
        state.setFlag(`visited:${a.id}`);
        checkMissions();
      }
    }
  }

  private savePosition(force: boolean): void {
    if (this.traveling) return;
    const p = state.data.player;
    const x = Math.round(this.player.x);
    const y = Math.round(this.player.y);
    if (!force && p.x === x && p.y === y && p.facing === this.facing && p.map === this.map.id) return;
    p.x = x;
    p.y = y;
    p.facing = this.facing;
    p.map = this.map.id;
    state.saveNow();
  }
}
