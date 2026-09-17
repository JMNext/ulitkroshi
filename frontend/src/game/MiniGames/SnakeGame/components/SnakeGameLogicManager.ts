import Phaser from "phaser";
import { useSnakeGameStore } from "../store/useSnakeGameStore";
import { SnakeBombManager } from "./SnakeBombManager";
import { SnakeFruitSpawner } from "./SnakeFruitSpawner";
import { SnakeGridRenderer } from "./SnakeGridRenderer";

export interface Point {
  x: number;
  y: number;
}

export class SnakeGameLogicManager {
  public snake: Point[] = [];
  public dir = "RIGHT";
  public nextDir = "RIGHT";
  public readonly cellSize = 52;
  public readonly gridDim = 12 * 52;
  private nextMoveTime = 0;
  public renderer!: SnakeGridRenderer;
  public fruitSpawner!: SnakeFruitSpawner;
  public bombManager!: SnakeBombManager;

  constructor(
    private scene: Phaser.Scene,
    private moveDelay: number
  ) {
    this.renderer = new SnakeGridRenderer(this.scene, this);
    this.fruitSpawner = new SnakeFruitSpawner(this.scene, this);
    this.bombManager = new SnakeBombManager(this.scene, this);
  }

  public initGame = (): void => {
    this.destroy();
    this.resetSnake();
    this.renderer.init();
    this.fruitSpawner.init(this.renderer.mainGridContainer);
    this.bombManager.init(this.renderer.mainGridContainer);
    this.fruitSpawner.spawn();
    this.nextMoveTime = this.scene.time.now + this.moveDelay;
    this.renderer.drawSnake();
    this.renderer.resize();
    this.bombManager.startTimer();
  };

  public handleTicks = (time: number): void => {
    if (
      useSnakeGameStore.getState().isGameOver ||
      useSnakeGameStore.getState().isCrashed ||
      time < this.nextMoveTime ||
      this.snake.length === 0
    )
      return;

    this.dir = this.nextDir;
    const head: Point = { x: this.snake[0].x, y: this.snake[0].y };

    const OFFSETS: Record<string, { x: number; y: number }> = {
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 },
      RIGHT: { x: 1, y: 0 }
    };

    const offset = OFFSETS[this.dir];
    if (offset) {
      head.x += offset.x;
      head.y += offset.y;
    }

    if (head.x < 0 || head.x >= 12 || head.y < 0 || head.y >= 12 || this.snake.slice(0, -1).some((s) => s.x === head.x && s.y === head.y)) {
      this.handleCollisionPenalty();
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.fruitSpawner.fruit.x && head.y === this.fruitSpawner.fruit.y) {
      (this.scene as any).addScore();
      this.fruitSpawner.spawn();
    } else if (this.bombManager.hasBomb && head.x === this.bombManager.bomb.x && head.y === this.bombManager.bomb.y) {
      this.bombManager.removeBomb();
      this.handleCollisionPenalty();
    } else {
      this.snake.pop();
    }

    this.renderer.drawSnake();
    this.nextMoveTime = time + this.moveDelay;
  };

  private handleCollisionPenalty = (): void => {
    if (this.snake.length === 1) {
      useSnakeGameStore.getState().applyPenalty(() => (this.scene as any).overlayManager.render(), true);
      return;
    }
    this.snake.pop();
    if (this.snake[0].x < 0) this.snake[0].x = 0;
    if (this.snake[0].x >= 12) this.snake[0].x = 11;
    if (this.snake[0].y < 0) this.snake[0].y = 0;
    if (this.snake[0].y >= 12) this.snake[0].y = 11;

    const OPP_DIR: Record<string, string> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT"
    };
    this.nextDir = OPP_DIR[this.dir] || this.dir;
    useSnakeGameStore.getState().applyPenalty(() => (this.scene as any).overlayManager.render(), false);
  };

  public changeDirection = (newDir: string): void => {
    const OPP: Record<string, string> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT"
    };
    if (OPP[newDir] !== this.dir && OPP[newDir] !== this.nextDir) this.nextDir = newDir;
  };

  private resetSnake = (): void => {
    this.dir = this.nextDir = "RIGHT";
    this.snake = [
      { x: 3, y: 5 },
      { x: 2, y: 5 },
      { x: 1, y: 5 }
    ];
  };

  public resetPositionOnCrash = (): void => {};

  public destroy = (): void => {
    this.bombManager?.destroy();
    this.fruitSpawner?.destroy();
    this.renderer?.destroy();
  };
}
