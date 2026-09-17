import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import { EventBus } from "@/eventbus/EventBus";
import { Scene } from "phaser";
import { MemoryGameGrid } from "./components/MemoryGameGrid";
import { MemoryGameOverlay } from "./components/MemoryGameOverlay";
import { MEMORY_ASSETS } from "./constants/memoryGame.constants";
import { useMemoryGameStore } from "./store/useMemoryGameStore";

const FRUITS_POOL = ["01", "02", "03", "04", "05", "06", "07", "08", "10", "11", "12", "14", "15", "16"];

export class MemoryGameScene extends Scene {
  public difficulty: "easy" | "medium" | "hard" = "medium";
  public totalPairs = 6;
  public overlayManager!: MemoryGameOverlay;
  public gridManager!: MemoryGameGrid;
  private bgImage: Phaser.GameObjects.Image | null = null;
  private unsubscribeStore: (() => void) | null = null;

  constructor() {
    super("MemoryGameScene");
  }

  public init(data: { difficulty?: "easy" | "medium" | "hard" }): void {
    this.difficulty = data?.difficulty || "medium";
    this.totalPairs = this.difficulty === "hard" ? 8 : this.difficulty === "easy" ? 4 : 6;
    this.overlayManager = new MemoryGameOverlay(this);
    this.gridManager = new MemoryGameGrid(this);
    useMemoryGameStore.getState().initGame(this.totalPairs, FRUITS_POOL);
  }

  public preload(): void {
    this.load.image("memory_bg_horiz", MEMORY_ASSETS.bgHoriz);
    this.load.image("memory_bg_vert", MEMORY_ASSETS.bgVert);
    this.load.image("card_shirt", MEMORY_ASSETS.cardShirt);
    Object.entries(MEMORY_ASSETS.fruits).forEach(([k, v]) => this.load.image(k, v));
  }

  public create(): void {
    window.dispatchEvent(new CustomEvent("minigame_started"));
    document.getElementById("game-container")?.setAttribute("data-scene", this.scene.key);

    const isPortrait = this.scale.height > this.scale.width;
    const initialTexture = isPortrait ? "memory_bg_vert" : "memory_bg_horiz";

    if (this.textures.exists(initialTexture)) {
      this.bgImage = this.add.image(0, 0, initialTexture).setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);
    } else {
      this.add.graphics().fillStyle(0x1a3d1c, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    }

    this.overlayManager.create();
    this.gridManager.createGrid();
    this.overlayManager.render();

    this.scale.on("resize", this.handleResize, this);

    this.unsubscribeStore = useMemoryGameStore.subscribe(
      (s) => `${s.openedCards.length}-${s.matchedCards.length}`,
      () => this.gridManager.updateVisuals()
    );

    this.time.delayedCall(2200, () => {
      useMemoryGameStore.setState({ isPreview: false });
      this.gridManager.updateVisuals();
      this.time.delayedCall(400, () => this.gridManager.runMixAnimation());
    });

    this.events.once("shutdown", () => this.cleanup(), this);

    registerSceneEvent(this, "minigame_memory_start", () => {
      this.scene.start("MemoryGameScene");
    });
  }

  private handleResize = (): void => {
    if (!this.sys?.isActive()) return;
    const isPortrait = this.scale.height > this.scale.width;
    this.bgImage?.setTexture(isPortrait ? "memory_bg_vert" : "memory_bg_horiz").setDisplaySize(this.scale.width, this.scale.height);
    this.gridManager.resize();
    this.overlayManager.render();
  };

  public restartGame = (): void => {
    this.scene.restart({ difficulty: this.difficulty });
  };

  public exitGameSession = (): void => {
    window.dispatchEvent(new CustomEvent("minigame_stopped"));

    EventBus.emit("minigame_stop_to_main");
    EventBus.emit("main_scene_wake");

    this.scene.stop(this.scene.key);
    if (this.scene.manager.isSleeping("MainScene")) {
      this.scene.wake("MainScene");
    } else {
      this.scene.start("MainScene");
    }
  };

  private cleanup(): void {
    this.scale.off("resize", this.handleResize, this);
    this.unsubscribeStore?.();
    this.overlayManager?.destroy();
    this.gridManager?.destroy();
    useMemoryGameStore.getState().resetStore();
  }
}
