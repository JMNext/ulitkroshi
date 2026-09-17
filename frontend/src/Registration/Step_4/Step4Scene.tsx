import Phaser from "phaser";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import fonGorizUrl from "../../assets/background/fon_goriz.png";
import fonVertUrl from "../../assets/background/fon_vert.png";
import { Step4UiManager } from "./Step4UiManager";
import { useRegistrationStep4Store } from "./store/useRegistrationStep4Store";

const CONFIG = { BASE_W: 540, BASE_H: 960, MIN_SCALE: 0.3, MAX_SCALE: 1.25, PADDING: 0.9 };

export class Step4Scene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() {
    super({ key: "Step4Scene" });
  }

  public init(): void {
    document.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach(el => el.remove());
  }

  public preload(): void {
    this.load.image("step4_bg_fon_goriz", fonGorizUrl);
    this.load.image("step4_bg_fon_vert", fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const width = Number(this.scale.width);
    const height = Number(this.scale.height);

    const initialOrientation = height > width ? "vert" : "goriz";
    this.backgroundIm = this.add.image(width / 2, height / 2, `step4_bg_fon_${initialOrientation}`).setOrigin(0.5).setDepth(-2);
    this.currentOrientation = initialOrientation;

    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    if (width && height) this.executeResizeLogic(width, height);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<Step4UiManager phaserScene={this} />);

    this.scale.on("resize", this.triggerResize, this);
    this.events.on("wake", this.handleWake, this);
    this.events.on("sleep", this.handleSleep, this);
    this.events.once("shutdown", this.cleanUp, this);

    this.triggerResize();
  }

  public triggerResize(): void {
    if (!this.sys.isActive() || !this.scale) return;
    const width = Number(this.scale.width);
    const height = Number(this.scale.height);
    if (width && height) this.executeResizeLogic(width, height);
  }

  private executeResizeLogic(width: number, height: number): void {
    const w = Number(width);
    const h = Number(height);
    const isVert = h > w;
    const nextOrientation = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== nextOrientation) {
      this.currentOrientation = nextOrientation;
      this.backgroundIm.setTexture(`step4_bg_fon_${nextOrientation}`);
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const scaleX = (w * CONFIG.PADDING) / CONFIG.BASE_W;
    const scaleY = (h * CONFIG.PADDING) / CONFIG.BASE_H;
    let computedScale = Math.min(scaleX, scaleY);
    const aspect = w / h;

    if (!isVert && aspect < 1.45) {
      computedScale = Math.min(scaleX * 0.92, scaleY * 0.95);
    } else if (isVert && h < 700) {
      computedScale *= 0.93;
    }
    computedScale = Math.max(CONFIG.MIN_SCALE, Math.min(CONFIG.MAX_SCALE, computedScale));

    const viewW = w / computedScale;
    const screenMode = isVert ? (viewW < 750 ? "fold" : "mobile") : aspect < 1.6 ? "tablet" : "desktop";
    const finalScale = screenMode === "mobile" && h / w > 1.65 ? computedScale * 1.35 : computedScale;

    useRegistrationStep4Store.getState().setLayout({ screenMode, viewW, scale: computedScale, isVert }, finalScale);
    this.events.emit("phaser_scene_resize", { width: w, height: h, isVert });
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
