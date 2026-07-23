import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useMemoryGameStore } from './useMemoryGameStore';
import { GameHeaderUI } from '../../../ui/components/GameHeader/GameHeaderUI';
import { GameOverModalUI } from '../../../ui/components/GameOverModal/GameOverModalUI';
import { MemoryGrid } from './components/MemoryGrid';
import { MemoryGameScene } from './MemoryGameScene';

export interface MemoryMetrics {
  isPort: boolean; isSmall: boolean; cellSize: number; startX: number; startY: number;
}

export class MemoryGameUiManager {
  private root: Root | null = null;
  private uiContainer: HTMLDivElement | null = null;
  public metrics!: MemoryMetrics;

  constructor(private scene: MemoryGameScene) { this.updateMetrics(); }

  public updateMetrics(): void {
    const [w, h] = [window.innerWidth, window.innerHeight];
    const isPort = h > w, isSmall = h < 700;
    const rows = this.scene.difficulty === 'easy' ? 2 : this.scene.difficulty === 'medium' ? 3 : 4;

    const cellSize = Math.floor(Math.min((w - (isPort ? 40 : 340)) / 4, (h - (isPort ? 300 : 160)) / rows, 110));
    const startX = Math.floor((w - 4 * cellSize) / 2);
    const startY = isPort ? 140 : Math.floor((h - rows * cellSize) / 2);

    this.metrics = { isPort, isSmall, cellSize, startX, startY };
  }

  public createUiContainer(): void {
    const container = document.getElementById('game-container');
    if (!container) return;
    
    this.destroyReactRoot();

    this.uiContainer = document.createElement('div'); 
    this.uiContainer.id = 'phaser-memory-ui-root';
    this.uiContainer.className = 'absolute inset-0 w-full h-full z-40 overflow-hidden bg-transparent pointer-events-none';
    container.appendChild(this.uiContainer); 
    
    this.root = createRoot(this.uiContainer);
  }

  public render(): void {
    if (!this.root) return;
    this.updateMetrics();
    const s = useMemoryGameStore.getState();

    this.root.render(
      <>
        <div className="pointer-events-auto absolute inset-x-0 top-0 z-50 h-24">
          <GameHeaderUI score={s.score} onBack={() => this.scene.exitGameSession()} />
        </div>
        <MemoryGrid 
          difficulty={this.scene.difficulty} 
          totalPairs={this.scene.totalPairs} 
          metrics={this.metrics}
          onReady={() => {}} 
          scene={this.scene} 
        />
        {s.isGameOver && (
          <div className="pointer-events-auto absolute inset-0 z-50">
            <GameOverModalUI score={s.score} isWin={true} onRestart={() => this.scene.restartGame()} onBack={() => this.scene.exitGameSession()} />
          </div>
        )}
      </>
    );
  }

  private destroyReactRoot(): void {
    if (this.root) {
      try {
        this.root.unmount();
      } catch (e) {
        console.warn(e);
      }
      this.root = null;
    }
    this.uiContainer?.remove();
    this.uiContainer = null;
  }

  public destroy(): void {
    this.destroyReactRoot();
    document.getElementById('memory-html-pet-entity')?.remove();
  }
}
