import Phaser from "phaser";
import NiceModal from "@ebay/nice-modal-react";
import { PetScannerUI } from "@/ScannerScene/PetScannerUI";
import { EventBus } from "@/eventbus/EventBus";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";

export class ScannerScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private currentOrientation: "vert" | "goriz" | null = null;
  private cameraTexture: Phaser.Textures.CanvasTexture | null = null;
  private cameraVideoElement: HTMLVideoElement | null = null;
  private updateTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super({ key: "ScannerScene" });
  }

  public create(): void {
    const w = Number(this.scale.width);
    const h = Number(this.scale.height);
    const initialOrientation = h > w ? "vert" : "goriz";
    this.currentOrientation = initialOrientation;

    this.backgroundIm = this.add.image(w / 2, h / 2, `ui_bg_fon_${initialOrientation}`).setOrigin(0.5).setDepth(-2);
    this.backgroundIm.setDisplaySize(w, h);

    this.scale.on("resize", this.triggerResize, this);

    this.sys.events.once("shutdown", this.cleanUp, this);

    registerSceneEvent(this, "scanner_scene_start", this.handleExternalStart);
    registerSceneEvent(this, "scanner_scene_stop", this.handleExternalStop);

    NiceModal.show(PetScannerUI, {
      shouldAutoStartCamera: true,
      onCloseCallback: () => this.handleReturnToGame()
    });

    this.time.delayedCall(600, () => this.tryBindCameraStream());
  }

  private tryBindCameraStream(): void {
    if (!this.sys.isActive()) return;

    const videoEl = document.querySelector("#add-pet-qr-container video") as HTMLVideoElement;
    if (!videoEl) {
      this.updateTimer = this.time.delayedCall(300, () => this.tryBindCameraStream());
      return;
    }

    this.cameraVideoElement = videoEl;
    const textureKey = "live_camera_stream";

    if (this.textures.exists(textureKey)) {
      this.textures.remove(textureKey);
    }

    this.cameraTexture = this.textures.createCanvas(textureKey, videoEl.videoWidth || 640, videoEl.videoHeight || 480);
    if (this.cameraTexture) {
      this.backgroundIm.setTexture(textureKey);
      this.triggerResize();
    }
  }

  public update(): void {
    if (this.cameraTexture && this.cameraVideoElement && !this.cameraVideoElement.paused) {
      this.cameraTexture.context.drawImage(this.cameraVideoElement, 0, 0, this.cameraTexture.width, this.cameraTexture.height);
      this.cameraTexture.refresh();
    }
  }

  public triggerResize(): void {
    if (!this.sys.isActive() || !this.scale) return;
    const w = Number(this.scale.width);
    const h = Number(this.scale.height);
    if (!w || !h) return;

    const isVert = h > w;
    const nextOrientation = isVert ? "vert" : "goriz";

    if (this.cameraTexture) {
      const frameW = this.cameraTexture.width;
      const frameH = this.cameraTexture.height;
      const scale = Math.max(w / frameW, h / frameH);
      this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(frameW * scale, frameH * scale);
    } else {
      if (this.currentOrientation !== nextOrientation) {
        this.currentOrientation = nextOrientation;
        this.backgroundIm.setTexture(`ui_bg_fon_${nextOrientation}`);
      }
      this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);
    }
  }

  private handleExternalStart(): void {
    this.scene.start();
  }

  private handleExternalStop(): void {
    if (this.sys.isActive()) {
      this.scene.stop();
    }
  }

  private handleReturnToGame(): void {
    EventBus.emit("main_scene_wake");
    EventBus.emit("scanner_scene_stop");
  }

  private cleanUp(): void {
    this.scale.off("resize", this.triggerResize, this);
    this.updateTimer?.destroy();
    if (this.cameraTexture) {
      this.textures.remove("live_camera_stream");
    }
    this.cameraTexture = null;
    this.cameraVideoElement = null;
  }
}
