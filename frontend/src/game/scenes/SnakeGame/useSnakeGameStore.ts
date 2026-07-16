import { create } from 'zustand';

interface SnakeGameState {
  score: number;
  hp: number;
  isGameOver: boolean;
  isWash: boolean;
  isCrashed: boolean;
  
  // Экшены для Phaser
  setGameState: (score: number, hp: number, isGameOver: boolean, isWash: boolean, isCrashed: boolean) => void;
  setWash: (isWash: boolean) => void;
  setCrashed: (isCrashed: boolean) => void;
  resetStore: () => void;
}

const initialValues = {
  score: 0,
  hp: 100,
  isGameOver: false,
  isWash: false,
  isCrashed: false,
};

export const useSnakeGameStore = create<SnakeGameState>((set) => ({
  ...initialValues,

  setGameState: (score, hp, isGameOver, isWash, isCrashed) => set({ score, hp, isGameOver, isWash, isCrashed }),
  setWash: (isWash) => set({ isWash }),
  setCrashed: (isCrashed) => set({ isCrashed }),
  resetStore: () => set(initialValues),
}));
