/**
 * Moldura comum dos minijogos: tela de instruções → partida → resumo (com o porquê dos erros).
 * Cada jogo (esteira, conexões, procedimento) só cuida da área de jogo.
 */
import { GAMES } from '../../config';
import { sfx } from '../../core/audio';
import { formatDuration, formatUntil } from '../../core/time';
import { byLevel, GAME_INFO, gameLevel, levelName, MAX_GAME_LEVEL, type GameOutcome, type GameResult } from '../../learning/games';
import { stageName } from '../../learning/mastery';
import type { GameDef, Subject, Topic } from '../../learning/types';
import { confirmBox } from '../dialog';
import { h, md, pct } from '../dom';
import { showLesson } from '../lesson';
import { isCancelKey, ui, type Layer } from '../UI';

export interface GameContext {
  topic: Topic;
  subject: Subject;
  /** Registra a partida (revisão, XP) e devolve o que mostrar no resumo. */
  finish: (result: GameResult) => GameOutcome;
}

type KeyFn = (e: KeyboardEvent) => boolean;

/** Remove o <p> externo do md() para usar o texto em linha. */
export const mdInline = (text: string) => md(text).replace(/^<p>|<\/p>$/g, '');

/** O que muda no nível atual do jogo (mostrado na tela de instruções). */
function levelInfo(game: GameDef, level: number): string {
  switch (game.type) {
    case 'sort': {
      const n = Math.min(game.items.length, byLevel(GAMES.sortItems, level));
      return `${n} itens${level === 1 ? ', esteira mais lenta' : level === 3 ? ', esteira mais rápida' : ''}`;
    }
    case 'match':
      return `${Math.min(game.pairs.length, byLevel(GAMES.matchPairs, level))} pares`;
    case 'order': {
      const after = byLevel(GAMES.orderHintAfter, level);
      return after ? `o passo certo é destacado depois de ${after} ${after > 1 ? 'erros' : 'erro'}` : 'sem destaque do passo certo';
    }
    case 'lab':
      return game.perRound ? `${Math.min(game.tasks.length, game.perRound, byLevel(GAMES.labTasks, level))} tarefas sorteadas` : `${game.tasks.length} tarefas`;
  }
}

export class GameShell {
  readonly body: HTMLElement;
  readonly actions: HTMLElement;
  readonly stats: HTMLElement;
  readonly panel: HTMLElement;
  private readonly layer: Layer;
  private handler: KeyFn | null = null;
  private busy = false;
  private closed = false;
  /** Chamado quando o jogador confirma que quer sair no meio. */
  onQuit: () => void = () => {};
  playing = false;

  constructor(
    readonly game: GameDef,
    readonly ctx: GameContext,
  ) {
    const info = GAME_INFO[game.type];
    this.stats = h('div', { class: 'game-stats' });
    this.body = h('div', { class: 'game-body' });
    this.actions = h('div', { class: 'quiz-actions' });
    const close = h('button', { class: 'btn-close', title: 'Sair (Esc)', text: '✕', on: { click: () => void this.requestQuit() } });
    this.panel = h('div', { class: `panel modal game game-${game.type}`, style: `--accent:${ctx.subject.color}` }, [
      h('header', { class: 'modal-head' }, [h('span', { class: 'chip', text: `${info.icon} ${info.name}` }), h('h2', { class: 'game-title', text: game.title }), this.stats, close]),
      this.body,
      this.actions,
    ]);
    const wrap = h('div', { class: 'layer layer-modal' }, [this.panel]);
    this.layer = ui.push(wrap, {
      onKey: (e) => {
        if (this.busy) return false;
        if (isCancelKey(e)) {
          void this.requestQuit();
          return true;
        }
        return this.handler ? this.handler(e) : false;
      },
    });
  }

  setKeys(fn: KeyFn | null): void {
    this.handler = fn;
  }

  /** Tela de instruções. Resolve true para começar, false se o jogador desistiu. */
  intro(extra?: string): Promise<boolean> {
    const info = GAME_INFO[this.game.type];
    const level = gameLevel(this.game.id);
    const next = level < MAX_GAME_LEVEL ? ` Acerte **90%** de primeira para subir de nível (o XP também sobe).` : ' Nível máximo: mantenha os 90%!';
    return new Promise((resolve) => {
      this.body.innerHTML = '';
      this.stats.innerHTML = '';
      this.body.append(
        h('div', { class: 'game-intro' }, [
          h('div', { class: 'game-intro-icon', text: info.icon }),
          h('div', { class: 'md', html: md(`**${this.ctx.topic.name}**\n\n${this.game.intro ?? ''}`) }),
          h('div', { class: `game-level level-${level}`, html: mdInline(`${'★'.repeat(level)}${'☆'.repeat(MAX_GAME_LEVEL - level)} **${levelName(level)}**: ${levelInfo(this.game, level)}.${next}`) }),
          h('div', { class: 'game-how md', html: md(`**Como jogar:** ${info.how}${extra ? `\n\n${extra}` : ''}`) }),
        ]),
      );
      this.actions.innerHTML = '';
      const start = () => {
        this.setKeys(null);
        sfx.confirm();
        resolve(true);
      };
      this.onQuit = () => resolve(false);
      if (this.game.lessonRef !== undefined) {
        this.actions.append(h('button', { class: 'btn ghost', html: '📖 Rever lição <kbd>L</kbd>', on: { click: () => void this.reviewLesson() } }));
      }
      this.actions.append(h('span', { class: 'spacer' }), h('button', { class: 'btn primary big', html: 'Começar <kbd>Enter</kbd>', on: { click: start } }));
      this.setKeys((e) => {
        if (e.code === 'KeyL' && this.game.lessonRef !== undefined) {
          void this.reviewLesson();
          return true;
        }
        if (['Enter', 'NumpadEnter', 'Space'].includes(e.code) && !e.repeat) {
          start();
          return true;
        }
        return false;
      });
    });
  }

  private async reviewLesson(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    await showLesson(this.ctx.topic, { startAt: this.game.lessonRef, finishLabel: 'Voltar ao jogo' });
    this.busy = false;
  }

  private async requestQuit(): Promise<void> {
    if (this.busy || this.closed) return;
    if (!this.playing) {
      this.onQuit();
      return;
    }
    this.busy = true;
    const ok = await confirmBox('Sair do jogo agora? Esta partida não será registrada.', 'Sair', 'Continuar jogando');
    this.busy = false;
    if (ok) this.onQuit();
  }

  /** Resumo final: aproveitamento, XP, próxima revisão e o porquê de cada erro. */
  summary(result: GameResult, outcome: GameOutcome, extra?: HTMLElement | null): Promise<void> {
    this.playing = false;
    const topic = this.ctx.topic;
    const acc = outcome.accuracy;
    const title = acc >= 0.9 ? 'Mandou bem! 🎉' : acc >= 0.7 ? 'Bom trabalho! 👍' : 'Vale repetir 💪';
    if (acc >= 0.9) sfx.levelUp();
    else sfx.confirm();
    return new Promise((resolve) => {
      this.stats.innerHTML = '';
      this.body.innerHTML = '';
      this.body.scrollTop = 0;
      const stageUp = outcome.stageAfter > outcome.stageBefore;
      const levelText =
        outcome.levelAfter > outcome.level
          ? `⬆️ Subiu para o **${levelName(outcome.levelAfter)}**! ${levelInfo(this.game, outcome.levelAfter)} na próxima partida.`
          : outcome.levelAfter < outcome.level
            ? `⬇️ Volta para o **${levelName(outcome.levelAfter)}** na próxima — revise a lição e suba de novo.`
            : '';
      this.body.append(
        h('div', { class: 'game-summary' }, [
          h('h3', { text: title }),
          levelText ? h('div', { class: `game-level-change ${outcome.levelAfter > outcome.level ? 'up' : 'down'}`, html: mdInline(levelText) }) : null,
          h('div', { class: 'results-stats' }, [
            stat('Acertos de primeira', `${result.correctFirstTry}/${result.total}`, pct(acc)),
            stat('Experiência', `+${outcome.xp}`, 'XP'),
            stat('Moedas', `+${outcome.coins}`, '💰'),
            stat('Tempo', formatDuration(result.durationMs), result.bestStreak > 2 ? `🔥 ${result.bestStreak} seguidos` : ''),
          ]),
          h('div', { class: 'game-srs' }, [
            h('span', {
              html: mdInline(
                `${outcome.newRecord ? '🏅 **Novo recorde!** · ' : ''}🌱 Próxima revisão deste jogo: **${formatUntil(outcome.nextDue)}** · ${topic.name}: ${pct(outcome.before)} → **${pct(outcome.after)}**${stageUp ? ` (${stageName(topic, outcome.stageBefore)} → ${stageName(topic, outcome.stageAfter)}!)` : ''}`,
              ),
            }),
          ]),
          result.missed.length
            ? h('div', { class: 'game-missed' }, [
                h('h4', { text: `Para revisar (${result.missed.length})` }),
                h(
                  'ul',
                  { class: 'why-list' },
                  result.missed.map((m) =>
                    h('li', {}, [
                      h('b', { html: mdInline(m.text) }),
                      h('span', { html: ` → ${mdInline(m.answer)}` }),
                      m.why ? h('div', { class: 'why-text', html: mdInline(m.why) }) : null,
                    ]),
                  ),
                ),
              ])
            : h('p', { class: 'game-perfect', text: 'Nenhum erro. A revisão deste jogo vai ficar mais espaçada. ✨' }),
          extra ?? null,
        ]),
      );
      this.actions.innerHTML = '';
      const done = () => {
        this.setKeys(null);
        resolve();
      };
      this.onQuit = done;
      this.actions.append(h('span', { class: 'spacer' }), h('button', { class: 'btn primary', html: 'Continuar <kbd>Enter</kbd>', on: { click: done } }));
      this.setKeys((e) => {
        if (['Enter', 'NumpadEnter', 'Space'].includes(e.code) && !e.repeat) {
          done();
          return true;
        }
        return false;
      });
    });
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.setKeys(null);
    ui.remove(this.layer);
  }
}

function stat(label: string, value: string, extra: string): HTMLElement {
  return h('div', { class: 'stat' }, [h('small', { text: label }), h('strong', { text: value }), extra ? h('span', { text: extra }) : null]);
}

/** Pequeno placar no cabeçalho. */
export function statChips(items: [string, string][]): HTMLElement[] {
  return items.map(([icon, value]) => h('span', { class: 'game-chip', text: `${icon} ${value}` }));
}
