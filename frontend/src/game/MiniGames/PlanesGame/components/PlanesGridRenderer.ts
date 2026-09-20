import Phaser from "phaser";
import { PlanesGameLogicManager } from "./PlanesGameLogicManager";
import { PlanesHelicopterFactory } from "./PlanesHelicopterFactory";

export class PlanesGridRenderer {
  public mainGridContainer!: Phaser.GameObjects.Container;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  public planeGraphics!: Phaser.GameObjects.Graphics;
  private cloudOffset = 0;

  constructor(private scene: Phaser.Scene, private manager: PlanesGameLogicManager) {}

  public setupRenderer(): void {
    this.mainGridContainer = this.scene.add.container(0, 0).setDepth(10);
    this.bgGraphics = this.scene.add.graphics();
    this.planeGraphics = this.scene.add.graphics();

    this.mainGridContainer.add([this.bgGraphics, this.planeGraphics]);
    this.cloudOffset = 0;
    this.resize();
  }

  public getGameWidth(): number {
    return this.scene.scale.width;
  }

  public drawSky(): void {
    this.bgGraphics.clear();
    const h = this.scene.scale.height;
    const gameW = this.getGameWidth();
    this.bgGraphics.fillStyle(0xbae6fd, 1).fillRect(-gameW / 2, -h / 2, gameW, h);
  }

  public updateSkyAnims(speedDelta: number, time: number): void {
    const gameW = this.getGameWidth();
    const halfW = gameW / 2;
    const h = this.scene.scale.height;
    const halfH = h / 2;

    this.cloudOffset -= speedDelta * 0.4;
    if (this.cloudOffset <= -240) this.cloudOffset = 0;

    this.drawSky();

    this.bgGraphics.fillStyle(0xffffff, 0.4);
    for (let x = -halfW - 120; x < halfW + 120; x += 180) {
      const currentX = x + this.cloudOffset;
      if (currentX >= -halfW && currentX <= halfW) {
        this.bgGraphics.fillCircle(currentX, -halfH * 0.5, 20);
        this.bgGraphics.fillCircle(currentX + 15, -halfH * 0.5 - 10, 26);
        this.bgGraphics.fillCircle(currentX + 35, -halfH * 0.5, 18);
      }
    }

    this.drawPlayerHelicopter(time);
    this.drawEnemyHelicoptersAnims(time);
  }

  public drawPlayerHelicopter(time: number): void {
    this.planeGraphics.clear();
    const halfH = this.scene.scale.height / 2;
    if (this.manager.playerY >= -halfH && this.manager.playerY <= halfH) {
      PlanesHelicopterFactory.drawPlayer(this.planeGraphics, this.manager.playerX, this.manager.playerY, time);
    }
  }

  private drawEnemyHelicoptersAnims(time: number): void {
    this.manager.gameObjects.forEach((obj: any) => {
      if (obj.type === "ENEMY_PLANE" && obj.sprite) {
        const graphics = obj.sprite as Phaser.GameObjects.Graphics;
        graphics.clear();

        if (obj.isUfo) {
          PlanesHelicopterFactory.drawUFO(graphics, time);
        } else if (obj.isBoss) {
          PlanesHelicopterFactory.drawBoss(graphics, time);
        } else {
          PlanesHelicopterFactory.drawEnemy(graphics, time);
        }
      }
    });
  }

  public createEnemyPlaneSprite(x: number, y: number): Phaser.GameObjects.Graphics {
    const enemy = this.scene.add.graphics();
    enemy.setPosition(x, y);
    this.mainGridContainer.add(enemy);
    return enemy;
  }

  public resize(): void {
    if (!this.mainGridContainer || !this.scene?.scale) return;
    const { width: w, height: h } = this.scene.scale;
    if (w && h) {
      this.mainGridContainer.setPosition(w / 2, h / 2).setScale(1);
      this.drawSky();
    }
  }

  public destroy(): void {
    this.bgGraphics?.destroy();
    this.planeGraphics?.destroy();
    this.mainGridContainer?.destroy();
  }
}
