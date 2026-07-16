import { create } from 'zustand';

interface MemoryGameState {
  score: number;
  isGameOver: boolean;
  isWash: boolean;
  
  setScore: (score: number) => void;
  setGameOver: (isGameOver: boolean) => void;
  setWash: (isWash: boolean) => void;
  resetStore: () => void;
}

const initialValues = {
  score: 0,
  isGameOver: false,
  isWash: false,
};

export const useMemoryGameStore = create<MemoryGameState>((set) => ({
  ...initialValues,

  setScore: (score) => set({ score }),
  setGameOver: (isGameOver) => set({ isGameOver }),
  setWash: (isWash) => set({ isWash }),
  resetStore: () => set(initialValues),
}));
