/** Tela de título, nome do jogador, menu de pausa e quadro de missões. */
import { GAME_TITLE } from '../config';
import { sfx } from '../core/audio';
import { state } from '../core/state';
import { dayKey } from '../core/time';
import { currentMainMission, DAILY_CHEST, dailyMissions, MAIN_MISSIONS } from '../game/missions';
import { confirmBox } from './dialog';
import { h, md } from './dom';
import { toast } from './toasts';
import { isCancelKey, isConfirmKey, ui } from './UI';

function menuKeys(buttons: () => HTMLButtonElement[], onCancel?: () => void) {
  let index = 0;
  const focus = (i: number) => {
    const list = buttons().filter((b) => !b.disabled);
    if (!list.length) return;
    index = (i + list.length) % list.length;
    list.forEach((b, k) => b.classList.toggle('active', k === index));
  };
  return {
    focus,
    onKey: (e: KeyboardEvent) => {
      const list = buttons().filter((b) => !b.disabled);
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        focus(index + 1);
        sfx.select();
        return true;
      }
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        focus(index - 1);
        sfx.select();
        return true;
      }
      if (isConfirmKey(e) && !e.repeat) {
        list[index]?.click();
        return true;
      }
      if (isCancelKey(e) && onCancel) {
        onCancel();
        return true;
      }
      return false;
    },
  };
}

export type TitleChoice = 'continue' | 'new';

export function titleScreen(): Promise<TitleChoice> {
  return new Promise((resolve) => {
    const hasSave = state.hasSave();
    const finish = (choice: TitleChoice) => {
      sfx.confirm();
      ui.remove(layer);
      resolve(choice);
    };
    const buttons: HTMLButtonElement[] = [];
    if (hasSave) buttons.push(h('button', { class: 'btn big primary', text: 'Continuar', on: { click: () => finish('continue') } }));
    buttons.push(h('button', { class: `btn big${hasSave ? '' : ' primary'}`, text: 'Novo jogo', on: { click: () => void newGame() } }));
    buttons.push(h('button', { class: 'btn big ghost', text: 'Importar progresso', on: { click: () => void importSave() } }));
    const newGame = async () => {
      if (hasSave && !(await confirmBox('Começar um novo jogo apaga o progresso salvo neste navegador. Continuar?', 'Apagar e começar', 'Cancelar'))) return;
      finish('new');
    };
    const el = h('div', { class: 'layer layer-title' }, [
      h('div', { class: 'title-card' }, [
        h('div', { class: 'title-logo' }, [h('span', { class: 'title-drop', text: '🛢️' }), h('h1', { text: GAME_TITLE })]),
        h('p', { class: 'title-sub', text: 'Um RPG de estudos rumo à aprovação na Petrobras' }),
        h('div', { class: 'title-buttons' }, buttons),
        h('p', { class: 'title-foot', html: 'Explore a vila · aprenda com mentores · cultive a Horta do Saber<br><small>Revisões com FSRS · arte gerada por código · v0.1</small>' }),
      ]),
    ]);
    const keys = menuKeys(() => buttons);
    const layer = ui.push(el, { onKey: keys.onKey });
    keys.focus(0);
  });
}

export function askName(): Promise<string> {
  return new Promise((resolve) => {
    const input = h('input', { class: 'name-input', maxlength: '18', placeholder: 'Seu nome', value: '', autocomplete: 'off', spellcheck: 'false' }) as HTMLInputElement;
    const submit = () => {
      const name = input.value.trim();
      if (!name) {
        input.classList.add('shake');
        window.setTimeout(() => input.classList.remove('shake'), 400);
        return;
      }
      sfx.confirm();
      ui.remove(layer);
      resolve(name);
    };
    const el = h('div', { class: 'layer layer-title' }, [
      h('div', { class: 'panel name-panel' }, [
        h('h2', { text: 'Como devemos te chamar?' }),
        h('p', { class: 'muted', text: 'É assim que os moradores da Vila Maré vão te chamar.' }),
        input,
        h('button', { class: 'btn primary big', text: 'Começar a jornada', on: { click: submit } }),
      ]),
    ]);
    const layer = ui.push(el, {
      onKey: (e) => {
        if (e.code === 'Enter' || e.code === 'NumpadEnter') {
          submit();
          return true;
        }
        return false;
      },
    });
    window.setTimeout(() => input.focus(), 60);
  });
}

function downloadSave(): void {
  const blob = new Blob([state.exportJson()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: `rumo-ao-pre-sal-${dayKey()}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('Progresso exportado. Guarde o arquivo para não perder nada!', 'good', '💾');
}

export function importSave(): Promise<void> {
  return new Promise((resolve) => {
    const input = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none' }) as HTMLInputElement;
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) return resolve();
      try {
        state.importJson(await file.text());
        toast('Progresso importado! Recarregando...', 'good', '💾');
        window.setTimeout(() => location.reload(), 700);
      } catch (err) {
        toast(`Não foi possível importar: ${(err as Error).message}`, 'warn', '⚠️');
      }
      resolve();
    });
    document.body.append(input);
    input.click();
  });
}

export interface PauseActions {
  openNotebook: () => Promise<void>;
  openMissions: () => Promise<void>;
  openBackpack: () => Promise<void>;
}

export function pauseMenu(actions: PauseActions): Promise<void> {
  return new Promise((resolve) => {
    let busy = false;
    const soundLabel = () => `Som: ${state.data.settings.sound ? 'ligado 🔊' : 'desligado 🔇'}`;
    const soundBtn = h('button', { class: 'btn', text: soundLabel() });
    const run = (fn: () => Promise<void> | void) => async () => {
      if (busy) return;
      busy = true;
      el.classList.add('hidden');
      await fn();
      el.classList.remove('hidden');
      busy = false;
    };
    const close = () => {
      if (busy) return;
      ui.remove(layer);
      resolve();
    };
    soundBtn.addEventListener('click', () => {
      state.data.settings.sound = !state.data.settings.sound;
      state.touch();
      soundBtn.textContent = soundLabel();
      sfx.toggle();
    });
    const buttons = [
      h('button', { class: 'btn primary', text: 'Continuar', on: { click: close } }),
      h('button', { class: 'btn', text: '📒 Caderno de estudos', on: { click: run(actions.openNotebook) } }),
      h('button', { class: 'btn', text: '📜 Missões', on: { click: run(actions.openMissions) } }),
      h('button', { class: 'btn', text: '🎒 Mochila', on: { click: run(actions.openBackpack) } }),
      soundBtn,
      h('button', { class: 'btn', text: '💾 Exportar progresso', on: { click: () => downloadSave() } }),
      h('button', { class: 'btn', text: '📂 Importar progresso', on: { click: run(importSave) } }),
      h(
        'button',
        {
          class: 'btn ghost',
          text: 'Voltar ao título',
          on: {
            click: run(async () => {
              state.saveNow();
              location.reload();
            }),
          },
        },
      ),
    ] as HTMLButtonElement[];
    const el = h('div', { class: 'layer layer-modal' }, [
      h('div', { class: 'panel modal pause' }, [h('h2', { text: 'Pausa' }), h('p', { class: 'muted', text: 'Seu progresso é salvo automaticamente neste navegador.' }), h('div', { class: 'pause-buttons' }, buttons)]),
    ]);
    const keys = menuKeys(() => buttons, close);
    const layer = ui.push(el, { onKey: (e) => (busy ? false : keys.onKey(e)) });
    keys.focus(0);
  });
}

export function showMissions(): Promise<void> {
  return new Promise((resolve) => {
    const main = currentMainMission();
    const daily = dailyMissions();
    const chestOpen = Boolean(state.data.missions.daily.chest);
    const doneCount = state.data.missions.done.length;
    const close = () => {
      ui.remove(layer);
      resolve();
    };
    const el = h('div', { class: 'layer layer-modal' }, [
      h('div', { class: 'panel modal missions' }, [
        h('header', { class: 'modal-head' }, [h('h2', { text: '📜 Quadro de Missões' }), h('button', { class: 'btn-close', text: '✕', on: { click: close } })]),
        h('h3', { text: `Missão principal (${doneCount}/${MAIN_MISSIONS.length})` }),
        main
          ? h('div', { class: 'mission main' }, [h('b', { text: main.title }), h('div', { class: 'md', html: md(main.hint) }), h('small', { text: `Recompensa: +${main.reward.xp} XP · +${main.reward.coins} 💰` })])
          : h('p', { class: 'muted', text: 'Você concluiu todas as missões principais. Agora é manter a revisão em dia até a prova!' }),
        h('h3', { text: 'Missões de hoje' }),
        ...daily.map(({ mission, progress, claimed }) =>
          h('div', { class: `mission daily${claimed ? ' done' : ''}` }, [
            h('div', { class: 'mission-row' }, [h('b', { text: `${claimed ? '✅' : '⬜'} ${mission.title}` }), h('small', { text: `+${mission.reward.coins} 💰 · +${mission.reward.xp} XP` })]),
            h('div', { class: 'bar small' }, [h('div', { class: 'bar-fill', style: `width:${(progress / mission.target) * 100}%` })]),
            h('small', { class: 'muted', text: `${progress}/${mission.target}` }),
          ]),
        ),
        h('div', { class: `mission chest${chestOpen ? ' done' : ''}` }, [
          h('div', { class: 'mission-row' }, [
            h('b', { text: chestOpen ? '🎁 Baú do dia aberto!' : '🎁 Baú do dia' }),
            h('small', { text: `+${DAILY_CHEST.coins} 💰 e às vezes ☕ ou 🛡️` }),
          ]),
          h('small', { class: 'muted', text: chestOpen ? 'Volte amanhã para um baú novo.' : `Conclua as 3 missões de hoje (${daily.filter((d) => d.claimed).length}/3).` }),
        ]),
        h('p', { class: 'muted small', text: 'As missões diárias mudam à meia-noite. Conquistas de longo prazo ficam no Caderno (C).' }),
      ]),
    ]);
    const layer = ui.push(el, {
      onKey: (e) => {
        if ((isCancelKey(e) || isConfirmKey(e) || e.code === 'KeyM') && !e.repeat) {
          close();
          return true;
        }
        return false;
      },
    });
  });
}
