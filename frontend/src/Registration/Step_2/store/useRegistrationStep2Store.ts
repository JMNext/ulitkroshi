import { create } from "zustand";
import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { useApiStore } from "@/api/store/useApiStore";
import { isMock, api, gatewayApi } from "@/api/api";

interface Step2State {
  phone: string; code: string; mode: "phone" | "sent" | "code"; secs: number;
  rawPhone: string; attempts: number; errorMessage: "system_error" | "expired" | "too_many_attempts" | "wrong_code" | "user_not_found" | ""; isVerifying: boolean;
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  clearError: () => void;
  setMode: (mode: "phone" | "sent" | "code") => void;
  sendPhone: (onSuccessCode?: (sessionId: string) => void) => Promise<void>;
  confirmSent: () => void; startTimer: () => void;
  handleKeyboardInput: (key: string) => void;
  verifySmsCode: (onSuccess: (sessionId: string) => void) => Promise<void>;
  checkSavedDevicePhone: (onSuccess: () => void) => void;
  resetStore: () => void;
}

let activeTimerId: any = null;
let mvpPollingId: any = null;
let savedSessionId: string | null = null;
let savedOnSuccess: ((sessionId: string) => void) | null = null;

const clearTimers = () => {
  if (activeTimerId) clearInterval(activeTimerId);
  if (mvpPollingId) clearTimeout(mvpPollingId);
  activeTimerId = mvpPollingId = null;
};

export const useRegistrationStep2Store = create<Step2State>((set, get) => ({
  phone: "", code: "", mode: "phone", secs: 60, rawPhone: "", attempts: 0, errorMessage: "", isVerifying: false,
  isLogin: false,

  setIsLogin: (isLogin) => set({ isLogin }),

  clearError: () => set({ errorMessage: "" }),

  setMode: (mode) => { set({ mode }); if (mode === "code" && !activeTimerId) get().startTimer(); },

  checkSavedDevicePhone: (onSuccess) => {
    if (typeof window === "undefined") return;
    const savedPhone = localStorage.getItem("saved_user_phone");
    if (savedPhone) {
      localStorage.setItem("login_phone_buffer", savedPhone);
      onSuccess();
    }
  },

  sendPhone: async (onSuccessCode) => {
    const { rawPhone, isLogin } = get(); if (!isMock && rawPhone.length !== 10) return;
    clearTimers(); set({ errorMessage: "" }); savedOnSuccess = onSuccessCode || null;
    const fullPhone = `+7${rawPhone}`;

    if (isLogin) {
      try {
        const res = await api.checkLoginPhone(fullPhone);
        if (res?.isLogin) {
          localStorage.setItem("saved_user_phone", fullPhone);
          localStorage.setItem("login_phone_buffer", fullPhone);
          useRegistrationStep3Store.getState().setIsLogin(true);
          
          if (savedOnSuccess) savedOnSuccess("direct_login_session");
          else (window as any).currentPhaserScene?.scene?.start("Step3Scene", { sessionId: "direct_login_session" });
          return;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("Зарегистрируйся")) {
          set({ mode: "sent", errorMessage: "user_not_found" });
          return;
        }
        set({ mode: "phone", errorMessage: "system_error" });
        return;
      }
    }

    try {
      const res = await api.loginPhone(fullPhone, useRegistrationStep1Store.getState().name || "Булька");
      if (res?.sessionId) { 
        savedSessionId = res.sessionId; 
        useRegistrationStep3Store.getState().setIsLogin(false); 
        set({ mode: "sent" });
      }
    } catch {
      set({ mode: "phone", errorMessage: "system_error" });
    }
  },

  confirmSent: () => {
    if (!savedSessionId) return; 
    set({ mode: "code" }); 
    if (!activeTimerId) get().startTimer();

    const poll = async () => {
      try {
        const res = (await gatewayApi.get<{ code: string | null }>(`/auth/login/get-mvp-code?sessionId=${savedSessionId}`)).data;
        if (!res?.code) { 
          mvpPollingId = setTimeout(poll, 1000); 
          return; 
        }
        
        let i = 0;
        const codeStr = res.code;
        const typing = setInterval(() => {
          if (i < codeStr.length) { 
            get().handleKeyboardInput(codeStr[i++]); 
          } else { 
            clearInterval(typing); 
            
            // АВТОМАТИЧЕСКИЙ ПЕРЕХОД: Код заполнился до конца, и система сама триггерит редирект на фрукты!
            setTimeout(() => {
              get().verifySmsCode((id) => {
                const fullPhone = `+7${get().rawPhone}`;
                localStorage.setItem("saved_user_phone", fullPhone);
                localStorage.setItem("login_phone_buffer", fullPhone);
                if (savedOnSuccess) savedOnSuccess(id);
                else (window as any).currentPhaserScene?.scene?.start("Step3Scene");
              });
            }, 300);
          }
        }, 250);
      } catch { 
        mvpPollingId = setTimeout(poll, 1000); 
      }
    };
    poll();
  },

  startTimer: () => {
    if (activeTimerId) clearInterval(activeTimerId);
    set({ secs: 60 });
    activeTimerId = setInterval(() => {
      const current = get().secs;
      if (current <= 1) { clearTimers(); set({ secs: 0, code: "", attempts: 0, errorMessage: "expired" }); }
      else set({ secs: current - 1 });
    }, 1000);
  },

  handleKeyboardInput: (key) => {
    const { mode, code, rawPhone, isVerifying } = get(); if (mode === "sent" || isVerifying) return;
    let cur = mode === "code" ? code : rawPhone;
    if (/backspace|delete/i.test(key)) cur = cur.slice(0, -1);
    else if (/^\d$/.test(key) && cur.length < (mode === "code" ? 4 : 10)) cur += key;
    else return;

    if (mode === "code") {
      set({ code: cur });
    } else {
      set({ rawPhone: cur, phone: `+7${cur}` });
      if (cur.length === 10 && get().isLogin) {
        setTimeout(() => get().sendPhone(), 50);
      }
    }
  },

  verifySmsCode: async (onSuccess) => {
    const { rawPhone, code, attempts, isVerifying } = get(); if (isVerifying || code.length !== 4) return;
    set({ isVerifying: true, errorMessage: "" });
    try {
      const res = await useApiStore.getState().verifySms(`+7${rawPhone}`, code);
      clearTimers(); 
      set({ isVerifying: false }); 
      
      const fullPhone = `+7${rawPhone}`;
      localStorage.setItem("active_reg_session_id", res.sessionId); 
      localStorage.setItem("login_phone_buffer", fullPhone);
      localStorage.setItem("saved_user_phone", fullPhone);

      onSuccess(res.sessionId);
    } catch {
      const next = attempts + 1; clearTimers();
      set({ 
        code: "", 
        isVerifying: false, 
        attempts: next >= 3 ? 0 : next, 
        errorMessage: next >= 3 ? "too_many_attempts" : "wrong_code" 
      });
      if (next >= 3) await get().sendPhone(savedOnSuccess || undefined);
    }
  },

  resetStore: () => { 
    clearTimers(); 
    savedSessionId = savedOnSuccess = null; 
    set({ phone: "", code: "", mode: "phone", secs: 60, rawPhone: "", attempts: 0, errorMessage: "", isVerifying: false, isLogin: false }); 
  }
}));
