import { buildCardsGridUI, animateCardFlipUI, animateMassShuffleUI } from './MemoryPhaserRenderer';
import { checkCardsMatchLogic } from '../MemoryGameLogic';
import { useMemoryGameStore } from '../useMemoryGameStore';

export const buildGridUIEngine = (scene: any, deck: string[]): void => {
  scene.canClick = false;
  scene.cardsList = buildCardsGridUI(
    scene,
    deck,
    scene.cfgs[scene.difficulty] || scene.cfgs.easy,
    (c: any): void => handleMemoryCardClick(scene, c)
  );
  
  const total = scene.cardsList.length;
  for (let i = 0; i < total; i++) {
    animateCardFlipUI(scene, scene.cardsList[i], true, null);
  }

  scene.pTimer = scene.time.delayedCall(2200, (): void => {
    let closed = 0;
    for (let i = 0; i < total; i++) {
      const c = scene.cardsList[i];
      if (c?.scene) {
        animateCardFlipUI(scene, c, false, (): void => {
          closed++;
          if (closed === total) {
            animateMassShuffleUI(scene, scene.cardsList, (): void => {
              scene.canClick = true;
            });
          }
        });
      }
    }
  });
};

export const handleMemoryCardClick = (scene: any, card: any): void => {
  if (!scene.canClick || card.isFaceUp || scene.selectedCards.includes(card)) return;
  scene.canClick = false;
  
  animateCardFlipUI(scene, card, true, (): void => {
    scene.selectedCards.push(card);
    if (scene.selectedCards.length === 2) {
      scene.stepsTaken++;
      verifyMemoryMatch(scene);
    } else {
      scene.canClick = true;
    }
  });
};

const verifyMemoryMatch = (scene: any): void => {
  const c1 = scene.selectedCards[0];
  const c2 = scene.selectedCards[1];
  
  if (checkCardsMatchLogic(c1.fruitKey, c2.fruitKey)) {
    scene.matchesFound++;
    scene.selectedCards = [];
    
    useMemoryGameStore.getState().setScore(scene.matchesFound);
    useMemoryGameStore.getState().setWash(true);
    
    scene.mTimer = scene.time.delayedCall(500, (): void => {
      if (!c1.scene || !c2.scene) return;
      scene.tweens.add({
        targets: [c1, c2],
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: (): void => {
          c1.destroy();
          c2.destroy();
          if (scene.matchesFound === scene.totalPairs) {
            scene.canClick = false;
            useMemoryGameStore.getState().setGameOver(true);
            scene.events.emit('ui_trigger_coin_explosion', scene, 20);
          } else {
            scene.canClick = true;
          }
        },
      });
    });
  } else {
    scene.mTimer = scene.time.delayedCall(1000, (): void => {
      if (!c1.scene || !c2.scene) return;
      let d = 0;
      const cb = (): void => {
        d++;
        if (d === 2) {
          scene.selectedCards = [];
          scene.canClick = true;
        }
      };
      animateCardFlipUI(c1.scene, c1, false, cb);
      animateCardFlipUI(c2.scene, c2, false, cb);
    });
  }
};
