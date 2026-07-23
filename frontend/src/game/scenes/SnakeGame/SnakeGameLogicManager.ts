import { Scene } from 'phaser';
import { useSnakeGameStore } from './useSnakeGameStore';

export interface Point { x: number; y: number; }

export class SnakeGameLogicManager {
  public snake: Point[] = []; dir = 'RIGHT'; nextDir = 'RIGHT'; fruit: Point = { x: 7, y: 7 };
  private snakeBlocks: Phaser.GameObjects.Graphics[] = []; private fruitSprite: Phaser.GameObjects.Image | null = null; private gridGraphics: Phaser.GameObjects.Graphics | null = null; private nextMoveTime = 0;

  constructor(private scene: Scene, private moveDelay: number) {}

  private get ui() { return (this.scene as any).uiManager; }
  public get cellSize() { return this.ui.metrics.cellSize; }
  public get startX() { return this.ui.metrics.startX; }
  public get startY() { return this.ui.metrics.startY; }
  public get totalGridW() { return this.ui.metrics.totalGridW; }
  public get totalGridH() { return this.ui.metrics.totalGridH; }

  public initGame(): void {
    this.destroy(); this.resetSnake();
    this.gridGraphics = this.scene.add.graphics();
    this.drawGrid(); this.spawnFruit();
    this.nextMoveTime = this.scene.time.now + this.moveDelay;
    this.drawSnake();
  }

  public drawGrid(): void {
    if (!this.gridGraphics) return; this.gridGraphics.clear();
    const [x, y, w, h] = [this.startX - 6, this.startY - 6, this.totalGridW + 12, this.totalGridH + 12];
    this.gridGraphics.fillStyle(0xffffff, 0.4).fillRoundedRect(x, y, w, h, 24).lineStyle(4, 0x61aa05, 1).strokeRoundedRect(x, y, w, h, 24).lineStyle(1, 0x61aa05, 0.15);
    for (let i = 1; i < 12; i++) this.gridGraphics.lineBetween(this.startX + i * this.cellSize, this.startY, this.startX + i * this.cellSize, this.startY + this.totalGridH);
    for (let i = 1; i < 12; i++) this.gridGraphics.lineBetween(this.startX, this.startY + i * this.cellSize, this.startX + this.totalGridW, this.startY + i * this.cellSize);
  }

  public handleTicks(time: number): void {
    const store = useSnakeGameStore.getState();
    if (store.isGameOver || store.isCrashed || time < this.nextMoveTime || this.snake.length === 0) return;
    
    this.dir = this.nextDir;
    const head = { ...this.snake[0] };
    
    if (this.dir === 'UP') head.y -= 1;
    else if (this.dir === 'DOWN') head.y += 1;
    else if (this.dir === 'LEFT') head.x -= 1;
    else if (this.dir === 'RIGHT') head.x += 1;
    
    if (head.x < 0 || head.x >= 12 || head.y < 0 || head.y >= 12 || this.snake.some(s => s.x === head.x && s.y === head.y)) {
      return void (this.scene as any).triggerCrash(time);
    }
    
    this.snake.unshift(head);
    
    if (head.x === this.fruit.x && head.y === this.fruit.y) {
      this.snakeBlocks.forEach(b => b.destroy()); this.snakeBlocks = [];
      const currentScore = store.score;
      (this.scene as any).addScore(); this.spawnFruit(currentScore + 1);
    } else {
      this.snake.pop();
    }
    
    this.drawSnake(); 
    this.nextMoveTime = time + this.moveDelay;
  }

  public spawnFruit(forcedScore?: number): void {
    const rand = () => Math.floor(Math.random() * 12);
    do { this.fruit.x = rand(); this.fruit.y = rand(); } while (this.snake.some(s => s.x === this.fruit.x && s.y === this.fruit.y));
    const fx = this.startX + this.fruit.x * this.cellSize + this.cellSize / 2, fy = this.startY + this.fruit.y * this.cellSize + this.cellSize / 2;
    const fIdx = (forcedScore ?? useSnakeGameStore.getState().score) % 16;
    if (!this.fruitSprite) this.fruitSprite = this.scene.add.image(fx, fy, `fruit_idx_${fIdx}`); else this.fruitSprite.setTexture(`fruit_idx_${fIdx}`).setPosition(fx, fy);
    this.fruitSprite.setDisplaySize(this.cellSize * 0.9, this.cellSize * 0.9);
  }

  public drawSnake(): void {
    this.snakeBlocks.forEach(b => b.destroy()); this.snakeBlocks = [];
    this.snake.forEach((block, index) => {
      const bx = this.startX + block.x * this.cellSize, by = this.startY + block.y * this.cellSize;
      const g = this.scene.add.graphics().fillStyle(index === 0 ? 0x4c9203 : 0x61aa05, 1).fillRoundedRect(bx + 1, by + 2, this.cellSize - 2, this.cellSize - 4, 8);
      if (index === 0) {
        g.fillStyle(0, 1); const isVert = this.dir === 'UP' || this.dir === 'DOWN';
        g.fillCircle(bx + this.cellSize * (isVert ? 0.3 : 0.5), by + this.cellSize * (isVert ? 0.5 : 0.3), 3);
        g.fillCircle(bx + this.cellSize * (isVert ? 0.7 : 0.5), by + this.cellSize * (isVert ? 0.5 : 0.7), 3);
      }
      this.snakeBlocks.push(g);
    });
  }

  public resizeMetrics(): void {
    this.drawGrid(); this.drawSnake();
    if (this.fruitSprite) this.fruitSprite.setPosition(this.startX + this.fruit.x * this.cellSize + this.cellSize / 2, this.startY + this.fruit.y * this.cellSize + this.cellSize / 2).setDisplaySize(this.cellSize * 0.9, this.cellSize * 0.9);
  }

  public changeDirection(newDir: string): void {
    const OPP: Record<string, string> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (OPP[newDir] !== this.dir && OPP[newDir] !== this.nextDir) {
      this.nextDir = newDir;
    }
  }

  private resetSnake(): void { this.dir = this.nextDir = 'RIGHT'; this.snake = [{ x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }]; }
  public resetPositionOnCrash(): void { this.resetSnake(); this.drawSnake(); this.spawnFruit(); }
  
  public destroy(): void { 
    if (this.gridGraphics) this.gridGraphics.destroy(); 
    if (this.fruitSprite) this.fruitSprite.destroy(); 
    this.snakeBlocks.forEach(b => b.destroy()); 
    this.gridGraphics = this.fruitSprite = null; 
    this.snakeBlocks = []; 
  }
}
