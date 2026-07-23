import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { GameHeaderUI } from '../../../ui/components/GameHeader/GameHeaderUI';
import { GameOverModalUI } from '../../../ui/components/GameOverModal/GameOverModalUI';
import { MobileControls } from '../../../ui/components/MobileControls/MobileControls';
import { useSnakeGameStore } from './useSnakeGameStore';
import { SnakeGameScene } from './SnakeGameScene';

export interface ScreenMetrics { isPortrait: boolean; isSmall: boolean; isTablet: boolean; cellSize: number; startX: number; startY: number; totalGridW: number; totalGridH: number; }

export class SnakeGameUiManager {
  private root: Root | null = null; private uiContainer: HTMLDivElement | null = null; public metrics!: ScreenMetrics;
  constructor(private scene: SnakeGameScene) { this.updateMetrics(); }

  public updateMetrics(): void {
    const [w, h] = [window.innerWidth, window.innerHeight], isP = h > w, isS = h < 700, isT = (w / h) < 1.75;
    let cSize = 32;
    if (!isP) cSize = Math.floor(Math.min((w - 340) / 12, (h - 180) / 12, 52));
    else cSize = Math.floor(Math.min((w - 40) / 12, (h - ((isS ? 160 : 220) + (isS ? 30 : 24) + 130)) / 12, isS ? 32 : 52));
    const tW = 12 * cSize, tH = 12 * cSize, sX = Math.floor((w - tW) / 2);
    const sY = !isP ? Math.floor((h - tH) / 2) : Math.floor(110 + (h - ((isS ? 160 : 220) + (isS ? 30 : 24) + 20) - 110 - tH) / 2) + (isS ? 20 : 60);
    this.metrics = { isPortrait: isP, isSmall: isS, isTablet: isT, cellSize: cSize, startX: sX, startY: sY, totalGridW: tW, totalGridH: tH };
  }

  public createUiContainer(): void {
    const container = document.getElementById('game-container'); if (!container) return;
    container.querySelectorAll('[id="phaser-snake-ui-root"]').forEach(l => l.remove());
    this.uiContainer = document.createElement('div'); this.uiContainer.id = 'phaser-snake-ui-root';
    this.uiContainer.className = 'absolute inset-0 w-full h-full z-40 overflow-hidden bg-transparent pointer-events-none';
    container.appendChild(this.uiContainer); this.root = createRoot(this.uiContainer);
  }

    public render(): void {
    this.updateMetrics(); const { isGameOver } = useSnakeGameStore.getState(), m = this.metrics;
    this.root?.render(
      <>
        <div className="pointer-events-auto absolute inset-x-0 top-0 z-50 h-24"><GameHeaderUI score={this.scene.score} hp={this.scene.hp} scoreLabel="СЧЕТ" onBack={() => this.scene.exitGame()} /></div>
        {!isGameOver && <div className={m.isPortrait ? `pointer-events-auto absolute inset-x-0 z-50 transition-all ${m.isSmall ? 'bottom-2 h-[160px]' : 'bottom-0 h-[240px]'}` : 'absolute inset-0 w-full h-full z-40 pointer-events-none'}><MobileControls type="cross" onChangeDir={(dir) => typeof dir === 'string' && this.scene.logicManager?.changeDirection(dir)} metrics={m} /></div>}
        {isGameOver && <div className="pointer-events-auto absolute inset-0 z-50"><GameOverModalUI score={this.scene.score} isWin={this.scene.score >= 20} onRestart={() => this.scene.scene.restart({ difficulty: this.scene.difficulty })} onBack={() => this.scene.exitGame()} /></div>}
      </>
    );
  }

  public destroy(): void { try { this.root?.unmount(); } catch (e) { console.error(e); } this.uiContainer?.remove(); this.root = this.uiContainer = null; }
}
