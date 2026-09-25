import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import Phaser from "phaser";
import { createRoot, Root } from "react-dom/client";
import { LoginUiManager } from "./LoginUiManager";

export class LoginScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private onStepCompleteCallback!: (action: "login" | "register") => void;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() { super({ key: "LoginScene" }); }

  public init(data?: { onStepComplete?: (action: "login" | "register") => void }): void {
    this.onStepCompleteCallback = data?.onStepComplete || ((act) => this.handleSwitchScene(act));
  }

  // ИСПРАВЛЕНО: Метод preload теперь пустой, сцена не тратит время на импорты и загрузку
  public preload(): void {}

  public create(): void {
    if (typeof window !== "undefined") window.addEventListener("beforeunload", this.handleBeforeUnload);
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";
    this.cameras.main.setBackgroundColor("#000000");

    this.buildBackground();
    this.mountReactUI();

    this.scale.on("resize", this.triggerResize, this);
    this.events.on("switch_scene", this.handleSwitchScene, this);
    this.sys.events.on("wake", this.handleSceneWake, this)
                   .on("sleep", this.handleSceneSleep, this)
                   .once("shutdown", this.cleanUp, this)
                   .once("destroy", this.cleanUp, this);

    registerSceneEvent(this, "login_scene_start", () => this.scene.start());
    registerSceneEvent(this, "force_logout_to_login", () => {
      this.scene.isSleeping("LoginScene") ? this.scene.wake("LoginScene") : !this.scene.isActive("LoginScene") && this.scene.start("LoginScene");
      this.cameras.main.setBackgroundColor("#000000");
      this.scene.bringToTop("LoginScene");
      setTimeout(() => this.buildBackground(), 20);
    });

    this.triggerResize();
  }

  private buildBackground(): void {
    if (this.backgroundIm) this.backgroundIm.destroy();
    const w = Number(this.scale.width), h = Number(this.scale.height);
    this.currentOrientation = h > w ? "vert" : "goriz";

    // ИСПРАВЛЕНО: Текстура мгновенно берется по готовому ключу из PreloaderScene
    this.backgroundIm = this.add.image(w / 2, h / 2, `login_bg_${this.currentOrientation}`).setOrigin(0.5).setDepth(1);
    if (w && h) this.executeResizeLogic(w, h);
  }

  private handleBeforeUnload = (): void => { this.events.emit("phaser_before_unload"); };

  private mountReactUI(): void {
    if (this.uiContainer) return;
    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-0 transition-opacity duration-200";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);
    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<LoginUiManager phaserScene={this} />);
    requestAnimationFrame(() => this.uiContainer && (this.uiContainer.style.opacity = "1"));
  }

  public triggerResize(): void {
    if (this.sys.isActive() && this.scale?.width) this.executeResizeLogic(Number(this.scale.width), Number(this.scale.height));
  }

  private executeResizeLogic(w: number, h: number): void {
    const isVert = h > w, next = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== next) {
      this.currentOrientation = next;
      const t = `login_bg_${next}`;
      if (this.textures.exists(t) && this.backgroundIm?.active) {
        this.tweens.killTweensOf(this.backgroundIm);
        this.backgroundIm.setAlpha(1).setTexture(t);
      }
    }
    if (this.backgroundIm?.active) this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const aspect = w / h;
    let sc = Math.min(w / 460, h / (isVert ? 780 : 1000));
    if (isVert) {
      sc = aspect >= 0.7 ? (h / 780) * 0.82 : aspect > 0.6 ? w / 460 : aspect < 0.48 ? (w / 460) * 0.92 : (w / 460) * 0.96;
      if (h < 700) sc *= 0.93;
    } else if (aspect < 1.45) {
      sc = Math.min((w / 460) * 0.92, (h / 1000) * 0.95);
    }

    this.events.emit("phaser_scene_resize", { width: w, height: h, isVert, scale: Math.max(0.35, Math.min(1.25, sc)) });
  }

  private handleSwitchScene(action: "login" | "register"): void {
    if (this.uiContainer) this.uiContainer.style.opacity = "0";
    const to = action === "login" ? "Step2Scene" : "Step1Scene";
    if (this.backgroundIm?.active) {
      this.tweens.add({
        targets: this.backgroundIm, alpha: 0, duration: 200,
        onComplete: () => this.scene.start(to, { sessionId: "mock-session-id" })
      });
    } else this.scene.start(to, { sessionId: "mock-session-id" });
  }

  private handleSceneWake(): void {
    if (this.uiContainer) {
      this.uiContainer.classList.remove("hidden");
      requestAnimationFrame(() => this.uiContainer && (this.uiContainer.style.opacity = "1"));
    }
    this.buildBackground(); this.triggerResize();
  }

  private handleSceneSleep(): void {
    if (this.uiContainer) { this.uiContainer.style.opacity = "0"; this.uiContainer.classList.add("hidden"); }
  }

  private cleanUp(): void {
    if (typeof window !== "undefined") window.removeEventListener("beforeunload", this.handleBeforeUnload);
    this.scale.off("resize", this.triggerResize, this);
    this.events.off("switch_scene", this.handleSwitchScene, this);
    this.sys.events.off("wake", this.handleSceneWake, this).off("sleep", this.handleSceneSleep, this);
    if (this.backgroundIm) { this.tweens.killTweensOf(this.backgroundIm); this.backgroundIm.destroy(); }
    try { this.reactRoot?.unmount(); } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
