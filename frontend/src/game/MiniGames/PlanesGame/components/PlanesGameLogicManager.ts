import Phaser from "phaser";
import { usePlanesGameStore } from "../store/planesGame.store";

export interface PlaneItem {
  x: number;
  y: number;
  type: "ENEMY_PLANE" | "BOMB" | "PLAYER_BULLET";
  hp?: number;
  hpBar?: Phaser.GameObjects.Graphics;
  sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Text | Phaser.GameObjects.Image;
  toRemove?: boolean;
}

interface CustomScene extends Phaser.Scene {
  difficulty: "easy" | "medium" | "hard";
  addScore: () => void;
  triggerCrash: () => void;
  overlayManager: { render: () => void };
}

export class PlanesGameLogicManager {
  public playerX = -140;
  public playerY = 0;
  public gameObjects: PlaneItem[] = [];

  public gameState: "COUNTDOWN" | "RACING" | "ENDED" = "COUNTDOWN";
  public countdownText!: Phaser.GameObjects.Text;
  public countdownValue = 3;

  private spawnTimer?: Phaser.Time.TimerEvent;
  private skySpeed = 380;
  private enemySpeed = 150;
  private lastShotTime = 0;
  private autoShotDelay = 350;
  public gridRenderer!: any;

  constructor(private scene: Phaser.Scene) {
    this.gameObjects = [];
  }

  public initGame(): void {
    this.destroy();
    this.gameState = "COUNTDOWN";
    this.countdownValue = 3;
    this.playerX = -140;
    this.playerY = 0;
    this.gameObjects = [];
    this.lastShotTime = 0;

    const sceneCtx = this.scene as any;
    this.gridRenderer = sceneCtx.gridRenderer;
    this.gridRenderer.setupRenderer();

    this.countdownText = this.scene.add.text(0, -40, "3", {
      fontSize: "76px",
      fontFamily: "Arial Black",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8
    }).setOrigin(0.5);
    this.gridRenderer.mainGridContainer.add(this.countdownText);

    this.startCountdown();
  }

  private startCountdown(): void {
    this.scene.time.addEvent({
      delay: 1000,
      repeat: 3,
      callback: () => {
        this.countdownValue--;
        if (this.countdownValue > 0) {
          this.countdownText.setText(this.countdownValue.toString());
        } else if (this.countdownValue === 0) {
          this.countdownText.setText("В БОЙ!");
          this.gameState = "RACING";
          this.startSpawning();
        } else {
          if (this.countdownText) this.countdownText.destroy();
        }
      }
    });
  }

  private startSpawning(): void {
    const sceneCtx = this.scene as unknown as CustomScene;
    const delay = sceneCtx.difficulty === "hard" ? 700 : sceneCtx.difficulty === "easy" ? 1500 : 1000;

    this.spawnTimer = this.scene.time.addEvent({
      delay: delay,
      callback: this.spawnWave,
      callbackScope: this,
      loop: true
    });
  }

  public movePlayer(cursors: Phaser.Types.Input.Keyboard.CursorKeys, deltaSec: number): void {
    if (this.gameState !== "RACING" || usePlanesGameStore.getState().isGameOver) return;

    const step = 340 * deltaSec;
    if (cursors.left.isDown) this.playerX -= step;
    if (cursors.right.isDown) this.playerX += step;
    if (cursors.up.isDown) this.playerY -= step;
    if (cursors.down.isDown) this.playerY += step;

    if (this.playerX < -180) this.playerX = -180;
    if (this.playerX > 190) this.playerX = 190;
    if (this.playerY < -245) this.playerY = -245;
    if (this.playerY > 245) this.playerY = 245;
  }

  public handleTouch(pointer: Phaser.Input.Pointer): void {
    if (this.gameState !== "RACING" || !pointer.isDown || usePlanesGameStore.getState().isGameOver) return;

    const localX = (pointer.x - this.scene.scale.width / 2) / this.gridRenderer.mainGridContainer.scaleX;
    const localY = (pointer.y - (this.scene.scale.height / 2 - 20)) / this.gridRenderer.mainGridContainer.scaleY;

    this.playerX += (localX - this.playerX) * 0.16;
    this.playerY += (localY - this.playerY) * 0.16;

    if (this.playerX < -180) this.playerX = -180;
    if (this.playerX > 190) this.playerX = 190;
    if (this.playerY < -245) this.playerY = -245;
    if (this.playerY > 245) this.playerY = 245;
  }

  private tryAutoFire(time: number): void {
    if (time < this.lastShotTime + this.autoShotDelay || usePlanesGameStore.getState().isGameOver) return;
    this.lastShotTime = time;

    const apple = this.scene.add.image(this.playerX + 25, this.playerY, "fruit_01").setDisplaySize(32, 32);
    this.gridRenderer.mainGridContainer.add(apple);
    this.gameObjects.push({ x: this.playerX + 25, y: this.playerY, type: "PLAYER_BULLET", sprite: apple });
  }

  public handleUpdate(time: number, delta: number): void {
    const deltaSec = delta / 1000;
    const store = usePlanesGameStore.getState();
    const sceneCtx = this.scene as unknown as CustomScene;

    if (this.gameState === "ENDED") return;

    if (store.isGameOver) {
      this.gameState = "ENDED";
      this.destroy(); // Стираем вертолеты и пули
      this.scene.scene.pause(); // Замораживаем физику Phaser
      return;
    }

    if (this.gameState === "RACING") {
      this.gridRenderer.updateSkyAnims(this.skySpeed * deltaSec, time);
      this.tryAutoFire(time);

      const diff = sceneCtx.difficulty || "medium";
      const bombSpeedMultiplier = diff === "hard" ? 1.5 : diff === "easy" ? 0.8 : 1.1;

      for (let i = 0; i < this.gameObjects.length; i++) {
        const obj = this.gameObjects[i];
        if (!obj) continue;

        if (obj.type === "ENEMY_PLANE") {
          obj.x -= this.enemySpeed * deltaSec;

          const shootChance = diff === "hard" ? 0.035 : diff === "easy" ? 0.012 : 0.022;
          if (obj.x > this.playerX && Math.random() < shootChance) {
            this.fireEnemyBomb(obj.x - 30, obj.y);
          }

          if (obj.hpBar && obj.hp !== undefined) {
            obj.hpBar.clear();
            obj.hpBar.fillStyle(0xef4444, 1);
            obj.hpBar.fillRect(obj.x - 20, obj.y - 30, 40, 4);
            obj.hpBar.fillStyle(0x22c55e, 1);
            obj.hpBar.fillRect(obj.x - 20, obj.y - 30, (obj.hp / 3) * 40, 4);
          }
        } else if (obj.type === "PLAYER_BULLET") {
          obj.x += this.skySpeed * 1.6 * deltaSec;
        } else if (obj.type === "BOMB") {
          obj.x -= this.skySpeed * bombSpeedMultiplier * deltaSec;
        }

        if (obj.sprite) obj.sprite.setPosition(obj.x, obj.y);

        if (obj.x < -185 || obj.x > 250 || obj.y > 290 || obj.y < -290) {
          obj.toRemove = true;
        }
      }

      for (let i = 0; i < this.gameObjects.length; i++) {
        const obj = this.gameObjects[i];
        if (!obj || obj.toRemove) continue;

        if (obj.type === "PLAYER_BULLET") {
          for (let j = 0; j < this.gameObjects.length; j++) {
            const enemy = this.gameObjects[j];
            if (enemy && enemy.type === "ENEMY_PLANE" && !enemy.toRemove) {
              if (Math.abs(obj.x - enemy.x) < 40 && Math.abs(obj.y - enemy.y) < 40) {
                obj.toRemove = true;

                if (enemy.hp !== undefined) {
                  enemy.hp -= 1;
                  if (enemy.hp <= 0) {
                    enemy.toRemove = true;
                    enemy.hpBar?.destroy();
                    sceneCtx.addScore();
                  }
                }
                break;
              }
            }
          }
        }

        if (obj.type !== "PLAYER_BULLET") {
          const distX = Math.abs(obj.x - this.playerX);
          const distY = Math.abs(obj.y - this.playerY);

          if (distX < 42 && distY < 42) {
            obj.toRemove = true;
            if (obj.type === "ENEMY_PLANE" && obj.hpBar) obj.hpBar.destroy();
            sceneCtx.triggerCrash();
          }
        }
      }

      for (let i = this.gameObjects.length - 1; i >= 0; i--) {
        if (this.gameObjects[i].toRemove) {
          this.gameObjects[i].sprite?.destroy();
          this.gameObjects[i].hpBar?.destroy();
          this.gameObjects.splice(i, 1);
        }
      }
    }
  }

  private spawnWave(): void {
    if (this.gameState !== "RACING" || usePlanesGameStore.getState().isGameOver) return;

    const startX = 185;
    const startY = Phaser.Math.Between(-210, 210);

    const enemy = this.gridRenderer.createEnemyPlaneSprite(startX, startY);
    const hpBar = this.scene.add.graphics();
    this.gridRenderer.mainGridContainer.add(hpBar);

    this.gameObjects.push({ x: startX, y: startY, type: "ENEMY_PLANE", hp: 3, hpBar, sprite: enemy });
  }

  private fireEnemyBomb(bx: number, by: number): void {
    if (usePlanesGameStore.getState().isGameOver) return;
    const sprite = this.scene.add.text(bx, by, "💣", { fontSize: "28px" }).setOrigin(0.5);
    this.gridRenderer.mainGridContainer.add(sprite);
    this.gameObjects.push({ x: bx, y: by, type: "BOMB", sprite });
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
