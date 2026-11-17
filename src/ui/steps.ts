/**
 * Roteiro passo a passo de uma questão. Cada passo aparece primeiro só com o "o que fazer"; a conta ou o
 * raciocínio daquele passo fica oculto até o jogador pedir ("Conferir"). Os passos seguintes nem aparecem:
 * dá para destravar só o passo em que você travou e tentar o resto sozinho.
 */
import { sfx } from '../core/audio';
import type { Solve } from '../learning/content';
import { h, md } from './dom';

export interface StepsBox {
  el: HTMLElement;
  /** Abre o próximo passo (só a pista). false = já estavam todos abertos. */
  next(): boolean;
  /** Mostra a resolução do último passo aberto ainda oculto. false = nada para mostrar. */
  reveal(): boolean;
  /** Abre e mostra tudo. */
  showAll(): void;
  /** Mostra o "Como reconhecer" (no feedback, para treinar o reconhecimento do tipo). */
  setShowWhen(on: boolean): void;
  readonly opened: number;
  readonly complete: boolean;
}

const inlineMd = (text: string) => md(text).replace(/^<p>|<\/p>$/g, '');

export function stepsBox(solve: Solve, opts: { onChange?: () => void } = {}): StepsBox {
  const { roteiro, steps } = solve;
  const total = steps.length;
  let opened = 0;
  const revealed = steps.map(() => false);
  let showWhen = false;

  const el = h('div', { class: 'steps' });
  const isComplete = () => opened === total && revealed.every(Boolean);

  const use = () => opts.onChange?.();

  const render = () => {
    el.innerHTML = '';
    el.append(
      h('div', { class: 'steps-head' }, [
        h('span', { class: 'steps-icon', text: '🧭' }),
        h('div', { class: 'steps-title' }, [h('small', { text: roteiro ? 'Roteiro' : 'Resolução' }), h('b', { text: roteiro?.name ?? 'Passo a passo' })]),
        h('span', { class: 'steps-count', text: opened ? `passo ${opened} de ${total}` : `${total} passos` }),
      ]),
    );
    if (showWhen && roteiro?.when) el.append(h('div', { class: 'steps-when md', html: md(`🔎 **Como reconhecer:** ${roteiro.when}`) }));

    const list = h('ol', { class: 'steps-list' });
    for (let i = 0; i < opened; i++) {
      const li = h('li', { class: `step${revealed[i] ? ' revealed' : ''}` }, [h('div', { class: 'step-do', html: inlineMd(steps[i].do) })]);
      if (revealed[i]) li.append(h('div', { class: 'step-show md', html: md(steps[i].show) }));
      else
        li.append(
          h('button', {
            class: 'link step-reveal',
            html: `👁 Conferir este passo${i === opened - 1 ? ' <kbd>V</kbd>' : ''}`,
            on: { click: () => revealAt(i) },
          }),
        );
      list.append(li);
    }
    if (opened < total) {
      list.append(
        h('li', { class: 'step step-locked' }, [
          h('span', { text: opened ? `🔒 Passo ${opened + 1}: tente sozinho — abra se travar.` : '🔒 Abra o primeiro passo quando quiser ajuda.' }),
        ]),
      );
    }
    el.append(list);

    if (!isComplete()) {
      el.append(
        h('div', { class: 'steps-actions' }, [
          opened < total ? h('button', { class: 'btn small', html: `${opened ? 'Próximo passo' : 'Abrir o 1º passo'} <kbd>P</kbd>`, on: { click: () => void next() } }) : null,
          h('button', { class: 'btn small ghost', html: 'Mostrar tudo <kbd>T</kbd>', on: { click: () => showAll() } }),
        ]),
      );
    } else if (roteiro?.note) {
      el.append(h('div', { class: 'steps-note md', html: md(`📌 **Para as próximas:** ${roteiro.note}`) }));
    }
  };

  const scrollTo = (target: Element | null) => target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const next = (): boolean => {
    if (opened >= total) return false;
    opened += 1;
    sfx.page();
    render();
    use();
    scrollTo(el.querySelector('.step-locked') ?? el.querySelector('.steps-actions') ?? el.lastElementChild);
    return true;
  };

  const revealAt = (i: number) => {
    if (i >= opened || revealed[i]) return;
    revealed[i] = true;
    sfx.toggle();
    render();
    use();
    scrollTo(el.querySelectorAll('.step')[i] ?? null);
  };

  const reveal = (): boolean => {
    for (let i = opened - 1; i >= 0; i--) {
      if (!revealed[i]) {
        revealAt(i);
        return true;
      }
    }
    return false;
  };

  const showAll = () => {
    if (isComplete()) return;
    opened = total;
    revealed.fill(true);
    sfx.page();
    render();
    use();
  };

  render();
  return {
    el,
    next,
    reveal,
    showAll,
    setShowWhen(on: boolean) {
      showWhen = on;
      render();
    },
    get opened() {
      return opened;
    },
    get complete() {
      return isComplete();
    },
  };
}
