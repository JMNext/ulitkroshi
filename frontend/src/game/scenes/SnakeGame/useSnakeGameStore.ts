import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface SnakeGameState {
  score: number;
  hp: number;
  isGameOver: boolean;
  isWin: boolean;
  isWash: boolean;
  isCrashed: boolean;
  
  initGame: () => void;
  updateGameState: (score: number, hp: number, isGameOver: boolean, isWin: boolean, isWash: boolean, isCrashed: boolean) => void;
  resetStore: () => void;
}

const initialValues = {
  score: 0,
  hp: 100,
  isGameOver: false,
  isWin: false,
  isWash: false,
  isCrashed: false,
};

export const useSnakeGameStore = create<SnakeGameState>()(
  subscribeWithSelector((set) => ({
    ...initialValues,

    initGame: () => {
      set({ ...initialValues });
    },

    updateGameState: (score, hp, isGameOver, isWin, isWash, isCrashed) => {
      set({ score, hp, isGameOver, isWin, isWash, isCrashed });
    },

    resetStore: () => {
      set(initialValues);
    },
  }))
);
