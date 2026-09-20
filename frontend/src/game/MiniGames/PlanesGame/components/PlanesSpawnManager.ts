import Phaser from "phaser";
import { usePlanesGameStore } from "../store/planesGame.store";
import { PlaneItem } from "./PlanesGameLogicManager";

export class PlanesSpawnManager {
  public static spawnWave(scene: Phaser.Scene, gameObjects: PlaneItem[], gridRenderer: any, killedCount: number): void {
    const store = usePlanesGameStore.getState();
    if (store.isGameOver || store.isFinishing) return;

    const gameW = gridRenderer ? gridRenderer.getGameWidth() : scene.scale.width;
    const startX = gameW / 2 + 40;
    const startY = Phaser.Math.Between(-scene.scale.height / 2 + 80, scene.scale.height / 2 - 80);

    const isBossTime = killedCount > 0 && killedCount % 5 === 0;
    const hasActiveBoss = gameObjects.some(obj => obj.type === "ENEMY_PLANE" && obj.isBoss);
    const spawnBoss = isBossTime && !hasActiveBoss;

    const diff = (scene as any).difficulty || "medium";
    const isPerfectRun = store.hp === 100 && store.score >= 15 && (diff === "medium" || diff === "hard");
    const hasUfo = gameObjects.some(obj => obj.isUfo);

    const spawnUfo = isPerfectRun && !isBossTime && !hasUfo && Phaser.Math.Between(1, 4) === 2;

    const enemy = gridRenderer.createEnemyPlaneSprite(startX, startY);
    const hpBar = scene.add.graphics();
    gridRenderer.mainGridContainer.add(hpBar);

    gameObjects.push({
      x: startX,
      y: startY,
      type: "ENEMY_PLANE",
      hp: spawnBoss ? 5 : spawnUfo ? 10 : 3,
      hpBar,
      sprite: enemy,
      isBoss: spawnBoss,
      isUfo: spawnUfo
    });
  }

  public static playerBurstFire(scene: Phaser.Scene, gameObjects: PlaneItem[], gridRenderer: any, startX: number, startY: number): void {
    for (let i = 0; i < 3; i++) {
      scene.time.delayedCall(i * 80, () => {
        if (usePlanesGameStore.getState().isGameOver || usePlanesGameStore.getState().isFinishing) return;
        const apple = scene.add.image(startX, startY, "fruit_01").setDisplaySize(32, 32);
        gridRenderer.mainGridContainer.add(apple);
        gameObjects.push({ x: startX, y: startY, type: "PLAYER_BULLET", sprite: apple });
      });
    }
  }

  public static enemyBurstFire(scene: Phaser.Scene, gameObjects: PlaneItem[], gridRenderer: any, startX: number, startY: number): void {
    for (let i = 0; i < 5; i++) {
      scene.time.delayedCall(i * 100, () => {
        if (usePlanesGameStore.getState().isGameOver || usePlanesGameStore.getState().isFinishing) return;
        const sprite = scene.add.text(startX, startY, "💣", { fontSize: "28px" }).setOrigin(0.5);
        gridRenderer.mainGridContainer.add(sprite);
        gameObjects.push({ x: startX, y: startY, type: "BOMB", sprite });
      });
    }
  }
}
