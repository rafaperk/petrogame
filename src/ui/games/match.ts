/**
 * Conexões: ligue cada termo (esquerda) à definição certa (direita).
 * Um par só conta como "acerto de primeira" se o termo não tiver sido ligado errado antes.
 */
import { GAMES } from '../../config';
import { sfx } from '../../core/audio';
import { shuffle } from '../../core/rng';
import { byLevel, gameLevel, type GameOutcome, type GameResult } from '../../learning/games';
import type { MatchGame, MatchPair } from '../../learning/types';
import { h } from '../dom';
import { GameShell, mdInline, statChips, type GameContext } from './shell';

const LETTERS = 'ABCDEFGHIJ';
const PAIR_COLORS = ['#3a9a5c', '#4a74b8', '#c9733a', '#8a63d2', '#2a9d8f', '#c2523f', '#b8860b', '#5d6d7e', '#d0688f', '#3f8f8c'];

export async function playMatch(game: MatchGame, ctx: GameContext): Promise<GameOutcome | null> {
  const shell = new GameShell(game, ctx);
  if (!(await shell.intro('Teclas: **1–9** escolhem um termo e **A–J** uma definição (ou clique).'))) {
    shell.close();
    return null;
  }

  const pairs: MatchPair[] = shuffle(game.pairs).slice(0, Math.min(game.pairs.length, byLevel(GAMES.matchPairs, gameLevel(game.id))));
  const rightOrder = shuffle(pairs.map((_, i) => i));
  const wrongTries = new Array(pairs.length).fill(0);
  const matched = new Set<number>();
  let selLeft: number | null = null;
  let selRight: number | null = null;
  let mistakes = 0;
  let streak = 0;
  let bestStreak = 0;
  const startedAt = Date.now();

  let pickLeft: (i: number) => void = () => {};
  let pickRight: (pos: number) => void = () => {};
  const leftCards = pairs.map((p, i) =>
    h('button', { class: 'mg-card left', html: `<span class="mg-key">${i + 1}</span><span>${mdInline(p.left)}</span>`, on: { click: () => pickLeft(i) } }),
  );
  const rightCards = rightOrder.map((pairIndex, pos) =>
    h('button', {
      class: 'mg-card right',
      html: `<span class="mg-key">${LETTERS[pos]}</span><span>${mdInline(pairs[pairIndex].right)}</span>`,
      on: { click: () => pickRight(pos) },
    }),
  );
  const message = h('div', { class: 'mg-message', text: 'Escolha um termo e depois a definição que combina com ele.' });
  shell.body.innerHTML = '';
  shell.body.append(
    h('div', { class: 'mg-board' }, [
      h('div', { class: 'mg-col' }, [h('h4', { text: game.leftLabel ?? 'Termo' }), ...leftCards]),
      h('div', { class: 'mg-col' }, [h('h4', { text: game.rightLabel ?? 'Definição' }), ...rightCards]),
    ]),
    message,
  );
  shell.actions.innerHTML = '';
  shell.actions.append(h('span', { class: 'muted small', text: 'Errar não tem problema — mas cada erro pesa na nota da revisão.' }));

  const renderStats = () => {
    shell.stats.innerHTML = '';
    shell.stats.append(...statChips([['🔗', `${matched.size}/${pairs.length}`], ['✘', String(mistakes)], ['🔥', String(streak)]]));
  };
  const renderSelection = () => {
    leftCards.forEach((c, i) => c.classList.toggle('selected', selLeft === i));
    rightCards.forEach((c, pos) => c.classList.toggle('selected', selRight === pos));
  };

  return new Promise<GameOutcome | null>((resolve) => {
    let over = false;
    shell.playing = true;
    shell.onQuit = () => {
      over = true;
      shell.close();
      resolve(null);
    };

    const tryMatch = () => {
      if (selLeft === null || selRight === null) return;
      const left = selLeft;
      const pos = selRight;
      const pairIndex = rightOrder[pos];
      selLeft = selRight = null;
      if (pairIndex === left) {
        matched.add(left);
        streak += 1;
        bestStreak = Math.max(bestStreak, streak);
        const color = PAIR_COLORS[matched.size % PAIR_COLORS.length];
        for (const card of [leftCards[left], rightCards[pos]]) {
          card.classList.remove('wrong', 'selected');
          card.classList.add('matched');
          card.style.setProperty('--pair', color);
          card.disabled = true;
        }
        sfx.correct();
        message.innerHTML = mdInline(`✔ **${pairs[left].left}** ↔ ${pairs[left].right}${pairs[left].why ? ` — ${pairs[left].why}` : ''}`);
        message.className = 'mg-message good';
        renderSelection();
        renderStats();
        if (matched.size === pairs.length) window.setTimeout(finish, 600);
        return;
      }
      wrongTries[left] += 1;
      mistakes += 1;
      streak = 0;
      sfx.wrong();
      for (const card of [leftCards[left], rightCards[pos]]) {
        card.classList.remove('wrong');
        void card.offsetWidth;
        card.classList.add('wrong');
        // o vermelho é só um aviso: some depois do "tremido"
        window.setTimeout(() => card.classList.remove('wrong'), 700);
      }
      message.innerHTML = mdInline(`✘ Não combina: «${pairs[pairIndex].right}» não é de **${pairs[left].left}**. Tente outra.`);
      message.className = 'mg-message bad';
      renderSelection();
      renderStats();
    };

    pickLeft = (i: number) => {
      if (over || i >= pairs.length || matched.has(i)) return;
      selLeft = selLeft === i ? null : i;
      sfx.select();
      renderSelection();
      tryMatch();
    };
    pickRight = (pos: number) => {
      if (over || pos >= pairs.length || matched.has(rightOrder[pos])) return;
      selRight = selRight === pos ? null : pos;
      sfx.select();
      renderSelection();
      tryMatch();
    };

    const finish = async () => {
      if (over) return;
      over = true;
      shell.setKeys(null);
      const result: GameResult = {
        total: pairs.length,
        correctFirstTry: wrongTries.filter((n) => n === 0).length,
        mistakes,
        bestStreak,
        durationMs: Date.now() - startedAt,
        completed: true,
        missed: pairs.filter((_, i) => wrongTries[i] > 0).map((p) => ({ text: p.left, answer: p.right, why: p.why })),
      };
      const outcome = ctx.finish(result);
      const all = h('div', { class: 'game-all' }, [
        h('h4', { text: 'Todos os pares' }),
        h(
          'ul',
          { class: 'why-list' },
          pairs.map((p) => h('li', { class: 'why-correct' }, [h('b', { html: mdInline(p.left) }), h('span', { html: ` → ${mdInline(p.right)}` }), p.why ? h('div', { class: 'why-text', html: mdInline(p.why) }) : null])),
        ),
      ]);
      await shell.summary(result, outcome, all);
      shell.close();
      resolve(outcome);
    };

    shell.setKeys((e) => {
      const digit = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
      if (digit) {
        pickLeft(Number(digit[1]) - 1);
        return true;
      }
      const letter = /^Key([A-J])$/.exec(e.code);
      if (letter) {
        pickRight(LETTERS.indexOf(letter[1]));
        return true;
      }
      return false;
    });
    renderStats();
  });
}
