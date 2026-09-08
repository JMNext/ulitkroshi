import Phaser from "phaser";
import { createRoot, Root } from "react-dom/client";
import React from "react";
import { MainSceneUI } from "./MainSceneUI";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import fonGorizUrl from "../assets/background/fon_goriz.png";
import fonVertUrl from "../assets/background/fon_vert.png";

export class MainScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private reactRoot: Root | null = null;

  constructor() { super({ key: "MainScene" }); }

  public init(): void { 
    document.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble").forEach(e => e.remove()); 
  }
  public preload(): void { 
    this.load.image("ui_bg_fon_goriz", fonGorizUrl); 
    this.load.image("ui_bg_fon_vert", fonVertUrl); 
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";
    const { width: w, height: h } = this.scale;
    const isVert = h > w;
    
    useMainGameStore.getState().setDimensions(w, h);

    this.backgroundIm = this.add.image(w / 2, h / 2, isVert ? "ui_bg_fon_vert" : "ui_bg_fon_goriz").setOrigin(0.5).setDepth(-2).setDisplaySize(w, h);
    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(React.createElement(MainSceneUI));

    this.scale.on("resize", this.triggerResize, this);
    this.events.on("wake", this.handleWake, this);
    this.events.on("sleep", this.handleSleep, this);
    this.events.once("shutdown", this.cleanUp, this);
    
    if (this.sys?.isActive()) {
      this.triggerResize();
    }
  }

  public triggerResize(): void {
    if (!this.sys?.isActive() || !this.scale) return;
    const { width: w, height: h } = this.scale;
    if (w === 0 || h === 0) return;

    const isVert = h > w;

    this.backgroundIm.setTexture(isVert ? "ui_bg_fon_vert" : "ui_bg_fon_goriz").setPosition(w / 2, h / 2).setDisplaySize(w, h);
    useMainGameStore.getState().setDimensions(w, h);
    window.dispatchEvent(new CustomEvent("phaser_scene_resize", { detail: { width: w, height: h, isVert } }));
  }

  private handleWake(): void { this.uiContainer?.classList.remove("hidden"); this.triggerResize(); }
  private handleSleep(): void { this.uiContainer?.classList.add("hidden"); }
  private cleanUp(): void { 
    this.scale.off("resize", this.triggerResize, this); this.events.off("wake", this.handleWake, this); this.events.off("sleep", this.handleSleep, this); 
    this.reactRoot?.unmount();
    this.reactRoot = null;
    this.uiContainer?.remove(); 
  }
}
