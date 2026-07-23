import { CatchGameScene } from '../CatchGameScene';
import gamePetWebm from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import gamePetMov from '/src/assets/resources/1stpet-animation/prostoi-converted.mov';

export class CatchGamePet {
  public element: HTMLDivElement | null = null;
  private videoEl: HTMLVideoElement | null = null;
  public x = 0; public y = 0; public width = 160; public height = 160;

  constructor(private scene: CatchGameScene) {}

  public create(): void {
    this.destroy();
    const container = document.getElementById('game-container');
    if (!container) return;

    const m = this.scene.uiManager.metrics;
    this.width = m.petSize; this.height = m.petSize; this.y = m.petTopPx; this.x = m.screenWidth / 2;

    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.videoEl = document.createElement('video');
    this.videoEl.src = isIOS ? gamePetMov : gamePetWebm;
    Object.assign(this.videoEl, { muted: true, playsInline: true, autoplay: true, loop: true });
    Object.assign(this.videoEl.style, { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', filter: 'contrast(110%) brightness(105%)', position: 'relative', zIndex: '10', backgroundColor: 'transparent' });

    this.element = document.createElement('div');
    this.element.id = 'catch-raw-html-pet';
    Object.assign(this.element.style, { position: 'absolute', left: `${this.x}px`, top: `${this.y}px`, width: `${this.width}px`, height: `${this.height}px`, transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '50%', pointerEvents: 'none', zIndex: '35' });

    this.element.appendChild(this.videoEl);
    container.appendChild(this.element);
  }

  public updatePosition(targetX: number): void {
    const m = this.scene.uiManager.metrics;
    const half = this.width / 2;
    this.x = Math.max(half, Math.min(m.screenWidth - half, targetX));
    if (this.element) this.element.style.left = `${this.x}px`;
  }

  public resize(relativeX: number): void {
    const m = this.scene.uiManager.metrics;
    this.width = m.petSize; this.height = m.petSize; this.y = m.petTopPx;
    const half = this.width / 2;
    this.x = Math.max(half, Math.min(m.screenWidth - half, relativeX * m.screenWidth));

    if (this.element) {
      Object.assign(this.element.style, { left: `${this.x}px`, top: `${this.y}px`, width: `${this.width}px`, height: `${this.height}px` });
    }
  }

  public pause(): void { this.videoEl?.pause(); }
  public hide(): void { if (this.element) this.element.style.display = 'none'; }
  public destroy(): void { this.element?.remove(); this.videoEl?.remove(); this.element = null; this.videoEl = null; }
}
