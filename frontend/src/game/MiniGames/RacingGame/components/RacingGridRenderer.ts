import Phaser from "phaser";
import { RacingGameLogicManager } from "./RacingGameLogicManager";

export class RacingGridRenderer {
  public mainGridContainer!: Phaser.GameObjects.Container;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  public carSprite!: Phaser.GameObjects.Image;
  public finishLineSprite: Phaser.GameObjects.Graphics | null = null;
  private startText: Phaser.GameObjects.Text | null = null;
  private finishText: Phaser.GameObjects.Text | null = null;

  private roadOffsetY = 0;
  private startLineY = 0;
  public finishY = 0;

  constructor(private scene: Phaser.Scene, private manager: RacingGameLogicManager) {}

  public setupRenderer(): void {
    this.mainGridContainer = this.scene.add.container(0, 0).setDepth(10);
    this.bgGraphics = this.scene.add.graphics();
    this.carSprite = this.scene.add.image(0, 180, "player_car").setOrigin(0.5).setDisplaySize(56, 96);

    this.mainGridContainer.add([this.bgGraphics, this.carSprite]);

    const halfH = this.scene.scale.height / 2;
    this.finishY = -halfH;
    this.startLineY = halfH * 0.3;

    this.finishLineSprite = null;
    this.startText = null;
    this.finishText = null;

    this.resize();
  }

  public getRoadWidth(): number {
    const { width: w, height: h } = this.scene.scale;
    return h > w ? w : 480;
  }

  public drawStaticRoad(): void {
    this.bgGraphics.clear();
    const h = this.scene.scale.height;
    const roadW = this.getRoadWidth();
    const halfW = roadW / 2;

    this.bgGraphics.fillStyle(0x334155, 1);
    this.bgGraphics.fillRect(-halfW, -h / 2, roadW, h);
  }

  public updateRoadAnims(speedDelta: number): void {
    this.roadOffsetY = (this.roadOffsetY + speedDelta) % 60;
    this.drawStaticRoad();

    const h = this.scene.scale.height;
    const halfH = h / 2;
    const size = 30;
    const roadW = this.getRoadWidth();
    const halfW = roadW / 2;

    for (let y = -halfH - size; y < halfH + size; y += size) {
      const currentY = y + (this.roadOffsetY % size);
      if (currentY >= -halfH && currentY < halfH) {
        const isEven = Math.floor((currentY - this.roadOffsetY) / size) % 2 === 0;
        this.bgGraphics.fillStyle(isEven ? 0xdc2626 : 0xf8fafc, 1);
        this.bgGraphics.fillRect(-halfW, currentY, 12, size);
        this.bgGraphics.fillRect(halfW - 12, currentY, 12, size);
      }
    }

    this.bgGraphics.fillStyle(0xffffff, 0.6);
    for (let y = -halfH - 60; y < halfH; y += 80) {
      const currentY = y + (this.roadOffsetY % 80);
      if (currentY >= -halfH && currentY + 40 <= halfH) this.bgGraphics.fillRect(-3, currentY, 6, 40);
    }

    if (this.startLineY < halfH) {
      if (this.manager.gameState === "RACING" || this.manager.gameState === "COUNTDOWN") {
        if (this.manager.gameState === "RACING") this.startLineY += speedDelta * 1.6;
        if (this.startLineY >= -halfH && this.startLineY + 20 <= halfH) {
          // Рисуем линию СТАРТ строго между бордюрами (-halfW + 12) и шириной на 24px меньше дороги
          this.bgGraphics.fillStyle(0xf1f5f9, 0.9).fillRect(-halfW + 12, this.startLineY, roadW - 24, 24);
          if (!this.startText) {
            this.startText = this.scene.add.text(0, 0, "СТАРТ", { font: "900 16px sans-serif", color: "#0f172a" }).setOrigin(0.5);
            this.mainGridContainer.add(this.startText);
          }
          this.startText.setPosition(0, this.startLineY + 12).setVisible(true);
        } else if (this.startText) {
          this.startText.setVisible(false);
        }
      }
    }

    if (this.finishLineSprite && this.finishY < this.manager.playerY) {
      this.finishY += speedDelta;
      if (this.finishY <= halfH) {
        this.finishLineSprite.y = this.finishY;
        if (this.finishText) this.finishText.y = this.finishY + 30;
      }
      if (this.finishY >= this.manager.playerY - 15 && this.manager.gameState === "FINISHING") {
        this.manager.gameState = "ENDED";
        (this.scene as any).addScore();
      }
    }

    this.drawCar();
  }

  public spawnFinishLine(): void {
    if (this.finishLineSprite) return;
    this.finishLineSprite = this.scene.add.graphics();
    this.finishY = -this.scene.scale.height / 2;
    const roadW = this.getRoadWidth();
    const halfW = roadW / 2;

    // Сдвигаем сетку финиша вовнутрь асфальта
    const innerWidth = roadW - 24;
    const startX = -halfW + 12;

    const boxSize = 20;
    for (let x = 0; x < innerWidth; x += boxSize) {
      const currentBoxW = Math.min(boxSize, innerWidth - x);
      for (let y = 0; y < 60; y += boxSize) {
        const isBlack = (Math.floor(x / boxSize) + Math.floor(y / boxSize)) % 2 === 0;
        this.finishLineSprite.fillStyle(isBlack ? 0x0f172a : 0xffffff, 1);
        this.finishLineSprite.fillRect(startX + x, y, currentBoxW, boxSize);
      }
    }

    // Красная полоса финиша тоже вписывается строго внутрь трассы
    this.finishLineSprite.fillStyle(0xef4444, 1).fillRect(startX, 55, innerWidth, 8);
    this.mainGridContainer.add(this.finishLineSprite);

    this.finishText = this.scene.add.text(0, this.finishY + 30, "ФИНИШ", { font: "900 24px sans-serif", color: "#ffffff", stroke: "#000000", strokeThickness: 4 }).setOrigin(0.5).setDepth(25);
    this.mainGridContainer.add(this.finishText);
  }

  public drawCar(): void {
    const { playerX: bx, playerY: by } = this.manager;
    const halfH = this.scene.scale.height / 2;
    if (by >= -halfH && by <= halfH) {
      this.carSprite.setPosition(bx, by).setVisible(true);
    } else {
      this.carSprite.setVisible(false);
    }
  }

  public createObstacleSprite(x: number, y: number): Phaser.GameObjects.Graphics {
    const obstacle = this.scene.add.graphics();
    obstacle.setPosition(x, y).fillStyle(0xb45309, 1).fillRect(-22, 16, 44, 8);
    obstacle.fillStyle(0xea580c, 1).fillTriangle(0, -22, -16, 16, 16, 16).fillStyle(0xffffff, 1).fillRect(-8, -2, 16, 6);
    return obstacle;
  }

  public resize(): void {
    if (!this.mainGridContainer || !this.scene?.scale) return;
    const { width: w, height: h } = this.scene.scale;
    if (w && h) {
      this.mainGridContainer.setPosition(w / 2, h / 2).setScale(1);
      this.drawStaticRoad();
    }
  }

  public destroy(): void {
    this.bgGraphics?.destroy();
    this.carSprite?.destroy();
    this.finishLineSprite?.destroy();
    this.startText?.destroy();
    this.finishText?.destroy();
    this.mainGridContainer?.destroy();
  }
}
