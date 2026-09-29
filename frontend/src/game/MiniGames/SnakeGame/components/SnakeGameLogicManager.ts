import Phaser from "phaser";
import { useSnakeGameStore } from "../store/useSnakeGameStore";
import { SnakeBombManager } from "./SnakeBombManager";
import { SnakeFruitSpawner } from "./SnakeFruitSpawner";
import { SnakeGridRenderer } from "./SnakeGridRenderer";

export interface Point { x: number; y: number; }

const OFFSETS: Record<string, Point> = { UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 }, LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 } };
const OPP: Record<string, string> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };

export class SnakeGameLogicManager {
  public snake: Point[] = []; public dir = "RIGHT"; public nextDir = "RIGHT";
  public readonly cellSize = 52; public readonly gridDim = 12 * 52;
  private nextMoveTime = 0;
  public renderer!: SnakeGridRenderer; public fruitSpawner!: SnakeFruitSpawner; public bombManager!: SnakeBombManager;

  constructor(private scene: Phaser.Scene, private moveDelay: number) {
    this.renderer = new SnakeGridRenderer(this.scene, this);
    this.fruitSpawner = new SnakeFruitSpawner(this.scene, this);
    this.bombManager = new SnakeBombManager(this.scene, this);
  }

  public initGame = (): void => {
    this.destroy(); this.resetSnake(); this.renderer.init();
    this.fruitSpawner.init(this.renderer.mainGridContainer); this.bombManager.init(this.renderer.mainGridContainer);
    this.fruitSpawner.spawn(); this.nextMoveTime = this.scene.time.now + this.moveDelay;
    this.renderer.drawSnake(); this.renderer.resize(); this.bombManager.startTimer();
  };

  public resetMoveTime(currentTime: number): void {
    this.nextMoveTime = currentTime + this.moveDelay;
  }

  public handleTicks = (time: number): void => {
    const s = useSnakeGameStore.getState();
    if (s.isGameOver || s.isCrashed || time < this.nextMoveTime || !this.snake.length) return;

    this.dir = this.nextDir;
    const head: Point = { x: this.snake[0].x, y: this.snake[0].y }, off = OFFSETS[this.dir];
    if (off) { head.x += off.x; head.y += off.y; }

    if (head.x < 0 || head.x >= 12 || head.y < 0 || head.y >= 12 || this.snake.slice(0, -1).some(s => s.x === head.x && s.y === head.y)) {
      return this.handleCollisionPenalty();
    }

    this.snake.unshift(head);
    if (head.x === this.fruitSpawner.fruit.x && head.y === this.fruitSpawner.fruit.y) {
      (this.scene as any).addScore(); this.fruitSpawner.spawn();
    } else if (this.bombManager.hasBomb && head.x === this.bombManager.bomb.x && head.y === this.bombManager.bomb.y) {
      this.bombManager.removeBomb(); this.handleCollisionPenalty();
    } else this.snake.pop();

    this.renderer.drawSnake(); this.nextMoveTime = time + this.moveDelay;
  };

  private handleCollisionPenalty = (): void => {
    (this.scene as any).triggerCrash();
    const s = useSnakeGameStore.getState();
    if (this.snake.length === 1 || s.hp <= 0) return;

    this.snake.pop();
    this.nextDir = this.dir = OPP[this.dir] || this.dir;
    const off = OFFSETS[this.dir];

    if (off && this.snake.length) { this.snake[0].x = Phaser.Math.Clamp(this.snake[0].x + off.x, 0, 11); this.snake[0].y = Phaser.Math.Clamp(this.snake[0].y + off.y, 0, 11); }
    for (let i = 1; i < this.snake.length; i++) { this.snake[i].x = this.snake[0].x; this.snake[i].y = this.snake[0].y; }

    this.renderer.drawSnake();
  };

  public changeDirection = (newDir: string): void => { if (OPP[newDir] !== this.dir && OPP[newDir] !== this.nextDir) this.nextDir = newDir; };
  private resetSnake = (): void => { this.dir = this.nextDir = "RIGHT"; this.snake = [{ x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }]; };
  public destroy = (): void => { this.bombManager?.destroy(); this.fruitSpawner?.destroy(); this.renderer?.destroy(); };
}
