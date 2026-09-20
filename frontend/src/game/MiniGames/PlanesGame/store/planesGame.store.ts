import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface PlanesGameState {
  score: number;
  hp: number;
  isGameOver: boolean;
  isWin: boolean;
  isCrashed: boolean;
  isFinishing: boolean;
  initGame: () => void;
  addScore: (renderCallback: () => void) => void;
  applyPenalty: (renderCallback: () => void, forceGameOver?: boolean) => void;
  resetStore: () => void;
}

const initialValues = { score: 0, hp: 100, isGameOver: false, isWin: false, isCrashed: false, isFinishing: false };
let crashTimeoutId: number | null = null;

export const usePlanesGameStore = create<PlanesGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialValues,

    initGame: () => {
      if (crashTimeoutId) clearTimeout(crashTimeoutId);
      set(initialValues);
    },

    addScore: (renderCallback) => {
      if (get().isGameOver || get().isFinishing) return;
      const nextScore = get().score + 1;
      const reachTarget = nextScore >= 20;

      if (reachTarget) {
        set({ score: nextScore, isFinishing: true });
      } else {
        set({ score: nextScore });
      }
      renderCallback();
    },

    applyPenalty: (renderCallback, forceGameOver = false) => {
      if (get().isCrashed && !forceGameOver) {
        renderCallback();
        return;
      }
      if (crashTimeoutId) clearTimeout(crashTimeoutId);

      const currentScore = get().score;
      const nextScore = currentScore > 0 ? currentScore - 1 : 0;
      const nextHp = forceGameOver ? 0 : get().hp - 25;
      const isOver = nextHp <= 0 || forceGameOver;
      const isWin = get().score >= 20;

      if (isOver) {
        useMainGameStore.getState().setGameOver(nextScore, undefined, false);
        if (!isWin) usePetStore.getState().handleGameLoss();
        set({ hp: 0, score: nextScore, isGameOver: true, isWin: false, isFinishing: false });
      } else {
        set({ hp: nextHp, score: nextScore, isCrashed: true });
      }

      renderCallback();

      if (!isOver) {
        crashTimeoutId = window.setTimeout(() => set({ isCrashed: false }), 400);
      }
    },

    resetStore: () => {
      if (crashTimeoutId) clearTimeout(crashTimeoutId);
      set(initialValues);
    }
  }))
);
