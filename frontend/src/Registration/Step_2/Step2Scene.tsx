import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import Phaser from "phaser";
import { createRoot, Root } from "react-dom/client";
import { Step2UiManager } from "./Step2UiManager";

const CONF = { BASE_W: 460, BASE_VERT_H: 960, BASE_HORIZ_H: 840, PAD: 0.9 };

export class Step2Scene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() { super({ key: "Step2Scene" }); }

  public init(): void {
    document.getElementById("game-container")
      ?.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble")
      .forEach((el) => el.remove());
  }

  // ИСПРАВЛЕНО: Прелоад пустой, фоны уже лежат в кэше
  public preload(): void {}

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const w = Number(this.scale.width), h = Number(this.scale.height);
    this.currentOrientation = h > w ? "vert" : "goriz";

    // ИСПРАВЛЕНО: Берем фон по общему кэшированному ключу "game_bg_"
    this.backgroundIm = this.add.image(w / 2, h / 2, `game_bg_${this.currentOrientation}`).setOrigin(0.5).setDepth(-2);

    this.mountReactUI();
    if (w && h) this.executeResizeLogic(w, h);

    this.scale.on("resize", this.triggerResize, this);
    this.sys.events.on("wake", this.handleWake, this).on("sleep", this.handleSleep, this).once("shutdown", this.cleanUp, this).once("destroy", this.cleanUp, this);

    registerSceneEvent(this, "step2_scene_start", () => this.scene.start());
    registerSceneEvent(this, "step2_scene_stop", () => {
      if (this.sys.isActive()) {
        if (this.uiContainer) this.uiContainer.style.opacity = "0";
        this.tweens.add({ targets: this.backgroundIm, alpha: 0, duration: 200, onComplete: () => this.scene.stop() });
      }
    });

    this.triggerResize();
    this.events.emit("phaser_scene_ready");
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;
    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-0 transition-opacity duration-200";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<Step2UiManager phaserScene={this} />);
    requestAnimationFrame(() => this.uiContainer && (this.uiContainer.style.opacity = "1"));
  }

  public triggerResize(): void {
    if (this.sys.isActive() && this.scale?.width) this.executeResizeLogic(Number(this.scale.width), Number(this.scale.height));
  }

  private executeResizeLogic(width: number, height: number): void {
    const w = Number(width), h = Number(height), isVert = h > w, next = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== next) {
      this.currentOrientation = next;

      // ИСПРАВЛЕНО: Меняем текстуру при ресайзе через глобальный ключ "game_bg_"
      const t = `game_bg_${next}`;
      if (this.textures.exists(t)) { this.tweens.killTweensOf(this.backgroundIm); this.backgroundIm.setAlpha(1).setTexture(t); }
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const aspect = w / h;
    let sc = 1;

    if (isVert) {
      const sX = w / CONF.BASE_W;
      sc = aspect >= 0.7 ? sX * 0.75 : aspect > 0.6 ? sX : aspect < 0.48 ? sX * 0.92 : sX * 0.96;
      if (h < 700) sc *= 0.93;
      sc = Math.max(0.42, Math.min(1.3, sc));
    } else {
      const sX = (w * CONF.PAD) / CONF.BASE_W, sY = (h * CONF.PAD) / CONF.BASE_HORIZ_H;
      sc = Math.min(sX, sY);
      if (aspect < 1.45) sc = Math.min(sX * 0.92, sY * 0.95);
      sc = Math.max(0.3, Math.min(1.25, sc));
    }

    const viewW = w / sc;
    const mode: "fold" | "mobile" | "tablet" | "desktop" = isVert ? (viewW < 750 ? "fold" : "mobile") : (aspect < 1.6 ? "tablet" : "desktop");

    this.events.emit("phaser_scene_resize", { width: w, height: h, isVert, scale: sc, viewW, screenMode: mode });
  }

  private handleWake(): void { this.mountReactUI(); this.events.emit("phaser_scene_ready"); }

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
