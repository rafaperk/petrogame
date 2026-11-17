/** Bancada no modo livre: o jogador mexe à vontade, com experimentos sugeridos. */
import { sfx } from '../../core/audio';
import { content } from '../../learning/content';
import { LAB_MODELS } from '../../learning/labs';
import { withDefaults } from '../../learning/labs/model';
import type { LabGame, LabId, LabValues, Topic } from '../../learning/types';
import { h, md } from '../dom';
import { isCancelKey, ui } from '../UI';
import { mountBench } from './bench';

export interface OpenLabOptions {
  preset?: LabValues;
  topic?: Topic;
}

export function openLab(labId: LabId, opts: OpenLabOptions = {}): Promise<void> {
  const model = LAB_MODELS[labId];
  const subject = opts.topic ? content.subjectById.get(opts.topic.subjectId) : undefined;
  return new Promise((resolve) => {
    const body = h('div', { class: 'lab-body' });
    const close = h('button', { class: 'btn-close', title: 'Fechar (Esc)', text: '✕', on: { click: () => finish() } });
    const panel = h('div', { class: 'panel modal labmodal', style: `--accent:${subject?.color ?? '#4a74b8'}` }, [
      h('header', { class: 'modal-head' }, [h('span', { class: 'chip', text: '🔬 Bancada' }), h('h2', { text: `${model.icon} ${model.name}` }), close]),
      body,
    ]);
    body.append(h('div', { class: 'lab-summary md', html: md(model.summary) }));
    const bench = mountBench(body, labId, { values: opts.preset });
    const note = h('div', { class: 'lab-note callout tip' });
    const buttons = model.experiments.map((ex, i) => h('button', { class: 'btn small ghost', text: ex.label, on: { click: () => run(i) } }));
    body.append(
      h('div', { class: 'lab-explore' }, [
        h('b', { text: '🧪 Experimente:' }),
        ...buttons,
        h('button', { class: 'btn small ghost', text: '↺ Padrão', title: 'Volta todos os controles ao padrão', on: { click: () => run(-1) } }),
      ]),
      note,
    );

    function run(i: number): void {
      sfx.select();
      buttons.forEach((b, j) => b.classList.toggle('active', j === i));
      if (i < 0) {
        bench.set(withDefaults(model), true);
        note.innerHTML = '';
        return;
      }
      const ex = model.experiments[i];
      bench.set(withDefaults(model, ex.preset), true);
      note.innerHTML = md(`**${ex.label}:** ${ex.text}`);
    }

    const wrap = h('div', { class: 'layer layer-modal' }, [panel]);
    const layer = ui.push(wrap, {
      onKey: (e) => {
        if (isCancelKey(e)) {
          finish();
          return true;
        }
        return false;
      },
    });
    function finish(): void {
      bench.destroy();
      ui.remove(layer);
      resolve();
    }
  });
}

/** Bancadas ligadas a um tópico (pelos jogos do tipo bancada e pelos cards da lição). */
export function topicLabs(topic: Topic): { id: LabId; preset?: LabValues }[] {
  const seen = new Map<LabId, LabValues | undefined>();
  for (const g of topic.games) if (g.type === 'lab' && !seen.has(g.lab)) seen.set(g.lab, undefined);
  for (const card of topic.lesson) if (card.lab && !seen.has(card.lab.lab)) seen.set(card.lab.lab, card.lab.preset);
  return [...seen].map(([id, preset]) => ({ id, preset }));
}

export const labName = (id: LabId) => `${LAB_MODELS[id].icon} ${LAB_MODELS[id].name}`;
export type { LabGame };
