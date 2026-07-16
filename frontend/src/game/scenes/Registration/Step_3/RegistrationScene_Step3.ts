import Phaser from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RegistrationUI_Step3 } from './RegistrationUI_Step3';
import './RegistrationUI_Step3.css';

export class RegistrationScene_Step3 extends Phaser.Scene {
  private regStep3UiRoot: Root | null = null;

  constructor() { 
    super('RegistrationScene_Step3'); 
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
    container.id = 'registration-step3-ui-overlay';
    container.className = 'absolute inset-0 pointer-events-none z-30';
    
    document.getElementById('game-container')?.appendChild(container);

    this.regStep3UiRoot = createRoot(container);
    
    this.regStep3UiRoot.render(
      React.createElement(RegistrationUI_Step3, {
        onDone: () => this.completeScene()
      })
    );
  }

  private unmountUI(): void {
    if (this.regStep3UiRoot) {
      this.regStep3UiRoot.unmount();
      this.regStep3UiRoot = null;
    }
    document.getElementById('registration-step3-ui-overlay')?.remove();
  }

  private completeScene(): void {
    if (this.cameras?.main) {
      this.cameras.main.fadeOut(400, 0, 0, 0).once('camerafadeoutcomplete', () => {
        this.scene.start('RegistrationScene_Step4');
      });
    } else {
      this.scene.start('RegistrationScene_Step4');
    }
  }

  private handleShutdown(): void {
    this.unmountUI();
  }
}
