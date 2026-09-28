import { getSharedGameResizeMetrics } from "@/game/MiniGamesShared/miniGames.constants";
import Phaser from "phaser";
import { SnakeGameLogicManager } from "./SnakeGameLogicManager";

export class SnakeGridRenderer {
  public mainGridContainer!: Phaser.GameObjects.Container;
  private gridGraphics: Phaser.GameObjects.Graphics | null = null;
  private snakeGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(private scene: Phaser.Scene, private manager: SnakeGameLogicManager) {}

  public init(): void {
    this.mainGridContainer = this.scene.add.container(0, 0).setDepth(10);
    this.gridGraphics = this.scene.add.graphics();
    this.snakeGraphics = this.scene.add.graphics();
    this.mainGridContainer.add([this.gridGraphics, this.snakeGraphics]);
    this.drawGrid();
  }

  public drawGrid = (): void => {
    if (!this.gridGraphics) return;
    this.gridGraphics.clear();
    const half = this.manager.gridDim / 2, cs = this.manager.cellSize, dim = this.manager.gridDim;
    this.gridGraphics.fillStyle(0xffffff, 0.4).fillRoundedRect(-half - 6, -half - 6, dim + 12, dim + 12, 24);
    this.gridGraphics
      .lineStyle(4, 0x61aa05, 1)
      .strokeRoundedRect(-half - 6, -half - 6, dim + 12, dim + 12, 24)
      .lineStyle(1, 0x61aa05, 0.15);
    for (let i = 1; i < 12; i++) {
      this.gridGraphics.lineBetween(-half + i * cs, -half, -half + i * cs, half);
      this.gridGraphics.lineBetween(-half, -half + i * cs, half, -half + i * cs);
    }
  };

  public drawSnake = (): void => {
    if (!this.snakeGraphics) return;
    this.snakeGraphics.clear();
    const start = -this.manager.gridDim / 2, cs = this.manager.cellSize;

    this.manager.snake.forEach((block, idx) => {
      const bx = start + block.x * cs, by = start + block.y * cs;
      this.snakeGraphics!.fillStyle(idx === 0 ? 0x4c9203 : 0x61aa05, 1).fillRoundedRect(bx + 1, by + 2, cs - 2, cs - 4, 8);

      if (idx === 0) {
        this.snakeGraphics!.fillStyle(0, 1);
        const isVert = this.manager.dir === "UP" || this.manager.dir === "DOWN";
        this.snakeGraphics!.fillCircle(bx + cs * (isVert ? 0.3 : 0.5), by + cs * (isVert ? 0.5 : 0.3), 3);
        this.snakeGraphics!.fillCircle(bx + cs * (isVert ? 0.7 : 0.5), by + cs * (isVert ? 0.5 : 0.7), 3);
      }
    });
    if (this.manager.fruitSpawner.sprite) this.mainGridContainer.bringToTop(this.manager.fruitSpawner.sprite);
    if (this.manager.bombManager.textObj) this.mainGridContainer.bringToTop(this.manager.bombManager.textObj);
  };

  public resize = (): void => {
    if (!this.mainGridContainer || !this.scene?.scale) return;
    const { width: w, height: h } = this.scene.scale;
    if (!w || !h) return;
    const isPort = h > w, m = getSharedGameResizeMetrics(w, h, isPort), dim = this.manager.gridDim;
    let sc = Math.min(w / (dim + m.paddingX), h / (dim + m.paddingY));
    sc = isPort ? Math.min(sc, (w * 0.86) / dim) : Math.min(sc, 1.12);
    this.mainGridContainer.setPosition(w / 2 + m.offsetX, isPort ? h / 2 - 20 + m.offsetY : h / 2 + m.offsetY).setScale(sc);
  };

  public destroy(): void {
    this.gridGraphics?.destroy();
    this.snakeGraphics?.destroy();
    this.mainGridContainer?.destroy();
    this.gridGraphics = this.snakeGraphics = null;
  }
}
