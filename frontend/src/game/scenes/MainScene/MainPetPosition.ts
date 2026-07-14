import Phaser from 'phaser';

export interface IPetTransform {
  x: number;
  y: number;
  yWashOffset: number;
  uiScale: number;
  baseSize: number;
  targetScaleX: number;
  targetScaleY: number;
  petTopY: number;
}

export const PET_CONFIG = {
  baseSize: 644,
  defaultKey: 'prostoi1',
  animations: {
    wash: { width: 1076, height: 1920, aspectRatio: 1920 / 1076 },
    default: { width: 1080, height: 1080, aspectRatio: 1.0 }
  }
};

export class MainPetPosition {
  private static instance: MainPetPosition | null = null;
  private listeners: Set<(transform: IPetTransform) => void> = new Set();
  private resizeTimeout: number | null = null;
  private currentTransform: IPetTransform | null = null;
  private currentScene: Phaser.Scene | null = null;
  private currentKey = 'prostoi1';

  private constructor() {
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  public static getInstance(scene?: Phaser.Scene): MainPetPosition {
    if (!MainPetPosition.instance) MainPetPosition.instance = new MainPetPosition();
    if (scene) {
      MainPetPosition.instance.currentScene = scene;
      MainPetPosition.instance.recalculate();
    }
    return MainPetPosition.instance;
  }

  public setAnimationKey(k: string): void {
    this.currentKey = k;
    this.recalculate();
    if (this.currentTransform) this.listeners.forEach(cb => cb(this.currentTransform!));
  }

  public subscribe(callback: (transform: IPetTransform) => void): () => void {
    this.listeners.add(callback);
    callback(this.getTransform());
    return () => this.listeners.delete(callback);
  }

  public getTransform(): IPetTransform {
    if (!this.currentTransform) this.recalculate();
    return this.currentTransform!;
  }

  private handleResize = (): void => {
    if (this.resizeTimeout) window.clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout(() => {
      this.recalculate();
      if (this.currentTransform) this.listeners.forEach(cb => cb(this.currentTransform!));
    }, 30);
  };

  private recalculate(): void {
    const scene = this.currentScene;
    const realW = window.innerWidth;
    const realH = window.innerHeight;
    const w = scene?.scale?.width ?? realW;
    const h = scene?.scale?.height ?? realH;
    const isPort = w < h;
    const isLandscapeTablet = !isPort && (w / h) < 1.72;

    let currentScale = 1.0;

    if (isPort) {
      if (realW <= 360) {
        currentScale = (w * 1.1) / PET_CONFIG.baseSize;
      } else if (realW <= 420) {
        currentScale = (w * 0.95) / PET_CONFIG.baseSize;
      } else {
        currentScale = Math.min((w * 0.85) / PET_CONFIG.baseSize, (h * 0.45) / PET_CONFIG.baseSize, 1.25);
      }
    } else if (isLandscapeTablet) {
      const scaleFactor = h < 650 ? 0.62 : 0.68;
      currentScale = Math.min(1.1, (h * scaleFactor) / PET_CONFIG.baseSize);
    } else {
      currentScale = h < 700 ? Math.min(1.0, (h * 0.52) / PET_CONFIG.baseSize) : 1.0;
    }

    const targetBaseSize = PET_CONFIG.baseSize * currentScale;
    
    let targetY = 0;
    if (isPort) {
      targetY = h * (h / w > 2.2 ? 0.71 : 0.73);
    } else if (isLandscapeTablet) {
      const bottomOffset = h < 650 ? 135 : 145;
      targetY = h - bottomOffset;
    } else {
      targetY = h < 700 ? (h - 110) : (210 + PET_CONFIG.baseSize - 180);
    }

    let targetScaleX = 1.0, targetScaleY = 1.0;

    if (this.currentKey === 'wash') {
      targetScaleX = targetScaleY = targetBaseSize / PET_CONFIG.animations.wash.width;
    } else {
      targetScaleX = targetScaleY = targetBaseSize / PET_CONFIG.animations.default.width;
    }

    const visiblePetHeight = 440 * currentScale;

    this.currentTransform = {
      x: w / 2,
      y: targetY,
      yWashOffset: targetY + 65,
      uiScale: currentScale,
      baseSize: PET_CONFIG.baseSize,
      targetScaleX,
      targetScaleY,
      petTopY: targetY - visiblePetHeight
    };
  }

  public destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeTimeout) window.clearTimeout(this.resizeTimeout);
    this.listeners.clear();
    this.currentScene = null;
    MainPetPosition.instance = null;
  }
}
