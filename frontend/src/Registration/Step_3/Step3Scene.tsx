import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import Phaser from "phaser";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import fonGorizUrl from "../../assets/background/fon_goriz.png";
import fonVertUrl from "../../assets/background/fon_vert.png";
import { Step3UiManager } from "./Step3UiManager";

const CONFIG = { BASE_W: 460, BASE_H: 780 };

export class Step3Scene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  public sessionId: string = "";
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() {
    super({ key: "Step3Scene" });
  }

  public init(data?: { sessionId?: string }): void {
    this.sessionId = data?.sessionId || "";
    document.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach(el => el.remove());
  }

  public preload(): void {
    this.load.image("step3_bg_fon_goriz", fonGorizUrl);
    this.load.image("step3_bg_fon_vert", fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const width = Number(this.scale.width);
    const height = Number(this.scale.height);

    const initialOrientation = height > width ? "vert" : "goriz";
    this.backgroundIm = this.add.image(width / 2, height / 2, `step3_bg_fon_${initialOrientation}`).setOrigin(0.5).setDepth(-2);
    this.currentOrientation = initialOrientation;

    this.mountReactUI();

    if (width && height) this.executeResizeLogic(width, height);

    this.scale.on("resize", this.triggerResize, this);

    this.sys.events
      .on("wake", this.handleWake, this)
      .on("sleep", this.handleSleep, this)
      .once("shutdown", this.cleanUp, this);

    registerSceneEvent(this, "step3_scene_start", this.handleExternalStart);
    registerSceneEvent(this, "step3_scene_stop", this.handleExternalStop);

    this.triggerResize();
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;

    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<Step3UiManager phaserScene={this} sessionId={this.sessionId} />);
  }

  public triggerResize(): void {
    if (!this.sys.isActive() || !this.scale) return;
    const width = Number(this.scale.width);
    const height = Number(this.scale.height);
    if (width && height) this.executeResizeLogic(width, height);
  }

  private handleExternalStart(data?: { sessionId: string }): void {
    this.scene.start("Step3Scene", data);
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
      this.backgroundIm.setTexture(`step3_bg_fon_${nextOrientation}`);
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const scaleX = w / CONFIG.BASE_W;
    const scaleY = h / CONFIG.BASE_H;
    const aspect = w / h;

    let computedScale = Math.min(scaleX, scaleY);
    if (isVert) {
      if (aspect >= 0.7) {
        computedScale = scaleY * 0.95;
      } else {
        computedScale = aspect > 0.6 ? Math.min(scaleY * 0.95, scaleX * 0.95) : aspect < 0.48 ? scaleX * 0.92 : scaleX * 0.96;
      }
    }
    computedScale = Math.max(0.42, Math.min(1.3, computedScale));

    const viewW = w / computedScale;
    const screenMode = isVert ? (viewW < 750 ? "fold" : "mobile") : aspect < 1.6 ? "tablet" : "desktop";

    useRegistrationStep3Store.getState().setLayout({ screenMode, viewW, scale: computedScale, isVert }, computedScale);
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
