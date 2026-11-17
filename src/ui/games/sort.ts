/**
 * Esteira: itens chegam pela esteira e você manda cada um para a categoria certa antes que passe.
 * Errou (ou deixou passar)? A esteira para e mostra o porquê. Itens errados voltam no fim da rodada.
 */
import { GAMES } from '../../config';
import { sfx } from '../../core/audio';
import { shuffle } from '../../core/rng';
import { byLevel, gameLevel, type GameOutcome, type GameResult, type MissedItem } from '../../learning/games';
import type { SortGame, SortItem } from '../../learning/types';
import { h } from '../dom';
import { GameShell, mdInline, statChips, type GameContext } from './shell';

const ARROWS: Record<number, string[]> = {
  2: ['ArrowLeft', 'ArrowRight'],
  3: ['ArrowLeft', 'ArrowDown', 'ArrowRight'],
};

export async function playSort(game: SortGame, ctx: GameContext): Promise<GameOutcome | null> {
  const shell = new GameShell(game, ctx);
  const keysHint = game.bins.length <= 3 ? `Teclas: **1–${game.bins.length}** ou as **setas** (${game.bins.length === 2 ? '← →' : '← ↓ →'}).` : `Teclas: **1–${game.bins.length}**.`;
  if (!(await shell.intro(keysHint))) {
    shell.close();
    return null;
  }

  const level = gameLevel(game.id);
  const perRound = Math.min(game.items.length, byLevel(GAMES.sortItems, level));
  const timeFactor = byLevel(GAMES.sortTime, level);
  const queue: { item: SortItem; retry: boolean }[] = shuffle(game.items)
    .slice(0, perRound)
    .map((item) => ({ item, retry: false }));
  const total = queue.length;
  const missed: MissedItem[] = [];
  let correctFirst = 0;
  let mistakes = 0;
  let streak = 0;
  let bestStreak = 0;
  let done = 0;
  const startedAt = Date.now();

  // ---- montagem da área de jogo
  const belt = h('div', { class: 'sg-belt' }, [h('div', { class: 'sg-belt-end', title: 'Fim da esteira' })]);
  const timeBar = h('div', { class: 'sg-time' }, [h('div', { class: 'sg-time-fill' })]);
  let choose: (bin: number) => void = () => {};
  const binButtons = game.bins.map((label, i) =>
    h('button', {
      class: 'sg-bin',
      html: `<span class="sg-key">${i + 1}</span><span>${mdInline(label)}</span>`,
      on: { click: () => choose(i) },
    }),
  );
  const feedback = h('div', { class: 'sg-feedback' });
  shell.body.innerHTML = '';
  shell.body.append(h('div', { class: 'sg-stage' }, [belt, timeBar, h('div', { class: `sg-bins bins-${game.bins.length}` }, binButtons), feedback]));
  shell.actions.innerHTML = '';
  shell.actions.append(h('span', { class: 'muted small', text: 'Leia com calma quando errar: a esteira espera você.' }));

  const renderStats = () => {
    shell.stats.innerHTML = '';
    shell.stats.append(...statChips([['📦', `${Math.min(done + 1, total)}/${total}`], ['✔', String(correctFirst)], ['🔥', String(streak)]]));
  };

  let current: { item: SortItem; retry: boolean; el: HTMLElement; start: number; duration: number } | null = null;
  let phase: 'moving' | 'feedback' | 'between' | 'over' = 'between';
  let raf = 0;

  return new Promise<GameOutcome | null>((resolve) => {
    shell.playing = true;
    shell.onQuit = () => {
      phase = 'over';
      cancelAnimationFrame(raf);
      shell.close();
      resolve(null);
    };

    const durationFor = (item: SortItem) => {
      const base = Math.min(GAMES.sortMaxMs, Math.max(GAMES.sortMinMs, GAMES.sortBaseMs + item.text.length * GAMES.sortMsPerChar));
      const factor = Math.max(GAMES.sortMinFactor, 1 - GAMES.sortSpeedupPerHit * streak);
      return base * factor * timeFactor;
    };

    const spawn = () => {
      const next = queue.shift();
      if (!next) {
        finish();
        return;
      }
      feedback.innerHTML = '';
      binButtons.forEach((b) => b.classList.remove('correct', 'wrong', 'hit'));
      const el = h('div', { class: `sg-item${next.retry ? ' retry' : ''}`, html: mdInline(next.item.text) });
      if (next.retry) el.prepend(h('span', { class: 'sg-retry', text: '↻' }));
      belt.append(el);
      current = { ...next, el, start: performance.now(), duration: durationFor(next.item) };
      phase = 'moving';
      renderStats();
      sfx.blip();
      raf = requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      if (phase !== 'moving' || !current) return;
      const t = Math.min(1, (now - current.start) / current.duration);
      const travel = Math.max(0, belt.clientWidth - current.el.offsetWidth - 24);
      current.el.style.transform = `translateX(${Math.round(travel * (1 - t))}px)`;
      const fill = timeBar.firstElementChild as HTMLElement;
      fill.style.width = `${(1 - t) * 100}%`;
      fill.classList.toggle('low', t > 0.7);
      if (t >= 1) {
        resolveItem(null);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    choose = (bin: number) => {
      if (phase !== 'moving' || !current || bin >= game.bins.length) return;
      resolveItem(bin);
    };

    /** bin = null: o item passou direto (tempo esgotado). */
    const resolveItem = (bin: number | null) => {
      if (!current) return;
      cancelAnimationFrame(raf);
      const { item, retry, el } = current;
      const right = bin === item.bin;
      if (right) {
        if (!retry) correctFirst += 1;
        streak += 1;
        bestStreak = Math.max(bestStreak, streak);
        if (!retry) done += 1;
        binButtons[item.bin].classList.add('hit');
        el.classList.add('gone');
        sfx.correct();
        phase = 'between';
        renderStats();
        window.setTimeout(() => {
          el.remove();
          if (phase === 'between') spawn();
        }, 380);
        return;
      }
      // errou ou deixou passar: para tudo e explica
      mistakes += 1;
      streak = 0;
      if (!retry) {
        done += 1;
        missed.push({ text: item.text, answer: game.bins[item.bin], why: item.why });
        queue.push({ item, retry: true });
      }
      el.classList.add('bad');
      if (bin !== null) binButtons[bin].classList.add('wrong');
      binButtons[item.bin].classList.add('correct');
      sfx.wrong();
      phase = 'feedback';
      renderStats();
      feedback.innerHTML = '';
      feedback.append(
        h('div', { class: 'feedback bad' }, [
          h('div', { class: 'feedback-head' }, [h('strong', { text: bin === null ? '⏱ Passou direto!' : '✘ Categoria errada' })]),
          h('div', { html: mdInline(`Vai em **${game.bins[item.bin]}**.${item.why ? ` ${item.why}` : ''}`) }),
          h('div', { class: 'feedback-srs', text: retry ? 'Siga em frente — ele aparece no resumo para revisar.' : '↻ Este item volta no fim da rodada.' }),
        ]),
      );
      shell.actions.innerHTML = '';
      shell.actions.append(h('span', { class: 'spacer' }), h('button', { class: 'btn primary', html: 'Continuar <kbd>Enter</kbd>', on: { click: () => proceed() } }));
    };

    const proceed = () => {
      if (phase !== 'feedback' || !current) return;
      current.el.remove();
      current = null;
      shell.actions.innerHTML = '';
      phase = 'between';
      spawn();
    };

    const finish = async () => {
      phase = 'over';
      shell.setKeys(null);
      const result: GameResult = {
        total,
        correctFirstTry: correctFirst,
        mistakes,
        bestStreak,
        durationMs: Date.now() - startedAt,
        completed: true,
        missed,
      };
      const outcome = ctx.finish(result);
      await shell.summary(result, outcome);
      shell.close();
      resolve(outcome);
    };

    shell.setKeys((e) => {
      if (phase === 'moving') {
        const digit = /^(?:Digit|Numpad)([1-4])$/.exec(e.code);
        if (digit) {
          choose(Number(digit[1]) - 1);
          return true;
        }
        const arrows = ARROWS[game.bins.length];
        const idx = arrows ? arrows.indexOf(e.code) : -1;
        if (idx >= 0) {
          choose(idx);
          return true;
        }
      } else if (phase === 'feedback' && ['Enter', 'NumpadEnter', 'Space'].includes(e.code) && !e.repeat) {
        proceed();
        return true;
      }
      return false;
    });

    renderStats();
    window.setTimeout(spawn, 250);
  });
}
