import Phaser from "phaser";

export class PlanesHelicopterFactory {
  public static drawPlayer(graphics: Phaser.GameObjects.Graphics, px: number, py: number, time: number): void {
    graphics.lineStyle(3, 0x1e293b, 1);
    graphics.lineBetween(px - 16, py + 14, px + 16, py + 14);
    graphics.lineBetween(px - 10, py + 8, px - 12, py + 14);
    graphics.lineBetween(px + 10, py + 8, px + 8, py + 14);

    graphics.fillStyle(0x1e3a8a, 1).fillRect(px - 45, py - 3, 25, 6);

    const tailAngle = time * 0.04;
    const tx = px - 45;
    graphics.lineStyle(2, 0x64748b, 1);
    graphics.lineBetween(tx - Math.sin(tailAngle) * 10, py - Math.cos(tailAngle) * 10, tx + Math.sin(tailAngle) * 10, py + Math.cos(tailAngle) * 10);

    graphics.fillStyle(0x2563eb, 1).fillRoundedRect(px - 22, py - 10, 44, 20, 6);
    graphics.fillStyle(0x38bdf8, 1).fillTriangle(px + 10, py - 8, px + 22, py, px + 10, py + 8);
    graphics.fillRect(px, py - 8, 10, 16).fillStyle(0x1d4ed8, 1).fillRect(px - 4, py - 14, 8, 4);

    const rotorAngle = time * 0.05;
    const rotorWidth = 52;
    graphics.lineStyle(3, 0x334155, 0.9);
    graphics.lineBetween(px - Math.cos(rotorAngle) * rotorWidth, py - 14, px + Math.cos(rotorAngle) * rotorWidth, py - 14);
    graphics.lineStyle(1, 0x334155, 0.3);
    graphics.lineBetween(px - Math.sin(rotorAngle) * rotorWidth, py - 14, px + Math.sin(rotorAngle) * rotorWidth, py - 14);
  }

  public static drawEnemy(graphics: Phaser.GameObjects.Graphics, time: number): void {
    this.renderHelicopterCore(graphics, time, 0x7f1d1d, 0xdc2626, 0xfca5a5, 0x991b1b, 1);
  }

  public static drawBoss(graphics: Phaser.GameObjects.Graphics, time: number): void {
    this.renderHelicopterCore(graphics, time, 0x3b0764, 0x6b21a8, 0xd8b4fe, 0x581c87, 1.5);
  }

  public static drawUFO(graphics: Phaser.GameObjects.Graphics, time: number): void {
    // Рисуем классическую летающую тарелку
    graphics.fillStyle(0x0284c7, 0.8);
    graphics.fillEllipse(0, -10, 36, 24); // Стеклянный купол

    graphics.fillStyle(0x047857, 1);
    graphics.fillCircle(0, -14, 6); // Пришелец внутри

    graphics.fillStyle(0x94a3b8, 1);
    graphics.fillEllipse(0, 4, 64, 18); // Серебряный корпус тарелки

    // Мигающие габаритные огни НЛО
    const flash = Math.floor(time / 150) % 2 === 0;
    graphics.fillStyle(flash ? 0xfacc15 : 0xef4444, 1);
    graphics.fillCircle(-20, 4, 4);
    graphics.fillCircle(20, 4, 4);
    graphics.fillStyle(flash ? 0xef4444 : 0x22c55e, 1);
    graphics.fillCircle(0, 8, 4);
  }

  private static renderHelicopterCore(graphics: Phaser.GameObjects.Graphics, time: number, c1: number, c2: number, c3: number, c4: number, scale: number): void {
    const ex = 0;
    const ey = 0;
    const rotorAngle = time * 0.05;
    const tailAngle = time * 0.04;

    graphics.lineStyle(3 * scale, 0x1e293b, 1);
    graphics.lineBetween(ex - 16 * scale, ey + 14 * scale, ex + 16 * scale, ey + 14 * scale);
    graphics.lineBetween(ex - 10 * scale, ey + 8 * scale, ex - 8 * scale, ey + 14 * scale);
    graphics.lineBetween(ex + 10 * scale, ey + 8 * scale, ex + 12 * scale, ey + 14 * scale);

    graphics.fillStyle(c1, 1).fillRect(ex + 20 * scale, ey - 3 * scale, 25 * scale, 6 * scale);

    const tx = ex + 45 * scale;
    graphics.lineStyle(2 * scale, 0x475569, 1);
    graphics.lineBetween(tx - Math.sin(tailAngle) * 10 * scale, ey - Math.cos(tailAngle) * 10 * scale, tx + Math.sin(tailAngle) * 10 * scale, ey + Math.cos(tailAngle) * 10 * scale);

    graphics.fillStyle(c2, 1).fillRoundedRect(ex - 22 * scale, ey - 10 * scale, 44 * scale, 20 * scale, 6 * scale);
    graphics.fillStyle(c3, 1).fillTriangle(ex - 10 * scale, ey - 8 * scale, ex - 22 * scale, ey, ex - 10 * scale, ey + 8 * scale);
    graphics.fillRect(ex - 10 * scale, ey - 8 * scale, 10 * scale, 16 * scale).fillStyle(c4, 1).fillRect(ex - 4 * scale, ey - 14 * scale, 8 * scale, 4 * scale);

    const rotorWidth = 52 * scale;
    graphics.lineStyle(3 * scale, 0x1e293b, 0.9);
    graphics.lineBetween(ex - Math.cos(rotorAngle) * rotorWidth, ey - 14 * scale, ex + Math.cos(rotorAngle) * rotorWidth, ey - 14 * scale);
    graphics.lineStyle(1 * scale, 0x1e293b, 0.3);
    graphics.lineBetween(ex - Math.sin(rotorAngle) * rotorWidth, ey - 14 * scale, ex + Math.sin(rotorAngle) * rotorWidth, ey - 14 * scale);
  }
}
