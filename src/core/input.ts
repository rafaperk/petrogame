/**
 * Teclado centralizado: decide se a tecla vai para a interface (painel aberto) ou para o mundo.
 */
import { ui } from '../ui/UI';

type WorldKeyHandler = (e: KeyboardEvent) => void;

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
};

class Input {
  private down = new Set<string>();
  private worldHandler: WorldKeyHandler | null = null;

  init(): void {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => this.down.clear());
  }

  setWorldHandler(handler: WorldKeyHandler | null): void {
    this.worldHandler = handler;
  }

  /** Teclas de movimento: só valem quando nenhum painel está aberto. */
  isDown(...codes: string[]): boolean {
    if (ui.isBlocking()) return false;
    return codes.some((c) => this.down.has(c));
  }

  private onKeyDown(e: KeyboardEvent): void {
    const typing = isTyping(e.target);
    if (!typing) this.down.add(e.code);
    if (ui.hasModal()) {
      if (typing && e.code !== 'Escape' && e.code !== 'Enter') return;
      ui.handleKey(e);
      return;
    }
    if (typing || e.repeat) return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
    if (!ui.isBlocking()) this.worldHandler?.(e);
  }
}

export const input = new Input();
