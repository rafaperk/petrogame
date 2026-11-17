/**
 * Valida todo o conteúdo cadastrado. Rode `npm test` sempre que adicionar matérias, tópicos, questões ou jogos.
 */
import { describe, expect, it } from 'vitest';
import { CARGO } from '../src/content/cargo';
import { npcById } from '../src/game/npcs';
import { content, stepProblems } from '../src/learning/content';
import { materialize } from '../src/learning/gen';
import { isTrueFalse } from '../src/learning/types';
import { refinaria } from '../src/world/maps/refinaria';
import { vila } from '../src/world/maps/vila';

const SEEDS = 300;

describe('conteúdo', () => {
  it('não tem erros de validação', () => {
    expect(content.errors).toEqual([]);
  });

  it('cada matéria tem um mentor existente', () => {
    for (const subject of content.subjects) {
      expect(npcById.has(subject.mentorId), `mentor "${subject.mentorId}" de ${subject.id}`).toBe(true);
      expect(npcById.get(subject.mentorId)?.subjectId, `o mentor ${subject.mentorId} deve apontar para ${subject.id}`).toBe(subject.id);
    }
  });

  it('cada tópico tem lição, questão de nível 1 e itens do edital', () => {
    for (const subject of content.subjects) {
      for (const topic of subject.topics) {
        expect(topic.lesson.length, topic.id).toBeGreaterThan(0);
        expect(topic.questions.some((q) => q.difficulty === 1), `${topic.id} precisa de ao menos uma questão básica`).toBe(true);
        expect(topic.edital.length, `${topic.id} deve indicar quais itens do edital cobre`).toBeGreaterThan(0);
      }
    }
  });

  it('alternativas de múltipla escolha não se repetem', () => {
    for (const { question } of content.questionById.values()) {
      if (isTrueFalse(question) || question.type === 'gen') continue;
      const texts = question.options.map((o) => o.text.trim().toLowerCase());
      expect(new Set(texts).size, question.id).toBe(texts.length);
    }
  });

  it(`questões geradas são válidas em ${SEEDS} sorteios`, () => {
    for (const { question, topic } of content.questionById.values()) {
      if (question.type !== 'gen') continue;
      for (let seed = 1; seed <= SEEDS; seed++) {
        const q = materialize(question, seed * 7919);
        if (isTrueFalse(q)) throw new Error(`${question.id}: gerador deve produzir múltipla escolha`);
        const where = `${question.id} (semente ${seed})`;
        expect(q.options.length, `${where}: precisa de 4 ou 5 alternativas`).toBeGreaterThanOrEqual(4);
        expect(q.options.length, where).toBeLessThanOrEqual(5);
        expect(q.answer, where).toBeGreaterThanOrEqual(0);
        expect(q.answer, where).toBeLessThan(q.options.length);
        const texts = q.options.map((o) => o.text);
        expect(new Set(texts).size, `${where}: alternativas repetidas ${JSON.stringify(texts)}`).toBe(texts.length);
        const all = [q.prompt, q.explanation, ...texts, ...q.options.map((o) => o.why ?? '')].join(' ');
        expect(all, `${where}: número inválido no texto`).not.toMatch(/NaN|Infinity|undefined/);
        expect(q.options[q.answer].why, `${where}: a correta precisa de explicação`).toBeTruthy();
        expect(stepProblems(q, topic), `${where}: passos do roteiro`).toEqual([]);
      }
    }
  }, 120_000);

  it('toda questão tem resolução passo a passo (roteiro)', () => {
    const missing: string[] = [];
    for (const { question } of content.questionById.values()) {
      const q = materialize(question, 7919);
      if (!q.roteiro || !q.steps || q.steps.length < 2) missing.push(question.id);
    }
    expect(missing, 'questões sem roteiro ou com menos de 2 passos').toEqual([]);
  });

  it('jogos têm conteúdo suficiente para uma rodada', () => {
    for (const { game } of content.gameById.values()) {
      if (game.type === 'sort') expect(game.items.length, game.id).toBeGreaterThanOrEqual(Math.min(game.perRound ?? 4, 4));
      if (game.type === 'match') expect(game.pairs.length, game.id).toBeGreaterThanOrEqual(3);
      if (game.type === 'order') expect(game.steps.length, game.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('as matérias do edital somam as questões da prova', () => {
    for (const part of CARGO.parts) {
      const total = content.subjects.filter((s) => s.exam?.part === part.id).reduce((sum, s) => sum + (s.exam?.questions ?? 0), 0);
      expect(total, part.name).toBe(part.questions);
    }
  });
});

describe('mapas', () => {
  it('as linhas de cada mapa têm o mesmo tamanho', () => {
    for (const map of [vila, refinaria]) {
      const width = map.rows[0].length;
      map.rows.forEach((row, y) => expect(row.length, `${map.id}, linha ${y}`).toBe(width));
    }
  });

  it('passagens levam a mapas existentes e NPCs existem', () => {
    const ids = new Set([vila.id, refinaria.id]);
    for (const map of [vila, refinaria]) {
      for (const w of map.warps ?? []) expect(ids.has(w.to), `${map.id} → ${w.to}`).toBe(true);
      for (const n of map.npcs) expect(npcById.has(n.id), `${map.id}: NPC ${n.id}`).toBe(true);
    }
  });

  it('cabe um equipamento para cada tópico da Refinaria e um canteiro para cada tópico da Horta', () => {
    for (const subject of content.subjects) {
      if (subject.field === 'refinaria') {
        const yard = refinaria.yards?.find((y) => y.subjectId === subject.id);
        expect(yard, `pátio da matéria ${subject.id} em maps/refinaria.ts`).toBeTruthy();
        expect(subject.topics.length, `${subject.id}: tópicos demais para o pátio`).toBeLessThanOrEqual(yard!.cols * yard!.rows);
      } else {
        expect(subject.topics.length, `${subject.id}: tópicos demais para a fileira da horta`).toBeLessThanOrEqual(vila.garden!.cols);
      }
    }
    const hortaSubjects = content.subjects.filter((s) => s.field === 'horta').length;
    expect(hortaSubjects).toBeLessThanOrEqual(vila.garden!.rows);
  });
});
