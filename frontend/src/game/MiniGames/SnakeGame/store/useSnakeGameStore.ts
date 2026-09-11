import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface SnakeGameState {
  score: number;
  hp: number;
  isGameOver: boolean;
  isWin: boolean;
  isWash: boolean;
  isCrashed: boolean;
  initGame: () => void;
  addScore: (renderCallback: () => void) => void;
  applyPenalty: (renderCallback: () => void, forceGameOver?: boolean) => void;
  resetStore: () => void;
}

const initialValues = {
  score: 0,
  hp: 100,
  isGameOver: false,
  isWin: false,
  isWash: false,
  isCrashed: false
};

export const useSnakeGameStore = create<SnakeGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialValues,

    initGame: () => set(initialValues),

    addScore: (renderCallback) => {
      const nextScore = get().score + 1;
      const isWin = nextScore >= 20;

      set({
        score: nextScore,
        isGameOver: isWin,
        isWin: isWin
      });

      renderCallback();

      if (isWin) {
        useMainGameStore.getState().addTestCoins();
      }
    },

    applyPenalty: (renderCallback, forceGameOver = false) => {
      const currentScore = get().score;
      const nextScore = currentScore > 0 ? currentScore - 1 : 0;
      const nextHp = forceGameOver ? 0 : get().hp - 25;
      const isOver = nextHp <= 0 || forceGameOver;
      const isWin = get().score >= 20;

      set({
        hp: nextHp,
        score: nextScore,
        isCrashed: !isOver,
        isGameOver: isOver,
        isWin: isOver ? isWin : false
      });

      renderCallback();

      if (isOver) {
        useMainGameStore.getState().addTestCoins();
        if (!isWin) {
          usePetStore.getState().handleGameLoss();
        }
      } else {
        setTimeout(() => {
          set({ isCrashed: false });
          renderCallback();
        }, 600);
      }
    },

    resetStore: () => set(initialValues)
  }))
);
