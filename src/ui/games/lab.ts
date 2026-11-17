/**
 * Bancada com tarefas: "preveja e observe" (aposte antes de ver acontecer) e missões (mexa nos controles
 * até cumprir as metas). Cada partida é um cartão de revisão, como os outros minijogos.
 */
import { GAMES } from '../../config';
import { sfx } from '../../core/audio';
import { shuffle } from '../../core/rng';
import { fmt } from '../../learning/gen';
import { byLevel, gameLevel, type GameOutcome, type GameResult, type MissedItem } from '../../learning/games';
import { LAB_MODELS } from '../../learning/labs';
import { goalMet } from '../../learning/labs/model';
import type { LabGame, LabGoalTask, LabPredictTask, LabTask } from '../../learning/types';
import { h, md } from '../dom';
import { mountBench, type Bench } from '../labs/bench';
import { GameShell, mdInline, statChips, type GameContext } from './shell';

const LETTERS = 'ABCDE';

/** Texto da meta, ex.: "Vazão ≥ 90 m³/h" ou "Rendimento entre 77 e 100 %". */
export function goalText(game: LabGame, g: LabGoalTask['goals'][number]): string {
  if (g.label) return g.label;
  const out = LAB_MODELS[game.lab].outputs.find((o) => o.id === g.out);
  const label = out?.label ?? g.out;
  const unit = out?.unit ? ` ${out.unit}` : '';
  const d = out?.digits ?? 2;
  if (g.min !== undefined && g.max !== undefined) return `${label} entre ${fmt(g.min, d)} e ${fmt(g.max, d)}${unit}`;
  if (g.min !== undefined) return `${label} ≥ ${fmt(g.min, d)}${unit}`;
  return `${label} ≤ ${fmt(g.max ?? 0, d)}${unit}`;
}


export async function playLab(game: LabGame, ctx: GameContext): Promise<GameOutcome | null> {
  const shell = new GameShell(game, ctx);
  if (!(await shell.intro('Na previsão, escolha com **1–5** ou **A–E**. Nas missões, use os controles ao lado do desenho. **Enter** continua.'))) {
    shell.close();
    return null;
  }
  const tasks: LabTask[] = game.perRound ? shuffle(game.tasks).slice(0, Math.min(game.perRound, byLevel(GAMES.labTasks, gameLevel(game.id)))) : game.tasks;
  const startedAt = Date.now();
  const missed: MissedItem[] = [];
  let correct = 0;
  let mistakes = 0;
  let streak = 0;
  let bestStreak = 0;

  shell.body.innerHTML = '';
  const taskBox = h('section', { class: 'lab-task' });
  shell.body.append(taskBox);
  const bench: Bench = mountBench(shell.body, game.lab);
  shell.playing = true;

  const renderStats = (i: number) => {
    shell.stats.innerHTML = '';
    shell.stats.append(...statChips([['🔬', `${Math.min(i + 1, tasks.length)}/${tasks.length}`], ['✔', String(correct)], ['🔥', String(streak)]]));
  };
  const score = (ok: boolean, task: LabTask, answer: string) => {
    if (ok) {
      correct += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      mistakes += 1;
      streak = 0;
      missed.push({ text: task.prompt, answer, why: task.why });
    }
  };

  let quit = false;
  const aborted = new Promise<null>((resolve) => {
    shell.onQuit = () => {
      quit = true;
      bench.destroy();
      shell.close();
      resolve(null);
    };
  });

  /** Espera o botão/tecla "Continuar". */
  const waitContinue = (label = 'Continuar') =>
    new Promise<void>((resolve) => {
      shell.actions.innerHTML = '';
      const go = () => {
        shell.setKeys(null);
        sfx.confirm();
        resolve();
      };
      shell.actions.append(h('span', { class: 'spacer' }), h('button', { class: 'btn primary', html: `${label} <kbd>Enter</kbd>`, on: { click: go } }));
      shell.setKeys((e) => {
        if (['Enter', 'NumpadEnter', 'Space'].includes(e.code) && !e.repeat) {
          go();
          return true;
        }
        return false;
      });
    });

  const head = (i: number, task: LabTask) =>
    h('div', { class: 'lab-task-head' }, [
      h('span', { class: `lab-kind ${task.kind}`, text: task.kind === 'predict' ? '🔮 Preveja e observe' : '🎯 Missão' }),
      h('span', { text: `Tarefa ${i + 1} de ${tasks.length}` }),
    ]);

  async function runPredict(i: number, task: LabPredictTask): Promise<void> {
    taskBox.innerHTML = '';
    let choose: (k: number) => void = () => {};
    // ordem embaralhada a cada vez (no conteúdo a certa costuma vir primeiro)
    const order = shuffle(task.options.map((_, k) => k));
    const shown = order.indexOf(task.answer);
    const opts = order.map((orig, k) =>
      h('button', { class: 'option', html: `<span class="opt-letter">${LETTERS[k]}</span><span class="opt-text">${mdInline(task.options[orig])}</span>`, on: { click: () => choose(k) } }),
    ) as HTMLButtonElement[];
    const why = h('div', { class: 'lab-why' });
    taskBox.append(head(i, task), h('div', { class: 'lab-prompt md', html: md(task.prompt) }), h('div', { class: 'lab-options' }, opts), why);
    // aposta às cegas: os controles só destravam depois da resposta
    bench.lock(LAB_MODELS[game.lab].params.map((p) => p.id));
    shell.actions.innerHTML = '';
    shell.actions.append(h('span', { class: 'muted small', text: task.change ? 'Aposte primeiro — depois a bancada mostra o que acontece.' : 'Olhe a bancada e responda.' }));
    const picked = await new Promise<number>((resolve) => {
      choose = (k: number) => {
        if (k < 0 || k >= opts.length) return;
        shell.setKeys(null);
        resolve(k);
      };
      shell.setKeys((e) => {
        const m = /^(?:Digit|Numpad)([1-5])$/.exec(e.code) ?? /^Key([A-E])$/.exec(e.code);
        if (!m) return false;
        const k = /\d/.test(m[1]) ? Number(m[1]) - 1 : LETTERS.indexOf(m[1]);
        choose(k);
        return true;
      });
    });
    const ok = picked === shown;
    opts.forEach((b, k) => {
      b.disabled = true;
      if (k === shown) b.classList.add('correct');
      else if (k === picked) b.classList.add('wrong');
    });
    if (ok) sfx.correct();
    else sfx.wrong();
    score(ok, task, task.options[task.answer]);
    renderStats(i);
    bench.lock(task.lock ?? []);
    if (task.change) {
      why.innerHTML = md('👀 **Observe a bancada…**');
      bench.set(task.change, true);
      await new Promise((r) => window.setTimeout(r, 1600));
      if (quit) return;
    }
    why.innerHTML = `<div class="callout ${ok ? 'example' : 'trap'}"><b>${ok ? '✔ Isso mesmo!' : `✘ Era a ${LETTERS[shown]}`}</b><div class="md">${md(task.why)}</div></div>`;
    await waitContinue(i + 1 < tasks.length ? 'Próxima tarefa' : 'Ver resultado');
  }

  async function runGoal(i: number, task: LabGoalTask): Promise<void> {
    taskBox.innerHTML = '';
    const items = task.goals.map((g) => h('li', { text: goalText(game, g) }));
    const why = h('div', { class: 'lab-why' });
    taskBox.append(head(i, task), h('div', { class: 'lab-prompt md', html: md(task.prompt) }), h('ul', { class: 'lab-goals' }, items), why);
    let hinted = false;
    const result = await new Promise<'done' | 'gaveup'>((resolve) => {
      let okSince = 0;
      let finished = false;
      const end = (r: 'done' | 'gaveup') => {
        if (finished) return;
        finished = true;
        bench.onTick = null;
        shell.setKeys(null);
        resolve(r);
      };
      const hint = () => {
        if (hinted) return;
        hinted = true;
        sfx.page();
        why.innerHTML = `<div class="callout tip"><b>💡 Dica</b><div class="md">${md(task.hint)}</div></div>`;
      };
      shell.actions.innerHTML = '';
      shell.actions.append(
        h('button', { class: 'btn ghost', html: '💡 Dica <kbd>H</kbd>', on: { click: hint } }),
        h('button', { class: 'btn ghost', text: 'Desistir e ver a solução', on: { click: () => end('gaveup') } }),
        h('span', { class: 'spacer' }),
        h('span', { class: 'muted small', text: 'Cumpra todas as metas ao mesmo tempo.' }),
      );
      shell.setKeys((e) => {
        if (e.code === 'KeyH') {
          hint();
          return true;
        }
        return false;
      });
      bench.onTick = (o) => {
        const states = task.goals.map((g) => goalMet(g, o));
        states.forEach((s, k) => items[k].classList.toggle('ok', s));
        const now = performance.now();
        if (states.every(Boolean)) {
          if (!okSince) okSince = now;
          if (now - okSince > 700) end('done');
        } else okSince = 0;
      };
    });
    if (quit) return;
    const ok = result === 'done' && !hinted;
    if (result === 'done') sfx.correct();
    else sfx.wrong();
    score(ok, task, task.goals.map((g) => goalText(game, g)).join(' · '));
    renderStats(i);
    if (result === 'gaveup') bench.set(task.solution, true);
    const title = result === 'done' ? (hinted ? '✔ Missão cumprida (com dica)' : '✔ Missão cumprida!') : '✘ Uma solução (veja na bancada)';
    why.innerHTML = `<div class="callout ${result === 'done' ? 'example' : 'trap'}"><b>${title}</b><div class="md">${md(result === 'done' ? task.why : `${task.hint}\n\n${task.why}`)}</div></div>`;
    await waitContinue(i + 1 < tasks.length ? 'Próxima tarefa' : 'Ver resultado');
  }

  const play = async (): Promise<GameOutcome | null> => {
    for (let i = 0; i < tasks.length; i++) {
      if (quit) return null;
      const task = tasks[i];
      bench.reset(task.setup, task.lock);
      renderStats(i);
      if (task.kind === 'predict') await runPredict(i, task);
      else await runGoal(i, task);
    }
    if (quit) return null;
    shell.setKeys(null);
    const result: GameResult = {
      total: tasks.length,
      correctFirstTry: correct,
      mistakes,
      bestStreak,
      durationMs: Date.now() - startedAt,
      completed: true,
      missed,
    };
    const outcome = ctx.finish(result);
    bench.destroy();
    await shell.summary(result, outcome);
    shell.close();
    return outcome;
  };

  return Promise.race([play(), aborted]);
}
