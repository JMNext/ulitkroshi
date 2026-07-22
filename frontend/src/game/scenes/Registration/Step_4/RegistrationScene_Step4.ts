import * as Phaser from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Step4UiManager } from './components/Step4UiManager';
import { useRegistrationStep4Store } from './useRegistrationStep4Store';

interface WindowWithMetrika extends Window {
  ym?: (id: number, action: string, target: string, params?: Record<string, unknown>) => void;
}

export class RegistrationScene_Step4 extends Phaser.Scene {
  private root: Root | null = null;
  private uiContainer: HTMLDivElement | null = null;

  constructor() { 
    super('RegistrationScene_Step4'); 
  }

  public create(): void {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    const oldContainer = document.getElementById('phaser-custom-ui-root');
    if (oldContainer) {
      oldContainer.remove();
    }

    this.uiContainer = document.createElement('div');
    this.uiContainer.id = 'phaser-custom-ui-root';
    this.uiContainer.className = 'fixed inset-0 w-full h-full pointer-events-none z-50 transition-opacity duration-500 ease-out';
    document.body.appendChild(this.uiContainer);

    this.root = createRoot(this.uiContainer);
    this.renderUI();

    const win = window as WindowWithMetrika;
    if (typeof window !== 'undefined' && typeof win.ym === 'function') {
      const CID = 12345678;
      win.ym(CID, 'reachGoal', 'onboarding_completed');
      win.ym(CID, 'reachGoal', 'login_success', { type: 'registration_flow' });
    }

    this.events.once('shutdown', this.cleanup, this);
    this.events.once('destroy', this.cleanup, this);
  }

  private cleanup = (): void => {
    this.events.off('shutdown', this.cleanup, this);
    this.events.off('destroy', this.cleanup, this);

    try { 
      this.root?.unmount(); 
    } catch (e) {
      console.error(e);
    }
    this.root = null;

    if (this.uiContainer) {
      this.uiContainer.remove();
      this.uiContainer = null;
    }
    
    useRegistrationStep4Store.getState().resetStore();
  };

  public renderUI(): void {
    if (!this.root) return;
    
    this.root.render(
      React.createElement(Step4UiManager, {
        onPlayComplete: () => this.handlePlayComplete()
      })
    );
  }

  private handlePlayComplete(): void {
    if (this.uiContainer) {
      this.uiContainer.style.opacity = '0';
      this.uiContainer.style.transition = 'opacity 0.5s ease-out';
    }

    const startNext = (): void => {
      this.scene.start('MainScene');
    };
    if (this.cameras && this.cameras.main) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, startNext);
    } else {
      startNext();
    }
  }
}
