import Phaser from "phaser";
import { CatchGameScene } from "./CatchGameScene";
import { useCatchGameStore } from "./store/useCatchGameStore";
import { CatchGamePet } from "./CatchGamePet";
import { getCatchResizeMetrics } from "./catchGame.constants";

export class CatchGamePhysicsManager {
  public fruitsGroup: (Phaser.GameObjects.Image | Phaser.GameObjects.Text)[] = [];
  private nextSpawnTime = 0;
  private currentFruitSize = 64;

  constructor(private scene: CatchGameScene, public speed: number, public delay: number) {}

  public initPhysics = (): void => {
    this.fruitsGroup = [];
    this.nextSpawnTime = this.scene.time.now + this.delay;
    this.resizeMetrics();
  };

  public updatePhysics = (time: number, delta: number, pet: CatchGamePet): void => {
    if (useCatchGameStore.getState().isGameOver) return;

    if (time > this.nextSpawnTime) {
      this.spawnItem();
      this.nextSpawnTime = time + this.delay;
    }

    const pL = pet.x - pet.width * 0.25;
    const pR = pet.x + pet.width * 0.25;
    const pT = pet.y - pet.height * 0.75;
    const pB = pet.y - pet.height * 0.1;
    const r = this.currentFruitSize / 2;
    const dt = delta / 16.666;

    for (let i = this.fruitsGroup.length - 1; i >= 0; i--) {
      const item = this.fruitsGroup[i];
      if (!item?.active) { this.fruitsGroup.splice(i, 1); continue; }

      item.y += this.speed * dt;
      item.angle += 2 * dt;

      if (item.x + r > pL && item.x - r < pR && item.y + r > pT && item.y - r < pB) {
        const isBomb = item.getData("isBomb") === true;
        item.destroy();
        this.fruitsGroup.splice(i, 1);
        if (isBomb) this.scene.hitBomb(); else this.scene.addScore();
        continue;
      }

      if (item.y > this.scene.scale.height + 70) {
        const isBomb = item.getData("isBomb") === true;
        item.destroy();
        this.fruitsGroup.splice(i, 1);
        if (!isBomb) this.scene.loseHp();
        if (useCatchGameStore.getState().isGameOver) break;
      }
    }
  };

  private spawnItem = (): void => {
    const { width: screenWidth } = this.scene.scale;
    const spawnX = 60 + Math.random() * (screenWidth - 120);
    const isBomb = Math.random() < 0.25;

    if (isBomb) {
      const size = Math.floor(this.currentFruitSize * 0.65);
      const bomb = this.scene.add.text(spawnX, -70, "💣", { fontSize: `${size}px`, fontFamily: "Arial" }).setOrigin(0.5);
      bomb.setData("isBomb", true);
      this.fruitsGroup.push(bomb);
    } else {
      const fruit = this.scene.add.image(spawnX, -70, `fruit_${String(Phaser.Math.Between(1, 16)).padStart(2, "0")}`).setDisplaySize(this.currentFruitSize, this.currentFruitSize);
      fruit.setData("isBomb", false);
      this.fruitsGroup.push(fruit);
    }
  };

  public pausePhysics = (): void => { this.destroy(); };

  public resizeMetrics = (): void => {
    if (!this.scene?.scale) return;
    const { width: phaserW, height: phaserH } = this.scene.scale;
    const metrics = getCatchResizeMetrics(phaserW, phaserH, phaserH > phaserW);
    this.currentFruitSize = metrics.fruitSize;

    this.fruitsGroup.forEach((item) => {
      if (item?.active) {
        if (item.getData("isBomb") === true) {
          (item as Phaser.GameObjects.Text).setFontSize(Math.floor(this.currentFruitSize * 0.65));
        } else {
          (item as Phaser.GameObjects.Image).setDisplaySize(this.currentFruitSize, this.currentFruitSize);
        }
      }
    });
  };

  public destroy = (): void => {
    this.fruitsGroup.forEach((item) => item?.destroy());
    this.fruitsGroup = [];
  };
}
