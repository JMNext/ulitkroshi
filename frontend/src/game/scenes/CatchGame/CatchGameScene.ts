import * as Phaser from 'phaser';
import { getMovedPlayerX, checkFruitCaughtLogic } from './CatchGameLogic';
import { 
  renderCatchUI, 
  destroyCatchUI, 
  updateCatchUIData, 
  calculateCatchMetricsUI, 
  createPlayerUI, 
  spawnCatchFruitUI, 
  drawHeartsUI,
  endCatchGame,
  CatchUiMetrics,
  FRUITS 
} from './CatchGameUI';
import { BackgroundManager } from '../../../BackgroundManager';
// @ts-ignore
import { animateCoinExplosion } from '../../../ui/components/GameOverModalUI';

interface CatchItemImage extends Phaser.GameObjects.Image { isHeart?: boolean; }

export class CatchGameScene extends Phaser.Scene {
  public difficulty = 'medium'; 
  public score = 0; 
  public hp = 100; 
  public isGameOver = false;
  public fruitsGroup: Phaser.GameObjects.Image[] = []; 
  public heartsGroup: Phaser.GameObjects.Image[] = [];
  public moveDirection = 0; 
  public playerSpeed = 14; 
  public fruitSpeed = 8; 
  public spawnDelay = 1200;
  public player!: Phaser.GameObjects.Video; 
  public spawnTimer!: Phaser.Time.TimerEvent; 
  public uiMetrics!: CatchUiMetrics;
  public healHeartTimer!: Phaser.Time.TimerEvent;

  constructor() { 
    super('CatchGameScene'); 
  }

  public init = (data: { difficulty?: string }): void => {
    this.difficulty = data.difficulty || 'medium'; 
    this.score = 0; 
    this.hp = 100; 
    this.isGameOver = false;
    this.fruitsGroup = []; 
    this.heartsGroup = []; 
    this.moveDirection = 0;
    const cfgs = ({ easy: { s: 5, d: 1600 }, medium: { s: 8, d: 1200 }, hard: { s: 11, d: 800 } } as Record<string, { s: number, d: number }>)[this.difficulty] || { s: 8, d: 1200 };
    this.fruitSpeed = cfgs.s; 
    this.spawnDelay = cfgs.d;
  };

  public preload = (): void => {
    this.load.image('icon-life', '/assets/interface-icons/life.svg');
    FRUITS.forEach((id) => this.load.image(`fruit-${id}`, `/assets/fruits/fruits_${id}.png`));
  };

  public create = (): void => {
    const { width: w, height: h } = this.scale;
    const isPort = w < h;
    this.uiMetrics = calculateCatchMetricsUI(this);
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    renderCatchUI(this, () => { 
      destroyCatchUI(); 
      this.scene.start('MainScene'); 
    });
    
    this.player = createPlayerUI(this, this.uiMetrics);
    this.player.x = w / 2;
    this.player.y = this.uiMetrics.playerY;
    this.playerSpeed = isPort ? Math.max(9, Math.floor(w * 0.028)) : 18;
    drawHeartsUI(this);

    const nativeVid = this.player.video || (this.player.videoTexture && this.player.videoTexture.source) as HTMLVideoElement | null;
    let forceScale: (() => void) | null = null;
    if (nativeVid) {
      forceScale = () => {
        if (this.player?.active) this.player.setScale(this.uiMetrics.playerScale);
        if (forceScale) nativeVid.removeEventListener('playing', forceScale);
      };
      nativeVid.addEventListener('playing', forceScale);
    }

    const processPointerInput = (p: Phaser.Input.Pointer) => {
      if (this.isGameOver || !this.player) return;
      const hw = (this.player.displayWidth || 100) / 2;
      if (p.isDown || !p.wasTouch) {
        this.player.x = Phaser.Math.Clamp(p.x, hw, this.scale.width - hw);
      }
    };

    this.input.on('pointermove', processPointerInput);
    this.input.on('pointerdown', processPointerInput);

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) this.moveDirection = -1;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) this.moveDirection = 1;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key) && this.moveDirection === -1) this.moveDirection = 0;
      if (['ArrowRight', 'd', 'D'].includes(e.key) && this.moveDirection === 1) this.moveDirection = 0;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    this.spawnTimer = this.time.addEvent({ delay: this.spawnDelay, loop: true, callback: () => spawnCatchFruitUI(this, this.uiMetrics) });
    this.healHeartTimer = this.time.addEvent({ delay: 30000, loop: true, callback: () => this.spawnHealHeart() });
    
    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => { 
      this.scale.off('resize', this.handleResize, this);
      this.input.off('pointermove', processPointerInput);
      this.input.off('pointerdown', processPointerInput);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (nativeVid && forceScale) nativeVid.removeEventListener('playing', forceScale);
      this.spawnTimer?.remove(); 
      this.healHeartTimer?.remove(); 
      destroyCatchUI(); 
    }, this);
  };

  private handleResize = (): void => {
    if (!this.scene.isActive(this.scene.key)) return;
    const { width: w, height: h } = this.scale;
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    this.uiMetrics = calculateCatchMetricsUI(this);
    
    destroyCatchUI();
    renderCatchUI(this, () => { 
      destroyCatchUI(); 
      this.scene.start('MainScene'); 
    });
    updateCatchUIData(this.score, this.hp);
    drawHeartsUI(this);

    if (this.player) {
      this.player.setPosition(w / 2, this.uiMetrics.playerY);
      this.player.setScale(this.uiMetrics.playerScale);
      this.playerSpeed = w < h ? Math.max(10, Math.floor(w * 0.032)) : 18;
    }

    this.fruitsGroup.forEach((f) => {
      if (f && f.active) {
        f.setDisplaySize(this.uiMetrics.fruitSize, this.uiMetrics.fruitSize);
        f.x = Phaser.Math.Clamp(f.x, this.uiMetrics.fruitSize, w - this.uiMetrics.fruitSize);
      }
    });
  };

  private spawnHealHeart = (): void => {
    if (this.isGameOver) return;
    const pad = this.uiMetrics.fruitSize + 20;
    const hItem = this.add.image(Phaser.Math.Between(pad, this.scale.width - pad), -this.uiMetrics.fruitSize, 'icon-life') as CatchItemImage;
    hItem.setDisplaySize(this.uiMetrics.fruitSize, this.uiMetrics.fruitSize).setDepth(4);
    hItem.isHeart = true;
    this.fruitsGroup.push(hItem);
  };

  public update = (): void => {
    if (this.isGameOver) return;
    const { width: w, height: h } = this.scale;
    const hw = (this.player.displayWidth || 100) / 2;
    
    if (this.moveDirection !== 0) {
      this.player.x = getMovedPlayerX(this.player.x, this.moveDirection, this.playerSpeed, hw, w - hw);
    }

    this.fruitsGroup = this.fruitsGroup.filter((f: CatchItemImage) => {
      if (!f.active) return false;
      
      const adaptiveFruitSpeed = w < h 
        ? this.fruitSpeed * (h / 1920) * 1.6 
        : this.fruitSpeed * (h / 1080);
      
      f.y += Math.max(4, adaptiveFruitSpeed);
      
      if (checkFruitCaughtLogic(f.x, f.y, this.player.x, this.player.y, this.uiMetrics.catchRadius)) {
        f.destroy();
        if (f.isHeart) {
          this.hp = Math.min(100, this.hp + 25);
          drawHeartsUI(this);
        } else {
          this.score++;
          if (this.score >= 20) this.handleEndGame(true);
          else if (this.score % 10 === 0) this.fruitSpeed += this.difficulty === 'easy' ? 0.8 : 1.5;
        }
        try {
          const nativeVid = this.player.video || (this.player.videoTexture && this.player.videoTexture.source) as HTMLVideoElement | null;
          if (nativeVid) nativeVid.currentTime = 0;
        } catch (e) {}
        return false;
      }
      
      if (f.y > this.player.y + 80) {
        f.destroy();
        if (!f.isHeart) {
          this.hp -= 25;
          drawHeartsUI(this);
          if (this.hp <= 0) this.handleEndGame(false);
        }
        return false;
      }
      return true;
    });

    if (!this.isGameOver && this.player) updateCatchUIData(this.score, this.hp);
  };

  private handleEndGame = (isWin = false): void => {
    this.isGameOver = true;
    if (this.spawnTimer) this.spawnTimer.remove(); 
    if (this.healHeartTimer) this.healHeartTimer.remove();
    destroyCatchUI();
    if (isWin) animateCoinExplosion(this, 20);
    
    endCatchGame(
      this, 
      isWin, 
      () => this.scene.start('MainScene'),
      () => this.scene.restart({ difficulty: this.difficulty })
    );
  };
}
