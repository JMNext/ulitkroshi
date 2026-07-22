// LoginScene.ts
import * as Phaser from 'phaser';
import { Scene as PhaserScene } from 'phaser';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import { LoginUiManager } from './LoginUiManager';

export class LoginScene extends PhaserScene {
  private root: Root | null = null;
  private uiContainer: HTMLDivElement | null = null;

  constructor() { 
    super('LoginScene'); 
  }

  public create(): void {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    const oldContainer = document.getElementById('phaser-login-ui-root');
    if (oldContainer) {
      oldContainer.remove();
    }

    this.uiContainer = document.createElement('div');
    this.uiContainer.id = 'phaser-login-ui-root';
    this.uiContainer.className = 'fixed inset-0 w-full h-full pointer-events-none z-50 transition-opacity duration-300 ease-out';
    document.body.appendChild(this.uiContainer);

    this.root = createRoot(this.uiContainer);
    this.root.render(
      React.createElement(LoginUiManager, {
        scene: this,
        onComplete: () => this.handleLoginComplete()
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
  };

  private handleLoginComplete(): void {
    if (this.uiContainer) {
      this.uiContainer.style.opacity = '0';
      this.uiContainer.style.transition = 'opacity 0.3s ease-out';
    }

    if (this.cameras && this.cameras.main) {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('RegistrationScene_Step1');
      });
    } else {
      this.scene.start('RegistrationScene_Step1');
    }
  }
}
