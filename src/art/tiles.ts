/**
 * Tileset procedural com "autotile" (bordas calculadas pelos vizinhos) e água animada.
 * Cada tile tem 1 px de extrusão nas bordas para evitar linhas entre tiles ao mover a câmera.
 */
import type Phaser from 'phaser';
import { hashString, mulberry32 } from '../core/rng';
import { PAL } from './palette';
import { PixelBuffer } from './pixel';

export const TILESET_KEY = 'tiles';
export const TILE_MARGIN = 1;
export const TILE_SPACING = 2;

/** Bits da máscara de vizinhança: lado "conectado" = mesmo tipo de terreno. */
export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;

type Draw = (b: PixelBuffer, frame: number) => void;

interface Slot {
  draw: Draw;
  animated: boolean;
}

const COLS = 16;
const CELL = 16 + TILE_SPACING;
const edgeNoise = (seed: number, i: number) => (hashString(`${seed}:${i}`) % 3 === 0 ? 1 : 0);

function grass(b: PixelBuffer, seed: number, tufts = 2): void {
  const r = mulberry32(seed);
  b.rect(0, 0, 16, 16, PAL.grass);
  for (let i = 0; i < 18; i++) b.set(r() * 16, r() * 16, PAL.grassDark);
  for (let i = 0; i < 9; i++) b.set(r() * 16, r() * 16, PAL.grassLight);
  for (let i = 0; i < tufts; i++) {
    const x = 2 + Math.floor(r() * 12);
    const y = 3 + Math.floor(r() * 11);
    b.set(x, y, PAL.grassDeep).set(x - 1, y - 1, PAL.grassDeep).set(x + 1, y - 1, PAL.grassDeep).set(x, y - 1, PAL.grassLight);
  }
}

function flowers(b: PixelBuffer, seed: number): void {
  grass(b, seed, 1);
  const r = mulberry32(seed + 7);
  const petals = [PAL.white, PAL.pink, PAL.yellow, '#b9a3f0'];
  const count = 2 + Math.floor(r() * 2);
  for (let i = 0; i < count; i++) {
    const x = 2 + Math.floor(r() * 12);
    const y = 2 + Math.floor(r() * 12);
    const c = petals[Math.floor(r() * petals.length)];
    b.set(x - 1, y, c).set(x + 1, y, c).set(x, y - 1, c).set(x, y + 1, c).set(x, y, c === PAL.yellow ? PAL.orange : PAL.yellow);
  }
}

function grassEdges(b: PixelBuffer, mask: number, seed: number, lip: string): void {
  const r = mulberry32(seed + 99);
  for (let i = 0; i < 16; i++) {
    if (!(mask & N)) {
      const d = 2 + edgeNoise(seed, i);
      for (let y = 0; y < d; y++) b.set(i, y, r() < 0.15 ? PAL.grassDark : PAL.grass);
      b.set(i, d, lip);
    }
    if (!(mask & S)) {
      const d = 2 + edgeNoise(seed + 1, i);
      for (let y = 16 - d; y < 16; y++) b.set(i, y, r() < 0.15 ? PAL.grassDark : PAL.grass);
      b.set(i, 16 - d, PAL.grassLight);
    }
    if (!(mask & W)) {
      const d = 2 + edgeNoise(seed + 2, i);
      for (let x = 0; x < d; x++) b.set(x, i, r() < 0.15 ? PAL.grassDark : PAL.grass);
      b.set(d, i, lip);
    }
    if (!(mask & E)) {
      const d = 2 + edgeNoise(seed + 3, i);
      for (let x = 16 - d; x < 16; x++) b.set(x, i, r() < 0.15 ? PAL.grassDark : PAL.grass);
      b.set(15 - d, i, lip);
    }
  }
}

function path(b: PixelBuffer, mask: number): void {
  const seed = 500 + mask;
  const r = mulberry32(seed);
  b.rect(0, 0, 16, 16, PAL.path);
  for (let i = 0; i < 16; i++) b.set(r() * 16, r() * 16, PAL.pathDark);
  for (let i = 0; i < 10; i++) b.set(r() * 16, r() * 16, PAL.pathLight);
  for (let i = 0; i < 2; i++) {
    const x = 3 + Math.floor(r() * 10);
    const y = 3 + Math.floor(r() * 10);
    b.set(x, y, PAL.stoneLight).set(x + 1, y, PAL.stoneLight).set(x, y + 1, PAL.stoneDark).set(x + 1, y + 1, PAL.stoneDark);
  }
  grassEdges(b, mask, seed, PAL.pathDark);
}

function stone(b: PixelBuffer, mask: number): void {
  const r = mulberry32(900 + mask);
  b.rect(0, 0, 16, 16, PAL.mortar);
  for (let row = 0; row < 4; row++) {
    const y = row * 4;
    const offset = row % 2 ? 4 : 0;
    for (let x = -offset; x < 16; x += 8) {
      const base = r() < 0.3 ? PAL.stoneLight : r() < 0.5 ? '#b3ada4' : PAL.stone;
      b.rect(x + 1, y + 1, 7, 3, base);
      b.hline(x + 1, y + 1, 6, '#d3cec5');
      b.hline(x + 2, y + 3, 6, PAL.stoneDark);
    }
  }
  if (!(mask & N)) b.hline(0, 0, 16, PAL.stoneDark).hline(0, 1, 16, PAL.mortar);
  if (!(mask & S)) b.hline(0, 15, 16, '#6d675f').hline(0, 14, 16, PAL.stoneDark);
  if (!(mask & W)) b.vline(0, 0, 16, PAL.stoneDark);
  if (!(mask & E)) b.vline(15, 0, 16, PAL.stoneDark);
}

/** Piso de concreto industrial: placas com juntas de dilatação e meio-fio nas bordas. */
function concrete(b: PixelBuffer, mask: number): void {
  const r = mulberry32(1700 + mask);
  b.rect(0, 0, 16, 16, '#b9bcb8');
  for (let i = 0; i < 16; i++) b.set(r() * 16, r() * 16, '#a7aaa6');
  for (let i = 0; i < 8; i++) b.set(r() * 16, r() * 16, '#c9ccc7');
  // juntas a cada 8 px (placas de 8x8 vistas de cima)
  b.hline(0, 7, 16, '#a1a49f').vline(7, 0, 16, '#a1a49f');
  b.hline(0, 8, 16, '#c5c8c3').vline(8, 0, 16, '#c5c8c3');
  if (r() < 0.35) b.set(3 + Math.floor(r() * 10), 3 + Math.floor(r() * 10), '#8f938e');
  if (!(mask & N)) b.hline(0, 0, 16, '#8a8d89').hline(0, 1, 16, '#d6d8d3');
  if (!(mask & S)) b.hline(0, 15, 16, '#6f726e').hline(0, 14, 16, '#8a8d89');
  if (!(mask & W)) b.vline(0, 0, 16, '#8a8d89');
  if (!(mask & E)) b.vline(15, 0, 16, '#7c7f7b');
}

function water(b: PixelBuffer, mask: number, frame: number): void {
  const r = mulberry32(1300 + mask);
  b.rect(0, 0, 16, 16, PAL.water);
  for (let i = 0; i < 10; i++) b.set(r() * 16, r() * 16, PAL.waterDeep);
  for (let i = 0; i < 3; i++) {
    const baseX = Math.floor(r() * 16);
    const y = 2 + i * 5 + Math.floor(r() * 2);
    const x = (baseX + frame * 2) % 16;
    for (let k = 0; k < 3; k++) b.set((x + k) % 16, y, PAL.waterLight);
    b.set((x + 1) % 16, y - 1, frame === 1 ? PAL.foam : PAL.waterLight);
  }
  const foamAt = (i: number) => (i + frame) % 4 !== 0;
  for (let i = 0; i < 16; i++) {
    if (!(mask & N)) {
      b.set(i, 0, PAL.sandDark).set(i, 1, PAL.sand);
      if (foamAt(i)) b.set(i, 2, PAL.foam);
    }
    if (!(mask & S)) {
      b.set(i, 15, PAL.sandDark);
      if (foamAt(i + 2)) b.set(i, 14, PAL.foam);
    }
    if (!(mask & W)) {
      b.set(0, i, PAL.sandDark).set(1, i, PAL.sand);
      if (foamAt(i + 1)) b.set(2, i, PAL.foam);
    }
    if (!(mask & E)) {
      b.set(15, i, PAL.sandDark).set(14, i, PAL.sand);
      if (foamAt(i + 3)) b.set(13, i, PAL.foam);
    }
  }
}

function sand(b: PixelBuffer, seed: number): void {
  const r = mulberry32(seed);
  b.rect(0, 0, 16, 16, PAL.sand);
  for (let i = 0; i < 14; i++) b.set(r() * 16, r() * 16, PAL.sandDark);
  for (let i = 0; i < 10; i++) b.set(r() * 16, r() * 16, PAL.sandLight);
  if (seed % 2) {
    const x = 4 + Math.floor(r() * 8);
    const y = 4 + Math.floor(r() * 8);
    b.set(x, y, PAL.white).set(x + 1, y, PAL.pink);
  }
}

function dock(b: PixelBuffer): void {
  b.rect(0, 0, 16, 16, PAL.wood);
  for (let row = 0; row < 4; row++) {
    const y = row * 4;
    b.hline(0, y, 16, PAL.woodLight);
    b.hline(0, y + 3, 16, PAL.woodDark);
    const seam = (row * 7 + 3) % 16;
    b.vline(seam, y, 4, PAL.woodDark);
    b.set((seam + 5) % 16, y + 1, PAL.woodDark);
    b.set((seam + 2) % 16, y + 2, '#5c3d22');
  }
}

function soil(b: PixelBuffer): void {
  const r = mulberry32(77);
  b.rect(0, 0, 16, 16, PAL.soil);
  for (let y = 1; y < 16; y += 4) {
    b.hline(0, y, 16, PAL.soilDark);
    b.hline(0, y + 1, 16, PAL.soilLight);
  }
  for (let i = 0; i < 10; i++) b.set(r() * 16, r() * 16, PAL.soilDark);
}

export interface TileIds {
  grass: number[];
  flowers: number[];
  sand: number[];
  dock: number;
  soil: number;
  path: number[];
  stone: number[];
  concrete: number[];
  water: number[];
}

export class Tileset {
  readonly ids: TileIds;
  private readonly slots: Slot[] = [];
  private texture: Phaser.Textures.CanvasTexture | null = null;
  private frame = 0;

  constructor() {
    const add = (draw: Draw, animated = false) => this.slots.push({ draw, animated }) - 1;
    const range = (n: number, fn: (i: number) => number) => Array.from({ length: n }, (_, i) => fn(i));
    this.ids = {
      grass: range(4, (i) => add((b) => grass(b, 11 + i * 31, i === 0 ? 1 : 2))),
      flowers: range(3, (i) => add((b) => flowers(b, 211 + i * 17))),
      sand: range(2, (i) => add((b) => sand(b, 301 + i))),
      dock: add((b) => dock(b)),
      soil: add((b) => soil(b)),
      path: range(16, (mask) => add((b) => path(b, mask))),
      stone: range(16, (mask) => add((b) => stone(b, mask))),
      concrete: range(16, (mask) => add((b) => concrete(b, mask))),
      water: range(16, (mask) => add((b, f) => water(b, mask, f), true)),
    };
  }

  get collidingIndexes(): number[] {
    return this.ids.water;
  }

  /** Cria (uma vez) a textura do tileset na cena. */
  ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(TILESET_KEY)) {
      this.texture = scene.textures.get(TILESET_KEY) as Phaser.Textures.CanvasTexture;
      return;
    }
    const rows = Math.ceil(this.slots.length / COLS);
    this.texture = scene.textures.createCanvas(TILESET_KEY, COLS * CELL, rows * CELL);
    this.redraw(false);
  }

  /** Avança a animação da água. */
  animate(): void {
    this.frame = (this.frame + 1) % 3;
    this.redraw(true);
  }

  private redraw(onlyAnimated: boolean): void {
    const tex = this.texture;
    if (!tex) return;
    const ctx = tex.getContext();
    const canvas = tex.getCanvas();
    this.slots.forEach((slot, i) => {
      if (onlyAnimated && !slot.animated) return;
      const b = new PixelBuffer(16, 16);
      slot.draw(b, this.frame);
      const x0 = (i % COLS) * CELL + TILE_MARGIN;
      const y0 = Math.floor(i / COLS) * CELL + TILE_MARGIN;
      const img = ctx.createImageData(16, 16);
      new Uint32Array(img.data.buffer).set(b.data);
      ctx.putImageData(img, x0, y0);
      // extrusão de 1 px
      ctx.drawImage(canvas, x0, y0, 1, 16, x0 - 1, y0, 1, 16);
      ctx.drawImage(canvas, x0 + 15, y0, 1, 16, x0 + 16, y0, 1, 16);
      ctx.drawImage(canvas, x0 - 1, y0, 18, 1, x0 - 1, y0 - 1, 18, 1);
      ctx.drawImage(canvas, x0 - 1, y0 + 15, 18, 1, x0 - 1, y0 + 16, 18, 1);
    });
    tex.refresh();
  }
}
