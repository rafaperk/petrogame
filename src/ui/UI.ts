/**
 * Gerenciador de camadas da interface (DOM por cima do canvas do Phaser).
 * Enquanto houver uma camada "modal" aberta, o mundo não recebe teclado (o jogador para).
 */

export type KeyHandler = (e: KeyboardEvent) => boolean | void;

export interface Layer {
  el: HTMLElement;
  modal: boolean;
  onKey?: KeyHandler;
}

class UIManager {
  root!: HTMLElement;
  private layers: Layer[] = [];
  private blockedUntil = 0;

  init(root: HTMLElement): void {
    this.root = root;
  }

  push(el: HTMLElement, opts: { modal?: boolean; onKey?: KeyHandler } = {}): Layer {
    const layer: Layer = { el, modal: opts.modal ?? true, onKey: opts.onKey };
    this.layers.push(layer);
    this.root.append(el);
    // fade-in; o setTimeout garante a entrada mesmo se a aba estiver em segundo plano (sem rAF)
    const show = () => el.classList.add('in');
    requestAnimationFrame(show);
    setTimeout(show, 80);
    return layer;
  }

  remove(layer: Layer): void {
    const i = this.layers.indexOf(layer);
    if (i >= 0) this.layers.splice(i, 1);
    layer.el.remove();
    // pequena trava para a tecla que fechou o painel não "vazar" para o mundo
    this.blockedUntil = performance.now() + 180;
  }

  isBlocking(): boolean {
    return this.layers.some((l) => l.modal) || performance.now() < this.blockedUntil;
  }

  hasModal(): boolean {
    return this.layers.some((l) => l.modal);
  }

  /** Entrega a tecla à camada modal do topo. Retorna true se alguém tratou. */
  handleKey(e: KeyboardEvent): boolean {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      if (!layer.onKey) {
        if (layer.modal) return false;
        continue;
      }
      const handled = layer.onKey(e);
      if (handled) {
        e.preventDefault();
        return true;
      }
      if (layer.modal) return false;
    }
    return false;
  }
}

export const ui = new UIManager();

export const isConfirmKey = (e: KeyboardEvent) => ['Enter', 'Space', 'KeyE', 'NumpadEnter'].includes(e.code);
export const isCancelKey = (e: KeyboardEvent) => e.code === 'Escape';
