import { isMock } from "@/api/api";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import Phaser from "phaser";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import loadGorizUrl from "../assets/login_assets/load_goriz.png";
import loadVertUrl from "../assets/login_assets/load_vert.png";
import { LoginUiManager } from "./LoginUiManager";
import { useLoginStore } from "./store/useLoginStore";

export class LoginScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private onStepCompleteCallback!: (action: "login" | "register") => void;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() {
    super({ key: "LoginScene" });
  }

  public init(data?: { onStepComplete?: (action: "login" | "register") => void }): void {
    this.onStepCompleteCallback = data?.onStepComplete || (action => {
      this.scene.start(action === "login" ? "Step2Scene" : "Step1Scene", { sessionId: "mock-session-id" });
    });
  }

  public preload(): void {
    this.load.image("login_bg_goriz", loadGorizUrl);
    this.load.image("login_bg_vert", loadVertUrl);
  }

  public create(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        const pendingPhone = localStorage.getItem("login_phone_buffer");
        if (!isMock && pendingPhone && !localStorage.getItem("accessToken")) {
          navigator.sendBeacon("http://localhost:3001/auth/login/cleanup-registration", JSON.stringify({ phone: pendingPhone }));
        }
      });
    }

    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const width = Number(this.scale.width);
    const height = Number(this.scale.height);

    const initialOrientation = height > width ? "vert" : "goriz";
    this.backgroundIm = this.add.image(width / 2, height / 2, `login_bg_${initialOrientation}`).setOrigin(0.5).setDepth(-2);
    this.currentOrientation = initialOrientation;

    this.mountReactUI();

    if (width && height) this.executeResizeLogic(width, height);

    this.scale.on("resize", this.triggerResize, this);
    this.events.on("switch_scene", this.handleSwitchScene, this);

    this.sys.events
      .on("wake", this.handleSceneWake, this)
      .on("sleep", this.handleSceneSleep, this)
      .once("shutdown", this.cleanUp, this);

    registerSceneEvent(this, "login_scene_start", this.handleExternalStart);

    this.triggerResize();
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;

    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<LoginUiManager phaserScene={this} />);
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

  private executeResizeLogic(width: number, height: number): void {
    const w = Number(width);
    const h = Number(height);
    const isVert = h > w;
    const nextOrientation = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== nextOrientation) {
      this.currentOrientation = nextOrientation;
      const nextTexture = `login_bg_${nextOrientation}`;
      if (this.textures.exists(nextTexture)) {
        this.tweens.killTweensOf(this.backgroundIm);
        this.backgroundIm.setAlpha(1).setTexture(nextTexture);
      }
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const scaleX = w / 460;
    const scaleY = h / (isVert ? 780 : 1000);
    const aspect = w / h;

    let scale = Math.min(scaleX, scaleY);
    if (isVert) {
      scale = aspect >= 0.7 ? scaleY * 0.82 : aspect > 0.6 ? scaleX : aspect < 0.48 ? scaleX * 0.92 : scaleX * 0.96;
      if (h < 700) scale *= 0.93;
    } else if (aspect < 1.45) {
      scale = Math.min(scaleX * 0.92, scaleY * 0.95);
    }
    scale = Math.max(0.35, Math.min(1.25, scale));

    const store = useLoginStore.getState();
    store.updateField("width", w);
    store.updateField("height", h);
    store.updateField("scale", scale);
    store.updateField("isVert", isVert);

    this.events.emit("phaser_scene_resize", { width: w, height: h, isVert });
  }

  private handleSwitchScene(action: "login" | "register"): void {
    this.onStepCompleteCallback(action);
  }

  private handleSceneWake(): void {
    this.uiContainer?.classList.remove("hidden");
    this.triggerResize();
  }

  private handleSceneSleep(): void {
    this.uiContainer?.classList.add("hidden");
  }

  private cleanUp(): void {
    this.scale.off("resize", this.triggerResize, this);
    this.events.off("switch_scene", this.handleSwitchScene, this);
    this.sys.events.off("wake", this.handleSceneWake, this).off("sleep", this.handleSceneSleep, this);
    try {
      this.reactRoot?.unmount();
    } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
