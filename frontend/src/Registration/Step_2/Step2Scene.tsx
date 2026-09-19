import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import Phaser from "phaser";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import fonGorizUrl from "../../assets/background/fon_goriz.png";
import fonVertUrl from "../../assets/background/fon_vert.png";
import { Step2UiManager } from "./Step2UiManager";

const CONFIG = { BASE_W: 460, BASE_VERT_H: 960, BASE_HORIZ_H: 840, PADDING: 0.9 };

export class Step2Scene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() {
    super({ key: "Step2Scene" });
  }

  private syncStore(): void {
    const store = useRegistrationStep2Store.getState();
    store.setPhaserScene(this);
    store.clearErrors();
    store.checkSavedDevicePhone(() => this.triggerResize());
  }

  public init(): void {
    const container = document.getElementById("game-container");
    if (container) {
      container.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach(el => el.remove());
    }
  }

  public preload(): void {
    if (!this.textures.exists("step2_bg_fon_goriz")) this.load.image("step2_bg_fon_goriz", fonGorizUrl);
    if (!this.textures.exists("step2_bg_fon_vert")) this.load.image("step2_bg_fon_vert", fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const w = Number(this.scale.width), h = Number(this.scale.height);
    this.currentOrientation = h > w ? "vert" : "goriz";
    this.backgroundIm = this.add.image(w / 2, h / 2, `step2_bg_fon_${this.currentOrientation}`).setOrigin(0.5).setDepth(-2);

    this.mountReactUI();
    if (w && h) this.executeResizeLogic(w, h);
    this.syncStore();

    this.scale.on("resize", this.triggerResize, this);
    this.sys.events.on("wake", this.handleWake, this).on("sleep", this.handleSleep, this)
      .once("shutdown", this.cleanUp, this).once("destroy", this.cleanUp, this);

    registerSceneEvent(this, "step2_scene_start", this.handleExternalStart.bind(this));
    registerSceneEvent(this, "step2_scene_stop", this.handleExternalStop.bind(this));

    this.triggerResize();
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
    if (this.sys.isActive() && this.scale?.width && this.scale?.height) {
      this.executeResizeLogic(Number(this.scale.width), Number(this.scale.height));
    }
  }

  private handleExternalStart(): void {
    this.scene.start();
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
      const texture = `step2_bg_fon_${nextOrient}`;
      if (this.textures.exists(texture)) {
        this.tweens.killTweensOf(this.backgroundIm);
        this.backgroundIm.setAlpha(1).setTexture(texture);
      }
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const aspect = w / h;
    let computedScale = 1;

    if (isVert) {
      const scaleX = w / CONFIG.BASE_W;
      computedScale = aspect >= 0.7 ? scaleX * 0.75 : aspect > 0.6 ? scaleX : aspect < 0.48 ? scaleX * 0.92 : scaleX * 0.96;
      if (h < 700) computedScale *= 0.93;
      computedScale = Math.max(0.42, Math.min(1.3, computedScale));
    } else {
      const scaleX = (w * CONFIG.PADDING) / CONFIG.BASE_W;
      const scaleY = (h * CONFIG.PADDING) / CONFIG.BASE_HORIZ_H;
      computedScale = Math.min(scaleX, scaleY);
      if (aspect < 1.45) computedScale = Math.min(scaleX * 0.92, scaleY * 0.95);
      computedScale = Math.max(0.3, Math.min(1.25, computedScale));
    }

    const viewW = w / computedScale;
    const screenMode = isVert ? (viewW < 750 ? "fold" : "mobile") : aspect < 1.6 ? "tablet" : "desktop";

    useRegistrationStep2Store.getState().setLayout({ screenMode, viewW, scale: computedScale, isVert }, computedScale);
    this.events.emit("phaser_scene_resize", { width: w, height: h, isVert });
  }

  private handleWake(): void {
    this.mountReactUI();
    this.syncStore();
  }

  private handleSleep(): void {
    useRegistrationStep2Store.getState().resetStore();
    if (this.uiContainer) this.uiContainer.style.opacity = "0";
    this.tweens.add({
      targets: this.backgroundIm,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        try { this.reactRoot?.unmount(); } catch (_) {}
        this.uiContainer?.remove();
        this.reactRoot = this.uiContainer = null;
      }
    });
  }

  private cleanUp(): void {
    useRegistrationStep2Store.getState().resetStore();
    this.scale.off("resize", this.triggerResize, this);
    this.sys.events.off("wake", this.handleWake, this).off("sleep", this.handleSleep, this);
    this.tweens.killTweensOf(this.backgroundIm);
    try { this.reactRoot?.unmount(); } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
