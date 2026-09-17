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
    document.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach(el => el.remove());
  }

  public preload(): void {
    this.load.image("step2_bg_fon_goriz", fonGorizUrl);
    this.load.image("step2_bg_fon_vert", fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const width = Number(this.scale.width);
    const height = Number(this.scale.height);

    const initialOrientation = height > width ? "vert" : "goriz";
    this.backgroundIm = this.add.image(width / 2, height / 2, `step2_bg_fon_${initialOrientation}`).setOrigin(0.5).setDepth(-2);
    this.currentOrientation = initialOrientation;

    this.mountReactUI();

    if (width && height) this.executeResizeLogic(width, height);
    this.syncStore();

    this.scale.on("resize", this.triggerResize, this);

    this.sys.events
      .on("wake", this.handleWake, this)
      .on("sleep", this.handleSleep, this)
      .once("shutdown", this.cleanUp, this);

    registerSceneEvent(this, "step2_scene_start", this.handleExternalStart.bind(this));
    registerSceneEvent(this, "step2_scene_stop", this.handleExternalStop.bind(this));

    this.triggerResize();
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;

    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<Step2UiManager phaserScene={this} />);
  }

  public triggerResize(): void {
    if (!this.sys.isActive() || !this.scale) return;
    const width = Number(this.scale.width);
    const height = Number(this.scale.height);
    if (width && height) this.executeResizeLogic(width, height);
  }

  private handleExternalStart(): void {
    this.scene.start();
  }

  private handleExternalStop(): void {
    if (this.sys.isActive()) {
      this.scene.stop();
    }
  }

  private executeResizeLogic(width: number, height: number): void {
    const w = Number(width);
    const h = Number(height);
    const isVert = h > w;
    const nextOrientation = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== nextOrientation) {
      this.currentOrientation = nextOrientation;
      this.backgroundIm.setTexture(`step2_bg_fon_${nextOrientation}`);
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
    try {
      this.reactRoot?.unmount();
    } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = null;
    this.uiContainer = null;
  }

  private cleanUp(): void {
    this.scale.off("resize", this.triggerResize, this);
    this.sys.events.off("wake", this.handleWake, this).off("sleep", this.handleSleep, this);
    useRegistrationStep2Store.getState().resetStore();
    try {
      this.reactRoot?.unmount();
    } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
