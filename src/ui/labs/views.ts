/** Contrato dos desenhos das bancadas e o registro (uma função por bancada). */
import type { LabId, LabValues } from '../../learning/types';
import { beamView } from './beamView';
import { charpyView } from './charpyView';
import { coldworkView } from './coldworkView';
import { compressorView } from './compressorView';
import { corrosionView } from './corrosionView';
import { cycleView } from './cycleView';
import { exchangerView } from './exchangerView';
import { fecView } from './fecView';
import { gearsView } from './gearsView';
import { motorView } from './motorView';
import { pistonView } from './pistonView';
import { pumpView } from './pumpView';
import { rampView } from './rampView';
import { shaftView } from './shaftView';
import { springView } from './springView';
import { tensileView } from './tensileView';
import { vaporView } from './vaporView';
import { venturiView } from './venturiView';
import { vibrationView } from './vibrationView';

export interface LabActionApi {
  get(): LabValues;
  /** Muda controles (respeita os travados). `animate` = transição devagar. */
  set(values: LabValues, animate?: boolean): void;
  isLocked(id: string): boolean;
}

export interface LabAction {
  label: string;
  title?: string;
  run: (api: LabActionApi) => void;
}

export interface LabView {
  /** Desenha um quadro no espaço lógico 960 × 560. `dt` em segundos. */
  draw(ctx: CanvasRenderingContext2D, v: LabValues, o: Record<string, number>, dt: number, time: number): void;
  /** Frase de situação sob o desenho. */
  status?(v: LabValues, o: Record<string, number>): { text: string; tone: 'ok' | 'warn' | 'bad' } | null;
  /** Mouse/toque no desenho (coordenadas lógicas): devolve controles a mudar. */
  pointer?(kind: 'down' | 'move' | 'up', x: number, y: number, v: LabValues): LabValues | null;
  cursor?(x: number, y: number, v: LabValues): string;
  /** Animações próprias (ex.: resfriamento lento): chamado a cada quadro, devolve controles a mudar. */
  tick?(v: LabValues, dt: number): LabValues | null;
  /** Botões extras ao lado dos controles. */
  actions?: LabAction[];
  reset?(): void;
}

export const VIEWS: Record<LabId, () => LabView> = {
  pump: pumpView,
  venturi: venturiView,
  exchanger: exchangerView,
  fec: fecView,
  piston: pistonView,
  cycle: cycleView,
  vapor: vaporView,
  compressor: compressorView,
  tensile: tensileView,
  beam: beamView,
  coldwork: coldworkView,
  charpy: charpyView,
  vibration: vibrationView,
  ramp: rampView,
  gears: gearsView,
  corrosion: corrosionView,
  motor: motorView,
  shaft: shaftView,
  spring: springView,
};
