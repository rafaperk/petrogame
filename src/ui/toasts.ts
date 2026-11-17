/** Notificações rápidas no canto da tela (+XP, nível, missão concluída...). */
import { h, md } from './dom';
import { ui } from './UI';

export type ToastKind = 'info' | 'good' | 'xp' | 'level' | 'warn' | 'mission';

let container: HTMLElement | null = null;

export function toast(text: string, kind: ToastKind = 'info', icon = ''): void {
  if (!container) {
    container = h('div', { class: 'toasts' });
    ui.root.append(container);
  }
  const el = h('div', { class: `toast toast-${kind}` }, [
    icon ? h('span', { class: 'toast-icon', text: icon }) : null,
    h('span', { html: md(text).replace(/^<p>|<\/p>$/g, '') }),
  ]);
  container.append(el);
  requestAnimationFrame(() => el.classList.add('in'));
  const ttl = kind === 'level' || kind === 'mission' ? 4200 : 3000;
  window.setTimeout(() => {
    el.classList.remove('in');
    el.classList.add('out');
    window.setTimeout(() => el.remove(), 400);
  }, ttl);
}
