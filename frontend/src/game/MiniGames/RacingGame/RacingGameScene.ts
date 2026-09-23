import { Scene } from "phaser";
import { BaseMiniGameOverlay } from "@/game/MiniGamesShared/BaseMiniGameOverlay";
import { GameInputController } from "@/game/MiniGamesShared/GameInputController";
import { preloadSharedAssets } from "@/game/MiniGamesShared/preloadSharedAssets";
import { runCountdown } from "@/game/MiniGamesShared/runCountdown";
import { RacingGameLogicManager } from "./components/RacingGameLogicManager";
import { RacingGridRenderer } from "./components/RacingGridRenderer";
import { useRacingGameStore } from "./store/useRacingGameStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { EventBus } from "@/eventbus/EventBus";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import carImgUrl from "@/assets/resources/car.png";

export class RacingGameScene extends Scene {
  public difficulty: any = "medium";
  public gameState: "COUNTDOWN" | "PLAYING" | "ENDED" = "COUNTDOWN";
  public overlayManager!: BaseMiniGameOverlay;
  public logicManager!: RacingGameLogicManager;
  public gridRenderer!: RacingGridRenderer;
  public inputController!: GameInputController;
  public bgImage: Phaser.GameObjects.Image | null = null;
  public countdownText!: Phaser.GameObjects.Text;
  private unsubscribeStore: (() => void) | null = null;

  constructor() {
    super("RacingGameScene");
  }

  public init(data: any): void {
    this.difficulty = data?.difficulty || "medium";
    this.gameState = "COUNTDOWN";
    this.overlayManager = new BaseMiniGameOverlay(this, "racing");
    this.logicManager = new RacingGameLogicManager(this);
    this.gridRenderer = new RacingGridRenderer(this, this.logicManager);
    this.inputController = new GameInputController(this);
    if ((useMainGameStore.getState() as any).clearGameOver) (useMainGameStore.getState() as any).clearGameOver();
    useRacingGameStore.getState().initGame();
  }

  public preload(): void {
    this.load.image("player_car", carImgUrl);
    preloadSharedAssets(this, "racing");
  }

  public create(): void {
    window.dispatchEvent(new CustomEvent("minigame_started"));
    document.getElementById("game-container")?.setAttribute("data-scene", this.scene.key);

    const isPort = this.scale.height > this.scale.width;
    this.bgImage = this.add.image(0, 0, isPort ? "racing_bg_vert" : "racing_bg_horiz").setOrigin(0);
    this.bgImage.setDisplaySize(this.scale.width, this.scale.height).setVisible(!isPort);

    this.logicManager.initGame();
    this.overlayManager.create();
    this.overlayManager.render();
    this.gridRenderer?.updateRoadAnims(0);
    this.scale.on("resize", this.handleResize, this);

    this.unsubscribeStore = useRacingGameStore.subscribe(
      (s) => s.isGameOver,
      (isOver) => isOver && this.overlayManager.render()
    );

    this.countdownText = runCountdown({
      scene: this,
      container: this.gridRenderer.mainGridContainer,
      customLabel: "ПОЕХАЛИ!",
      onComplete: () => {
        this.gameState = "PLAYING";
        this.logicManager.startSpawning();
      }
    });

    this.sys.events.once("shutdown", () => this.cleanup(), this);
    registerSceneEvent(this, "minigame_racing_start", (d) => this.scene.start("RacingGameScene", d));
  }

  public update(time: number, delta: number): void {
    if (this.gameState !== "PLAYING") return;
    const keys = this.inputController.getKeyboardDirections();
    this.logicManager.handleKeyboardInput(keys, delta / 1000);
    if (this.input.activePointer) this.logicManager.handleTouchInput(this.input.activePointer);
    this.logicManager.handleUpdate(time, delta);
  }

  public addScore = () => useRacingGameStore.getState().addScore(() => this.overlayManager.render());

  public triggerCrash = (): void => {
    useRacingGameStore.getState().applyPenalty(() => {
      this.overlayManager.render();
      const s = useRacingGameStore.getState();
      if (s.hp <= 0) {
        this.gameState = "ENDED";
        (useMainGameStore.getState() as any).setGameOver(s.score, this.difficulty, false);
        useRacingGameStore.setState({ isGameOver: true, isWin: false });
        this.overlayManager.render();
      }
    });
    const t = this.gridRenderer?.carSprite;
    if (t) this.tweens.add({ targets: t, alpha: 0.2, duration: 100, yoyo: true, repeat: 4, onComplete: () => (t.alpha = 1) });
  };

  private handleResize = (): void => {
    if (!this.sys?.isActive()) return;
    const isPort = this.scale.height > this.scale.width;
    this.bgImage
      ?.setTexture(isPort ? "racing_bg_vert" : "racing_bg_horiz")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setVisible(!isPort);
    this.countdownText?.setPosition(0, -40);
    this.gridRenderer.resize();
    this.overlayManager.render();
  };

  public exitGame = (): void => {
    this.overlayManager?.destroy();
    if (!useRacingGameStore.getState().isGameOver && useRacingGameStore.getState().score === 0) usePetStore.getState().handleGameLoss();
    window.dispatchEvent(new CustomEvent("minigame_stopped"));
    EventBus.emit("minigame_stop_to_main");
    EventBus.emit("main_scene_wake");
    this.scene.stop(this.scene.key);
    this.scene.manager.isSleeping("MainScene") ? this.scene.wake("MainScene") : this.scene.start("MainScene");
  };

  private cleanup(): void {
    this.scale.off("resize", this.handleResize, this);
    this.unsubscribeStore?.();
    this.overlayManager?.destroy();
    this.logicManager?.destroy();
    this.inputController?.destroy();
    if ((useMainGameStore.getState() as any).clearGameOver) (useMainGameStore.getState() as any).clearGameOver();
    useRacingGameStore.getState().resetStore();
  }
}
