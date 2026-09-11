import Phaser from "phaser";
import { getSnakeResizeMetrics } from "../constants/snakeGame.constants";
import { SnakeGameLogicManager } from "./SnakeGameLogicManager";

export class SnakeGridRenderer {
  public mainGridContainer!: Phaser.GameObjects.Container;
  private gridGraphics: Phaser.GameObjects.Graphics | null = null;
  private snakeGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(
    private scene: Phaser.Scene,
    private manager: SnakeGameLogicManager
  ) {}

  public init(): void {
    this.mainGridContainer = this.scene.add.container(0, 0).setDepth(10);
    this.gridGraphics = this.scene.add.graphics();
    this.snakeGraphics = this.scene.add.graphics();
    this.mainGridContainer.add(this.gridGraphics);
    this.mainGridContainer.add(this.snakeGraphics);
    this.drawGrid();
  }

  public drawGrid = (): void => {
    if (!this.gridGraphics) return;
    this.gridGraphics.clear();
    const half = this.manager.gridDim / 2;
    this.gridGraphics
      .fillStyle(0xffffff, 0.4)
      .fillRoundedRect(-half - 6, -half - 6, this.manager.gridDim + 12, this.manager.gridDim + 12, 24);
    this.gridGraphics
      .lineStyle(4, 0x61aa05, 1)
      .strokeRoundedRect(-half - 6, -half - 6, this.manager.gridDim + 12, this.manager.gridDim + 12, 24)
      .lineStyle(1, 0x61aa05, 0.15);
    for (let i = 1; i < 12; i++) {
      this.gridGraphics.lineBetween(-half + i * this.manager.cellSize, -half, -half + i * this.manager.cellSize, half);
      this.gridGraphics.lineBetween(-half, -half + i * this.manager.cellSize, half, -half + i * this.manager.cellSize);
    }
  };

  public drawSnake = (): void => {
    if (!this.snakeGraphics) return;
    this.snakeGraphics.clear();

    const start = -this.manager.gridDim / 2;
    this.manager.snake.forEach((block, index) => {
      const bx = start + block.x * this.manager.cellSize;
      const by = start + block.y * this.manager.cellSize;

      this.snakeGraphics!.fillStyle(index === 0 ? 0x4c9203 : 0x61aa05, 1).fillRoundedRect(
        bx + 1,
        by + 2,
        this.manager.cellSize - 2,
        this.manager.cellSize - 4,
        8
      );

      if (index === 0) {
        this.snakeGraphics!.fillStyle(0, 1);
        const isVert = this.manager.dir === "UP" || this.manager.dir === "DOWN";
        this.snakeGraphics!.fillCircle(
          bx + this.manager.cellSize * (isVert ? 0.3 : 0.5),
          by + this.manager.cellSize * (isVert ? 0.5 : 0.3),
          3
        );
        this.snakeGraphics!.fillCircle(
          bx + this.manager.cellSize * (isVert ? 0.7 : 0.5),
          by + this.manager.cellSize * (isVert ? 0.5 : 0.7),
          3
        );
      }
    });

    if (this.manager.fruitSpawner.sprite) this.mainGridContainer.bringToTop(this.manager.fruitSpawner.sprite);
    if (this.manager.bombManager.textObj) this.mainGridContainer.bringToTop(this.manager.bombManager.textObj);
  };

  public resize = (): void => {
    if (!this.mainGridContainer || !this.scene?.scale) return;
    const { width: w, height: h } = this.scene.scale;
    if (w === 0 || h === 0) return;
    const isPortrait = h > w;

    const metrics = getSnakeResizeMetrics(w, h, isPortrait);
    let fitScale = Math.min(w / (this.manager.gridDim + metrics.paddingX), h / (this.manager.gridDim + metrics.paddingY));

    if (isPortrait) {
      const maxVertScale = (w * 0.86) / this.manager.gridDim;
      fitScale = Math.min(fitScale, maxVertScale);
    } else {
      fitScale = Math.min(fitScale, 1.12);
    }

    this.mainGridContainer
      .setPosition(w / 2 + metrics.offsetX, isPortrait ? h / 2 - 20 + metrics.offsetY : h / 2 + metrics.offsetY)
      .setScale(fitScale);
  };

  public destroy(): void {
    if (this.gridGraphics) this.gridGraphics.destroy();
    if (this.snakeGraphics) this.snakeGraphics.destroy();
    this.mainGridContainer?.destroy();
    this.gridGraphics = null;
    this.snakeGraphics = null;
  }
}
