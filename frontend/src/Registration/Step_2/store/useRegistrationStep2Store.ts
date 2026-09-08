import { create } from "zustand";
import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import { useAuthStore } from "@/api/store/useAuthStore";
import { isMock } from "@/api/authApi";

interface Step2State {
  phone: string;
  code: string;
  mode: "phone" | "sent" | "code";
  secs: number;
  rawPhone: string;
  attempts: number;
  errorMessage: string;
  isVerifying: boolean;
  setMode: (mode: "phone" | "sent" | "code") => void;
  sendPhone: () => Promise<void>;
  startTimer: () => void;
  handleKeyboardInput: (key: string, onSuccessCode?: (sessionId: string) => void) => void;
  verifySmsCode: (onSuccess: (sessionId: string) => void) => Promise<void>;
  resetStore: () => void;
}

const initialValues = {
  phone: "+7 ( _ _ _ ) _ _ _ - _ _ - _ _",
  code: "",
  mode: "phone" as const,
  secs: 60,
  rawPhone: "",
  attempts: 0,
  errorMessage: "",
  isVerifying: false,
};

let activeTimerId: ReturnType<typeof setInterval> | null = null;

const clearActiveTimer = () => {
  if (activeTimerId) {
    clearInterval(activeTimerId);
    activeTimerId = null;
  }
};

export const useRegistrationStep2Store = create<Step2State>((set, get) => ({
  ...initialValues,

  setMode: (mode) => {
    set({ mode });
    if (mode === "code" && !activeTimerId) get().startTimer();
  },

  sendPhone: async () => {
    const { rawPhone } = get();
    if (!isMock && rawPhone.length !== 10) return;

    clearActiveTimer();
    set({ mode: "sent", code: "", errorMessage: "" });

    try {
      if (isMock) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      await useAuthStore
        .getState()
        .loginPhone(`+7${rawPhone}`, useRegistrationStep1Store.getState().name || "Булька");
    } catch (err: any) {
      set({ mode: "phone", errorMessage: err.response?.data?.error || "Ошибка отправки СМС." });
    }
  },

  startTimer: () => {
    clearActiveTimer();
    set({ secs: 60 });

    activeTimerId = setInterval(() => {
      const currentSecs = get().secs;
      if (currentSecs <= 1) {
        clearActiveTimer();
        set({ secs: 0, code: "", attempts: 0, errorMessage: "Время действия кода истекло." });
      } else {
        set({ secs: currentSecs - 1 });
      }
    }, 1000);
  },

  handleKeyboardInput: (key, onSuccessCode) => {
    const { mode, code, rawPhone, verifySmsCode, isVerifying } = get();
    if (mode === "sent" || isVerifying) return;

    const isCode = mode === "code";
    let cur = isCode ? code : rawPhone;

    if (/backspace|delete/i.test(key)) {
      cur = cur.slice(0, -1);
    } else if (/^\d$/.test(key) && cur.length < (isCode ? 4 : 10)) {
      cur += key;
    } else {
      return;
    }

    if (isCode) {
      set({ code: cur });
      if (cur.length === 4 && onSuccessCode) verifySmsCode(onSuccessCode);
    } else {
      let f = "+7 ( ";
      for (let i = 0; i < 10; i++) {
        f += cur[i] || "_";
        if (i === 2) f += " ) ";
        if (i === 5 || i === 7) f += " - ";
      }
      set({ rawPhone: cur, phone: f });
    }
  },

  verifySmsCode: async (onSuccess) => {
    const { rawPhone, code, attempts, isVerifying } = get();
    if (isVerifying || (!isMock && code.length !== 4)) return;

    set({ isVerifying: true, errorMessage: "" });

    try {
      if (isMock) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      const res = await useAuthStore.getState().verifySms(`+7${rawPhone}`, code);
      clearActiveTimer();
      set({ isVerifying: false });
      onSuccess(res.sessionId);
    } catch {
      const next = attempts + 1;
      clearActiveTimer();
      if (next >= 3) {
        set({ code: "", isVerifying: false, attempts: 0, errorMessage: "Превышено количество попыток." });
        await get().sendPhone();
      } else {
        set({ code: "", isVerifying: false, attempts: next, errorMessage: `Неверный код. Осталось попыток: ${3 - next}` });
      }
    }
  },

  resetStore: () => {
    clearActiveTimer();
    set(initialValues);
  }
}));
