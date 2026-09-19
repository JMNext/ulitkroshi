import { isMock } from "@/api/client";
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
    this.onStepCompleteCallback = data?.onStepComplete || (action => this.handleSwitchScene(action));
  }

  public preload(): void {
    if (!this.textures.exists("login_bg_goriz")) this.load.image("login_bg_goriz", loadGorizUrl);
    if (!this.textures.exists("login_bg_vert")) this.load.image("login_bg_vert", loadVertUrl);
  }

  public create(): void {
    if (typeof window !== "undefined") window.addEventListener("beforeunload", this.handleBeforeUnload);
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const w = Number(this.scale.width), h = Number(this.scale.height);
    this.currentOrientation = h > w ? "vert" : "goriz";
    this.backgroundIm = this.add.image(w / 2, h / 2, `login_bg_${this.currentOrientation}`).setOrigin(0.5).setDepth(-2);

    this.mountReactUI();
    if (w && h) this.executeResizeLogic(w, h);

    this.scale.on("resize", this.triggerResize, this);
    this.events.on("switch_scene", this.handleSwitchScene, this);
    this.sys.events.on("wake", this.handleSceneWake, this).on("sleep", this.handleSceneSleep, this)
      .once("shutdown", this.cleanUp, this).once("destroy", this.cleanUp, this);

    registerSceneEvent(this, "login_scene_start", this.handleExternalStart);
    this.triggerResize();
  }

  private handleBeforeUnload = (): void => {
    const phone = localStorage.getItem("login_phone_buffer");
    if (!isMock && phone && !localStorage.getItem("accessToken")) {
      navigator.sendBeacon("http://localhost:3001/auth/login/cleanup-registration", JSON.stringify({ phone }));
    }
  };

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
    if (this.sys.isActive() && this.scale?.width && this.scale?.height) {
      this.executeResizeLogic(Number(this.scale.width), Number(this.scale.height));
    }
  }

  private handleExternalStart(): void {
    this.scene.start();
  }

  private executeResizeLogic(w: number, h: number): void {
    const isVert = h > w;
    const nextOrient = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== nextOrient) {
      this.currentOrientation = nextOrient;
      const texture = `login_bg_${nextOrient}`;
      if (this.textures.exists(texture)) {
        this.tweens.killTweensOf(this.backgroundIm);
        this.backgroundIm.setAlpha(1).setTexture(texture);
      }
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const aspect = w / h;
    let scale = Math.min(w / 460, h / (isVert ? 780 : 1000));
    if (isVert) {
      scale = aspect >= 0.7 ? (h / 780) * 0.82 : aspect > 0.6 ? w / 460 : aspect < 0.48 ? (w / 460) * 0.92 : (w / 460) * 0.96;
      if (h < 700) scale *= 0.93;
    } else if (aspect < 1.45) {
      scale = Math.min((w / 460) * 0.92, (h / 1000) * 0.95);
    }
    scale = Math.max(0.35, Math.min(1.25, scale));

    const store = useLoginStore.getState();
    store.updateField("width", w); store.updateField("height", h);
    store.updateField("scale", scale); store.updateField("isVert", isVert);

    this.events.emit("phaser_scene_resize", { width: w, height: h, isVert });
  }

  private handleSwitchScene(action: "login" | "register"): void {
    if (this.uiContainer) this.uiContainer.style.opacity = "0";
    this.tweens.add({
      targets: this.backgroundIm,
      alpha: 0,
      duration: 200,
      onComplete: () => this.scene.start(action === "login" ? "Step2Scene" : "Step1Scene", { sessionId: "mock-session-id" })
    });
  }

  private handleSceneWake(): void {
    if (this.uiContainer) {
      this.uiContainer.classList.remove("hidden");
      requestAnimationFrame(() => this.uiContainer && (this.uiContainer.style.opacity = "1"));
    }
    this.triggerResize();
  }

  private handleSceneSleep(): void {
    if (this.uiContainer) {
      this.uiContainer.style.opacity = "0";
      this.uiContainer.classList.add("hidden");
    }
  }

  private cleanUp(): void {
    if (typeof window !== "undefined") window.removeEventListener("beforeunload", this.handleBeforeUnload);
    this.scale.off("resize", this.triggerResize, this);
    this.events.off("switch_scene", this.handleSwitchScene, this);
    this.sys.events.off("wake", this.handleSceneWake, this).off("sleep", this.handleSceneSleep, this);
    this.tweens.killTweensOf(this.backgroundIm);
    try { this.reactRoot?.unmount(); } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
