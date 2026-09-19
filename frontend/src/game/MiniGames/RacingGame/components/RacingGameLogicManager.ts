import Phaser from "phaser";
import { useRacingGameStore } from "../store/useRacingGameStore";
import { RacingEntitiesManager } from "./RacingEntitiesManager";

export interface RacingEntity {
  x: number;
  y: number;
  type: "FRUIT" | "BOMB" | "OBSTACLE";
  sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Image | Phaser.GameObjects.Text;
}

interface CustomScene extends Phaser.Scene {
  difficulty: "easy" | "medium" | "hard";
  addScore: () => void;
  triggerCrash: () => void;
  gridRenderer: any; // ДОБАВЛЕНО ТУТ ДЛЯ ИСПРАВЛЕНИЯ ОШИБКИ ТИПОВ
  overlayManager: { render: () => void };
}

export class RacingGameLogicManager {
  public playerX = 0;
  public playerY = 180;

  public bot1X = -120;
  public bot2X = 120;
  public readonly botY = 60;

  private bot1ScoreTimer = 0;
  private bot2ScoreTimer = 0;

  public readonly gridDim = 12 * 52;
  public gameState: "COUNTDOWN" | "RACING" | "FINISHING" | "ENDED" = "COUNTDOWN";
  public countdownText!: Phaser.GameObjects.Text;
  public countdownValue = 3;

  private spawnTimer?: Phaser.Time.TimerEvent;
  private roadSpeed = 380;
  private playerSpeed = 320;
  public renderer!: any;
  public entitiesManager!: RacingEntitiesManager;

  constructor(private scene: Phaser.Scene) {
    this.entitiesManager = new RacingEntitiesManager(this.scene, this);
  }

  public initGame(): void {
    this.destroy();
    this.gameState = "COUNTDOWN";
    this.countdownValue = 3;
    this.playerX = 0;
    this.playerY = 180;
    this.bot1ScoreTimer = 0;
    this.bot2ScoreTimer = 0;

    const sceneCtx = this.scene as unknown as CustomScene;
    this.renderer = sceneCtx.gridRenderer;

    this.renderer.setupRenderer();
    this.entitiesManager.init(this.renderer.mainGridContainer);

    this.countdownText = this.scene.add.text(0, -40, "3", {
      fontSize: "76px",
      fontFamily: "Arial Black",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8
    }).setOrigin(0.5);
    this.renderer.mainGridContainer.add(this.countdownText);

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
          this.countdownText.setText("ПОЕХАЛИ!");
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
    const spawnDelay = sceneCtx.difficulty === "hard" ? 700 : sceneCtx.difficulty === "easy" ? 1500 : 1000;

    this.spawnTimer = this.scene.time.addEvent({
      delay: spawnDelay,
      callback: () => this.entitiesManager.spawnRandom(),
      loop: true
    });
  }

  public handleKeyboardInput(cursors: Phaser.Types.Input.Keyboard.CursorKeys, deltaSec: number): void {
    if (this.gameState !== "RACING" || useRacingGameStore.getState().isGameOver) return;

    const step = this.playerSpeed * deltaSec;

    if (cursors.left.isDown) this.playerX -= step;
    if (cursors.right.isDown) this.playerX += step;
    if (cursors.up.isDown) this.playerY -= step;
    if (cursors.down.isDown) this.playerY += step;

    if (this.playerX < -195) this.playerX = -195;
    if (this.playerX > 195) this.playerX = 195;
    if (this.playerY < -230) this.playerY = -230;
    if (this.playerY > 230) this.playerY = 230;

    this.renderer.drawCar();
  }

  public handleTouchInput(pointer: Phaser.Input.Pointer): void {
    if (this.gameState !== "RACING" || !pointer.isDown || useRacingGameStore.getState().isGameOver) return;

    const localX = (pointer.x - this.scene.scale.width / 2) / this.renderer.mainGridContainer.scaleX;
    const localY = (pointer.y - (this.scene.scale.height / 2 - 20)) / this.renderer.mainGridContainer.scaleY;

    this.playerX += (localX - this.playerX) * 0.18;
    this.playerY += (localY - this.playerY) * 0.18;

    if (this.playerX < -195) this.playerX = -195;
    if (this.playerX > 195) this.playerX = 195;
    if (this.playerY < -230) this.playerY = -230;
    if (this.playerY > 230) this.playerY = 230;

    this.renderer.drawCar();
  }

  public handleUpdate(time: number, delta: number): void {
    const deltaSec = delta / 1000;
    const store = useRacingGameStore.getState();
    const sceneCtx = this.scene as unknown as CustomScene;

    if (this.gameState === "ENDED") return;

    if (this.gameState === "RACING") {
      this.bot1X = -120 + Math.sin(time / 200) * 20;
      this.bot2X = 120 + Math.cos(time / 250) * 20;

      const diff = sceneCtx.difficulty || "medium";
      const botPointDelay = diff === "hard" ? 1700 : diff === "easy" ? 3800 : 2500;

      if (time > this.bot1ScoreTimer) {
        this.bot1ScoreTimer = time + botPointDelay + Phaser.Math.Between(-200, 200);
        store.addBotScore(1, () => sceneCtx.overlayManager.render());
      }
      if (time > this.bot2ScoreTimer) {
        this.bot2ScoreTimer = time + botPointDelay + Phaser.Math.Between(-100, 300);
        store.addBotScore(2, () => sceneCtx.overlayManager.render());
      }
    }

    if (this.gameState === "RACING" || this.gameState === "FINISHING") {
      this.renderer.updateRoadAnims(this.roadSpeed * deltaSec);

      if (store.isGameOver && this.gameState === "RACING") {
        this.gameState = "FINISHING";
        this.clearTimers();

        this.scene.time.delayedCall(2000, () => {
          this.renderer.spawnFinishLine();
        });
      }

      const list = this.entitiesManager.entities;

      for (let i = list.length - 1; i >= 0; i--) {
        const ent = list[i];
        ent.y += this.roadSpeed * deltaSec;
        ent.sprite.y = ent.y;

        const distY = Math.abs(ent.y - this.playerY);
        const distX = Math.abs(ent.x - this.playerX);

        if (distX < 45 && distY < 45) {
          ent.sprite.destroy();
          list.splice(i, 1);

          if (ent.type === "FRUIT") {
            sceneCtx.addScore();
          } else {
            sceneCtx.triggerCrash();
          }
          continue;
        }

        if (ent.y > 300) {
          ent.sprite.destroy();
          list.splice(i, 1);
        }
      }
    }
  }

  private clearTimers(): void {
    if (this.spawnTimer) this.spawnTimer.remove();
  }

  public destroy(): void {
    this.clearTimers();
    this.entitiesManager?.clear();
  }
}
