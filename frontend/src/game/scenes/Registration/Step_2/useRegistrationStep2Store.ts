import { create } from 'zustand';
import { useRegistrationStep1Store } from '../Step_1/useRegistrationStep1Store'; 
import { useAuthStore } from '../../../../store/useAuthStore';

interface Step2State {
  phone: string; code: string; mode: 'phone' | 'sent' | 'code'; secs: number; rawPhone: string;
  attempts: number; errorMessage: string; isVerifying: boolean; timerId: number | null;
  setMode: (mode: 'phone' | 'sent' | 'code') => void;
  sendPhone: () => Promise<void>;
  startTimer: () => void;
  handleKeyboardInput: (key: string, onSuccessCode?: (sessionId: string) => void) => void;
  verifySmsCode: (onSuccess: (sessionId: string) => void) => Promise<void>;
  resetStore: () => void;
}

const initialValues = {
  phone: '+7 ( _ _ _ ) _ _ _ - _ _ - _ _', code: '', mode: 'phone' as const, secs: 60, rawPhone: '',
  attempts: 0, errorMessage: '', isVerifying: false, timerId: null,
};

const clearTimer = (id: number | null) => id && clearInterval(id);

export const useRegistrationStep2Store = create<Step2State>((set, get) => ({
  ...initialValues,

  setMode: (mode) => {
    set({ mode });
    if (mode === 'code' && !get().timerId) get().startTimer();
  },

  sendPhone: async () => {
    const { rawPhone, timerId } = get();
    if (rawPhone.length !== 10) return;
    clearTimer(timerId);
    try {
      set({ mode: 'sent', timerId: null, code: '', errorMessage: '' });
      await useAuthStore.getState().register(useRegistrationStep1Store.getState().name || 'Булька', `+7${rawPhone}`);
    } catch {
      set({ mode: 'phone', errorMessage: 'Ошибка отправки СМС.' });
    }
  },

  startTimer: () => {
    clearTimer(get().timerId);
    set({ secs: 60 });
    const id = window.setInterval(() => {
      set((s) => s.secs <= 1 
        ? (clearInterval(id), { secs: 0, timerId: null, code: '', attempts: 0, errorMessage: 'Время действия кода истекло.' }) 
        : { secs: s.secs - 1 }
      );
    }, 1000);
    set({ timerId: id });
  },

  handleKeyboardInput: (key, onSuccessCode) => {
    const { mode, code, rawPhone, verifySmsCode, isVerifying } = get();
    if (mode === 'sent' || isVerifying) return;

    const isCode = mode === 'code';
    let cur = isCode ? code : rawPhone;

    if (/backspace|delete/i.test(key)) cur = cur.slice(0, -1);
    else if (/^\d$/.test(key) && cur.length < (isCode ? 4 : 10)) cur += key;
    else return;

    if (isCode) {
      set({ code: cur });
      if (cur.length === 4 && onSuccessCode) verifySmsCode(onSuccessCode);
    } else {
      let f = '+7 ( ';
      for (let i = 0; i < 10; i++) {
        f += cur[i] || '_';
        if (i === 2) f += ' ) ';
        if (i === 5 || i === 7) f += ' - ';
      }
      set({ rawPhone: cur, phone: f });
    }
  },

  verifySmsCode: async (onSuccess) => {
    const { rawPhone, code, attempts, timerId, isVerifying } = get();
    if (isVerifying) return;
    set({ isVerifying: true, errorMessage: '' });
    try {
      const res = await useAuthStore.getState().verifySms(`+7${rawPhone}`, code);
      clearTimer(timerId);
      onSuccess(res.sessionId);
    } catch {
      const next = attempts + 1;
      if (next >= 3) {
        clearTimer(timerId);
        set({ code: '', isVerifying: false, attempts: 0, timerId: null, errorMessage: 'Превышено количество попыток.' });
        get().sendPhone();
      } else {
        set({ code: '', isVerifying: false, attempts: next, errorMessage: `Неверный код. Осталось попыток: ${3 - next}` });
      }
    }
  },

  resetStore: () => {
    clearTimer(get().timerId);
    set(initialValues);
  },
}));
