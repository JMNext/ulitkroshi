import { EventBus } from "@/eventbus/EventBus";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import Phaser from "phaser";
import { createRoot, Root } from "react-dom/client";
import fonGorizUrl from "../../assets/background/fon_goriz.png";
import fonVertUrl from "../../assets/background/fon_vert.png";
import { Step3UiManager } from "./Step3UiManager";

const CONFIG = { BASE_W: 460, BASE_H: 780 };

export class Step3Scene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  public sessionId: string = "";
  // Добавлен флаг для отслеживания текущего контекста флоу
  public isLoginFlow: boolean = false;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() {
    super({ key: "Step3Scene" });
  }

  public init(data?: { sessionId?: string; isLoginFlow?: boolean }): void {
    this.sessionId = data?.sessionId || "";
    // ИСПРАВЛЕНО: Запоминаем, какой флоу был передан при старте сцены
    this.isLoginFlow = data?.isLoginFlow || false;

    const container = document.getElementById("game-container");
    if (container) {
      container.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach((el) => el.remove());
    }

    // ИСПРАВЛЕНО: Передаем флаг флоу в React-компонент, чтобы избежать сброса режима в "регистрацию"
    this.events.emit("phaser_scene_init", { isLoginFlow: this.isLoginFlow });
  }

  public preload(): void {
    if (!this.textures.exists("step3_bg_fon_goriz")) this.load.image("step3_bg_fon_goriz", fonGorizUrl);
    if (!this.textures.exists("step3_bg_fon_vert")) this.load.image("step3_bg_fon_vert", fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const w = Number(this.scale.width), h = Number(this.scale.height);
    this.currentOrientation = h > w ? "vert" : "goriz";
    this.backgroundIm = this.add
      .image(w / 2, h / 2, `step3_bg_fon_${this.currentOrientation}`)
      .setOrigin(0.5)
      .setDepth(-2);

    this.mountReactUI();
    if (w && h) this.executeResizeLogic(w, h);

    this.scale.on("resize", this.triggerResize, this);
    this.sys.events
      .on("wake", this.handleWake, this)
      .on("sleep", this.handleSleep, this)
      .once("shutdown", this.cleanUp, this)
      .once("destroy", this.cleanUp, this);

    registerSceneEvent(this, "step3_scene_start", this.handleExternalStart.bind(this));
    registerSceneEvent(this, "step3_scene_stop", this.handleExternalStop.bind(this));

    this.triggerResize();
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;
    this.uiContainer = document.createElement("div");
    this.uiContainer.className =
      "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-0 transition-opacity duration-200";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<Step3UiManager phaserScene={this} sessionId={this.sessionId} />);
    requestAnimationFrame(() => this.uiContainer && (this.uiContainer.style.opacity = "1"));
  }

  public triggerResize(): void {
    if (this.sys.isActive() && this.scale?.width && this.scale?.height) {
      this.executeResizeLogic(Number(this.scale.width), Number(this.scale.height));
    }
  }

  private handleExternalStart(data?: { sessionId: string; isLoginFlow?: boolean }): void {
    this.scene.start("Step3Scene", data);
  }

  private handleExternalStop(): void {
    if (this.sys.isActive()) {
      if (this.uiContainer) this.uiContainer.style.opacity = "0";
      this.tweens.add({
        targets: this.backgroundIm,
        alpha: 0,
        duration: 200,
        onComplete: () => this.scene.stop()
      });
    }
  }

  private executeResizeLogic(width: number, height: number): void {
    const w = Number(width), h = Number(height), isVert = h > w;
    const nextOrient = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== nextOrient) {
      this.currentOrientation = nextOrient;
      const texture = `step3_bg_fon_${nextOrient}`;
      if (this.textures.exists(texture)) {
        this.tweens.killTweensOf(this.backgroundIm);
        this.backgroundIm.setAlpha(1).setTexture(texture);
      }
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const scaleX = w / CONFIG.BASE_W, scaleY = h / CONFIG.BASE_H, aspect = w / h;
    let computedScale = Math.min(scaleX, scaleY);
    if (isVert) {
      computedScale =
        aspect >= 0.7
          ? scaleY * 0.95
          : aspect > 0.6
            ? Math.min(scaleY * 0.95, scaleX * 0.95)
            : aspect < 0.48
              ? scaleX * 0.92
              : scaleX * 0.96;
    }
    computedScale = Math.max(0.42, Math.min(1.3, computedScale));

    const viewW = w / computedScale;
    const screenMode: "fold" | "mobile" | "tablet" | "desktop" = isVert
      ? (viewW < 750 ? "fold" : "mobile")
      : (aspect < 1.6 ? "tablet" : "desktop");

    this.events.emit("phaser_scene_resize", {
      width: w,
      height: h,
      isVert,
      scale: computedScale,
      viewW,
      screenMode
    });
  }

  private handleWake(sys: Phaser.Scenes.Systems, data?: { sessionId?: string; isLoginFlow?: boolean }): void {
    if (data) {
      this.sessionId = data.sessionId || this.sessionId;
      this.isLoginFlow = data.isLoginFlow || false;
    }
    this.mountReactUI();
    this.events.emit("phaser_scene_init", { isLoginFlow: this.isLoginFlow });
    this.triggerResize();
  }

  private handleSleep(): void {
    this.events.emit("phaser_scene_sleep");
    this.tweens.killTweensOf(this.backgroundIm);

    // ИСПРАВЛЕНО: Убираем задержку unmount, размонтируем интерфейс СИНХРОННО.
    // Это предотвратит баг «исчезновения экрана», если сцена сразу проснется обратно.
    try {
      this.reactRoot?.unmount();
    } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }

  private cleanUp(): void {
    this.events.emit("phaser_scene_cleanup");
    this.scale.off("resize", this.triggerResize, this);
    this.sys.events.off("wake", this.handleWake, this).off("sleep", this.handleSleep, this);
    this.tweens.killTweensOf(this.backgroundIm);

    // ИСПРАВЛЕНО: Чистим глобальные подписки EventBus, чтобы избежать утечек памяти
    EventBus.off("step3_scene_start");
    EventBus.off("step3_scene_stop");

    try {
      this.reactRoot?.unmount();
    } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
