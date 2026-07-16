import { create } from 'zustand';

interface CatchGameState {
  score: number;
  hp: number;
  isGameOver: boolean;
  
  setScore: (score: number) => void;
  setHp: (hp: number) => void;
  setGameOver: (isGameOver: boolean) => void;
  resetStore: () => void;
}

const initialValues = {
  score: 0,
  hp: 100,
  isGameOver: false,
};

export const useCatchGameStore = create<CatchGameState>((set) => ({
  ...initialValues,

  setScore: (score) => set({ score }),
  setHp: (hp) => set({ hp }),
  setGameOver: (isGameOver) => set({ isGameOver }),
  resetStore: () => set(initialValues),
}));
