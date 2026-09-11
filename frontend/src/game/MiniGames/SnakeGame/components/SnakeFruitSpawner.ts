import Phaser from "phaser";
import { Point, SnakeGameLogicManager } from "./SnakeGameLogicManager";

export class SnakeFruitSpawner {
  public fruit: Point = { x: 7, y: 7 };
  public sprite: Phaser.GameObjects.Image | null = null;
  private container!: Phaser.GameObjects.Container;

  constructor(
    private scene: Phaser.Scene,
    private manager: SnakeGameLogicManager
  ) {}

  public init(container: Phaser.GameObjects.Container): void {
    this.container = container;
  }

  public spawn = (): void => {
    const r = () => Math.floor(Math.random() * 12);
    let fx = r(),
      fy = r();
    let counter = 0;

    while (
      (this.manager.snake.some((s) => s.x === fx && s.y === fy) ||
        (this.manager.bombManager.hasBomb && fx === this.manager.bombManager.bomb.x && fy === this.manager.bombManager.bomb.y)) &&
      counter < 144
    ) {
      fx = r();
      fy = r();
      counter++;
    }
    this.fruit = { x: fx, y: fy };

    if (this.sprite) this.sprite.destroy();

    const start = -this.manager.gridDim / 2;
    const fruitKey = `fruit_${String(Phaser.Math.Between(1, 16)).padStart(2, "0")}`;

    this.sprite = this.scene.add
      .image(
        start + fx * this.manager.cellSize + this.manager.cellSize / 2,
        start + fy * this.manager.cellSize + this.manager.cellSize / 2,
        fruitKey
      )
      .setDisplaySize(this.manager.cellSize * 0.9, this.manager.cellSize * 0.9);

    this.container.add(this.sprite);
  };

  public destroy(): void {
    if (this.sprite) this.sprite.destroy();
    this.sprite = null;
  }
}
