import '@fontsource/pixelify-sans/500.css';
import '@fontsource/pixelify-sans/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import './styles/ui.css';
import './styles/games.css';
import './styles/labs.css';

import Phaser from 'phaser';
import { input } from './core/input';
import { state } from './core/state';
import { bindMissionTracking, checkMissions, currentMainMission, ensureDaily } from './game/missions';
import { bindProgress } from './game/progress';
import { events } from './core/events';
import { content } from './learning/content';
import { initSrs } from './learning/srs';
import { BootScene } from './scenes/BootScene';
import { WorldScene, worldReady } from './scenes/WorldScene';
import { say } from './ui/dialog';
import { hud } from './ui/hud';
import { askName, titleScreen } from './ui/menus';
import { toast } from './ui/toasts';
import { ui } from './ui/UI';
import { sfx } from './core/audio';

async function main(): Promise<void> {
  ui.init(document.getElementById('ui')!);
  input.init();
  await initSrs();

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#3f8fcc',
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [BootScene, WorldScene],
  });
  const world = await worldReady;
  // atalho de depuração (só no modo de desenvolvimento): window.__world no console do navegador
  if (import.meta.env.DEV) Object.assign(window, { __world: world, __state: state });

  const choice = await titleScreen();
  let isNew = choice === 'new';
  if (choice === 'continue' && !state.load()) isNew = true;
  if (isNew) {
    state.wipe();
    state.newGame(await askName());
  }

  bindMissionTracking();
  ensureDaily();
  bindProgress();
  const updateMission = () => hud.setMission(currentMainMission()?.hint ?? '');
  events.on('state:changed', updateMission);
  events.on('mission:completed', updateMission);
  events.on('level:up', ({ level }) => {
    sfx.levelUp();
    toast(`Subiu para o **nível ${level}**!`, 'level', '⭐');
  });

  hud.mount({
    openNotebook: () => void world.openNotebook(),
    openMenu: () => void world.openMenu(),
    openMissions: () => void world.openMissions(),
  });
  updateMission();
  world.startPlaying();

  if (content.errors.length) {
    toast(`Conteúdo com ${content.errors.length} problema(s) — veja o console (F12).`, 'warn', '⚠️');
  }

  if (isNew) {
    await say(null, [
      'Você desembarca na **Vila Maré**, uma vila costeira onde se formam os futuros profissionais do petróleo.',
      'Sua meta: chegar ao **pré-sal** — dominar o conteúdo da prova da Petrobras. Cada tópico aprendido e bem revisado aprofunda o seu poço.',
      '**Controles:** WASD ou setas para andar, **Shift** para correr, **E** para interagir, **C** abre o caderno, **I** a mochila e **Esc**, o menu.',
      'Comece falando com **Seu Joaquim**, perto da fonte da praça. Siga o caminho para a direita!',
    ]);
  } else {
    toast(`Que bom te ver de volta, **${state.data.player.name}**!`, 'info', '👋');
  }
  checkMissions();
}

main().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML('beforeend', `<pre class="fatal">Erro ao iniciar o jogo:\n${String(err?.stack ?? err)}</pre>`);
});
