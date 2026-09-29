import Phaser from "phaser";
import { Point, SnakeGameLogicManager } from "./SnakeGameLogicManager";

export class SnakeFruitSpawner {
  public fruit: Point = { x: 7, y: 7 }; public sprite: Phaser.GameObjects.Image | null = null;
  private container!: Phaser.GameObjects.Container;

  constructor(private scene: Phaser.Scene, private manager: SnakeGameLogicManager) {}

  public init = (container: Phaser.GameObjects.Container) => { this.container = container; };

  public spawn = (): void => {
    const r = () => Math.floor(Math.random() * 12);
    let fx = r(), fy = r(), c = 0;

    while ((this.manager.snake.some(s => s.x === fx && s.y === fy) || (this.manager.bombManager.hasBomb && fx === this.manager.bombManager.bomb.x && fy === this.manager.bombManager.bomb.y)) && c++ < 144) {
      fx = r(); fy = r();
    }
    this.fruit = { x: fx, y: fy }; this.sprite?.destroy();

    const start = -this.manager.gridDim / 2, cs = this.manager.cellSize;
    this.sprite = this.scene.add.image(start + fx * cs + cs / 2, start + fy * cs + cs / 2, `fruit_${String(Phaser.Math.Between(1, 16)).padStart(2, "0")}`).setDisplaySize(cs * 0.9, cs * 0.9);
    this.container.add(this.sprite);
  };

  public destroy = () => { this.sprite?.destroy(); this.sprite = null; };
}
