import Phaser from "phaser";
import { InputDirections } from "@/game/MiniGamesShared/GameInputController";
import { useRacingGameStore } from "../store/useRacingGameStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { RacingEntitiesManager } from "./RacingEntitiesManager";

export interface RacingEntity {
  x: number;
  y: number;
  type: "FRUIT" | "BOMB" | "OBSTACLE";
  sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Image | Phaser.GameObjects.Text;
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
    this.playerX = 0;
    this.playerY = this.scene.scale.height / 2 - 88;
    this.bot1ScoreTimer = this.bot2ScoreTimer = 0;
    this.renderer = (this.scene as any).gridRenderer;
    this.renderer.setupRenderer();
    this.entitiesManager.init(this.renderer.mainGridContainer);
  }

  public startSpawning(): void {
    const diff = (this.scene as any).difficulty;
    this.spawnTimer = this.scene.time.addEvent({
      delay: diff === "hard" ? 700 : diff === "easy" ? 1500 : 1000,
      callback: () => this.entitiesManager.spawnRandom(),
      loop: true
    });
  }

  private clampPos(nX: number, nY: number) {
    const limX = (this.renderer ? this.renderer.getRoadWidth() : 480) / 2 - 50,
      hH = this.scene.scale.height / 2;
    this.playerX = Phaser.Math.Clamp(nX, -limX, limX);
    this.playerY = Phaser.Math.Clamp(nY, -hH + 88, hH - 88);
    this.renderer.drawCar();
  }

  public handleKeyboardInput(keys: InputDirections, deltaSec: number): void {
    if (useRacingGameStore.getState().isGameOver) return;
    const step = this.playerSpeed * deltaSec;
    this.clampPos(this.playerX + (keys.right ? step : keys.left ? -step : 0), this.playerY + (keys.down ? step : keys.up ? -step : 0));
  }

  public handleTouchInput(pointer: Phaser.Input.Pointer): void {
    if (useRacingGameStore.getState().isGameOver || !pointer.isDown) return;
    const ctx = this.scene as any;
    const local = ctx.inputController.getLocalPointerCoords(pointer, this.renderer.mainGridContainer);
    this.clampPos(this.playerX + (local.x - this.playerX) * 0.18, this.playerY + (local.y - this.playerY) * 0.18);
  }

  public handleUpdate(time: number, delta: number): void {
    const dSec = delta / 1000,
      store = useRacingGameStore.getState(),
      ctx = this.scene as any,
      hH = this.scene.scale.height / 2;

    if (ctx.gameState === "ENDED") return;

    if (ctx.gameState === "PLAYING") {
      this.bot1X = -120 + Math.sin(time / 200) * 20;
      this.bot2X = 120 + Math.cos(time / 250) * 20;
      const diff = ctx.difficulty || "medium",
        delay = diff === "hard" ? 1700 : diff === "easy" ? 3800 : 2500;

      if (time > this.bot1ScoreTimer) {
        this.bot1ScoreTimer = time + delay + Phaser.Math.Between(-200, 200);
        store.addBotScore(1, () => ctx.overlayManager.render());
      }
      if (time > this.bot2ScoreTimer) {
        this.bot2ScoreTimer = time + delay + Phaser.Math.Between(-100, 300);
        store.addBotScore(2, () => ctx.overlayManager.render());
      }
    }

    if (ctx.gameState === "PLAYING" || store.isFinishing) {
      this.renderer.updateRoadAnims(this.roadSpeed * dSec);
      if (store.score >= 20 && ctx.gameState === "PLAYING") {
        this.clearTimers();
        this.scene.time.delayedCall(2000, () => this.renderer.spawnFinishLine());
      }

      const list = this.entitiesManager.entities;
      for (let i = list.length - 1; i >= 0; i--) {
        const ent = list[i];
        ent.y += this.roadSpeed * dSec;
        ent.sprite.y = ent.y;

        if (Math.abs(ent.x - this.playerX) < 45 && Math.abs(ent.y - this.playerY) < 45) {
          ent.sprite.destroy();
          list.splice(i, 1);
          ent.type === "FRUIT" ? ctx.addScore() : ctx.triggerCrash();
          continue;
        }
        if (ent.y > hH + 60) {
          ent.sprite.destroy();
          list.splice(i, 1);
        }
      }
    }

    if (this.renderer?.finishLineSprite && this.renderer.finishY >= this.playerY + 160 && store.isFinishing) {
      ctx.gameState = "ENDED";
      (useMainGameStore.getState() as any).setGameOver(store.score, ctx.difficulty, true);
      useRacingGameStore.setState({ isGameOver: true, isWin: true, isFinishing: false });
      ctx.overlayManager.render();
    }
  }

  private clearTimers = () => this.spawnTimer?.remove();
  public destroy = () => {
    this.clearTimers();
    this.entitiesManager?.clear();
  };
}
