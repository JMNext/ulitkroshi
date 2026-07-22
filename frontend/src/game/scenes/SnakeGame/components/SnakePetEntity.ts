import { Scene } from 'phaser';

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

  public create(videoSrcs: { idle: string; play: string; sad: string }): void {
    this.destroy();

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    this.videoIdle = this.createVideoElement(videoSrcs.idle, true);
    this.videoPlay = this.createVideoElement(videoSrcs.play, false);
    this.videoSad = this.createVideoElement(videoSrcs.sad, false);

    this.videoPlay.onended = () => (this.scene as any).onPetPlayEnded();
    this.videoSad.onended = () => (this.scene as any).onPetSadEnded();

    this.element = document.createElement('div');
    this.element.id = 'snake-html-pet-entity';
    this.element.className = 'absolute inset-0 w-full h-full z-35 overflow-hidden bg-transparent pointer-events-none flex items-center justify-center';

    this.innerWrapper = document.createElement('div');
    this.innerWrapper.style.position = 'relative';

    const petBox = document.createElement('div');
    petBox.id = 'snake-pet-box-target';
    petBox.style.position = 'absolute';
    petBox.style.display = 'flex';
    petBox.style.alignItems = 'center';
    petBox.style.justifyContent = 'center';
    petBox.style.overflow = 'hidden';
    petBox.style.borderRadius = '50%';

    petBox.appendChild(this.videoIdle);
    petBox.appendChild(this.videoPlay);
    petBox.appendChild(this.videoSad);
    
    this.innerWrapper.appendChild(petBox);
    this.element.appendChild(this.innerWrapper);
    gameContainer.appendChild(this.element);

    const isPortrait = window.innerHeight > window.innerWidth;
    this.resize(isPortrait);
    this.setVideoState('idle');
  }

  private createVideoElement(src: string, loop: boolean): HTMLVideoElement {
    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = loop;
    video.loop = loop;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'fill';
    video.style.filter = 'contrast(110%) brightness(105%)';
    video.style.display = 'none';
    return video;
  }

  public setVideoState(state: 'idle' | 'play' | 'sad'): void {
    if (!this.videoIdle || !this.videoPlay || !this.videoSad) return;

    this.videoIdle.style.display = state === 'idle' ? 'block' : 'none';
    this.videoPlay.style.display = state === 'play' ? 'block' : 'none';
    this.videoSad.style.display = state === 'sad' ? 'block' : 'none';

    try {
      if (state === 'idle') {
        this.videoPlay.pause();
        this.videoSad.pause();
        this.videoIdle.play().catch(() => {});
      }
      if (state === 'play') {
        this.videoIdle.pause();
        this.videoSad.pause();
        this.videoPlay.currentTime = 0;
        this.videoPlay.play().catch(() => {});
      }
      if (state === 'sad') {
        this.videoIdle.pause();
        this.videoPlay.pause();
        this.videoSad.currentTime = 0;
        this.videoSad.play().catch(() => {});
      }
    } catch (e) {}
  }

  public resize(isPortrait: boolean): void {
    if (!this.element || !this.innerWrapper) return;

    const petBox = document.getElementById('snake-pet-box-target');
    if (!petBox) return;

    const logicManagerInstance = (this.scene as any).logicManager;

    if (isPortrait) {
      this.innerWrapper.style.width = '100%';
      this.innerWrapper.style.height = '100%';
      this.innerWrapper.style.transform = 'none';
      
      const isSmallScreen = window.innerHeight < 700;
      if (isSmallScreen) {
        this.element.style.display = 'none';
        return;
      }
      
      this.element.style.display = 'flex';

      const portraitPetSize = 160;
      petBox.style.width = `${portraitPetSize}px`;
      petBox.style.height = `${portraitPetSize}px`;
      petBox.style.left = '50%'; 
      petBox.style.transform = 'translateX(-50%)';
      petBox.style.right = 'auto';
      petBox.style.bottom = 'auto';

      if (logicManagerInstance && logicManagerInstance.startY) {
        petBox.style.top = `${logicManagerInstance.startY - portraitPetSize - 15}px`;
      } else {
        petBox.style.top = '105px';
      }
    } else {
      this.element.style.display = 'flex';
      
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isTabOrMob = w < 1300;

      if (isTabOrMob) {
        this.innerWrapper.style.width = '100%';
        this.innerWrapper.style.height = '100%';
        this.innerWrapper.style.transform = 'none';

        const isTablet = (w / h) < 1.75;
        
        const size = isTablet ? 240 : 160;
        petBox.style.width = `${size}px`;
        petBox.style.height = `${size}px`;
        petBox.style.transform = 'translateY(-50%)';
        petBox.style.right = 'auto';
        petBox.style.bottom = 'auto';

        if (logicManagerInstance && logicManagerInstance.startX && logicManagerInstance.startY) {
          const currentGap = isTablet ? 100 : 120;
          const currentTopOffset = isTablet ? 60 : 20;
          const verticalCenterY = logicManagerInstance.startY + (logicManagerInstance.totalGridH / 2);
          
          petBox.style.left = `${logicManagerInstance.startX - (size / 2) - currentGap}px`;
          petBox.style.top = `${verticalCenterY + currentTopOffset}px`;
        }
      } else {
        const scaleX = w / 1920;
        const scaleY = h / 1080;
        const currentScaleFactor = Math.min(scaleX, scaleY, 1);

        this.innerWrapper.style.width = '1920px'; 
        this.innerWrapper.style.height = '1080px';
        this.innerWrapper.style.transform = `scale(${currentScaleFactor})`; 
        this.innerWrapper.style.transformOrigin = 'center center';

        petBox.style.width = '340px'; 
        petBox.style.height = '340px'; 
        petBox.style.transform = 'none';
        petBox.style.top = 'auto';
        petBox.style.right = 'auto';
        petBox.style.bottom = `${60 - 40 + 260}px`; 
        petBox.style.left = '160px'; 
      }
    }
  }

  public destroy(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    const targetElement = document.getElementById('snake-html-pet-entity');
    if (targetElement) {
      targetElement.remove();
    }
    this.innerWrapper = null;
    this.videoIdle = null;
    this.videoPlay = null;
    this.videoSad = null;
  }
}
