import Phaser from "phaser";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import { EventBus } from "@/eventbus/EventBus";
import { Scene } from "phaser";
import { PlanesGameLogicManager } from "./components/PlanesGameLogicManager";
import { PlanesGameOverlay } from "./components/PlanesGameOverlay";
import { PlanesGridRenderer } from "./components/PlanesGridRenderer";
import { usePlanesGameStore } from "./store/planesGame.store";
import { SNAKE_ASSETS } from "../SnakeGame/constants/snakeGame.constants";

export class PlanesGameScene extends Scene {
  public difficulty: any = "medium";
  public overlayManager!: PlanesGameOverlay;
  public logicManager!: PlanesGameLogicManager;
  public gridRenderer!: PlanesGridRenderer;
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("PlanesGameScene");
  }

  public init(data: any): void {
    this.difficulty = data?.difficulty || "medium";
    this.overlayManager = new PlanesGameOverlay(this);
    this.logicManager = new PlanesGameLogicManager(this);
    this.gridRenderer = new PlanesGridRenderer(this, this.logicManager);
    usePlanesGameStore.getState().initGame();
  }

  public preload(): void {
    Object.entries(SNAKE_ASSETS.fruits).forEach(([k, v]) => {
      if (!this.textures.exists(k)) this.load.image(k, v);
    });
  }

  public create(): void {
    window.dispatchEvent(new CustomEvent("minigame_started"));
    document.getElementById("game-container")?.setAttribute("data-scene", this.scene.key);

    this.logicManager.initGame();
    this.overlayManager.create();
    this.overlayManager.render();

    this.scale.on("resize", this.handleResize, this);
    if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();

    this.sys.events.once("shutdown", () => this.cleanup(), this);
    registerSceneEvent(this, "minigame_planes_start", (data: any) => this.scene.start("PlanesGameScene", data));
  }

  public update(time: number, delta: number): void {
    const deltaSec = delta / 1000;
    if (this.cursors) this.logicManager.movePlayer(this.cursors, deltaSec);
    if (this.input.activePointer) this.logicManager.handleTouch(this.input.activePointer);
    this.logicManager.handleUpdate(time, delta);
  }

  public addScore = (): void => {
    usePlanesGameStore.getState().addScore(() => this.overlayManager.render());
  };

  public triggerCrash = (): void => {
    usePlanesGameStore.getState().applyPenalty(() => this.overlayManager.render());
    if (this.gridRenderer && this.gridRenderer.planeGraphics) {
      const target = this.gridRenderer.planeGraphics;
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
    this.gridRenderer.resize();
    this.overlayManager.render();
  };

  public exitGame = (): void => {
    const state = usePlanesGameStore.getState();
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
    usePlanesGameStore.getState().resetStore();
  }
}
