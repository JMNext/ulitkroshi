import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import Phaser from "phaser";
import { createRoot, Root } from "react-dom/client";
import { MainSceneUI } from "./MainSceneUI";

export class MainScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private reactRoot: Root | null = null;
  private resizeId: number | null = null;

  constructor() { super({ key: "MainScene" }); }

  public init(): void {
    document.getElementById("game-container")
      ?.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble")
      .forEach(el => el.remove());
  }

  public preload(): void {}

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const { width: w, height: h } = this.scale;
    this.backgroundIm = this.add.image(w / 2, h / 2, `game_bg_${h > w ? "vert" : "goriz"}`).setOrigin(0.5).setDepth(-2);

    this.mountReactUI();

    if (w && h) this.executeResizeLogic(w, h);

    this.scale.on("resize", this.triggerResize, this);

    this.sys.events.on("wake", () => {
      if (!this.uiContainer) {
        this.mountReactUI();
      }
      this.uiContainer?.classList.remove("hidden");
      this.triggerResize();
    })
    .on("sleep", () => {
      this.uiContainer?.classList.add("hidden");
    })
    .once("shutdown", this.cleanUp, this);

    this.events.on("switch_to_minigame", this.handleMiniGameStart, this);

    registerSceneEvent(this, "main_scene_start", () => this.scene.start("MainScene"));
    registerSceneEvent(this, "main_scene_wake", () => { this.scene.start("MainScene"); this.scene.bringToTop("MainScene"); });
    registerSceneEvent(this, "main_scene_stop", () => {
      if (this.sys.isActive()) {
        this.scene.sleep("MainScene");
        this.scene.isSleeping("ScannerScene") ? this.scene.wake("ScannerScene") : this.scene.start("ScannerScene");
        this.scene.bringToTop("ScannerScene");
      }
    });

    registerSceneEvent(this, "force_logout_to_login", () => {
      this.cleanUp();
      this.scene.manager.getScenes(false).forEach(s => {
        try { s.scene.stop(); s.scene.setVisible(false); s.scene.setActive(false); } catch (_) {}
      });
      this.scene.start("LoginScene"); this.scene.bringToTop("LoginScene");
    });

    this.triggerResize();
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;
    this.uiContainer = document.createElement("div");
    this.uiContainer.style.position = "absolute";
    this.uiContainer.style.inset = "0";
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";

    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);
    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<MainSceneUI phaserScene={this} />);
  }

  private handleMiniGameStart = (data: { scene: string; difficulty?: any }): void => {
    const { scene, difficulty } = data;
    if (scene && this.sys.isActive()) {
      this.scene.sleep("MainScene");
      this.scene.isSleeping(scene) ? this.scene.wake(scene, { difficulty }) : this.scene.start(scene, { difficulty });
      this.scene.bringToTop(scene);
    }
  };

  // ДОБАВЛЕНО: Метод для ручного получения текущих размеров экрана из React
  public getLatestResizeData() {
    const { width: w, height: h } = this.scale;
    return { width: w, height: h, isVert: h > w };
  }

  public triggerResize(): void {
    if (!this.sys.isActive() || !this.scale?.width || this.resizeId !== null) return;
    this.resizeId = requestAnimationFrame(() => {
      const { width: w, height: h } = this.scale;
      this.executeResizeLogic(w, h);
      this.events.emit("phaser_main_resize", { width: w, height: h, isVert: h > w });
      this.resizeId = null;
    });
  }

  private executeResizeLogic(w: number, h: number): void {
    if (!this.backgroundIm?.active) return;
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const target = `game_bg_${h > w ? "vert" : "goriz"}`;
    if (this.backgroundIm.texture.key !== target && this.textures.exists(target)) {
      this.backgroundIm.setTexture(target);
    }
  }

  private cleanUp = (): void => {
    if (this.resizeId !== null) cancelAnimationFrame(this.resizeId);
    this.scale.off("resize", this.triggerResize, this);
    this.events.off("switch_to_minigame");
    this.backgroundIm?.destroy();
    try { this.reactRoot?.unmount(); } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  };
}
