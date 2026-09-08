import Phaser from 'phaser';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import { Step4UiManager, LayoutContext } from './Step4UiManager';
import fonGorizUrl from '../../assets/background/fon_goriz.png';
import fonVertUrl from '../../assets/background/fon_vert.png';

export class Step4Scene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: 'vert' | 'goriz' | null = null;
  private reactRoot: Root | null = null;

  constructor() { 
    super({ key: 'Step4Scene' }); 
  }

  public init(): void {
    document.querySelectorAll('#phaser-native-step1-bubble, #phaser-native-success-bubble')
      .forEach(el => el.remove());
  }

  public preload(): void {
    this.load.image('step4_bg_fon_goriz', fonGorizUrl);
    this.load.image('step4_bg_fon_vert', fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) {
      this.game.canvas.className = "absolute inset-0 w-full h-full z-1";
    }

    const { width, height } = this.scale;
    const isVertInit = height > width;
    this.currentOrientation = isVertInit ? 'vert' : 'goriz';
    
    this.backgroundIm = this.add.image(width / 2, height / 2, isVertInit ? 'step4_bg_fon_vert' : 'step4_bg_fon_goriz')
      .setOrigin(0.5, 0.5)
      .setDepth(-2);
      
    this.updateBackgroundScale(width, height);

    const gameContainer = document.getElementById("game-container") || document.body;
    this.uiContainer = document.createElement('div');
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    gameContainer.appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);
    this.reactRoot.render(
      React.createElement(Step4UiManager, { phaserScene: this })
    );

    this.scale.on('resize', this.triggerResize, this);
    this.events.on('wake', this.handleWake, this);
    this.events.on("sleep", this.handleSleep, this);
    this.events.once('shutdown', this.cleanUp, this);

    setTimeout(() => {
      if (this.sys?.isActive()) this.triggerResize();
    }, 0);
  }

  public triggerResize(): void {
    if (!this.sys?.isActive() || !this.scale) return;
    const { width, height } = this.scale;
    if (width === 0 || height === 0) return;

    const isVert = height > width;
    const nextOrientation = isVert ? 'vert' : 'goriz';

    if (this.currentOrientation !== nextOrientation) {
      this.currentOrientation = nextOrientation;
      this.backgroundIm.setTexture(isVert ? 'step4_bg_fon_vert' : 'step4_bg_fon_goriz');
    }
    
    this.updateBackgroundScale(width, height);

    const scaleToFitWidth = (width - width * 0.1) / 540;
    const scaleToFitHeight = (height - height * 0.1) / 960;

    let computedScale = Math.min(scaleToFitWidth, scaleToFitHeight);
    const aspect = width / height;

    if (!isVert && aspect < 1.45) {
      computedScale = Math.min(scaleToFitWidth * 0.92, scaleToFitHeight * 0.95);
    }
    if (isVert && height < 700) {
      computedScale *= 0.93;
    }
    computedScale = Math.max(0.30, Math.min(1.25, computedScale));

    const viewW = width / computedScale;
    const screenMode: 'fold' | 'mobile' | 'tablet' | 'desktop' = isVert 
      ? (viewW < 750 ? 'fold' : 'mobile') 
      : (aspect < 1.6 ? 'tablet' : 'desktop');

    const finalScale = screenMode === 'mobile' && height / width > 1.65 ? computedScale * 1.35 : computedScale;
    const layoutContext: LayoutContext = { screenMode, viewW, scale: computedScale, isVert };

    window.dispatchEvent(new CustomEvent('step4_layout_update', { 
      detail: { layoutContext, finalScale } 
    }));
    window.dispatchEvent(new CustomEvent('phaser_scene_resize', { detail: { width, height, isVert } }));
  }

  private updateBackgroundScale(width: number, height: number): void {
    if (!this.backgroundIm) return;
    this.backgroundIm.setPosition(width / 2, height / 2).setDisplaySize(width, height);
  }

  private handleWake(): void { 
    this.uiContainer?.classList.remove("hidden"); 
    this.triggerResize(); 
  }
  
  private handleSleep(): void { 
    this.uiContainer?.classList.add("hidden"); 
  }

  private cleanUp(): void {
    this.scale.off('resize', this.triggerResize, this);
    this.events.off('wake', this.handleWake, this);
    this.events.off('sleep', this.handleSleep, this);
    
    this.reactRoot?.unmount();
    this.reactRoot = null;

    if (this.uiContainer?.parentElement) {
      this.uiContainer.parentElement.removeChild(this.uiContainer);
      this.uiContainer = null;
    }
  }
}
