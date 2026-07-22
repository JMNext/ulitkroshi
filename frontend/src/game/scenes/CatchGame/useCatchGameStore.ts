import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface CatchGameState {
  score: number;
  hp: number;
  isGameOver: boolean;
  isWin: boolean;
  
  initGame: () => void;
  updateGameState: (score: number, hp: number, isGameOver: boolean, isWin: boolean) => void;
  resetStore: () => void;
}

const initialValues = {
  score: 0,
  hp: 100,
  isGameOver: false,
  isWin: false,
};

export const useCatchGameStore = create<CatchGameState>()(
  subscribeWithSelector((set) => ({
    ...initialValues,

    initGame: () => {
      set({ ...initialValues });
    },

    updateGameState: (score, hp, isGameOver, isWin) => {
      set({ score, hp, isGameOver, isWin });
    },

    resetStore: () => {
      set(initialValues);
    },
  }))
);
