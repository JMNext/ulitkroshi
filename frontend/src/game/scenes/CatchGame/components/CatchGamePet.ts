import { Scene } from 'phaser';

export class CatchGamePet {
  private scene: Scene;
  public element: HTMLDivElement | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private bgBacking: HTMLDivElement | null = null;

  public x = 0;
  public y = 0;
  public width = 160;
  public height = 160;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public create(isPortrait: boolean, videoSrc: string): void {
    this.destroy();

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    // Проверяем, айфон ли это
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    this.width = isPortrait ? 160 : 240;
    this.height = isPortrait ? 160 : 240;
    this.x = window.innerWidth / 2;
    this.y = isPortrait ? window.innerHeight - 110 : window.innerHeight - 150;

    this.bgBacking = document.createElement('div');
    this.bgBacking.style.position = 'absolute';
    this.bgBacking.style.width = '75%';
    this.bgBacking.style.height = '75%';
    this.bgBacking.style.backgroundColor = '#ffffff';
    this.bgBacking.style.borderRadius = '50%';
    this.bgBacking.style.filter = 'blur(6px)';
    this.bgBacking.style.zIndex = '0';
    this.bgBacking.style.pointerEvents = 'none';
    this.bgBacking.style.opacity = '0.95';
    // На Windows скрываем подложку, на iOS — показываем
    this.bgBacking.style.display = isIOS ? 'block' : 'none';

    this.videoEl = document.createElement('video');
    this.videoEl.src = videoSrc;
    this.videoEl.muted = true;
    this.videoEl.playsInline = true;
    this.videoEl.autoplay = true;
    this.videoEl.loop = true;
    this.videoEl.style.width = '100%';
    this.videoEl.style.height = '100%';
    this.videoEl.style.objectFit = 'fill';
    this.videoEl.style.borderRadius = '50%';
    this.videoEl.style.filter = 'contrast(110%) brightness(105%)';
    this.videoEl.style.position = 'relative';
    this.videoEl.style.zIndex = '10';
    // На Windows не применяем смешивание, на iOS — применяем
    if (isIOS) {
      this.videoEl.style.mixBlendMode = 'screen';
    }

    this.element = document.createElement('div');
    this.element.id = 'catch-raw-html-pet';
    this.element.style.position = 'absolute';
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.transform = 'translate(-50%, -50%)';
    this.element.style.display = 'flex';
    this.element.style.alignItems = 'center';
    this.element.style.justifyContent = 'center';
    this.element.style.overflow = isIOS ? 'visible' : 'hidden';
    this.element.style.borderRadius = '50%';
    this.element.style.pointerEvents = 'none';
    this.element.style.zIndex = '35';

    this.element.appendChild(this.bgBacking);
    this.element.appendChild(this.videoEl);
    gameContainer.appendChild(this.element);
  }

  public updatePosition(targetX: number): void {
    const halfWidth = this.width / 2;
    this.x = Math.max(halfWidth, Math.min(window.innerWidth - halfWidth, targetX));
    if (this.element) {
      this.element.style.left = `${this.x}px`;
    }
  }

  public resize(width: number, height: number, isPortrait: boolean): void {
    this.width = isPortrait ? 160 : 240;
    this.height = isPortrait ? 160 : 240;
    this.y = isPortrait ? height - 110 : height - 150;
    
    const halfWidth = this.width / 2;
    this.x = Math.max(halfWidth, Math.min(width - halfWidth, this.x));

    if (this.element) {
      this.element.style.left = `${this.x}px`;
      this.element.style.top = `${this.y}px`;
      this.element.style.width = `${this.width}px`;
      this.element.style.height = `${this.height}px`;
    }
  }

  public pause(): void {
    if (this.videoEl) {
      this.videoEl.pause();
    }
  }

  public hide(): void {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  public destroy(): void {
    if (this.element) { this.element.remove(); this.element = null; }
    if (this.videoEl) { this.videoEl.remove(); this.videoEl = null; }
    if (this.bgBacking) { this.bgBacking.remove(); this.bgBacking = null; }
  }
}
