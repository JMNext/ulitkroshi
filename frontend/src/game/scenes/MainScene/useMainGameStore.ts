import { create } from 'zustand';

interface MainGameState {
  coins: number;
  hp: number;
  petName: string;
  username: string;
  activePetIndex: number;
  setCoins: (coins: number) => void;
  setHp: (hp: number) => void;
  setPetName: (name: string) => void;
  setUsername: (name: string) => void;
  setActivePetIndex: (index: number) => void;
  resetStore: () => void;
}

const initialValues = {
  coins: 0,
  hp: 100,
  petName: 'Булька',
  username: 'Player',
  activePetIndex: 0,
};

export const useMainGameStore = create<MainGameState>((set) => ({
  ...initialValues,
  setCoins: (coins) => set({ coins }),
  setHp: (hp) => set({ hp }),
  
  setPetName: (petName) => {
    // ВРЕМЕННЫЙ ЛОГ ДЛЯ ОТЛАДКИ — откройте консоль браузера F12
    console.log(`%c[useMainGameStore] setPetName вызван с выпиской: "${petName}"`, "color: #00ff00; font-weight: bold;");
    console.trace(); // Покажет точную строку кода и файл, откуда пришёл вызов
    set({ petName });
  },
  
  setUsername: (username) => set({ username }),
  setActivePetIndex: (activePetIndex) => set({ activePetIndex }),
  
  // Безопасный сброс, не затирающий имя
  resetStore: () => set((state) => ({
    ...initialValues,
    petName: state.petName,
    username: state.username,
  })),
}));
