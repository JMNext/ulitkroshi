import { AUTO, Game, Scale } from 'phaser';
import { BackgroundManager } from './BackgroundManager';
import { CatchGameScene } from './game/scenes/CatchGame/CatchGameScene';
import { LoginScene } from './game/scenes/LoginScene/LoginScene';
import { MainScene } from './game/scenes/MainScene/MainScene';
import { MemoryGameScene } from './game/scenes/MemoryGame/MemoryGameScene';
import { RegistrationScene_Step1 } from './game/scenes/Registration/Step_1/RegistrationScene_Step1';
import { RegistrationScene_Step2 } from './game/scenes/Registration/Step_2/RegistrationScene_Step2';
import { RegistrationScene_Step3 } from './game/scenes/Registration/Step_3/RegistrationScene_Step3';
import { RegistrationScene_Step4 } from './game/scenes/Registration/Step_4/RegistrationScene_Step4';
import { SnakeGameScene } from './game/scenes/SnakeGame/SnakeGameScene';
import './global.css';

export const BASE_DESIGN_WIDTH = 1080;
export const BASE_DESIGN_HEIGHT = 1920;

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game({
    type: AUTO,
    parent: 'game-container',
    transparent: true,
    backgroundColor: undefined,
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
});
