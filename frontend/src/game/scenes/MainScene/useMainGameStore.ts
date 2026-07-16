import { create } from 'zustand';

interface MainGameState {
  coins: number;
  hp: number;
  petName: string;
  username: string;
  activePetIndex: number;
  // ДОБАВЛЯЕМ СЮДА: Ссылка на текущую активную сцену Phaser
  currentScene: any | null;
  
  setCoins: (coins: number) => void;
  setHp: (hp: number) => void;
  setPetName: (name: string) => void;
  setUsername: (name: string) => void;
  setActivePetIndex: (index: number) => void;
  setCurrentScene: (scene: any | null) => void; // Экшен для записи сцены
  resetStore: () => void;
}

const initialValues = {
  coins: 0,
  hp: 100,
  petName: 'Булька',
  username: 'Player',
  activePetIndex: 0,
  currentScene: null, // Изначально сцены нет
};

export const useMainGameStore = create<MainGameState>((set) => ({
  ...initialValues,
  setCoins: (coins) => set({ coins }),
  setHp: (hp) => set({ hp }),
  setPetName: (petName) => set({ petName }),
  setUsername: (username) => set({ username }),
  setActivePetIndex: (activePetIndex) => set({ activePetIndex }),
  setCurrentScene: (currentScene) => set({ currentScene }),
  resetStore: () => set(initialValues),
}));
