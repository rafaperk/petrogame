/**
 * Liga a progressão aos eventos do jogo: conquistas, promoções de cargo (com presentes), amostras do poço e
 * avisos da folga que salvou a ofensiva.
 */
import { sfx } from '../core/audio';
import { events } from '../core/events';
import { state } from '../core/state';
import { toast } from '../ui/toasts';
import { collectAchievements } from './achievements';
import { rankIndex, RANKS } from './career';
import { grant, itemById, SAMPLES, type ItemDef } from './items';

const itemText = (items: ItemDef[]) => items.map((g) => `${g.icon} ${g.name}`).join(', ');

/** Verifica conquistas, cargo e amostras; dá as recompensas e avisa. Barato o bastante para rodar após cada atividade. */
export function checkProgress(): void {
  let changed = false;
  const depthBefore = state.data.stats.maxDepth;

  const fresh = collectAchievements();
  const won: ItemDef[] = [];
  let coins = 0;
  for (const a of fresh) {
    coins += a.reward.coins;
    state.addCoins(a.reward.coins);
    state.addXp(a.reward.xp);
    const item = a.reward.item ? itemById.get(a.reward.item) : undefined;
    if (item) {
      grant(item.id);
      won.push(item);
    }
  }
  if (fresh.length > 3) {
    // save antigo ou muita coisa de uma vez: um aviso só
    toast(`**${fresh.length} conquistas** desbloqueadas (+${coins} 💰${won.length ? `, ${itemText(won)}` : ''}). Veja no Caderno (C).`, 'mission', '🏆');
  } else {
    for (const a of fresh) {
      const item = a.reward.item ? itemById.get(a.reward.item) : undefined;
      toast(`Conquista: **${a.title}** (+${a.reward.coins} 💰${item ? `, ${item.icon} ${item.name}` : ''})`, 'mission', a.icon);
    }
  }
  if (fresh.length) changed = true;

  const samples = SAMPLES.filter((s) => depthBefore < s.depth && state.data.stats.maxDepth >= s.depth);
  if (samples.length) {
    toast(`Nova${samples.length > 1 ? 's amostras' : ' amostra'} do poço: **${samples.map((s) => `${s.icon} ${s.name}`).join(', ')}** — veja na mochila (I).`, 'good', samples[samples.length - 1].icon);
    changed = true;
  }

  const rank = rankIndex(state.data.level);
  if (rank > state.data.rank) {
    const gifts: ItemDef[] = [];
    for (let i = state.data.rank + 1; i <= rank; i++) {
      for (const id of RANKS[i].gift ?? []) {
        grant(id);
        const item = itemById.get(id);
        if (item) gifts.push(item);
      }
    }
    state.data.rank = rank;
    toast(`Promoção: **${RANKS[rank].title}**!${gifts.length ? ` Presente: ${itemText(gifts)}.` : ''} Novas peças no Armazém da Dona Cida.`, 'level', '🎖️');
    sfx.levelUp();
    changed = true;
  }
  if (changed) state.touch();
}

let bound = false;

export function bindProgress(): void {
  if (bound) return;
  bound = true;
  const later = () => queueMicrotask(checkProgress);
  events.on('session:completed', later);
  events.on('game:completed', later);
  events.on('topic:learned', later);
  events.on('level:up', later);
  events.on('player:look', later);
  events.on('mission:completed', later);
  events.on('streak:saved', ({ days }) => {
    toast(`${days > 1 ? `${days} folgas salvaram` : 'Uma folga salvou'} a sua ofensiva!`, 'good', '🛡️');
  });
  checkProgress();
}
