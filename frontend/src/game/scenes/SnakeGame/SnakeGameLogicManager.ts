import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { useSnakeGameStore } from './useSnakeGameStore';

export interface Point { x: number; y: number; }

export class SnakeGameLogicManager {
  private scene: Scene;
  private gridWidth = 12; private gridHeight = 12;
  public cellSize = 32; startX = 0; startY = 0; totalGridW = 0; totalGridH = 0;
  public snake: Point[] = []; dir = 'RIGHT'; nextDir = 'RIGHT'; fruit: Point = { x: 7, y: 7 };

  private snakeBlocks: Phaser.GameObjects.Graphics[] = [];
  private fruitSprite: Phaser.GameObjects.Image | null = null;
  private gridGraphics: Phaser.GameObjects.Graphics | null = null;
  private moveDelay: number; private nextMoveTime = 0;

  constructor(scene: Scene, interval: number) { this.scene = scene; this.moveDelay = interval; }

  public initGame(isPortrait: boolean): void {
    this.destroy();
    this.dir = this.nextDir = 'RIGHT';
    this.snake = [{ x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }];
    this.calculateCellSize(isPortrait);
    this.gridGraphics = this.scene.add.graphics();
    this.drawGrid(); this.spawnFruit();
    this.nextMoveTime = this.scene.time.now + this.moveDelay;
    this.drawSnake();
  }

  public calculateCellSize(isPortrait: boolean): void {
    if (!isPortrait) {
      // ИСПРАВЛЕНО: Убрали костыль +100 к startX. Теперь при перевороте акселерометра поле на ландшафтных мобилках и ПК встанет строго по центру
      this.cellSize = Math.floor(Math.min((this.scene.scale.width - 340) / this.gridWidth, (this.scene.scale.height - 180) / this.gridHeight, 52));
      this.totalGridW = this.gridWidth * this.cellSize;
      this.totalGridH = this.gridHeight * this.cellSize;
      this.startX = Math.floor((this.scene.scale.width - this.totalGridW) / 2);
      this.startY = Math.floor((this.scene.scale.height - this.totalGridH) / 2);
      return;
    }

    // Мобильный портретный адаптив
    const isSmall = window.innerHeight < 700;
    const padHeight = isSmall ? 160 : 220;
    const padBottomGap = isSmall ? 30 : 24; 
    const padTotalReserved = padHeight + padBottomGap + 20;
    const topReserved = 110;

    const maxCell = isSmall ? 32 : 52;
    this.cellSize = Math.floor(Math.min((this.scene.scale.width - 40) / this.gridWidth, (this.scene.scale.height - (topReserved + padTotalReserved)) / this.gridHeight, maxCell));
    
    this.totalGridW = this.gridWidth * this.cellSize;
    this.totalGridH = this.gridHeight * this.cellSize;
    this.startX = Math.floor((this.scene.scale.width - this.totalGridW) / 2);

    const availableGridZoneHeight = this.scene.scale.height - padTotalReserved - topReserved;
    const centerStartY = Math.floor(topReserved + (availableGridZoneHeight - this.totalGridH) / 2);

    // ИСПРАВЛЕНО: Опустили поле на обычных мобилках ещё на 20px ниже (было +40, стало +60)
    this.startY = isSmall ? (centerStartY + 20) : (centerStartY + 60);
  }

  private drawGrid(): void {
    if (!this.gridGraphics) return; this.gridGraphics.clear();
    this.gridGraphics.fillStyle(0xffffff, 0.4).fillRoundedRect(this.startX - 6, this.startY - 6, this.totalGridW + 12, this.totalGridH + 12, 24);
    this.gridGraphics.lineStyle(4, 0x61aa05, 1).strokeRoundedRect(this.startX - 6, this.startY - 6, this.totalGridW + 12, this.totalGridH + 12, 24);
    this.gridGraphics.lineStyle(1, 0x61aa05, 0.15);
    for (let x = 1; x < this.gridWidth; x++) this.gridGraphics.lineBetween(this.startX + x * this.cellSize, this.startY, this.startX + x * this.cellSize, this.startY + this.totalGridH);
    for (let y = 1; y < this.gridHeight; y++) this.gridGraphics.lineBetween(this.startX, this.startY + y * this.cellSize, this.startX + this.totalGridW, this.startY + y * this.cellSize);
  }

    public handleTicks(time: number): void {
    const store = useSnakeGameStore.getState();
    if (store.isGameOver || store.isCrashed || time < this.nextMoveTime || this.snake.length === 0) return;

    this.dir = this.nextDir;
    
    // ИСПРАВЛЕНО: Берем строго первый элемент массива змейки (голову), создавая копию её координат
    const head = { ...this.snake[0] };

    if (this.dir === 'UP') head.y--; 
    else if (this.dir === 'DOWN') head.y++; 
    else if (this.dir === 'LEFT') head.x--; 
    else if (this.dir === 'RIGHT') head.x++;

    if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight || this.snake.some(s => s.x === head.x && s.y === head.y)) {
      (this.scene as any).triggerCrash(time); 
      return;
    }
    
    this.snake.unshift(head);
    if (head.x === this.fruit.x && head.y === this.fruit.y) {
      this.snakeBlocks.forEach(b => b.destroy()); 
      this.snakeBlocks = [];
      (this.scene as any).addScore(); 
      this.spawnFruit();
    } else {
      this.snake.pop();
    }
    
    this.drawSnake(); 
    this.nextMoveTime = time + this.moveDelay;
  }

  private spawnFruit(): void {
    do { this.fruit.x = Phaser.Math.Between(0, 11); this.fruit.y = Phaser.Math.Between(0, 11); } while (this.snake.some(s => s.x === this.fruit.x && s.y === this.fruit.y));
    const fx = this.startX + this.fruit.x * this.cellSize + this.cellSize / 2, fy = this.startY + this.fruit.y * this.cellSize + this.cellSize / 2;
    const fIdx = useSnakeGameStore.getState().score % 16;
    if (!this.fruitSprite) this.fruitSprite = this.scene.add.image(fx, fy, `fruit_idx_${fIdx}`); else this.fruitSprite.setTexture(`fruit_idx_${fIdx}`).setPosition(fx, fy);
    this.fruitSprite.setDisplaySize(this.cellSize * 0.9, this.cellSize * 0.9);
  }

  private drawSnake(): void {
    this.snakeBlocks.forEach(b => b.destroy()); this.snakeBlocks = [];
    this.snake.forEach((block, index) => {
      const bx = this.startX + block.x * this.cellSize, by = this.startY + block.y * this.cellSize;
      const g = this.scene.add.graphics().fillStyle(index === 0 ? 0x4c9203 : 0x61aa05, 1).fillRoundedRect(bx + 1, by + 2, this.cellSize - 2, this.cellSize - 4, 8);
      if (index === 0) {
        g.fillStyle(0, 1);
        if (this.dir === 'UP' || this.dir === 'DOWN') { g.fillCircle(bx + this.cellSize * 0.3, by + this.cellSize / 2, 3); g.fillCircle(bx + this.cellSize * 0.7, by + this.cellSize / 2, 3); }
        else { g.fillCircle(bx + this.cellSize / 2, by + this.cellSize * 0.3, 3); g.fillCircle(bx + this.cellSize / 2, by + this.cellSize * 0.7, 3); }
      }
      this.snakeBlocks.push(g);
    });
  }

  public resizeMetrics(isPortrait: boolean): void {
    this.calculateCellSize(isPortrait); this.drawGrid(); this.drawSnake();
    if (this.fruitSprite) this.fruitSprite.setPosition(this.startX + this.fruit.x * this.cellSize + this.cellSize / 2, this.startY + this.fruit.y * this.cellSize + this.cellSize / 2).setDisplaySize(this.cellSize * 0.85, this.cellSize * 0.85);
  }

  public changeDirection(newDir: string): void {
    const OPP = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' } as Record<string, string>;
    if (OPP[newDir] !== this.dir) this.nextDir = newDir;
  }

  public resetPositionOnCrash(): void { this.dir = 'RIGHT'; this.nextDir = 'RIGHT'; this.snake = [{ x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }]; this.drawSnake(); this.spawnFruit(); }
  public destroy(): void { if (this.gridGraphics) this.gridGraphics.destroy(); if (this.fruitSprite) this.fruitSprite.destroy(); this.snakeBlocks.forEach(b => b.destroy()); this.gridGraphics = this.fruitSprite = null; this.snakeBlocks = []; }
}
