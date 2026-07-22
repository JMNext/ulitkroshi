import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { GameHeaderUI } from '../../../ui/components/GameHeader/GameHeaderUI';
import { GameOverModalUI } from '../../../ui/components/GameOverModal/GameOverModalUI';
import { MobileControls } from '../../../ui/components/MobileControls/MobileControls';
import { useSnakeGameStore } from './useSnakeGameStore';
import { SnakeGameScene } from './SnakeGameScene';

export class SnakeGameUiManager {
  private scene: SnakeGameScene;
  private root: Root | null = null;
  private uiContainer: HTMLDivElement | null = null;

  constructor(scene: SnakeGameScene) {
    this.scene = scene;
  }

  public createUiContainer(): void {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    gameContainer.querySelectorAll('[id="phaser-snake-ui-root"]').forEach(layer => layer.remove());

    this.uiContainer = document.createElement('div');
    this.uiContainer.id = 'phaser-snake-ui-root';
    this.uiContainer.className = 'absolute inset-0 w-full h-full z-40 overflow-hidden bg-transparent pointer-events-none';
    gameContainer.appendChild(this.uiContainer);

    this.root = createRoot(this.uiContainer);
  }

  public render(): void {
    const state = useSnakeGameStore.getState();
    const isPortrait = window.innerHeight > window.innerWidth;

    const controlsContainerClass = isPortrait
      ? 'pointer-events-auto absolute inset-x-0 bottom-0 z-50 h-[240px]'
      : 'absolute inset-0 w-full h-full z-40 pointer-events-none';

    this.root?.render(
      React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'pointer-events-auto absolute inset-x-0 top-0 z-50 h-24' },
          React.createElement(GameHeaderUI, {
            score: this.scene.score,
            hp: this.scene.hp,
            scoreLabel: "СЧЕТ",
            onBack: () => this.scene.exitGame()
          })
        ),

        !state.isGameOver && React.createElement('div', { className: controlsContainerClass },
          React.createElement(MobileControls, {
            type: 'cross',
            onChangeDir: (dir) => {
              if (typeof dir === 'string' && this.scene.logicManager) {
                this.scene.logicManager.changeDirection(dir);
              }
            }
          })
        ),

        state.isGameOver && React.createElement('div', { className: 'pointer-events-auto absolute inset-0 z-50' },
          React.createElement(GameOverModalUI, {
            score: this.scene.score,
            isWin: this.scene.score >= 20,
            onRestart: () => this.scene.scene.restart(),
            onBack: () => this.scene.exitGame()
          })
        )
      )
    );
  }

  public destroy(): void {
    try {
      this.root?.unmount();
    } catch (e) {
      console.error(e);
    }
    this.root = null;
    if (this.uiContainer) {
      this.uiContainer.remove();
      this.uiContainer = null;
    }
    document.getElementById('snake-html-pet-entity')?.remove();
  }
}
