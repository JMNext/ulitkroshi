import { Point, SnakeGameLogicManager } from "@/game/MiniGames/SnakeGame/components/SnakeGameLogicManager";
import { useSnakeGameStore } from "@/game/MiniGames/SnakeGame/store/useSnakeGameStore";
import Phaser from "phaser";

export class SnakeBombManager {
  public bomb: Point = { x: -1, y: -1 };
  public hasBomb = false;
  public textObj: Phaser.GameObjects.Text | null = null;
  private container!: Phaser.GameObjects.Container;
  private bombTimer: Phaser.Time.TimerEvent | null = null;

  constructor(
    private scene: Phaser.Scene,
    private manager: SnakeGameLogicManager
  ) {}

  public init(container: Phaser.GameObjects.Container): void {
    this.container = container;
  }

  public startTimer = (): void => {
    this.stopTimer();
    this.bombTimer = this.scene.time.delayedCall(2000, this.trySpawnBomb);
  };

  private trySpawnBomb = (): void => {
    if (this.hasBomb || useSnakeGameStore.getState().isGameOver || this.manager.snake.length === 0) return;

    if (Math.random() < 0.35) {
      const headX = this.manager.snake[0].x;
      const headY = this.manager.snake[0].y;
      const valid: Point[] = [];

      for (let x = Math.max(0, headX - 3); x <= Math.min(11, headX + 3); x++) {
        for (let y = Math.max(0, headY - 3); y <= Math.min(11, headY + 3); y++) {
          if (Math.abs(x - headX) <= 1 && Math.abs(y - headY) <= 1) continue;
          if (
            !this.manager.snake.some((s) => s.x === x && s.y === y) &&
            !(x === this.manager.fruitSpawner.fruit.x && y === this.manager.fruitSpawner.fruit.y)
          ) {
            valid.push({ x, y });
          }
        }
      }

      if (valid.length > 0) {
        this.bomb = valid[Math.floor(Math.random() * valid.length)];
        this.hasBomb = true;

        if (this.textObj) this.textObj.destroy();

        const start = -this.manager.gridDim / 2;
        const fontSz = Math.floor(this.manager.cellSize * 0.65);

        this.textObj = this.scene.add
          .text(
            start + this.bomb.x * this.manager.cellSize + this.manager.cellSize / 2,
            start + this.bomb.y * this.manager.cellSize + this.manager.cellSize / 2,
            "💣",
            { fontSize: `${fontSz}px`, fontFamily: "Arial" }
          )
          .setOrigin(0.5);

        this.textObj.setData("isBomb", true);
        this.container.add(this.textObj);

        this.bombTimer = this.scene.time.delayedCall(5000, () => {
          this.removeBomb();
          this.bombTimer = this.scene.time.delayedCall(Phaser.Math.Between(2000, 5000), this.trySpawnBomb);
        });
        return;
      }
    }
    this.bombTimer = this.scene.time.delayedCall(3000, this.trySpawnBomb);
  };

  public removeBomb = (): void => {
    this.stopTimer();
    if (this.textObj) this.textObj.destroy();
    this.textObj = null;
    this.hasBomb = false;
    this.bomb = { x: -1, y: -1 };
  };

  private stopTimer = (): void => {
    if (this.bombTimer) {
      this.bombTimer.destroy();
      this.bombTimer = null;
    }
  };

  public destroy(): void {
    this.removeBomb();
  }
}
