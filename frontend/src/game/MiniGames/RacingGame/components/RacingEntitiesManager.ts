import Phaser from "phaser";
import { useRacingGameStore } from "../store/useRacingGameStore";
import { RacingEntity, RacingGameLogicManager } from "./RacingGameLogicManager";

export class RacingEntitiesManager {
  public entities: RacingEntity[] = [];
  private container!: Phaser.GameObjects.Container;

  constructor(private scene: Phaser.Scene, private manager: RacingGameLogicManager) {}

  public init(container: Phaser.GameObjects.Container): void { this.container = container; this.entities = []; }

  public spawnRandom(): void {
    if (useRacingGameStore.getState().isGameOver) return;
    const hH = this.scene.scale.height / 2, lanes = [-150, -75, 0, 75, 150];
    const sX = lanes[Phaser.Math.Between(0, lanes.length - 1)], sY = -hH - 50;

    if (this.entities.some(e => e.x === sX && e.y < -hH + 80)) return;

    const rand = Math.random();
    const type = rand < 0.45 ? "FRUIT" : rand < 0.68 ? "BOMB" : "OBSTACLE";

    const sprite = type === "FRUIT"
      ? this.scene.add.image(sX, sY, `fruit_${String(Phaser.Math.Between(1, 16)).padStart(2, "0")}`).setDisplaySize(44, 44)
      : type === "BOMB"
        ? this.scene.add.text(sX, sY, "💣", { fontSize: "32px", fontFamily: "Arial" }).setOrigin(0.5)
        : this.manager.renderer.createObstacleSprite(sX, sY);

    this.container.add(sprite); this.container.moveTo(sprite, 1);
    this.entities.push({ x: sX, y: sY, type, sprite });
  }

  public clear(): void { this.entities.forEach(e => e.sprite?.destroy()); this.entities = []; }
}
