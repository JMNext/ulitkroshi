import { PlaneItem } from "./PlanesGameLogicManager";

export class PlanesCollisionManager {
  public static checkCollisions(gameObjects: PlaneItem[], playerX: number, playerY: number, onScore: (isBoss: boolean) => void, onCrash: () => void): void {
    gameObjects.forEach((obj) => {
      if (obj.toRemove || obj.type !== "PLAYER_BULLET") return;
      for (let j = 0; j < gameObjects.length; j++) {
        const enemy = gameObjects[j];
        if (enemy && enemy.type === "ENEMY_PLANE" && !enemy.toRemove) {
          const hitRadius = enemy.isBoss ? 60 : 40;
          if (Math.abs(obj.x - enemy.x) < hitRadius && Math.abs(obj.y - enemy.y) < hitRadius) {
            obj.toRemove = true;
            if (enemy.hp !== undefined) {
              enemy.hp -= 1;
              if (enemy.hp <= 0) {
                enemy.toRemove = true;
                enemy.hpBar?.destroy();
                onScore(!!enemy.isBoss);
              }
            }
            break;
          }
        }
      }
    });

    gameObjects.forEach((obj) => {
      if (obj.toRemove || obj.type === "PLAYER_BULLET") return;
      const range = obj.isBoss ? 60 : 42;
      if (Math.abs(obj.x - playerX) < range && Math.abs(obj.y - playerY) < range) {
        obj.toRemove = true;
        if (obj.type === "ENEMY_PLANE" && obj.hpBar) obj.hpBar.destroy();
        onCrash();
      }
    });
  }
}
