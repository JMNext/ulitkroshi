import Phaser from "phaser";
import { RacingGameLogicManager } from "./RacingGameLogicManager";
import { useRacingGameStore } from "@/game/MiniGames/RacingGame/store/useRacingGameStore";

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

  constructor(
    private scene: Phaser.Scene,
    private manager: RacingGameLogicManager
  ) {}

  public setupRenderer(): void {
    this.mainGridContainer = this.scene.add.container(0, 0).setDepth(10);
    this.bgGraphics = this.scene.add.graphics();
    this.carSprite = this.scene.add.image(0, 180, "player_car").setOrigin(0.5).setDisplaySize(56, 96);
    this.mainGridContainer.add([this.bgGraphics, this.carSprite]).bringToTop(this.carSprite);

    const halfH = this.scene.scale.height / 2;
    this.finishY = -halfH;
    this.startLineY = halfH * 0.3;
    this.finishLineSprite = this.startText = this.finishText = null;
    this.resize();
  }

  public getRoadWidth(): number {
    const { width: w, height: h } = this.scene.scale;
    return h > w ? w : 480;
  }

  public drawStaticRoad(): void {
    this.bgGraphics.clear();
    const h = this.scene.scale.height, roadW = this.getRoadWidth();
    this.bgGraphics.fillStyle(0x334155, 1).fillRect(-roadW / 2, -h / 2, roadW, h);
  }

  public updateRoadAnims(speedDelta: number): void {
    this.roadOffsetY = (this.roadOffsetY + speedDelta) % 60;
    this.drawStaticRoad();
    const h = this.scene.scale.height, halfH = h / 2, size = 30, roadW = this.getRoadWidth(), halfW = roadW / 2;

    for (let y = -halfH - size; y < halfH + size; y += size) {
      const curY = y + (this.roadOffsetY % size);
      if (curY >= -halfH && curY < halfH) {
        this.bgGraphics
          .fillStyle(Math.floor((curY - this.roadOffsetY) / size) % 2 === 0 ? 0xdc2626 : 0xf8fafc, 1)
          .fillRect(-halfW, curY, 12, size)
          .fillRect(halfW - 12, curY, 12, size);
      }
    }

    this.bgGraphics.fillStyle(0xffffff, 0.6);
    for (let y = -halfH - 60; y < halfH; y += 80) {
      const curY = y + (this.roadOffsetY % 80);
      if (curY >= -halfH && curY + 40 <= halfH) this.bgGraphics.fillRect(-3, curY, 6, 40);
    }

    const store = useRacingGameStore.getState();
    const ctx = this.scene as any;

    if (this.startLineY < halfH && (ctx.gameState === "PLAYING" || ctx.gameState === "COUNTDOWN")) {
      if (ctx.gameState === "PLAYING") this.startLineY += speedDelta * 1.6;
      if (this.startLineY >= -halfH && this.startLineY + 20 <= halfH) {
        this.bgGraphics.fillStyle(0xf1f5f9, 0.9).fillRect(-halfW + 12, this.startLineY, roadW - 24, 24);
        if (!this.startText)
          this.mainGridContainer.add(
            (this.startText = this.scene.add.text(0, 0, "СТАРТ", { font: "900 16px sans-serif", color: "#0f172a" }).setOrigin(0.5))
          );
        this.startText.setPosition(0, this.startLineY + 12).setVisible(true);
      } else this.startText?.setVisible(false);
    }

    if (this.finishLineSprite && this.finishY < this.manager.playerY + 250) {
      this.finishY += speedDelta;
      if (this.finishY <= halfH + 250) {
        this.finishLineSprite.y = this.finishY;
        if (this.finishText) this.finishText.y = this.finishY + 30;
      }
    }
    this.drawCar();
  }

  public spawnFinishLine(): void {
    if (this.finishLineSprite) return;
    this.finishLineSprite = this.scene.add.graphics();
    this.finishY = -this.scene.scale.height / 2;
    const roadW = this.getRoadWidth(), halfW = roadW / 2, innerW = roadW - 24, startX = -halfW + 12, box = 20;

    for (let x = 0; x < innerW; x += box) {
      const curBoxW = Math.min(box, innerW - x);
      for (let y = 0; y < 60; y += box) {
        this.finishLineSprite
          .fillStyle((Math.floor(x / box) + Math.floor(y / box)) % 2 === 0 ? 0x0f172a : 0xffffff, 1)
          .fillRect(startX + x, y, curBoxW, box);
      }
    }

    this.mainGridContainer.add([
      this.finishLineSprite,
      (this.finishText = this.scene.add
        .text(0, this.finishY + 30, "ФИНИШ", { font: "900 24px sans-serif", color: "#ffffff", stroke: "#000000", strokeThickness: 4 })
        .setOrigin(0.5))
    ]);
    this.mainGridContainer
      .sendToBack(this.finishText)
      .sendToBack(this.finishLineSprite)
      .sendToBack(this.bgGraphics)
      .bringToTop(this.carSprite);
  }

  public drawCar(): void {
    const halfH = this.scene.scale.height / 2;
    this.manager.playerY >= -halfH && this.manager.playerY <= halfH
      ? this.carSprite.setPosition(this.manager.playerX, this.manager.playerY).setVisible(true)
      : this.carSprite.setVisible(false);
  }

  public createObstacleSprite(x: number, y: number): Phaser.GameObjects.Graphics {
    return this.scene.add
      .graphics()
      .setPosition(x, y)
      .fillStyle(0xb45309, 1)
      .fillRect(-22, 16, 44, 8)
      .fillStyle(0xea580c, 1)
      .fillTriangle(0, -22, -16, 16, 16, 16)
      .fillStyle(0xffffff, 1)
      .fillRect(-8, -2, 16, 6);
  }

  public resize(): void {
    if (this.mainGridContainer && this.scene?.scale?.width) {
      this.mainGridContainer.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2).setScale(1);
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
