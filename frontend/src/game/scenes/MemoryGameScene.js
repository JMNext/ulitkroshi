import Phaser, { Scene } from 'phaser';
import { 
  createGameBackground, 
  buildCardsGrid, 
  animateFlip, 
  animateMatchSuccess,
  animateCoinExplosion,
  showWinModal 
} from '../../utils/effects/MemoryGameEffects';

export class MemoryGameScene extends Scene {
  constructor() {
    super('MemoryGameScene');
  }

  init(data) {
    this.difficulty = data.difficulty || 'easy';
    this.selectedCards = [];
    this.canClick = false;
    this.matchesFound = 0;
    this.totalPairs = 0;
    this.cardsList = [];

    this.configs = {
      easy: { rows: 4, cols: 3, pairs: 6, shuffleCount: 8 },
      medium: { rows: 4, cols: 4, pairs: 8, shuffleCount: 12 },
      hard: { rows: 5, cols: 6, pairs: 15, shuffleCount: 24 }
    };
  }

  preload() {
    this.load.image('bg-jungli', '/assets/resources/background_jungli.png');
    this.load.image('card-back', '/assets/login_assets/sleep.svg');

    const fruits = ['01', '02', '03', '04', '05', '06', '07', '08', '10', '11', '12', '14', '15', '16'];
    fruits.forEach(id => this.load.image(`fruit-${id}`, `/assets/фрукты/fruits_${id}.png`));
  }

  create() {
    createGameBackground(this);
    
    const config = this.configs[this.difficulty];
    this.totalPairs = config.pairs;

    const availableFruits = ['01', '02', '03', '04', '05', '06', '07', '08', '10', '11', '12', '14', '15', '16'];
    Phaser.Utils.Array.Shuffle(availableFruits);
    const selectedFruits = availableFruits.slice(0, config.pairs);

    let deck = [...selectedFruits, ...selectedFruits];
    Phaser.Utils.Array.Shuffle(deck);

    this.cardsList = buildCardsGrid(this, deck, config);

    this.cardsList.forEach(card => {
      animateFlip(this, card, true, null);
    });

    this.time.delayedCall(2200, () => {
      let flipsCompleted = 0;
      
      this.cardsList.forEach(card => {
        animateFlip(this, card, false, () => {
          flipsCompleted++;
          
          if (flipsCompleted === this.cardsList.length) {
            this.shuffleSelectCards(config.shuffleCount);
          }
        });
      });
    });
    
    this.events.on('shutdown', () => {
      const el = document.getElementById('pet-gamer-dom-video');
      if (el) el.remove();
      if (this.petGamerVideo) {
        this.petGamerVideo.stop();
        this.petGamerVideo.destroy();
      }
    }, this);
  }

  shuffleSelectCards(countToShuffle) {
    if (countToShuffle <= 0) {
      this.canClick = true;
      return;
    }

    const indices = this.cardsList.map((_, i) => i);
    Phaser.Utils.Array.Shuffle(indices);
    const chosenIndices = indices.slice(0, countToShuffle);

    const currentPositions = chosenIndices.map(idx => ({
      x: this.cardsList[idx].x,
      y: this.cardsList[idx].y
    }));

    let shuffledPositions = [];
    let isValidDerangement = false;

    while (!isValidDerangement) {
      shuffledPositions = Phaser.Utils.Array.Shuffle([...currentPositions]);
      isValidDerangement = true;

      for (let i = 0; i < currentPositions.length; i++) {
        if (shuffledPositions[i].x === currentPositions[i].x && shuffledPositions[i].y === currentPositions[i].y) {
          isValidDerangement = false;
          break;
        }
      }
    }

    let animationsCompleted = 0;

    chosenIndices.forEach((cardIdx, index) => {
      const card = this.cardsList[cardIdx];
      const targetPos = shuffledPositions[index];

      this.tweens.add({
        targets: card,
        x: targetPos.x,
        y: targetPos.y,
        duration: 700,
        ease: 'Cubic.out',
        onComplete: () => {
          animationsCompleted++;
          if (animationsCompleted === countToShuffle) {
            this.canClick = true;
          }
        }
      });
    });
  }

  handleCardClick(card) {
    if (!this.canClick || card.isFaceUp || this.selectedCards.includes(card)) return;

    this.canClick = false;

    animateFlip(this, card, true, () => {
      this.selectedCards.push(card);
      
      if (this.selectedCards.length === 2) {
        this.checkMatch();
      } else {
        this.canClick = true;
      }
    });
  }

  checkMatch() {
    this.canClick = false;
    const [card1, card2] = this.selectedCards;

    if (card1.fruitKey === card2.fruitKey) {
      this.matchesFound++;
      this.selectedCards = [];

      this.time.delayedCall(500, () => {
        animateMatchSuccess(this, card1, card2, () => {
          this.canClick = true;

          if (this.matchesFound === this.totalPairs) {
            const currentCoins = this.registry.get('coins') || 0;
            this.registry.set('coins', currentCoins + 20);

            this.canClick = false;
            animateCoinExplosion(this, 20);

            const el = document.getElementById('pet-gamer-dom-video');
            if (el) el.remove();

            this.time.delayedCall(1200, () => {
              if (this.petGamerVideo) {
                this.petGamerVideo.stop();
                this.petGamerVideo.destroy();
              }
              showWinModal(this);
            });
          }
        });
      });
    } else {
      this.time.delayedCall(1000, () => {
        animateFlip(this, card1, false, null);
        animateFlip(this, card2, false, () => {
          this.selectedCards = [];
          this.canClick = true;
        });
      });
    }
  }
}
