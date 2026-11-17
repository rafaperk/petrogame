/**
 * Equipamentos da Refinaria (pixel art gerada por código). Cada tópico de Conhecimentos Específicos
 * vira um equipamento de 32×32 px (2×2 tiles). Também: base livre, coluna de destilação, pipe rack,
 * cancela, lâmpadas de status e ícones.
 */
import type Phaser from 'phaser';
import type { EquipmentKind } from '../learning/types';
import { PAL } from './palette';
import { darken, lighten, PixelBuffer } from './pixel';

const STEEL = '#b8c0c8';
const STEEL_DARK = '#7d868d';
const IRON = '#4a4e5a';
const IRON_DARK = '#3f4652';
const BLUE = '#3d6fb0';
const RED = '#c94f3d';
const GREEN = '#4f8f56';

function add(scene: Phaser.Scene, key: string, b: PixelBuffer): void {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, b.toCanvas());
}

// ------------------------------------------------------------------ primitivas

/** Cilindro em pé: luz à esquerda, sombra à direita, tampo elíptico. */
function vcyl(b: PixelBuffer, x: number, y: number, w: number, h: number, base: string, cap = 2): void {
  for (let i = 0; i < w; i++) {
    const t = i / Math.max(1, w - 1);
    const c = t < 0.22 ? lighten(base, 0.28) : t > 0.72 ? darken(base, 0.22) : base;
    b.vline(x + i, y + cap, h - cap, c);
  }
  b.ellipse(x + w / 2, y + cap, w / 2, cap, lighten(base, 0.12));
}

/** Cilindro deitado: luz em cima, sombra embaixo, tampas nas pontas. */
function hcyl(b: PixelBuffer, x: number, y: number, w: number, h: number, base: string): void {
  for (let j = 0; j < h; j++) {
    const t = j / Math.max(1, h - 1);
    const c = t < 0.25 ? lighten(base, 0.28) : t > 0.7 ? darken(base, 0.22) : base;
    b.hline(x + 1, y + j, w - 2, c);
  }
  b.ellipse(x + 1, y + h / 2, 1.6, h / 2, darken(base, 0.18));
  b.ellipse(x + w - 2, y + h / 2, 1.6, h / 2, lighten(base, 0.1));
}

/** Caixa com topo claro e lateral escura. */
function box(b: PixelBuffer, x: number, y: number, w: number, h: number, base: string): void {
  b.rect(x, y, w, h, base);
  b.hline(x, y, w, lighten(base, 0.3)).hline(x, y + 1, w, lighten(base, 0.15));
  b.vline(x + w - 1, y + 1, h - 1, darken(base, 0.25));
  b.hline(x, y + h - 1, w, darken(base, 0.3));
}

function skid(b: PixelBuffer, x: number, y: number, w: number): void {
  b.rect(x, y, w, 4, IRON).hline(x, y, w, '#6b737a').hline(x, y + 3, w, IRON_DARK);
  for (let i = x + 2; i < x + w - 1; i += 6) b.set(i, y + 1, '#8d969d');
}

function gauge(b: PixelBuffer, cx: number, cy: number): void {
  b.circle(cx, cy, 2.2, PAL.white).set(cx, cy - 1, PAL.red).set(cx + 1, cy - 1, PAL.red).set(cx - 1, cy + 1, IRON);
}

function pipeH(b: PixelBuffer, x: number, y: number, len: number, base = STEEL, thick = 3): void {
  for (let j = 0; j < thick; j++) b.hline(x, y + j, len, j === 0 ? lighten(base, 0.3) : j === thick - 1 ? darken(base, 0.25) : base);
}

function pipeV(b: PixelBuffer, x: number, y: number, len: number, base = STEEL, thick = 3): void {
  for (let i = 0; i < thick; i++) b.vline(x + i, y, len, i === 0 ? lighten(base, 0.3) : i === thick - 1 ? darken(base, 0.25) : base);
}

function lightDot(b: PixelBuffer, x: number, y: number, color: string): void {
  b.rect(x, y, 2, 2, color).set(x, y, lighten(color, 0.5));
}

// ------------------------------------------------------------------ equipamentos (32×32)

const DRAW: Record<EquipmentKind, (b: PixelBuffer) => void> = {
  pump(b) {
    skid(b, 1, 26, 30);
    hcyl(b, 2, 14, 13, 11, BLUE);
    for (let x = 4; x < 13; x += 2) b.vline(x, 15, 9, darken(BLUE, 0.3));
    box(b, 5, 10, 6, 4, darken(BLUE, 0.15));
    b.rect(15, 16, 4, 7, PAL.yellow).hline(15, 19, 4, '#2b2b30');
    b.circle(24, 19, 6.5, RED).circle(23, 17.5, 3, lighten(RED, 0.3)).circle(24, 19, 1.5, darken(RED, 0.4));
    pipeV(b, 22, 4, 9);
    b.rect(21, 4, 6, 2, IRON);
    pipeH(b, 28, 18, 4);
    b.rect(4, 24, 3, 2, IRON).rect(11, 24, 3, 2, IRON).rect(21, 24, 6, 2, IRON);
    gauge(b, 27, 9);
  },
  compressor(b) {
    skid(b, 1, 26, 30);
    box(b, 3, 14, 13, 12, GREEN);
    b.circle(9, 11, 6, IRON).circle(9, 11, 4, '#6b737a').circle(9, 11, 1.4, IRON);
    for (const [dx, dy] of [[0, -3], [3, 0], [0, 3], [-3, 0]]) b.set(9 + dx, 11 + dy, IRON);
    hcyl(b, 16, 11, 14, 6, STEEL);
    hcyl(b, 16, 18, 14, 6, STEEL);
    b.rect(28, 10, 3, 15, STEEL_DARK);
    pipeV(b, 21, 2, 9, '#d9a441');
    b.rect(20, 2, 5, 2, IRON);
    gauge(b, 25, 6);
  },
  turbine(b) {
    skid(b, 1, 26, 30);
    box(b, 1, 13, 7, 12, '#d9a441');
    b.hline(2, 17, 5, darken('#d9a441', 0.3)).hline(2, 20, 5, darken('#d9a441', 0.3));
    b.rect(8, 18, 3, 2, STEEL_DARK);
    for (let x = 11; x < 30; x++) {
      const half = 4 + Math.round(((x - 11) / 18) * 5);
      for (let y = 19 - half; y <= 19 + half; y++) {
        const t = (y - (19 - half)) / (half * 2);
        b.set(x, y, t < 0.25 ? '#a9c3b8' : t > 0.7 ? '#5f8577' : '#7fa597');
      }
    }
    for (let x = 13; x < 29; x += 4) b.vline(x, 12, 14, '#5f8577');
    pipeV(b, 14, 1, 10, STEEL);
    b.rect(13, 1, 5, 2, IRON);
    b.rect(13, 6, 5, 3, RED);
    gauge(b, 24, 6);
  },
  boiler(b) {
    hcyl(b, 2, 11, 24, 14, '#b5543f');
    for (let x = 5; x < 25; x += 4) b.set(x, 13, darken('#b5543f', 0.35)).set(x, 22, darken('#b5543f', 0.35));
    b.rect(4, 16, 6, 6, IRON_DARK).rect(5, 17, 4, 4, PAL.orange).rect(6, 18, 2, 2, PAL.yellow);
    b.rect(23, 1, 5, 12, IRON).vline(23, 1, 12, '#6b737a').hline(22, 1, 7, IRON_DARK);
    b.rect(5, 25, 3, 4, IRON).rect(20, 25, 3, 4, IRON).hline(2, 28, 26, IRON_DARK);
    gauge(b, 14, 9);
    b.vline(14, 10, 2, STEEL_DARK);
  },
  exchanger(b) {
    hcyl(b, 4, 11, 25, 10, '#d7dde1');
    b.rect(1, 10, 4, 12, STEEL_DARK).vline(4, 10, 12, IRON);
    for (const x of [9, 21]) {
      b.rect(x, 21, 4, 6, IRON).hline(x - 1, 26, 6, IRON_DARK);
    }
    pipeV(b, 8, 5, 6);
    b.rect(7, 4, 5, 2, IRON);
    pipeV(b, 24, 5, 6);
    b.rect(23, 4, 5, 2, IRON);
    pipeV(b, 2, 22, 6, STEEL);
    b.hline(5, 15, 23, '#c3c9cd');
    gauge(b, 16, 7);
    b.vline(16, 8, 3, STEEL_DARK);
  },
  vessel(b) {
    vcyl(b, 9, 3, 13, 24, '#e4e8ea', 4);
    b.rect(8, 26, 15, 3, IRON).hline(8, 28, 15, IRON_DARK);
    b.rect(13, 0, 4, 3, PAL.yellow).set(14, 0, darken(PAL.yellow, 0.3));
    for (let y = 6; y < 26; y += 3) b.hline(23, y, 3, IRON);
    b.vline(23, 5, 22, IRON).vline(26, 5, 22, IRON);
    b.rect(11, 12, 6, 4, '#c8cfd4').rect(12, 13, 4, 1, IRON);
    pipeH(b, 2, 18, 7);
    gauge(b, 5, 14);
  },
  tester(b) {
    box(b, 3, 22, 26, 7, IRON_DARK);
    b.rect(12, 24, 8, 3, '#1f3a2f').hline(13, 25, 5, '#7fd18a');
    for (const x of [6, 24]) {
      b.rect(x, 3, 3, 19, STEEL).vline(x, 3, 19, lighten(STEEL, 0.3)).vline(x + 2, 3, 19, STEEL_DARK);
    }
    box(b, 4, 3, 24, 4, '#2f6f9f');
    box(b, 4, 15, 24, 4, '#2f6f9f');
    b.rect(14, 7, 4, 2, IRON).rect(14, 13, 4, 2, IRON);
    b.rect(15, 9, 2, 4, '#e2c08e').set(15, 11, darken('#e2c08e', 0.3));
  },
  furnace(b) {
    b.rect(3, 8, 26, 20, PAL.brick);
    for (let y = 10; y < 28; y += 3) b.hline(3, y, 26, darken(PAL.brick, 0.25));
    for (let y = 8; y < 28; y += 3) for (let x = 3 + ((y / 3) % 2 ? 0 : 3); x < 29; x += 6) b.vline(x, y, 2, darken(PAL.brick, 0.25));
    box(b, 2, 6, 28, 3, IRON);
    b.rect(9, 14, 14, 12, IRON_DARK).rect(10, 15, 12, 11, '#ff9a3c').rect(12, 18, 8, 8, '#ffd36b').rect(14, 21, 4, 5, '#fff3c4');
    b.rect(22, 0, 4, 6, IRON).vline(22, 0, 6, '#6b737a');
    b.rect(26, 12, 3, 6, '#2f6f9f').set(27, 13, '#7fd18a');
  },
  welder(b) {
    vcyl(b, 2, 7, 6, 20, '#5d8a72', 2);
    b.rect(3, 4, 4, 3, IRON).hline(2, 4, 6, STEEL_DARK);
    b.rect(9, 17, 13, 3, PAL.woodLight).hline(9, 19, 13, PAL.woodDark);
    b.rect(10, 20, 2, 8, PAL.woodDark).rect(19, 20, 2, 8, PAL.woodDark);
    b.rect(12, 15, 7, 2, STEEL_DARK).rect(14, 14, 3, 1, '#fff3c4').set(15, 13, PAL.yellow).set(17, 12, PAL.white).set(13, 12, PAL.yellow);
    box(b, 22, 13, 9, 14, '#2f6f9f');
    b.circle(25, 17, 1.5, PAL.white).circle(28, 17, 1.5, PAL.white).rect(24, 21, 5, 2, '#1f3a2f');
    b.hline(23, 12, 7, IRON);
    for (let i = 0; i < 6; i++) b.set(21 - i, 22 + Math.round(Math.sin(i) * 1.5), IRON_DARK);
  },
  panel(b) {
    box(b, 3, 3, 26, 24, '#d7dde1');
    b.rect(5, 6, 10, 7, '#1f3a2f').hline(6, 8, 6, '#7fd18a').hline(6, 10, 8, '#7fd18a').set(13, 8, '#f2c94c');
    b.rect(17, 6, 10, 7, '#1f2a3a').hline(18, 9, 2, '#6fb3e6').hline(21, 8, 2, '#6fb3e6').hline(24, 10, 2, '#6fb3e6');
    gauge(b, 8, 17);
    gauge(b, 14, 17);
    gauge(b, 20, 17);
    lightDot(b, 24, 16, '#d9534f');
    lightDot(b, 24, 19, '#7fd18a');
    lightDot(b, 6, 22, PAL.yellow);
    b.rect(10, 22, 12, 2, IRON);
    b.rect(3, 27, 26, 2, IRON_DARK);
  },
  pipe(b) {
    for (const x of [4, 26]) b.rect(x, 12, 3, 16, IRON).hline(x - 1, 27, 5, IRON_DARK);
    pipeH(b, 1, 13, 30, STEEL, 4);
    pipeH(b, 1, 21, 30, '#d9a441', 4);
    for (const x of [9, 22]) b.rect(x, 12, 2, 6, STEEL_DARK).rect(x, 20, 2, 6, darken('#d9a441', 0.3));
    b.rect(13, 11, 6, 8, IRON).vline(16, 6, 5, STEEL_DARK);
    b.hline(12, 5, 9, RED).hline(13, 4, 7, RED).hline(13, 6, 7, darken(RED, 0.3)).set(16, 5, IRON);
    gauge(b, 19, 18);
    b.vline(19, 19, 2, STEEL_DARK);
  },
  engine(b) {
    skid(b, 1, 26, 30);
    box(b, 3, 12, 18, 14, '#c9733a');
    b.rect(5, 9, 14, 3, STEEL).hline(5, 9, 14, lighten(STEEL, 0.3));
    for (let x = 6; x < 19; x += 3) b.set(x, 10, IRON);
    b.rect(16, 2, 3, 7, IRON).rect(15, 2, 5, 2, IRON_DARK);
    box(b, 22, 9, 8, 17, IRON);
    for (let y = 11; y < 25; y += 2) b.hline(23, y, 6, '#6b737a');
    b.rect(6, 16, 10, 5, darken('#c9733a', 0.25)).hline(7, 18, 8, IRON);
  },
  motor(b) {
    skid(b, 1, 26, 30);
    hcyl(b, 3, 11, 21, 14, BLUE);
    for (let x = 6; x < 22; x += 2) b.vline(x, 12, 12, darken(BLUE, 0.3));
    b.ellipse(3, 18, 2.5, 7, IRON);
    box(b, 11, 7, 7, 4, darken(BLUE, 0.2));
    pipeH(b, 24, 17, 6, STEEL, 3);
    b.rect(6, 24, 4, 2, IRON).rect(17, 24, 4, 2, IRON);
  },
  gearbox(b) {
    skid(b, 1, 26, 30);
    box(b, 4, 9, 22, 17, '#e0a52a');
    const gear = (cx: number, cy: number, r: number) => {
      b.circle(cx, cy, r, STEEL_DARK);
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        b.set(cx + Math.cos(ang) * (r + 1), cy + Math.sin(ang) * (r + 1), STEEL_DARK);
      }
      b.circle(cx, cy, r - 1.5, STEEL).circle(cx, cy, 1.2, IRON);
    };
    gear(12, 18, 5);
    gear(21, 14, 3);
    pipeH(b, 0, 17, 4, STEEL);
    pipeH(b, 26, 13, 6, STEEL);
  },
  chiller(b) {
    box(b, 2, 10, 28, 17, '#dfe5e8');
    for (let y = 14; y < 26; y += 2) b.hline(4, y, 10, '#b8c0c8');
    for (const cx of [9, 22]) {
      b.ellipse(cx, 10, 6, 3, IRON).ellipse(cx, 10, 4.5, 2, '#6b737a');
      b.hline(cx - 3, 10, 7, IRON).vline(cx, 8, 5, IRON);
    }
    pipeV(b, 18, 15, 12, '#6fb3e6');
    pipeV(b, 23, 15, 12, '#3d6fb0');
    b.set(19, 18, PAL.white).set(19, 23, PAL.white);
    b.rect(2, 27, 28, 2, IRON_DARK);
  },
  crane(b) {
    // pórtico: viga I sobre duas colunas, talha no meio do vão segurando uma carga
    const Y = '#e0a52a';
    for (const x of [3, 26]) {
      b.rect(x, 8, 3, 20, Y).vline(x, 8, 20, lighten(Y, 0.3)).vline(x + 2, 8, 20, darken(Y, 0.3));
      b.rect(x - 1, 27, 5, 2, IRON_DARK);
    }
    b.rect(1, 4, 30, 2, darken(Y, 0.15)).rect(5, 6, 22, 2, Y).rect(1, 8, 30, 2, darken(Y, 0.15));
    b.hline(1, 4, 30, lighten(Y, 0.3));
    for (let x = 7; x < 26; x += 4) b.set(x, 7, darken(Y, 0.35));
    box(b, 13, 10, 6, 4, IRON);
    b.vline(16, 14, 5, '#2b2b30');
    b.set(15, 19, STEEL_DARK).set(17, 19, STEEL_DARK).set(16, 20, STEEL_DARK);
    box(b, 11, 21, 10, 7, '#9a6b3f');
    b.hline(11, 24, 10, darken('#9a6b3f', 0.3)).vline(16, 21, 7, darken('#9a6b3f', 0.25));
  },
  mill(b) {
    // laminador visto de lado: gaiola, dois cilindros e a chapa entrando grossa e saindo fina
    const H = '#2f6f9f';
    skid(b, 1, 27, 30);
    for (const x of [8, 21]) {
      b.rect(x, 3, 4, 24, H).vline(x, 3, 24, lighten(H, 0.3)).vline(x + 3, 3, 24, darken(H, 0.3));
    }
    box(b, 7, 1, 19, 3, darken(H, 0.15));
    b.rect(14, 4, 5, 2, IRON);
    for (const cy of [10, 21]) {
      b.circle(16.5, cy, 5.5, STEEL_DARK).circle(15.5, cy - 1, 4, STEEL).circle(16.5, cy, 1.4, IRON);
      b.set(14, cy - 3, lighten(STEEL, 0.4));
    }
    const CU = '#cf8a5c';
    b.rect(0, 14, 12, 4, CU).hline(0, 14, 12, lighten(CU, 0.35)).hline(0, 17, 12, darken(CU, 0.3));
    b.rect(21, 15, 11, 2, CU).hline(21, 15, 11, lighten(CU, 0.35));
    for (const x of [3, 8]) b.vline(x, 15, 2, darken(CU, 0.25));
    for (const x of [24, 29]) b.set(x, 16, darken(CU, 0.25));
  },
  pendulum(b) {
    // máquina de impacto Charpy: base, colunas, mostrador no eixo e o martelo pendurado
    skid(b, 2, 27, 28);
    box(b, 4, 22, 24, 5, '#3a4b60');
    for (const x of [6, 23]) {
      b.rect(x, 5, 3, 17, STEEL).vline(x, 5, 17, lighten(STEEL, 0.3)).vline(x + 2, 5, 17, STEEL_DARK);
    }
    box(b, 5, 2, 22, 4, '#4a5a6e');
    b.circle(16, 9, 4.5, IRON).circle(16, 9, 3.5, '#e9eef3');
    b.set(17, 10, RED).set(18, 11, RED).set(16, 9, IRON);
    for (let i = 0; i <= 9; i++) b.set(16 - Math.round(i * 0.3), 12 + i, STEEL_DARK).set(17 - Math.round(i * 0.3), 12 + i, STEEL);
    b.circle(12.5, 22, 4, '#d9a441').circle(11.5, 21, 2, lighten('#d9a441', 0.35));
    b.rect(18, 20, 4, 2, '#5ab8ff').set(20, 21, darken('#5ab8ff', 0.4));
  },
  isolator(b) {
    // motor sobre base elástica: bloco de concreto, molas e amortecedor, base de aço e o motor com o disco
    b.rect(2, 27, 28, 3, '#9a9d99').hline(2, 27, 28, '#c5c8c3').hline(2, 29, 28, '#6f726e');
    const SPR = '#c8d1db';
    for (const x of [6, 13, 24]) {
      for (let y = 19; y < 27; y++) {
        if (y % 2) b.hline(x - 2, y, 4, SPR).set(x - 2, y, lighten(SPR, 0.2));
        else b.hline(x - 1, y, 4, darken(SPR, 0.4));
      }
    }
    b.rect(17, 21, 3, 6, '#5b6b80').vline(18, 18, 3, STEEL);
    box(b, 2, 17, 26, 3, '#4a5a6e');
    hcyl(b, 4, 6, 18, 11, BLUE);
    for (let x = 7; x < 20; x += 2) b.vline(x, 7, 9, darken(BLUE, 0.3));
    b.ellipse(4, 11.5, 2, 5, IRON);
    box(b, 8, 3, 6, 3, darken(BLUE, 0.2));
    b.rect(22, 10, 3, 3, STEEL_DARK);
    b.circle(27, 11.5, 4, '#9aa7b6').circle(27, 11.5, 1.2, IRON);
    b.rect(28, 8, 2, 2, RED);
  },
  absorber(b) {
    // bancada de 2 graus de liberdade: duas massas e duas molas, com o analisador mostrando dois picos
    b.rect(1, 28, 20, 2, IRON_DARK).hline(1, 28, 20, '#6b737a');
    const SPR = '#c8d1db';
    const coil = (x: number, y0: number, y1: number, c: string) => {
      for (let y = y0; y < y1; y++) {
        if (y % 2) b.hline(x - 2, y, 4, c);
        else b.hline(x - 1, y, 4, darken(c, 0.4));
      }
    };
    coil(11, 20, 28, SPR);
    box(b, 4, 15, 15, 5, BLUE);
    coil(11, 9, 15, '#ffae42');
    box(b, 6, 4, 11, 5, '#d99a45');
    b.vline(2, 4, 24, IRON).vline(20, 4, 24, IRON);
    box(b, 21, 9, 10, 15, '#2f3b4a');
    b.rect(22, 11, 8, 8, '#1f2a3a');
    b.set(23, 17, '#5fd38a').set(24, 13, '#5fd38a').set(24, 14, '#5fd38a').set(25, 17, '#5fd38a').set(26, 16, '#5fd38a').set(27, 12, '#ffae42').set(27, 13, '#ffae42').set(28, 17, '#5fd38a');
    b.hline(22, 18, 8, '#4c5a6c');
    lightDot(b, 23, 20, '#7fd18a');
    b.rect(22, 24, 8, 4, IRON).hline(21, 27, 10, IRON_DARK);
  },
  ramp(b) {
    // plano inclinado: cunha de concreto, um cilindro rolando e uma caixa no alto
    const CONC = '#9a9d99';
    skid(b, 1, 27, 30);
    for (let x = 3; x <= 28; x++) {
      const top = Math.round(26 - (x - 3) * 0.64);
      b.vline(x, top, 27 - top, x === 28 ? darken(CONC, 0.25) : CONC);
      b.set(x, top, lighten(CONC, 0.4));
      if (top + 1 < 27) b.set(x, top + 1, lighten(CONC, 0.18));
    }
    for (const [x, y] of [[9, 26], [9, 25], [9, 24]]) b.set(x, y, PAL.yellow);
    b.circle(10, 17, 4, BLUE).circle(9, 16, 2, lighten(BLUE, 0.3));
    b.set(10, 17, IRON).set(11, 18, darken(BLUE, 0.35)).set(12, 19, darken(BLUE, 0.35));
    b.rect(23, 9, 7, 2, darken(CONC, 0.15)).hline(23, 9, 7, lighten(CONC, 0.3));
    box(b, 24, 3, 6, 6, '#d39b5c');
    b.vline(26, 4, 4, darken('#d39b5c', 0.3));
  },
  winch(b) {
    // guincho: motor, redutor com as engrenagens à mostra, tambor no cavalete e a carga pendurada no cabo
    skid(b, 1, 27, 30);
    hcyl(b, 1, 15, 8, 9, BLUE);
    for (let x = 3; x < 8; x += 2) b.vline(x, 16, 7, darken(BLUE, 0.3));
    b.rect(9, 18, 2, 3, STEEL_DARK);
    box(b, 11, 9, 9, 17, '#e0a52a');
    b.circle(15.5, 14.5, 3.4, STEEL_DARK).circle(15.5, 14.5, 2.2, STEEL).set(15, 14, IRON).set(16, 15, IRON);
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      b.set(Math.round(15.5 + Math.cos(ang) * 4.3), Math.round(14.5 + Math.sin(ang) * 4.3), STEEL_DARK);
    }
    b.circle(14, 21.5, 1.8, STEEL_DARK).set(14, 21, IRON);
    b.vline(30, 7, 20, IRON).vline(29, 9, 18, IRON_DARK);
    b.rect(20, 7, 2, 2, STEEL_DARK);
    hcyl(b, 21, 4, 9, 7, '#8a6a48');
    for (const x of [23, 25, 27]) b.vline(x, 5, 5, '#d8c7a5');
    b.vline(24, 11, 7, '#e8dcc0');
    b.set(24, 18, IRON);
    box(b, 21, 19, 7, 5, '#6b737a');
    b.hline(21, 21, 7, darken('#6b737a', 0.25));
  },
  cell(b) {
    // cuba de ensaio de corrosão: placas de zinco e de cobre na água, ligadas por um fio com o amperímetro
    const GLASS = '#cfe6f0';
    const WATER = '#2f8c94';
    b.rect(2, 27, 28, 2, IRON).hline(2, 27, 28, '#6b737a');
    b.vline(4, 29, 3, IRON_DARK).vline(27, 29, 3, IRON_DARK);
    b.rect(5, 14, 22, 12, WATER).hline(5, 14, 22, lighten(WATER, 0.35)).hline(5, 25, 22, darken(WATER, 0.2));
    b.vline(4, 10, 16, GLASS).vline(27, 10, 16, GLASS).hline(4, 26, 24, GLASS);
    b.rect(7, 9, 4, 14, '#a3b2bf').vline(7, 9, 14, lighten('#a3b2bf', 0.3)).vline(10, 9, 14, darken('#a3b2bf', 0.25));
    b.rect(21, 9, 4, 14, '#c97a48').vline(21, 9, 14, lighten('#c97a48', 0.3)).vline(24, 9, 14, darken('#c97a48', 0.25));
    for (const [x, y] of [[8, 13], [9, 17], [8, 20]]) b.set(x, y, '#5d6670');
    const WIRE = '#d9a441';
    b.vline(9, 4, 5, WIRE).vline(22, 4, 5, WIRE).hline(9, 4, 4, WIRE).hline(19, 4, 4, WIRE);
    box(b, 12, 1, 8, 7, '#1d3047');
    b.circle(16, 4.5, 2.2, PAL.white).set(16, 4, PAL.red).set(17, 3, PAL.red);
    for (const [x, y] of [[19, 12], [20, 16], [19, 19], [26, 12]]) b.set(x, y, '#e8f6ff');
    for (const [x, y] of [[12, 24], [13, 24], [14, 24], [15, 24], [13, 23]]) b.set(x, y, '#e9eef1');
  },
  rectifier(b) {
    // proteção catódica por corrente impressa: retificador, duto enterrado (−) e o anodo inerte (+)
    const SOIL = '#7a5a3a';
    b.rect(0, 20, 32, 12, SOIL).hline(0, 20, 32, lighten(SOIL, 0.3)).hline(0, 21, 32, lighten(SOIL, 0.12));
    for (const [x, y] of [[3, 30], [9, 23], [16, 30], [28, 21], [20, 27], [13, 29]]) b.set(x, y, darken(SOIL, 0.3));
    hcyl(b, 0, 24, 20, 5, '#3f4652');
    b.rect(25, 23, 5, 8, '#2b2f35').vline(25, 23, 8, '#4a4e5a').hline(25, 23, 5, '#5a606b');
    b.vline(5, 17, 4, IRON).vline(12, 17, 4, IRON);
    box(b, 3, 3, 12, 14, '#8b98a7');
    b.rect(5, 5, 8, 5, '#1f2a3a');
    b.hline(6, 8, 3, '#5fd38a').set(9, 7, '#5fd38a').set(10, 6, '#5fd38a').set(11, 6, '#5fd38a');
    b.rect(5, 12, 2, 2, '#1d1d22').rect(11, 12, 2, 2, RED);
    b.vline(6, 14, 10, '#1d1d22');
    b.hline(13, 12, 14, RED).vline(27, 12, 11, RED);
    lightDot(b, 8, 12, '#7fd18a');
  },
  generator(b) {
    // grupo gerador: motor diesel acoplado a um alternador, com a caixa de ligação em cima
    const ENG = '#d9a441';
    skid(b, 1, 26, 30);
    box(b, 2, 12, 12, 13, ENG);
    for (let x = 4; x < 13; x += 3) b.vline(x, 14, 9, darken(ENG, 0.3));
    b.rect(2, 9, 10, 3, darken(ENG, 0.12)).hline(2, 9, 10, lighten(ENG, 0.25));
    pipeV(b, 7, 2, 7, STEEL_DARK);
    b.rect(6, 1, 5, 2, IRON_DARK);
    b.rect(14, 16, 3, 4, STEEL_DARK).hline(14, 16, 3, STEEL);
    hcyl(b, 16, 11, 15, 14, GREEN);
    for (let x = 19; x < 29; x += 2) b.vline(x, 12, 12, darken(GREEN, 0.28));
    box(b, 20, 6, 8, 5, darken(GREEN, 0.15));
    lightDot(b, 23, 8, PAL.yellow);
    b.vline(29, 4, 3, IRON).hline(27, 4, 3, IRON);
    b.rect(5, 24, 3, 2, IRON).rect(22, 24, 3, 2, IRON);
  },
  bearing(b) {
    // árvore com uma engrenagem entre dois mancais de pedestal; o da esquerda com o copo de óleo
    const HOUSE = '#5d6b7a';
    skid(b, 1, 26, 30);
    hcyl(b, 0, 15, 32, 5, STEEL);
    for (const x0 of [3, 20]) {
      b.rect(x0 - 1, 23, 11, 3, darken(HOUSE, 0.18)).hline(x0 - 1, 23, 11, lighten(HOUSE, 0.18));
      box(b, x0, 11, 9, 12, HOUSE);
      b.hline(x0 + 1, 10, 7, lighten(HOUSE, 0.25));
      b.circle(x0 + 4, 17, 3.2, darken(HOUSE, 0.35)).circle(x0 + 4, 17, 2.2, STEEL_DARK).circle(x0 + 4, 17, 1.2, STEEL);
      b.set(x0, 24, STEEL).set(x0 + 8, 24, STEEL);
    }
    const GEAR = '#c98e3e';
    b.circle(15.5, 16.5, 5.2, darken(GEAR, 0.15));
    for (let a = 0; a < 10; a++) {
      const ang = (a / 10) * Math.PI * 2;
      b.set(Math.round(15.5 + Math.cos(ang) * 6), Math.round(16.5 + Math.sin(ang) * 6), darken(GEAR, 0.15));
    }
    b.circle(15.5, 16.5, 4, GEAR).circle(15.5, 16.5, 1.8, STEEL).set(15, 16, IRON);
    b.rect(6, 6, 3, 3, '#e0a52a').hline(6, 6, 3, lighten('#e0a52a', 0.35)).vline(7, 9, 1, IRON);
  },
  spring(b) {
    // prensa de ensaio de molas: duas colunas, travessa com o fuso e o volante, e a mola entre os pratos
    const SPRING = RED;
    skid(b, 1, 26, 30);
    b.vline(4, 5, 21, IRON).vline(5, 5, 21, IRON_DARK).vline(26, 5, 21, IRON).vline(27, 5, 21, IRON_DARK);
    box(b, 3, 4, 26, 4, BLUE);
    for (let y = 0; y < 13; y++) b.hline(15, y, 2, y % 2 ? STEEL_DARK : STEEL);
    b.hline(11, 1, 10, IRON).set(11, 0, IRON).set(20, 0, IRON);
    b.rect(9, 12, 14, 2, STEEL_DARK).hline(9, 12, 14, STEEL);
    for (let k = 0; k < 5; k++) {
      const y = 15 + k * 2;
      b.hline(10, y, 12, lighten(SPRING, 0.2)).set(10, y + 1, darken(SPRING, 0.3)).set(21, y + 1, darken(SPRING, 0.3));
    }
    b.rect(9, 24, 14, 2, STEEL_DARK).hline(9, 24, 14, STEEL);
    for (let y = 9; y < 24; y += 3) b.hline(28, y, 2, PAL.white);
    gauge(b, 7, 10);
  },
};

export function drawEquipment(kind: EquipmentKind): PixelBuffer {
  const b = new PixelBuffer(32, 32);
  DRAW[kind](b);
  return b.outline(PAL.outline);
}

// ------------------------------------------------------------------ extras

/** Base vazia: espaço reservado para novos tópicos. */
function emptyBase(): PixelBuffer {
  const b = new PixelBuffer(32, 32);
  b.rect(3, 19, 26, 9, '#9a9d99').hline(3, 19, 26, '#c5c8c3').hline(3, 27, 26, '#6f726e');
  for (const [x, y] of [[5, 21], [26, 21], [5, 25], [26, 25]]) b.set(x, y, IRON).set(x, y - 1, '#c5c8c3');
  for (let x = 4; x < 28; x += 4) b.rect(x, 28, 2, 1, PAL.yellow);
  return b.outline(PAL.outline);
}

/** Coluna de destilação (decorativa). */
function column(): PixelBuffer {
  const b = new PixelBuffer(24, 84);
  vcyl(b, 5, 6, 14, 74, '#e4e8ea', 3);
  for (let y = 18; y < 78; y += 14) {
    b.hline(3, y, 18, IRON).hline(3, y - 3, 1, IRON).hline(20, y - 3, 1, IRON);
    b.vline(3, y - 3, 3, IRON).vline(20, y - 3, 3, IRON);
  }
  b.vline(19, 8, 70, IRON).vline(21, 8, 70, IRON);
  for (let y = 10; y < 78; y += 3) b.set(20, y, IRON);
  b.rect(10, 1, 4, 5, PAL.yellow);
  b.rect(4, 79, 16, 4, IRON);
  return b.outline(PAL.outline);
}

/** Rack de tubulações (decorativo). */
function piperack(): PixelBuffer {
  const b = new PixelBuffer(48, 30);
  for (const x of [3, 43]) b.rect(x, 4, 3, 25, IRON).vline(x, 4, 25, '#6b737a');
  b.rect(2, 4, 45, 3, IRON_DARK);
  pipeH(b, 1, 8, 46, STEEL, 3);
  pipeH(b, 1, 12, 46, '#d9a441', 3);
  pipeH(b, 1, 16, 46, '#4f8f56', 3);
  b.rect(2, 20, 45, 2, IRON_DARK);
  return b.outline(PAL.outline);
}

/** Cancela aberta (portão da Refinaria liberado). */
function barrier(): PixelBuffer {
  const b = new PixelBuffer(16, 34);
  box(b, 3, 22, 10, 11, PAL.yellow);
  b.rect(3, 27, 10, 2, '#2b2b30');
  for (let y = 1; y < 22; y++) b.rect(7, y, 3, 1, Math.floor(y / 4) % 2 ? PAL.white : PAL.red);
  b.circle(8, 22, 2, IRON);
  return b.outline(PAL.outline);
}

function lamp(color: string): PixelBuffer {
  const b = new PixelBuffer(6, 6);
  b.circle(3, 3, 2.4, color).set(2, 2, lighten(color, 0.6));
  return b.outline(PAL.outline);
}

function wrench(): PixelBuffer {
  const b = new PixelBuffer(11, 11);
  b.stamp(0, 0, ['.kk......', 'k.kk.....', 'kk.k.....', '.kkkk....', '...kkk...', '....kkk..', '.....kkk.', '......kkk', '.......kk'], { k: '#d7dde1' });
  b.set(2, 1, PAL.white);
  return b.outline(PAL.outline);
}

function lock(): PixelBuffer {
  const b = new PixelBuffer(9, 10);
  b.stamp(1, 0, ['.kkk.', 'k...k', 'k...k'], { k: '#c8cfd4' });
  b.rect(1, 3, 7, 6, PAL.yellow).set(4, 5, '#2b2b30').set(4, 6, '#2b2b30');
  return b.outline(PAL.outline);
}

function puff(): PixelBuffer {
  const b = new PixelBuffer(6, 6);
  return b.circle(3, 3, 2.6, '#f4f6f8');
}

/** Cores das lâmpadas por estágio: em montagem → otimizado. */
export const STATUS_LAMP_COLORS = ['#d9534f', '#e8873a', '#f2c94c', '#3fbf6a', '#3fb6d9'];

export function registerEquipment(scene: Phaser.Scene, kinds: readonly EquipmentKind[]): void {
  for (const kind of kinds) add(scene, `eq-${kind}`, drawEquipment(kind));
  add(scene, 'eq-empty', emptyBase());
  add(scene, 'column', column());
  add(scene, 'piperack', piperack());
  add(scene, 'barrier', barrier());
  STATUS_LAMP_COLORS.forEach((c, i) => add(scene, `lamp-${i}`, lamp(c)));
  add(scene, 'icon-wrench', wrench());
  add(scene, 'icon-lock', lock());
  add(scene, 'puff', puff());
}
