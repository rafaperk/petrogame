/**
 * Bancadas: modelos físicos puros (sem DOM), testados em tests/labs.test.ts.
 * Cada modelo declara seus controles (`params`), suas leituras (`outputs`) e a conta (`compute`).
 * O desenho/animação de cada bancada fica em ui/labs/.
 */
import type { LabId, LabValues } from '../types';

export interface LabParam {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
  digits?: number;
  /** Opções discretas (botões). O valor é o índice da opção. */
  choices?: string[];
  /** Ajuda curta (aparece ao passar o mouse). */
  help?: string;
  /** Só aparece quando faz sentido (ex.: o expoente n só no processo politrópico). */
  show?: (v: LabValues) => boolean;
}

export interface LabOutput {
  id: string;
  label: string;
  unit?: string;
  digits?: number;
  /** Não aparece na tabela de leituras (serve para metas e para o desenho). */
  hidden?: boolean;
  /** Só aparece na tabela quando faz sentido (ex.: razão de corte só no Diesel). */
  show?: (v: LabValues) => boolean;
}

/** Experimento sugerido no modo livre. */
export interface LabExperiment {
  label: string;
  preset: LabValues;
  text: string;
}

export interface LabModel {
  id: LabId;
  name: string;
  icon: string;
  /** O que dá para ver nesta bancada (aparece no topo do modo livre). */
  summary: string;
  params: LabParam[];
  outputs: LabOutput[];
  compute: (p: LabValues) => Record<string, number>;
  experiments: LabExperiment[];
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Interpolação linear numa tabela [x, y] (x crescente). */
export function interp(table: readonly (readonly [number, number])[], x: number): number {
  if (x <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    const [x1, y1] = table[i];
    if (x <= x1) {
      const [x0, y0] = table[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return table[table.length - 1][1];
}

/** Valores padrão do modelo, sobrescritos por `values`. */
export function withDefaults(model: LabModel, values?: LabValues): LabValues {
  const out: LabValues = {};
  for (const p of model.params) out[p.id] = values?.[p.id] ?? p.default;
  return out;
}

/** A leitura `o[g.out]` está dentro da faixa da meta? */
export function goalMet(g: { out: string; min?: number; max?: number }, o: Record<string, number>): boolean {
  const v = o[g.out];
  return Number.isFinite(v) && (g.min === undefined || v >= g.min) && (g.max === undefined || v <= g.max);
}

/** Arredonda ao passo do controle e respeita o intervalo. */
export function snap(param: LabParam, v: number): number {
  const s = Math.round((v - param.min) / param.step) * param.step + param.min;
  return clamp(Number(s.toFixed(6)), param.min, param.max);
}
