import Phaser from "phaser";
import { CatchGameScene } from "../CatchGameScene";
import { CatchGamePet } from "./CatchGamePet";
import { useCatchGameStore } from "../store/useCatchGameStore";
import { getSharedGameResizeMetrics } from "@/game/MiniGamesShared/miniGames.constants";

export class CatchGameLogicManager {
  public fruitsGroup: (Phaser.GameObjects.Image | Phaser.GameObjects.Text)[] = [];
  private nextSpawnTime = 0;
  private currentFruitSize = 64;

  constructor(
    private scene: CatchGameScene,
    public speed: number,
    public delay: number
  ) {}

  public initGame = (): void => {
    this.fruitsGroup = [];
    this.nextSpawnTime = this.scene.time.now + this.delay;
    this.resize();
  };

  public resetSpawnTime(currentTime: number): void {
    this.nextSpawnTime = currentTime + this.delay;
  }

  public handleUpdate = (time: number, delta: number, pet: CatchGamePet): void => {
    if (time > this.nextSpawnTime) {
      this.spawnItem();
      this.nextSpawnTime = time + this.delay;
    }

    const pL = pet.x - pet.width * 0.25, pR = pet.x + pet.width * 0.25;
    const pT = pet.y - pet.height * 0.75, pB = pet.y - pet.height * 0.1;
    const r = this.currentFruitSize / 2, dt = delta / 16.666;

    for (let i = this.fruitsGroup.length - 1; i >= 0; i--) {
      const item = this.fruitsGroup[i];
      if (!item?.active) {
        this.fruitsGroup.splice(i, 1);
        continue;
      }

      item.y += this.speed * dt;
      if ("angle" in item) item.angle += 2 * dt;
      const isBomb = item.getData("isBomb") === true;

      if (item.x + r > pL && item.x - r < pR && item.y + r > pT && item.y - r < pB) {
        item.destroy();
        this.fruitsGroup.splice(i, 1);
        isBomb ? this.scene.hitBomb() : this.scene.addScore();
        continue;
      }

      if (item.y > this.scene.scale.height + 70) {
        item.destroy();
        this.fruitsGroup.splice(i, 1);
        if (!isBomb) this.scene.loseHp();
        if (useCatchGameStore.getState().isGameOver) break;
      }
    }
  };

  private spawnItem = (): void => {
    const spawnX = 60 + Math.random() * (this.scene.scale.width - 120), isBomb = Math.random() < 0.25;
    if (isBomb) {
      const bomb = this.scene.add.text(spawnX, -70, "💣", { fontSize: `${Math.floor(this.currentFruitSize * 0.65)}px`, fontFamily: "Arial" }).setOrigin(0.5);
      bomb.setData("isBomb", true);
      this.fruitsGroup.push(bomb);
    } else {
      const fruit = this.scene.add.image(spawnX, -70, `fruit_${String(Phaser.Math.Between(1, 16)).padStart(2, "0")}`).setDisplaySize(this.currentFruitSize, this.currentFruitSize);
      fruit.setData("isBomb", false);
      this.fruitsGroup.push(fruit);
    }
  };

  public pauseGame = (): void => this.destroy();

  public resize = (): void => {
    if (!this.scene?.scale) return;
    const { width: w, height: h } = this.scene.scale;
    const m = getSharedGameResizeMetrics(w, h, h > w, "catch");
    this.currentFruitSize = m.fruitSize || 58;

    this.fruitsGroup.forEach((item) => {
      if (item?.active) {
        item.getData("isBomb") === true
          ? (item as Phaser.GameObjects.Text).setFontSize(Math.floor(this.currentFruitSize * 0.65))
          : (item as Phaser.GameObjects.Image).setDisplaySize(this.currentFruitSize, this.currentFruitSize);
      }
    });
  };

  public destroy = (): void => {
    this.fruitsGroup.forEach((item) => item?.destroy());
    this.fruitsGroup = [];
  };
}
