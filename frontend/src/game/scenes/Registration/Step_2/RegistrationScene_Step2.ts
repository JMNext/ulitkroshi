import Phaser from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RegistrationUI_Step2 } from './RegistrationUI_Step2';
import './RegistrationUI_Step2.css';

export class RegistrationScene_Step2 extends Phaser.Scene {
  private regStep2UiRoot: Root | null = null;

  constructor() { 
    super('RegistrationScene_Step2'); 
  }

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
    container.id = 'registration-step2-ui-overlay';
    container.className = 'absolute inset-0 pointer-events-none z-30';
    
    document.getElementById('game-container')?.appendChild(container);

    this.regStep2UiRoot = createRoot(container);
    
    this.regStep2UiRoot.render(
      React.createElement(RegistrationUI_Step2, {
        onDone: () => this.completeScene()
      })
    );
  }

  private unmountUI(): void {
    if (this.regStep2UiRoot) {
      this.regStep2UiRoot.unmount();
      this.regStep2UiRoot = null;
    }
    document.getElementById('registration-step2-ui-overlay')?.remove();
  }

  private completeScene(): void {
    if (this.cameras?.main) {
      this.cameras.main.fadeOut(500, 0, 0, 0).once('camerafadeoutcomplete', () => {
        this.scene.start('RegistrationScene_Step3');
      });
    } else {
      this.scene.start('RegistrationScene_Step3');
    }
  }

  private handleShutdown(): void {
    this.unmountUI();
  }
}
