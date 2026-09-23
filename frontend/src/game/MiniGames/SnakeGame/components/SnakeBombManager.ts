import Phaser from "phaser";
import { Point, SnakeGameLogicManager } from "./SnakeGameLogicManager";
import { useSnakeGameStore } from "../store/useSnakeGameStore";

export class SnakeBombManager {
  public bomb: Point = { x: -1, y: -1 }; public hasBomb = false;
  public textObj: Phaser.GameObjects.Text | null = null;
  private container!: Phaser.GameObjects.Container; private bombTimer: Phaser.Time.TimerEvent | null = null;

  constructor(private scene: Phaser.Scene, private manager: SnakeGameLogicManager) {}

  public init = (container: Phaser.GameObjects.Container) => { this.container = container; };
  public startTimer = () => { this.stopTimer(); this.bombTimer = this.scene.time.delayedCall(2000, this.trySpawnBomb); };

  private trySpawnBomb = (): void => {
    if (this.hasBomb || useSnakeGameStore.getState().isGameOver || !this.manager.snake.length) return;

    if (Math.random() < 0.35) {
      const hX = this.manager.snake[0].x, hY = this.manager.snake[0].y, valid: Point[] = [];

      for (let x = Math.max(0, hX - 3); x <= Math.min(11, hX + 3); x++) {
        for (let y = Math.max(0, hY - 3); y <= Math.min(11, hY + 3); y++) {
          if (Math.abs(x - hX) <= 1 && Math.abs(y - hY) <= 1) continue;
          if (!this.manager.snake.some(s => s.x === x && s.y === y) && !(x === this.manager.fruitSpawner.fruit.x && y === this.manager.fruitSpawner.fruit.y)) valid.push({ x, y });
        }
      }

      if (valid.length) {
        this.bomb = valid[Math.floor(Math.random() * valid.length)]; this.hasBomb = true;
        this.textObj?.destroy();

        const start = -this.manager.gridDim / 2, cs = this.manager.cellSize;
        this.textObj = this.scene.add.text(start + this.bomb.x * cs + cs / 2, start + this.bomb.y * cs + cs / 2, "💣", { fontSize: `${Math.floor(cs * 0.65)}px`, fontFamily: "Arial" }).setOrigin(0.5);
        this.textObj.setData("isBomb", true); this.container.add(this.textObj);

        this.bombTimer = this.scene.time.delayedCall(5000, () => {
          this.removeBomb(); this.bombTimer = this.scene.time.delayedCall(Phaser.Math.Between(2000, 5000), this.trySpawnBomb);
        });
        return;
      }
    }
    this.bombTimer = this.scene.time.delayedCall(3000, this.trySpawnBomb);
  };

  public removeBomb = (): void => {
    this.stopTimer(); this.textObj?.destroy(); this.textObj = null; this.hasBomb = false; this.bomb = { x: -1, y: -1 };
  };

  private stopTimer = () => { this.bombTimer?.destroy(); this.bombTimer = null; };
  public destroy = () => this.removeBomb();
}
