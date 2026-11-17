/**
 * Ajudantes para questões de cálculo com valores sorteados (`type: 'gen'`).
 *
 * A ideia: em vez de decorar "a resposta da questão 7", você aplica o método com números novos a cada vez.
 * Os distratores representam ERROS TÍPICOS (esquecer uma conversão, usar °C em vez de K...) e cada um
 * explica o erro — assim o feedback mostra exatamente onde o raciocínio escorregou.
 */
import { mulberry32 } from '../core/rng';
import type { ChoiceOption, MultipleChoiceQuestion, Question, StaticQuestion } from './types';

export type Rng = () => number;

/** Sorteia um elemento da lista. */
export function pickOne<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** Inteiro em [min, max], de `step` em `step`. */
export function pickInt(rng: Rng, min: number, max: number, step = 1): number {
  const n = Math.floor((max - min) / step) + 1;
  return min + Math.floor(rng() * n) * step;
}

const formatters = new Map<number, Intl.NumberFormat>();

/** Formata no padrão brasileiro: 1234.5 → "1.234,5". `digits` = casas decimais máximas. */
export function fmt(value: number, digits = 2): string {
  const v = Math.abs(value) < 1e-12 ? 0 : value;
  let f = formatters.get(digits);
  if (!f) {
    f = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits });
    formatters.set(digits, f);
  }
  return f.format(v).replace(/^-/, '−');
}

/** Arredonda para `n` algarismos significativos (0,042137 → 0,0421). */
export function sig(value: number, n = 3): number {
  if (value === 0 || !Number.isFinite(value)) return value;
  const magnitude = Math.ceil(Math.log10(Math.abs(value)));
  const m = 10 ** (n - magnitude);
  return Math.round(value * m) / m;
}

export interface NumericChoice {
  value: number;
  /** Qual erro leva a este valor (ex.: "Esqueceu de converter m³/h para m³/s"). */
  why: string;
}

/**
 * Monta alternativas numéricas no estilo da prova: valores em ordem crescente, a correta e distratores
 * que representam erros típicos. Repetidos (ou iguais à resposta, depois de arredondar) são descartados;
 * se faltar alternativa, completa com valores próximos.
 */
export function numericOptions(opts: {
  correct: number;
  correctWhy: string;
  distractors: NumericChoice[];
  unit?: string;
  /** Casas decimais exibidas (padrão 2). */
  digits?: number;
  /** Total de alternativas (padrão 5). */
  count?: number;
}): { options: ChoiceOption[]; answer: number } {
  const digits = opts.digits ?? 2;
  const count = opts.count ?? 5;
  const label = (v: number) => `${fmt(v, digits)}${opts.unit ? ` ${opts.unit}` : ''}`;
  const chosen = [{ value: opts.correct, text: label(opts.correct), why: opts.correctWhy, correct: true }];
  const seen = new Set([chosen[0].text]);
  const push = (value: number, why: string) => {
    if (chosen.length >= count || !Number.isFinite(value)) return;
    const text = label(value);
    if (seen.has(text)) return;
    seen.add(text);
    chosen.push({ value, text, why, correct: false });
  };
  for (const d of opts.distractors) push(d.value, d.why);
  for (const f of [1.5, 1 / 1.5, 2, 0.5, 3, 1 / 3, 1.25, 0.8, 4, 0.25]) {
    push(opts.correct * f, 'Valor sem relação com o método correto — refaça a conta passo a passo.');
  }
  chosen.sort((a, b) => a.value - b.value);
  return {
    options: chosen.map((c) => ({ text: c.text, why: c.why })),
    answer: chosen.findIndex((c) => c.correct),
  };
}

/** Transforma a questão em algo exibível: questões geradas ganham números novos a partir de `seed`. */
export function materialize(q: Question, seed: number): StaticQuestion {
  if (q.type !== 'gen') return q;
  const inst = q.generate(mulberry32(seed >>> 0));
  const mc: MultipleChoiceQuestion = {
    id: q.id,
    type: 'mc',
    difficulty: q.difficulty,
    prompt: inst.prompt,
    options: inst.options,
    answer: inst.answer,
    explanation: inst.explanation,
    hint: inst.hint,
    roteiro: q.roteiro,
    steps: inst.steps,
    lessonRef: q.lessonRef,
    source: q.source,
    tags: q.tags,
    shuffle: inst.shuffle ?? false,
  };
  return mc;
}
