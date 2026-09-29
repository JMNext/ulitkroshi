import Phaser from "phaser";
import { CatchGameScene } from "../CatchGameScene";
import { useCatchGameStore } from "../store/useCatchGameStore";
import { getSharedGameResizeMetrics } from "@/game/MiniGamesShared/miniGames.constants";

export class CatchGamePet {
  public width = 230; public height = 230; public x = 0; public y = 0;
  private videoElement: HTMLVideoElement | null = null;
  private textureCanvas: any = null; public petSprite: Phaser.GameObjects.Sprite | null = null;
  private speed = 0.8;

  constructor(private scene: CatchGameScene) {}

  public create = (): void => {
    this.x = this.scene.scale.width / 2;
    this.videoElement = document.createElement("video");
    Object.assign(this.videoElement, { autoplay: true, loop: true, muted: true, playsInline: true });
    this.videoElement.setAttribute("webkit-playsinline", "true");
    this.videoElement.style.display = "none";

    const petMov = new URL("@/assets/resources/1stpet-animation/prostoi-converted.mov", import.meta.url).href;
    const petWebm = new URL("@/assets/resources/1stpet-animation/prostoi-converted.webm", import.meta.url).href;
    const isApple = this.scene.sys.game.device.os.iOS || this.scene.sys.game.device.browser.safari;
    this.videoElement.src = isApple ? petMov : (this.scene.sys.game.device.video.webm ? petWebm : petMov);
    document.body.appendChild(this.videoElement);
    this.videoElement.play().catch(() => {});

    this.textureCanvas = this.scene.textures.exists("pet-video-stream") ? this.scene.textures.get("pet-video-stream") : this.scene.textures.createCanvas("pet-video-stream", 256, 256);
    if (this.textureCanvas) this.textureCanvas.hasAlpha = true;

    this.y = this.scene.scale.height - 150;
    this.petSprite = this.scene.add.sprite(this.x, this.y, "pet-video-stream").setOrigin(0.5, 1).setDepth(10);
    this.resize(); useCatchGameStore.getState().setPetX(this.x); this.initControls();
  };

  private initControls = (): void => {
    this.scene.input.on("pointerdown", (p: any) => this.scene.gameState === "PLAYING" && this.updatePosition(p.x));
    this.scene.input.on("pointermove", (p: any) => this.scene.gameState === "PLAYING" && p.isDown && this.updatePosition(p.x));
  };

  public handleKeyboardInput = (): void => {
    if (useCatchGameStore.getState().isGameOver) return;

    const keys = this.scene.inputController.getKeyboardDirections();
    const dir = keys.left ? -1 : keys.right ? 1 : 0;

    if (dir !== 0) this.updatePosition(this.x + dir * this.speed * this.scene.game.loop.delta);
    else if (this.scene.input.activePointer?.isDown && this.scene.gameState === "PLAYING") this.updatePosition(this.scene.input.activePointer.x);

    this.updateVideoOnly();
  };

  public updateVideoOnly = (): void => {
    if (this.videoElement && !this.videoElement.paused && this.videoElement.readyState >= 2 && this.textureCanvas) {
      this.textureCanvas.context.clearRect(0, 0, 256, 256); this.textureCanvas.hasAlpha = true;
      this.textureCanvas.context.drawImage(this.videoElement, 0, 0, 256, 256); this.textureCanvas.refresh();
    }
  };

  public updatePosition = (targetX: number): void => {
    this.x = Phaser.Math.Clamp(targetX, this.width / 2, this.scene.scale.width - this.width / 2);
    if (this.petSprite) this.petSprite.setPosition(this.x, this.y);
    useCatchGameStore.getState().setPetX(this.x);
  };

  public resize = (): void => {
    if (!this.scene?.scale || !this.petSprite) return;
    const w = this.scene.scale.width, h = this.scene.scale.height, z = this.scene.cameras.main.zoom || 1;
    const m = getSharedGameResizeMetrics(w, h, h > w, "catch");
    this.width = this.height = m.petSize || 210; this.y = h - (m.bottomOffset || 50) / z;
    if (this.x > w) this.x = w / 2;
    this.petSprite.setPosition(this.x, this.y).setDisplaySize(this.width / z, this.height / z); this.updatePosition(this.x);
  };

  public pause = (): void => { this.videoElement?.pause(); };
  public hide = (): void => { this.petSprite?.setVisible(false); this.pause(); };

  public destroy = (): void => {
    this.petSprite?.destroy(); this.videoElement?.pause(); this.videoElement?.remove();
  };
}
