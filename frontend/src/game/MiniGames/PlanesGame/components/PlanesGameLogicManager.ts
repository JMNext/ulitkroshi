import Phaser from "phaser";
import { usePlanesGameStore } from "../store/planesGame.store";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { PlanesCollisionManager } from "./PlanesCollisionManager";
import { PlanesSpawnManager } from "./PlanesSpawnManager";

export interface PlaneItem {
  x: number;
  y: number;
  type: "ENEMY_PLANE" | "BOMB" | "PLAYER_BULLET";
  hp?: number;
  hpBar?: Phaser.GameObjects.Graphics;
  sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Text | Phaser.GameObjects.Image;
  toRemove?: boolean;
  isBoss?: boolean;
  isUfo?: boolean;
}

export class PlanesGameLogicManager {
  public playerX = -140;
  public playerY = 0;
  public gameObjects: PlaneItem[] = [];
  public gameState: "COUNTDOWN" | "RACING" | "ENDED" = "COUNTDOWN";
  public countdownText!: Phaser.GameObjects.Text;
  public countdownValue = 3;
  public killedEnemiesCount = 0;

  private spawnTimer?: Phaser.Time.TimerEvent;
  private skySpeed = 380;
  private enemySpeed = 150;
  private lastShotTime = 0;
  private autoShotDelay = 700;
  public gridRenderer!: any;

  constructor(private scene: Phaser.Scene) {}

  public initGame(): void {
    this.destroy();
    this.gameState = "COUNTDOWN";
    this.countdownValue = 3;
    this.playerX = -140;
    this.playerY = 0;
    this.killedEnemiesCount = 0;

    const sceneCtx = this.scene as any;
    this.gridRenderer = sceneCtx.gridRenderer;
    this.gridRenderer.setupRenderer();

    this.countdownText = this.scene.add.text(0, -40, "3", {
      fontSize: "76px", fontFamily: "Arial Black", color: "#ffffff", stroke: "#000000", strokeThickness: 8
    }).setOrigin(0.5);
    this.gridRenderer.mainGridContainer.add(this.countdownText);
    this.startCountdown();
  }

  private startCountdown(): void {
    this.scene.time.addEvent({
      delay: 1000, repeat: 3,
      callback: () => {
        this.countdownValue--;
        if (this.countdownValue > 0) {
          this.countdownText.setText(this.countdownValue.toString());
        } else if (this.countdownValue === 0) {
          this.countdownText.setText("В БОЙ!");
          this.gameState = "RACING";
          this.startSpawning();
        } else if (this.countdownText) {
          this.countdownText.destroy();
        }
      }
    });
  }

  private startSpawning(): void {
    const delay = (this.scene as any).difficulty === "hard" ? 700 : (this.scene as any).difficulty === "easy" ? 1500 : 1000;
    this.spawnTimer = this.scene.time.addEvent({
      delay, callback: () => PlanesSpawnManager.spawnWave(this.scene, this.gameObjects, this.gridRenderer, this.killedEnemiesCount), loop: true
    });
  }

  public movePlayer(cursors: Phaser.Types.Input.Keyboard.CursorKeys, deltaSec: number): void {
    if (this.gameState !== "RACING" || usePlanesGameStore.getState().isGameOver) return;
    const step = 340 * deltaSec;
    if (cursors.left.isDown) this.playerX -= step;
    if (cursors.right.isDown) this.playerX += step;
    if (cursors.up.isDown) this.playerY -= step;
    if (cursors.down.isDown) this.playerY += step;
    this.clampPlayerPosition();
  }

  public handleTouch(pointer: Phaser.Input.Pointer): void {
    if (this.gameState !== "RACING" || !pointer.isDown || usePlanesGameStore.getState().isGameOver) return;
    const localX = (pointer.x - this.scene.scale.width / 2) / this.gridRenderer.mainGridContainer.scaleX;
    const localY = (pointer.y - this.scene.scale.height / 2) / this.gridRenderer.mainGridContainer.scaleY;
    this.playerX += (localX - this.playerX) * 0.16;
    this.playerY += (localY - this.playerY) * 0.16;
    this.clampPlayerPosition();
  }

  private clampPlayerPosition(): void {
    const gameW = this.gridRenderer ? this.gridRenderer.getGameWidth() : this.scene.scale.width;
    const limitX = gameW / 2 - 40;
    const limitY = this.scene.scale.height / 2 - 40;

    if (this.playerX < -limitX) this.playerX = -limitX;
    if (this.playerX > limitX) this.playerX = limitX;
    if (this.playerY < -limitY) this.playerY = -limitY;
    if (this.playerY > limitY) this.playerY = limitY;
  }

  private tryAutoFire(time: number): void {
    if (this.gameState !== "RACING" || time < this.lastShotTime + this.autoShotDelay || usePlanesGameStore.getState().isGameOver || usePlanesGameStore.getState().isFinishing) return;
    this.lastShotTime = time;
    PlanesSpawnManager.playerBurstFire(this.scene, this.gameObjects, this.gridRenderer, this.playerX + 25, this.playerY);
  }

  public handleUpdate(time: number, delta: number): void {
    const deltaSec = delta / 1000;
    const store = usePlanesGameStore.getState();
    const sceneCtx = this.scene as any;

    if (this.gameState === "ENDED") return;

    if (store.isFinishing && this.gameState === "RACING") {
      this.gameState = "ENDED";
      usePlanesGameStore.setState({ isGameOver: true, isWin: true, isFinishing: false });
      useMainGameStore.getState().setGameOver(store.score, undefined, true);
      this.destroy();
      this.scene.scene.pause();
      return;
    }

    if (store.isGameOver) {
      this.gameState = "ENDED";
      this.destroy();
      this.scene.scene.pause();
      return;
    }

    this.gridRenderer.updateSkyAnims(this.skySpeed * deltaSec, time);
    this.tryAutoFire(time);

    const bombSpeedMultiplier = sceneCtx.difficulty === "hard" ? 1.5 : sceneCtx.difficulty === "easy" ? 0.8 : 1.1;
    const halfW = (this.gridRenderer ? this.gridRenderer.getGameWidth() : this.scene.scale.width) / 2;
    const halfH = this.scene.scale.height / 2;

    this.gameObjects.forEach((obj) => {
      if (obj.type === "ENEMY_PLANE") {
        obj.x -= this.enemySpeed * deltaSec;

        // НЛО летает скрытно и не стреляет бомбами зря, стреляют только вертолёты
        const baseChance = obj.isUfo ? 0 : obj.isBoss ? 0.015 : 0.004;
        const shootChance = sceneCtx.difficulty === "hard" ? baseChance * 1.5 : sceneCtx.difficulty === "easy" ? baseChance * 0.6 : baseChance;

        if (shootChance > 0 && obj.x > this.playerX && Math.random() < shootChance) {
          PlanesSpawnManager.enemyBurstFire(this.scene, this.gameObjects, this.gridRenderer, obj.x - 30, obj.y);
        }
        if (obj.hpBar && obj.hp !== undefined) {
          const maxHp = obj.isUfo ? 10 : obj.isBoss ? 5 : 3;
          const barW = obj.isUfo ? 64 : obj.isBoss ? 60 : 40;
          const barY = obj.isUfo ? 25 : obj.isBoss ? 45 : 30;

          obj.hpBar.clear().fillStyle(0xef4444, 1).fillRect(obj.x - barW / 2, obj.y - barY, barW, 4);
          obj.hpBar.fillStyle(0x22c55e, 1).fillRect(obj.x - barW / 2, obj.y - barY, (obj.hp / maxHp) * barW, 4);
        }
      } else if (obj.type === "PLAYER_BULLET") {
        obj.x += this.skySpeed * 1.6 * deltaSec;
      } else if (obj.type === "BOMB") {
        obj.x -= this.skySpeed * bombSpeedMultiplier * deltaSec;
      }

      if (obj.sprite) obj.sprite.setPosition(obj.x, obj.y);
      if (obj.x < -halfW - 60 || obj.x > halfW + 60 || obj.y > halfH + 60 || obj.y < -halfH - 60) obj.toRemove = true;
    });

    PlanesCollisionManager.checkCollisions(
      this.gameObjects,
      this.playerX,
      this.playerY,
      (isBoss) => {
        if (isBoss) this.killedEnemiesCount = 0;
        this.killedEnemiesCount++;
        sceneCtx.addScore();
      },
      () => sceneCtx.triggerCrash()
    );

    for (let i = this.gameObjects.length - 1; i >= 0; i--) {
      if (this.gameObjects[i].toRemove) {
        this.gameObjects[i].sprite?.destroy();
        this.gameObjects[i].hpBar?.destroy();
        this.gameObjects.splice(i, 1);
      }
    }
  }

  public destroy(): void {
    if (this.spawnTimer) this.spawnTimer.remove();
    this.gameObjects.forEach(e => {
      e.sprite?.destroy();
      e.hpBar?.destroy();
    });
    this.gameObjects = [];
  }
}
