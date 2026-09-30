import Phaser from "phaser";
import { createRoot, Root } from "react-dom/client";

export abstract class BaseAuthScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  protected uiContainer: HTMLDivElement | null = null;
  protected reactRoot: Root | null = null;
  protected currentOrientation: "vert" | "goriz" | null = null;

  protected abstract getUiComponent(): React.ReactElement;
  protected abstract getBackgroundKey(orientation: "vert" | "goriz"): string;

  protected getResizeConfig() {
    return { BASE_W: 540, BASE_H: 960, MIN: 0.3, MAX: 1.25, PAD: 0.9, MOBILE_SCALE_UP: true };
  }

  public init(data?: any): void {
    document.getElementById("game-container")
      ?.querySelectorAll("#phaser-native-step1-bubble, #phaser-native-success-bubble")
      .forEach((el) => el.remove());
  }

  public preload(): void {}

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const w = Number(this.scale.width), h = Number(this.scale.height);
    this.currentOrientation = h > w ? "vert" : "goriz";

    this.backgroundIm = this.add.image(w / 2, h / 2, this.getBackgroundKey(this.currentOrientation)).setOrigin(0.5).setDepth(this.sys.settings.key === "LoginScene" ? 1 : -2);

    setTimeout(() => {
      this.mountReactUI();
    }, 0);

    if (w && h) this.executeResizeLogic(w, h);

    this.scale.on("resize", this.triggerResize, this);
    this.sys.events
      .on("wake", this.handleWake, this)
      .on("sleep", this.handleSleep, this)
      .once("shutdown", this.cleanUp, this)
      .once("destroy", this.cleanUp, this);

    this.triggerResize();
  }

  protected mountReactUI(): void {
    if (this.uiContainer) return;
    this.uiContainer = document.createElement("div");
    this.uiContainer.style.position = "absolute";
    this.uiContainer.style.inset = "0";
    this.uiContainer.style.opacity = "0";
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-0 transition-opacity duration-200";

    const container = document.getElementById("game-container") || document.body;
    container.appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(this.getUiComponent());

    requestAnimationFrame(() => this.uiContainer && (this.uiContainer.style.opacity = "1"));
  }

  public triggerResize(): void {
    if (this.sys.isActive() && this.scale?.width) {
      this.executeResizeLogic(Number(this.scale.width), Number(this.scale.height));
    }
  }

  protected executeResizeLogic(width: number, height: number): void {
    const w = Number(width), h = Number(height), isVert = h > w, next = isVert ? "vert" : "goriz";
    const conf = this.getResizeConfig();

    if (this.currentOrientation !== next) {
      this.currentOrientation = next;
      const t = this.getBackgroundKey(next);
      if (this.textures.exists(t) && this.backgroundIm?.active) {
        this.tweens.killTweensOf(this.backgroundIm);
        this.backgroundIm.setAlpha(1).setTexture(t);
      }
    }
    if (this.backgroundIm?.active) {
      const bgTex = this.backgroundIm.texture;
      const sourceImg = bgTex?.getSourceImage() as HTMLImageElement | undefined;
      const origW = (sourceImg && sourceImg.width) || (isVert ? 1080 : 1920);
      const origH = (sourceImg && sourceImg.height) || (isVert ? 1920 : 1080);
      const coverScale = Math.max(w / origW, h / origH);
      this.backgroundIm.setScale(coverScale).setPosition(w / 2, h / 2);
    }

    const aspect = w / h;
    let scale = 1;

    if (this.sys.settings.key === "LoginScene") {
      let sc = Math.min(w / 460, h / (isVert ? 780 : 1000));
      if (isVert) {
        sc = aspect >= 0.7 ? (h / 780) * 0.82 : aspect > 0.6 ? w / 460 : aspect < 0.48 ? (w / 460) * 0.92 : (w / 460) * 0.96;
        if (h < 700) sc *= 0.93;
      } else if (aspect < 1.45) {
        sc = Math.min((w / 460) * 0.92, (h / 1000) * 0.95);
      }
      scale = Math.max(0.35, Math.min(1.25, sc));
    } else if (conf.BASE_H === 780) {
      const scaleX = w / conf.BASE_W, scaleY = h / conf.BASE_H;
      scale = Math.min(scaleX, scaleY);
      if (isVert) {
        scale = aspect >= 0.7 ? scaleY * 0.95 : aspect > 0.6 ? Math.min(scaleY * 0.95, scaleX * 0.95) : aspect < 0.48 ? scaleX * 0.92 : scaleX * 0.96;
      }
      scale = Math.max(0.42, Math.min(1.3, scale));
    } else {
      const sX = (w * conf.PAD) / conf.BASE_W, sY = (h * conf.PAD) / conf.BASE_H;
      scale = Math.min(sX, sY);
      if (!isVert && aspect < 1.45) scale = Math.min(sX * 0.92, sY * 0.95);
      else if (isVert && h < 700) scale *= 0.93;
      scale = Math.max(conf.MIN, Math.min(conf.MAX, scale));
    }

    const viewW = w / scale;
    const mode = isVert ? (viewW < 750 ? "fold" : "mobile") : (aspect < 1.6 ? "tablet" : "desktop");
    const finalScale = conf.MOBILE_SCALE_UP && mode === "mobile" && aspect < 1 / 1.65 ? scale * 1.35 : scale;

    this.events.emit("phaser_scene_resize", { width: w, height: h, isVert, scale, viewW, screenMode: mode, finalScale });
  }

  protected handleWake(sys: Phaser.Scenes.Systems, data?: any): void {
    setTimeout(() => this.mountReactUI(), 0);
    this.triggerResize();
  }

  protected handleSleep(): void {
    this.events.emit("phaser_scene_sleep");
    if (this.uiContainer) this.uiContainer.style.opacity = "0";
    this.tweens.add({
      targets: this.backgroundIm, alpha: 0, duration: 200,
      onComplete: () => {
        try { this.reactRoot?.unmount(); } catch (_) {}
        this.uiContainer?.remove(); this.reactRoot = this.uiContainer = null;
      }
    });
  }

  protected cleanUp(): void {
    this.events.emit("phaser_scene_cleanup");
    this.scale.off("resize", this.triggerResize, this);
    this.sys.events.off("wake", this.handleWake, this).off("sleep", this.handleSleep, this);
    if (this.backgroundIm) { this.tweens.killTweensOf(this.backgroundIm); this.backgroundIm.destroy(); }
    try { this.reactRoot?.unmount(); } catch (_) {}
    this.uiContainer?.remove(); this.reactRoot = this.uiContainer = null;
  }
}
