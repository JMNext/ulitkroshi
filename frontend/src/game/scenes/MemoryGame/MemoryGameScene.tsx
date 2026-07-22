import { Scene } from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useMemoryGameStore } from './useMemoryGameStore';
import { GameHeaderUI } from '../../../ui/components/GameHeader/GameHeaderUI';
import { GameOverModalUI } from '../../../ui/components/GameOverModal/GameOverModalUI';
import { MemoryGrid } from './components/MemoryGrid';
import { MemoryPet } from './components/MemoryPet';

import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';

const FRUITS_POOL = ['01', '02', '03', '04', '05', '06', '07', '08', '10', '11', '12', '14', '15', '16'];

export class MemoryGameScene extends Scene {
  private root: Root | null = null;
  private uiContainer: HTMLDivElement | null = null;
  private bgImage: Phaser.GameObjects.Image | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private handleWindowResizeBound: () => void;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private initUiTimeout: ReturnType<typeof setTimeout> | null = null;

  public difficulty = 'medium';
  public totalPairs = 6;

  constructor() {
    super('MemoryGameScene');
    // ИСПРАВЛЕНО: биндим чистую функцию класса, чтобы убрать ошибку типов TS
    this.handleWindowResizeBound = this.handleWindowResize.bind(this);
  }

  public init(data: { difficulty?: 'easy' | 'medium' | 'hard' }): void {
    this.difficulty = data.difficulty || 'medium';
    const pairsConfig = { easy: 4, medium: 6, hard: 8 };
    this.totalPairs = pairsConfig[this.difficulty as 'easy' | 'medium' | 'hard'] || 6;
    useMemoryGameStore.getState().initGame(this.totalPairs, FRUITS_POOL);
  }

  public preload(): void {
    this.load.image('memory_bg_horiz', fonGorizImg);
    this.load.image('memory_bg_vert', fonVertImg);
  }

  public create(): void {
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);

    this.bgImage = this.add.image(0, 0, 'memory_bg_horiz').setOrigin(0, 0);
    this.executeBackgroundResize();

    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      document.getElementById('phaser-memory-ui-root')?.remove();
      this.uiContainer = document.createElement('div');
      this.uiContainer.id = 'phaser-memory-ui-root';
      this.uiContainer.className = 'absolute inset-0 w-full h-full z-40 overflow-hidden bg-transparent pointer-events-none';
      gameContainer.appendChild(this.uiContainer);
      this.root = createRoot(this.uiContainer);
    }

    const syncUI = () => {
      const state = useMemoryGameStore.getState();
      this.root?.render(
        React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'pointer-events-auto absolute inset-x-0 top-0 z-50 h-24' },
            React.createElement(GameHeaderUI, { score: state.score, onBack: () => this.exitGameSession() })
          ),
          React.createElement(MemoryGrid, { difficulty: this.difficulty, totalPairs: this.totalPairs, onReady: () => {}, scene: this }),
          React.createElement(MemoryPet, null),
          state.isGameOver && React.createElement('div', { className: 'pointer-events-auto absolute inset-0 z-50' },
            React.createElement(GameOverModalUI, {
              score: state.score,
              isWin: true,
              onRestart: () => this.scene.restart(),
              onBack: () => this.exitGameSession()
            })
          )
        )
      );
    };

    this.initUiTimeout = setTimeout(() => {
      syncUI();

      this.unsubscribeStore = useMemoryGameStore.subscribe(
        (state) => `${state.deck.length}-${state.score}-${state.isGameOver}-${state.canClick}`,
        () => {
          syncUI();
        }
      );
    }, 100);

    window.addEventListener('resize', this.handleWindowResizeBound);
    window.addEventListener('orientationchange', this.handleWindowResizeBound);
  }

  private handleWindowResize(): void {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.executeBackgroundResize();
    }, 150);
  }

  private executeBackgroundResize(): void {
    if (this.bgImage && this.scale) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;

      this.scale.resize(width, height);
      this.bgImage.setTexture(isPortrait ? 'memory_bg_vert' : 'memory_bg_horiz');
      this.bgImage.setPosition(0, 0);
      this.bgImage.setDisplaySize(width, height);
    }
  }

  private cleanup = (): void => {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    if (this.initUiTimeout) clearTimeout(this.initUiTimeout);
    window.removeEventListener('resize', this.handleWindowResizeBound);
    window.removeEventListener('orientationchange', this.handleWindowResizeBound);

    if (this.unsubscribeStore) this.unsubscribeStore();
    if (this.root) { this.root.unmount(); this.root = null; }
    if (this.uiContainer) { this.uiContainer.remove(); this.uiContainer = null; }
    document.getElementById('memory-html-pet-entity')?.remove();
    useMemoryGameStore.getState().resetStore();
  };

  public exitGameSession(): void {
    this.cleanup();
    this.scene.start('MainScene');
  }
}

export const localGetFruitUrl = (id: string): string => {
  const fImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;
  const formattedId = id === '0003_13' ? '0003_13' : id === '0007_09' ? '0007_09' : id;
  return fImgs[`/src/assets/fruits/fruits_${formattedId}.png`]?.default || '';
};
