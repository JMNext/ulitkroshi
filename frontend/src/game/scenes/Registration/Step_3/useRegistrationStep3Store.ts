import { create } from 'zustand';
import { useAuthStore } from '../../../../store/useAuthStore';

export type CaptchaMode = 'select' | 'confirm' | 'verify' | 'error';

interface Step3State {
  sel: number[];
  corr: number[];
  mode: CaptchaMode;
  shake: boolean;
  fruitOrder: number[];
  
  // Поля ТЗ
  attempts: number;           // Счетчик ошибок (максимум 3)
  errorMessage: string;       // Строгий системный текст ошибки
  isSubmitting: boolean;      // Индикатор запроса к API
  
  setCaptchaState: (sel: number[], corr: number[], mode: CaptchaMode, shake: boolean) => void;
  toggleSelect: (id: number) => void;
  undoLastSelect: () => void; // ТЗ: Кнопка «Отменить последний»
  verifyAndSubmit: (currentSel: number[]) => Promise<void>; // Финальная проверка и POST
  generateNewOrder: () => void;
  resetStore: () => void;
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
  fruitOrder: generateShuffledArray(),
  attempts: 0,
  errorMessage: '',
  isSubmitting: false,
};

export const useRegistrationStep3Store = create<Step3State>((set, get) => ({
  ...initialValues,

  setCaptchaState: (sel, corr, mode, shake) => set({ sel, corr, mode, shake }),

  // ТЗ: Кнопка «Отменить последний»
  undoLastSelect: () => {
    const { mode, sel } = get();
    if (mode === 'confirm' || mode === 'error' || sel.length === 0) return;
    set({ sel: sel.slice(0, -1), errorMessage: '' });
  },

  toggleSelect: (id) => {
    const currentMode = get().mode;
    if (currentMode === 'confirm' || currentMode === 'error' || get().isSubmitting) return;
    
    const currentSel = get().sel;
    const nextSel = currentSel.includes(id)
      ? currentSel.filter((item) => item !== id)
      : [...currentSel, id];

    if (nextSel.length > 4) return;

    if (currentMode === 'verify') {
      set({ sel: nextSel });
    } else {
      set({ 
        sel: nextSel,
        mode: nextSel.length === 4 ? 'confirm' : 'select'
      });
    }
  },

  // ТЗ: Логика сверки совпадения по порядку и вызова POST /api/auth/login/fruit
  verifyAndSubmit: async (currentSel) => {
    const { corr } = get();
    
    // ТЗ: Выбор 4 фруктов по порядку (сверяем элементы один к одному по индексам)
    const isCorrectOrder = currentSel.length === corr.length && currentSel.every((v, i) => v === corr[i]);

    if (isCorrectOrder) {
      set({ isSubmitting: true, errorMessage: '' });
      try {
        const { verifyFruit } = useAuthStore.getState();
        const sessionId = localStorage.getItem('sms_session_id') || '';

        // Переводим выбранные числовые ID в массив строк, как ждет бэкенд (например, ["0", "5", "11", "3"])
        const finalFruitIds = currentSel.map(String);

        // Вызов реального метода из ТЗ с отправкой ID фруктов
        await verifyFruit(sessionId, finalFruitIds);
        localStorage.removeItem('sms_session_id');
      } catch (err: any) {
        set({ 
          isSubmitting: false, 
          sel: [], 
          errorMessage: err.response?.data?.message || 'Ошибка сохранения кода на сервере' 
        });
      }
    } else {
      // ТЗ: При несовпадении → красная подсветка, сброс выбора, сообщение
      const nextAttempts = get().attempts + 1;
      set({ 
        mode: 'error', 
        shake: true, 
        attempts: nextAttempts,
        errorMessage: 'Ой-ой, что-то не сходится!' 
      });

      setTimeout(() => {
        set({ sel: [], shake: false, mode: 'verify' });
      }, 1500);
    }
  },

  generateNewOrder: () => set({ fruitOrder: generateShuffledArray() }),
  
  resetStore: () => set({ ...initialValues, fruitOrder: generateShuffledArray() }),
}));
