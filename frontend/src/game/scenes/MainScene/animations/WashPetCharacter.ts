import Phaser from 'phaser';
import { MainPetPosition } from '../MainPetPosition';
import { BasePetCharacter } from './BasePetCharacter';

import videoWash from '/src/assets/resources/1stpet-animation/wash-converted.webm?url';

export class WashPetCharacter {
  public video!: Phaser.GameObjects.Video;
  public isActiveAnim = false;
  private unsub: () => void;
  private currentSound: Phaser.Sound.BaseSound | null = null;

  constructor(public scene: Phaser.Scene, private baseChar: BasePetCharacter) {
    if (!this.scene.cache.video.exists('wash')) {
      const el = document.createElement('video');
      el.src = videoWash;
      this.scene.cache.video.add('wash', el);
    }

    const t = MainPetPosition.getInstance(this.scene).getTransform();
    this.video = this.scene.add.video(t?.x ?? 0, t?.y ?? 0, 'wash').setMute(true).setOrigin(0.5, 1).setDepth(4).setVisible(false);

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
      if (transform && this.video?.active && this.isActiveAnim) {
        this.video.x = transform.x;
        this.video.y = transform.y + 260 * transform.targetScaleY;
      }
    });
    this.scene.events.on('update', this.preUpdate, this);
  }

  private preUpdate = (): void => {
    const t = MainPetPosition.getInstance().getTransform();
    if (t && this.video?.active && this.isActiveAnim) {
      this.video.setScale(t.targetScaleX * 0.9907, t.targetScaleY * 0.9907);
    }
  };

  public play(): void {
    const s = this.scene as any;
    if (this.baseChar.isSleeping || this.baseChar.currentAnim.startsWith('sleep') || this.isActiveAnim || s.actionCharacter?.currentAnim) return;
    this.isActiveAnim = true;

    this.baseChar.video.setVisible(false).stop();
    if (this.baseChar.hasAudioPlaying()) this.baseChar.stopAudio();

    this.stopAudio();
    if (this.scene.cache.audio.exists('wash')) {
      this.currentSound = this.scene.sound.add('wash', { loop: false, volume: 1 });
      this.currentSound.play();
    }

    this.scene.events.emit('care_trigger_wash_start');
    MainPetPosition.getInstance().setAnimationKey('wash');

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
    this.video.loadURL(videoWash, false).play(false);
  }

  private stopAudio() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.destroy();
      this.currentSound = null;
    }
  }

  private handleComplete() {
    this.isActiveAnim = false;
    this.video.setVisible(false);
    this.stopAudio();

    if (this.baseChar?.video?.active) {
      this.baseChar.video.setVisible(true);
      this.baseChar.resetIdleTimer();
      this.baseChar.playRandomIdle();
    }
    this.scene.events.emit('pet_animation_complete', 'wash');
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
