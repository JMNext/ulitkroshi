import { Scene } from "phaser";
import { BaseMiniGameOverlay } from "@/game/MiniGamesShared/BaseMiniGameOverlay";
import { preloadSharedAssets } from "@/game/MiniGamesShared/preloadSharedAssets";
import { MemoryGameGrid } from "./components/MemoryGameGrid";
import { useMemoryGameStore } from "./store/useMemoryGameStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { EventBus } from "@/eventbus/EventBus";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";

const POOL = ["01", "02", "03", "04", "05", "06", "07", "08", "10", "11", "12", "14", "15", "16"];

export class MemoryGameScene extends Scene {
  public difficulty: "easy" | "medium" | "hard" = "medium";
  public totalPairs = 6;
  public gameState: "COUNTDOWN" | "PLAYING" | "ENDED" = "COUNTDOWN";
  public overlayManager!: BaseMiniGameOverlay;
  public gridManager!: MemoryGameGrid;

  public bgImage: Phaser.GameObjects.Image | null = null;
  private unsubscribeStore: (() => void) | null = null;

  constructor() {
    super("MemoryGameScene");
  }

  public init(data: { difficulty?: "easy" | "medium" | "hard" }): void {
    this.difficulty = data?.difficulty || "medium";
    this.totalPairs = this.difficulty === "hard" ? 8 : this.difficulty === "easy" ? 4 : 6;
    this.gameState = "COUNTDOWN";
    this.overlayManager = new BaseMiniGameOverlay(this, "memory");
    this.gridManager = new MemoryGameGrid(this);
    useMemoryGameStore.getState().initGame(this.totalPairs, POOL);
  }

  public preload(): void {
    preloadSharedAssets(this, "memory", true);
  }

  public create(): void {
    window.dispatchEvent(new CustomEvent("minigame_started"));
    document.getElementById("game-container")?.setAttribute("data-scene", this.scene.key);

    const isPort = this.scale.height > this.scale.width;
    const tex = isPort ? "memory_bg_vert" : "memory_bg_horiz";
    if (this.textures.exists(tex)) {
      this.bgImage = this.add.image(0, 0, tex).setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);
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
      this.time.delayedCall(400, () => {
        this.gameState = "PLAYING";
        this.gridManager.runMixAnimation();
      });
    });

    this.events.once("shutdown", () => this.cleanup(), this);
    registerSceneEvent(this, "minigame_memory_start", (d) => this.scene.start("MemoryGameScene", d));
  }

  public update(): void {
    // В Мемори логика построена на ивентах клика, тики в update не требуются
  }

  private handleResize = (): void => {
    if (!this.sys?.isActive()) return;
    this.bgImage?.setTexture(this.scale.height > this.scale.width ? "memory_bg_vert" : "memory_bg_horiz").setDisplaySize(this.scale.width, this.scale.height);
    this.gridManager.resize();
    this.overlayManager.render();
  };

  public exitGameSession = (): void => {
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
    this.gridManager?.destroy();
    useMemoryGameStore.getState().resetStore();
  }
}
