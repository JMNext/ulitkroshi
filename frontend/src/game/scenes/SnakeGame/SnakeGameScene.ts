import * as Phaser from 'phaser';
import { getNextLogicalPosition, checkSnakeCollisionLogic } from './SnakeGameLogic';
import { 
  renderSnakeUI, 
  destroySnakeUI, 
  updateSnakeScoreUI, 
  playPetGamerMatchAnim, 
  showSnakeGameOver, 
  calculateGridMetricsUI, 
  buildPlayGridUI, 
  drawSnakeSegmentUI, 
  spawnSnakeFruitUI,
  drawHeartsUI,
  SnakeUiMetrics,
  FRUITS 
} from './SnakeGameUI';
import { BackgroundManager } from '../../../BackgroundManager';
// @ts-ignore
import { animateCoinExplosion } from '../../../ui/components/GameOverModalUI';

const DIR_MAP: Record<string, string> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT', W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT' };
const SNAKE_COLOR = 0x61aa05;

interface FruitImage extends Phaser.GameObjects.Image { gridX: number; gridY: number; }

export class SnakeGameScene extends Phaser.Scene {
  public difficulty = 'medium'; 
  public score = 0; 
  public hp = 100; 
  public isGameOver = false;
  public snake: Phaser.GameObjects.Graphics[] = []; 
  public dir = 'RIGHT'; 
  public nextDir = 'RIGHT';
  public moveTimer = 0; 
  public fruit: FruitImage | null = null; 
  public moveInterval = 160;
  public minGridX = 0; 
  public maxGridX = 11; 
  public minGridY = 0; 
  public maxGridY = 11;
  public snakeLogical: { x: number; y: number }[] = [];
  public heartsGroup: Phaser.GameObjects.Image[] = []; 
  public gridMetrics!: SnakeUiMetrics;
  public isPausedOnHit = false;
  private unpauseTimerEvent: Phaser.Time.TimerEvent | null = null;

  constructor() { 
    super('SnakeGameScene'); 
  }

  public init = (data: { difficulty?: string }): void => {
    this.difficulty = data.difficulty || 'medium'; 
    this.score = 0; 
    this.hp = 100; 
    this.isGameOver = false;
    this.snake = []; 
    this.snakeLogical = []; 
    this.heartsGroup = []; 
    this.dir = 'RIGHT'; 
    this.nextDir = 'RIGHT'; 
    this.moveTimer = 0; 
    this.fruit = null;
    this.isPausedOnHit = false; 
    this.unpauseTimerEvent = null;
    this.moveInterval = ({ easy: 250, medium: 160, hard: 100 } as Record<string, number>)[this.difficulty] || 160;
  };

  public preload = (): void => {
    this.load.image('icon-life', '/assets/interface-icons/life.svg');
    FRUITS.forEach(id => this.load.image(`fruit-${id}`, `/assets/fruits/fruits_${id}.png`));
  };

  public create = (): void => {
    this.gridMetrics = calculateGridMetricsUI(this);
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    renderSnakeUI(this, () => { 
      destroySnakeUI(); 
      this.scene.start('MainScene'); 
    });
    
    this.buildGameObjects();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e && DIR_MAP[e.key]) this.changeDirection(DIR_MAP[e.key]);
    };
    window.addEventListener('keydown', handleKeyDown);
    
    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => { 
      this.scale.off('resize', this.handleResize, this);
      window.removeEventListener('keydown', handleKeyDown);
      if (this.unpauseTimerEvent) this.unpauseTimerEvent.remove(); 
      destroySnakeUI(); 
    }, this);
  };

  private buildGameObjects = (): void => {
    buildPlayGridUI(this, this.minGridX, this.maxGridX, this.minGridY, this.maxGridY, this.gridMetrics);
    updateSnakeScoreUI(this.score);
    drawHeartsUI(this);

    const sx = 3, sy = 5;
    for (let i = 0; i < 3; i++) {
      const lx = sx - i, ly = sy;
      this.snakeLogical.push({ x: lx, y: ly });
      this.snake.push(drawSnakeSegmentUI(this, this.gridMetrics.offsetX + lx * this.gridMetrics.gridSize, this.gridMetrics.offsetY + ly * this.gridMetrics.gridSize, this.gridMetrics.gridSize, i === 0, this.dir));
    }

    spawnSnakeFruitUI(this, this.gridMetrics, this.snakeLogical);
  };

  private handleResize = (): void => {
    if (!this.scene.isActive(this.scene.key)) return;
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    if (this.fruit) this.fruit.destroy();
    this.fruit = null;
    this.snake.forEach(s => s?.destroy());
    this.snake = [];
    this.snakeLogical = [];
    this.gridMetrics = calculateGridMetricsUI(this);
    destroySnakeUI();
    renderSnakeUI(this, () => { 
      destroySnakeUI(); 
      this.scene.start('MainScene'); 
    });
    this.buildGameObjects();
  };

  public changeDirection = (newDir: string): void => {
    const opposites: Record<string, string> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (opposites[newDir] !== this.dir) {
      this.nextDir = newDir;
      if (this.isPausedOnHit) {
        this.isPausedOnHit = false; 
        this.dir = newDir;
        if (this.unpauseTimerEvent) this.unpauseTimerEvent.remove(); 
        this.unpauseTimerEvent = null;
        this.moveTimer = this.time.now + this.moveInterval;
      }
    }
  };

  public update = (time: number): void => {
    if (!this.isPausedOnHit && !this.isGameOver && time >= this.moveTimer) {
      this.moveSnake();
      this.moveTimer = time + this.moveInterval;
    }
  };

  private moveSnake = (): void => {
    this.dir = this.nextDir;
    if (this.snakeLogical.length === 0) return;
    
    const head = this.snakeLogical[0];
    if (!head) return;
    
    const nextPos = getNextLogicalPosition(head, this.dir);

    if (checkSnakeCollisionLogic(nextPos.x, nextPos.y, this.minGridX, this.maxGridX, this.minGridY, this.maxGridY, this.snakeLogical)) {
      this.hp -= 25;
      drawHeartsUI(this); 
      if (this.hp <= 0) return this.endGame(false);

      this.isPausedOnHit = true;
      this.unpauseTimerEvent = this.time.delayedCall(1500, () => {
        if (!this.isGameOver && this.isPausedOnHit) {
          this.isPausedOnHit = false;
          this.moveTimer = this.time.now + this.moveInterval;
        }
      });
      return;
    }
    
    const oldHead = this.snake[0];
    if (oldHead && typeof oldHead.clear === 'function') {
      oldHead.clear();
      oldHead.fillStyle(SNAKE_COLOR, 1).fillRoundedRect(0, 0, this.gridMetrics.gridSize - 4, this.gridMetrics.gridSize - 4, this.gridMetrics.gridSize * 0.2);
    }
    
    this.snakeLogical.unshift({ x: nextPos.x, y: nextPos.y });
    const px = this.gridMetrics.offsetX + nextPos.x * this.gridMetrics.gridSize;
    const py = this.gridMetrics.offsetY + nextPos.y * this.gridMetrics.gridSize;
    this.snake.unshift(drawSnakeSegmentUI(this, px, py, this.gridMetrics.gridSize, true, this.dir));

    if (this.fruit && nextPos.x === this.fruit.gridX && nextPos.y === this.fruit.gridY) {
      this.score++; 
      updateSnakeScoreUI(this.score); 
      playPetGamerMatchAnim();
      if (this.score >= 20) this.endGame(true); 
      else spawnSnakeFruitUI(this, this.gridMetrics, this.snakeLogical);
    } else {
      this.snakeLogical.pop();
      const lastSegment = this.snake.pop();
      if (lastSegment) lastSegment.destroy();
    }
  };

  private endGame = (isWin = false): void => {
    this.isGameOver = true;
    if (this.unpauseTimerEvent) this.unpauseTimerEvent.remove();
    destroySnakeUI();
    if (isWin) animateCoinExplosion(this, 20);
    
    showSnakeGameOver(
      this, 
      this.score, 
      isWin, 
      () => this.scene.start('MainScene'), 
      () => this.scene.restart({ difficulty: this.difficulty })
    );
  };
}
