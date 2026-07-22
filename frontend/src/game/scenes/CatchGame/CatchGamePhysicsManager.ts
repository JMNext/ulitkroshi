import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { useCatchGameStore } from './useCatchGameStore';
import { CatchGamePet } from './components/CatchGamePet';

export class CatchGamePhysicsManager {
  private scene: Scene;
  public fruitsGroup: Phaser.GameObjects.Image[] = [];
  private nextSpawnTime = 0;
  private fruitIds = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];

  public speed: number;
  public delay: number;
  private fruitSize = 80;

  constructor(scene: Scene, speed: number, delay: number) {
    this.scene = scene;
    this.speed = speed;
    this.delay = delay;
  }

  public initPhysics(isPortrait: boolean): void {
    this.fruitsGroup = [];
    this.nextSpawnTime = this.scene.time.now + this.delay;
    this.fruitSize = isPortrait ? 65 : 80;
  }

  public updatePhysics(time: number, pet: CatchGamePet): void {
    if (useCatchGameStore.getState().isGameOver) return;

    if (time > this.nextSpawnTime) {
      this.spawnFruit();
      this.nextSpawnTime = time + this.delay;
    }

    const petLeft = pet.x - pet.width / 2;
    const petRight = pet.x + pet.width / 2;
    const petTop = pet.y - pet.height / 2;
    const petBottom = pet.y + pet.height / 2;

    for (let i = this.fruitsGroup.length - 1; i >= 0; i--) {
      const fruit = this.fruitsGroup[i];
      if (!fruit || !fruit.active) {
        this.fruitsGroup.splice(i, 1);
        continue;
      }

      fruit.y += this.speed;
      fruit.angle += 2;

      const fX = fruit.x;
      const fY = fruit.y;
      const fW = this.fruitSize; 
      const fH = this.fruitSize;

      const isColliding = (
        fX + fW / 2 > petLeft &&
        fX - fW / 2 < petRight &&
        fY + fH / 2 > petTop &&
        fY - fH / 2 < petBottom
      );

      if (isColliding) {
        fruit.destroy();
        this.fruitsGroup.splice(i, 1);
        (this.scene as any).addScore();
        continue;
      }

      if (fruit.y > this.scene.scale.height + 60) {
        fruit.destroy();
        this.fruitsGroup.splice(i, 1);
        (this.scene as any).loseHp();
      }
    }
  }

  private spawnFruit(): void {
    const randomId = Phaser.Utils.Array.GetRandom(this.fruitIds);
    const padding = 60;
    const randomX = Phaser.Math.Between(padding, this.scene.scale.width - padding);

    const fruit = this.scene.add.image(randomX, -60, `fruit_${randomId}`);
    fruit.setDisplaySize(this.fruitSize, this.fruitSize);
    this.fruitsGroup.push(fruit);
  }

  public pausePhysics(): void {
    this.fruitsGroup.forEach(f => { if (f) f.destroy(); });
    this.fruitsGroup = [];
  }

  public resizeMetrics(isPortrait: boolean): void {
    this.fruitSize = isPortrait ? 65 : 80;
    this.fruitsGroup.forEach(f => {
      if (f && f.active) f.setDisplaySize(this.fruitSize, this.fruitSize);
    });
  }

  public destroy(): void {
    this.fruitsGroup.forEach(f => { if (f) f.destroy(); });
    this.fruitsGroup = [];
  }
}
