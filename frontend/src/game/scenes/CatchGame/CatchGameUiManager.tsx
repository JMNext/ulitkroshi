import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { GameHeaderUI } from '../../../ui/components/GameHeader/GameHeaderUI';
import { GameOverModalUI } from '../../../ui/components/GameOverModal/GameOverModalUI';
import { useCatchGameStore } from './useCatchGameStore';
import { CatchGameScene } from './CatchGameScene';

export interface CatchScreenMetrics { isPortrait: boolean; petSize: number; petTopPx: number; fruitSize: number; screenWidth: number; screenHeight: number; }

export class CatchGameUiManager {
  private root: Root | null = null; private uiContainer: HTMLDivElement | null = null; public metrics!: CatchScreenMetrics;
  constructor(private scene: CatchGameScene) { this.updateMetrics(); }

  public updateMetrics(): void {
    const w = window.innerWidth, h = window.innerHeight, isP = h > w;
    this.metrics = { isPortrait: isP, screenWidth: w, screenHeight: h, petSize: isP ? 160 : 240, petTopPx: isP ? h - 110 : h - 150, fruitSize: isP ? 65 : 80 };
  }

  public createUiContainer(): void {
    const container = document.getElementById('game-container'); if (!container) return;
    this.destroyUiRoot();
    this.uiContainer = document.createElement('div'); this.uiContainer.id = 'phaser-catch-ui-root';
    this.uiContainer.className = 'absolute inset-0 w-full h-full z-10 overflow-hidden bg-transparent pointer-events-none';
    container.appendChild(this.uiContainer); this.root = createRoot(this.uiContainer);
  }

  public render(): void {
    if (!this.root) return;
    const { isGameOver, isWin } = useCatchGameStore.getState();
    this.root.render(
      <>
        <div className="pointer-events-auto absolute inset-x-0 top-0 z-50 h-32"><GameHeaderUI score={this.scene.score} hp={this.scene.hp} scoreLabel="СЧЕТ" onBack={() => this.scene.exitGame()} /></div>
        {isGameOver && <div className="pointer-events-auto absolute inset-0 z-50"><GameOverModalUI score={this.scene.score} isWin={isWin} onRestart={() => this.scene.restartGame()} onBack={() => this.scene.exitGame()} /></div>}
      </>
    );
  }

  private destroyUiRoot(): void { if (this.root) { try { this.root.unmount(); } catch (e) { console.warn(e); } this.root = null; } if (this.uiContainer) this.uiContainer.remove(); this.uiContainer = null; }
  public destroy(): void { this.destroyUiRoot(); document.getElementById('catch-raw-html-pet')?.remove(); }
}
