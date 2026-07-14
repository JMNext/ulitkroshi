import loadGoriz from '/src/assets/login_assets/load_goriz.png';
import loadVert from '/src/assets/login_assets/load_vert.png';
import fonGoriz from '/src/assets/background/fon_goriz.png';
import fonVert from '/src/assets/background/fon_vert.png';

interface BgConfig {
  landscape: string;
  portrait: string;
  useMenuBg?: boolean;
}

export class BackgroundManager {
  private static instance: BackgroundManager;
  private game: Phaser.Game | null = null;
  private currentSceneKey = '';

  private bgConfigs: Record<string, BgConfig> = {
    'LoginScene': { landscape: loadGoriz, portrait: loadVert },
    'RegistrationScene_Step1': { landscape: fonGoriz, portrait: fonVert },
    'RegistrationScene_Step2': { landscape: fonGoriz, portrait: fonVert },
    'RegistrationScene_Step3': { landscape: fonGoriz, portrait: fonVert, useMenuBg: true },
    'RegistrationScene_Step4': { landscape: fonGoriz, portrait: fonVert },
    'MainScene': { landscape: fonGoriz, portrait: fonVert, useMenuBg: true },
    'CatchGameScene': { landscape: fonGoriz, portrait: fonVert },
    'MemoryGameScene': { landscape: fonGoriz, portrait: fonVert },
    'SnakeGameScene': { landscape: fonGoriz, portrait: fonVert }
  };

  private constructor() {}

  public static getInstance = (): BackgroundManager => {
    if (!BackgroundManager.instance) BackgroundManager.instance = new BackgroundManager();
    return BackgroundManager.instance;
  };

  public init = (game: Phaser.Game): void => {
    this.game = game;
  };

  public preloadMenuBackground = (): void => {};

  public applyBackground = (sceneOrKey: string | Phaser.Scene): void => {
    if (!sceneOrKey) return;
    
    const sceneKey = typeof sceneOrKey === 'string' 
      ? sceneOrKey 
      : sceneOrKey.scene.key;

    this.currentSceneKey = sceneKey;
    const config = this.bgConfigs[sceneKey];
    const container = document.getElementById('game-container');
    if (!config || !container) return;

    const bgUrl = window.innerWidth < window.innerHeight ? config.portrait : config.landscape;
    container.style.backgroundImage = `url('${bgUrl}')`;

    if (typeof sceneOrKey !== 'string' && sceneOrKey.scale) {
      sceneOrKey.scale.off('resize', this.handleResize, this);
      sceneOrKey.scale.on('resize', this.handleResize, this);
    }
  };

  private handleResize = (): void => {
    if (this.currentSceneKey) {
      this.applyBackground(this.currentSceneKey);
    }
  };

  public clearBackground = (): void => {
    const container = document.getElementById('game-container');
    if (container) container.style.backgroundImage = 'none';
    this.currentSceneKey = '';
  };

  public destroy = (): void => {
    this.clearBackground();
    this.game = null;
  };
}
