import Phaser from 'phaser';
import { PET_CONFIG } from './MainPetPosition';

export class AnimatedCharacter {
  public scene: Phaser.Scene;
  public x: number;
  public y: number;
  public baseY: number;
  public currentAnimation: string;
  public isSleeping = false;
  public isTransitioning = false;
  public anims: Record<string, Phaser.GameObjects.Video> = {};
  public idleKeys = ['prostoi1', 'prostoi2'];

  constructor(scene: Phaser.Scene, x: number, y: number, defaultKey: string) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.currentAnimation = defaultKey;
    const animKeys = ['prostoi1', 'prostoi2', 'eat', 'wash', 'play', 'sleep_begin', 'sleep_circle', 'sleep_awake'];

    animKeys.forEach((key) => {
      const isDef = key === defaultKey;
      const vid = scene.add.video(x, y, key)
        .setMute(true)
        .setVisible(isDef)
        .setAlpha(isDef ? 1 : 0)
        .setDepth(isDef ? 4 : 1)
        .setBlendMode(Phaser.BlendModes.NORMAL);

      const nv = vid.video || (vid.videoTexture && vid.videoTexture.source) as HTMLVideoElement | null;
      if (nv) {
        Object.assign(nv, { objectFit: 'fill', preload: 'auto', muted: true, autoplay: isDef });
        nv.style.transform = 'translateZ(0)';
        nv.setAttribute('playsinline', 'true');
        nv.setAttribute('webkit-playsinline', 'true');
        nv.setAttribute('muted', 'true');

        nv.onended = () => {
          if (this.currentAnimation === key && !nv.loop) {
            this.handleAnimationComplete(key);
          }
        };
      }

      vid.setSize(key === 'wash' ? 1076 : 1080, key === 'wash' ? 1920 : 1080).setOrigin(0.5, 1);
      this.anims[key] = vid;

      if (isDef) {
        vid.play(false);
      } else {
        vid.setPaused(true);
        if (nv) {
          try { nv.currentTime = 0.01; } catch (e) {}
        }
      }
    });
  }

  public updateCoordinates = (newX: number, newBaseY: number, uiScale: number): void => {
    this.x = newX;
    this.baseY = newBaseY;

    Object.entries(this.anims).forEach(([key, vid]) => {
      if (!vid) return;
      vid.x = newX;
      vid.y = key === 'wash' ? newBaseY + PET_CONFIG.wash.getAdaptiveOffset(uiScale) : newBaseY;
    });
  };

  public getBounds = (): Phaser.Geom.Rectangle => this.anims[this.currentAnimation]?.getBounds() || new Phaser.Geom.Rectangle();

  get x_coord(): number { return this.x; }
  get y_coord(): number { return this.baseY; }

  public playRandomIdle = (): void => {
    if (this.isSleeping || this.isTransitioning) return;
    const idx = this.idleKeys.indexOf(this.currentAnimation);
    const nextKey = idx === -1 ? this.idleKeys[0]: this.idleKeys[(idx + 1) % this.idleKeys.length];
    this.executeSwitch(nextKey, false);
  };

  public handleAnimationComplete = (key: string): void => {
    if (key === 'sleep_begin' && this.isSleeping) {
      this.executeSwitch('sleep_circle', true);
      this.isTransitioning = false;
    } else if (key === 'sleep_awake') {
      this.isTransitioning = false;
      this.isSleeping = false;
      this.playRandomIdle();
    } else if (!this.isSleeping) {
      this.isTransitioning = false;
      this.playRandomIdle();
    }
  };

  public playAnim = (key: string, loop = false): void => {
    if (this.isTransitioning && key !== 'sleep') return;

    if (key === 'sleep') {
      if (this.isTransitioning && this.currentAnimation === 'sleep_begin') return;

      this.isSleeping = !this.isSleeping;
      this.isTransitioning = true;
      if (this.isSleeping) {
        this.executeSwitch('sleep_begin', false);
        this.scene.events.emit('character_sleep_begin');
      } else {
        this.executeSwitch('sleep_awake', false);
      }
    } else if (!this.isSleeping) {
      if (['wash', 'play', 'eat'].includes(key)) {
        this.isTransitioning = true;
      }
      this.executeSwitch(key, loop);

      if (key === 'play') {
        this.scene.time.delayedCall(400, () => {
          this.spawnAndLaunchBall();
        });
      }
    }
  };

  private spawnAndLaunchBall = (): void => {
    const ballX = this.x;
    const ballY = this.baseY - 150;
    
    const ballKey = this.scene.textures.exists('icon-play') ? 'icon-play' : null;
    if (!ballKey) return;

    const ball = this.scene.add.image(ballX, ballY, ballKey);
    ball.setDepth(5).setScale(0.8);

    const targetX = Phaser.Math.Between(50, window.innerWidth - 50);
    const targetY = Phaser.Math.Between(50, window.innerHeight - 300);

    this.scene.tweens.add({
      targets: ball,
      x: targetX,
      y: targetY,
      angle: Phaser.Math.Between(-360, 360),
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: ball,
          alpha: 0,
          scale: 0.2,
          duration: 300,
          ease: 'Linear',
          onComplete: () => ball.destroy()
        });
      }
    });
  };

  public executeSwitch = (key: string, loop: boolean): void => {
    const prevKey = this.currentAnimation;
    const prev = this.anims[prevKey];
    const next = this.anims[key];

    if (!next || prev === next) return;

    this.currentAnimation = key;

    const nextNative = next.video || (next.videoTexture && next.videoTexture.source) as HTMLVideoElement | null;
    if (nextNative) {
      nextNative.loop = loop;
      try { nextNative.currentTime = 0; } catch (e) {}
    }

    if (this.scene && (this.scene as any).petLayout && typeof (this.scene as any).petLayout.setupPosition === 'function') {
      (this.scene as any).petLayout.setupPosition();
    }

    next.setDepth(4).setAlpha(1).setVisible(true).setPaused(false);
    next.play(loop);

    if (next.videoTexture) {
      next.videoTexture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }

    if (prev?.active) {
      prev.setAlpha(0).setDepth(2).setVisible(false).setPaused(true);
      const pNative = prev.video || (prev.videoTexture && prev.videoTexture.source) as HTMLVideoElement | null;
      if (pNative) {
        try { pNative.currentTime = 0; } catch (e) {}
      }
    }
  };

  public destroy = (): void => {
    Object.values(this.anims).forEach((v) => {
      if (v?.active) {
        const nv = v.video || (v.videoTexture && v.videoTexture.source) as HTMLVideoElement | null;
        if (nv) {
          nv.onended = null;
          nv.src = '';
          try { nv.load(); } catch (e) {}
        }
        v.destroy();
      }
    });
    this.anims = {};
  };
}
