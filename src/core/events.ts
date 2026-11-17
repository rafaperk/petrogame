/**
 * Barramento de eventos tipado. Desacopla mundo (Phaser), interface (DOM) e lógica de estudo.
 */
import type { SessionSummary } from '../learning/session';

export interface GameEvents {
  'state:changed': undefined;
  answer: { questionId: string; topicId: string; correct: boolean; firstAttempt: boolean; difficulty: number };
  'session:completed': SessionSummary;
  'topic:learned': { topicId: string };
  'game:completed': { gameId: string; topicId: string; accuracy: number; level: number };
  'level:up': { level: number };
  'mission:completed': { id: string; title: string };
  'garden:changed': undefined;
  'world:refresh': undefined;
  /** O visual do personagem mudou (loja/mochila). */
  'player:look': undefined;
  /** Folgas gastas para salvar a ofensiva. */
  'streak:saved': { days: number };
}

type Handler<T> = (payload: T) => void;

class EventBus {
  private handlers = new Map<keyof GameEvents, Set<Handler<never>>>();

  on<K extends keyof GameEvents>(key: K, handler: Handler<GameEvents[K]>): () => void {
    let set = this.handlers.get(key);
    if (!set) {
      set = new Set();
      this.handlers.set(key, set);
    }
    set.add(handler as Handler<never>);
    return () => set!.delete(handler as Handler<never>);
  }

  emit<K extends keyof GameEvents>(key: K, ...payload: GameEvents[K] extends undefined ? [] : [GameEvents[K]]): void {
    const set = this.handlers.get(key);
    if (!set) return;
    for (const handler of [...set]) {
      try {
        (handler as Handler<GameEvents[K] | undefined>)(payload[0]);
      } catch (err) {
        console.error(`[events] erro no handler de "${String(key)}"`, err);
      }
    }
  }
}

export const events = new EventBus();
