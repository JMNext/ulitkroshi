import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import Phaser from "phaser";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { Step1UiManager } from "./Step1UiManager";
import fonGorizUrl from "../../assets/background/fon_goriz.png";
import fonVertUrl from "../../assets/background/fon_vert.png";

const CONFIG = { BASE_W: 540, BASE_H: 960, MIN_SCALE: 0.3, MAX_SCALE: 1.25, PADDING: 0.9 };

export class Step1Scene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() {
    super({ key: "Step1Scene" });
  }

  public init(): void {
    document.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach(el => el.remove());
  }

  public preload(): void {
    this.load.image("reg_bg_fon_goriz", fonGorizUrl);
    this.load.image("reg_bg_fon_vert", fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const width = Number(this.scale.width);
    const height = Number(this.scale.height);

    const initialOrientation = height > width ? "vert" : "goriz";
    this.backgroundIm = this.add.image(width / 2, height / 2, `reg_bg_fon_${initialOrientation}`).setOrigin(0.5).setDepth(-2);
    this.currentOrientation = initialOrientation;

    this.mountReactUI();

    if (width && height) this.executeResizeLogic(width, height);

    this.scale.on("resize", this.triggerResize, this);

    this.sys.events
      .on("wake", this.handleWake, this)
      .on("sleep", this.handleSleep, this)
      .once("shutdown", this.cleanUp, this);

    registerSceneEvent(this, "step1_scene_start", this.handleExternalStart);
    registerSceneEvent(this, "step1_scene_stop", this.handleExternalStop);

    this.triggerResize();
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;

    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<Step1UiManager phaserScene={this} />);
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
      this.backgroundIm.setTexture(`reg_bg_fon_${nextOrientation}`);
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const scaleX = (w * CONFIG.PADDING) / CONFIG.BASE_W;
    const scaleY = (h * CONFIG.PADDING) / CONFIG.BASE_H;
    let scale = Math.min(scaleX, scaleY);
    const aspect = w / h;

    if (!isVert && aspect < 1.45) {
      scale = Math.min(scaleX * 0.92, scaleY * 0.95);
    } else if (isVert && h < 700) {
      scale *= 0.93;
    }
    scale = Math.max(CONFIG.MIN_SCALE, Math.min(CONFIG.MAX_SCALE, scale));

    const viewW = w / scale;
    const screenMode = isVert ? (viewW < 750 ? "fold" : "mobile") : aspect < 1.6 ? "tablet" : "desktop";
    const finalScale = screenMode === "mobile" && aspect < 1 / 1.65 ? scale * 1.35 : scale;

    useRegistrationStep1Store.getState().setLayout({ screenMode, viewW, scale, isVert }, finalScale);
    this.events.emit("phaser_scene_resize", { width: w, height: h, isVert });
  }

  private handleWake(): void {
    this.mountReactUI();
    this.triggerResize();
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
    try {
      this.reactRoot?.unmount();
    } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
