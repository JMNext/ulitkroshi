import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const createGameDeck = (pairsCount: number, availableCards: string[]): string[] => {
  if (!availableCards || availableCards.length === 0) return [];
  const shuffledPool = shuffleArray(availableCards);
  let selectedCards: string[] = [];
  while (selectedCards.length < pairsCount) {
    const neededCount = pairsCount - selectedCards.length;
    selectedCards = [...selectedCards, ...shuffledPool.slice(0, neededCount)];
  }
  return shuffleArray([...selectedCards, ...selectedCards]);
};

interface MemoryGameState {
  score: number; isGameOver: boolean; isWash: boolean; deck: string[]; openedCards: number[]; matchedCards: string[]; canClick: boolean; isPreview: boolean; hasMisses: boolean;
  initGame: (pairsCount: number, availableCards: string[]) => void;
  setSwappedDeck: (newDeck: string[]) => void;
  setCanClickTrue: () => void;
  handleCardClick: (clickedIndex: number, totalPairs: number) => void;
  setWash: (wash: boolean) => void;
  resetStore: () => void;
}

type MemoryDifficulty = "easy" | "medium" | "hard" | "memory";

const initialValues = { score: 0, isGameOver: false, isWash: false, deck: [], openedCards: [], matchedCards: [], canClick: false, isPreview: true, hasMisses: false };

export const useMemoryGameStore = create<MemoryGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialValues,

    initGame: (pairsCount, availableCards) => {
      set({ ...initialValues, deck: createGameDeck(pairsCount, availableCards), isPreview: true, canClick: false, hasMisses: false });
    },

    setSwappedDeck: (newDeck) => set({ deck: newDeck }),
    setCanClickTrue: () => set({ canClick: true }),

    handleCardClick: (clickedIndex, totalPairs) => {
      const { canClick, openedCards, deck, matchedCards, score, hasMisses } = get();
      if (!canClick || openedCards.includes(clickedIndex) || matchedCards.includes(deck[clickedIndex])) return;

      const nextOpenedCards = [...openedCards, clickedIndex];
      set({ openedCards: nextOpenedCards });
      if (nextOpenedCards.length !== 2) return;

      set({ canClick: false });
      const [firstIndex, secondIndex] = nextOpenedCards;
      const isPairMatched = deck[firstIndex] === deck[secondIndex];

      if (isPairMatched) {
        const nextScore = score + 1;
        const isWin = nextScore === totalPairs;

        if (isWin) {
          const modeKey = !hasMisses ? `memory_perfect_${totalPairs}` : "memory";
          useMainGameStore.getState().setGameOver(nextScore, modeKey as MemoryDifficulty, true);
        }

        setTimeout(() => {
          set({
            matchedCards: [...matchedCards, deck[firstIndex]],
            openedCards: [],
            score: nextScore,
            isWash: true,
            canClick: !isWin,
            isGameOver: isWin
          });
        }, 300);
      } else {
        setTimeout(() => {
          set({ openedCards: [], canClick: true, hasMisses: true });
        }, 800);
      }
    },

    setWash: (isWash) => set({ isWash }),
    resetStore: () => set(initialValues)
  }))
);
