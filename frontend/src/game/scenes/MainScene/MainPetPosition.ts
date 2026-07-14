import Phaser from 'phaser';
import { AnimatedCharacter } from './AnimatedCharacter';
import { MainScene } from './MainScene';
import { renderMainHealthUI } from './PetHealthBar';

export const PET_CONFIG = {
  baseSize: 644,
  defaultKey: 'prostoi1',
  wash: {
    aspectRatio: 1920 / 1076,
    scaleMultiplier: 0.991,
    sourceHeight: 1076,
    getAdaptiveOffset: (uiScale: number) => (644 * (1920 / 1076) * 0.1345) * uiScale
  }
};

export class MainPetPosition {
  private scene: MainScene;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public setupPosition = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isPort = w < h;

    let uiScale = 1.0;
    let targetY = 0;

    if (isPort) {
      const targetPetHeight = h * 0.48;
      uiScale = targetPetHeight / PET_CONFIG.baseSize;
      if (uiScale > 0.85) uiScale = 0.85;
      targetY = (h * 0.45) + ((PET_CONFIG.baseSize * uiScale) / 2);
    } else {
      uiScale = 1.0;
      targetY = (h * 0.38) + ((PET_CONFIG.baseSize * uiScale) / 2);
    }

    const targetX = w / 2;

    if (!this.scene.krosh) {
      this.scene.krosh = new AnimatedCharacter(this.scene, targetX, targetY, PET_CONFIG.defaultKey) as any;
    }

    this.scene.krosh.x = targetX;
    this.scene.krosh.baseY = targetY;

    if (typeof this.scene.krosh.updateCoordinates === 'function') {
      this.scene.krosh.updateCoordinates(targetX, targetY, uiScale);
    }

    this.scalePetVideoCustom(uiScale);
    this.syncHealthBarPositionCustom(uiScale);
  };

  public updateOnResize = (): void => {
    this.setupPosition();
  };

  private syncHealthBarPositionCustom = (uiScale: number): void => {
    if (!this.scene.krosh) return;
    const targetBaseSize = PET_CONFIG.baseSize * uiScale;
    const petTopHeadY = this.scene.krosh.baseY - targetBaseSize;
    const desktopOffset = uiScale === 1.0 ? 50 : 0;
    const finalTopOffset = petTopHeadY + desktopOffset;

    renderMainHealthUI(finalTopOffset, uiScale, (this.scene as any).currentWashState || 'idle', (this.scene as any).currentHp || 100);
  };

  private scalePetVideoCustom = (uiScale: number): void => {
    const krosh = this.scene.krosh;
    if (!krosh || !krosh.anims) return;

    const targetBaseSize = PET_CONFIG.baseSize * uiScale;

    Object.entries(krosh.anims).forEach(([key, vid]: [string, any]) => {
      if (!vid || !vid.scene || !vid.active) return;

      vid.x = krosh.x;
      vid.setOrigin(0.5, 1);

      if (key === 'wash') {
        const fullWashHeight = targetBaseSize * PET_CONFIG.wash.aspectRatio;
        vid.setDisplaySize(targetBaseSize, fullWashHeight);
        vid.y = krosh.baseY + PET_CONFIG.wash.getAdaptiveOffset(uiScale);
        vid.setScale((targetBaseSize / PET_CONFIG.wash.sourceHeight) * PET_CONFIG.wash.scaleMultiplier);
      } else {
        vid.setDisplaySize(targetBaseSize, targetBaseSize);
        vid.y = krosh.baseY;
      }
    });
  };

  public syncHealthBarPosition = (): void => {
    const h = window.innerHeight;
    const isPort = window.innerWidth < h;

    let currentScale = 1.0;
    if (isPort) {
      currentScale = (h * 0.48) / PET_CONFIG.baseSize;
      if (currentScale > 0.85) currentScale = 0.85;
    }

    this.syncHealthBarPositionCustom(currentScale);
  };

  public clear = (): void => {
    if (this.scene.krosh) {
      try { this.scene.krosh.destroy(); } catch (e) {}
      this.scene.krosh = null;
    }
  };
}
