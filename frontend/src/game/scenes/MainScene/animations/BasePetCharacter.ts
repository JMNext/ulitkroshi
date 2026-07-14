import Phaser from 'phaser';
import { MainPetPosition } from '../MainPetPosition';

const SHADER = `precision mediump float; uniform sampler2D uMainSampler; varying vec2 outTexCoord; void main() { vec4 c = texture2D(uMainSampler, outTexCoord); if ((0.299 * c.r + 0.587 * c.g + 0.114 * c.b) < 0.13) discard; gl_FragColor = c; }`;

import videoProstoi1 from '/src/assets/resources/1stpet-animation/prostoi-converted.webm?url';
import videoProstoi2 from '/src/assets/resources/1stpet-animation/prostoi2.webm?url';
import videoSleepAwake from '/src/assets/resources/1stpet-animation/sleep_awake.webm?url';
import videoSleepBegin from '/src/assets/resources/1stpet-animation/sleep_begin.webm?url';
import videoSleepCircle from '/src/assets/resources/1stpet-animation/sleep_circle.webm?url';
import videoSadState from '/src/assets/resources/1stpet-animation/sad_state.webm?url';
import soundSleep from '/src/assets/resources/sound/sleep.mp3?url';

const BASE_VIDEOS: Record<string, string> = {
  prostoi1: videoProstoi1,
  prostoi2: videoProstoi2,
  sleep_begin: videoSleepBegin,
  sleep_circle: videoSleepCircle,
  sleep_awake: videoSleepAwake,
  sad_state: videoSadState,
};

// Жестко и легитимно описываем структуру контракта рендерера для TS без использования any
interface StrictlyTypedRenderer extends Phaser.Renderer.WebGL.WebGLRenderer {
  pipelines: {
    has: (key: string) => boolean;
    get: (key: string) => object | null;
    add: (key: string, pipeline: object) => object;
  };
}

export class BasePetCharacter {
  public video!: Phaser.GameObjects.Video;
  public currentAnim: string;
  public isSleeping = false;
  public idleKeys = ['prostoi1', 'prostoi2'];
  public hasPipe = false; 
  private unsub: () => void;
  private idleTimer: Phaser.Time.TimerEvent | null = null;
  private currentSound: Phaser.Sound.BaseSound | null = null;

  constructor(public scene: Phaser.Scene, defaultKey: string) {
    this.currentAnim = defaultKey;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (typeof navigator.platform === 'string' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS && scene.renderer.type === Phaser.WEBGL) {
      const r = scene.renderer as StrictlyTypedRenderer;
      if (r.pipelines && !r.pipelines.has('ChromaKey')) {
        try {
          const fxPipeline = r.pipelines.get('FX');
          if (fxPipeline) {
            const BasePostFX = Object.getPrototypeOf(fxPipeline) as Record<string, unknown>;
            if (BasePostFX && typeof BasePostFX.constructor === 'function') {
              const BaseConstructor = BasePostFX.constructor as new (config: { game: Phaser.Game; fragShader: string }) => object;
              r.pipelines.add('ChromaKey', new (class extends BaseConstructor {
                constructor(g: Phaser.Game) { super({ game: g, fragShader: SHADER }); }
              })(scene.game));
            }
          }
        } catch (e) { console.warn(e); }
      }
    }

    const customRenderer = scene.renderer as StrictlyTypedRenderer;
    this.hasPipe = scene.renderer.type === Phaser.WEBGL && (customRenderer.pipelines?.has('ChromaKey') ?? false);

    Object.keys(BASE_VIDEOS).forEach((k) => {
      if (!this.scene.cache.video.exists(k)) {
        const el = document.createElement('video');
        el.src = BASE_VIDEOS[k];
        this.scene.cache.video.add(k, el);
      }
    });

    if (!this.scene.cache.audio.exists('sleep')) {
      this.scene.load.audio('sleep', soundSleep);
      this.scene.load.start();
    }

    const t = MainPetPosition.getInstance(this.scene).getTransform();
    this.video = this.scene.add.video(t?.x ?? 0, t?.y ?? 0, 'prostoi1').setMute(true).setOrigin(0.5, 1).setDepth(4);

    if (this.hasPipe && 'setPostPipeline' in this.video) {
      const pipelineVideo = this.video as unknown as { setPostPipeline: (key: string) => void };
      pipelineVideo.setPostPipeline('ChromaKey');
    }

    this.setupVideoEvents();
    this.unsub = MainPetPosition.getInstance(this.scene).subscribe((transform) => {
      if (transform && this.video?.active) {
        this.video.x = transform.x;
        this.video.y = transform.y;
      }
    });
    this.scene.events.on('update', this.preUpdate, this);
    this.play(defaultKey, true);
    this.resetIdleTimer();
  }

  private setupVideoEvents() {
    const sources = this.video.videoTexture?.source;
    const firstSource = Array.isArray(sources) ? sources : sources;
    const nv = this.video.video || (firstSource && 'image' in firstSource ? (firstSource.image as HTMLVideoElement) : null);
    if (nv) {
      Object.assign(nv, { objectFit: 'fill', preload: 'auto', style: { display: 'block' } });
      nv.onended = () => this.handleComplete();
    }
  }

  private preUpdate = (): void => {
    const t = MainPetPosition.getInstance().getTransform();
    if (t && this.video?.active) this.video.setScale(t.targetScaleX, t.targetScaleY);
  };

  public resetIdleTimer(): void {
    if (this.idleTimer) this.idleTimer.destroy();
    this.idleTimer = null;
    if (this.isSleeping || !this.scene?.sys?.isActive()) return;

    this.idleTimer = this.scene.time.delayedCall(120000, () => {
      if (!this.isSleeping && this.video?.active && this.currentAnim !== 'sad_state') {
        this.play('sad_state', true);
      }
    });
  }

  public play(k: string, loop = false): void {
    this.currentAnim = k;
    const url = BASE_VIDEOS[k];
    if (!url) return;

    if (k !== 'sad_state') this.resetIdleTimer();
    MainPetPosition.getInstance().setAnimationKey(k);

    const sources = this.video.videoTexture?.source;
    const firstSource = Array.isArray(sources) ? sources : sources;
    const nv = this.video.video || (firstSource && 'image' in firstSource ? (firstSource.image as HTMLVideoElement) : null);

    if (nv) {
      nv.onplaying = () => {
        if (this.video.active) this.video.setVisible(true).setAlpha(1);
        nv.onplaying = null;
      };
      nv.loop = loop;
    }

    const rawTrack = this.scene.game.sound.get('main_theme');
    
    if (k === 'sleep_circle') {
      this.stopAudio();
      if (this.scene.sound instanceof Phaser.Sound.WebAudioSoundManager) {
        if (this.scene.sound.context && this.scene.sound.context.state === 'suspended') {
          this.scene.sound.context.resume();
        }
      }
      if (this.scene.cache.audio.exists('sleep')) {
        this.currentSound = this.scene.sound.add('sleep', { loop: true, volume: 0.9 });
        this.currentSound.play();
      }
      if (rawTrack instanceof Phaser.Sound.WebAudioSound) {
        this.scene.tweens.add({
          targets: rawTrack,
          volume: 0.35, 
          duration: 1000
        });
      }
    } else {
      this.stopAudio();
      if (rawTrack instanceof Phaser.Sound.WebAudioSound && rawTrack.volume !== 0.75 && k !== 'sleep_begin') {
        this.scene.tweens.add({
          targets: rawTrack,
          volume: 0.75,
          duration: 1000
        });
      }
    }

    this.video.loadURL(url, false).play(loop);
  }

  public hasAudioPlaying(): boolean {
    return this.currentSound !== null;
  }

  public stopAudio() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.destroy();
      this.currentSound = null;
    }
  }

  public toggleSleep(): void {
    if (this.currentAnim === 'sleep_begin' || this.currentAnim === 'sleep_awake') return;
    this.isSleeping = !this.isSleeping;
    if (this.isSleeping && this.idleTimer) {
      this.idleTimer.destroy();
      this.idleTimer = null;
    }
    this.play(this.isSleeping ? 'sleep_begin' : 'sleep_awake', false);
  }

  private handleComplete() {
    if (!this.video.active) return;
    this.scene.events.emit('pet_animation_complete', this.currentAnim);
    if (this.currentAnim === 'sleep_begin' && this.isSleeping) {
      this.play('sleep_circle', true);
    } else if (this.currentAnim === 'sleep_awake') {
      this.isSleeping = false;
      this.stopAudio();
      this.playRandomIdle();
    } else if (!this.isSleeping) {
      this.playRandomIdle();
    }
  }

  public playRandomIdle(): void {
    if (this.isSleeping) return;
    const idx = this.idleKeys.indexOf(this.currentAnim);
    this.play(idx === -1 ? this.idleKeys[0]: this.idleKeys[(idx + 1) % this.idleKeys.length], false);
  }

  public destroy(): void {
    this.stopAudio();
    if (this.idleTimer) this.idleTimer.destroy();
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
