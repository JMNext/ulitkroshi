import {
  EAT_SOUND_URL,
  PLAY_SOUND_URL,
  SLEEP_SOUND_URL,
  WASH_SOUND_URL
} from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import Phaser from "phaser";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import fonGorizUrl from "../assets/background/fon_goriz.png";
import fonVertUrl from "../assets/background/fon_vert.png";
import { MainSceneUI } from "./MainSceneUI";

export class MainScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private reactRoot: Root | null = null;

  constructor() {
    super({ key: "MainScene" });
  }

  public init(): void {
    document.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach((e) => e.remove());
  }

  public preload(): void {
    this.load.image("ui_bg_fon_goriz", fonGorizUrl);
    this.load.image("ui_bg_fon_vert", fonVertUrl);
    this.load.audio("pet_sound_eat", EAT_SOUND_URL);
    this.load.audio("pet_sound_play", PLAY_SOUND_URL);
    this.load.audio("pet_sound_wash", WASH_SOUND_URL);
    this.load.audio("pet_sound_sleep", SLEEP_SOUND_URL);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";
    const { width: w, height: h } = this.scale;

    this.backgroundIm = this.add
      .image(w / 2, h / 2, "ui_bg_fon_goriz")
      .setOrigin(0.5)
      .setDepth(-2);

    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    if (w > 0 && h > 0) this.executeResizeLogic(w, h);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(React.createElement(MainSceneUI));

    this.scale.on("resize", this.triggerResize, this);

    const sceneEvents = (this as any).events;
    if (sceneEvents) {
      sceneEvents.on("wake", this.handleWake, this);
      sceneEvents.on("sleep", this.handleSleep, this);
      sceneEvents.once("shutdown", this.cleanUp, this);
    }

    setTimeout(() => {
      if ((this as any).sys?.isActive?.()) this.triggerResize();
    }, 0);
  }

  public triggerResize(): void {
    if (!(this as any).sys?.isActive?.() || !this.scale) return;
    const { width: w, height: h } = this.scale;
    if (w && h) this.executeResizeLogic(w, h);
  }

  private executeResizeLogic(w: number, h: number): void {
    const isVert = h > w;
    const nextOrientation = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== nextOrientation) {
      this.currentOrientation = nextOrientation;
      this.backgroundIm.setTexture(`ui_bg_fon_${nextOrientation}`);
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);

    const ratio = w / h;
    const scale = isVert ? h / 1080 : Math.min(w / 1920, h / 1080);
    const viewW = w / scale;
    const exH = (h / scale - 1080) / 2;

    const screenMode = isVert ? (viewW < 750 ? "fold" : "mobile") : ratio < 1.6 ? "tablet" : "desktop";
    const s = screenMode === "fold" ? Math.max(0.65, viewW / 750) : screenMode === "tablet" ? 0.85 : screenMode === "mobile" ? 1.15 : 1;
    const finalScale = screenMode === "mobile" && h / w > 1.65 ? scale * 1.35 : scale;

    const exHMult = screenMode === "desktop" ? 1 : screenMode === "tablet" ? 0.7 : 0.45;
    const hScale =
      screenMode === "desktop" || screenMode === "tablet" ? Math.min(1.2, Math.max(0.75, viewW / 1400)) : Math.min(1.1, viewW / 480);
    const bScaleV = !isVert
      ? Math.min(1.15, Math.max(0.7, (viewW - 60) / 1080))
      : Math.min(ratio < 0.42 ? 1.1 : ratio < 0.46 ? 1.15 : 1.3, (viewW - 40) / 520);
    const bTopOffset = (!isVert ? 110 : ratio < 0.42 ? 112 : ratio < 0.46 ? 120 : 110) * bScaleV;

    const pScale = isVert
      ? ratio >= 0.6
        ? Math.max(0.88, viewW / 750)
        : ratio < 0.42
          ? 0.65
          : Math.max(0.88, viewW / 750) * 0.9
      : viewW < 720
        ? Math.max(0.88, viewW / 750)
        : 1;
    const pTop = isVert ? (ratio >= 0.6 ? 440 : ratio < 0.42 ? 530 : 490) : 460;

    let sScale = 1,
      sOff = 340,
      sTop = 450;
    if (isVert) {
      sScale = ratio >= 0.6 ? 0.9 : ratio < 0.42 ? 0.64 : ratio < 0.46 ? 0.74 : 0.76;
      sOff =
        ratio >= 0.6
          ? Math.min(viewW / 2 - 80, 275)
          : ratio < 0.42
            ? 158
            : Math.max(viewW / 2 - (ratio < 0.46 ? 78 : 86), ratio < 0.46 ? 170 : 195);
      sTop = ratio >= 0.6 ? 480 : ratio < 0.42 ? 555 : ratio < 0.46 ? 495 : 475;
    } else {
      sScale = screenMode === "tablet" ? 0.9 : screenMode === "fold" ? 0.65 : screenMode === "mobile" ? 0.75 : 1;
      sOff = screenMode === "tablet" ? 295 : screenMode === "fold" ? 158 : screenMode === "mobile" ? 195 : 240 + (viewW - 1920) / 2;
    }

    const foodBottom = isVert ? 165 - exH * 0.3 : 215 - exH * 0.2;
    const foodScale = isVert ? (ratio < 0.45 ? 0.85 : 0.9) : screenMode === "tablet" ? 0.9 : 1;

    const styles = {
      header: {
        top: `${90 - exH * exHMult}px`,
        transform: `translate(-50%, -50%) scale(${hScale})`,
        width: `${viewW * (scale / (scale * hScale || 1))}px`
      },
      sideLeft: {
        left: `calc(50% - ${sOff}px)`,
        top: `${sTop}px`,
        transform: `translate(-50%, -50%) scale(${sScale})`
      },
      sideRight: {
        left: `calc(50% + ${sOff}px)`,
        top: `${sTop}px`,
        transform: `translate(-50%, -50%) scale(${sScale})`
      },
      food: {
        bottom: `${foodBottom}px`,
        transform: `translate(-50%, 0) scale(${foodScale})`
      },
      bottom: {
        left: "50%",
        top: `${1080 + exH - bTopOffset}px`,
        transform: `translate(-50%, -50%) scale(${bScaleV})`
      },
      pet: {
        top: `${pTop}px`,
        transform: `translate(-50%, -50%) scale(${pScale})`
      }
    };

    useMainGameStore.getState().setLayoutData({
      scale,
      finalScale,
      s,
      width: w,
      height: h,
      styles
    });
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

    const sceneEvents = (this as any).events;
    if (sceneEvents) {
      sceneEvents.off("wake", this.handleWake, this);
      sceneEvents.off("sleep", this.handleSleep, this);
    }

    this.reactRoot?.unmount();
    this.uiContainer?.remove();
    this.reactRoot = this.uiContainer = null;
  }
}
