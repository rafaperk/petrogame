/**
 * Gerador de personagens (16x24) com 4 direções e ciclo de caminhada.
 * Um "look" (pele, cabelo, roupa, chapéu...) vira uma spritesheet completa.
 */
import type Phaser from 'phaser';
import { PAL } from './palette';
import { darken, lighten, mix, PixelBuffer } from './pixel';

export type HairStyle = 'short' | 'long' | 'bun' | 'bald' | 'ponytail' | 'spiky';
export type Hat = 'hardhat' | 'captain' | 'cap';
export type Dir = 'down' | 'left' | 'right' | 'up';

export interface CharacterLook {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  shirt: string;
  pants: string;
  shoes?: string;
  hat?: Hat;
  hatColor?: string;
  glasses?: boolean;
  beard?: string;
  /** Colete por cima da camisa (ex.: laranja de segurança). */
  vest?: string;
}

export const FRAME_W = 16;
export const FRAME_H = 24;
const CELL_W = FRAME_W + 2;
const CELL_H = FRAME_H + 2;
export const DIR_ROW: Record<Dir, number> = { down: 0, left: 1, right: 2, up: 3 };

type View = 'down' | 'side' | 'up';
type Step = 0 | 1 | 2;

function drawLegs(b: PixelBuffer, look: CharacterLook, view: View, step: Step): void {
  const pants = look.pants;
  const shade = darken(pants, 0.22);
  const shoes = look.shoes ?? '#3b2f2c';
  const shoesShade = darken(shoes, 0.25);
  if (view !== 'side') {
    const leftUp = step === 1 ? 1 : 0;
    const rightUp = step === 2 ? 1 : 0;
    b.rect(5, 18, 2, 4 - leftUp, pants).vline(6, 18, 4 - leftUp, shade);
    b.rect(5, 22 - leftUp, 2, 1, shoes);
    b.rect(9, 18, 2, 4 - rightUp, pants).vline(9, 18, 4 - rightUp, shade);
    b.rect(9, 22 - rightUp, 2, 1, shoes);
    return;
  }
  // vista lateral (olhando para a esquerda)
  if (step === 0) {
    b.rect(8, 18, 2, 4, shade).rect(8, 22, 2, 1, shoesShade);
    b.rect(6, 18, 2, 4, pants).rect(5, 22, 3, 1, shoes);
  } else if (step === 1) {
    b.rect(8, 18, 2, 1, shade).rect(9, 19, 2, 3, shade).rect(9, 22, 2, 1, shoesShade);
    b.rect(5, 18, 2, 1, pants).rect(4, 19, 2, 3, pants).rect(3, 22, 3, 1, shoes);
  } else {
    b.rect(8, 18, 2, 4, shade).rect(8, 22, 2, 1, shoesShade);
    b.rect(6, 18, 2, 3, pants).rect(5, 21, 3, 1, shoes);
  }
}

function drawTorso(b: PixelBuffer, look: CharacterLook, view: View, step: Step, bob: number): void {
  const shirt = look.shirt;
  const shade = darken(shirt, 0.2);
  const light = lighten(shirt, 0.15);
  const skin = look.skin;
  const top = 12 + bob;
  if (view === 'side') {
    b.rect(5, top, 6, 5, shirt).vline(10, top, 5, shade).vline(5, top, 5, light);
    b.rect(5, top + 5, 6, 1, look.pants);
    if (look.vest) b.rect(5, top, 2, 5, look.vest).rect(9, top, 2, 5, look.vest).hline(5, top + 3, 6, '#dfe3e6');
    const armX = step === 1 ? 6 : step === 2 ? 8 : 7;
    const handX = step === 1 ? 5 : step === 2 ? 9 : 7;
    b.rect(armX, top, 2, 4, shade).rect(handX, top + 4, 2, 1, skin);
    return;
  }
  b.rect(4, top, 8, 5, shirt).vline(11, top, 5, shade).hline(4, top + 4, 8, shade);
  b.rect(4, top + 5, 8, 1, look.pants);
  if (view === 'down') {
    b.set(7, top, skin).set(8, top, skin).set(6, top, light).set(9, top, light);
  }
  if (look.vest) {
    b.rect(4, top, 2, 5, look.vest).rect(10, top, 2, 5, look.vest);
    if (view === 'up') b.rect(4, top, 8, 5, look.vest);
    b.hline(4, top + 3, 8, '#dfe3e6');
  }
  const leftOff = step === 1 ? 1 : step === 2 ? -1 : 0;
  const rightOff = -leftOff;
  b.rect(3, top + leftOff, 1, 4, shade).set(3, top + 4 + leftOff, skin);
  b.rect(12, top + rightOff, 1, 4, shade).set(12, top + 4 + rightOff, skin);
}

function drawHead(b: PixelBuffer, look: CharacterLook, view: View, bob: number): void {
  const skin = look.skin;
  const skinShade = darken(skin, 0.12);
  const y0 = 2 + bob;
  b.rect(3, y0, 10, 10, skin);
  b.clear(3, y0).clear(12, y0).clear(3, y0 + 9).clear(12, y0 + 9);
  b.hline(4, y0 + 9, 8, skinShade);
  const eye = PAL.outline;
  const blush = mix(skin, '#ff6f6f', 0.3);
  if (view === 'down') {
    b.vline(5, y0 + 6, 2, eye).vline(10, y0 + 6, 2, eye);
    b.set(4, y0 + 8, blush).set(11, y0 + 8, blush);
    if (look.glasses) {
      b.hline(4, y0 + 5, 3, eye).hline(9, y0 + 5, 3, eye).set(4, y0 + 6, eye).set(6, y0 + 6, eye);
      b.set(9, y0 + 6, eye).set(11, y0 + 6, eye).hline(7, y0 + 6, 2, eye);
    }
    if (look.beard) b.rect(4, y0 + 8, 8, 2, look.beard).set(4, y0 + 7, look.beard).set(11, y0 + 7, look.beard).set(7, y0 + 8, skinShade).set(8, y0 + 8, skinShade);
  } else if (view === 'side') {
    b.set(2, y0 + 6, skin);
    b.vline(5, y0 + 6, 2, eye);
    b.set(9, y0 + 6, skinShade).set(6, y0 + 8, blush);
    if (look.glasses) b.hline(4, y0 + 5, 3, eye).set(4, y0 + 6, eye).set(6, y0 + 6, eye).hline(7, y0 + 6, 2, eye);
    if (look.beard) b.rect(3, y0 + 8, 6, 2, look.beard).set(3, y0 + 7, look.beard).set(2, y0 + 7, look.beard);
  } else {
    b.hline(5, y0 + 9, 6, skinShade);
  }
}

function drawHair(b: PixelBuffer, look: CharacterLook, view: View, bob: number): void {
  const hair = look.hair;
  const shade = darken(hair, 0.22);
  const light = lighten(hair, 0.2);
  const y0 = 2 + bob;
  const style = look.hairStyle;

  if (style === 'bald') {
    if (view === 'down') b.rect(3, y0 + 3, 1, 4, hair).rect(12, y0 + 3, 1, 4, hair);
    else if (view === 'side') b.rect(9, y0 + 3, 4, 4, hair);
    else b.rect(3, y0 + 3, 10, 5, hair);
    b.set(view === 'side' ? 5 : 6, y0 + 1, lighten(look.skin, 0.25));
    return;
  }

  if (view === 'down') {
    b.hline(4, y0, 8, hair).rect(3, y0 + 1, 10, 2, hair);
    b.rect(3, y0 + 3, 8, 1, hair).rect(11, y0 + 3, 2, 1, hair);
    b.rect(3, y0 + 4, 3, 1, hair).set(12, y0 + 4, hair);
    b.set(3, y0 + 5, hair).set(12, y0 + 5, hair);
    b.hline(5, y0 + 1, 3, light).hline(4, y0 + 3, 2, shade);
    if (style === 'long') b.rect(3, y0 + 4, 1, 9, hair).rect(12, y0 + 4, 1, 9, hair).vline(12, y0 + 6, 7, shade);
    if (style === 'ponytail') b.rect(12, y0 + 5, 2, 4, shade);
  } else if (view === 'side') {
    b.hline(4, y0, 8, hair).rect(3, y0 + 1, 10, 2, hair);
    b.rect(3, y0 + 3, 4, 1, hair).rect(9, y0 + 3, 4, 1, hair);
    b.rect(9, y0 + 4, 4, 4, hair).rect(10, y0 + 8, 3, 1, hair);
    b.hline(4, y0 + 1, 3, light).vline(12, y0 + 3, 5, shade);
    if (style === 'long') b.rect(9, y0 + 8, 4, 5, hair).vline(12, y0 + 8, 5, shade);
    if (style === 'ponytail') b.rect(13, y0 + 4, 2, 7, hair).vline(14, y0 + 5, 6, shade);
  } else {
    b.hline(4, y0, 8, hair).rect(3, y0 + 1, 10, 7, hair).rect(4, y0 + 8, 8, 1, hair);
    b.hline(5, y0 + 1, 4, light).vline(11, y0 + 2, 6, shade);
    if (style === 'long') b.rect(3, y0 + 8, 10, 5, hair).vline(8, y0 + 8, 5, shade);
    if (style === 'ponytail') b.rect(7, y0 + 8, 2, 6, shade);
  }
  if (style === 'bun') b.rect(6, y0 - 2, 4, 2, hair).set(7, y0 - 2, light);
  if (style === 'spiky') {
    for (const x of [4, 6, 8, 10]) b.set(x, y0 - 1, hair);
  }
}

function drawHat(b: PixelBuffer, look: CharacterLook, view: View, bob: number): void {
  if (!look.hat) return;
  const y0 = 2 + bob;
  if (look.hat === 'hardhat') {
    const c = look.hatColor ?? PAL.yellow;
    b.rect(5, y0 - 1, 6, 1, c).rect(3, y0, 10, 3, c);
    b.hline(5, y0, 3, lighten(c, 0.35)).hline(3, y0 + 2, 10, darken(c, 0.15));
    if (view === 'side') b.rect(1, y0 + 3, 11, 1, darken(c, 0.25));
    else b.rect(2, y0 + 3, 12, 1, darken(c, 0.25));
  } else if (look.hat === 'captain') {
    const band = look.hatColor ?? '#26354f';
    b.rect(4, y0 - 1, 8, 1, PAL.white).rect(3, y0, 10, 2, PAL.white).rect(3, y0 + 2, 10, 2, band);
    if (view !== 'up') b.rect(7, y0, 2, 1, PAL.yellow);
    if (view === 'down') b.rect(4, y0 + 4, 8, 1, '#1d1b22');
    if (view === 'side') b.rect(1, y0 + 4, 6, 1, '#1d1b22');
  } else {
    const c = look.hatColor ?? PAL.red;
    b.rect(3, y0, 10, 3, c).hline(5, y0, 3, lighten(c, 0.3));
    if (view === 'down') b.rect(3, y0 + 3, 10, 1, darken(c, 0.25));
    if (view === 'side') b.rect(0, y0 + 3, 7, 1, darken(c, 0.25));
  }
}

function drawFrame(look: CharacterLook, view: View, step: Step): PixelBuffer {
  const b = new PixelBuffer(FRAME_W, FRAME_H);
  const bob = step === 0 ? 0 : 1;
  drawLegs(b, look, view, step);
  drawTorso(b, look, view, step, bob);
  drawHead(b, look, view, bob);
  drawHair(b, look, view, bob);
  drawHat(b, look, view, bob);
  b.outline(PAL.outline);
  return b;
}

const portraitCache = new Map<string, string>();

/** Gera a spritesheet (3 passos x 4 direções) e as animações de caminhada. */
export function registerCharacter(scene: Phaser.Scene, key: string, look: CharacterLook): void {
  if (scene.textures.exists(key)) return;
  const sheet = new PixelBuffer(CELL_W * 3, CELL_H * 4);
  const views: [Dir, View][] = [
    ['down', 'down'],
    ['left', 'side'],
    ['up', 'up'],
  ];
  for (const [dir, view] of views) {
    for (const step of [0, 1, 2] as Step[]) {
      const frame = drawFrame(look, view, step);
      sheet.blit(frame, step * CELL_W + 1, DIR_ROW[dir] * CELL_H + 1);
      if (dir === 'left') sheet.blit(frame.flipX(), step * CELL_W + 1, DIR_ROW.right * CELL_H + 1);
    }
  }
  const canvas = sheet.toCanvas();
  const tex = scene.textures.addCanvas(key, canvas);
  if (!tex) return;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) tex.add(row * 3 + col, 0, col * CELL_W + 1, row * CELL_H + 1, FRAME_W, FRAME_H);
  }
  for (const dir of Object.keys(DIR_ROW) as Dir[]) {
    const r = DIR_ROW[dir] * 3;
    scene.anims.create({
      key: `${key}-walk-${dir}`,
      frames: [r + 1, r, r + 2, r].map((frame) => ({ key, frame })),
      frameRate: 8,
      repeat: -1,
    });
  }
  // retrato para os diálogos (frame de frente, parado)
  const portrait = drawFrame(look, 'down', 0);
  portraitCache.set(key, portrait.toCanvas().toDataURL());
}

/** Troca o visual de um personagem já registrado (ex.: o jogador depois de comprar um capacete). */
export function replaceCharacter(scene: Phaser.Scene, key: string, look: CharacterLook): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  for (const dir of Object.keys(DIR_ROW)) scene.anims.remove(`${key}-walk-${dir}`);
  registerCharacter(scene, key, look);
}

/** Retrato (data URL) de um visual qualquer, sem registrar textura: prévia na loja e na mochila. */
export function portraitFor(look: CharacterLook): string {
  return drawFrame(look, 'down', 0).toCanvas().toDataURL();
}

export function idleFrame(dir: Dir): number {
  return DIR_ROW[dir] * 3;
}

export function portraitOf(key: string): string | undefined {
  return portraitCache.get(key);
}
