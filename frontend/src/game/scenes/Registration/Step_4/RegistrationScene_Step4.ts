import { Scene } from 'phaser';
import { RegistrationLogic_Step4 } from './RegistrationLogic_Step4';
import { BackgroundManager } from '../../../../BackgroundManager';

// Импортируем видеофайл через сборщик, чтобы он попал в финальную сборку (dist)
import happyVideoUrl from '/src/assets/resources/1stpet-animation/happy.webm';

const SHADER = `
  precision mediump float;
  uniform sampler2D uMainSampler;
  varying vec2 outTexCoord;
  void main() {
    vec4 c = texture2D(uMainSampler, outTexCoord);
    if ((0.299 * c.r + 0.587 * c.g + 0.114 * c.b) < 0.13) discard;
    gl_FragColor = c;
  }
`;

interface PipelineGameObject {
  setPostPipeline: (key: string) => void;
}

export class RegistrationScene_Step4 extends Scene {
  private videoObject: Phaser.GameObjects.Video | null = null;
  private logic: RegistrationLogic_Step4 | null = null;
  private hasPipe = false;
  private targetScale = 1.0;

  constructor() { super('RegistrationScene_Step4'); }

  public preload = (): void => {
    if (!this.cache.video.exists('happy')) {
      // ИСПРАВЛЕНО: передаем динамический URL от сборщика вместо жесткой строки
      this.load.video('happy', happyVideoUrl);
    }
  };

  public create = (): void => {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS && this.renderer.type === Phaser.WEBGL) {
      const glRenderer = this.renderer as any;
      if (glRenderer.pipelines && !glRenderer.pipelines.has('ChromaKey')) {
        try {
          const fxPipeline = glRenderer.pipelines.get('FX');
          const BasePostFX = fxPipeline ? Object.getPrototypeOf(fxPipeline) : null;
          if (BasePostFX?.constructor) {
            class ChromaKey extends BasePostFX.constructor {
              constructor(g: Phaser.Game) { super({ game: g, fragShader: SHADER }); }
            }
            glRenderer.pipelines.add('ChromaKey', new ChromaKey(this.game));
            this.hasPipe = true;
          }
        } catch (e) {
          console.warn('Не удалось инициализировать кастомный шейдер iOS', e);
        }
      } else if (glRenderer.pipelines?.has('ChromaKey')) {
        this.hasPipe = true;
      }
    }

    this.setupPet();
    
    this.logic = new RegistrationLogic_Step4(this, () => {
      this.cameras.main?.fadeOut(500, 0, 0, 0).once('camerafadeoutcomplete', () => {
        this.scene.start('MainScene');
      });
    });

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', this.handleShutdown, this);
  };

  private setupPet = (): void => {
    const [w, h] = [window.innerWidth, window.innerHeight];
    const isPort = w < h;
    
    let uiScale = 1.0;
    let targetY = 0;

    if (isPort) {
      uiScale = Math.min((h * 0.48) / 644, 0.85);
      targetY = (h * 0.45) + ((644 * uiScale) / 2);
    } else {
      uiScale = 1.0;
      targetY = (h * 0.38) + ((644 * uiScale) / 2);
    }

    const targetX = w / 2;
    this.targetScale = (644 * uiScale) / 1080;

    if (!this.videoObject) {
      this.videoObject = this.add.video(targetX, targetY, 'happy').setMute(true).setOrigin(0.5, 1).setDepth(4);
      
      if (this.hasPipe) {
        (this.videoObject as unknown as PipelineGameObject).setPostPipeline('ChromaKey');
      }
      
      this.videoObject.play(true);
      
      const nv = this.videoObject.video || (this.videoObject.videoTexture && this.videoObject.videoTexture.source) as HTMLVideoElement | null;
      if (nv && typeof nv.play === 'function') {
        Object.assign(nv, { objectFit: 'fill', preload: 'auto', autoplay: true, loop: true });
        nv.style.display = 'block';
      }
      
      this.videoObject.on('texturebound', () => {
        if (this.videoObject) this.videoObject.setScale(this.targetScale);
      });

      this.input.once('pointerdown', () => {
        if (this.videoObject && !this.videoObject.isPlaying) this.videoObject.play(true);
      });
    } else {
      this.videoObject.setPosition(targetX, targetY);
    }

    this.videoObject.setScale(this.targetScale);
  };

  private handleResize = (): void => {
    if (!this.scene.isActive(this.scene.key)) return;
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    this.setupPet();
  };

  private handleShutdown = () => {
    this.scale.off('resize', this.handleResize, this);
    this.logic?.destroy(false);
    
    if (this.videoObject) {
      this.videoObject.off('texturebound');
      try { this.videoObject.stop(); } catch (e) {}
      if (this.videoObject.videoTexture) this.textures.remove(this.videoObject.videoTexture.key);
      this.videoObject.destroy();
      this.videoObject = null;
    }
    BackgroundManager.getInstance().clearBackground();
  };
}
