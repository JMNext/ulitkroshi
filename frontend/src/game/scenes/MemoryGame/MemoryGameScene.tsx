import * as Phaser from 'phaser';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import { BackgroundManager } from '../../../BackgroundManager';
import { animateCoinExplosion, createBaseGameOverModal } from '../../../ui/components/GameOverModalUI';
import { checkCardsMatchLogic, generateDeckLogic } from './MemoryGameLogic';
import { MemoryUiContainer, IMemoryGameScene } from './components/MemoryUiContainer';
import { buildCardsGridUI, animateCardFlipUI, animateMassShuffleUI } from './utils/MemoryPhaserRenderer';

export interface MemoryConfig { rows: number; cols: number; pairs: number; shuffleCount: number; }
export interface MemoryCardContainer extends Phaser.GameObjects.Container { fruitKey: string; fruitImg: Phaser.GameObjects.Image; shirtImg: Phaser.GameObjects.Image; isFaceUp: boolean; }

const FRUITS = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];
const fImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;

export class MemoryGameScene extends Phaser.Scene implements IMemoryGameScene {
  public difficulty = 'easy'; public selectedCards: MemoryCardContainer[] = []; public canClick = false; public matchesFound = 0; public cardsList: MemoryCardContainer[] = []; public totalPairs = 0;
  private stepsTaken = 0; private isDestroyed = false; private regUiRoot: Root | null = null; private mTimer: Phaser.Time.TimerEvent | null = null; private pTimer: Phaser.Time.TimerEvent | null = null;
  private updateUiScore?: (s: number) => void; private triggerUiPetAnim?: () => void;
  public cfgs: Record<string, MemoryConfig> = { easy: { rows: 4, cols: 4, pairs: 8, shuffleCount: 16 }, medium: { rows: 6, cols: 6, pairs: 18, shuffleCount: 36 }, hard: { rows: 8, cols: 8, pairs: 32, shuffleCount: 64 } };

  constructor() { super('MemoryGameScene'); }

  public init = (data: { difficulty?: string }) => { this.difficulty = data.difficulty || 'easy'; this.selectedCards = []; this.canClick = false; this.matchesFound = 0; this.cardsList = []; this.stepsTaken = 0; this.isDestroyed = false; };

  public preload = () => {
    this.load.image('card-back', '/src/assets/buttom_menu-icons/sleep.svg');
    FRUITS.forEach(id => { const p = `/src/assets/fruits/fruits_${id}.png`; fImgs[p]?.default && this.load.image(`fruit-${id}`, fImgs[p].default); });
  };

  public create = () => {
    BackgroundManager.getInstance().applyBackground(this.scene.key); this.setupUI(); 
    this.totalPairs = (this.cfgs[this.difficulty] || this.cfgs.easy).pairs;
    this.buildGrid(generateDeckLogic(this.totalPairs, FRUITS)); this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => { this.scale.off('resize', this.handleResize, this); this.mTimer?.remove(); this.pTimer?.remove(); this.destroyUI(); }, this);
  };

  private setupUI() {
    let el = document.getElementById('memory-ui-overlay');
    if (!el) { el = document.createElement('div'); el.id = 'memory-ui-overlay'; el.className = 'absolute inset-0 pointer-events-none z-30'; document.getElementById('game-container')?.appendChild(el); }
    this.regUiRoot = createRoot(el);
    this.regUiRoot.render(<MemoryUiContainer scene={this} onBack={() => this.exitGame()} bind={(s: (v: number) => void, a: () => void) => { this.updateUiScore = s; this.triggerUiPetAnim = a; }} />);
  }

  private destroyUI() { this.regUiRoot?.unmount(); this.regUiRoot = null; document.getElementById('memory-ui-overlay')?.remove(); }

  private buildGrid(deck: string[]) {
    this.cardsList = buildCardsGridUI(this, deck, this.cfgs[this.difficulty] || this.cfgs.easy, (c) => this.handleCardClick(c));
    this.cardsList.forEach(c => animateCardFlipUI(this, c, true, null));
    this.pTimer = this.time.delayedCall(2200, () => {
      let closed = 0;
      this.cardsList.forEach(c => c?.scene && animateCardFlipUI(this, c, false, () => { if (++closed === this.cardsList.length) animateMassShuffleUI(this, this.cardsList, () => this.canClick = true); }));
    });
  }

  public handleCardClick = (card: MemoryCardContainer) => {
    if (!this.canClick || card.isFaceUp || this.selectedCards.includes(card)) return;
    this.canClick = false; animateCardFlipUI(this, card, true, () => { this.selectedCards.push(card); if (this.selectedCards.length === 2) { this.stepsTaken++; this.verifyMatch(); } else this.canClick = true; });
  };

  private verifyMatch() {
    const [c1, c2] = this.selectedCards;
    if (checkCardsMatchLogic(c1.fruitKey, c2.fruitKey)) {
      this.matchesFound++; this.selectedCards = []; this.updateUiScore?.(this.matchesFound); this.triggerUiPetAnim?.();
      this.mTimer = this.time.delayedCall(500, () => {
        if (!c1.scene || !c2.scene) return;
        this.tweens.add({ targets: [c1, c2], scaleX: 0, scaleY: 0, alpha: 0, duration: 300, ease: 'Back.easeIn', onComplete: () => {
          c1.destroy(); c2.destroy();
          if (this.matchesFound === this.totalPairs) { this.canClick = false; this.destroyUI(); animateCoinExplosion(this, 20); this.time.delayedCall(1200, () => createBaseGameOverModal(this, { title: 'ПОБЕДА!', resultLabel: 'ХОДЫ', score: this.stepsTaken, buttonText: 'В МЕНЮ', isWin: true, onBack: () => this.exitGame() })); } else this.canClick = true;
        }});
      });
    } else {
      this.mTimer = this.time.delayedCall(1000, () => { if (!c1.scene || !c2.scene) return; let d = 0; const cb = () => ++d === 2 && (this.selectedCards = [], this.canClick = true); animateCardFlipUI(this, c1, false, cb); animateCardFlipUI(this, c2, false, cb); });
    }
  }

  private handleResize = () => { if (!this.scene.isActive(this.scene.key) || this.isDestroyed) return; BackgroundManager.getInstance().applyBackground(this.scene.key); this.destroyUI(); this.setupUI(); this.updateUiScore?.(this.matchesFound); const active = this.cardsList.map(c => c.fruitKey); this.cardsList.forEach(c => c.destroy()); this.mTimer?.remove(); this.pTimer?.remove(); this.buildGrid(active); };
  private exitGame = () => { this.isDestroyed = true; this.mTimer?.remove(); this.pTimer?.remove(); this.destroyUI(); this.scene.start('MainScene'); };
}
