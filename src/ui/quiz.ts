/**
 * Tela de questões. Fluxo: escolher → responder → ler o feedback (o porquê de cada alternativa) → continuar.
 * A lógica (FSRS, XP, repetição) fica no SessionRunner; aqui é só apresentação.
 */
import { sfx } from '../core/audio';
import { shuffle } from '../core/rng';
import { formatDuration, formatUntil } from '../core/time';
import { content, solveOf, type Solve } from '../learning/content';
import type { AnswerOutcome, SessionItem, SessionRunner } from '../learning/session';
import { isTrueFalse } from '../learning/types';
import { confirmBox } from './dialog';
import { h, md } from './dom';
import { showLesson } from './lesson';
import { stepsBox, type StepsBox } from './steps';
import { toast } from './toasts';
import { isCancelKey, ui } from './UI';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const DIFFICULTY_LABEL = ['', 'Básico', 'Intermediário', 'Nível prova'];
const HINT_NOTE = ' (usar ajuda conta como acerto "difícil" na revisão)';

interface Rendered {
  item: SessionItem;
  /** ordem exibida -> índice original da alternativa (C/E: 0 = Certo, 1 = Errado) */
  order: number[];
  buttons: HTMLButtonElement[];
  /** Resolução em passos (roteiro), se a questão tiver. */
  solve: Solve | null;
  box: StepsBox | null;
}

export function runQuiz(runner: SessionRunner): Promise<void> {
  const plan = runner.plan;
  const subject = plan.subjectId ? content.subjectById.get(plan.subjectId) : undefined;

  return new Promise((resolve) => {
    const progress = h('div', { class: 'quiz-progress' });
    const timerEl = h('span', { class: 'quiz-timer' });
    const body = h('div', { class: 'quiz-body' });
    const actions = h('div', { class: 'quiz-actions' });
    const close = h('button', { class: 'btn-close', title: 'Encerrar sessão (Esc)', text: '✕', on: { click: () => void quit() } });
    const panel = h('div', { class: 'panel modal quiz', style: `--accent:${subject?.color ?? '#4a74b8'}` }, [
      h('header', { class: 'modal-head' }, [
        h('span', { class: 'chip', text: `${subject?.icon ?? '🧭'} ${plan.title}` }),
        timerEl,
        progress,
        close,
      ]),
      body,
      actions,
    ]);
    const wrap = h('div', { class: 'layer layer-modal' }, [panel]);

    let current: Rendered | null = null;
    let phase: 'answer' | 'feedback' | 'done' = 'answer';
    let selected: number | null = null;
    let usedHint = false;
    let busy = false;
    let timer = 0;
    const deadline = plan.timeLimitSec ? Date.now() + plan.timeLimitSec * 1000 : 0;

    const updateProgress = () => {
      const done = runner.answered;
      progress.innerHTML = '';
      progress.append(
        h('span', { text: `${Math.min(done + (phase === 'answer' ? 1 : 0), runner.total)}/${runner.total}` }),
        h('div', { class: 'bar small' }, [h('div', { class: 'bar-fill', style: `width:${(done / Math.max(1, runner.total)) * 100}%` })]),
      );
    };

    const next = () => {
      const item = runner.next();
      if (!item) {
        end();
        return;
      }
      phase = 'answer';
      selected = null;
      usedHint = false;
      renderQuestion(item);
    };

    const renderQuestion = (item: SessionItem) => {
      const q = item.question;
      const tf = isTrueFalse(q);
      const order = tf ? [0, 1] : q.shuffle === false ? q.options.map((_, i) => i) : shuffle(q.options.map((_, i) => i));
      const labels = tf ? ['Certo', 'Errado'] : order.map((i) => q.options[i].text);
      const buttons = labels.map((label, displayIndex) =>
        h('button', {
          class: `option${tf ? ' option-tf' : ''}`,
          html: `<span class="opt-letter">${tf ? (displayIndex === 0 ? 'C' : 'E') : LETTERS[displayIndex]}</span><span class="opt-text">${md(label).replace(/^<p>|<\/p>$/g, '')}</span>`,
          on: { click: () => select(displayIndex) },
        }),
      );
      current = { item, order, buttons, solve: solveOf(q, item.topic), box: null };
      body.innerHTML = '';
      body.scrollTop = 0;
      body.append(
        h('div', { class: 'q-meta' }, [
          h('span', { class: `diff diff-${q.difficulty}`, text: `${'★'.repeat(q.difficulty)}${'☆'.repeat(3 - q.difficulty)} ${DIFFICULTY_LABEL[q.difficulty]}` }),
          h('span', { class: 'q-topic', text: item.topic.name }),
          item.attempt > 1 ? h('span', { class: 'q-retry', text: '↻ Nova tentativa' }) : null,
          item.generated ? h('span', { class: 'q-gen', title: 'Os números mudam a cada vez: treine o método, não a resposta.', text: '🧮 Valores sorteados' }) : null,
          q.source ? h('span', { class: 'q-source', text: q.source }) : null,
        ]),
        h('div', { class: 'q-prompt md', html: md(q.prompt) }),
        h('div', { class: `options${tf ? ' options-tf' : ''}` }, buttons),
        h('div', { class: 'q-hint' }),
      );
      actions.innerHTML = '';
      if (plan.allowHints && current.solve) {
        actions.append(h('button', { class: 'btn ghost', title: 'Abre um passo por vez — os seguintes ficam ocultos', html: '🧭 Passo a passo <kbd>P</kbd>', on: { click: () => stepNext() } }));
      } else if (plan.allowHints && (Boolean(q.hint) || (!tf && q.options.length >= 4))) {
        actions.append(h('button', { class: 'btn ghost', html: '💡 Dica <kbd>H</kbd>', on: { click: () => hint() } }));
      }
      actions.append(h('span', { class: 'spacer' }));
      actions.append(h('button', { class: 'btn primary', html: 'Responder <kbd>Enter</kbd>', disabled: true, dataset: { role: 'submit' }, on: { click: () => submit() } }));
      updateProgress();
    };

    const select = (displayIndex: number) => {
      if (phase !== 'answer' || !current) return;
      const btn = current.buttons[displayIndex];
      if (!btn || btn.disabled) return;
      selected = displayIndex;
      current.buttons.forEach((b, i) => b.classList.toggle('selected', i === displayIndex));
      const submitBtn = actions.querySelector<HTMLButtonElement>('[data-role="submit"]');
      if (submitBtn) submitBtn.disabled = false;
      sfx.select();
    };

    /** Caixa do roteiro: criada ao pedir ajuda (antes de responder) ou no feedback. */
    const ensureBox = (): StepsBox | null => {
      if (!current?.solve) return null;
      if (!current.box) {
        current.box = stepsBox(current.solve, {
          onChange: () => {
            if (phase === 'answer') markHint();
            else updateExtras();
          },
        });
        body.querySelector('.q-hint')?.append(current.box.el);
      }
      return current.box;
    };

    const canUseSteps = () => Boolean(current?.solve) && (phase === 'feedback' || plan.allowHints);

    const stepNext = () => {
      if (phase === 'done' || !canUseSteps()) return;
      ensureBox()?.next();
    };

    const stepReveal = () => {
      if (phase === 'done' || !canUseSteps()) return;
      current?.box?.reveal();
    };

    const stepAll = () => {
      if (phase === 'done' || !canUseSteps()) return;
      ensureBox()?.showAll();
    };

    /** Usar o passo a passo antes de responder conta como dica (acerto "difícil"). */
    const markHint = () => {
      if (usedHint) return;
      usedHint = true;
      body.querySelector('.q-hint')?.prepend(h('small', { class: 'hint-note', text: `🧭 Passo a passo aberto${HINT_NOTE}` }));
    };

    /** No feedback: a explicação em texto corrido só aparece depois de abrir todos os passos. */
    let updateExtras = () => {};

    const hint = () => {
      if (phase !== 'answer' || !current || usedHint) return;
      if (current.solve) {
        stepNext();
        return;
      }
      const q = current.item.question;
      usedHint = true;
      const box = body.querySelector('.q-hint')!;
      if (q.hint) {
        box.innerHTML = md(`💡 ${q.hint}`);
      } else if (!isTrueFalse(q)) {
        const wrongDisplay = current.order.map((orig, display) => ({ orig, display })).filter((o) => o.orig !== q.answer);
        for (const o of shuffle(wrongDisplay).slice(0, 2)) {
          current.buttons[o.display].disabled = true;
          current.buttons[o.display].classList.add('eliminated');
          if (selected === o.display) selected = null;
        }
        box.innerHTML = md('💡 Eliminei duas alternativas erradas.');
      }
      box.append(h('small', { text: HINT_NOTE }));
      sfx.toggle();
    };

    const isCorrect = (): boolean => {
      const q = current!.item.question;
      const orig = current!.order[selected!];
      return isTrueFalse(q) ? (orig === 0) === q.answer : orig === q.answer;
    };

    const submit = () => {
      if (phase !== 'answer' || !current || selected === null || busy) return;
      const correct = isCorrect();
      const outcome = runner.answer(current.item, correct, usedHint);
      phase = 'feedback';
      if (correct) sfx.correct();
      else sfx.wrong();
      renderFeedback(outcome);
    };

    const renderFeedback = (outcome: AnswerOutcome) => {
      const { item, order, buttons } = current!;
      const q = item.question;
      const tf = isTrueFalse(q);
      const correctDisplay = tf ? (q.answer ? 0 : 1) : order.indexOf(q.answer);
      const solve = current!.solve;
      // Errou com roteiro: a alternativa certa só acende no fim do passo a passo, para não entregar o resultado
      const holdAnswer = Boolean(solve) && !outcome.correct;
      const markCorrect = () => buttons[correctDisplay]?.classList.add('correct');
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (i === correctDisplay) {
          if (!holdAnswer) b.classList.add('correct');
        } else if (i === selected) b.classList.add('wrong');
      });
      panel.classList.remove('flash-good', 'flash-bad');
      void panel.offsetWidth;
      panel.classList.add(outcome.correct ? 'flash-good' : 'flash-bad');

      const whys: HTMLElement[] = [];
      if (!tf) {
        order.forEach((orig, display) => {
          const opt = q.options[orig];
          if (!opt.why) return;
          // com roteiro, o porquê da correta entregaria os passos: todos os comentários ficam recolhidos
          const important = !solve && (display === correctDisplay || display === selected);
          whys.push(
            h('li', { class: `${display === correctDisplay ? 'why-correct' : 'why-wrong'}${important ? '' : ' why-extra'}` }, [
              h('b', { text: `${LETTERS[display]}) ` }),
              h('span', { html: md(opt.why).replace(/^<p>|<\/p>$/g, '') }),
            ]),
          );
        });
      }
      const extraCount = whys.filter((w) => w.classList.contains('why-extra')).length;
      const whyList = whys.length ? h('ul', { class: 'why-list collapsed' }, whys) : null;
      const toggle = extraCount
        ? h('button', {
            class: 'link',
            text: solve ? `Ver o comentário de cada alternativa (${extraCount})` : `Ver comentário das outras ${extraCount} alternativas`,
            on: {
              click: (e) => {
                whyList?.classList.toggle('collapsed');
                (e.currentTarget as HTMLElement).remove();
              },
            },
          })
        : null;

      const head = h('div', { class: 'feedback-head' }, [
        h('strong', { text: outcome.correct ? (usedHint ? '✔ Correto (com ajuda)' : '✔ Correto!') : '✘ Não foi dessa vez' }),
        outcome.xp ? h('span', { class: 'xp', text: `+${outcome.xp} XP` }) : null,
      ]);
      const srs = h('div', { class: 'feedback-srs' }, [
        outcome.willRetry
          ? h('span', { text: solve ? '↻ Esta questão volta no fim da sessão — use o roteiro para refazer.' : '↻ Esta questão volta no fim da sessão — tente lembrar a explicação.' })
          : h('span', { text: `🌱 Próxima revisão desta questão: ${formatUntil(outcome.nextDue)}` }),
      ]);

      let feedback: HTMLElement;
      if (solve) {
        // Resolução guiada: o roteiro substitui o texto corrido, que fica disponível no fim
        const box = ensureBox()!;
        const chosen = !tf && selected !== null ? q.options[order[selected]] : undefined;
        const diag = !outcome.correct && chosen?.why ? h('div', { class: 'feedback-diag md', html: md(`**Sua escolha (${LETTERS[selected!]}):** ${chosen.why}`) }) : null;
        const lead = outcome.correct
          ? null
          : h('p', { class: 'steps-lead', text: 'Refaça pelo roteiro: abra um passo, tente o seguinte sozinho e só então confira. A alternativa certa acende no fim (ou com T).' });
        const expl = h('div', { class: 'feedback-expl hidden' }, [
          h('button', {
            class: 'link',
            text: '📄 Ler a explicação em texto corrido',
            on: { click: (e) => (e.currentTarget as HTMLElement).replaceWith(h('div', { class: 'md', html: md(q.explanation) })) },
          }),
        ]);
        updateExtras = () => {
          expl.classList.toggle('hidden', !box.complete);
          if (box.complete) markCorrect();
        };
        feedback = h('div', { class: `feedback ${outcome.correct ? 'good' : 'bad'}` }, [head, diag, lead, box.el, toggle, whyList, expl, srs]);
        body.append(feedback);
        box.setShowWhen(true);
        if (outcome.correct) box.showAll();
        else if (!box.opened) box.next();
        updateExtras();
      } else {
        updateExtras = () => {};
        feedback = h('div', { class: `feedback ${outcome.correct ? 'good' : 'bad'}` }, [head, h('div', { class: 'md', html: md(q.explanation) }), whyList, toggle, srs]);
        body.append(feedback);
      }
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      actions.innerHTML = '';
      if (q.lessonRef !== undefined) {
        actions.append(h('button', { class: 'btn ghost', html: '📖 Rever lição <kbd>L</kbd>', on: { click: () => void reviewLesson() } }));
      }
      actions.append(h('span', { class: 'spacer' }));
      actions.append(h('button', { class: 'btn primary', html: 'Continuar <kbd>Enter</kbd>', on: { click: () => next() } }));
      updateProgress();
    };

    const reviewLesson = async () => {
      if (!current || busy) return;
      const ref = current.item.question.lessonRef;
      busy = true;
      await showLesson(current.item.topic, { startAt: ref, finishLabel: 'Voltar às questões' });
      busy = false;
    };

    const quit = async () => {
      if (busy || phase === 'done') return;
      busy = true;
      const ok = runner.answered === 0 || (await confirmBox('Encerrar a sessão agora? O que você já respondeu fica salvo.', 'Encerrar', 'Continuar estudando'));
      busy = false;
      if (ok) end();
    };

    const end = () => {
      if (phase === 'done') return;
      phase = 'done';
      window.clearInterval(timer);
      ui.remove(layer);
      resolve();
    };

    const tick = () => {
      if (!deadline) return;
      const left = deadline - Date.now();
      timerEl.textContent = `⏱ ${formatDuration(left)}`;
      timerEl.classList.toggle('low', left < 60_000);
      if (left <= 0 && phase !== 'done') {
        runner.timeUp = true;
        toast('Tempo esgotado!', 'warn', '⏱');
        end();
      }
    };

    const layer = ui.push(wrap, {
      onKey: (e) => {
        if (busy) return false;
        if (isCancelKey(e)) {
          void quit();
          return true;
        }
        if (current?.solve && canUseSteps() && !e.repeat) {
          const stepKeys: Record<string, () => void> = { KeyP: stepNext, KeyV: stepReveal, KeyT: stepAll };
          const stepKey = stepKeys[e.code];
          if (stepKey) {
            stepKey();
            return true;
          }
        }
        if (phase === 'answer' && current) {
          const tf = isTrueFalse(current.item.question);
          const digit = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
          if (digit) {
            select(Number(digit[1]) - 1);
            return true;
          }
          const letter = /^Key([A-F])$/.exec(e.code);
          if (letter && !tf && e.code !== 'KeyE' && e.code !== 'KeyH') {
            select(LETTERS.indexOf(letter[1]));
            return true;
          }
          if (tf && (e.code === 'KeyC' || e.code === 'KeyE')) {
            select(e.code === 'KeyC' ? 0 : 1);
            return true;
          }
          if (e.code === 'KeyH') {
            hint();
            return true;
          }
          if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
            const n = current.buttons.length;
            const start = selected ?? (e.code === 'ArrowDown' ? -1 : n);
            let i = start;
            do {
              i = (i + (e.code === 'ArrowDown' ? 1 : -1) + n) % n;
            } while (current.buttons[i].disabled && i !== start);
            select(i);
            return true;
          }
          if ((e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') && !e.repeat) {
            submit();
            return true;
          }
        } else if (phase === 'feedback') {
          if (e.code === 'KeyL') {
            void reviewLesson();
            return true;
          }
          if (['Enter', 'NumpadEnter', 'Space'].includes(e.code) && !e.repeat) {
            next();
            return true;
          }
        }
        return false;
      },
    });

    if (deadline) {
      tick();
      timer = window.setInterval(tick, 250);
    }
    next();
  });
}
