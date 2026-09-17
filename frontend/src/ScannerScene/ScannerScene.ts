import Phaser from "phaser";
import NiceModal from "@ebay/nice-modal-react";
import { PetScannerUI } from "@/ScannerScene/PetScannerUI";

export class ScannerScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private currentOrientation: "vert" | "goriz" | null = null;

  constructor() {
    super({ key: "ScannerScene" });
  }

  public create(): void {
    const mainScene = this.scene.get("MainScene");
    if (mainScene) {
      this.scene.sleep("MainScene");
      document.querySelector(".phaser-ui-root-container")?.classList.add("hidden");
    }

    const w = Number(this.scale.width);
    const h = Number(this.scale.height);
    const initialOrientation = h > w ? "vert" : "goriz";
    this.currentOrientation = initialOrientation;

    this.backgroundIm = this.add.image(w / 2, h / 2, `ui_bg_fon_${initialOrientation}`).setOrigin(0.5).setDepth(-2);
    this.backgroundIm.setDisplaySize(w, h);

    this.scale.on("resize", this.triggerResize, this);

    NiceModal.show(PetScannerUI, {
      shouldAutoStartCamera: true,
      onCloseCallback: () => this.handleReturnToGame()
    });
  }

  public triggerResize(): void {
    if (!this.sys.isActive() || !this.scale) return;
    const w = Number(this.scale.width);
    const h = Number(this.scale.height);
    if (!w || !h) return;

    const isVert = h > w;
    const nextOrientation = isVert ? "vert" : "goriz";

    if (this.currentOrientation !== nextOrientation) {
      this.currentOrientation = nextOrientation;
      this.backgroundIm.setTexture(`ui_bg_fon_${nextOrientation}`);
    }
    this.backgroundIm.setPosition(w / 2, h / 2).setDisplaySize(w, h);
  }

  private handleReturnToGame(): void {
    this.scale.off("resize", this.triggerResize, this);
    document.querySelector(".phaser-ui-root-container")?.classList.remove("hidden");
    this.scene.wake("MainScene");
    this.scene.stop("ScannerScene");
  }
}
