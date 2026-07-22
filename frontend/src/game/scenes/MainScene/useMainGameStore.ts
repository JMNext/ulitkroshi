import { create } from 'zustand';

interface MainGameState {
  coins: number;
  username: string;
  setCoins: (coins: number) => void;
  setUsername: (name: string) => void;
  resetStore: () => void;
}

const initialValues = {
  coins: 0,
  username: 'Player',
};

export const useMainGameStore = create<MainGameState>((set) => ({
  ...initialValues,
  setCoins: (coins) => set({ coins }),
  setUsername: (username) => set({ username }),
  resetStore: () => set((state) => ({
    ...initialValues,
    username: state.username,
  })),
}));
