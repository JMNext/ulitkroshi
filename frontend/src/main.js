import { Game, AUTO, Scale } from 'phaser';
import { LoginScene } from './game/scenes/LoginScene';
import { GameScene } from './game/scenes/GameScene';
import { MemoryGameScene } from './game/scenes/MemoryGameScene';
import { CatchGameScene } from './game/scenes/CatchGameScene';
import { SnakeGameScene } from './game/scenes/SnakeGameScene';
import './global.css';

window.addEventListener('DOMContentLoaded', () => {
  const config = {
    type: AUTO,
    parent: 'game-container',
    width: 1080,
    height: 1920,
    backgroundColor: '#000000',
    scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH },
    scene: [LoginScene, GameScene, MemoryGameScene, CatchGameScene, SnakeGameScene]
  };

  const game = new Game(config);
  
  // Возвращаем честный старт с нуля
  game.registry.set('coins', 0);
  game.registry.set('hp', 100);

  window.phaserGame = game;
});
