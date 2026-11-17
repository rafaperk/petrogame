/**
 * Objetos do cenário gerados por código: árvores, prédios, plantas da horta, ícones...
 */
import type Phaser from 'phaser';
import { mulberry32 } from '../core/rng';
import { PAL } from './palette';
import { darken, lighten, PixelBuffer } from './pixel';
import { E, N, S, W } from './tiles';

function add(scene: Phaser.Scene, key: string, b: PixelBuffer): void {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, b.toCanvas());
}

// ------------------------------------------------------------------ vegetação

function canopy(w: number, h: number, blobs: [number, number, number, number][], seed: number, leaf: string, dark: string, light: string, blossom?: string): PixelBuffer {
  const c = new PixelBuffer(w, h);
  const r = mulberry32(seed);
  for (const [cx, cy, rx, ry] of blobs) c.ellipse(cx, cy, rx, ry, leaf);
  const bottom = Math.max(...blobs.map(([, cy, , ry]) => cy + ry));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!c.opaque(x, y)) continue;
      const lowness = y / bottom;
      if (lowness > 0.68 + r() * 0.12) c.set(x, y, dark);
      else if (r() < 0.07) c.set(x, y, dark);
      if (!c.opaque(x, y - 2) && r() < 0.6) c.set(x, y, light);
    }
  }
  for (const [cx, cy, rx, ry] of blobs) c.ellipse(cx - rx * 0.3, cy - ry * 0.35, rx * 0.35, ry * 0.25, light);
  if (blossom) for (let i = 0; i < 14; i++) {
    const x = Math.floor(r() * w);
    const y = Math.floor(r() * h);
    if (c.opaque(x, y) && c.opaque(x + 1, y)) c.set(x, y, blossom).set(x + 1, y, lighten(blossom, 0.4));
  }
  return c;
}

function tree(seed: number, leaf: string, dark: string, light: string, blossom?: string): PixelBuffer {
  const b = new PixelBuffer(32, 40);
  b.rect(13, 25, 6, 13, PAL.trunk).vline(17, 25, 13, PAL.trunkDark).vline(18, 25, 13, PAL.trunkDark);
  b.set(12, 37, PAL.trunk).set(19, 37, PAL.trunkDark).set(14, 30, PAL.trunkDark);
  const c = canopy(32, 32, [[16, 15, 13, 11], [8, 19, 7, 6], [24, 19, 7, 6], [16, 8, 9, 7]], seed, leaf, dark, light, blossom);
  b.blit(c, 0, 0);
  return b.outline(PAL.outline);
}

function pine(): PixelBuffer {
  const b = new PixelBuffer(24, 40);
  b.rect(10, 31, 4, 8, PAL.trunk).vline(13, 31, 8, PAL.trunkDark);
  const tiers: [number, number, number][] = [[2, 14, 7], [9, 23, 9], [16, 32, 11]];
  for (const [top, bottom, half] of tiers) {
    for (let y = top; y <= bottom; y++) {
      const t = (y - top) / (bottom - top);
      const hw = Math.max(1, Math.round(half * t));
      for (let x = 12 - hw; x < 12 + hw; x++) {
        const color = x >= 12 ? PAL.pineDark : y > bottom - 2 ? PAL.pineDark : PAL.pine;
        b.set(x, y, color);
      }
      if (hw > 1) b.set(12 - hw, y, PAL.pineLight);
    }
  }
  return b.outline(PAL.outline);
}

function bush(): PixelBuffer {
  const b = new PixelBuffer(16, 14);
  b.blit(canopy(16, 14, [[8, 8, 7, 5.5], [5, 6, 4, 3.5], [11, 6, 4, 3.5]], 33, PAL.leaf, PAL.leafDark, PAL.leafLight), 0, 0);
  b.set(5, 8, PAL.red).set(10, 9, PAL.red).set(8, 5, PAL.red);
  return b.outline(PAL.outline);
}

function rock(): PixelBuffer {
  const b = new PixelBuffer(14, 11);
  b.ellipse(7, 6, 6, 4.5, PAL.stone);
  b.ellipse(5.5, 4.5, 3, 2, PAL.stoneLight);
  for (let x = 2; x < 13; x++) if (b.opaque(x, 9)) b.set(x, 9, PAL.stoneDark);
  b.set(8, 5, PAL.stoneDark).set(9, 6, PAL.stoneDark);
  return b.outline(PAL.outline);
}

// ------------------------------------------------------------------ mobiliário urbano

function fence(mask: number): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  const rail = (x: number, y: number, w: number, h: number) => b.rect(x, y, w, h, PAL.woodLight).hline(x, y + h - 1, w, PAL.woodDark);
  if (mask & W) {
    rail(0, 6, 8, 2);
    rail(0, 11, 8, 2);
  }
  if (mask & E) {
    rail(8, 6, 8, 2);
    rail(8, 11, 8, 2);
  }
  if (mask & N) b.rect(7, 0, 2, 6, PAL.woodLight).vline(8, 0, 6, PAL.woodDark);
  if (mask & S) b.rect(7, 12, 2, 4, PAL.woodLight).vline(8, 12, 4, PAL.woodDark);
  b.rect(6, 4, 4, 11, PAL.wood).vline(9, 4, 11, PAL.woodDark).hline(6, 4, 4, PAL.woodLight);
  return b.outline(PAL.outline);
}

function lamp(): PixelBuffer {
  const b = new PixelBuffer(10, 30);
  b.rect(4, 8, 2, 19, '#4a4e5a').vline(5, 8, 19, '#363945');
  b.rect(3, 26, 4, 3, '#4a4e5a');
  b.rect(2, 2, 6, 6, '#ffe9a3').rect(3, 3, 4, 4, '#fff6cf');
  b.hline(1, 1, 8, '#363945').hline(2, 0, 6, '#363945').hline(2, 8, 6, '#363945');
  return b.outline(PAL.outline);
}

function sign(): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  b.rect(7, 8, 2, 8, PAL.woodDark);
  b.rect(1, 1, 14, 8, PAL.woodLight).hline(1, 8, 14, PAL.wood);
  b.hline(3, 3, 10, PAL.woodDark).hline(3, 5, 7, PAL.woodDark);
  return b.outline(PAL.outline);
}

function board(): PixelBuffer {
  const b = new PixelBuffer(32, 32);
  b.rect(3, 9, 3, 22, PAL.woodDark).rect(26, 9, 3, 22, PAL.woodDark);
  b.rect(1, 3, 30, 4, PAL.roofRed).hline(1, 6, 30, darken(PAL.roofRed, 0.25)).hline(2, 3, 28, lighten(PAL.roofRed, 0.25));
  b.rect(2, 8, 28, 15, PAL.wood).rect(3, 9, 26, 13, '#c9965f');
  b.rect(5, 10, 7, 8, PAL.white).hline(6, 12, 5, '#a9a39a').hline(6, 14, 4, '#a9a39a');
  b.rect(13, 11, 6, 9, '#f6e7a1').hline(14, 13, 4, '#b8a660').hline(14, 15, 3, '#b8a660');
  b.rect(21, 10, 6, 7, PAL.white).hline(22, 12, 4, '#a9a39a');
  b.set(8, 10, PAL.red).set(16, 11, PAL.blue).set(24, 10, PAL.red);
  return b.outline(PAL.outline);
}

function fountain(): PixelBuffer {
  const b = new PixelBuffer(48, 42);
  b.ellipse(24, 29, 22, 11, PAL.stone);
  b.ellipse(24, 28, 19, 8, PAL.stoneDark);
  b.ellipse(24, 28, 18, 7, PAL.water);
  b.ellipse(19, 26, 6, 2, PAL.waterLight);
  for (let x = 4; x < 45; x++) if (b.opaque(x, 38)) b.set(x, 38, PAL.stoneDark);
  b.rect(21, 11, 6, 17, PAL.stone).vline(26, 11, 17, PAL.stoneDark).vline(21, 11, 17, PAL.stoneLight);
  b.ellipse(24, 10, 9, 3.5, PAL.stone).ellipse(24, 9.5, 7, 2, PAL.water);
  b.rect(23, 2, 2, 7, PAL.waterLight).set(22, 3, PAL.foam).set(25, 4, PAL.foam);
  for (const x of [15, 33]) b.vline(x, 12, 14, PAL.waterLight);
  return b.outline(PAL.outline);
}

function bench(): PixelBuffer {
  const b = new PixelBuffer(24, 14);
  b.rect(1, 2, 22, 3, PAL.woodLight).hline(1, 4, 22, PAL.wood);
  b.rect(1, 7, 22, 3, PAL.woodLight).hline(1, 9, 22, PAL.wood);
  b.rect(3, 10, 2, 4, '#4a4e5a').rect(19, 10, 2, 4, '#4a4e5a');
  return b.outline(PAL.outline);
}

function crate(): PixelBuffer {
  const b = new PixelBuffer(16, 16);
  b.rect(1, 2, 14, 13, PAL.woodLight).rect(1, 2, 14, 2, PAL.wood);
  for (let i = 0; i < 12; i++) b.set(2 + i, 4 + Math.floor(i * 0.9), PAL.woodDark);
  b.rect(1, 2, 14, 1, darken(PAL.wood, 0.2)).vline(1, 2, 13, PAL.wood).vline(14, 2, 13, PAL.woodDark);
  return b.outline(PAL.outline);
}

function barrel(): PixelBuffer {
  const b = new PixelBuffer(12, 16);
  b.ellipse(6, 8.5, 5, 7, PAL.wood).vline(8, 2, 13, PAL.woodDark).vline(3, 2, 13, PAL.woodLight);
  b.hline(1, 5, 10, '#4a4e5a').hline(1, 11, 10, '#4a4e5a');
  b.ellipse(6, 2.5, 4, 1.5, PAL.woodDark);
  return b.outline(PAL.outline);
}

function tank(): PixelBuffer {
  const b = new PixelBuffer(46, 46);
  b.rect(2, 8, 42, 34, '#e4e8ea');
  for (let x = 2; x < 44; x++) {
    const t = x / 44;
    if (t > 0.6) b.vline(x, 8, 34, t > 0.85 ? '#a9b2b8' : '#c8cfd4');
    if (t < 0.18) b.vline(x, 8, 34, '#f5f7f8');
  }
  b.rect(2, 22, 42, 5, PAL.roofTeal).hline(2, 26, 42, darken(PAL.roofTeal, 0.3));
  b.ellipse(23, 8, 21, 6, '#f2f4f5').ellipse(23, 8, 16, 3.5, '#d7dde1');
  b.ellipse(23, 42, 21, 3, '#a9b2b8');
  for (let y = 10; y < 40; y += 3) b.hline(36, y, 3, '#6b737a');
  b.vline(36, 9, 32, '#6b737a').vline(38, 9, 32, '#6b737a');
  return b.outline(PAL.outline);
}

function pumpjack(): PixelBuffer {
  const b = new PixelBuffer(48, 34);
  b.rect(2, 29, 44, 4, '#6b737a').hline(2, 29, 44, '#8d969d');
  for (let i = 0; i < 18; i++) {
    b.set(18 + Math.round(i * 0.35), 28 - i, '#4a4e5a').set(30 - Math.round(i * 0.35), 28 - i, '#4a4e5a');
  }
  b.rect(6, 7, 34, 3, PAL.orange).hline(6, 9, 34, darken(PAL.orange, 0.3));
  b.rect(2, 5, 6, 10, PAL.orange).rect(3, 6, 2, 8, darken(PAL.orange, 0.25));
  b.vline(4, 15, 14, '#2b2b30');
  b.rect(36, 12, 9, 12, '#3f4652').rect(38, 14, 5, 8, '#59616e');
  b.rect(23, 9, 2, 12, '#3f4652');
  return b.outline(PAL.outline);
}

function flare(): PixelBuffer {
  const b = new PixelBuffer(12, 50);
  for (let y = 6; y < 50; y += 1) {
    const hw = 2 + Math.round((y / 50) * 3);
    b.set(6 - hw, y, '#6b737a').set(5 + hw, y, '#6b737a');
    if (y % 6 === 0) b.hline(6 - hw, y, hw * 2, '#8d969d');
  }
  b.rect(4, 3, 4, 4, '#4a4e5a');
  return b.outline(PAL.outline);
}

function flame(): PixelBuffer {
  const b = new PixelBuffer(8, 11);
  b.ellipse(4, 7, 3.5, 4, PAL.orange).ellipse(4, 7.5, 2, 2.5, PAL.yellow).set(4, 2, PAL.orange).set(3, 1, PAL.orange).set(4, 8, '#fff6cf');
  return b;
}

function boat(): PixelBuffer {
  const b = new PixelBuffer(40, 22);
  for (let y = 10; y < 20; y++) {
    const inset = Math.round((y - 10) * 0.6);
    b.hline(2 + inset, y, 36 - inset * 2, y < 13 ? PAL.white : PAL.red);
  }
  b.hline(3, 13, 34, darken(PAL.red, 0.3));
  b.rect(4, 8, 32, 3, PAL.woodLight).hline(4, 10, 32, PAL.wood);
  b.rect(20, 1, 11, 8, PAL.white).rect(22, 3, 3, 3, PAL.glass).rect(26, 3, 3, 3, PAL.glass).hline(19, 1, 13, PAL.roofBlue);
  return b.outline(PAL.outline);
}

function gate(): PixelBuffer {
  const b = new PixelBuffer(16, 34);
  b.rect(3, 2, 10, 31, '#59616e');
  for (let y = 4; y < 32; y += 4) b.hline(4, y, 8, '#8d969d');
  b.vline(3, 2, 31, '#3f4652').vline(12, 2, 31, '#3f4652');
  for (let y = 14; y < 20; y++) for (let x = 3; x < 13; x++) b.set(x, y, (x + y) % 4 < 2 ? PAL.yellow : '#2b2b30');
  b.rect(6, 21, 4, 4, PAL.yellow).rect(7, 19, 2, 2, '#8d969d').set(8, 23, '#2b2b30');
  return b.outline(PAL.outline);
}

// ------------------------------------------------------------------ prédios

export type IconName = 'book' | 'sigma' | 'anchor' | 'drop' | 'gear' | 'dice' | 'wrench' | 'thermo' | 'screen';

const ICONS: Record<IconName, { rows: string[]; colors: Record<string, string> }> = {
  book: {
    rows: ['rrrr.rrrr', 'rwwwrwwwr', 'rwkkrkkwr', 'rwwwrwwwr', 'rwkkrkkwr', 'rwwwrwwwr', '.rrrrrrr.'],
    colors: { r: '#b8443a', w: PAL.white, k: '#6b6460' },
  },
  sigma: {
    rows: ['kkkkkkk', 'kk.....', '.kk....', '..kk...', '.kk....', 'kk.....', 'kkkkkkk'],
    colors: { k: '#2f4f8f' },
  },
  anchor: {
    rows: ['...k...', '..k.k..', '...k...', 'kkkkkkk', '...k...', 'k..k..k', '.kkkkk.'],
    colors: { k: '#26354f' },
  },
  drop: {
    rows: ['...k...', '..kkk..', '.kkkkk.', 'kkwkkkk', 'kwkkkkk', '.kkkkk.', '..kkk..'],
    colors: { k: '#1f2a2e', w: '#7fd1c9' },
  },
  gear: {
    rows: ['.k.k.k.', 'kkkkkkk', '.kk.kk.', 'kk...kk', '.kk.kk.', 'kkkkkkk', '.k.k.k.'],
    colors: { k: '#3f4652' },
  },
  dice: {
    rows: ['kkkkkkk', 'kwkkkwk', 'kkkkkkk', 'kkkwkkk', 'kkkkkkk', 'kwkkkwk', 'kkkkkkk'],
    colors: { k: '#c2523f', w: '#f7f4ec' },
  },
  wrench: {
    rows: ['kk...kk', 'kkk.kkk', '.kkkkk.', '..kkk..', '..kkk..', '..kkk..', '..kkk..'],
    colors: { k: '#4a4e5a' },
  },
  thermo: {
    rows: ['..kkk..', '..kwk..', '..kwk..', '..krk..', '.krrrk.', '.krrrk.', '..kkk..'],
    colors: { k: '#3f4652', w: '#f7f4ec', r: '#d9534f' },
  },
  screen: {
    rows: ['kkkkkkk', 'kgggggk', 'kg.g.gk', 'kgggggk', 'kkkkkkk', '..kkk..', '.kkkkk.'],
    colors: { k: '#2b2b30', g: '#7fd18a' },
  },
};

export interface BuildingSpec {
  w: number;
  h: number;
  wall: string;
  wallStyle: 'plaster' | 'brick' | 'planks' | 'metal';
  roof: string;
  roofStyle?: 'hip' | 'flat';
  door: number;
  windows: number;
  sign?: IconName;
}

export function drawBuilding(spec: BuildingSpec): PixelBuffer {
  const W = spec.w * 16;
  const H = spec.h * 16;
  const b = new PixelBuffer(W + 2, H + 2);
  const ox = 1;
  const oy = 1;
  const r = mulberry32(W * 31 + H);
  const roofH = Math.round(H * (spec.roofStyle === 'flat' ? 0.28 : 0.44));
  const wallTop = oy + roofH - 1;
  const wallBottom = oy + H - 1;
  const wallH = wallBottom - wallTop + 1;

  // paredes
  b.rect(ox + 2, wallTop, W - 4, wallH, spec.wall);
  const wDark = darken(spec.wall, 0.16);
  const wLight = lighten(spec.wall, 0.12);
  if (spec.wallStyle === 'brick') {
    for (let y = wallTop + 2; y < wallBottom; y += 4) {
      b.hline(ox + 2, y, W - 4, wLight);
      const off = ((y - wallTop) / 4) % 2 ? 4 : 0;
      for (let x = ox + 2 + off; x < ox + W - 2; x += 8) b.vline(x, y + 1, 3, wDark);
    }
  } else if (spec.wallStyle === 'planks') {
    for (let x = ox + 2; x < ox + W - 2; x += 4) b.vline(x, wallTop, wallH, wDark).vline(x + 1, wallTop, wallH, wLight);
  } else if (spec.wallStyle === 'metal') {
    for (let x = ox + 2; x < ox + W - 2; x += 2) b.vline(x, wallTop, wallH, (x / 2) % 2 ? wDark : wLight);
  } else {
    for (let i = 0; i < W * 0.6; i++) b.set(ox + 2 + r() * (W - 4), wallTop + r() * wallH, wDark);
  }
  b.rect(ox + 2, wallTop, W - 4, 2, darken(spec.wall, 0.3));
  b.rect(ox + 2, wallBottom - 2, W - 4, 3, PAL.stoneDark).hline(ox + 2, wallBottom - 2, W - 4, PAL.stone);

  // telhado
  const roof = spec.roof;
  const rDark = darken(roof, 0.22);
  const rLight = lighten(roof, 0.2);
  if (spec.roofStyle === 'flat') {
    b.rect(ox, oy, W, roofH, roof);
    b.rect(ox + 3, oy + 3, W - 6, roofH - 6, rDark);
    b.hline(ox, oy, W, rLight);
    for (let x = ox + 8; x < ox + W - 8; x += 14) b.rect(x, oy + 5, 5, 4, '#8d969d').hline(x, oy + 5, 5, '#c8cfd4');
  } else {
    for (let y = 0; y < roofH; y++) {
      const inset = Math.round(((roofH - 1 - y) / roofH) * 7);
      const rowColor = (y % 4 === 3) ? rDark : roof;
      b.hline(ox + inset, oy + y, W - inset * 2, rowColor);
      if (y % 4 !== 3) {
        const shift = Math.floor(y / 4) % 2 ? 3 : 0;
        for (let x = ox + inset + shift; x < ox + W - inset; x += 6) b.set(x, oy + y, rDark);
      }
      b.set(ox + inset, oy + y, rLight);
      for (let x = ox + Math.floor(W / 2); x < ox + W - inset; x++) {
        if (y % 4 !== 3 && (x + y) % 6 !== 0) b.set(x, oy + y, darken(roof, 0.08));
      }
    }
    b.hline(ox + 7, oy, W - 14, rLight);
  }
  b.hline(ox, oy + roofH - 1, W, rDark).hline(ox, oy + roofH, W, darken(roof, 0.4));

  // janelas
  const doorTile = spec.door;
  const slots = Array.from({ length: spec.w }, (_, i) => i).filter((i) => i !== doorTile);
  const chosen: number[] = [];
  if (spec.windows > 0) {
    const step = slots.length / spec.windows;
    for (let k = 0; k < spec.windows; k++) chosen.push(slots[Math.min(slots.length - 1, Math.floor(k * step + step / 2))]);
  }
  const winH = Math.min(10, wallH - 9);
  const winY = wallTop + Math.max(3, Math.floor((wallH - winH) / 2) - 1);
  for (const t of chosen) {
    const x = ox + t * 16 + 3;
    b.rect(x - 1, winY - 1, 12, winH + 2, PAL.white);
    b.rect(x, winY, 10, winH, PAL.glass);
    b.vline(x + 5, winY, winH, PAL.white).hline(x, winY + Math.floor(winH / 2), 10, PAL.white);
    b.set(x + 1, winY + 1, PAL.glassLight).set(x + 2, winY + 1, PAL.glassLight).set(x + 1, winY + 2, PAL.glassLight);
    b.hline(x - 2, winY + winH + 1, 14, PAL.woodDark);
  }

  // porta
  const doorH = Math.min(18, wallH - 3);
  const dx = ox + doorTile * 16 + 2;
  const dy = wallBottom - doorH;
  b.rect(dx - 1, dy - 1, 14, doorH + 1, PAL.woodDark);
  b.rect(dx, dy, 12, doorH, PAL.wood);
  b.vline(dx + 6, dy, doorH, PAL.woodDark).set(dx + 9, dy + Math.floor(doorH / 2), PAL.yellow).set(dx + 4, dy + Math.floor(doorH / 2), PAL.yellow);
  b.rect(dx + 2, dy + 2, 3, 4, PAL.glass).rect(dx + 7, dy + 2, 3, 4, PAL.glass);
  b.hline(dx - 1, wallBottom, 14, PAL.stoneLight);

  // placa com ícone
  if (spec.sign) {
    const icon = ICONS[spec.sign];
    const iw = icon.rows[0].length;
    const sx = dx + 6 - Math.ceil((iw + 4) / 2);
    const sy = Math.max(oy + 1, wallTop - 6);
    b.rect(sx, sy, iw + 4, 11, PAL.cream).hline(sx, sy + 10, iw + 4, PAL.sandDark);
    b.stamp(sx + 2, sy + 2, icon.rows, icon.colors);
  }
  return b.outline(PAL.outline);
}

// ------------------------------------------------------------------ horta

export function drawPlant(stage: number, color: string): PixelBuffer {
  const b = new PixelBuffer(16, 22);
  const L = PAL.leaf;
  const LD = PAL.leafDark;
  const LL = PAL.leafLight;
  const g = 20;
  const leaf = (x: number, y: number, dir: 1 | -1) => b.set(x, y, L).set(x + dir, y, LL).set(x + dir, y - 1, L).set(x, y + 1, LD);
  if (stage === 0) {
    b.ellipse(8, g - 0.5, 4, 1.8, PAL.soilLight).hline(6, g - 2, 4, PAL.soilLight).set(8, g - 3, L).set(8, g - 2, LD);
  } else if (stage === 1) {
    b.ellipse(8, g - 0.5, 3, 1.4, PAL.soilLight);
    b.vline(8, g - 5, 5, LD);
    leaf(6, g - 5, -1);
    leaf(9, g - 6, 1);
  } else if (stage === 2) {
    b.vline(8, g - 9, 9, LD);
    leaf(6, g - 3, -1);
    leaf(10, g - 4, 1);
    leaf(6, g - 7, -1);
    leaf(10, g - 8, 1);
    b.set(8, g - 10, LL).set(7, g - 10, L);
  } else if (stage === 3) {
    b.vline(8, g - 12, 12, LD);
    leaf(6, g - 3, -1);
    leaf(10, g - 4, 1);
    leaf(6, g - 7, -1);
    leaf(10, g - 9, 1);
    const fy = g - 14;
    b.set(7, fy, color).set(9, fy, color).set(8, fy - 1, color).set(8, fy + 1, color).set(8, fy, PAL.yellow);
    b.set(7, fy - 1, lighten(color, 0.3)).set(9, fy + 1, darken(color, 0.25));
    b.set(4, g - 9, color).set(4, g - 10, lighten(color, 0.3));
  } else {
    b.ellipse(8, g - 7, 7, 7, L);
    for (let y = g - 14; y < g; y++) for (let x = 0; x < 16; x++) if (b.opaque(x, y) && y > g - 6) b.set(x, y, LD);
    b.ellipse(6, g - 10, 3, 2, LL);
    b.vline(8, g - 2, 2, PAL.trunk);
    for (const [x, y] of [[4, g - 9], [10, g - 11], [8, g - 5], [11, g - 6], [5, g - 4]] as [number, number][]) {
      b.rect(x, y, 2, 2, color).set(x, y, lighten(color, 0.45));
    }
  }
  return b.outline(PAL.outline);
}

function flag(color: string): PixelBuffer {
  const b = new PixelBuffer(10, 18);
  b.rect(2, 2, 2, 15, PAL.woodDark);
  b.rect(4, 2, 5, 5, color).hline(4, 6, 5, darken(color, 0.3)).set(5, 3, lighten(color, 0.4));
  return b.outline(PAL.outline);
}

// ------------------------------------------------------------------ ícones e sombras

function exclaim(): PixelBuffer {
  const b = new PixelBuffer(9, 12);
  b.rect(0, 1, 9, 7, PAL.white).rect(1, 0, 7, 9, PAL.white).rect(3, 9, 3, 1, PAL.white).set(4, 10, PAL.white);
  b.rect(4, 2, 1, 3, PAL.orange).set(4, 6, PAL.orange);
  return b.outline(PAL.outline);
}

function drop(): PixelBuffer {
  const b = new PixelBuffer(8, 11);
  b.ellipse(4, 6.5, 3.2, 3.5, PAL.blue).rect(3, 2, 2, 2, PAL.blue).set(4, 1, PAL.blue);
  b.set(3, 5, PAL.foam).set(3, 6, PAL.glassLight);
  return b.outline(PAL.outline);
}

function sparkle(): PixelBuffer {
  const b = new PixelBuffer(5, 5);
  b.set(2, 0, PAL.yellow).set(2, 4, PAL.yellow).set(0, 2, PAL.yellow).set(4, 2, PAL.yellow);
  b.rect(1, 1, 3, 3, '#fff6cf').set(2, 2, PAL.white);
  return b;
}

function shadow(w: number, h: number): PixelBuffer {
  const b = new PixelBuffer(w, h);
  return b.ellipse(w / 2, h / 2, w / 2, h / 2, PAL.shadow, 80);
}

// ------------------------------------------------------------------ registro

export function registerProps(scene: Phaser.Scene): void {
  add(scene, 'tree-0', tree(3, PAL.leaf, PAL.leafDark, PAL.leafLight));
  add(scene, 'tree-1', tree(8, '#5aa54a', PAL.leafDark, '#8fd16a', PAL.pink));
  add(scene, 'tree-2', tree(15, '#6f9f3f', '#56802f', '#9cc65a', PAL.orange));
  add(scene, 'pine', pine());
  add(scene, 'bush', bush());
  add(scene, 'rock', rock());
  for (let mask = 0; mask < 16; mask++) add(scene, `fence-${mask}`, fence(mask));
  add(scene, 'lamp', lamp());
  add(scene, 'sign', sign());
  add(scene, 'board', board());
  add(scene, 'fountain', fountain());
  add(scene, 'bench', bench());
  add(scene, 'crate', crate());
  add(scene, 'barrel', barrel());
  add(scene, 'tank', tank());
  add(scene, 'pumpjack', pumpjack());
  add(scene, 'flare', flare());
  add(scene, 'flame', flame());
  add(scene, 'boat', boat());
  add(scene, 'gate', gate());
  add(scene, 'icon-exclaim', exclaim());
  add(scene, 'icon-drop', drop());
  add(scene, 'sparkle', sparkle());
  add(scene, 'shadow', shadow(12, 5));
  add(scene, 'shadow-lg', shadow(28, 8));
}

export function registerBuilding(scene: Phaser.Scene, key: string, spec: BuildingSpec): void {
  add(scene, key, drawBuilding(spec));
}

export function registerSubjectArt(scene: Phaser.Scene, subjectId: string, color: string): void {
  for (let stage = 0; stage <= 4; stage++) add(scene, `plant-${subjectId}-${stage}`, drawPlant(stage, color));
  add(scene, `flag-${subjectId}`, flag(color));
}
