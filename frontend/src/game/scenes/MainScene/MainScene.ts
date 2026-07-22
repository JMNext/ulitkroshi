import * as Phaser from 'phaser';
import { Scene as PhaserScene } from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MainUiManager } from './MainUiManager';

export class MainScene extends PhaserScene {
  private root: Root | null = null;
  private uiContainer: HTMLDivElement | null = null;

  constructor() { 
    super('MainScene'); 
  }

  public preload(): void {
    ['eat', 'wash', 'play', 'sleep'].forEach((s: string) => {
      const ext: string = s === 'sleep' ? 'mp3' : 'MP3';
      this.load.audio(s, `/src/assets/resources/sound/${s}.${ext}`);
    });
  }

  public create(): void {
    this.cameras.main.fadeIn(500, 0, 0, 0);

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

    const playCareSound = (act: string): void => {
      try {
        const audioContext = (this.sound as Phaser.Sound.WebAudioSoundManager).context;
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume().then(() => this.sound.play(act, { volume: 0.8 }));
          return;
        }
        this.sound.play(act, { volume: 0.8 });
      } catch (e) {
        console.error('Ошибка воспроизведения звука ухода:', e);
      }
    };

    ['eat', 'wash', 'play'].forEach((act: string) => {
      this.events.on(`care_trigger_${act}`, () => playCareSound(act), this);
    });

    this.events.on('start_minigame_transition', this.handleMinigameStart, this);

    this.events.once('shutdown', this.cleanup, this);
    this.events.once('destroy', this.cleanup, this);
  }

  private handleMinigameStart(data: { key: string; difficulty: string }): void {
    // Вместо stopAll() останавливаем только звуки этой сцены, чтобы не глушить main_theme
    ['eat', 'wash', 'play', 'sleep'].forEach((soundKey) => {
      if (this.sound.get(soundKey)) {
        this.sound.stopByKey(soundKey);
      }
    });

    this.cleanup();
    this.scene.stop();
    this.scene.start(data.key, { difficulty: data.difficulty });
  }

  private cleanup = (): void => {
    this.events.off('start_minigame_transition', this.handleMinigameStart, this);
    this.events.off('shutdown', this.cleanup, this);
    this.events.off('destroy', this.cleanup, this);

    ['eat', 'wash', 'play'].forEach((act: string) => {
      this.events.off(`care_trigger_${act}`);
    });

    try { 
      this.root?.unmount(); 
    } catch (e) {
      console.error('Ошибка при размонтировании React в MainScene:', e);
    }
    this.root = null;

    if (this.uiContainer) {
      this.uiContainer.remove();
      this.uiContainer = null;
    }
  };

  public renderUI(): void {
    if (!this.root) return;

    this.root.render(
      React.createElement(MainUiManager, {
        scene: this
      })
    );
  }

  public completeScene(nextSceneKey: string, data?: Record<string, unknown>): void {
    // Здесь тоже точечно останавливаем звуки ухода взамен stopAll()
    ['eat', 'wash', 'play', 'sleep'].forEach((soundKey) => {
      if (this.sound.get(soundKey)) {
        this.sound.stopByKey(soundKey);
      }
    });
    
    if (this.uiContainer) {
      this.uiContainer.style.opacity = '0';
      this.uiContainer.style.transition = 'opacity 0.5s ease-out';
    }

    const next = (): void => {
      this.scene.start(nextSceneKey, data);
    };
    if (this.cameras && this.cameras.main) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, next);
    } else {
      next();
    }
  }
}
