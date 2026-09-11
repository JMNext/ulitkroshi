import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import Phaser from "phaser";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import fonGorizUrl from "../../assets/background/fon_goriz.png";
import fonVertUrl from "../../assets/background/fon_vert.png";
import { Step1UiManager } from "./Step1UiManager";

const CONFIG = {
  BASE_W: 540,
  BASE_H: 960,
  MIN_SCALE: 0.3,
  MAX_SCALE: 1.25,
  PADDING: 0.9
};

export class Step1Scene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() {
    super({ key: "Step1Scene" });
  }

  public init(): void {
    document.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach((e) => e.remove());
  }

  public preload(): void {
    this.load.image("reg_bg_fon_goriz", fonGorizUrl);
    this.load.image("reg_bg_fon_vert", fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const { width, height } = this.scale;
    this.backgroundIm = this.add
      .image(width / 2, height / 2, "reg_bg_fon_goriz")
      .setOrigin(0.5)
      .setDepth(-2);

    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    if (width > 0 && height > 0) this.executeResizeLogic(width, height);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(React.createElement(Step1UiManager, { phaserScene: this }));

    this.scale.on("resize", this.triggerResize, this);
    this.events.on("wake", this.handleWake, this);
    this.events.on("sleep", this.handleSleep, this);
    this.events.once("shutdown", this.cleanUp, this);

    setTimeout(() => {
      if (this.sys?.isActive()) this.triggerResize();
    }, 0);
  }

  public triggerResize(): void {
    if (!this.sys?.isActive() || !this.scale) return;
    const { width, height } = this.scale;
    if (width && height) this.executeResizeLogic(width, height);
  }

  private executeResizeLogic(width: number, height: number): void {
    const isVert = height > width;
    const nextOrientation = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== nextOrientation) {
      this.currentOrientation = nextOrientation;
      this.backgroundIm.setTexture(`reg_bg_fon_${nextOrientation}`);
    }
    this.backgroundIm.setPosition(width / 2, height / 2).setDisplaySize(width, height);

    const scaleX = (width * CONFIG.PADDING) / CONFIG.BASE_W;
    const scaleY = (height * CONFIG.PADDING) / CONFIG.BASE_H;
    let scale = Math.min(scaleX, scaleY);
    const aspect = width / height;

    if (!isVert && aspect < 1.45) {
      scale = Math.min(scaleX * 0.92, scaleY * 0.95);
    } else if (isVert && height < 700) {
      scale *= 0.93;
    }
    scale = Math.max(CONFIG.MIN_SCALE, Math.min(CONFIG.MAX_SCALE, scale));

    const viewW = width / scale;
    const screenMode = isVert ? (viewW < 750 ? "fold" : "mobile") : aspect < 1.6 ? "tablet" : "desktop";
    const finalScale = screenMode === "mobile" && aspect < 1 / 1.65 ? scale * 1.35 : scale;

    useRegistrationStep1Store.getState().setLayout({ screenMode, viewW, scale, isVert }, finalScale);
    window.dispatchEvent(new CustomEvent("phaser_scene_resize", { detail: { width, height, isVert } }));
  }

  private handleWake(): void {
    this.uiContainer?.classList.remove("hidden");
    this.triggerResize();
  }

  private handleSleep(): void {
    this.uiContainer?.classList.add("hidden");
  }

  private cleanUp(): void {
    this.scale.off("resize", this.triggerResize, this);
    this.events.off("wake", this.handleWake, this);
    this.events.off("sleep", this.handleSleep, this);
    this.reactRoot?.unmount();
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
