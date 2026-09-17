import { CatchGameScene } from "@/game/MiniGames/CatchGame/CatchGameScene";
import { CATCH_ASSETS, getCatchResizeMetrics } from "@/game/MiniGames/CatchGame/constants/catchGame.constants";
import { useCatchGameStore } from "@/game/MiniGames/CatchGame/store/useCatchGameStore";
import Phaser from "phaser";

interface CustomCanvasTexture extends Phaser.Textures.CanvasTexture {
  hasAlpha?: boolean;
}

interface WASDKeys {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
}

export class CatchGamePet {
  public width = 230;
  public height = 230;
  public x = 0;
  public y = 0;
  private videoElement: HTMLVideoElement | null = null;
  private textureCanvas: CustomCanvasTexture | null = null;
  private petSprite: Phaser.GameObjects.Sprite | null = null;
  private keyboardCursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasdKeys: WASDKeys | null = null;
  private keyboardSpeed = 0.8;

  constructor(private scene: CatchGameScene) {}

  public create = (): void => {
    this.x = this.scene.scale.width / 2;

    this.videoElement = document.createElement("video");
    Object.assign(this.videoElement, {
      autoplay: true,
      loop: true,
      muted: true,
      playsInline: true
    });
    this.videoElement.setAttribute("webkit-playsinline", "true");
    this.videoElement.style.display = "none";

    const isWebm = this.scene.sys.game.device.video.webm;
    this.videoElement.src = isWebm ? CATCH_ASSETS.video.webm : CATCH_ASSETS.video.mov;
    document.body.appendChild(this.videoElement);

    this.videoElement.play().catch((err) => console.warn(err));

    if (this.scene.textures.exists("pet-video-stream")) {
      this.textureCanvas = this.scene.textures.get("pet-video-stream") as CustomCanvasTexture;
    } else {
      this.textureCanvas = this.scene.textures.createCanvas("pet-video-stream", 256, 256) as CustomCanvasTexture;
    }

    if (this.textureCanvas) {
      this.textureCanvas.hasAlpha = true;
    }

    this.y = this.scene.scale.height - 150;
    this.petSprite = this.scene.add.sprite(this.x, this.y, "pet-video-stream").setOrigin(0.5, 1).setDepth(10);

    this.resize();
    useCatchGameStore.getState().setPetX(this.x);
    this.initControls();
  };

  private initControls = (): void => {
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.clearCaptures();
      this.keyboardCursors = this.scene.input.keyboard.createCursorKeys();
      this.wasdKeys = this.scene.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
      }) as unknown as WASDKeys;
    }
    this.scene.input.on("pointerdown", (p: Phaser.Input.Pointer) => this.updatePosition(p.x));
    this.scene.input.on("pointermove", (p: Phaser.Input.Pointer) => p.isDown && this.updatePosition(p.x));
  };

  public handleKeyboardInput = (): void => {
    if (useCatchGameStore.getState().isGameOver) return;

    const delta = this.scene.game.loop.delta;
    let dir =
      this.keyboardCursors?.left?.isDown || this.wasdKeys?.left?.isDown
        ? -1
        : this.keyboardCursors?.right?.isDown || this.wasdKeys?.right?.isDown
          ? 1
          : 0;

    if (dir !== 0) this.updatePosition(this.x + dir * this.keyboardSpeed * delta);
    else if (this.scene.input.activePointer?.isDown) this.updatePosition(this.scene.input.activePointer.x);

    if (this.videoElement && !this.videoElement.paused && this.videoElement.readyState >= 2 && this.textureCanvas) {
      const ctx = this.textureCanvas.context;
      ctx.clearRect(0, 0, 256, 256);
      this.textureCanvas.hasAlpha = true;
      ctx.drawImage(this.videoElement, 0, 0, 256, 256);
      this.textureCanvas.refresh();
    }
  };

  public updatePosition = (targetX: number): void => {
    const half = this.width / 2;
    this.x = Phaser.Math.Clamp(targetX, half, this.scene.scale.width - half);
    if (this.petSprite) this.petSprite.setPosition(this.x, this.y);
    useCatchGameStore.getState().setPetX(this.x);
  };

  public resize = (): void => {
    if (!this.scene?.scale || !this.petSprite) return;
    const { width: phaserW, height: phaserH } = this.scene.scale;
    const isPortrait = phaserH > phaserW;

    const metrics = getCatchResizeMetrics(phaserW, phaserH, isPortrait);
    const zoom = this.scene.cameras.main.zoom || 1;

    this.width = metrics.petSize;
    this.height = metrics.petSize;
    this.y = phaserH - metrics.bottomOffset / zoom;

    if (this.x > phaserW) this.x = phaserW / 2;

    this.petSprite.setPosition(this.x, this.y).setDisplaySize(this.width / zoom, this.height / zoom);
    this.updatePosition(this.x);
  };

  public pause = (): void => {
    this.videoElement?.pause();
  };

  public hide = (): void => {
    this.petSprite?.setVisible(false);
    this.pause();
  };

  public destroy = (): void => {
    this.scene.input.off("pointerdown");
    this.scene.input.off("pointermove");
    this.petSprite?.destroy();
    this.videoElement?.pause();
    this.videoElement?.remove();
    this.keyboardCursors = null;
    this.wasdKeys = null;
  };
}
