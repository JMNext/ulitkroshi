import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import Phaser from "phaser";
import { createRoot, Root } from "react-dom/client";
import { Step4UiManager } from "./Step4UiManager";

const CONF = { BASE_W: 540, BASE_H: 960, MIN: 0.3, MAX: 1.25, PAD: 0.9 };

export class Step4Scene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() { super({ key: "Step4Scene" }); }

  public init(): void {
    document.getElementById("game-container")
      ?.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble")
      .forEach((el) => el.remove());
  }

  public preload(): void {}

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const w = Number(this.scale.width), h = Number(this.scale.height);
    this.currentOrientation = h > w ? "vert" : "goriz";

    this.backgroundIm = this.add.image(w / 2, h / 2, `game_bg_${this.currentOrientation}`).setOrigin(0.5).setDepth(-2);

    // ОПТИМИЗАЦИЯ: Асинхронное монтирование UI через setTimeout
    setTimeout(() => {
      this.mountReactUI();
    }, 0);

    if (w && h) this.executeResizeLogic(w, h);

    this.scale.on("resize", this.triggerResize, this);
    this.sys.events.on("wake", this.handleWake, this).on("sleep", this.handleSleep, this).once("shutdown", this.cleanUp, this).once("destroy", this.cleanUp, this);

    registerSceneEvent(this, "step4_scene_start", (data?: any) => this.scene.start("Step4Scene", data));
    registerSceneEvent(this, "step4_scene_stop", () => {
      if (this.sys.isActive()) {
        if (this.uiContainer) this.uiContainer.style.opacity = "0";
        this.tweens.add({ targets: this.backgroundIm, alpha: 0, duration: 200, onComplete: () => this.scene.stop() });
      }
    });

    this.triggerResize();
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;
    this.uiContainer = document.createElement("div");

    // ОПТИМИЗАЦИЯ: Базовые стили для мгновенного позиционирования
    this.uiContainer.style.position = "absolute";
    this.uiContainer.style.inset = "0";
    this.uiContainer.style.opacity = "0";
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-0 transition-opacity duration-200";

    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<Step4UiManager phaserScene={this} />);

    requestAnimationFrame(() => this.uiContainer && (this.uiContainer.style.opacity = "1"));
  }

  public triggerResize(): void {
    if (this.sys.isActive() && this.scale?.width) this.executeResizeLogic(Number(this.scale.width), Number(this.scale.height));
  }

  private executeResizeLogic(width: number, height: number): void {
    const w = Number(width), h = Number(height), isVert = h > w, next = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== next) {
      this.currentOrientation = next;
      const t = `game_bg_${next}`;
      if (this.textures.exists(t)) { this.tweens.killTweensOf(this.backgroundIm); this.backgroundIm.setAlpha(1).setTexture(t); }
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const sX = (w * CONF.PAD) / CONF.BASE_W, sY = (h * CONF.PAD) / CONF.BASE_H, aspect = w / h;
    let sc = Math.min(sX, sY);

    if (!isVert && aspect < 1.45) sc = Math.min(sX * 0.92, sY * 0.95);
    else if (isVert && h < 700) sc *= 0.93;
    sc = Math.max(CONF.MIN, Math.min(CONF.MAX, sc));

    const viewW = w / sc;
    const mode: "fold" | "mobile" | "tablet" | "desktop" = isVert ? (viewW < 750 ? "fold" : "mobile") : (aspect < 1.6 ? "tablet" : "desktop");

    this.events.emit("phaser_scene_resize", { width: w, height: h, isVert, scale: sc, viewW, screenMode: mode, finalScale: mode === "mobile" && h / w > 1.65 ? sc * 1.35 : sc });
  }

  private handleWake(): void {
    setTimeout(() => {
      this.mountReactUI();
    }, 0);
    this.triggerResize();
  }

  private handleSleep(): void {
    this.events.emit("phaser_scene_sleep");
    if (this.uiContainer) this.uiContainer.style.opacity = "0";
    this.tweens.add({
      targets: this.backgroundIm, alpha: 0, duration: 200,
      onComplete: () => {
        try { this.reactRoot?.unmount(); } catch (_) {}
        this.uiContainer?.remove(); this.reactRoot = this.uiContainer = null;
      }
    });
  }

  private cleanUp(): void {
    this.events.emit("phaser_scene_cleanup");
    this.scale.off("resize", this.triggerResize, this);
    this.sys.events.off("wake", this.handleWake, this).off("sleep", this.handleSleep, this);
    this.tweens.killTweensOf(this.backgroundIm);
    try { this.reactRoot?.unmount(); } catch (_) {}
    this.uiContainer?.remove(); this.reactRoot = this.uiContainer = null;
  }
}
