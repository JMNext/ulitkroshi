import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CatchGameState {
  score: number; hp: number; isGameOver: boolean; isWin: boolean; petX: number;
  initGame: () => void;
  addScore: (renderCallback: () => void) => void;
  applyBombPenalty: (renderCallback: () => void) => void;
  applyMissPenalty: (renderCallback: () => void) => void;
  setPetX: (x: number) => void;
  resetStore: () => void;
}

const initialValues = { score: 0, hp: 100, isGameOver: false, isWin: false, petX: 0 };

export const useCatchGameStore = create<CatchGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialValues,

    initGame: () => set(initialValues),

    addScore: (renderCallback) => {
      const nextScore = get().score + 1;
      const isWin = nextScore >= 20;

      if (isWin) {
        useMainGameStore.getState().setGameOver(nextScore, undefined, true);
      }

      set({ score: nextScore, isGameOver: isWin, isWin: isWin });
      renderCallback();
    },

    applyBombPenalty: (renderCallback) => {
      const currentScore = get().score;
      const nextScore = currentScore > 0 ? currentScore - 1 : 0;
      const nextHp = get().hp - 25;
      const isOver = nextHp <= 0;

      if (isOver) {
        useMainGameStore.getState().setGameOver(nextScore, undefined, false);
        usePetStore.getState().handleGameLoss();
      }

      set({ hp: nextHp, score: nextScore, isGameOver: isOver, isWin: false });
      renderCallback();
    },

    applyMissPenalty: (renderCallback) => {
      const currentScore = get().score;
      const nextScore = currentScore > 0 ? currentScore - 1 : 0;
      const nextHp = get().hp - 25;
      const isOver = nextHp <= 0;

      if (isOver) {
        useMainGameStore.getState().setGameOver(nextScore, undefined, false);
        usePetStore.getState().handleGameLoss();
      }

      set({ hp: nextHp, score: nextScore, isGameOver: isOver, isWin: false });
      renderCallback();
    },

    setPetX: (x) => set({ petX: x }),
    resetStore: () => set(initialValues)
  }))
);
