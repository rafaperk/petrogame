/**
 * "Microscópio" da bancada Fe-C: desenha uma microestrutura estilizada (grãos de Voronoi) a partir das
 * frações calculadas pelo modelo — ferrita, perlita lamelar, rede de cementita, austenita, líquido,
 * martensita e ledeburita. Só redesenha quando o estado muda.
 */
import { Region } from '../../learning/labs/fec';
import { seeded } from './draw';

const SIZE = 240;
const SEEDS = 34;

type RGB = readonly [number, number, number];
const FERRITE: RGB = [238, 233, 218];
const CEMENTITE: RGB = [252, 251, 244];
const AUSTENITE: RGB = [224, 170, 120];
const DELTA: RGB = [232, 214, 196];
const PEARLITE_DARK: RGB = [78, 64, 54];
const PEARLITE_LIGHT: RGB = [214, 204, 186];
const MART_DARK: RGB = [62, 70, 82];
const MART_LIGHT: RGB = [186, 194, 204];
const LED_DARK: RGB = [96, 82, 70];
const BOUNDARY: RGB = [70, 58, 50];

interface Grain {
  x: number;
  y: number;
  rank: number;
  angle: number;
  angle2: number;
  spacing: number;
  shade: number;
}

export class Microscope {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly img: ImageData;
  private readonly grainOf = new Uint8Array(SIZE * SIZE);
  private readonly edge = new Float32Array(SIZE * SIZE);
  private readonly grains: Grain[] = [];
  private key = '';

  constructor(seed = 7) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
    this.ctx = this.canvas.getContext('2d')!;
    this.img = this.ctx.createImageData(SIZE, SIZE);
    const rnd = seeded(seed);
    const ranks = Array.from({ length: SEEDS }, (_, i) => (i + rnd() * 0.9) / SEEDS).sort(() => rnd() - 0.5);
    for (let i = 0; i < SEEDS; i++) {
      this.grains.push({
        x: rnd() * SIZE,
        y: rnd() * SIZE,
        rank: ranks[i],
        angle: rnd() * Math.PI,
        angle2: rnd() * Math.PI,
        spacing: 3.2 + rnd() * 1.6,
        shade: rnd() * 0.12 - 0.06,
      });
    }
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        let d1 = Infinity;
        let d2 = Infinity;
        let g1 = 0;
        for (let i = 0; i < SEEDS; i++) {
          const dx = x - this.grains[i].x;
          const dy = y - this.grains[i].y;
          const d = dx * dx + dy * dy;
          if (d < d1) {
            d2 = d1;
            d1 = d;
            g1 = i;
          } else if (d < d2) d2 = d;
        }
        const idx = y * SIZE + x;
        this.grainOf[idx] = g1;
        // distância aproximada até o contorno (metade da diferença entre as duas sementes mais próximas)
        this.edge[idx] = (Math.sqrt(d2) - Math.sqrt(d1)) / 2;
      }
    }
  }

  /** Atualiza a imagem se o estado mudou. `o` são as saídas do modelo (frações em %). */
  update(o: Record<string, number>, cool: number): void {
    const q = (v: number) => Math.round(v / 2) * 2;
    const key = [o.region, q(o.fL), q(o.fGamma), q(o.fAlpha), q(o.fFe3C), q(o.fPerlita), q(o.fFerritaPro), q(o.fCementitaPro), q(o.fLedeburita), q(o.fCemPrim), q(o.fMart), cool].join('|');
    if (key === this.key) return;
    this.key = key;
    const data = this.img.data;
    const region = o.region as Region;
    const ferritePro = o.fFerritaPro / 100;
    const cemPro = o.fCementitaPro / 100;
    const led = o.fLedeburita / 100;
    const cemPrim = o.fCemPrim / 100;
    const mart = o.fMart / 100;
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const idx = y * SIZE + x;
        const g = this.grains[this.grainOf[idx]];
        const e = this.edge[idx];
        const lamella = () => {
          const u = x * Math.cos(g.angle) + y * Math.sin(g.angle);
          return (((u / g.spacing) % 1) + 1) % 1 < 0.3 ? PEARLITE_DARK : PEARLITE_LIGHT;
        };
        const liquid = (): RGB => {
          const w = Math.sin(x * 0.09 + Math.sin(y * 0.05) * 2) * 0.5 + 0.5;
          return [70 + 20 * w, 100 + 22 * w, 140 + 25 * w];
        };
        const martensite = (): RGB => {
          const a = x * 0.7 + y > g.x + g.y ? g.angle : g.angle2;
          const u = x * Math.cos(a) + y * Math.sin(a);
          const w = -x * Math.sin(a) + y * Math.cos(a);
          const stripe = (((u / 6) % 1) + 1) % 1 < 0.24;
          const seg = (((w + 37 * Math.floor(u / 6)) % 22) + 22) % 22 < 15;
          return stripe && seg ? MART_DARK : MART_LIGHT;
        };
        const ledeburite = (): RGB => {
          const s = Math.sin(x * 0.55 + g.angle * 5) * Math.sin(y * 0.6 + g.angle2 * 5);
          return s > 0.35 ? LED_DARK : CEMENTITE;
        };
        const network = (frac: number, w: number) => frac > 0 && e < 0.6 + w * frac;
        let rgb: RGB;
        let isLiquid = false;
        if (region === Region.L) {
          rgb = liquid();
          isLiquid = true;
        } else if (region === Region.LGamma) {
          isLiquid = !(g.rank < o.fGamma / 100 && e > 1.5);
          rgb = isLiquid ? liquid() : AUSTENITE;
        } else if (region === Region.LDelta) {
          isLiquid = g.rank >= o.fDelta / 100;
          rgb = isLiquid ? liquid() : DELTA;
        } else if (region === Region.Delta) rgb = DELTA;
        else if (region === Region.DeltaGamma) rgb = g.rank < o.fGamma / 100 ? AUSTENITE : DELTA;
        else if (region === Region.LFe3C) {
          isLiquid = g.rank >= o.fFe3C / 100;
          rgb = isLiquid ? liquid() : CEMENTITE;
        } else if (region === Region.Gamma) rgb = AUSTENITE;
        else if (region === Region.AlphaGamma) rgb = g.rank < o.fAlpha / 100 ? FERRITE : AUSTENITE;
        else if (region === Region.GammaFe3C) {
          if (led > 0 || o.fCemPrim > 0) rgb = g.rank < led + cemPrim ? ledeburite() : network(cemPro, 5) ? CEMENTITE : AUSTENITE;
          else rgb = network(cemPro, 9) ? CEMENTITE : AUSTENITE;
        } else if (mart > 0) rgb = network(cemPro, 9) ? CEMENTITE : martensite();
        else if (cemPrim > 0) {
          const u = x * Math.cos(g.angle) + y * Math.sin(g.angle);
          rgb = g.rank < cemPrim * 1.6 && (((u / 18) % 1) + 1) % 1 < 0.35 ? CEMENTITE : ledeburite();
        } else if (led > 0) rgb = g.rank < led ? ledeburite() : network(cemPro, 5) ? CEMENTITE : lamella();
        else if (network(cemPro, 9)) rgb = CEMENTITE;
        else if (g.rank < ferritePro) rgb = FERRITE;
        else rgb = o.fPerlita > 0 ? lamella() : FERRITE;
        // contornos de grão finos (exceto no líquido e na rede de cementita)
        if (!isLiquid && e < 0.7 && rgb !== CEMENTITE) rgb = BOUNDARY;
        const sh = 1 + g.shade;
        data[idx * 4] = Math.min(255, rgb[0] * sh);
        data[idx * 4 + 1] = Math.min(255, rgb[1] * sh);
        data[idx * 4 + 2] = Math.min(255, rgb[2] * sh);
        data[idx * 4 + 3] = 255;
      }
    }
    this.ctx.putImageData(this.img, 0, 0);
  }
}
