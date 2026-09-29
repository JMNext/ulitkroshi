import { Scene } from "phaser";
import { BaseMiniGameOverlay } from "@/game/MiniGamesShared/BaseMiniGameOverlay";
import { GameInputController } from "@/game/MiniGamesShared/GameInputController";
import { runCountdown } from "@/game/MiniGamesShared/runCountdown";
import { CatchGameLogicManager } from "./components/CatchGameLogicManager";
import { CatchGamePet } from "./components/CatchGamePet";
import { useCatchGameStore } from "./store/useCatchGameStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { EventBus } from "@/eventbus/EventBus";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";

export class CatchGameScene extends Scene {
  public difficulty = "medium";
  public gameState: "COUNTDOWN" | "PLAYING" | "ENDED" = "COUNTDOWN";
  public overlayManager!: BaseMiniGameOverlay;
  public inputController!: GameInputController;
  public logicManager!: CatchGameLogicManager;
  public petEntity!: CatchGamePet;

  public bgImage: Phaser.GameObjects.Image | null = null;
  public countdownText!: Phaser.GameObjects.Text;
  private unsubscribeStore: (() => void) | null = null;

  constructor() {
    super("CatchGameScene");
  }

  public init(data: { difficulty?: "easy" | "medium" | "hard" }): void {
    this.difficulty = data?.difficulty || "medium";
    this.gameState = "COUNTDOWN";
    this.overlayManager = new BaseMiniGameOverlay(this, "catch");
    this.inputController = new GameInputController(this);
    this.petEntity = new CatchGamePet(this);

    const speeds = { easy: 5.0, medium: 7.0, hard: 9.5 };
    const delays = { easy: 1500, medium: 1050, hard: 750 };
    this.logicManager = new CatchGameLogicManager(
      this,
      speeds[this.difficulty as keyof typeof speeds],
      delays[this.difficulty as keyof typeof delays]
    );

    useCatchGameStore.getState().initGame();
  }

  // ИСПРАВЛЕНО: Метод preload теперь полностью пустой, фрукты мгновенно берутся из кэша
  public preload(): void {}

  public create(): void {
    window.dispatchEvent(new CustomEvent("minigame_started"));
    document.getElementById("game-container")?.setAttribute("data-scene", this.scene.key);

    const isPort = this.scale.height > this.scale.width;
    this.bgImage = this.add.image(0, 0, isPort ? "catch_bg_vert" : "catch_bg_horiz").setOrigin(0).setDepth(0).setDisplaySize(this.scale.width, this.scale.height);

    this.overlayManager.create();
    this.petEntity.create();
    this.logicManager.initGame();
    this.overlayManager.render();

    this.scale.on("resize", this.handleResize, this);
    this.unsubscribeStore = useCatchGameStore.subscribe(s => s.isGameOver, isOver => isOver && this.triggerGameOver());

    this.countdownText = runCountdown({
      scene: this, container: null, customLabel: "СОБИРАЙ!",
      onComplete: () => {
        this.gameState = "PLAYING";
        this.logicManager.resetSpawnTime(this.time.now);
      }
    });

    this.sys.events.once("shutdown", () => this.cleanup(), this);
    registerSceneEvent(this, "minigame_catch_start", d => this.scene.start("CatchGameScene", d));
  }

  public update(time: number, delta: number): void {
    if (this.gameState !== "PLAYING" || useCatchGameStore.getState().isGameOver) {
      this.petEntity.updateVideoOnly();
      return;
    }
    this.petEntity.handleKeyboardInput();
    this.logicManager.handleUpdate(time, delta, this.petEntity);
  }

  public addScore = () => useCatchGameStore.getState().addScore(() => this.overlayManager.render());
  public loseHp = () => { useCatchGameStore.getState().applyMissPenalty(() => this.overlayManager.render()); this.applyFlash(); };
  public hitBomb = () => { useCatchGameStore.getState().applyBombPenalty(() => this.overlayManager.render()); this.applyFlash(); };

  private applyFlash(): void {
    const t = this.petEntity?.petSprite;
    if (t) this.tweens.add({ targets: t, alpha: 0.2, duration: 100, yoyo: true, repeat: 4, onComplete: () => t.alpha = 1 });
  }

  private triggerGameOver(): void {
    this.gameState = "ENDED";
    this.logicManager.pauseGame();
    this.petEntity.hide();
    this.overlayManager.render();
  }

  private handleResize = (): void => {
    if (!this.sys?.isActive()) return;
    const isPort = this.scale.height > this.scale.width;
    this.bgImage?.setTexture(isPort ? "catch_bg_vert" : "catch_bg_horiz").setDisplaySize(this.scale.width, this.scale.height);
    this.countdownText?.setPosition(this.scale.width / 2, this.scale.height / 2 - 40);
    this.petEntity.resize();
    this.logicManager.resize();
    this.overlayManager.render();
  };

  public exitGame = (): void => {
    if (!useCatchGameStore.getState().isGameOver && useCatchGameStore.getState().score < 20) usePetStore.getState().handleGameLoss();
    window.dispatchEvent(new CustomEvent("minigame_stopped"));
    EventBus.emit("minigame_stop_to_main");
    EventBus.emit("main_scene_wake");
    this.scene.stop(this.scene.key);
    this.scene.manager.isSleeping("MainScene") ? this.scene.wake("MainScene") : this.scene.start("MainScene");
  };

  private cleanup(): void {
    this.scale.off("resize", this.handleResize, this);
    this.unsubscribeStore?.();
    this.inputController?.destroy();
    this.logicManager?.destroy();
    this.petEntity?.destroy();
    this.overlayManager?.destroy();
    useCatchGameStore.getState().resetStore();
  }
}
