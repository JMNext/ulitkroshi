import Phaser from 'phaser';
import { PET_CONFIG } from './MainPetPosition';

const SHADER = `precision medium lowp float;uniform sampler2D uMainSampler;varying vec2 outTexCoord;void main(){vec4 c=texture2D(uMainSampler,outTexCoord);if(c.r<0.08&&c.g<0.08&&c.b<0.08)discard;gl_FragColor=c;}`;

export class AnimatedCharacter {
  public scene: Phaser.Scene;
  public x: number; public y: number; public baseY: number; public currentAnimation: string;
  public isSleeping = false; public isTransitioning = false;
  public anims: Record<string, Phaser.GameObjects.Video> = {};
  public idleKeys = ['prostoi1', 'prostoi2'];

  constructor(scene: Phaser.Scene, x: number, y: number, defaultKey: string) {
    this.scene = scene; this.x = x; this.y = y; this.baseY = y; this.currentAnimation = defaultKey;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    let hasPipe = false;
    const anyRenderer = scene.renderer as any;

    if (isIOS && anyRenderer?.pipelines) {
      if (!anyRenderer.pipelines.has('ChromaKey')) {
        try {
          const BasePostFX = Object.getPrototypeOf(anyRenderer.pipelines.get('FX') || anyRenderer.pipelines.getPostPipeline?.('FX') || {});
          if (BasePostFX) {
            class ChromaKey extends BasePostFX.constructor {
              constructor(g: Phaser.Game) { super({ game: g, fragShader: SHADER }); }
            }
            anyRenderer.pipelines.add('ChromaKey', new ChromaKey(scene.game));
            hasPipe = true;
          }
        } catch (e) {
          console.warn('Не удалось инициализировать кастомный шейдер iOS', e);
        }
      } else {
        hasPipe = true;
      }
    }

    ['prostoi1', 'prostoi2', 'eat', 'wash', 'play', 'sleep_begin', 'sleep_circle', 'sleep_awake'].forEach(k => {
      const isDef = k === defaultKey, v = scene.add.video(x, y, k).setMute(true).setVisible(isDef).setAlpha(isDef ? 1 : 0).setDepth(isDef ? 4 : 1);
      if (hasPipe) (v as any).setPostPipeline('ChromaKey');
      const nv = v.video || (v.videoTexture && v.videoTexture.source) as HTMLVideoElement | null;
      if (nv) {
        Object.assign(nv, { objectFit: 'fill', preload: 'auto', autoplay: isDef });
        nv.onended = () => { if (this.currentAnimation === k && !nv.loop) this.handleAnimationComplete(k); };
      }
      v.setSize(k === 'wash' ? 1076 : 1080, k === 'wash' ? 1920 : 1080).setOrigin(0.5, 1);
      this.anims[k] = v;
      if (isDef) v.play(false); else { v.setPaused(true); if (nv) try { nv.currentTime = 0.01; } catch {} }
    });
  }

  public updateCoordinates = (nx: number, ny: number, scale: number) => {
    this.x = nx; this.baseY = ny;
    Object.entries(this.anims).forEach(([k, v]) => { if (v) { v.x = nx; v.y = k === 'wash' ? ny + PET_CONFIG.wash.getAdaptiveOffset(scale) : ny; } });
  };

  public getBounds = () => this.anims[this.currentAnimation]?.getBounds() || new Phaser.Geom.Rectangle();
  get x_coord() { return this.x; } get y_coord() { return this.baseY; }

  public playRandomIdle = () => {
    if (this.isSleeping || this.isTransitioning) return;
    const idx = this.idleKeys.indexOf(this.currentAnimation);
    this.executeSwitch(idx === -1 ? this.idleKeys[0] : this.idleKeys[(idx + 1) % this.idleKeys.length], false);
  };

  public handleAnimationComplete = (k: string) => {
    this.isTransitioning = false;
    if (k === 'sleep_begin' && this.isSleeping) this.executeSwitch('sleep_circle', true);
    else if (k === 'sleep_awake') { this.isSleeping = false; this.playRandomIdle(); }
    else if (!this.isSleeping) this.playRandomIdle();
  };

  public playAnim = (k: string, loop = false) => {
    if (this.isTransitioning && k !== 'sleep') return;
    if (k === 'sleep') {
      if (this.isTransitioning && this.currentAnimation === 'sleep_begin') return;
      this.isSleeping = !this.isSleeping; this.isTransitioning = true;
      this.executeSwitch(this.isSleeping ? 'sleep_begin' : 'sleep_awake', false);
      if (this.isSleeping) this.scene.events.emit('character_sleep_begin');
    } else if (!this.isSleeping) {
      if (['wash', 'play', 'eat'].includes(k)) this.isTransitioning = true;
      this.executeSwitch(k, loop);
      if (k === 'play') this.scene.time.delayedCall(400, () => this.spawnBall());
    }
  };

  private spawnBall = () => {
    if (!this.scene.textures.exists('icon-play')) return;
    const b = this.scene.add.image(this.x, this.baseY - 150, 'icon-play').setDepth(5).setScale(0.8);
    this.scene.tweens.add({
      targets: b, x: Phaser.Math.Between(50, window.innerWidth - 50), y: Phaser.Math.Between(50, window.innerHeight - 300),
      angle: Phaser.Math.Between(-360, 360), duration: 1200, ease: 'Cubic.easeOut',
      onComplete: () => this.scene.tweens.add({ targets: b, alpha: 0, scale: 0.2, duration: 300, onComplete: () => b.destroy() })
    });
  };

  public executeSwitch = (k: string, loop: boolean) => {
    const prev = this.anims[this.currentAnimation], next = this.anims[k];
    if (!next || prev === next) return;
    this.currentAnimation = k;
    const n = next.video || (next.videoTexture && next.videoTexture.source) as HTMLVideoElement | null;
    if (n) { n.loop = loop; try { n.currentTime = 0; } catch {} }
    if ((this.scene as any).petLayout?.setupPosition) (this.scene as any).petLayout.setupPosition();
    next.setDepth(4).setAlpha(1).setVisible(true).setPaused(false).play(loop);
    if (next.videoTexture) next.videoTexture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    if (prev?.active) {
      prev.setAlpha(0).setDepth(2).setVisible(false).setPaused(true);
      const p = prev.video || (prev.videoTexture && prev.videoTexture.source) as HTMLVideoElement | null;
      if (p) try { p.currentTime = 0; } catch {}
    }
  };

  public destroy = () => {
    Object.values(this.anims).forEach(v => {
      if (v?.active) {
        const nv = v.video || (v.videoTexture && v.videoTexture.source) as HTMLVideoElement | null;
        if (nv) { nv.onended = null; nv.src = ''; try { nv.load(); } catch {} }
        v.destroy();
      }
    });
    this.anims = {};
  };
}
