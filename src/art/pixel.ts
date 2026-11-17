/**
 * Mini "editor de pixel art" em código: um buffer RGBA com primitivas simples.
 * Toda a arte do jogo é gerada aqui (sem arquivos de imagem), então é 100% original e fácil de trocar.
 */

const colorCache = new Map<string, number>();

/** '#rrggbb' -> inteiro ABGR (ordem de bytes do ImageData em máquinas little-endian). */
export function packColor(hex: string, alpha = 255): number {
  const key = hex + alpha;
  let packed = colorCache.get(key);
  if (packed === undefined) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    packed = ((alpha & 255) << 24) | (b << 16) | (g << 8) | r;
    packed >>>= 0;
    colorCache.set(key, packed);
  }
  return packed;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

export const darken = (hex: string, t: number) => mix(hex, '#000000', t);
export const lighten = (hex: string, t: number) => mix(hex, '#ffffff', t);

export function hexToNumber(hex: string): number {
  return parseInt(hex.slice(1), 16);
}

export class PixelBuffer {
  readonly w: number;
  readonly h: number;
  readonly data: Uint32Array;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.data = new Uint32Array(w * h);
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  set(x: number, y: number, hex: string, alpha = 255): this {
    x = Math.floor(x);
    y = Math.floor(y);
    if (this.inBounds(x, y)) this.data[y * this.w + x] = packColor(hex, alpha);
    return this;
  }

  clear(x: number, y: number): this {
    if (this.inBounds(x, y)) this.data[y * this.w + x] = 0;
    return this;
  }

  opaque(x: number, y: number): boolean {
    return this.inBounds(x, y) && this.data[y * this.w + x] >>> 24 > 0;
  }

  rect(x: number, y: number, w: number, h: number, hex: string, alpha = 255): this {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, hex, alpha);
    return this;
  }

  hline(x: number, y: number, len: number, hex: string): this {
    return this.rect(x, y, len, 1, hex);
  }

  vline(x: number, y: number, len: number, hex: string): this {
    return this.rect(x, y, 1, len, hex);
  }

  /** Elipse preenchida (centro cx,cy; raios rx,ry). */
  ellipse(cx: number, cy: number, rx: number, ry: number, hex: string, alpha = 255): this {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, hex, alpha);
      }
    }
    return this;
  }

  circle(cx: number, cy: number, r: number, hex: string): this {
    return this.ellipse(cx, cy, r, r, hex);
  }

  /** Desenha uma "máscara" em texto: cada caractere mapeia para uma cor ('.' ou ' ' = vazio). */
  stamp(x: number, y: number, rows: string[], colors: Record<string, string>): this {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const c = colors[ch];
        if (c) this.set(x + i, y + j, c);
      });
    });
    return this;
  }

  /** Contorno de 1 px ao redor de todos os pixels opacos (vizinhança de 4). */
  outline(hex: string): this {
    const marks: number[] = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.opaque(x, y)) continue;
        if (this.opaque(x + 1, y) || this.opaque(x - 1, y) || this.opaque(x, y + 1) || this.opaque(x, y - 1)) {
          marks.push(y * this.w + x);
        }
      }
    }
    const packed = packColor(hex);
    for (const i of marks) this.data[i] = packed;
    return this;
  }

  /** Copia os pixels opacos de outro buffer. */
  blit(src: PixelBuffer, dx: number, dy: number): this {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const v = src.data[y * src.w + x];
        if (v >>> 24 && this.inBounds(dx + x, dy + y)) this.data[(dy + y) * this.w + dx + x] = v;
      }
    }
    return this;
  }

  flipX(): PixelBuffer {
    const out = new PixelBuffer(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) out.data[y * this.w + (this.w - 1 - x)] = this.data[y * this.w + x];
    return out;
  }

  /** Escreve o buffer num contexto 2D (posição em pixels). */
  drawTo(ctx: CanvasRenderingContext2D, dx: number, dy: number): void {
    const img = ctx.createImageData(this.w, this.h);
    new Uint32Array(img.data.buffer).set(this.data);
    const tmp = document.createElement('canvas');
    tmp.width = this.w;
    tmp.height = this.h;
    tmp.getContext('2d')!.putImageData(img, 0, 0);
    ctx.drawImage(tmp, dx, dy);
  }

  toCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.w;
    canvas.height = this.h;
    const ctx = canvas.getContext('2d')!;
    const img = ctx.createImageData(this.w, this.h);
    new Uint32Array(img.data.buffer).set(this.data);
    ctx.putImageData(img, 0, 0);
    return canvas;
  }
}
