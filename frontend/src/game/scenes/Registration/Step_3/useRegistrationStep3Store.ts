import { create } from 'zustand';
import { useAuthStore } from '../../../../store/useAuthStore';

export type CaptchaMode = 'select' | 'confirm' | 'verify' | 'error';

interface Step3State {
  sel: number[]; corr: number[]; mode: CaptchaMode; shake: boolean; fruitOrder: number[]; attempts: number; errorMessage: string; isSubmitting: boolean;      
  toggleSelect: (id: number, sessionId: string, onComplete: () => void) => Promise<void>; 
  saveFirstStep: () => void; undoLastSelect: () => void; generateNewOrder: () => void; resetStore: () => void;
}

const genOrder = (): number[] => {
  const a = Array.from({ length: 16 }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

const initial = { sel: [], corr: [], mode: 'select' as CaptchaMode, shake: false, fruitOrder: [], attempts: 0, errorMessage: '', isSubmitting: false };

export const useRegistrationStep3Store = create<Step3State>((set, get) => ({
  ...initial,
  fruitOrder: genOrder(),

  undoLastSelect: () => {
    const { mode, sel } = get();
    if (mode !== 'confirm' && mode !== 'error' && sel.length) set({ sel: sel.slice(0, -1), errorMessage: '' });
  },

  toggleSelect: async (id, sessionId, onComplete) => {
    const { mode, sel, corr, isSubmitting, attempts } = get();
    if (mode === 'error' || isSubmitting || attempts >= 3) return;
    
    const next = sel.includes(id) ? sel.filter((v) => v !== id) : [...sel, id];
    if (next.length > 4) return;
    set({ sel: next });

    if (next.length === 4) {
      if (corr.length === 0) set({ mode: 'confirm' });
      else {
        if (next.length === corr.length && next.every(v => corr.includes(v))) {
          set({ isSubmitting: true, errorMessage: '' });
          try {
            await useAuthStore.getState().verifyFruit(sessionId, next.map(String));
            set({ isSubmitting: false }); onComplete(); 
          } catch (err) {
            set({ isSubmitting: false, sel: [], errorMessage: err instanceof Error ? err.message : 'Ошибка сервера', mode: 'verify' });
          }
        } else {
          set({ mode: 'error', shake: true, attempts: attempts + 1, errorMessage: 'Ой-ой, что-то не сходится!' });
          setTimeout(() => { if (get().mode === 'error') set({ sel: [], shake: false, mode: 'verify' }); }, 1500);
        }
      }
    } else set({ mode: corr.length > 0 ? 'verify' : 'select' });
  },

  saveFirstStep: () => set({ corr: get().sel, sel: [], mode: 'verify' }), // Исправлено: порядок фруктов больше не меняется
  generateNewOrder: () => set({ fruitOrder: genOrder() }),
  resetStore: () => set({ ...initial, fruitOrder: genOrder() })
}));
