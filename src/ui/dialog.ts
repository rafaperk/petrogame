/** Caixa de diálogo com efeito de digitação, retrato do NPC e escolhas. */
import { sfx } from '../core/audio';
import { state } from '../core/state';
import { h, md, typewriter } from './dom';
import { isCancelKey, isConfirmKey, ui } from './UI';

export interface Speaker {
  name: string;
  title?: string;
  portrait?: string;
}

const vars = () => ({ nome: state.data.player.name });

function buildBox(speaker: Speaker | null) {
  const text = h('div', { class: 'dlg-text' });
  const choices = h('div', { class: 'dlg-choices' });
  const next = h('div', { class: 'dlg-next', text: '▼' });
  const portrait = speaker?.portrait
    ? h('div', { class: 'dlg-portrait' }, [h('img', { src: speaker.portrait, alt: '' })])
    : null;
  const name = speaker
    ? h('div', { class: 'dlg-name' }, [speaker.name, speaker.title ? h('small', { text: speaker.title }) : null])
    : null;
  const box = h('div', { class: 'dlg panel' }, [portrait, h('div', { class: 'dlg-body' }, [name, text, choices]), next]);
  const wrap = h('div', { class: 'layer layer-dialog' }, [box]);
  return { wrap, box, text, choices, next };
}

/** Mostra uma ou mais falas. Espaço/Enter/E/clique avançam. */
export function say(speaker: Speaker | null, lines: string | string[]): Promise<void> {
  const list = Array.isArray(lines) ? lines : [lines];
  return new Promise((resolve) => {
    const dom = buildBox(speaker);
    let index = 0;
    let tw = typewriter(dom.text, '', 1);
    const show = () => {
      dom.next.classList.remove('ready');
      tw = typewriter(dom.text, md(list[index], vars()), 110, (i) => {
        if (i % 3 === 0) sfx.blip();
      });
      void tw.done.then(() => dom.next.classList.add('ready'));
    };
    const advance = () => {
      if (!tw.finished) {
        tw.finish();
        return;
      }
      index += 1;
      if (index >= list.length) {
        ui.remove(layer);
        resolve();
        return;
      }
      show();
    };
    const layer = ui.push(dom.wrap, {
      onKey: (e) => {
        if (isConfirmKey(e) || isCancelKey(e)) {
          if (!e.repeat) advance();
          return true;
        }
        return false;
      },
    });
    dom.wrap.addEventListener('click', advance);
    show();
  });
}

/** Pergunta com alternativas. Retorna o índice escolhido (ou `cancel` com Esc). */
export function choose(speaker: Speaker | null, text: string, options: string[], opts: { cancel?: number } = {}): Promise<number> {
  return new Promise((resolve) => {
    const dom = buildBox(speaker);
    dom.next.remove();
    let selected = 0;
    let closed = false;
    const tw = typewriter(dom.text, md(text, vars()), 130, (i) => {
      if (i % 3 === 0) sfx.blip();
    });
    const buttons = options.map((label, i) =>
      h('button', {
        class: 'dlg-choice',
        html: `<span class="dlg-key">${i + 1}</span>${md(label, vars()).replace(/^<p>|<\/p>$/g, '')}`,
        on: {
          click: (e) => {
            e.stopPropagation();
            pick(i);
          },
          mouseenter: () => highlight(i),
        },
      }),
    );
    dom.choices.append(...buttons);
    const highlight = (i: number) => {
      selected = (i + buttons.length) % buttons.length;
      buttons.forEach((b, k) => b.classList.toggle('active', k === selected));
    };
    const pick = (i: number) => {
      if (closed) return;
      closed = true;
      tw.finish();
      sfx.confirm();
      ui.remove(layer);
      resolve(i);
    };
    const layer = ui.push(dom.wrap, {
      onKey: (e) => {
        if (e.repeat && isConfirmKey(e)) return true;
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
          highlight(selected - 1);
          sfx.select();
          return true;
        }
        if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          highlight(selected + 1);
          sfx.select();
          return true;
        }
        const digit = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
        if (digit && Number(digit[1]) <= buttons.length) {
          pick(Number(digit[1]) - 1);
          return true;
        }
        if (isConfirmKey(e)) {
          if (!tw.finished) tw.finish();
          else pick(selected);
          return true;
        }
        if (isCancelKey(e) && opts.cancel !== undefined) {
          pick(opts.cancel);
          return true;
        }
        return false;
      },
    });
    dom.wrap.addEventListener('click', () => tw.finish());
    highlight(0);
  });
}

export async function confirmBox(text: string, yes = 'Sim', no = 'Não'): Promise<boolean> {
  return (await choose(null, text, [yes, no], { cancel: 1 })) === 0;
}
