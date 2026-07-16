import Phaser from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RegistrationUI_Step1 } from './RegistrationUI_Step1';
import './RegistrationUI_Step1.css';

export class RegistrationScene_Step1 extends Phaser.Scene {
  private regUiRoot: Root | null = null;

  constructor() {
    super('RegistrationScene_Step1');
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
    container.id = 'registration-step1-ui-overlay';
    container.className = 'absolute inset-0 pointer-events-none z-30';

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    
    gameContainer.appendChild(container);

    this.regUiRoot = createRoot(container);
    this.regUiRoot.render(
      React.createElement(RegistrationUI_Step1, {
        onDone: () => this.handleDoneComplete()
      })
    );
  }

  private unmountUI(): void {
    if (this.regUiRoot) {
      this.regUiRoot.unmount();
      this.regUiRoot = null;
    }
    document.getElementById('registration-step1-ui-overlay')?.remove();
  }

  private handleDoneComplete(): void {
    if (this.cameras?.main) {
      this.cameras.main.fadeOut(500, 0, 0, 0).once('camerafadeoutcomplete', () => {
        this.scene.start('RegistrationScene_Step2');
      });
    } else {
      this.scene.start('RegistrationScene_Step2');
    }
  }

  private handleShutdown(): void {
    this.unmountUI();
  }
}
