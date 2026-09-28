import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import Phaser from "phaser";
import { createRoot, Root } from "react-dom/client";
import { PetScannerUI } from "./PetScannerUI";

export class ScannerScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private reactRoot: Root | null = null;
  private currentOrientation: "vert" | "goriz" | null = null;
  private cameraTexture: Phaser.Textures.CanvasTexture | null = null;
  private cameraVideoElement: HTMLVideoElement | null = null;
  private updateTimer: Phaser.Time.TimerEvent | null = null;
  private isLoggedOut = false;

  constructor() { super({ key: "ScannerScene" }); }

  public create(): void {
    this.isLoggedOut = false;
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const w = Number(this.scale.width), h = Number(this.scale.height);
    this.currentOrientation = h > w ? "vert" : "goriz";

    // ИСПРАВЛЕНО: берем дефолтный фон из быстрого глобального кэша "game_bg_"
    this.backgroundIm = this.add.image(w / 2, h / 2, `game_bg_${this.currentOrientation}`).setOrigin(0.5).setDepth(-2).setDisplaySize(w, h);

    this.mountReactUI();

    this.scale.on("resize", this.triggerResize, this);
    this.sys.events.on("wake", this.handleSceneWake, this).on("sleep", this.handleSceneSleep, this).once("shutdown", this.cleanUp, this);
    this.events.on("scanner_close", this.handleReturnToGame, this);

    registerSceneEvent(this, "scanner_scene_start", () => {
      if (this.isLoggedOut) return;
      this.scene.isSleeping("ScannerScene") ? this.scene.wake("ScannerScene") : !this.scene.isActive("ScannerScene") && this.scene.start("ScannerScene");
      this.scene.bringToTop("ScannerScene");
    });
    registerSceneEvent(this, "scanner_scene_stop", () => this.sys.isActive() && this.scene.sleep("ScannerScene"));
    registerSceneEvent(this, "force_logout_to_login", () => { this.isLoggedOut = true; this.cleanUp(); this.scene.stop("ScannerScene"); });

    this.startCameraCheckLoop();
  }

  private mountReactUI(): void {
    if (this.uiContainer) return;
    this.uiContainer = document.createElement("div");
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-auto z-10 overflow-hidden";
    (document.getElementById("game-container") || document.body).appendChild(this.uiContainer);
    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(<PetScannerUI phaserScene={this} shouldAutoStartCamera={true} />);
  }

  private startCameraCheckLoop(): void { this.stopCameraCheckLoop(); this.tryBindCameraStream(); }
  private stopCameraCheckLoop(): void { if (this.updateTimer) { this.updateTimer.destroy(); this.updateTimer = null; } }

  private tryBindCameraStream(): void {
    if (!this.sys.isActive() || this.isLoggedOut) return;
    const videoEl = document.querySelector("#add-pet-qr-container video") as HTMLVideoElement;

    if (!videoEl) { this.updateTimer = this.time.delayedCall(300, () => this.tryBindCameraStream()); return; }

    this.cameraVideoElement = videoEl;
    if (this.textures.exists("live_camera_stream")) this.textures.remove("live_camera_stream");

    this.cameraTexture = this.textures.createCanvas("live_camera_stream", videoEl.videoWidth || 640, videoEl.videoHeight || 480);
    if (this.cameraTexture) { this.backgroundIm.setTexture("live_camera_stream"); this.triggerResize(); }
  }

  public update(): void {
    if (!this.isLoggedOut && this.cameraTexture && this.cameraVideoElement && !this.cameraVideoElement.paused) {
      this.cameraTexture.context.drawImage(this.cameraVideoElement, 0, 0, this.cameraTexture.width, this.cameraTexture.height);
      this.cameraTexture.refresh();
    }
  }

  public triggerResize(): void {
    if (!this.sys.isActive() || !this.scale || this.isLoggedOut) return;
    const w = Number(this.scale.width), h = Number(this.scale.height);
    if (!w || !h) return;

    if (this.cameraTexture) {
      const scale = Math.max(w / this.cameraTexture.width, h / this.cameraTexture.height);
      this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(this.cameraTexture.width * scale, this.cameraTexture.height * scale);
    } else {
      const next = h > w ? "vert" : "goriz";

      // ИСПРАВЛЕНО: ресайз дефолтной текстуры тоже переведен на "game_bg_"
      if (this.currentOrientation !== next) { this.currentOrientation = next; this.backgroundIm.setTexture(`game_bg_${next}`); }
      this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);
    }
  }

  private handleReturnToGame(): void { this.stopCameraCheckLoop(); this.cleanUp(); this.scene.stop("ScannerScene"); this.scene.start("MainScene").bringToTop("MainScene"); }
  private handleSceneWake(): void { if (!this.isLoggedOut) { this.uiContainer?.classList.remove("hidden"); this.triggerResize(); this.startCameraCheckLoop(); } }
  private handleSceneSleep(): void { this.uiContainer?.classList.add("hidden"); this.stopCameraCheckLoop(); }

  private cleanUp(): void {
    this.scale.off("resize", this.triggerResize, this); this.events.off("scanner_close"); this.stopCameraCheckLoop();
    try { this.reactRoot?.unmount(); } catch (_) {}
    this.uiContainer?.remove(); this.reactRoot = this.uiContainer = null;
    if (this.cameraTexture) this.textures.remove("live_camera_stream");
    this.cameraTexture = this.cameraVideoElement = null;
  }
}
