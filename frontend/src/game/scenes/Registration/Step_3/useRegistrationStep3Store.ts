import { create } from 'zustand';
import { useAuthStore } from '../../../../store/useAuthStore';

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
  setCaptchaState: (sel: number[], corr: number[], mode: CaptchaMode, shake: boolean) => void;
  toggleSelect: (id: number) => void; 
  undoLastSelect: () => void; 
  verifyAndSubmit: (currentSel: number[], sessionId: string) => Promise<boolean>; 
  generateNewOrder: () => void; 
  resetStore: () => void;
  fullReset: () => void;
}

const generateShuffledArray = (): number[] => {
  const arr = Array.from({ length: 16 }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const initialValues = {
  sel: [], 
  corr: [], 
  mode: 'select' as CaptchaMode, 
  shake: false,
  fruitOrder: [], 
  attempts: 0, 
  errorMessage: '', 
  isSubmitting: false,
};

export const useRegistrationStep3Store = create<Step3State>((set, get) => ({
  ...initialValues,
  fruitOrder: generateShuffledArray(),

  setCaptchaState: (sel, corr, mode, shake) => set({ sel, corr, mode, shake }),

  undoLastSelect: () => {
    const { mode, sel } = get();
    if (mode !== 'confirm' && mode !== 'error' && sel.length) {
      set({ sel: sel.slice(0, -1), errorMessage: '' });
    }
  },

  toggleSelect: (id) => {
    const { mode, sel, isSubmitting } = get();
    if (mode === 'confirm' || mode === 'error' || isSubmitting) return;
    
    const next = sel.includes(id) ? sel.filter((v) => v !== id) : [...sel, id];
    if (next.length <= 4) {
      set({ 
        sel: next, 
        ...(mode === 'verify' ? {} : { mode: next.length === 4 ? 'confirm' : 'select' }) 
      });
    }
  },

  verifyAndSubmit: async (currentSel, sessionId) => {
    const { corr, attempts } = get();
    
    if (currentSel.length === corr.length && currentSel.every((v, i) => v === corr[i])) {
      set({ isSubmitting: true, errorMessage: '' });
      try {
        await useAuthStore.getState().verifyFruit(sessionId, currentSel.map(String));
        set({ isSubmitting: false });
        return true;
      } catch (err) {
        set({ 
          isSubmitting: false, 
          sel: [], 
          errorMessage: err instanceof Error ? err.message : 'Ошибка сервера' 
        });
        return false;
      }
    } else {
      const nextAttempts = attempts + 1;
      set({ 
        mode: 'error', 
        shake: true, 
        attempts: nextAttempts, 
        errorMessage: 'Ой-ой, что-то не сходится!' 
      });
      setTimeout(() => set({ sel: [], shake: false, mode: 'verify' }), 1500);
      return false;
    }
  },

  generateNewOrder: () => set({ fruitOrder: generateShuffledArray() }),
  
  resetStore: () => set({ ...initialValues, fruitOrder: generateShuffledArray() }),

  fullReset: () => set({ 
    ...initialValues, 
    fruitOrder: generateShuffledArray() 
  })
}));
