import Phaser from 'phaser';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import { LoginUiManager } from './LoginUiManager';
import loadGorizUrl from '../assets/login_assets/load_goriz.png';
import loadVertUrl from '../assets/login_assets/load_vert.png';
import { useLoginStore } from './store/useLoginStore';

export class LoginScene extends Phaser.Scene {
  public backgroundIm!: Phaser.GameObjects.Image;
  private onStepCompleteCallback!: (action: "login" | "register") => void;
  private uiContainer: HTMLDivElement | null = null;
  private currentOrientation: 'vert' | 'goriz' | null = null;
  private reactRoot: Root | null = null;

  constructor() { 
    super({ key: 'LoginScene' }); 
  }

  public init(data?: { onStepComplete?: (action: "login" | "register") => void }): void {
    this.onStepCompleteCallback = data?.onStepComplete || ((action) => {
      this.scene.start(action === 'login' ? 'Step3Scene' : 'Step1Scene', { sessionId: 'mock-session-id' });
    });
  }

  public preload(): void {
    this.load.image('login_bg_goriz', loadGorizUrl);
    this.load.image('login_bg_vert', loadVertUrl);
  }

  public create(): void {
    if (this.game.canvas) this.game.canvas.className = "absolute inset-0 w-full h-full z-1";

    const { width, height } = this.scale;
    const isVertInit = height > width;
    this.currentOrientation = isVertInit ? 'vert' : 'goriz';
    
    this.backgroundIm = this.add.image(width / 2, height / 2, isVertInit ? 'login_bg_vert' : 'login_bg_goriz')
      .setOrigin(0.5, 0.5)
      .setDepth(-2);
      
    this.updateBackgroundScale(width, height);

    const container = document.getElementById("game-container") || document.body;
    this.uiContainer = document.createElement('div');
    this.uiContainer.className = "phaser-ui-root-container absolute inset-0 pointer-events-none z-10 overflow-hidden";
    container.appendChild(this.uiContainer);

    this.reactRoot = createRoot(this.uiContainer);

    this.scale.on('resize', this.triggerResize, this);
    this.events.on('switch_scene', this.handleSwitchScene, this);
    this.events.once('shutdown', this.cleanUp, this);

    setTimeout(() => { if (this.sys?.isActive()) this.triggerResize(); }, 0);
  }

  public triggerResize(): void {
    if (!this.sys?.isActive() || !this.scale) return;
    const { width, height } = this.scale;
    if (width === 0 || height === 0) return;

    const isVert = height > width;
    const nextOrientation = isVert ? 'vert' : 'goriz';

    if (this.currentOrientation !== nextOrientation) {
      this.currentOrientation = nextOrientation;
      const nextTexture = isVert ? 'login_bg_vert' : 'login_bg_goriz';

      if (this.textures.exists(nextTexture)) {
        this.tweens.killTweensOf(this.backgroundIm);
        this.backgroundIm.setAlpha(1);
        this.backgroundIm.setTexture(nextTexture);
      }
    }
    
    this.updateBackgroundScale(width, height);
    this.renderReactUI(width, height, isVert);
    window.dispatchEvent(new CustomEvent('phaser_scene_resize', { detail: { width, height, isVert } }));
  }

  private renderReactUI(width: number, height: number, isVert: boolean): void {
    if (!this.reactRoot) return;

    const scaleX = width / 460;
    const scaleY = height / (isVert ? 780 : 1000);
    const aspect = width / height;

    let computedScale = Math.min(scaleX, scaleY);
    if (isVert) {
      computedScale = aspect > 0.6 ? scaleX : aspect < 0.48 ? scaleX * 0.92 : scaleX * 0.96;
      if (height < 700) computedScale *= 0.93;
    } else if (aspect < 1.45) {
      computedScale = Math.min(scaleX * 0.92, scaleY * 0.95);
    }
    computedScale = Math.max(0.35, Math.min(1.25, computedScale));

    this.reactRoot.render(
      React.createElement(LoginUiManager, {
        phaserScene: this,
        scale: computedScale,
        paddingBottom: isVert ? "50px" : "85px"
      })
    );
  }

  private updateBackgroundScale(width: number, height: number): void {
    if (!this.backgroundIm) return;
    this.backgroundIm.setPosition(width / 2, height / 2).setDisplaySize(width, height);
  }

  private handleSwitchScene(action: "login" | "register"): void { 
    this.onStepCompleteCallback(action); 
  }

  private cleanUp(): void {
    this.scale.off('resize', this.triggerResize, this);
    this.events.off('switch_scene', this.handleSwitchScene, this);
    this.reactRoot?.unmount();
    this.reactRoot = null;

    if (this.uiContainer?.parentElement) {
      this.uiContainer.parentElement.removeChild(this.uiContainer);
      this.uiContainer = null;
    }
    try { useLoginStore.getState().resetStore(); } catch {}
  }
}
