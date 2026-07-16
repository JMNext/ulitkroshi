import { create } from 'zustand';
import { useRegistrationStep1Store } from '../Step_1/useRegistrationStep1Store'; 
import { useAuthStore } from '../../../../store/useAuthStore';

interface Step2State {
  phone: string;
  code: string;
  mode: 'phone' | 'sent' | 'code';
  secs: number;
  rawPhone: string;
  timerId: ReturnType<typeof setInterval> | null;
  setMode: (mode: 'phone' | 'sent' | 'code') => void;
  sendPhone: () => Promise<void>; // Изменили сигнатуру метода на асинхронную
  startTimer: () => void;
  handleKeyboardInput: (key: string) => void;
  resetStore: () => void;
}

const initialValues = {
  phone: '+7 ( _ _ _ ) _ _ _ - _ _ - _ _',
  code: '',
  mode: 'phone' as const,
  secs: 60,
  rawPhone: '',
  timerId: null,
};

const formatPhone = (d: string): string => {
  if (d.length === 0) return '+7 ( _ _ _ ) _ _ _ - _ _ - _ _';
  let f = '+7 ( ';
  for (let i = 0; i < 10; i++) { 
    f += i < d.length ? d[i] : '_'; 
    if (i === 2) f += ' ) '; 
    if (i === 5 || i === 7) f += ' - '; 
  }
  return f;
};

export const useRegistrationStep2Store = create<Step2State>((set, get) => ({
  ...initialValues,

  setMode: (mode) => {
    set({ mode });
    if (mode === 'code') {
      get().startTimer();
    }
  },

  // ТЗ: Кнопка «Отправить код» → POST /api/auth/register (сохраняет имя + телефон)
  sendPhone: async () => {
    const { rawPhone } = get();
    if (rawPhone.length !== 10) return;

    try {
      const { register } = useAuthStore.getState();
      const snailName = useRegistrationStep1Store.getState().name || 'Булька';
      const fullPhoneNumber = `+7${rawPhone}`;

      // Отправляем имя улитки и номер телефона на бэкенд
      await register(snailName, fullPhoneNumber);

      // В случае успешного ответа сервера переключаем режим на отображение модалки
      set({ mode: 'sent' });
    } catch (error) {
      console.error("Ошибка при вызове /api/auth/register:", error);
    }
  },

  startTimer: () => {
    const currentTimer = get().timerId;
    if (currentTimer) clearInterval(currentTimer);

    set({ secs: 60, code: '' });

    const id = setInterval(() => {
      const nextSecs = get().secs - 1;
      if (nextSecs <= 0) {
        const activeTimer = get().timerId;
        if (activeTimer) clearInterval(activeTimer);
        set({ secs: 0, timerId: null });
      } else {
        set({ secs: nextSecs });
      }
    }, 1000);

    set({ timerId: id });
  },

  handleKeyboardInput: (key) => {
    const state = get();
    const isCodeMode = state.mode === 'code';
    let current = isCodeMode ? state.code : state.rawPhone;

    if (key === 'Backspace' || key === 'BACKSPACE' || key === 'delete') {
      current = current.slice(0, -1);
    } else if (/^\d$/.test(key)) {
      if (current.length < (isCodeMode ? 4 : 10)) {
        current += key;
      }
    } else {
      return;
    }

    if (isCodeMode) {
      set({ code: current });
    } else {
      set({ 
        rawPhone: current,
        phone: formatPhone(current)
      });
    }
  },

  resetStore: () => {
    const activeTimer = get().timerId;
    if (activeTimer) clearInterval(activeTimer);
    set(initialValues);
  },
}));
