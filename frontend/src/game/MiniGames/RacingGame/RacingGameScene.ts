import Phaser from "phaser";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import { EventBus } from "@/eventbus/EventBus";
import { Scene } from "phaser";
import { RacingGameLogicManager } from "./components/RacingGameLogicManager";
import { RacingGameOverlay } from "./components/RacingGameOverlay";
import { RacingGridRenderer } from "./components/RacingGridRenderer";
import { RACING_ASSETS } from "./constants/racingGame.constants";
import { useRacingGameStore } from "./store/useRacingGameStore";
import { SNAKE_ASSETS } from "../SnakeGame/constants/snakeGame.constants";
import carImgUrl from "@/assets/resources/car.png";

export class RacingGameScene extends Scene {
  public difficulty: any = "medium";
  public overlayManager!: RacingGameOverlay;
  public logicManager!: RacingGameLogicManager;
  public gridRenderer!: RacingGridRenderer;
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bgImage: Phaser.GameObjects.Image | null = null;

  constructor() {
    super("RacingGameScene");
  }

  public init(data: any): void {
    this.difficulty = data?.difficulty || "medium";
    this.overlayManager = new RacingGameOverlay(this);
    this.logicManager = new RacingGameLogicManager(this);
    this.gridRenderer = new RacingGridRenderer(this, this.logicManager);
    useRacingGameStore.getState().initGame();
  }

  public preload(): void {
    this.load.image("racing_bg_horiz", RACING_ASSETS.bgHoriz);
    this.load.image("racing_bg_vert", RACING_ASSETS.bgVert);
    this.load.image("player_car", carImgUrl);
    Object.entries(SNAKE_ASSETS.fruits).forEach(([k, v]) => {
      if (!this.textures.exists(k)) this.load.image(k, v);
    });
  }

  public create(): void {
    window.dispatchEvent(new CustomEvent("minigame_started"));
    document.getElementById("game-container")?.setAttribute("data-scene", this.scene.key);

    const isPortrait = this.scale.height > this.scale.width;
    this.bgImage = this.add.image(0, 0, isPortrait ? "racing_bg_vert" : "racing_bg_horiz").setOrigin(0);
    this.bgImage.setDisplaySize(this.scale.width, this.scale.height).setVisible(!isPortrait);

    this.logicManager.initGame();
    this.overlayManager.create();
    this.overlayManager.render();

    if (this.gridRenderer) {
      this.gridRenderer.updateRoadAnims(0);
    }

    this.scale.on("resize", this.handleResize, this);
    if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();

    this.sys.events.once("shutdown", () => this.cleanup(), this);
    registerSceneEvent(this, "minigame_racing_start", (data: any) => this.scene.start("RacingGameScene", data));
  }

  public update(time: number, delta: number): void {
    const deltaSec = delta / 1000;
    if (this.cursors) this.logicManager.handleKeyboardInput(this.cursors, deltaSec);
    if (this.input.activePointer) this.logicManager.handleTouchInput(this.input.activePointer);
    this.logicManager.handleUpdate(time, delta);
  }

  public addScore = (): void => {
    useRacingGameStore.getState().addScore(() => this.overlayManager.render());
  };

  public triggerCrash = (): void => {
    useRacingGameStore.getState().applyPenalty(() => this.overlayManager.render());
    if (this.gridRenderer && this.gridRenderer.carSprite) {
      const target = this.gridRenderer.carSprite;
      this.tweens.add({
        targets: target,
        alpha: 0.2,
        duration: 100,
        yoyo: true,
        repeat: 4,
        onComplete: () => { target.alpha = 1; }
      });
    }
  };

  private handleResize = (): void => {
    if (!this.sys?.isActive()) return;
    const isPortrait = this.scale.height > this.scale.width;
    this.bgImage?.setTexture(isPortrait ? "racing_bg_vert" : "racing_bg_horiz")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setVisible(!isPortrait);
    this.gridRenderer.resize();
    this.overlayManager.render();
  };

  public exitGame = (): void => {
    const state = useRacingGameStore.getState();
    if (!state.isGameOver && state.score < 20) usePetStore.getState().handleGameLoss();
    window.dispatchEvent(new CustomEvent("minigame_stopped"));
    EventBus.emit("minigame_stop_to_main");
    EventBus.emit("main_scene_wake");
    this.scene.stop(this.scene.key);
    this.scene.wake("MainScene");
  };

  private cleanup(): void {
    this.scale.off("resize", this.handleResize, this);
    this.overlayManager?.destroy();
    this.logicManager?.destroy();
    useRacingGameStore.getState().resetStore();
  }
}
