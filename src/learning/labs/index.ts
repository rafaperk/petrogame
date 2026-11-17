/** Registro das bancadas (modelos puros). Para criar uma nova: modelo aqui + desenho em ui/labs/views.ts. */
import type { LabId } from '../types';
import { beamModel } from './beam';
import { charpyModel } from './charpy';
import { coldworkModel } from './coldwork';
import { compressorModel } from './compressor';
import { corrosionModel } from './corrosion';
import { cycleModel } from './cycle';
import { exchangerModel } from './exchanger';
import { fecModel } from './fec';
import { gearsModel } from './gears';
import type { LabModel } from './model';
import { motorModel } from './motor';
import { pistonModel } from './piston';
import { pumpModel } from './pump';
import { rampModel } from './ramp';
import { shaftModel } from './shaft';
import { springModel } from './spring';
import { tensileModel } from './tensile';
import { vaporModel } from './vapor';
import { venturiModel } from './venturi';
import { vibrationModel } from './vibration';

export const LAB_MODELS: Record<LabId, LabModel> = {
  pump: pumpModel,
  venturi: venturiModel,
  exchanger: exchangerModel,
  fec: fecModel,
  piston: pistonModel,
  cycle: cycleModel,
  vapor: vaporModel,
  compressor: compressorModel,
  tensile: tensileModel,
  beam: beamModel,
  coldwork: coldworkModel,
  charpy: charpyModel,
  vibration: vibrationModel,
  ramp: rampModel,
  gears: gearsModel,
  corrosion: corrosionModel,
  motor: motorModel,
  shaft: shaftModel,
  spring: springModel,
};

export const LAB_IDS = Object.keys(LAB_MODELS) as LabId[];
