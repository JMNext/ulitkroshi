import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const generateDeckLogic = (pairsCount: number, fruitsPool: string[]): string[] => {
  if (!fruitsPool || fruitsPool.length === 0) return [];
  const shuffledPool = shuffleArray(fruitsPool);
  let selectedFruits: string[] = [];
  while (selectedFruits.length < pairsCount) {
    const need = pairsCount - selectedFruits.length;
    selectedFruits = [...selectedFruits, ...shuffledPool.slice(0, need)];
  }
  return [...selectedFruits, ...selectedFruits];
};

interface MemoryGameState {
  score: number;
  isGameOver: boolean;
  isWash: boolean;
  deck: string[];
  openedCards: number[];
  matchedCards: string[];
  canClick: boolean;
  
  initGame: (pairsCount: number, fruitsPool: string[]) => void;
  handleCardClick: (index: number, totalPairs: number) => void;
  setWash: (isWash: boolean) => void;
  resetStore: () => void;
}

const initialValues = {
  score: 0,
  isGameOver: false,
  isWash: false,
  deck: [],
  openedCards: [],
  matchedCards: [],
  canClick: false,
};

export const useMemoryGameStore = create<MemoryGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialValues,

    initGame: (pairsCount, fruitsPool) => {
      const initialDeck = generateDeckLogic(pairsCount, fruitsPool);
      set({ ...initialValues, deck: initialDeck, canClick: false });

      setTimeout(() => {
        const currentDeck = get().deck;
        const shuffledDeck = shuffleArray(currentDeck);
        set({ 
          deck: shuffledDeck,
          canClick: true 
        });
      }, 2200);
    },

    handleCardClick: (index, totalPairs) => {
      const { canClick, openedCards, deck, matchedCards, score } = get();
      
      if (!canClick || openedCards.includes(index) || matchedCards.includes(deck[index]) || openedCards.length >= 2) return;

      const nextOpened = [...openedCards, index];
      set({ openedCards: nextOpened });

      if (nextOpened.length === 2) {
        set({ canClick: false });
        const [firstIdx, secondIdx] = nextOpened;

        if (deck[firstIdx] === deck[secondIdx]) {
          const nextScore = score + 1;
          
          setTimeout(() => {
            set({
              matchedCards: [...matchedCards, deck[firstIdx]],
              openedCards: [],
              score: nextScore,
              isWash: true,
              canClick: nextScore < totalPairs
            });

            if (nextScore === totalPairs) {
              set({ isGameOver: true });
            }
          }, 200);
        } else {
          setTimeout(() => {
            set({ openedCards: [], canClick: true });
          }, 250);
        }
      }
    },

    setWash: (isWash) => set({ isWash }),
    resetStore: () => set(initialValues),
  }))
);
