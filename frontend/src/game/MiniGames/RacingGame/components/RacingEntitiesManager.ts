import Phaser from "phaser";
import { useRacingGameStore } from "../store/useRacingGameStore";
import { RacingGameLogicManager, RacingEntity } from "./RacingGameLogicManager";

export class RacingEntitiesManager {
  public entities: RacingEntity[] = [];
  private container!: Phaser.GameObjects.Container;

  constructor(private scene: Phaser.Scene, private manager: RacingGameLogicManager) {}

  public init(container: Phaser.GameObjects.Container): void {
    this.container = container;
    this.entities = [];
  }

  public spawnRandom(): void {
    if (useRacingGameStore.getState().isGameOver) return;

    const lanes = [-150, -75, 0, 75, 150];
    const spawnX = lanes[Phaser.Math.Between(0, lanes.length - 1)];
    const spawnY = -320;

    if (this.entities.some(e => e.x === spawnX && e.y < -200)) return;

    const rand = Math.random();
    let type: "FRUIT" | "BOMB" | "OBSTACLE" = "OBSTACLE";
    let sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Image | Phaser.GameObjects.Text;

    if (rand < 0.45) {
      type = "FRUIT";
      const fruitKey = `fruit_${String(Phaser.Math.Between(1, 16)).padStart(2, "0")}`;
      sprite = this.scene.add.image(spawnX, spawnY, fruitKey).setDisplaySize(44, 44);
    } else if (rand < 0.68) {
      type = "BOMB";
      sprite = this.scene.add.text(spawnX, spawnY, "💣", { fontSize: "32px", fontFamily: "Arial" }).setOrigin(0.5);
    } else {
      type = "OBSTACLE";
      sprite = this.manager.renderer.createObstacleSprite(spawnX, spawnY);
    }

    this.container.add(sprite);
    this.entities.push({ x: spawnX, y: spawnY, type, sprite });
  }

  public clear(): void {
    this.entities.forEach(e => {
      if (e.sprite) e.sprite.destroy();
    });
    this.entities = [];
  }
}
