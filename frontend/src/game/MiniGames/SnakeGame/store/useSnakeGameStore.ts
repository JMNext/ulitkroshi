import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { useApiStore } from "@/api/store/useApiStore";
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
        useApiStore.getState().executeAction("mini_game_reward", 5);
        useMainGameStore.setState({ gameOverResult: { isWin: true, rewardText: "+5" } });
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
        const finalCoins = isWin ? 5 : 2;
        useApiStore.getState().executeAction("mini_game_reward", finalCoins);
        useMainGameStore.setState({ gameOverResult: { isWin, rewardText: `+${finalCoins}` } });
        if (!isWin) usePetStore.getState().handleGameLoss();
      }

      set({ hp: nextHp, score: nextScore, isCrashed: !isOver, isGameOver: isOver, isWin: isOver ? isWin : false });
      renderCallback();
    },

    resetStore: () => set(initialValues)
  }))
);
