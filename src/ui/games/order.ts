/**
 * Procedimento: monte a sequência escolhendo sempre o PRÓXIMO passo.
 * Cada passo colocado mostra o porquê de estar ali — o objetivo é entender a lógica, não decorar.
 */
import { GAMES } from '../../config';
import { sfx } from '../../core/audio';
import { shuffle } from '../../core/rng';
import { byLevel, gameLevel, type GameOutcome, type GameResult } from '../../learning/games';
import type { OrderGame } from '../../learning/types';
import { h } from '../dom';
import { GameShell, mdInline, statChips, type GameContext } from './shell';

const LETTERS = 'ABCDEFGHIJKL';

export async function playOrder(game: OrderGame, ctx: GameContext): Promise<GameOutcome | null> {
  const shell = new GameShell(game, ctx);
  if (!(await shell.intro('Teclas: **A–L** escolhem o próximo passo (ou clique).'))) {
    shell.close();
    return null;
  }

  const steps = game.steps;
  const hintAfter = byLevel(GAMES.orderHintAfter, gameLevel(game.id));
  let pool = shuffle(steps.map((_, i) => i));
  // evita começar já na ordem certa
  if (pool.every((v, i) => v === i) && pool.length > 1) pool = [...pool.slice(1), pool[0]];
  const letterOf = new Map(pool.map((stepIndex, pos) => [stepIndex, LETTERS[pos]]));
  const attempts = new Array(steps.length).fill(0);
  let next = 0;
  let mistakes = 0;
  let streak = 0;
  let bestStreak = 0;
  const startedAt = Date.now();

  const seq = h('ol', { class: 'og-seq' });
  const poolEl = h('div', { class: 'og-pool' });
  const message = h('div', { class: 'mg-message', text: 'Qual é o primeiro passo?' });
  shell.body.innerHTML = '';
  shell.body.append(h('div', { class: 'og-board' }, [h('h4', { text: 'Sequência' }), seq, message, h('h4', { text: 'Passos disponíveis' }), poolEl]));
  shell.actions.innerHTML = '';
  shell.actions.append(h('span', { class: 'muted small', text: 'Leia o porquê de cada passo: é a lógica que cai na prova.' }));

  const renderStats = () => {
    shell.stats.innerHTML = '';
    shell.stats.append(...statChips([['📋', `${next}/${steps.length}`], ['✘', String(mistakes)], ['🔥', String(streak)]]));
  };

  const renderSeq = () => {
    seq.innerHTML = '';
    for (let i = 0; i < next; i++) {
      const s = steps[i];
      seq.append(
        h('li', { class: `og-step placed${attempts[i] ? ' had-error' : ''}` }, [
          h('span', { class: 'og-num', text: String(i + 1) }),
          h('div', {}, [h('div', { html: mdInline(s.text) }), s.why ? h('small', { class: 'og-why', html: mdInline(s.why) }) : null]),
        ]),
      );
    }
    if (next < steps.length) seq.append(h('li', { class: 'og-step slot' }, [h('span', { class: 'og-num', text: String(next + 1) }), h('div', { text: '?' })]));
    seq.lastElementChild?.scrollIntoView({ block: 'nearest' });
  };

  const buttons = new Map<number, HTMLButtonElement>();
  const renderPool = () => {
    poolEl.innerHTML = '';
    buttons.clear();
    for (const stepIndex of pool) {
      const btn = h('button', {
        class: 'og-option',
        html: `<span class="mg-key">${letterOf.get(stepIndex)}</span><span>${mdInline(steps[stepIndex].text)}</span>`,
        on: { click: () => pick(stepIndex) },
      });
      buttons.set(stepIndex, btn);
      poolEl.append(btn);
    }
  };

  let over = false;
  let finish: () => void = () => {};
  const pick = (stepIndex: number) => {
    if (over || !pool.includes(stepIndex)) return;
    if (stepIndex === next) {
      pool = pool.filter((i) => i !== stepIndex);
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
      next += 1;
      sfx.correct();
      message.className = 'mg-message good';
      message.textContent = next < steps.length ? `✔ Isso! Qual é o passo ${next + 1}?` : '✔ Procedimento completo!';
      renderSeq();
      renderPool();
      renderStats();
      if (next >= steps.length) window.setTimeout(finish, 700);
      return;
    }
    attempts[next] += 1;
    mistakes += 1;
    streak = 0;
    sfx.wrong();
    const btn = buttons.get(stepIndex);
    if (btn) {
      btn.classList.remove('wrong');
      void btn.offsetWidth;
      btn.classList.add('wrong');
    }
    message.className = 'mg-message bad';
    const later = stepIndex > next;
    message.textContent = later
      ? `✘ Ainda não: esse passo vem depois. O que precisa acontecer antes dele?`
      : `✘ Esse passo não é o ${next + 1}º.`;
    if (hintAfter && attempts[next] >= hintAfter) {
      buttons.get(next)?.classList.add('hint');
      message.textContent += ' Dica: o próximo passo está destacado.';
    }
    renderStats();
  };

  return new Promise<GameOutcome | null>((resolve) => {
    shell.playing = true;
    shell.onQuit = () => {
      over = true;
      shell.close();
      resolve(null);
    };

    const finishImpl = async () => {
      if (over) return;
      over = true;
      shell.setKeys(null);
      const result: GameResult = {
        total: steps.length,
        correctFirstTry: attempts.filter((n) => n === 0).length,
        mistakes,
        bestStreak,
        durationMs: Date.now() - startedAt,
        completed: true,
        missed: steps.flatMap((s, i) => (attempts[i] ? [{ text: s.text, answer: `${i + 1}º passo`, why: s.why }] : [])),
      };
      const outcome = ctx.finish(result);
      const all = h('div', { class: 'game-all' }, [
        h('h4', { text: 'Sequência correta' }),
        h(
          'ol',
          { class: 'og-seq compact' },
          steps.map((s, i) => h('li', { class: 'og-step placed' }, [h('span', { class: 'og-num', text: String(i + 1) }), h('div', {}, [h('div', { html: mdInline(s.text) }), s.why ? h('small', { class: 'og-why', html: mdInline(s.why) }) : null])])),
        ),
      ]);
      await shell.summary(result, outcome, all);
      shell.close();
      resolve(outcome);
    };
    finish = () => void finishImpl();

    shell.setKeys((e) => {
      const letter = /^Key([A-L])$/.exec(e.code);
      if (letter) {
        const stepIndex = [...letterOf.entries()].find(([, l]) => l === letter[1])?.[0];
        if (stepIndex !== undefined) pick(stepIndex);
        return true;
      }
      return false;
    });
    renderSeq();
    renderPool();
    renderStats();
  });

}
