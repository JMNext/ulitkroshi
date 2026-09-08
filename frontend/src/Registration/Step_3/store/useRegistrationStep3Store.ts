import { create } from 'zustand';
import { useAuthStore } from '@/api/store/useAuthStore';
import { isMock } from '@/api/authApi';

export type CaptchaMode = 'select' | 'confirm' | 'verify' | 'error';

interface Step3State {
  sel: number[]; 
  corr: number[]; 
  mode: CaptchaMode; 
  shake: boolean; 
  fruitOrder: number[]; 
  attempts: number; 
  errorMessage: string; 
  isSubmitting: boolean;      
  isLogin: boolean;
  toggleSelect: (id: number, sessionId: string, onComplete: () => void) => Promise<void>; 
  saveFirstStep: () => void; 
  generateNewOrder: () => void; 
  setIsLogin: (isLogin: boolean) => void;
  resetStore: (keepIsLogin?: boolean) => void;
}

const FRUIT_MAPPING: Record<number, string> = {
  0: "apple", 1: "banana", 2: "orange", 3: "strawberry", 4: "grape",
  5: "apple", 6: "banana", 7: "orange", 8: "strawberry", 9: "grape",
  10: "apple", 11: "banana", 12: "orange", 13: "strawberry", 14: "grape", 15: "apple"
};

const genOrder = (): number[] => 
  Array.from({ length: 16 }, (_, i) => i)
    .sort(() => Math.random() - 0.5);

const initial = { 
  sel: [], 
  corr: [],
  mode: 'select' as CaptchaMode, 
  shake: false, 
  attempts: 0, 
  errorMessage: '',
  isSubmitting: false,
};

let shakeTimeoutId: ReturnType<typeof setTimeout> | null = null;
let clearFruitsTimeoutId: ReturnType<typeof setTimeout> | null = null;

const clearTimers = () => {
  if (shakeTimeoutId) clearTimeout(shakeTimeoutId);
  if (clearFruitsTimeoutId) clearTimeout(clearFruitsTimeoutId);
};

export const useRegistrationStep3Store = create<Step3State>((set, get) => ({
  ...initial,
  isLogin: false,
  fruitOrder: genOrder(),

  toggleSelect: async (id, sessionId, onComplete) => {
    const { mode, sel, corr, isSubmitting, attempts, isLogin } = get();
    if (mode === 'error' || isSubmitting || attempts >= 3) return;
    
    const next = sel.includes(id) ? sel.filter((v) => v !== id) : [...sel, id];
    if (next.length > 4) return;
    
    set({ sel: next, errorMessage: '' });

    if (next.length === 4) {
      set({ isSubmitting: true });

      const handleInputFailure = (msg: string) => {
        const nextAttempts = attempts + 1;
        clearTimers();
        
        if (nextAttempts >= 3) {
          set({ isSubmitting: false, mode: 'error', shake: true, attempts: nextAttempts, errorMessage: 'Превышено количество попыток!' });
        } else {
          set({ isSubmitting: false, shake: true, attempts: nextAttempts, errorMessage: msg });
          shakeTimeoutId = setTimeout(() => set({ shake: false }), 500);
          clearFruitsTimeoutId = setTimeout(() => {
            set({ sel: [], mode: corr.length > 0 ? 'verify' : 'select' });
          }, 1200);
        }
      };

      const verifyServerFruit = async (fallbackMsg: string) => {
        try {
          const fruitNames = next.map(idx => FRUIT_MAPPING[idx] || "apple");
          await useAuthStore.getState().verifyFruit(sessionId, fruitNames);
          set({ isSubmitting: false });
          onComplete();
        } catch (err: any) {
          handleInputFailure(err.response?.data?.error || fallbackMsg);
        }
      };

      if (isMock) {
        set({ isSubmitting: false });
        if (isLogin) {
          localStorage.setItem("mock_accessToken", "true");
          onComplete();
        } else if (mode === 'select') {
          set({ corr: next, sel: [], mode: 'confirm' });
        } else if (mode === 'verify') {
          if (next.length === corr.length && next.every((v, i) => v === corr[i])) {
            localStorage.setItem("mock_accessToken", "true");
            onComplete();
          } else {
            handleInputFailure('Не совпало с первым вводом! Попробуй еще раз.');
          }
        }
        return;
      }

      if (isLogin) {
        await verifyServerFruit('Неверный фруктовый пароль');
        return;
      }

      if (mode === 'select') {
        set({ corr: next, sel: [], isSubmitting: false, mode: 'confirm' });
      } else if (mode === 'verify') {
        if (next.length === corr.length && next.every((v, i) => v === corr[i])) {
          await verifyServerFruit('Ошибка проверки капчи на сервере');
        } else {
          handleInputFailure('Не совпало с первым вводом! Попробуй еще раз.');
        }
      }
    }
  },

  saveFirstStep: () => set({ sel: [], mode: 'verify', errorMessage: '', isSubmitting: false }),
  generateNewOrder: () => set({ fruitOrder: genOrder() }),
  setIsLogin: (isLogin) => set({ isLogin }),
  resetStore: (keepIsLogin = false) => {
    clearTimers();
    set({ 
      ...initial, 
      isLogin: keepIsLogin ? get().isLogin : false,
      fruitOrder: genOrder() 
    });
  }
}));
