import Phaser from 'phaser';

export class BackgroundManager {
  private static instance: BackgroundManager;
  private game: Phaser.Game | null = null;
  private currentBg: string = '';
  private currentSceneKey: string = '';
  private resizeTimeout: any = null;

  private bgConfigs: Record<string, { landscape: string; portrait: string; menuLandscape?: string; menuPortrait?: string }> = {
    'LoginScene': { landscape: "url('/assets/login_assets/load_goriz.png')", portrait: "url('/assets/login_assets/load_vert.png')" },
    'RegistrationScene_Step1': { landscape: "url('/assets/background/fon_goriz.png')", portrait: "url('/assets/background/fon_vert.png')" },
    'RegistrationScene_Step2': { landscape: "url('/assets/background/fon_goriz.png')", portrait: "url('/assets/background/fon_vert.png')" },
    'RegistrationScene_Step3': { landscape: "url('/assets/background/fon_goriz.png')", portrait: "url('/assets/background/fon_vert.png')", menuLandscape: 'background/fon_goriz.png', menuPortrait: 'background/fon_vert.png' },
    'RegistrationScene_Step4': { landscape: "url('/assets/background/fon_goriz.png')", portrait: "url('/assets/background/fon_vert.png')" },
    'MainScene': { landscape: "url('/assets/background/fon_goriz.png')", portrait: "url('/assets/background/fon_vert.png')", menuLandscape: 'background/fon_goriz.png', menuPortrait: 'background/fon_vert.png' },
    'CatchGameScene': { landscape: "url('/assets/background/fon_goriz.png')", portrait: "url('/assets/background/fon_vert.png')" },
    'MemoryGameScene': { landscape: "url('/assets/background/fon_goriz.png')", portrait: "url('/assets/background/fon_vert.png')" },
    'SnakeGameScene': { landscape: "url('/assets/background/fon_goriz.png')", portrait: "url('/assets/background/fon_vert.png')" }
  };

  private constructor() {}

  public static getInstance = (): BackgroundManager => {
    if (!BackgroundManager.instance) BackgroundManager.instance = new BackgroundManager();
    return BackgroundManager.instance;
  };

  public init = (game: Phaser.Game): void => {
    this.game = game;
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
  };

  private handleResize = (): void => {
    if (this.currentSceneKey) {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.applyBackground(this.currentSceneKey), 30);
    }
  };

  public preloadMenuBackground = (scene: Phaser.Scene): void => {
    const config = this.bgConfigs[scene.scene.key];
    if (config?.menuLandscape && config?.menuPortrait) {
      scene.load.image('bg-menu-main-landscape', `/assets/${config.menuLandscape}`);
      scene.load.image('bg-menu-main-portrait', `/assets/${config.menuPortrait}`);
    }
  };

  public applyBackground = (sceneKey: string): void => {
    this.currentSceneKey = sceneKey;
    const container = document.getElementById('game-container');
    const config = this.bgConfigs[sceneKey];
    if (!container) return;
    if (!config) { 
      container.style.backgroundImage = 'none'; 
      return; 
    }

    const isPortrait = window.innerWidth < window.innerHeight;
    const targetBg = isPortrait ? config.portrait : config.landscape;

    if (this.currentBg !== targetBg) {
      this.currentBg = targetBg;
      container.style.backgroundImage = targetBg;
    }

    container.style.backgroundRepeat = 'no-repeat';
    container.style.backgroundPosition = 'center center';
    container.style.backgroundSize = '100% 100%';
    container.style.backgroundColor = 'transparent';
  };

  public clearBackground = (): void => {
    const container = document.getElementById('game-container');
    if (container) {
      container.style.backgroundImage = 'none';
      container.style.backgroundSize = 'auto';
    }
    this.currentBg = '';
    this.currentSceneKey = '';
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
  };
}
