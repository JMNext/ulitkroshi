import { Scene } from "phaser";
import { useSnakeGameStore } from "./store/useSnakeGameStore";
import { SnakeGameOverlay } from "./SnakeGameOverlay";
import { SnakeGameLogicManager } from "./SnakeGameLogicManager";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { SNAKE_ASSETS } from "./snakeGame.constants";

export class SnakeGameScene extends Scene {
  public difficulty = "medium";
  public score = 0;
  public hp = 100;
  public overlayManager!: SnakeGameOverlay;
  public logicManager!: SnakeGameLogicManager;
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bgImage: Phaser.GameObjects.Image | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private touchStartX?: number;
  private touchStartY?: number;

  constructor() { super("SnakeGameScene"); }

  public init(data: { difficulty?: "easy" | "medium" | "hard"; }): void {
    this.difficulty = data.difficulty || "medium";
    this.score = 0;
    this.hp = 100;
    const speed = { easy: 340, medium: 200, hard: 120 }[this.difficulty] || 200;

    this.overlayManager = new SnakeGameOverlay(this);
    this.logicManager = new SnakeGameLogicManager(this, speed);
    useSnakeGameStore.getState().initGame();
  }

  public preload(): void {
    this.load.image("snake_bg_horiz", SNAKE_ASSETS.bgHoriz);
    this.load.image("snake_bg_vert", SNAKE_ASSETS.bgVert);
    Object.entries(SNAKE_ASSETS.fruits).forEach(([k, v]) => this.load.image(k, v));
  }

  public create(): void {
    window.dispatchEvent(new CustomEvent("minigame_started"));
    document.getElementById("game-container")?.setAttribute("data-scene", this.scene.key);

    const isPortrait = this.scale.height > this.scale.width;
    this.bgImage = this.add.image(0, 0, isPortrait ? "snake_bg_vert" : "snake_bg_horiz").setOrigin(0);
    this.bgImage.setDisplaySize(this.scale.width, this.scale.height);

    this.overlayManager.create();
    this.logicManager.initGame();
    this.overlayManager.render();

    this.scale.on("resize", this.handleResize, this);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.touchStartX === undefined || this.touchStartY === undefined) return;

      const swipeThreshold = 40;
      const diffX = pointer.x - this.touchStartX;
      const diffY = pointer.y - this.touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > swipeThreshold) {
          if (diffX > 0) this.logicManager.changeDirection("RIGHT");
          else this.logicManager.changeDirection("LEFT");
        }
      } else {
        if (Math.abs(diffY) > swipeThreshold) {
          if (diffY > 0) this.logicManager.changeDirection("DOWN");
          else this.logicManager.changeDirection("UP");
        }
      }
      this.touchStartX = undefined;
      this.touchStartY = undefined;
    });

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
    this.events.once("shutdown", () => this.cleanup());
  }

  public update(time: number): void {
    if (this.cursors) {
      if (this.cursors.left.isDown) this.logicManager.changeDirection("LEFT");
      else if (this.cursors.right.isDown) this.logicManager.changeDirection("RIGHT");
      else if (this.cursors.up.isDown) this.logicManager.changeDirection("UP");
      else if (this.cursors.down.isDown) this.logicManager.changeDirection("DOWN");
    }
    this.logicManager.handleTicks(time);
  }

  public addScore = (): void => { useSnakeGameStore.getState().addScore(() => {}); };
  public triggerCrash = (): void => { useSnakeGameStore.getState().applyPenalty(() => {}); };

  private handleResize = (): void => {
    if (!this.sys?.isActive()) return;
    const isPortrait = this.scale.height > this.scale.width;
    this.bgImage?.setTexture(isPortrait ? "snake_bg_vert" : "snake_bg_horiz").setDisplaySize(this.scale.width, this.scale.height);
    this.logicManager.renderer.resize();
    this.overlayManager.render();
  };

  public exitGame = (): void => {
    const snakeState = useSnakeGameStore.getState();
    if (!snakeState.isGameOver && snakeState.score < 20) {
      usePetStore.getState().handleGameLoss();
    }
    window.dispatchEvent(new CustomEvent("minigame_stopped"));
    this.scene.stop(this.scene.key);
    if (this.scene.manager.isSleeping("MainScene")) this.scene.wake("MainScene");
    else this.scene.start("MainScene");
  };

  private cleanup(): void {
    this.scale.off("resize", this.handleResize, this);
    this.unsubscribeStore?.();
    this.overlayManager?.destroy();
    this.logicManager?.destroy();
    useSnakeGameStore.getState().resetStore();
  }
}
