import Phaser from "phaser";
import { getRacingResizeMetrics } from "../../RacingGame/constants/racingGame.constants";
import { PlanesGameLogicManager } from "./PlanesGameLogicManager";

export class PlanesGridRenderer {
  public mainGridContainer!: Phaser.GameObjects.Container;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private planeGraphics!: Phaser.GameObjects.Graphics;
  private borderGraphics!: Phaser.GameObjects.Graphics;
  private cloudOffset = 0;

  constructor(private scene: Phaser.Scene, private manager: PlanesGameLogicManager) {}

  public setupRenderer(): void {
    this.mainGridContainer = this.scene.add.container(0, 0).setDepth(10);
    this.bgGraphics = this.scene.add.graphics();
    this.planeGraphics = this.scene.add.graphics();
    this.borderGraphics = this.scene.add.graphics().setDepth(20);

    this.mainGridContainer.add(this.bgGraphics);
    this.mainGridContainer.add(this.planeGraphics);
    this.mainGridContainer.add(this.borderGraphics);

    this.cloudOffset = 0;
    this.drawSky();
    this.resize();
  }

  public drawSky(): void {
    this.bgGraphics.clear();

    this.bgGraphics.fillStyle(0xbae6fd, 1);
    this.bgGraphics.fillRect(-240, -280, 480, 560);

    this.borderGraphics.clear();
    this.borderGraphics.lineStyle(4, 0xffca28, 1);
    this.borderGraphics.strokeRect(-240, -280, 480, 560);
  }

  public updateSkyAnims(speedDelta: number, time: number): void {
    this.cloudOffset -= speedDelta * 0.4;
    if (this.cloudOffset <= -240) this.cloudOffset = 0;

    this.drawSky();

    this.bgGraphics.fillStyle(0xffffff, 0.4);
    for (let x = -300; x < 300; x += 180) {
      const currentX = x + this.cloudOffset;
      if (currentX >= -240 && currentX <= 240) {
        this.bgGraphics.fillCircle(currentX, -140, 20);
        this.bgGraphics.fillCircle(currentX + 15, -150, 26);
        this.bgGraphics.fillCircle(currentX + 35, -140, 18);
      }
    }

    this.drawPlayerHelicopter(time);
    this.drawEnemyHelicoptersAnims(time);
  }

  public drawPlayerHelicopter(time: number): void {
    this.planeGraphics.clear();
    const px = this.manager.playerX;
    const py = this.manager.playerY;

    if (py >= -250 && py <= 250) {
      this.planeGraphics.lineStyle(3, 0x1e293b, 1);
      this.planeGraphics.lineBetween(px - 16, py + 14, px + 16, py + 14);
      this.planeGraphics.lineBetween(px - 10, py + 8, px - 12, py + 14);
      this.planeGraphics.lineBetween(px + 10, py + 8, px + 8, py + 14);

      this.planeGraphics.fillStyle(0x1e3a8a, 1);
      this.planeGraphics.fillRect(px - 45, py - 3, 25, 6);

      const tailAngle = time * 0.04;
      const tx = px - 45;
      this.planeGraphics.lineStyle(2, 0x64748b, 1);
      this.planeGraphics.lineBetween(tx - Math.sin(tailAngle) * 10, py - Math.cos(tailAngle) * 10, tx + Math.sin(tailAngle) * 10, py + Math.cos(tailAngle) * 10);

      this.planeGraphics.fillStyle(0x2563eb, 1);
      this.planeGraphics.fillRoundedRect(px - 22, py - 10, 44, 20, 6);

      this.planeGraphics.fillStyle(0x38bdf8, 1);
      this.planeGraphics.fillTriangle(px + 10, py - 8, px + 22, py, px + 10, py + 8);
      this.planeGraphics.fillRect(px, py - 8, 10, 16);

      this.planeGraphics.fillStyle(0x1d4ed8, 1);
      this.planeGraphics.fillRect(px - 4, py - 14, 8, 4);

      const rotorAngle = time * 0.05;
      const rotorWidth = 52;
      this.planeGraphics.lineStyle(3, 0x334155, 0.9);
      this.planeGraphics.lineBetween(px - Math.cos(rotorAngle) * rotorWidth, py - 14, px + Math.cos(rotorAngle) * rotorWidth, py - 14);
    }
  }

  private drawEnemyHelicoptersAnims(time: number): void {
    const rotorAngle = time * 0.05;
    const tailAngle = time * 0.04;

    this.manager.gameObjects.forEach((obj: any) => {
      if (obj.type === "ENEMY_PLANE" && obj.sprite) {
        const graphics = obj.sprite as Phaser.GameObjects.Graphics;
        graphics.clear();

        const ex = 0;
        const ey = 0;

        graphics.lineStyle(3, 0x451a03, 1);
        graphics.lineBetween(ex - 16, ey + 14, ex + 16, ey + 14);
        graphics.lineBetween(ex - 10, ey + 8, ex - 8, ey + 14);
        graphics.lineBetween(ex + 10, ey + 8, ex + 12, ey + 14);

        graphics.fillStyle(0x7f1d1d, 1);
        graphics.fillRect(ex + 20, ey - 3, 25, 6);

        const tx = ex + 45;
        graphics.lineStyle(2, 0x475569, 1);
        graphics.lineBetween(tx - Math.sin(tailAngle) * 10, ey - Math.cos(tailAngle) * 10, tx + Math.sin(tailAngle) * 10, ey + Math.cos(tailAngle) * 10);

        graphics.fillStyle(0xdc2626, 1);
        graphics.fillRoundedRect(ex - 22, ey - 10, 44, 20, 6);

        graphics.fillStyle(0xfca5a5, 1);
        graphics.fillTriangle(ex - 10, ey - 8, ex - 22, ey, ex - 10, ey + 8);
        graphics.fillRect(ex - 10, ey - 8, 10, 16);

        graphics.fillStyle(0x991b1b, 1);
        graphics.fillRect(ex - 4, ey - 14, 8, 4);

        const rotorWidth = 52;
        graphics.lineStyle(3, 0x1e293b, 0.9);
        graphics.lineBetween(ex - Math.cos(rotorAngle) * rotorWidth, ey - 14, ex + Math.cos(rotorAngle) * rotorWidth, ey - 14);
      }
    });
  }

  public createEnemyPlaneSprite(x: number, y: number): Phaser.GameObjects.Graphics {
    const enemy = this.scene.add.graphics();
    enemy.x = x;
    enemy.y = y;
    this.mainGridContainer.add(enemy);
    return enemy;
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
    this.planeGraphics?.destroy();
    this.borderGraphics?.destroy();
    this.mainGridContainer?.destroy();
  }
}
