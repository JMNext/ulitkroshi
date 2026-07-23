import { Scene } from 'phaser';

// Импортируем все ассеты напрямую для 100% стабильности путей в Vite
import idleWebm from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import idleMov from '/src/assets/resources/1stpet-animation/prostoi-converted.mov';
import playWebm from '/src/assets/resources/1stpet-animation/play-converted.webm';
import playMov from '/src/assets/resources/1stpet-animation/play-converted.mov';
import sadWebm from '/src/assets/resources/1stpet-animation/sad_state.webm';
import sadMov from '/src/assets/resources/1stpet-animation/sad_state.mov';

export class SnakePetEntity {
  private scene: Scene;
  public element: HTMLDivElement | null = null;
  private innerWrapper: HTMLDivElement | null = null;
  private videoIdle: HTMLVideoElement | null = null;
  private videoPlay: HTMLVideoElement | null = null;
  private videoSad: HTMLVideoElement | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public create(): void {
    this.destroy();

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Подставляем импортированные ресурсы напрямую
    this.videoIdle = this.createVideoElement(isIOS ? idleMov : idleWebm, true);
    this.videoPlay = this.createVideoElement(isIOS ? playMov : playWebm, false);
    this.videoSad = this.createVideoElement(isIOS ? sadMov : sadWebm, false);

    this.videoPlay.onended = () => (this.scene as any).onPetPlayEnded();
    this.videoSad.onended = () => (this.scene as any).onPetSadEnded();

    this.element = document.createElement('div');
    this.element.id = 'snake-html-pet-entity';
    this.element.className = 'absolute inset-0 w-full h-full z-35 overflow-hidden bg-transparent pointer-events-none flex items-center justify-center';

    this.innerWrapper = document.createElement('div');
    this.innerWrapper.style.position = 'relative';

    const petBox = document.createElement('div');
    petBox.id = 'snake-pet-box-target';
    Object.assign(petBox.style, { position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '50%' });

    petBox.appendChild(this.videoIdle);
    petBox.appendChild(this.videoPlay);
    petBox.appendChild(this.videoSad);
    
    this.innerWrapper.appendChild(petBox);
    this.element.appendChild(this.innerWrapper);
    gameContainer.appendChild(this.element);

    this.resize(window.innerHeight > window.innerWidth);
    this.setVideoState('idle');
  }

  private createVideoElement(src: string, loop: boolean): HTMLVideoElement {
    const video = document.createElement('video');
    video.src = src;
    Object.assign(video, { muted: true, playsInline: true, autoplay: loop, loop });
    Object.assign(video.style, {
      width: '100%', height: '100%', objectFit: 'fill',
      filter: 'contrast(110%) brightness(105%)', display: 'none',
      position: 'relative', zIndex: '10'
    });
    return video;
  }

  public setVideoState(state: 'idle' | 'play' | 'sad'): void {
    const videos = { idle: this.videoIdle, play: this.videoPlay, sad: this.videoSad };
    if (!videos.idle || !videos.play || !videos.sad) return;

    Object.keys(videos).forEach((key) => {
      const v = videos[key as keyof typeof videos]!;
      v.style.display = key === state ? 'block' : 'none';
      if (key === state) {
        if (key !== 'idle') v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }

  public resize(isPortrait: boolean): void {
    if (!this.element || !this.innerWrapper) return;
    const petBox = document.getElementById('snake-pet-box-target');
    const lm = (this.scene as any).logicManager;
    if (!petBox) return;

    if (isPortrait) {
      Object.assign(this.innerWrapper.style, { width: '100%', height: '100%', transform: 'none' });
      if (window.innerHeight < 700) return void (this.element.style.display = 'none');
      
      this.element.style.display = 'flex';
      Object.assign(petBox.style, {
        width: '160px', height: '160px', left: '50%',
        transform: 'translateX(-50%)', right: 'auto', bottom: 'auto',
        top: lm?.startY ? `${lm.startY - 175}px` : '105px'
      });
    } else {
      this.element.style.display = 'flex';
      const [w, h] = [window.innerWidth, window.innerHeight];

      if (w < 1300) {
        Object.assign(this.innerWrapper.style, { width: '100%', height: '100%', transform: 'none' });
        const isTablet = (w / h) < 1.75;
        const size = isTablet ? 240 : 160;
        
        Object.assign(petBox.style, { width: `${size}px`, height: `${size}px`, transform: 'translateY(-50%)', right: 'auto', bottom: 'auto' });

        if (lm?.startX && lm?.startY) {
          petBox.style.left = `${lm.startX - (size / 2) - (isTablet ? 100 : 120)}px`;
          petBox.style.top = `${lm.startY + (lm.totalGridH / 2) + (isTablet ? 60 : 20)}px`;
        }
      } else {
        const factor = Math.min(w / 1920, h / 1080, 1);
        Object.assign(this.innerWrapper.style, { width: '1920px', height: '1080px', transform: `scale(${factor})`, transformOrigin: 'center center' });
        Object.assign(petBox.style, { width: '340px', height: '340px', transform: 'none', top: 'auto', right: 'auto', bottom: '280px', left: '160px' });
      }
    }
  }

  public destroy(): void {
    this.element?.remove();
    document.getElementById('snake-html-pet-entity')?.remove();
    this.element = this.innerWrapper = this.videoIdle = this.videoPlay = this.videoSad = null;
  }
}
