import { EventBus } from "@/eventbus/EventBus";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
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
    const container = document.getElementById("game-container");
    if (container) {
      container.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach(el => el.remove());
    }
  }

  public preload(): void {
    if (!this.textures.exists("step4_bg_fon_goriz")) this.load.image("step4_bg_fon_goriz", fonGorizUrl);
    if (!this.textures.exists("step4_bg_fon_vert")) this.load.image("step4_bg_fon_vert", fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const w = Number(this.scale.width), h = Number(this.scale.height);
    this.currentOrientation = h > w ? "vert" : "goriz";
    this.backgroundIm = this.add.image(w / 2, h / 2, `step4_bg_fon_${this.currentOrientation}`).setOrigin(0.5).setDepth(-2);

    this.mountReactUI();
    if (w && h) this.executeResizeLogic(w, h);

    this.scale.on("resize", this.triggerResize, this);
    this.sys.events.on("wake", this.handleWake, this).on("sleep", this.handleSleep, this)
      .once("shutdown", this.cleanUp, this).once("destroy", this.cleanUp, this);

    registerSceneEvent(this, "step4_scene_start", this.handleExternalStart.bind(this));
    registerSceneEvent(this, "step4_scene_stop", this.handleExternalStop.bind(this));

    this.triggerResize();
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;
    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-0 transition-opacity duration-200";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<Step4UiManager phaserScene={this} />);
    requestAnimationFrame(() => this.uiContainer && (this.uiContainer.style.opacity = "1"));
  }

  public triggerResize(): void {
    if (this.sys.isActive() && this.scale?.width && this.scale?.height) {
      this.executeResizeLogic(Number(this.scale.width), Number(this.scale.height));
    }
  }

  private handleExternalStart(data?: { sessionId: string }): void {
    this.scene.start("Step4Scene", data);
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
      const texture = `step4_bg_fon_${nextOrient}`;
      if (this.textures.exists(texture)) {
        this.tweens.killTweensOf(this.backgroundIm);
        this.backgroundIm.setAlpha(1).setTexture(texture);
      }
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
    this.mountReactUI();
    this.triggerResize();
  }

  private handleSleep(): void {
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
    this.scale.off("resize", this.triggerResize, this);
    this.sys.events.off("wake", this.handleWake, this).off("sleep", this.handleSleep, this);
    this.tweens.killTweensOf(this.backgroundIm);
    try { this.reactRoot?.unmount(); } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
