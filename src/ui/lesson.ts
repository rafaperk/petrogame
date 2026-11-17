/** Visualizador de lições: cards curtos com explicação, exemplo, macete e pegadinha da banca. */
import { sfx } from '../core/audio';
import { content } from '../learning/content';
import type { Topic } from '../learning/types';
import { h, md } from './dom';
import { openLab } from './labs';
import { isCancelKey, ui } from './UI';

export interface LessonOptions {
  startAt?: number;
  /** Texto do botão no último card. */
  finishLabel?: string;
}

export function showLesson(topic: Topic, opts: LessonOptions = {}): Promise<'done' | 'closed'> {
  const subject = content.subjectById.get(topic.subjectId);
  const cards = topic.lesson;
  let index = Math.min(Math.max(0, opts.startAt ?? 0), cards.length - 1);

  return new Promise((resolve) => {
    const article = h('article', { class: 'lesson-card' });
    const dots = h('div', { class: 'lesson-dots' });
    const counter = h('span', { class: 'lesson-count' });
    const prev = h('button', { class: 'btn ghost', text: '← Anterior', on: { click: () => go(index - 1) } });
    const next = h('button', { class: 'btn primary', on: { click: () => go(index + 1) } });
    const close = h('button', { class: 'btn-close', title: 'Fechar (Esc)', text: '✕', on: { click: () => finish('closed') } });

    const panel = h('div', { class: 'panel modal lesson', style: `--accent:${subject?.color ?? '#4a74b8'}` }, [
      h('header', { class: 'modal-head' }, [
        h('span', { class: 'chip', text: `${subject?.icon ?? '📘'} ${subject?.short ?? ''}` }),
        h('h2', { text: topic.name }),
        close,
      ]),
      dots,
      article,
      h('footer', { class: 'modal-foot' }, [prev, counter, next]),
    ]);
    const wrap = h('div', { class: 'layer layer-modal' }, [panel]);

    const render = () => {
      const card = cards[index];
      article.innerHTML = '';
      const callout = (cls: string, label: string, text?: string) =>
        text ? h('div', { class: `callout ${cls}` }, [h('b', { text: label }), h('div', { class: 'md', html: md(text) })]) : null;
      const parts: (HTMLElement | null)[] = [
        h('h3', { text: card.title }),
        h('div', { class: 'md', html: md(card.body) }),
        callout('example', '✍️ Exemplo', card.example),
        callout('hot', '🔥 Sempre cai', card.hot),
        callout('tip', '💡 Macete', card.tip),
        callout('trap', '⚠️ Pegadinha da banca', card.trap),
        card.lab
          ? h('button', {
              class: 'btn lab-link',
              html: `🔬 ${card.lab.label ?? 'Ver na bancada'} <kbd>B</kbd>`,
              on: { click: () => void openCardLab() },
            })
          : null,
      ];
      article.append(...parts.filter((p): p is HTMLElement => p !== null));
      article.scrollTop = 0;
      dots.innerHTML = '';
      cards.forEach((_, i) => dots.append(h('span', { class: i === index ? 'on' : i < index ? 'seen' : '' })));
      counter.textContent = `${index + 1} / ${cards.length}`;
      prev.disabled = index === 0;
      next.textContent = index === cards.length - 1 ? (opts.finishLabel ?? 'Concluir ✓') : 'Próximo →';
    };

    const go = (i: number) => {
      if (i < 0) return;
      if (i >= cards.length) {
        finish('done');
        return;
      }
      index = i;
      sfx.page();
      render();
    };

    let labOpen = false;
    const openCardLab = async () => {
      const link = cards[index].lab;
      if (!link || labOpen) return;
      labOpen = true;
      sfx.confirm();
      await openLab(link.lab, { preset: link.preset, topic });
      labOpen = false;
    };

    const finish = (result: 'done' | 'closed') => {
      ui.remove(layer);
      resolve(result);
    };

    const layer = ui.push(wrap, {
      onKey: (e) => {
        if (e.code === 'KeyB' && cards[index].lab) {
          void openCardLab();
          return true;
        }
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          go(index - 1);
          return true;
        }
        if (['ArrowRight', 'KeyD', 'Enter', 'Space', 'NumpadEnter'].includes(e.code)) {
          if (!e.repeat) go(index + 1);
          return true;
        }
        if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
          article.scrollBy({ top: e.code === 'ArrowDown' ? 60 : -60 });
          return true;
        }
        if (isCancelKey(e)) {
          finish('closed');
          return true;
        }
        return false;
      },
    });
    render();
  });
}
