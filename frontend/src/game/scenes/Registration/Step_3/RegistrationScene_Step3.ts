import * as Phaser from 'phaser';
import { Scene as PhaserScene } from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Step3UiManager } from './components/Step3UiManager';
import { useRegistrationStep3Store } from './useRegistrationStep3Store';

export class RegistrationScene_Step3 extends PhaserScene {
  private root: Root | null = null;
  private uiContainer: HTMLDivElement | null = null;

  constructor() { 
    super('RegistrationScene_Step3'); 
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
    this.root.render(
      React.createElement(Step3UiManager, {
        scene: this,
        onComplete: () => this.completeScene(),
        onFullReset: () => this.handleFullReset()
      })
    );

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

    useRegistrationStep3Store.getState().resetStore();
  };

  private handleFullReset(): void {
    useRegistrationStep3Store.setState({ attempts: 0, errorMessage: '' });
    useRegistrationStep3Store.getState().generateNewOrder();
    useRegistrationStep3Store.getState().setCaptchaState([], [], 'select', false);
  }

  private completeScene(): void {
    if (this.uiContainer) {
      this.uiContainer.style.opacity = '0';
      this.uiContainer.style.transition = 'opacity 0.5s ease-out';
    }

    const startNext = (): void => {
      this.scene.start('RegistrationScene_Step4');
    };
    if (this.cameras && this.cameras.main) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, startNext);
    } else {
      startNext();
    }
  }
}
