import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface SnakeGameState {
  score: number; hp: number; isGameOver: boolean; isWin: boolean; isWash: boolean; isCrashed: boolean;
  initGame: () => void;
  addScore: (renderCallback: () => void) => void;
  applyPenalty: (renderCallback: () => void, forceGameOver?: boolean) => void;
  resetStore: () => void;
}

const initialValues = { score: 0, hp: 100, isGameOver: false, isWin: false, isWash: false, isCrashed: false };

export const useSnakeGameStore = create<SnakeGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialValues,

    initGame: () => set(initialValues),

    addScore: (renderCallback) => {
      const nextScore = get().score + 1;
      const isWin = nextScore >= 20;

      if (isWin) {
        useMainGameStore.getState().setGameOver(nextScore, undefined, true);
      }

      set({ score: nextScore, isGameOver: isWin, isWin });
      renderCallback();
    },

    applyPenalty: (renderCallback, forceGameOver = false) => {
      const currentScore = get().score;
      const nextScore = currentScore > 0 ? currentScore - 1 : 0;
      const nextHp = forceGameOver ? 0 : get().hp - 25;
      const isOver = nextHp <= 0 || forceGameOver;
      const isWin = get().score >= 20;

      if (isOver) {
        useMainGameStore.getState().setGameOver(nextScore, undefined, isWin);
        if (!isWin) usePetStore.getState().handleGameLoss();
      }

      set({ hp: nextHp, score: nextScore, isCrashed: !isOver, isGameOver: isOver, isWin: isOver ? isWin : false });
      renderCallback();
    },

    resetStore: () => set(initialValues)
  }))
);
