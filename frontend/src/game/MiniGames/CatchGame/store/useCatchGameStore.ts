import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

interface CatchGameState {
  score: number;
  hp: number;
  isGameOver: boolean;
  isWin: boolean;
  petX: number;
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
      
      set({ score: nextScore, isGameOver: isWin, isWin: isWin });
      renderCallback();

      if (isWin) {
        useMainGameStore.getState().addTestCoins(10);
      }
    },

    applyBombPenalty: (renderCallback) => {
      const currentScore = get().score;
      const nextScore = currentScore > 0 ? currentScore - 1 : 0;
      const nextHp = get().hp - 25;
      const isOver = nextHp <= 0;

      set({ hp: nextHp, score: nextScore, isGameOver: isOver, isWin: false });
      renderCallback();

      if (isOver) {
        useMainGameStore.getState().addTestCoins(3);
        usePetStore.getState().handleGameLoss();
      }
    },

    applyMissPenalty: (renderCallback) => {
      const currentScore = get().score;
      const nextScore = currentScore > 0 ? currentScore - 1 : 0;
      const nextHp = get().hp - 25;
      const isOver = nextHp <= 0;

      set({ hp: nextHp, score: nextScore, isGameOver: isOver, isWin: false });
      renderCallback();

      if (isOver) {
        useMainGameStore.getState().addTestCoins(3);
        usePetStore.getState().handleGameLoss();
      }
    },

    setPetX: (x) => set({ petX: x }),

    resetStore: () => set(initialValues)
  }))
);
