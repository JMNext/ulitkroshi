import * as Phaser from 'phaser';
import { Scene as PhaserScene } from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Step2UiManager } from './components/Step2UiManager';
import { useRegistrationStep2Store } from './useRegistrationStep2Store';

export class RegistrationScene_Step2 extends PhaserScene {
  private root: Root | null = null;
  private uiContainer: HTMLDivElement | null = null;
  private handleKeyDownBound: ((e: KeyboardEvent) => void) | null = null;

  constructor() { 
    super('RegistrationScene_Step2'); 
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

    const handleComplete = (sid: string) => this.completeScene(sid);

    this.handleKeyDownBound = (e: KeyboardEvent) => 
      useRegistrationStep2Store.getState().handleKeyboardInput(e.key, handleComplete);
    window.addEventListener('keydown', this.handleKeyDownBound);

    this.renderUI(handleComplete);

    this.events.once('shutdown', this.cleanup, this);
    this.events.once('destroy', this.cleanup, this);
  }

  private cleanup = (): void => {
    this.events.off('shutdown', this.cleanup, this);
    this.events.off('destroy', this.cleanup, this);
    
    this.removeKeyboardListener();

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

    useRegistrationStep2Store.getState().resetStore();
  };

  private removeKeyboardListener(): void {
    if (this.handleKeyDownBound) {
      window.removeEventListener('keydown', this.handleKeyDownBound);
      this.handleKeyDownBound = null;
    }
  }

  public renderUI(onSuccessCode: (sid: string) => void): void {
    if (!this.uiContainer) return;
    
    this.root = createRoot(this.uiContainer);
    this.root.render(
      React.createElement(Step2UiManager, {
        scene: this,
        onComplete: onSuccessCode
      })
    );
  }

  private completeScene(sessionId: string): void {
    this.removeKeyboardListener();

    if (this.uiContainer) {
      this.uiContainer.style.opacity = '0';
      this.uiContainer.style.transition = 'opacity 0.5s ease-out';
    }

    const next = (): void => {
      this.scene.start('RegistrationScene_Step3', { sessionId });
    };

    if (this.cameras && this.cameras.main) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, next);
    } else {
      next();
    }
  }
}
