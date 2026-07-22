import { WEBGL, Game, Scale, Sound, Loader } from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { LoginScene } from './game/scenes/LoginScene/LoginScene';
import { RegistrationScene_Step1 } from './game/scenes/Registration/Step_1/RegistrationScene_Step1';
import { RegistrationScene_Step2 } from './game/scenes/Registration/Step_2/RegistrationScene_Step2';
import { RegistrationScene_Step3 } from './game/scenes/Registration/Step_3/RegistrationScene_Step3';
import { RegistrationScene_Step4 } from './game/scenes/Registration/Step_4/RegistrationScene_Step4';
import { MainScene } from './game/scenes/MainScene/MainScene';
import { MemoryGameScene } from './game/scenes/MemoryGame/MemoryGameScene';
import { CatchGameScene } from './game/scenes/CatchGame/CatchGameScene';
import { SnakeGameScene } from './game/scenes/SnakeGame/SnakeGameScene';
import './global.css';

import soundMainTheme from '/src/assets/resources/sound/main_theme.mp3?url';

const game = new Game({
  type: WEBGL,
  parent: 'game-container',
  render: {
    transparent: true,
    clearBeforeRender: true
  },
  scale: {
    // RESIZE позволяет холсту Phaser занимать 100% реальной ширины и высоты браузера
    mode: Scale.RESIZE,
    autoCenter: Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
  input: {
    keyboard: true,
  },
  scene: [
    LoginScene, 
    RegistrationScene_Step1,
    RegistrationScene_Step2,
    RegistrationScene_Step3,
    RegistrationScene_Step4,
    MainScene, 
    MemoryGameScene,
    CatchGameScene,
    SnakeGameScene,
  ],
});

game.events.once('ready', () => {
  const startMusic = (): void => {
    // Безопасное сужение типов для TypeScript через instanceof
    if (game.sound instanceof Sound.WebAudioSoundManager) {
      if (game.sound.context && game.sound.context.state === 'suspended') {
        game.sound.context.resume().catch(() => {});
      }
    }
    
    // Возвращаем удаленную логику загрузки и проверки кэша звука
    if (!game.cache.audio.exists('main_theme')) {
      const activeScenes = game.scene.scenes;
      // Передаем первую активную сцену для корректной инициализации плагина загрузчика
      if (activeScenes && activeScenes.length > 0 && activeScenes[0]) {
        const loader = new Loader.LoaderPlugin(activeScenes[0]);
        loader.audio('main_theme', soundMainTheme);
        loader.once('complete', () => {
          game.sound.play('main_theme', { volume: 0.75, loop: true });
        });
        loader.start();
      }
    } else if (!game.sound.get('main_theme')) {
      game.sound.play('main_theme', { volume: 0.75, loop: true });
    }
    
    window.removeEventListener('click', startMusic);
    window.removeEventListener('touchstart', startMusic);
  };

  window.addEventListener('click', startMusic, { passive: true });
  window.addEventListener('touchstart', startMusic, { passive: true });
});
