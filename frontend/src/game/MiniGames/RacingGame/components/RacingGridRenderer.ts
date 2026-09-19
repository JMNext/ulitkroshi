import Phaser from "phaser";
import { getRacingResizeMetrics } from "../constants/racingGame.constants";
import { RacingGameLogicManager } from "./RacingGameLogicManager";
import { useRacingGameStore } from "../store/useRacingGameStore";

export class RacingGridRenderer {
  public mainGridContainer!: Phaser.GameObjects.Container;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private carSprite!: Phaser.GameObjects.Graphics;
  private borderGraphics!: Phaser.GameObjects.Graphics;

  private roadOffsetY = 0;
  private startLineY = 180;
  private finishLineSprite: Phaser.GameObjects.Graphics | null = null;
  private finishY = -280;

  constructor(private scene: Phaser.Scene, private manager: RacingGameLogicManager) {}

  public setupRenderer(): void {
    this.mainGridContainer = this.scene.add.container(0, 0).setDepth(10);
    this.bgGraphics = this.scene.add.graphics();
    this.carSprite = this.scene.add.graphics();
    this.borderGraphics = this.scene.add.graphics().setDepth(20);

    this.mainGridContainer.add(this.bgGraphics);
    this.mainGridContainer.add(this.carSprite);
    this.mainGridContainer.add(this.borderGraphics);

    this.finishLineSprite = null;
    this.finishY = -280;
    this.startLineY = 180;
    this.roadOffsetY = 0;

    this.drawStaticRoad();
    this.drawCar();
    this.resize();
  }

  public drawStaticRoad(): void {
    this.bgGraphics.clear();

    this.bgGraphics.fillStyle(0x334155, 1);
    this.bgGraphics.fillRect(-240, -280, 480, 560);

    this.borderGraphics.clear();
    this.borderGraphics.lineStyle(4, 0xffca28, 1);
    this.borderGraphics.strokeRect(-240, -280, 480, 560);
  }

  public updateRoadAnims(speedDelta: number): void {
    this.roadOffsetY = (this.roadOffsetY + speedDelta) % 60;

    this.drawStaticRoad();

    const size = 30;
    const startY = -280;
    const endY = 280;

    for (let y = startY - size; y < endY + size; y += size) {
      const currentY = y + (this.roadOffsetY % size);

      if (currentY >= startY && currentY < endY) {
        const index = Math.floor((currentY - this.roadOffsetY) / size);
        const isEven = index % 2 === 0;

        this.bgGraphics.fillStyle(isEven ? 0xdc2626 : 0xf8fafc, 1);
        this.bgGraphics.fillRect(-240, currentY, 12, size);
        this.bgGraphics.fillRect(228, currentY, 12, size);
      }
    }

    this.bgGraphics.fillStyle(0xffffff, 0.6);
    for (let y = -340; y < 300; y += 80) {
      const currentY = y + (this.roadOffsetY % 80);
      if (currentY >= -280 && currentY + 40 <= 280) {
        this.bgGraphics.fillRect(-3, currentY, 6, 40);
      }
    }

    if (this.manager.gameState === "RACING" && this.startLineY < 280) {
      this.startLineY += speedDelta * 1.6;
      if (this.startLineY >= -280 && this.startLineY + 20 <= 280) {
        this.bgGraphics.fillStyle(0xf1f5f9, 0.9);
        this.bgGraphics.fillRect(-240, this.startLineY, 480, 20);
      }
    }

    if (this.finishLineSprite && this.finishY < this.manager.playerY) {
      this.finishY += speedDelta;
      if (this.finishY <= 280) {
        this.finishLineSprite.y = this.finishY;
      }

      if (this.finishY >= this.manager.playerY - 15 && this.manager.gameState === "FINISHING") {
        this.manager.gameState = "ENDED";
        const sceneCtx = this.scene as any;
        sceneCtx.addScore();
      }
    }

    this.drawCar();
  }

  public spawnFinishLine(): void {
    if (this.finishLineSprite) return;

    this.finishLineSprite = this.scene.add.graphics();
    this.finishY = -280;

    const boxSize = 20;
    for (let x = -240; x < 240; x += boxSize) {
      for (let y = 0; y < 60; y += boxSize) {
        const isBlack = (Math.floor(x / boxSize) + Math.floor(y / boxSize)) % 2 === 0;
        this.finishLineSprite.fillStyle(isBlack ? 0x0f172a : 0xffffff, 1);
        this.finishLineSprite.fillRect(x, y, boxSize, boxSize);
      }
    }

    this.finishLineSprite.fillStyle(0xef4444, 1);
    this.finishLineSprite.fillRect(-240, 55, 480, 8);

    this.mainGridContainer.add(this.finishLineSprite);
  }

  public drawCar(): void {
    this.carSprite.clear();
    const bx = this.manager.playerX;
    const by = this.manager.playerY;

    if (by >= -280 && by <= 280) {
      this.carSprite.fillStyle(0x0f172a, 1);
      this.carSprite.fillRoundedRect(bx - 24, by - 22, 10, 16, 3);
      this.carSprite.fillRoundedRect(bx + 14, by - 22, 10, 16, 3);
      this.carSprite.fillRoundedRect(bx - 24, by + 12, 10, 18, 3);
      this.carSprite.fillRoundedRect(bx + 14, by + 12, 10, 18, 3);

      this.carSprite.fillStyle(0x2563eb, 1);
      this.carSprite.fillTriangle(bx, by - 26, bx - 16, by + 22, bx + 16, by + 22);
      this.carSprite.fillRoundedRect(bx - 14, by - 8, 28, 30, 6);

      this.carSprite.fillStyle(0x38bdf8, 1);
      this.carSprite.fillCircle(bx, by - 2, 8);

      this.carSprite.fillStyle(0x1d4ed8, 1);
      this.carSprite.fillRect(bx - 22, by + 22, 44, 6);
    }
  }

  public createObstacleSprite(x: number, y: number): Phaser.GameObjects.Graphics {
    const obstacle = this.scene.add.graphics();
    obstacle.x = x;
    obstacle.y = y;

    obstacle.fillStyle(0xb45309, 1);
    obstacle.fillRect(-22, 16, 44, 8);
    obstacle.fillStyle(0xea580c, 1);
    obstacle.fillTriangle(0, -22, -16, 16, 16, 16);
    obstacle.fillStyle(0xffffff, 1);
    obstacle.fillRect(-8, -2, 16, 6);

    return obstacle;
  }

  public resize(): void {
    if (!this.mainGridContainer || !this.scene?.scale) return;
    const { width: w, height: h } = this.scene.scale;
    if (w === 0 || h === 0) return;
    const isPortrait = h > w;

    const metrics = getRacingResizeMetrics(w, h, isPortrait);
    let fitScale = Math.min(w / (480 + metrics.paddingX), h / (560 + metrics.paddingY));

    fitScale = isPortrait ? Math.min(fitScale, (w * 0.86) / 480) : Math.min(fitScale, 1.12);
    this.mainGridContainer.setPosition(w / 2 + metrics.offsetX, isPortrait ? h / 2 - 20 + metrics.offsetY : h / 2 + metrics.offsetY).setScale(fitScale);
  }

  public destroy(): void {
    this.bgGraphics?.destroy();
    this.carSprite?.destroy();
    this.borderGraphics?.destroy();
    if (this.finishLineSprite) this.finishLineSprite.destroy();
    this.mainGridContainer?.destroy();
  }
}
