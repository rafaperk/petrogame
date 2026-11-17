/** HUD: jogador, nível, profundidade do poço, moedas, ofensiva, revisões pendentes e missão atual. */
import { portraitOf } from '../art/characters';
import { xpToNextLevel } from '../config';
import { events } from '../core/events';
import { state } from '../core/state';
import { rankOf } from '../game/career';
import { boostMinutesLeft } from '../game/items';
import { depthLayer, depthMeters, totalDue } from '../learning/mastery';
import { h, md } from './dom';
import { ui } from './UI';

export interface HudActions {
  openNotebook: () => void;
  openMenu: () => void;
  openMissions: () => void;
}

class Hud {
  private el: HTMLElement | null = null;
  private refs: Record<string, HTMLElement> = {};
  private pending = false;
  private mission = '';
  private prompt: string | null = null;

  mount(actions: HudActions): void {
    if (this.el) return;
    const r = this.refs;
    r.portrait = h('img', { class: 'hud-portrait', alt: '' });
    r.name = h('span', { class: 'hud-name' });
    r.level = h('span', { class: 'hud-level' });
    r.xpFill = h('div', { class: 'bar-fill' });
    r.xpText = h('small', { class: 'hud-xp-text' });
    r.depth = h('div', { class: 'hud-depth' });
    r.coins = h('span');
    r.streak = h('span');
    r.due = h('span');
    r.dueBtn = h('button', { class: 'hud-chip hud-due', title: 'Revisões pendentes (abre o caderno)', on: { click: () => actions.openNotebook() } }, ['💧 ', r.due]);
    r.mission = h('button', { class: 'hud-mission', title: 'Missões (M)', on: { click: () => actions.openMissions() } });
    r.prompt = h('div', { class: 'hud-prompt' });

    this.el = h('div', { class: 'hud' }, [
      h('div', { class: 'hud-card hud-player' }, [
        r.portrait,
        h('div', { class: 'hud-player-info' }, [
          h('div', { class: 'hud-row' }, [r.name, r.level]),
          h('div', { class: 'bar xp' }, [r.xpFill]),
          r.xpText,
        ]),
      ]),
      r.mission,
      h('div', { class: 'hud-right' }, [
        h('div', { class: 'hud-card hud-stats' }, [
          h('span', { class: 'hud-chip', title: 'Moedas' }, ['💰 ', r.coins]),
          h('span', { class: 'hud-chip', title: 'Ofensiva: dias seguidos estudando' }, ['🔥 ', r.streak]),
          r.dueBtn,
        ]),
        h('div', { class: 'hud-card hud-depth-card', title: 'Profundidade do seu poço: progresso geral rumo ao pré-sal' }, [r.depth]),
      ]),
      r.prompt,
      h('div', { class: 'hud-buttons' }, [
        h('button', { class: 'hud-btn', html: '📒 Caderno <kbd>C</kbd>', on: { click: () => actions.openNotebook() } }),
        h('button', { class: 'hud-btn', html: '☰ Menu <kbd>Esc</kbd>', on: { click: () => actions.openMenu() } }),
      ]),
    ]);
    ui.root.prepend(this.el);
    events.on('state:changed', () => this.schedule());
    events.on('garden:changed', () => this.schedule());
    window.setInterval(() => this.schedule(), 30_000);
    this.render();
  }

  setVisible(visible: boolean): void {
    this.el?.classList.toggle('hidden', !visible);
  }

  setPrompt(text: string | null): void {
    const el = this.refs.prompt;
    if (!el || text === this.prompt) return;
    this.prompt = text;
    el.innerHTML = text ? `<kbd>E</kbd> ${text}` : '';
    el.classList.toggle('show', Boolean(text));
  }

  setMission(text: string): void {
    this.mission = text;
    this.schedule();
  }

  schedule(): void {
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      this.render();
    });
  }

  private render(): void {
    if (!this.el) return;
    const d = state.data;
    const r = this.refs;
    const portrait = portraitOf('player');
    if (portrait && r.portrait.getAttribute('src') !== portrait) r.portrait.setAttribute('src', portrait);
    r.name.textContent = d.player.name;
    r.level.textContent = `Nv ${d.level}`;
    r.level.title = rankOf(d.level).title;
    const need = xpToNextLevel(d.level);
    r.xpFill.style.width = `${(d.xp / need) * 100}%`;
    const boost = boostMinutesLeft();
    r.xpText.textContent = `${rankOf(d.level).title} · ${d.xp} / ${need} XP${boost ? ` · ☕ ${boost} min` : ''}`;
    r.coins.textContent = String(d.coins);
    r.streak.textContent = String(state.currentStreak());
    const due = totalDue();
    r.due.textContent = String(due);
    r.dueBtn.classList.toggle('alert', due > 0);
    const meters = depthMeters();
    r.depth.innerHTML = `<span class="drill">⛏</span> <b>${meters.toLocaleString('pt-BR')} m</b> <small>${depthLayer(meters)}</small>`;
    r.mission.innerHTML = this.mission ? `<span class="tag">Missão</span><span>${md(this.mission).replace(/^<p>|<\/p>$/g, '')}</span>` : '';
    r.mission.classList.toggle('show', Boolean(this.mission));
  }
}

export const hud = new Hud();
