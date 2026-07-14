import * as Phaser from 'phaser';
import { checkCardsMatchLogic, generateDeckLogic } from './MemoryGameLogic';
import { 
  renderMemoryUI, 
  destroyMemoryUI, 
  buildCardsGridUI, 
  animateCardFlipUI, 
  playPetGamerMatchAnim, 
  updateMemoryScoreUI, 
  animateIntroCloseUI, 
  animateMassShuffleUI, 
  FRUITS 
} from './MemoryGameUI';
import { BackgroundManager } from '../../../BackgroundManager';
// @ts-ignore
import { animateCoinExplosion, createBaseGameOverModal } from '../../../ui/components/GameOverModalUI';

export interface MemoryConfig { rows: number; cols: number; pairs: number; shuffleCount: number; }
export interface MemoryCardContainer extends Phaser.GameObjects.Container { fruitKey: string; fruitImg: Phaser.GameObjects.Image; shirtImg: Phaser.GameObjects.Image; isFaceUp: boolean; }

export class MemoryGameScene extends Phaser.Scene {
  public difficulty = 'easy';
  public selectedCards: MemoryCardContainer[] = [];
  public canClick = false;
  public matchesFound = 0;
  public cardsList: MemoryCardContainer[] = [];
  public totalPairs = 0;
  private stepsTaken = 0; 

  private configs: Record<string, MemoryConfig> = {
    easy: { rows: 4, cols: 4, pairs: 8, shuffleCount: 16 },
    medium: { rows: 6, cols: 6, pairs: 18, shuffleCount: 36 },
    hard: { rows: 8, cols: 8, pairs: 32, shuffleCount: 64 },
  };
  private mTimer: Phaser.Time.TimerEvent | null = null;
  private pTimer: Phaser.Time.TimerEvent | null = null;

  constructor() { 
    super('MemoryGameScene'); 
  }

  public init = (data: { difficulty?: string }): void => {
    this.difficulty = data.difficulty || 'easy';
    this.selectedCards = []; 
    this.canClick = false; 
    this.matchesFound = 0; 
    this.cardsList = [];
    this.stepsTaken = 0; 
  };

  public preload = (): void => {
    this.load.image('card-back', '/assets/buttom_menu-icons/sleep.svg');
    FRUITS.forEach(id => this.load.image(`fruit-${id}`, `/assets/fruits/fruits_${id}.png`));
  };

  public create = (): void => {
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    renderMemoryUI(() => this.exitGame());
    
    const cfg = this.configs[this.difficulty];
    this.totalPairs = cfg.pairs;

    const fullDeck = generateDeckLogic(cfg.pairs, FRUITS);
    this.cardsList = buildCardsGridUI(this, fullDeck, cfg, c => this.handleCardClick(c));
    this.cardsList.forEach(c => animateCardFlipUI(this, c, true, null));

    this.pTimer = this.time.delayedCall(2200, () => {
      animateIntroCloseUI(this, this.cardsList, () => {
        animateMassShuffleUI(this, this.cardsList, () => this.canClick = true);
      });
    });

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => { 
      this.scale.off('resize', this.handleResize, this);
      this.cleanup(); 
      destroyMemoryUI(); 
    }, this);
  };

  private handleResize = (): void => {
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    destroyMemoryUI();
    renderMemoryUI(() => this.exitGame());
  };

  public handleCardClick = (card: MemoryCardContainer): void => {
    if (!this.canClick || card.isFaceUp || this.selectedCards.includes(card)) return;
    this.canClick = false;
    
    animateCardFlipUI(this, card, true, () => {
      this.selectedCards.push(card);
      if (this.selectedCards.length === 2) {
        this.stepsTaken++; 
        this.verifyMatch();
      } else {
        this.canClick = true;
      }
    });
  };

  private verifyMatch = (): void => {
    const [c1, c2] = this.selectedCards;

    if (checkCardsMatchLogic(c1.fruitKey, c2.fruitKey)) {
      this.matchesFound++; 
      this.selectedCards = [];
      updateMemoryScoreUI(this.matchesFound); 
      playPetGamerMatchAnim();
      
      this.mTimer = this.time.delayedCall(500, () => {
        if (!c1.scene || !c2.scene) return;
        this.tweens.add({
          targets: [c1, c2], scaleX: 0, scaleY: 0, alpha: 0, duration: 300, ease: 'Back.easeIn',
          onComplete: () => {
            c1.destroy(); 
            c2.destroy();
            
            if (this.matchesFound === this.totalPairs) {
              this.canClick = false;
              destroyMemoryUI();
              animateCoinExplosion(this, 20);
              
              this.time.delayedCall(1200, () => {
                createBaseGameOverModal(this, { 
                  title: 'ПОБЕДА!', 
                  resultLabel: 'ХОДЫ', 
                  score: this.stepsTaken, 
                  buttonText: 'В МЕНЮ', 
                  isWin: true, 
                  onBack: () => this.exitGame() 
                });
              });
            } else {
              this.canClick = true;
            }
          }
        });
      });
    } else {
      this.mTimer = this.time.delayedCall(1000, () => {
        if (!c1.scene || !c2.scene) return;
        let done = 0;
        const cb = () => ++done === 2 && (this.selectedCards = [], this.canClick = true);
        animateCardFlipUI(this, c1, false, cb); 
        animateCardFlipUI(this, c2, false, cb);
      });
    }
  };

  private exitGame = (): void => { 
    this.cleanup(); 
    destroyMemoryUI(); 
    this.scene.start('MainScene'); 
  };

  private cleanup = (): void => { 
    if (this.mTimer) this.mTimer.remove(); 
    if (this.pTimer) this.pTimer.remove(); 
  };
}
