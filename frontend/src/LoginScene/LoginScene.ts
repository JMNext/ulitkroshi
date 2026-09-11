import { gatewayApi, isMock } from "@/api/api";
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
    this.onStepCompleteCallback =
      data?.onStepComplete ||
      ((action) => {
        this.scene.start(action === "login" ? "Step2Scene" : "Step1Scene", { sessionId: "mock-session-id" });
      });
  }

  public preload(): void {
    this.load.image("login_bg_goriz", loadGorizUrl);
    this.load.image("login_bg_vert", loadVertUrl);
  }

  public create(): void {
    if (!isMock) {
      const pendingPhone = localStorage.getItem("login_phone_buffer") || localStorage.getItem("saved_user_phone");
      if (pendingPhone) {
        gatewayApi.post("/auth/login/cleanup-registration", { phone: pendingPhone }).catch(() => {});
        localStorage.removeItem("login_phone_buffer");
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        const pendingPhone = localStorage.getItem("login_phone_buffer");
        if (!isMock && pendingPhone && !localStorage.getItem("accessToken")) {
          navigator.sendBeacon("http://localhost:3001/auth/login/cleanup-registration", JSON.stringify({ phone: pendingPhone }));
        }
      });
    }

    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const { width, height } = this.scale;
    this.backgroundIm = this.add
      .image(width / 2, height / 2, "login_bg_goriz")
      .setOrigin(0.5)
      .setDepth(-2);

    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    if (width > 0 && height > 0) this.executeResizeLogic(width, height);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(React.createElement(LoginUiManager, { phaserScene: this }));

    this.scale.on("resize", this.triggerResize, this);
    this.events.on("switch_scene", this.handleSwitchScene, this);
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
      const nextTexture = `login_bg_${nextOrientation}`;
      if (this.textures.exists(nextTexture)) {
        this.tweens.killTweensOf(this.backgroundIm);
        this.backgroundIm.setAlpha(1).setTexture(nextTexture);
      }
    }
    this.backgroundIm.setPosition(width / 2, height / 2).setDisplaySize(width, height);

    const scaleX = width / 460;
    const scaleY = height / (isVert ? 780 : 1000);
    const aspect = width / height;

    let scale = Math.min(scaleX, scaleY);
    if (isVert) {
      scale = aspect > 0.6 ? scaleX : aspect < 0.48 ? scaleX * 0.92 : scaleX * 0.96;
      if (height < 700) scale *= 0.93;
    } else if (aspect < 1.45) {
      scale = Math.min(scaleX * 0.92, scaleY * 0.95);
    }
    scale = Math.max(0.35, Math.min(1.25, scale));

    const store = useLoginStore.getState();
    store.updateField("width", width);
    store.updateField("height", height);
    store.updateField("scale", scale);
    store.updateField("isVert", isVert);

    window.dispatchEvent(new CustomEvent("phaser_scene_resize", { detail: { width, height, isVert } }));
  }

  private handleSwitchScene(action: "login" | "register"): void {
    this.onStepCompleteCallback(action);
  }

  private cleanUp(): void {
    this.scale.off("resize", this.triggerResize, this);
    this.events.off("switch_scene", this.handleSwitchScene, this);
    this.reactRoot?.unmount();
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
    try {
      useLoginStore.getState().resetStore();
    } catch {}
  }
}
