import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { GameHeaderUI } from '../../../ui/components/GameHeader/GameHeaderUI';
import { GameOverModalUI } from '../../../ui/components/GameOverModal/GameOverModalUI';
import { useCatchGameStore } from './useCatchGameStore';
import { CatchGameScene } from './CatchGameScene';

export class CatchGameUiManager {
  private scene: CatchGameScene;
  private root: Root | null = null;
  private uiContainer: HTMLDivElement | null = null;

  constructor(scene: CatchGameScene) {
    this.scene = scene;
  }

  public createUiContainer(): void {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    const oldLayers = gameContainer.querySelectorAll('[id="phaser-catch-ui-root"]');
    oldLayers.forEach(layer => layer.remove());

    this.uiContainer = document.createElement('div');
    this.uiContainer.id = 'phaser-catch-ui-root';
    this.uiContainer.className = 'absolute inset-0 w-full h-full z-10 overflow-hidden bg-transparent pointer-events-none';
    gameContainer.appendChild(this.uiContainer);

    this.root = createRoot(this.uiContainer);
  }

  public render(): void {
    const state = useCatchGameStore.getState();
    this.root?.render(
      React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'pointer-events-auto absolute inset-x-0 top-0 z-50 h-32' },
          React.createElement(GameHeaderUI, {
            score: this.scene.score,
            hp: this.scene.hp,
            scoreLabel: "СЧЕТ",
            onBack: () => this.scene.exitGame()
          })
        ),
        state.isGameOver && React.createElement('div', { className: 'pointer-events-auto absolute inset-0 z-50' },
          React.createElement(GameOverModalUI, {
            score: this.scene.score,
            isWin: state.isWin,
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
    const rawPet = document.getElementById('catch-raw-html-pet');
    if (rawPet) rawPet.remove();
  }
}
