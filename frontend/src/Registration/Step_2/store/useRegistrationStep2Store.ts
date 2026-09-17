import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { api, gatewayApi, isMock } from "@/api/api";
import { useApiStore } from "@/api/store/useApiStore";
import { create } from "zustand";

export interface LayoutContext {
  screenMode: "fold" | "mobile" | "tablet" | "desktop"; viewW: number; scale: number; isVert: boolean;
}

interface Step2State {
  phone: string; code: string; mode: "phone" | "sent" | "code"; secs: number; rawPhone: string; attempts: number;
  errorMessage: "system_error" | "expired" | "too_many_attempts" | "wrong_code" | "user_not_found" | "";
  isVerifying: boolean; isLogin: boolean; layoutContext: LayoutContext | null; computedScale: number; phaserScene: any | null;
  setPhaserScene: (scene: any) => void; setIsLogin: (isLogin: boolean) => void; clearError: () => void;
  setMode: (mode: "phone" | "sent" | "code") => void; sendPhone: () => Promise<void>; confirmSent: () => void;
  startTimer: () => void; handleKeyboardInput: (key: string) => void; verifySmsCode: (onSuccess: (sessionId: string) => void) => Promise<void>;
  checkSavedDevicePhone: (onSuccess: () => void) => void; setLayout: (layoutContext: LayoutContext, computedScale: number) => void;
  resetStore: () => void; cancelRegistrationToMainMenu: () => void;
}

const initialValues = {
  phone: "", code: "", mode: "phone" as const, secs: 60, rawPhone: "", attempts: 0,
  errorMessage: "" as const, isVerifying: false, isLogin: false, layoutContext: null, computedScale: 1, phaserScene: null
};

let activeTimerId: ReturnType<typeof setInterval> | null = null;
let mvpPollingId: ReturnType<typeof setTimeout> | null = null;
let savedSessionId: string | null = null;

const clearTimers = () => {
  if (activeTimerId) clearInterval(activeTimerId);
  if (mvpPollingId) clearTimeout(mvpPollingId);
  activeTimerId = mvpPollingId = null;
  savedSessionId = null;
};

const savePhoneToStorage = (p: string) => {
  localStorage.setItem("saved_user_phone", p);
  localStorage.setItem("login_phone_buffer", p);
};

export const useRegistrationStep2Store = create<Step2State>()((set, get) => {
  const triggerAutoVerify = () => {
    get().verifySmsCode(id => {
      savePhoneToStorage(`+7${get().rawPhone}`);
      setTimeout(() => {
        get().phaserScene?.scene.start("Step3Scene", { sessionId: id });
      }, 50);
    });
  };

  const pollMvpCode = async () => {
    try {
      if (!savedSessionId) return;
      const res = (await gatewayApi.get<{ code: string | null }>(`/auth/login/get-mvp-code?sessionId=${savedSessionId}`)).data;
      if (!res?.code) {
        mvpPollingId = setTimeout(pollMvpCode, 1000);
        return;
      }
      let i = 0;
      const typing = setInterval(() => {
        if (i < res.code!.length) {
          get().handleKeyboardInput(res.code![i++]);
        } else {
          clearInterval(typing);
          setTimeout(triggerAutoVerify, 300);
        }
      }, 250);
    } catch {
      mvpPollingId = setTimeout(pollMvpCode, 1000);
    }
  };

  return {
    ...initialValues,
    setPhaserScene: phaserScene => set({ phaserScene }),
    setIsLogin: isLogin => set({ isLogin, mode: "phone", phone: "", rawPhone: "", errorMessage: "" }),
    clearError: () => set({ errorMessage: "" }),
    setMode: mode => { set({ mode }); if (mode === "code" && !activeTimerId) get().startTimer(); },
    setLayout: (layoutContext, computedScale) => set({ layoutContext, computedScale }),
    checkSavedDevicePhone: onSuccess => {
      const saved = typeof window !== "undefined" && localStorage.getItem("saved_user_phone");
      if (saved) { localStorage.setItem("login_phone_buffer", saved); onSuccess(); }
    },

    sendPhone: async () => {
      let { rawPhone, isLogin, phaserScene } = get();
      if (!isMock && rawPhone.length !== 10) return;
      clearTimers();
      set({ errorMessage: "" });
      const fullPhone = `+7${rawPhone}`;

      if (isLogin) {
        try {
          const res = await api.checkLoginPhone(fullPhone);
          if (res?.isLogin || isMock) {
            savePhoneToStorage(fullPhone);
            localStorage.removeItem("active_reg_session_id");
            useRegistrationStep3Store.getState().setIsLogin(true);
            return phaserScene?.scene.start("Step3Scene", { sessionId: isMock ? "mock_login_flow_session" : "login_flow_direct" });
          }
        } catch {
          clearTimers();
          useRegistrationStep3Store.getState().setIsLogin(false);
          return set({ mode: "sent", errorMessage: "user_not_found" });
        }
      }

      try {
        const res = await api.loginPhone(fullPhone, useRegistrationStep1Store.getState().name || "Булька");
        if (res?.sessionId || isMock) {
          savedSessionId = isMock ? "mock_reg_session_id" : res.sessionId;
          useRegistrationStep3Store.getState().setIsLogin(false);
          set({ mode: "sent", errorMessage: "" });
        }
      } catch {
        set({ mode: "phone", errorMessage: "system_error" });
      }
    },

    confirmSent: () => {
      set({ mode: "code" });
      if (!activeTimerId) get().startTimer();
      if (!isMock && savedSessionId) pollMvpCode();
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

    handleKeyboardInput: key => {
      const { mode, code, rawPhone, isVerifying, isLogin } = get();
      if (isVerifying) return;

      if (get().errorMessage === "user_not_found") {
        return;
      }

      const isCode = mode === "code";
      let cur = isCode ? code : rawPhone;

      if (/backspace|delete/i.test(key)) cur = cur.slice(0, -1);
      else if ("0123456789".includes(key) && cur.length < (isCode ? 4 : 10)) cur += key;
      else return;

      if (isCode) {
        set({ code: cur });
        if (cur.length === 4) {
          setTimeout(triggerAutoVerify, 50);
        }
      } else {
        set({ rawPhone: cur, phone: `+7${cur}` });
        if (cur.length === 10 && isLogin && rawPhone !== "") {
          setTimeout(() => get().sendPhone(), 50);
        }
      }
    },

    verifySmsCode: async onSuccess => {
      const { rawPhone, code, attempts } = get();
      if (code.length !== 4) return;

      if (isMock) {
        savePhoneToStorage(`+7${rawPhone}`);
        clearTimers();
        return onSuccess("mock_verified_reg_session");
      }

      set({ isVerifying: true, errorMessage: "" });
      try {
        const res = await useApiStore.getState().verifySms(`+7${rawPhone}`, code);
        localStorage.setItem("active_reg_session_id", res.sessionId);
        savePhoneToStorage(`+7${rawPhone}`);
        clearTimers();
        set({ isVerifying: false });
        onSuccess(res.sessionId);
      } catch {
        const next = attempts + 1; clearTimers();
        set({ code: "", isVerifying: false, attempts: next >= 3 ? 0 : next, errorMessage: next >= 3 ? "too_many_attempts" : "wrong_code" });
        if (next >= 3) await get().sendPhone();
      }
    },

    resetStore: () => { clearTimers(); set({ ...initialValues, isLogin: get().isLogin, mode: "phone", phone: "", rawPhone: "" }); },

    cancelRegistrationToMainMenu: () => {
      clearTimers();
      const phaserScene = get().phaserScene;
      set({ ...initialValues, isLogin: get().isLogin, errorMessage: "", mode: "phone", phone: "", rawPhone: "" });
      if (phaserScene) {
        phaserScene.uiContainer?.classList.add("hidden");
        phaserScene.scene.switch("LoginScene");
      }
    }
  };
});
