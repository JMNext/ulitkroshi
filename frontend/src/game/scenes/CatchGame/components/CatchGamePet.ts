import { Scene } from 'phaser';

// Прямой импорт файлов для игры ловилок
import gamePetWebm from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import gamePetMov from '/src/assets/resources/1stpet-animation/prostoi-converted.mov';

export class CatchGamePet {
  private scene: Scene;
  public element: HTMLDivElement | null = null;
  private videoEl: HTMLVideoElement | null = null;

  public x = 0;
  public y = 0;
  public width = 160;
  public height = 160;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public create(isPortrait: boolean): void {
    this.destroy();

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    this.width = isPortrait ? 160 : 240;
    this.height = isPortrait ? 160 : 240;
    this.x = window.innerWidth / 2;
    this.y = isPortrait ? window.innerHeight - 110 : window.innerHeight - 150;

    this.videoEl = document.createElement('video');
    // Используем жестко импортированные ресурсы
    this.videoEl.src = isIOS ? gamePetMov : gamePetWebm;
    Object.assign(this.videoEl, { muted: true, playsInline: true, autoplay: true, loop: true });
    Object.assign(this.videoEl.style, {
      width: '100%', height: '100%', objectFit: 'fill', borderRadius: '50%',
      filter: 'contrast(110%) brightness(105%)', position: 'relative', zIndex: '10'
    });

    this.element = document.createElement('div');
    this.element.id = 'catch-raw-html-pet';
    Object.assign(this.element.style, {
      position: 'absolute', left: `${this.x}px`, top: `${this.y}px`,
      width: `${this.width}px`, height: `${this.height}px`,
      transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', overflow: 'hidden', borderRadius: '50%',
      pointerEvents: 'none', zIndex: '35'
    });

    this.element.appendChild(this.videoEl);
    gameContainer.appendChild(this.element);
  }

  public updatePosition(targetX: number): void {
    const halfWidth = this.width / 2;
    this.x = Math.max(halfWidth, Math.min(window.innerWidth - halfWidth, targetX));
    if (this.element) this.element.style.left = `${this.x}px`;
  }

  public resize(width: number, height: number, isPortrait: boolean): void {
    this.width = isPortrait ? 160 : 240;
    this.height = isPortrait ? 160 : 240;
    this.y = isPortrait ? height - 110 : height - 150;
    this.x = Math.max(this.width / 2, Math.min(width - this.width / 2, this.x));

    if (this.element) {
      Object.assign(this.element.style, {
        left: `${this.x}px`, top: `${this.y}px`,
        width: `${this.width}px`, height: `${this.height}px`
      });
    }
  }

  public pause(): void {
    this.videoEl?.pause();
  }

  public hide(): void {
    if (this.element) this.element.style.display = 'none';
  }

  public destroy(): void {
    this.element?.remove();
    this.videoEl?.remove();
    this.element = this.videoEl = null;
  }
}
