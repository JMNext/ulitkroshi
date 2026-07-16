import Phaser from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RegistrationUI_Step4 } from './RegistrationUI_Step4';
import './RegistrationUI_Step4.css';

export class RegistrationScene_Step4 extends Phaser.Scene {
  private regStep4UiRoot: Root | null = null;

  constructor() { 
    super('RegistrationScene_Step4'); 
  }

  public preload(): void {}

  public create(): void {
    if (this.cameras?.main) {
      this.cameras.main.resetFX();
      this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.setAttribute('data-scene', this.scene.key);
    }

    this.mountUI();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  private mountUI(): void {
    this.unmountUI();
    
    const container = document.createElement('div');
    container.id = 'registration-step4-ui-overlay';
    container.className = 'absolute inset-0 pointer-events-none z-30';
    
    document.getElementById('game-container')?.appendChild(container);

    this.regStep4UiRoot = createRoot(container);
    
    this.regStep4UiRoot.render(
      React.createElement(RegistrationUI_Step4, {
        onPlay: () => this.handlePlayComplete()
      })
    );
  }

  private unmountUI(): void {
    if (this.regStep4UiRoot) {
      this.regStep4UiRoot.unmount();
      this.regStep4UiRoot = null;
    }
    document.getElementById('registration-step4-ui-overlay')?.remove();
  }

  private handlePlayComplete(): void {
    if (this.cameras?.main) {
      this.cameras.main.fadeOut(500, 0, 0, 0).once('camerafadeoutcomplete', () => {
        this.scene.start('MainScene');
      });
    } else {
      this.scene.start('MainScene');
    }
  }

  private handleShutdown(): void {
    this.unmountUI();
  }
}
