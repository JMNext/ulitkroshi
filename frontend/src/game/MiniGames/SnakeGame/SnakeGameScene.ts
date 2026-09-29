import { Scene } from "phaser";
import { BaseMiniGameOverlay } from "@/game/MiniGamesShared/BaseMiniGameOverlay";
import { GameInputController } from "@/game/MiniGamesShared/GameInputController";
import { preloadSharedAssets } from "@/game/MiniGamesShared/preloadSharedAssets";
import { runCountdown } from "@/game/MiniGamesShared/runCountdown";
import { SnakeGameLogicManager } from "./components/SnakeGameLogicManager";
import { useSnakeGameStore } from "./store/useSnakeGameStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { EventBus } from "@/eventbus/EventBus";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";

export class SnakeGameScene extends Scene {
  public difficulty = "medium";
  public score = 0;
  public hp = 100;
  public gameState: "COUNTDOWN" | "PLAYING" | "ENDED" = "COUNTDOWN";
  public countdownText!: Phaser.GameObjects.Text;
  public overlayManager!: BaseMiniGameOverlay;
  public logicManager!: SnakeGameLogicManager;
  public inputController!: GameInputController;
  public bgImage: Phaser.GameObjects.Image | null = null;
  private unsubscribeStore: (() => void) | null = null;

  constructor() {
    super("SnakeGameScene");
  }

  public init(data: { difficulty?: "easy" | "medium" | "hard" }): void {
    this.difficulty = data?.difficulty || "medium";
    this.score = 0;
    this.hp = 100;
    this.gameState = "COUNTDOWN";
    this.overlayManager = new BaseMiniGameOverlay(this, "snake");
    this.inputController = new GameInputController(this);

    const delays = { easy: 340, medium: 200, hard: 120 };
    this.logicManager = new SnakeGameLogicManager(this, delays[this.difficulty as keyof typeof delays]);
    useSnakeGameStore.getState().initGame();
  }

  public preload(): void {
    preloadSharedAssets(this, "snake");
  }

  public create(): void {
    window.dispatchEvent(new CustomEvent("minigame_started"));
    document.getElementById("game-container")?.setAttribute("data-scene", this.scene.key);

    this.bgImage = this.add
      .image(0, 0, this.scale.height > this.scale.width ? "snake_bg_vert" : "snake_bg_horiz")
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.overlayManager.create();
    this.logicManager.initGame();
    this.overlayManager.render();
    this.scale.on("resize", this.handleResize, this);

    this.inputController.setupTouchSwipe((dir) => {
      if (this.gameState === "PLAYING") this.logicManager.changeDirection(dir);
    });

    this.countdownText = runCountdown({
      scene: this,
      container: null,
      customLabel: "ПОЛЗИ!",
      onComplete: () => {
        this.gameState = "PLAYING";
        this.logicManager.resetMoveTime(this.time.now);
      }
    });

    this.sys.events.once("shutdown", () => this.cleanup(), this);
    registerSceneEvent(this, "minigame_snake_start", (d) => this.scene.start("SnakeGameScene", d));
  }

  public update(time: number): void {
    if (this.gameState !== "PLAYING") return;
    const keys = this.inputController.getKeyboardDirections();
    if (keys.dirStr) this.logicManager.changeDirection(keys.dirStr);
    this.logicManager.handleTicks(time);
  }

  public addScore = () => useSnakeGameStore.getState().addScore(() => this.overlayManager.render());

  public triggerCrash = (): void => {
    useSnakeGameStore.getState().applyPenalty(() => {
      if (useSnakeGameStore.getState().hp <= 0) {
        this.gameState = "ENDED";
        this.logicManager.destroy();
      }
      this.overlayManager.render();
    });

    const snakeGfx = this.logicManager?.renderer?.["snakeGraphics"] as Phaser.GameObjects.Graphics | undefined;

    if (snakeGfx) {
      this.tweens.add({
        targets: snakeGfx,
        alpha: 0.2,
        duration: 100,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          if (snakeGfx) snakeGfx.alpha = 1;
        }
      });
    }
  };

  private handleResize = (): void => {
    if (!this.sys?.isActive()) return;
    this.bgImage
      ?.setTexture(this.scale.height > this.scale.width ? "snake_bg_vert" : "snake_bg_horiz")
      .setDisplaySize(this.scale.width, this.scale.height);
    this.countdownText?.setPosition(this.scale.width / 2, this.scale.height / 2 - 40);
    this.logicManager.renderer.resize();
    this.overlayManager.render();
  };

  public exitGame = (): void => {
    if (!useSnakeGameStore.getState().isGameOver && useSnakeGameStore.getState().score < 20) usePetStore.getState().handleGameLoss();
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
    this.overlayManager?.destroy();
    this.logicManager?.destroy();
    useSnakeGameStore.getState().resetStore();
  }
}
