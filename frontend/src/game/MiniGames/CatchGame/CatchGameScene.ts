import { CatchGameOverlay } from "@/game/MiniGames/CatchGame/components/CatchGameOverlay";
import { CatchGamePet } from "@/game/MiniGames/CatchGame/components/CatchGamePet";
import { CatchGamePhysicsManager } from "@/game/MiniGames/CatchGame/components/CatchGamePhysicsManager";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { Scene } from "phaser";
import { CATCH_ASSETS, DIFFICULTY_CONFIGS } from "./constants/catchGame.constants";
import { useCatchGameStore } from "./store/useCatchGameStore";

export class CatchGameScene extends Scene {
  public difficulty = "medium";
  public score = 0;
  public hp = 100;
  public physicsManager!: CatchGamePhysicsManager;
  public petEntity!: CatchGamePet;
  public overlayManager!: any;
  public bgImage: Phaser.GameObjects.Image | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private resizeTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super("CatchGameScene");
  }

  public init(data: { difficulty?: "easy" | "medium" | "hard" }): void {
    this.difficulty = data.difficulty || "medium";
    this.score = 0;
    this.hp = 100;

    const cfg = DIFFICULTY_CONFIGS[this.difficulty as keyof typeof DIFFICULTY_CONFIGS] || DIFFICULTY_CONFIGS.medium;
    this.physicsManager = new CatchGamePhysicsManager(this, cfg.s, cfg.d);
    this.petEntity = new CatchGamePet(this);
    this.overlayManager = new CatchGameOverlay(this);
    useCatchGameStore.getState().initGame();
  }

  public preload(): void {
    this.load.image("catch_bg_horiz", CATCH_ASSETS.bgHoriz);
    this.load.image("catch_bg_vert", CATCH_ASSETS.bgVert);
    Object.entries(CATCH_ASSETS.fruits).forEach(([k, v]) => this.load.image(k, v));
  }

  public create(): void {
    window.dispatchEvent(new CustomEvent("minigame_started"));
    document.getElementById("game-container")?.setAttribute("data-scene", this.scene.key);

    this.bgImage = this.add
      .image(0, 0, this.scale.height > this.scale.width ? "catch_bg_vert" : "catch_bg_horiz")
      .setOrigin(0)
      .setDepth(0);
    this.bgImage.setDisplaySize(this.scale.width, this.scale.height);

    this.overlayManager.create();
    this.petEntity.create();
    this.physicsManager.initPhysics();
    this.overlayManager.render();

    this.scale.on("resize", this.handleResize, this);
    this.unsubscribeStore = useCatchGameStore.subscribe(
      (s) => s.isGameOver,
      (isOver) => {
        if (isOver) {
          this.physicsManager.pausePhysics();
          this.petEntity.hide();
          this.overlayManager.render();
        }
      }
    );
    this.events.once("shutdown", () => this.cleanup());
  }

  public update(time: number, delta: number): void {
    if (useCatchGameStore.getState().isGameOver) return;
    this.petEntity.handleKeyboardInput();
    this.physicsManager.updatePhysics(time, delta, this.petEntity);
  }

  private handleResize = (): void => {
    if (!this.sys?.isActive()) return;
    this.resizeTimer?.destroy();

    this.resizeTimer = this.time.delayedCall(100, () => {
      if (!this.sys?.isActive()) return;
      const isPortrait = this.scale.height > this.scale.width;
      this.bgImage?.setTexture(isPortrait ? "catch_bg_vert" : "catch_bg_horiz").setDisplaySize(this.scale.width, this.scale.height);
      this.petEntity.resize();
      this.physicsManager.resizeMetrics();
      this.overlayManager.render();
    });
  };

  public addScore(): void {
    useCatchGameStore.getState().addScore(() => this.overlayManager.render());
  }
  public loseHp(): void {
    useCatchGameStore.getState().applyMissPenalty(() => this.overlayManager.render());
  }
  public hitBomb(): void {
    useCatchGameStore.getState().applyBombPenalty(() => this.overlayManager.render());
  }

  public exitGame = (): void => {
    if (!useCatchGameStore.getState().isGameOver && useCatchGameStore.getState().score < 20) {
      usePetStore.getState().handleGameLoss();
    }
    window.dispatchEvent(new CustomEvent("minigame_stopped"));
    this.scene.stop(this.scene.key);
    if (this.scene.manager.isSleeping("MainScene")) this.scene.wake("MainScene");
    else this.scene.start("MainScene");
  };

  private cleanup(): void {
    this.scale.off("resize", this.handleResize, this);
    this.resizeTimer?.destroy();
    this.unsubscribeStore?.();
    this.physicsManager?.destroy();
    this.petEntity?.destroy();
    this.overlayManager?.destroy();
    useCatchGameStore.getState().resetStore();
  }
}
