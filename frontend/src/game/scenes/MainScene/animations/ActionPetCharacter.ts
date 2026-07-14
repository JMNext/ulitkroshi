import Phaser from 'phaser';
import { MainPetPosition } from '../MainPetPosition';
import { BasePetCharacter } from './BasePetCharacter';

import videoEat from '/src/assets/resources/1stpet-animation/eat-converted.webm?url';
import videoPlay from '/src/assets/resources/1stpet-animation/play_ball.webm?url';

const ACTION_VIDEOS: Record<string, string> = { eat: videoEat, play: videoPlay };

export class ActionPetCharacter {
  public video!: Phaser.GameObjects.Video;
  public currentAnim: string | null = null;
  private unsub: () => void;
  private currentSound: Phaser.Sound.BaseSound | null = null;

  constructor(public scene: Phaser.Scene, private baseChar: BasePetCharacter) {
    Object.keys(ACTION_VIDEOS).forEach((k) => {
      if (!this.scene.cache.video.exists(k)) {
        const el = document.createElement('video');
        el.src = ACTION_VIDEOS[k];
        this.scene.cache.video.add(k, el);
      }
    });

    const t = MainPetPosition.getInstance(this.scene).getTransform();
    this.video = this.scene.add.video(t?.x ?? 0, t?.y ?? 0, 'play').setMute(true).setOrigin(0.5, 1).setDepth(4).setVisible(false);

    if (baseChar.hasPipe && 'setPostPipeline' in this.video) {
      (this.video as any).setPostPipeline('ChromaKey');
    }

    const sources = this.video.videoTexture?.source;
    const firstSource = Array.isArray(sources) ? sources : sources;
    const nv = this.video.video || (firstSource && 'image' in firstSource ? (firstSource.image as HTMLVideoElement) : null);

    if (nv) {
      Object.assign(nv, { objectFit: 'fill', preload: 'auto', style: { display: 'block' } });
      nv.onended = () => this.handleComplete();
    }

    this.unsub = MainPetPosition.getInstance(this.scene).subscribe((transform) => {
      if (transform && this.video?.active && this.currentAnim) {
        this.video.x = transform.x;
        this.video.y = transform.y;
      }
    });
    this.scene.events.on('update', this.preUpdate, this);
  }

  private preUpdate = (): void => {
    const t = MainPetPosition.getInstance().getTransform();
    if (t && this.video?.active && this.currentAnim) {
      this.video.setScale(t.targetScaleX, t.targetScaleY);
    }
  };

  public play(k: string): void {
    const s = this.scene as any;
    if (this.baseChar.isSleeping || this.baseChar.currentAnim.startsWith('sleep') || this.currentAnim || s.washCharacter?.isActiveAnim) return;
    this.currentAnim = k;
    const url = ACTION_VIDEOS[k];
    if (!url) return;

    this.baseChar.video.setVisible(false).stop();
    if (this.baseChar.hasAudioPlaying()) this.baseChar.stopAudio();

    this.stopAudio();
    if (this.scene.cache.audio.exists(k)) {
      this.currentSound = this.scene.sound.add(k, { loop: false, volume: 1 });
      this.currentSound.play();
    }

    if (k === 'play') this.scene.time.delayedCall(400, () => this.spawnBall());

    MainPetPosition.getInstance().setAnimationKey(k);

    const sources = this.video.videoTexture?.source;
    const firstSource = Array.isArray(sources) ? sources : sources;
    const nv = this.video.video || (firstSource && 'image' in firstSource ? (firstSource.image as HTMLVideoElement) : null);

    if (nv) {
      nv.onplaying = () => {
        if (this.video.active) this.video.setVisible(true);
        nv.onplaying = null;
      };
      nv.loop = false;
    }
    this.video.loadURL(url, false).play(false);
  }

  private stopAudio() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.destroy();
      this.currentSound = null;
    }
  }

  private handleComplete() {
    const completedKey = this.currentAnim;
    this.currentAnim = null;
    this.video.setVisible(false);
    this.stopAudio();

    if (this.baseChar?.video?.active) {
      this.baseChar.video.setVisible(true);
      this.baseChar.resetIdleTimer();
      this.baseChar.playRandomIdle();
    }
    if (completedKey) this.scene.events.emit('pet_animation_complete', completedKey);
  }

  private spawnBall() {
    if (!this.scene?.sys.isActive() || !this.scene.textures.exists('icon-play')) return;
    const b = this.scene.add.image(this.video.x, this.video.y - 150, 'icon-play').setDepth(6).setScale(0.8);
    this.scene.tweens.add({
      targets: b,
      x: Phaser.Math.Between(50, window.innerWidth - 50),
      y: Phaser.Math.Between(50, window.innerHeight - 300),
      angle: Phaser.Math.Between(-360, 360),
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        if (this.scene && b.active) {
          this.scene.tweens.add({
            targets: b,
            alpha: 0,
            scale: 0.2,
            duration: 300,
            onComplete: () => { if (b.active) b.destroy(); },
          });
        }
      },
    });
  }

  public destroy(): void {
    this.stopAudio();
    this.scene.events.off('update', this.preUpdate, this);
    if (this.unsub) this.unsub();
    if (this.video) {
      const sources = this.video.videoTexture?.source;
      const firstSource = Array.isArray(sources) ? sources : sources;
      const nv = this.video.video || (firstSource && 'image' in firstSource ? (firstSource.image as HTMLVideoElement) : null);
      if (nv) {
        nv.onended = nv.onplaying = null;
        try { nv.pause(); nv.src = ''; nv.load(); } catch {}
      }
      if (this.video.videoTexture && this.scene?.textures) {
        try { this.scene.textures.remove(this.video.videoTexture.key); } catch {}
      }
      this.video.destroy();
    }
  }
}
