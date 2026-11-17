/**
 * Armazém da Dona Cida (loja), mochila (itens, visual, amostras do poço e carreira) e o painel de conquistas.
 */
import { portraitFor } from '../art/characters';
import { BOOST_MINUTES } from '../config';
import { sfx } from '../core/audio';
import { state, type OutfitSlot } from '../core/state';
import { ACHIEVEMENTS, isUnlocked } from '../game/achievements';
import { nextRank, rankIndex, rankOf, RANKS } from '../game/career';
import {
  boostMinutesLeft,
  buy,
  canBuy,
  drinkCoffee,
  equip,
  itemById,
  itemCount,
  ITEMS,
  lookWith,
  owns,
  playerLook,
  rankNeeded,
  SAMPLES,
  samplesOwned,
  SLOT_NAMES,
  SLOTS,
  type ItemDef,
} from '../game/items';
import { h, md } from './dom';
import { toast } from './toasts';
import { isCancelKey, ui } from './UI';

const mdInline = (text: string) => md(text).replace(/^<p>|<\/p>$/g, '');

function modal(title: string, cls: string, build: (body: HTMLElement, rerender: () => void) => void, onClose?: () => void): Promise<void> {
  return new Promise((resolve) => {
    const body = h('div', { class: 'shop-body' });
    const close = () => {
      ui.remove(layer);
      onClose?.();
      resolve();
    };
    const panel = h('div', { class: `panel modal shop ${cls}` }, [
      h('header', { class: 'modal-head' }, [h('h2', { text: title }), h('button', { class: 'btn-close', title: 'Fechar (Esc)', text: '✕', on: { click: close } })]),
      body,
    ]);
    const rerender = () => {
      const top = body.scrollTop;
      body.innerHTML = '';
      build(body, rerender);
      body.scrollTop = top;
    };
    const layer = ui.push(h('div', { class: 'layer layer-modal' }, [panel]), {
      onKey: (e) => {
        if (isCancelKey(e) || (cls === 'backpack' && e.code === 'KeyI')) {
          close();
          return true;
        }
        return false;
      },
    });
    rerender();
  });
}

function wallet(): HTMLElement {
  const d = state.data;
  return h('div', { class: 'shop-wallet' }, [
    h('span', { class: 'wallet-chip', text: `💰 ${d.coins}` }),
    h('span', { class: 'wallet-chip', text: `🎖️ ${rankOf(d.level).title} · Nv ${d.level}` }),
  ]);
}

// ---------------------------------------------------------------- loja

const SHOP_GROUPS: { title: string; filter: (i: ItemDef) => boolean }[] = [
  { title: 'Consumíveis', filter: (i) => i.kind === 'consumable' },
  { title: 'Cabeça', filter: (i) => i.slot === 'hat' },
  { title: 'Colete e óculos', filter: (i) => i.slot === 'vest' || i.slot === 'glasses' },
  { title: 'Uniformes', filter: (i) => i.slot === 'uniform' },
];

export function openShop(): Promise<void> {
  let preview: ItemDef | null = null;
  return modal('🧺 Armazém da Dona Cida', 'store', (body, rerender) => {
    const look = preview?.look ? lookWith(preview) : playerLook();
    body.append(
      h('div', { class: 'shop-top' }, [
        h('img', { class: 'shop-portrait', src: portraitFor(look), alt: '' }),
        h('div', { class: 'shop-intro' }, [
          h('div', { class: 'md', html: md(preview ? `Experimentando: **${preview.icon} ${preview.name}**` : 'Passe o mouse numa peça para **experimentar**. As peças melhores pedem um cargo mais alto: suba de nível estudando.') }),
          wallet(),
        ]),
      ]),
    );
    for (const group of SHOP_GROUPS) {
      body.append(h('h3', { class: 'shop-group', text: group.title }));
      const list = h('div', { class: 'shop-list' });
      for (const item of ITEMS.filter(group.filter)) {
        const check = canBuy(item);
        const label =
          check === 'owned'
            ? 'Já é seu'
            : check === 'max'
              ? `Máximo (${item.max})`
              : check === 'rank'
                ? `🔒 ${rankNeeded(item)}`
                : `Comprar · ${item.price} 💰`;
        const status = item.kind === 'consumable' ? `Na mochila: ${itemCount(item.id)}` : owns(item.id) ? (state.data.outfit[item.slot!] === item.id ? 'Em uso' : 'Na mochila') : '';
        const row = h('div', { class: `shop-item${check === 'rank' ? ' locked' : ''}` }, [
          h('span', { class: 'shop-icon', text: item.icon }),
          h('div', { class: 'shop-info' }, [h('b', { text: item.name }), h('small', { html: mdInline(item.desc) }), status ? h('small', { class: 'muted', text: status }) : null]),
          h('button', {
            class: `btn small${check === 'ok' ? ' primary' : ''}`,
            text: label,
            disabled: check !== 'ok',
            on: {
              click: () => {
                if (buy(item) !== 'ok') return;
                sfx.coin();
                if (item.kind === 'cosmetic' && item.slot) {
                  equip(item.slot, item.id);
                  toast(`Comprado e vestido: **${item.icon} ${item.name}**. Troque quando quiser na mochila (I).`, 'good', item.icon);
                } else toast(`Comprado: **${item.icon} ${item.name}** (na mochila: ${itemCount(item.id)}).`, 'good', item.icon);
                rerender();
              },
            },
          }),
        ]);
        if (item.look) {
          row.addEventListener('mouseenter', () => {
            if (preview === item) return;
            preview = item;
            rerender();
          });
        }
        list.append(row);
      }
      body.append(list);
    }
  });
}

// ---------------------------------------------------------------- mochila

type BagTab = 'itens' | 'visual' | 'amostras' | 'carreira';

export function openBackpack(initial: BagTab = 'itens'): Promise<void> {
  let tab: BagTab = initial;
  return modal('🎒 Mochila', 'backpack', (body, rerender) => {
    const tabs: [BagTab, string][] = [
      ['itens', 'Itens'],
      ['visual', 'Visual'],
      ['amostras', 'Amostras do poço'],
      ['carreira', 'Carreira'],
    ];
    body.append(
      h(
        'nav',
        { class: 'tabs bag-tabs' },
        tabs.map(([id, label]) => h('button', { class: `tab${tab === id ? ' active' : ''}`, text: label, on: { click: () => ((tab = id), sfx.page(), rerender()) } })),
      ),
    );
    if (tab === 'itens') renderItems(body, rerender);
    else if (tab === 'visual') renderOutfit(body, rerender);
    else if (tab === 'amostras') renderSamples(body);
    else renderCareer(body);
  });
}

function renderItems(body: HTMLElement, rerender: () => void): void {
  const boost = boostMinutesLeft();
  body.append(
    h('div', { class: 'shop-top' }, [
      h('div', { class: 'shop-intro' }, [
        h('div', {
          class: 'md',
          html: md(boost ? `☕ **Cafezinho ativo:** +50% de XP por mais **${boost} min**.` : 'Os itens de consumo ficam aqui. Compre mais no **Armazém da Dona Cida**, na praça.'),
        }),
        wallet(),
      ]),
    ]),
  );
  const list = h('div', { class: 'shop-list' });
  for (const item of ITEMS.filter((i) => i.kind === 'consumable')) {
    const n = itemCount(item.id);
    const action =
      item.id === 'cafe'
        ? h('button', {
            class: `btn small${n ? ' primary' : ''}`,
            text: `Tomar (${n})`,
            disabled: !n,
            on: {
              click: () => {
                if (!drinkCoffee()) return;
                sfx.confirm();
                toast(`☕ Cafezinho: +50% de XP pelos próximos ${BOOST_MINUTES} min (agora: ${boostMinutesLeft()} min).`, 'good', '☕');
                rerender();
              },
            },
          })
        : h('span', { class: 'wallet-chip', text: `${n} / ${item.max}` });
    list.append(
      h('div', { class: 'shop-item' }, [
        h('span', { class: 'shop-icon', text: item.icon }),
        h('div', { class: 'shop-info' }, [h('b', { text: item.name }), h('small', { html: mdInline(item.desc) })]),
        action,
      ]),
    );
  }
  body.append(list);
}

function renderOutfit(body: HTMLElement, rerender: () => void): void {
  body.append(
    h('div', { class: 'shop-top' }, [
      h('img', { class: 'shop-portrait', src: portraitFor(playerLook()), alt: '' }),
      h('div', { class: 'shop-intro' }, [h('div', { class: 'md', html: md('Clique numa peça para **vestir** (ou tirar). Peças novas no **Armazém da Dona Cida** e nas promoções de cargo.') })]),
    ]),
  );
  for (const slot of SLOTS) {
    const items = state.data.owned.map((id) => itemById.get(id)).filter((i): i is ItemDef => Boolean(i && i.slot === slot));
    body.append(h('h3', { class: 'shop-group', text: SLOT_NAMES[slot] }));
    if (!items.length) {
      body.append(h('p', { class: 'muted small', text: 'Nenhuma peça ainda.' }));
      continue;
    }
    body.append(
      h(
        'div',
        { class: 'outfit-row' },
        items.map((item) => {
          const on = state.data.outfit[slot as OutfitSlot] === item.id;
          return h('button', {
            class: `outfit-piece${on ? ' on' : ''}`,
            title: item.desc,
            html: `<img src="${portraitFor(lookWith(item))}" alt=""><span>${item.icon} ${item.name}</span><small>${on ? 'em uso · tirar' : 'vestir'}</small>`,
            on: {
              click: () => {
                equip(slot, on ? null : item.id);
                sfx.select();
                rerender();
              },
            },
          });
        }),
      ),
    );
  }
}

function renderSamples(body: HTMLElement): void {
  const have = new Set(samplesOwned().map((s) => s.id));
  body.append(
    h('p', {
      class: 'muted',
      html: mdInline(`Uma amostra nova a cada **1.000 m** de profundidade máxima alcançada (a sua: **${state.data.stats.maxDepth.toLocaleString('pt-BR')} m**). Elas não se perdem quando o poço "sobe" por falta de revisão.`),
    }),
  );
  body.append(
    h(
      'div',
      { class: 'sample-grid' },
      SAMPLES.map((s) =>
        have.has(s.id)
          ? h('div', { class: 'sample' }, [h('span', { class: 'sample-icon', text: s.icon }), h('b', { text: s.name }), h('small', { class: 'muted', text: `${s.depth.toLocaleString('pt-BR')} m` }), h('p', { text: s.text })])
          : h('div', { class: 'sample locked' }, [h('span', { class: 'sample-icon', text: '❔' }), h('b', { text: '???' }), h('small', { class: 'muted', text: `${s.depth.toLocaleString('pt-BR')} m` })]),
      ),
    ),
  );
}

function renderCareer(body: HTMLElement): void {
  const level = state.data.level;
  const current = rankIndex(level);
  const next = nextRank(level);
  body.append(
    h('div', { class: 'shop-top' }, [
      h('img', { class: 'shop-portrait', src: portraitFor(playerLook()), alt: '' }),
      h('div', { class: 'shop-intro' }, [
        h('div', {
          class: 'md',
          html: md(`Cargo atual: **${RANKS[current].title}** (nível ${level}).${next ? `\nPróxima promoção: **${next.title}** no nível ${next.level}.` : '\nTopo da carreira!'}\nXP vem de estudar: acertar questões (mais nas difíceis), jogar, revisar, vencer desafios e simulados.`),
        }),
      ]),
    ]),
  );
  body.append(
    h(
      'ol',
      { class: 'career-list' },
      RANKS.map((r, i) =>
        h('li', { class: i <= current ? 'done' : '' }, [
          h('b', { text: `${i <= current ? '🎖️' : '🔒'} ${r.title}` }),
          h('small', { text: ` · nível ${r.level}${r.gift?.length ? ` · presente: ${r.gift.map((g) => `${itemById.get(g)?.icon ?? ''} ${itemById.get(g)?.name ?? g}`).join(', ')}` : ''}` }),
        ]),
      ),
    ),
  );
}

// ---------------------------------------------------------------- conquistas (aba do Caderno)

export function renderAchievements(body: HTMLElement): void {
  const unlocked = ACHIEVEMENTS.filter((a) => isUnlocked(a.id)).length;
  body.append(
    h('div', { class: 'nb-summary' }, [
      h('div', {}, [h('strong', { text: `🏆 ${unlocked} de ${ACHIEVEMENTS.length} conquistas` }), h('small', { text: ' — cada uma dá moedas e XP; algumas trazem itens.' })]),
    ]),
  );
  const sorted = [...ACHIEVEMENTS].sort((a, b) => Number(isUnlocked(b.id)) - Number(isUnlocked(a.id)));
  body.append(
    h(
      'div',
      { class: 'ach-grid' },
      sorted.map((a) => {
        const done = isUnlocked(a.id);
        const [value, target] = a.progress();
        const item = a.reward.item ? itemById.get(a.reward.item) : undefined;
        return h('div', { class: `ach${done ? ' done' : ''}` }, [
          h('span', { class: 'ach-icon', text: done ? a.icon : '🔒' }),
          h('div', { class: 'ach-info' }, [
            h('b', { text: a.title }),
            h('small', { text: a.desc }),
            done
              ? h('small', { class: 'muted', text: `Desbloqueada em ${new Date(state.data.achievements[a.id]).toLocaleDateString('pt-BR')}` })
              : target > 1
                ? h('div', { class: 'ach-progress' }, [h('div', { class: 'bar small' }, [h('div', { class: 'bar-fill', style: `width:${(value / target) * 100}%` })]), h('small', { text: `${value.toLocaleString('pt-BR')}/${target.toLocaleString('pt-BR')}` })])
                : null,
            h('small', { class: 'ach-reward', text: `+${a.reward.coins} 💰 · +${a.reward.xp} XP${item ? ` · ${item.icon} ${item.name}` : ''}` }),
          ]),
        ]);
      }),
    ),
  );
}
