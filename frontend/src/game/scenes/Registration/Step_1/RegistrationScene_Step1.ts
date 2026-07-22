import * as Phaser from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Step1UiManager } from './components/Step1UiManager';
import { useRegistrationStep1Store } from './useRegistrationStep1Store';

export class RegistrationScene_Step1 extends Phaser.Scene {
  private root: Root | null = null;
  private uiContainer: HTMLDivElement | null = null;

  constructor() {
    super('RegistrationScene_Step1');
  }

  public preload(): void {}

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
      React.createElement(Step1UiManager, { scene: this, onComplete: () => this.completeScene() })
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

    useRegistrationStep1Store.getState().resetStore();
  };

  private completeScene(): void {
    if (this.uiContainer) {
      this.uiContainer.style.opacity = '0';
      this.uiContainer.style.transition = 'opacity 0.5s ease-out';
    }

    const next = (): void => {
      this.scene.start('RegistrationScene_Step2');
    };

    if (this.cameras && this.cameras.main) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, next);
    } else {
      next();
    }
  }
}
