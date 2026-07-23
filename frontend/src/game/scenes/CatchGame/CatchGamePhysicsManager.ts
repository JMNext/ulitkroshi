import { CatchGameScene } from './CatchGameScene';
import { useCatchGameStore } from './useCatchGameStore';
import { CatchGamePet } from './components/CatchGamePet';

export class CatchGamePhysicsManager {
  public fruitsGroup: Phaser.GameObjects.Image[] = [];
  private nextSpawnTime = 0;
  private fruitIds = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];

  constructor(private scene: CatchGameScene, public speed: number, public delay: number) {}

  private get fruitSize() { return this.scene.uiManager.metrics.fruitSize; }

  public initPhysics(): void { this.fruitsGroup = []; this.nextSpawnTime = this.scene.time.now + this.delay; }

  public updatePhysics(time: number, pet: CatchGamePet): void {
    if (useCatchGameStore.getState().isGameOver) return;

    if (time > this.nextSpawnTime) {
      this.spawnFruit();
      this.nextSpawnTime = time + this.delay;
    }

    const [pL, pR, pT, pB] = [pet.x - pet.width / 2, pet.x + pet.width / 2, pet.y - pet.height / 2, pet.y + pet.height / 2];
    const r = this.fruitSize / 2;
    const m = this.scene.uiManager.metrics;

    for (let i = this.fruitsGroup.length - 1; i >= 0; i--) {
      const f = this.fruitsGroup[i];
      if (!f || !f.active) { this.fruitsGroup.splice(i, 1); continue; }

      f.y += this.speed; f.angle += 2;

      if (f.x + r > pL && f.x - r < pR && f.y + r > pT && f.y - r < pB) {
        f.destroy(); this.fruitsGroup.splice(i, 1); this.scene.addScore(); continue;
      }

      if (f.y > m.screenHeight + 60) {
        f.destroy(); this.fruitsGroup.splice(i, 1); this.scene.loseHp();
        if (useCatchGameStore.getState().isGameOver) break;
      }
    }
  }

  private spawnFruit(): void {
    const m = this.scene.uiManager.metrics;
    const id = this.fruitIds[Math.floor(Math.random() * this.fruitIds.length)];
    const f = this.scene.add.image(60 + Math.random() * (m.screenWidth - 120), -60, `fruit_${id}`).setDisplaySize(this.fruitSize, this.fruitSize);
    this.fruitsGroup.push(f);
  }

  public pausePhysics(): void { this.destroy(); }
  public resizeMetrics(): void { this.fruitsGroup.forEach(f => f?.active && f.setDisplaySize(this.fruitSize, this.fruitSize)); }
  public destroy(): void { this.fruitsGroup.forEach(f => f?.destroy()); this.fruitsGroup = []; }
}
