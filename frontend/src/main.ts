import { WEBGL, Game, Scale, Sound, Loader } from 'phaser';
import { BackgroundManager } from './BackgroundManager';
import { CatchGameScene } from './game/scenes/CatchGame/CatchGameScene';
import { LoginScene } from './game/scenes/LoginScene/LoginScene';
import { MainScene } from './game/scenes/MainScene/MainScene';
import { MemoryGameScene } from './game/scenes/MemoryGame/MemoryGameScene';
import { SnakeGameScene } from './game/scenes/SnakeGame/SnakeGameScene';
import './global.css';
import { RegistrationScene_Step1 } from './game/scenes/Registration/Step_1/RegistrationScene_Step1';
import { RegistrationScene_Step2 } from './game/scenes/Registration/Step_2/RegistrationScene_Step2';
import { RegistrationScene_Step3 } from './game/scenes/Registration/Step_3/RegistrationScene_Step3';
import { RegistrationScene_Step4 } from './game/scenes/Registration/Step_4/RegistrationScene_Step4';

import soundMainTheme from '/src/assets/resources/sound/main_theme.mp3?url';

window.addEventListener('DOMContentLoaded', () => {
 
  const game = new Game({
    type: WEBGL,
    parent: 'game-container',
    
    render: {
      transparent: true,
      clearBeforeRender: true
    },
    
    transparent: true,
    clearBeforeRender: true,
    
    scale: {
      mode: Scale.RESIZE,
      autoCenter: Scale.CENTER_BOTH,
    },
    dom: {
      createContainer: true,
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

  BackgroundManager.getInstance().init(game);

  game.events.once('ready', () => {
    const startMusic = () => {
      if (game.sound instanceof Sound.WebAudioSoundManager) {
        if (game.sound.context && game.sound.context.state === 'suspended') {
          game.sound.context.resume();
        }
      }
      
      if (!game.cache.audio.exists('main_theme')) {
        const activeScenes = game.scene.scenes;
        if (activeScenes && activeScenes.length > 0) {
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
});
