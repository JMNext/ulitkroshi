import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import NiceModal from "@ebay/nice-modal-react";
import Phaser from "phaser";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import fonGorizUrl from "../assets/background/fon_goriz.png";
import fonVertUrl from "../assets/background/fon_vert.png";
import { MainSceneUI } from "./MainSceneUI";

const BASE_TRANSFORM = "translate(-50%, -50%)";

export class MainScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() {
    super({ key: "MainScene" });
  }

  public init(): void {
    const container = document.getElementById("game-container");
    if (container) {
      container.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach(el => el.remove());
    }
  }

  public preload(): void {
    if (!this.textures.exists("ui_bg_fon_goriz")) this.load.image("ui_bg_fon_goriz", fonGorizUrl);
    if (!this.textures.exists("ui_bg_fon_vert")) this.load.image("ui_bg_fon_vert", fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const w = Number(this.scale.width), h = Number(this.scale.height);
    this.currentOrientation = h > w ? "vert" : "goriz";
    this.backgroundIm = this.add.image(w / 2, h / 2, `ui_bg_fon_${this.currentOrientation}`).setOrigin(0.5).setDepth(-2);

    this.mountReactUI();
    if (w && h) this.executeResizeLogic(w, h);

    this.scale.on("resize", this.triggerResize, this);
    this.sys.events.on("wake", this.handleSceneWake, this).on("sleep", this.handleSceneSleep, this)
      .once("shutdown", this.cleanUp, this).once("destroy", this.cleanUp, this);

    registerSceneEvent(this, "main_scene_start", this.handleExternalStart);
    registerSceneEvent(this, "main_scene_wake", this.handleExternalWake);
    registerSceneEvent(this, "main_scene_stop", this.handleExternalStop);

    this.events.once("postupdate", () => this.sys.isActive() && this.triggerResize());
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;
    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-0 transition-opacity duration-200";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(
      <NiceModal.Provider>
        <MainSceneUI />
      </NiceModal.Provider>
    );
    requestAnimationFrame(() => this.uiContainer && (this.uiContainer.style.opacity = "1"));
  }

  public triggerResize(): void {
    if (this.sys.isActive() && this.scale?.width && this.scale?.height) {
      this.executeResizeLogic(Number(this.scale.width), Number(this.scale.height));
    }
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

  private handleExternalStart(): void {
    this.scene.start("MainScene");
  }

  private handleExternalWake(): void {
    if (this.sys.isSleeping()) this.scene.wake();
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
    const w = Number(width), h = Number(height), isVert = h > w, ratio = w / h;
    const nextOrient = isVert ? "vert" : "goriz";
    const safeH = h || 1080, safeW = w || 1920;

    if (this.currentOrientation !== nextOrient) {
      this.currentOrientation = nextOrient;
      const texture = `ui_bg_fon_${nextOrient}`;
      if (this.textures.exists(texture)) {
        this.tweens.killTweensOf(this.backgroundIm);
        this.backgroundIm.setAlpha(1).setTexture(texture);
      }
    }
    this.backgroundIm.setPosition(safeW / 2, safeH / 2).setDisplaySize(safeW, safeH);

    const scale = isVert ? safeH / 1080 : Math.min(safeW / 1920, safeH / 1080);
    const viewW = safeW / scale, exH = (safeH / scale - 1080) / 2;
    const screenMode = isVert ? (viewW < 750 ? "fold" : "mobile") : ratio < 1.6 ? "tablet" : "desktop";

    const s = screenMode === "fold" ? Math.max(0.65, viewW / 750) : screenMode === "tablet" ? 0.85 : screenMode === "mobile" ? 1.15 : 1;
    const finalScale = screenMode === "mobile" && safeH / safeW > 1.65 ? scale * 1.35 : scale;

    let exHMult = 0.7, hScale = 1, bScaleV = 1, bTopOffset = 110;
    let pScale = 1, pTop = 460, sScale = 1, sOff = 340, sTop = 450, foodBottom = 175, foodScale = 1, hWidth = viewW;

    if (isVert) {
      exHMult = 0.45; hScale = Math.min(1.1, viewW / 480); hWidth = viewW / (hScale || 1);
      foodBottom = 125 - exH * 0.3; foodScale = ratio < 0.45 ? 0.85 : 0.9;
      if (ratio >= 0.6) {
        bScaleV = Math.min(1.3, (viewW - 40) / 520); bTopOffset = (ratio < 0.42 ? 112 : ratio < 0.46 ? 120 : 110) * bScaleV;
        pScale = Math.max(0.75, (viewW / 750) * 0.85); pTop = 490; sScale = 0.9;
        sOff = Math.min(viewW / 2 - 60 * sScale - 24, Math.min(viewW / 2 - 80, 275)); sTop = 480;
      } else {
        const isLowRatio = ratio < 0.42;
        bScaleV = Math.min(isLowRatio ? 1.1 : ratio < 0.46 ? 1.15 : 1.3, (viewW - 40) / 520);
        bTopOffset = (isLowRatio ? 112 : ratio < 0.46 ? 120 : 110) * bScaleV;
        pScale = isLowRatio ? 0.65 : Math.max(0.88, viewW / 750) * 0.9; pTop = isLowRatio ? 550 : 510;
        sScale = isLowRatio ? 0.64 : ratio < 0.46 ? 0.74 : 0.76;
        sOff = Math.min(viewW / 2 - 60 * sScale - 24, isLowRatio ? 158 : Math.max(viewW / 2 - (ratio < 0.46 ? 78 : 86), ratio < 0.46 ? 170 : 195));
        sTop = isLowRatio ? 555 : ratio < 0.46 ? 495 : 475;
      }
    } else {
      const isTablet = screenMode === "tablet";
      exHMult = !isTablet ? 1 : 0.7; hScale = !isTablet ? Math.min(1.2, Math.max(0.75, viewW / 1400)) : Math.min(1.1, viewW / 480);
      hWidth = (viewW - 120) / (hScale || 1); bScaleV = Math.min(1.15, Math.max(0.7, (viewW - 60) / 1080)); bTopOffset = 110 * bScaleV;
      pScale = viewW < 720 ? Math.max(0.88, viewW / 750) : 1; pTop = isTablet ? 500 : 460;
      if (isTablet) pScale *= 1.01;
      sScale = isTablet ? 0.9 : screenMode === "fold" ? 0.65 : screenMode === "mobile" ? 0.75 : 1;
      sOff = Math.min(410, Math.max(340, viewW * 0.23 + (viewW - 1440) * 0.1)); foodScale = isTablet ? 0.9 : 1;
    }

    useMainGameStore.getState().setLayoutData({
      scale, finalScale, s, width: safeW, height: safeH,
      styles: {
        header: { top: `${90 - exH * exHMult}px`, transform: `${BASE_TRANSFORM} scale(${hScale})`, width: `${hWidth}px` },
        sideLeft: { left: `calc(50% - ${sOff}px)`, top: `${sTop}px`, transform: `${BASE_TRANSFORM} scale(${sScale})` },
        sideRight: { left: `calc(50% + ${sOff}px)`, top: `${sTop}px`, transform: `${BASE_TRANSFORM} scale(${sScale})` },
        food: { bottom: `${foodBottom}px`, transform: `${BASE_TRANSFORM} scale(${foodScale})` },
        bottom: { left: "50%", top: `${1080 + exH - bTopOffset}px`, transform: `${BASE_TRANSFORM} scale(${bScaleV})` },
        pet: { top: `${pTop}px`, transform: `${BASE_TRANSFORM} scale(${pScale})` }
      }
    });
  }

  private cleanUp(): void {
    this.scale.off("resize", this.triggerResize, this);
    this.sys.events.off("wake", this.handleSceneWake, this).off("sleep", this.handleSceneSleep, this);
    this.tweens.killTweensOf(this.backgroundIm);
    try { this.reactRoot?.unmount(); } catch (_) {}
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
