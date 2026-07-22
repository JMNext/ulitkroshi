import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { useMemoryGameStore } from '../useMemoryGameStore';


export class MemoryCardsVisualManager {
  private scene: Scene;
  private cardsContainers: Phaser.GameObjects.Container[] = [];
  
  private gridCols = 4;
  private gridRows = 3;
  private cellSize = 90;
  private startX = 0;
  private startY = 0;
  private totalPairs: number;

  constructor(scene: Scene, totalPairs: number, difficulty: string) {
    this.scene = scene;
    this.totalPairs = totalPairs;

    if (difficulty === 'easy') { this.gridCols = 4; this.gridRows = 2; }
    else if (difficulty === 'medium') { this.gridCols = 4; this.gridRows = 3; }
    else { this.gridCols = 4; this.gridRows = 4; }
  }

  public initGrid(isPortrait: boolean): void {
    this.destroy();
    this.calculateGridMetrics(isPortrait);

    const storeState = useMemoryGameStore.getState();
    const deck = storeState.deck;

    for (let i = 0; i < deck.length; i++) {
      const row = Math.floor(i / this.gridCols);
      const col = i % this.gridCols;

      const cx = this.startX + col * this.cellSize + this.cellSize / 2;
      const cy = this.startY + row * this.cellSize + this.cellSize / 2;

      const cardSize = this.cellSize * 0.88;

      const bgGraphics = this.scene.add.graphics();
      bgGraphics.fillStyle(0xffffff, 1);
      bgGraphics.fillRoundedRect(-cardSize / 2, -cardSize / 2, cardSize, cardSize, 16);
      bgGraphics.lineStyle(4, 0x61aa05, 1);
      bgGraphics.strokeRoundedRect(-cardSize / 2, -cardSize / 2, cardSize, cardSize, 16);

      const fruitSprite = this.scene.add.image(0, 0, `fruit_${deck[i]}`);
      fruitSprite.setDisplaySize(cardSize * 0.8, cardSize * 0.8);
      fruitSprite.setName('fruit_icon');

      const sleepSprite = this.scene.add.image(0, 0, 'card_shirt');
      sleepSprite.setDisplaySize(cardSize * 0.85, cardSize * 0.85);
      sleepSprite.setName('sleep_icon');
      
      sleepSprite.setVisible(storeState.canClick);
      sleepSprite.setAlpha(storeState.canClick ? 1 : 0);

      const container = this.scene.add.container(cx, cy, [bgGraphics, fruitSprite, sleepSprite]);
      
      container.setData('index', i);
      container.setData('fruit', deck[i]);

      this.cardsContainers.push(container);
    }
  }

  public calculateGridMetrics(isPortrait: boolean): void {
    const widthMargin = isPortrait ? 40 : 340;
    const heightMargin = isPortrait ? 300 : 160;

    const maxW = this.scene.scale.width - widthMargin;
    const maxH = this.scene.scale.height - heightMargin;

    this.cellSize = Math.floor(Math.min(maxW / this.gridCols, maxH / this.gridRows, 110));
    
    const totalW = this.gridCols * this.cellSize;
    const totalH = this.gridRows * this.cellSize;

    this.startX = Math.floor((this.scene.scale.width - totalW) / 2);
    this.startY = isPortrait ? 140 : Math.floor((this.scene.scale.height - totalH) / 2);
  }

  public animateShuffle(): void {
    const newDeck = useMemoryGameStore.getState().deck;
    
    this.cardsContainers.forEach((container, i) => {
      container.setData('fruit', newDeck[i]);
      
      const fruitSprite = container.getByName('fruit_icon') as Phaser.GameObjects.Image;
      if (fruitSprite) {
        fruitSprite.setTexture(`fruit_${newDeck[i]}`);
        const cardSize = this.cellSize * 0.88;
        fruitSprite.setDisplaySize(cardSize * 0.8, cardSize * 0.8);
      }

      const sleep = container.getByName('sleep_icon') as Phaser.GameObjects.Image;
      if (sleep) {
        sleep.setAlpha(0);
        sleep.setVisible(true);
        this.scene.tweens.add({
          targets: sleep,
          alpha: 1,
          duration: 250
        });
      }
    });
  }

  public updateCardsVisualState(state: any): void {
    this.cardsContainers.forEach((container) => {
      const idx = container.getData('index');
      const fruitName = container.getData('fruit');
      const sleep = container.getByName('sleep_icon') as Phaser.GameObjects.Image;

      if (!sleep) return;

      const shouldOpen = state.openedCards.includes(idx) || state.matchedCards.includes(fruitName) || !state.canClick;

      if (shouldOpen && sleep.visible && sleep.alpha > 0) {
        this.scene.tweens.add({
          targets: container,
          scaleX: 0,
          duration: 120,
          onComplete: () => {
            sleep.setVisible(false);
            sleep.setAlpha(0);
            this.scene.tweens.add({ targets: container, scaleX: 1, duration: 120 });
          }
        });
      } 
      else if (!shouldOpen && (!sleep.visible || sleep.alpha === 0)) {
        this.scene.tweens.add({
          targets: container,
          scaleX: 0,
          duration: 120,
          onComplete: () => {
            sleep.setVisible(true);
            sleep.setAlpha(1);
            this.scene.tweens.add({ targets: container, scaleX: 1, duration: 120 });
          }
        });
      }
    });
  }

  public resizeMetrics(isPortrait: boolean): void {
    this.calculateGridMetrics(isPortrait);
    this.initGrid(isPortrait);
  }

  public destroy(): void {
    this.cardsContainers.forEach(c => { if (c) c.destroy(); });
    this.cardsContainers = [];
  }
}
