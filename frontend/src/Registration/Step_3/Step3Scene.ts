import Phaser from 'phaser';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import { Step3UiManager, LayoutContext } from './Step3UiManager';
import fonGorizUrl from '../../assets/background/fon_goriz.png';
import fonVertUrl from '../../assets/background/fon_vert.png';
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";

export class Step3Scene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  public sessionId: string = "";
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: 'vert' | 'goriz' | null = null;
  private reactRoot: Root | null = null;

  constructor() { 
    super({ key: 'Step3Scene' }); 
  }

  public init(data?: { sessionId?: string }): void {
    this.sessionId = data?.sessionId || "";
    document.querySelectorAll('#phaser-native-html-pet, #phaser-native-step1-bubble, #phaser-native-success-bubble')
      .forEach(el => el.remove());
    useRegistrationStep3Store.getState().resetStore(true);
  }

  public preload(): void {
    this.load.image('step3_bg_fon_goriz', fonGorizUrl);
    this.load.image('step3_bg_fon_vert', fonVertUrl);
  }

  public create(): void {
    if (this.game.canvas) {
      this.game.canvas.className = "absolute inset-0 w-full h-full z-1";
    }

    const { width, height } = this.scale;
    const isVertInit = height > width;
    this.currentOrientation = isVertInit ? 'vert' : 'goriz';
    
    this.backgroundIm = this.add.image(width / 2, height / 2, isVertInit ? 'step3_bg_fon_vert' : 'step3_bg_fon_goriz')
      .setOrigin(0.5, 0.5)
      .setDepth(-2);
      
    this.updateBackgroundScale(width, height);

    const gameContainer = document.getElementById("game-container") || document.body;
    this.uiContainer = document.createElement('div');
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    gameContainer.appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);

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
      this.backgroundIm.setTexture(isVert ? 'step3_bg_fon_vert' : 'step3_bg_fon_goriz');
    }
    
    this.updateBackgroundScale(width, height);
    this.renderReactUI(width, height, isVert);

    window.dispatchEvent(new CustomEvent('phaser_scene_resize', { detail: { width, height, isVert } }));
  }

  private renderReactUI(width: number, height: number, isVert: boolean): void {
    if (!this.reactRoot) return;

    const scaleX = width / 460;
    const scaleY = height / 780;
    const aspect = width / height;

    let computedScale = Math.min(scaleX, scaleY);
    if (isVert) {
      computedScale = aspect > 0.6 ? Math.min(scaleY * 0.95, scaleX * 0.95) : aspect < 0.48 ? scaleX * 0.92 : scaleX * 0.96;
    }
    computedScale = Math.max(0.42, Math.min(1.3, computedScale));

    const viewW = width / computedScale;
    const screenMode: 'fold' | 'mobile' | 'tablet' | 'desktop' = isVert 
      ? (viewW < 750 ? 'fold' : 'mobile') 
      : (aspect < 1.6 ? 'tablet' : 'desktop');

    const layoutContext: LayoutContext = { screenMode, viewW, scale: computedScale, isVert };

    this.reactRoot.render(
      React.createElement(Step3UiManager, {
        phaserScene: this,
        sessionId: this.sessionId,
        layoutContext,
        computedScale
      })
    );
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
    
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    if (this.uiContainer?.parentElement) {
      this.uiContainer.parentElement.removeChild(this.uiContainer);
      this.uiContainer = null;
    }
  }
}
