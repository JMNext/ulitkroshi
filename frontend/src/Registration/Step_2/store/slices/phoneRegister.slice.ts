import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { authApiInstance, isMock } from "@/api/api";
import { authApi } from "@/api/services/auth.api";
import { EventBus } from "@/eventbus/EventBus";
import { StateCreator } from "zustand";
import { RegisterState, Step2CombinedState, clearTimers, getActiveTimerId, getSavedSessionId, setActiveTimerId, setMvpPollingId, setSavedSessionId } from "../useRegistrationStep2Store";

interface SnailWindow { phaserGame?: { scene: { stop: (k: string) => void; start: (k: string, d?: any) => void } } }

const cleanPhone = (raw: string): string => {
  const d = String(raw || "").replace(/[^0-9]/g, "").trim();
  return d.length === 11 && (d.startsWith("7") || d.startsWith("8")) ? "7" + d.slice(1) : d.length > 10 ? "7" + d.slice(-10) : "7" + d;
};

const saveAndSwitch = (id: string, phone: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("saved_user_phone", phone);
    localStorage.setItem("login_phone_buffer", phone);
    localStorage.setItem("active_reg_session_id", id);
    const gw = window as unknown as SnailWindow;
    if (gw.phaserGame) {
      gw.phaserGame.scene.stop("Step2Scene");
      gw.phaserGame.scene.start("Step3Scene", { sessionId: id });
    }
  }
  clearTimers();
  EventBus.emit("step2_scene_stop");
  EventBus.emit("step3_scene_start", { sessionId: id });
};

export const createPhoneRegisterSlice: StateCreator<Step2CombinedState, [], [], RegisterState> = (set, get) => {
  const pollMvp = async (): Promise<void> => {
    if (isMock || get().registerMode !== "code") return clearTimers();
    try {
      const sid = getSavedSessionId();
      // ИСПРАВЛЕНО: Убрана приставка "/auth", теперь запрос идет по верному пути к бэкенду!
      const res = sid ? (await authApiInstance.get<{ code: string | null }>("/login/get-mvp-code?sessionId=" + sid)).data : null;
      if (get().registerMode !== "code") return;
      if (!res?.code) return setMvpPollingId(setTimeout(() => { pollMvp().catch(() => {}); }, 1000));

      let i = 0;
      const codeStr = String(res.code);
      const typing = setInterval(() => {
        if (get().registerMode !== "code") return clearInterval(typing);
        if (i < codeStr.length) get().handleRegisterKeyboard(codeStr.charAt(i++));
        else { clearInterval(typing); setTimeout(() => get().verifyRegisterSms(id => saveAndSwitch(id, cleanPhone(get().registerRawPhone))), 300); }
      }, 250);
    } catch {
      if (get().registerMode === "code") setMvpPollingId(setTimeout(() => { pollMvp().catch(() => {}); }, 1000));
    }
  };

  return {
    registerPhone: "", registerCode: "", registerMode: "phone", registerSecs: 60, registerRawPhone: "", registerAttempts: 0, registerError: "", isVerifyingCode: false,

    setRegisterMode: (mode) => {
      set({ registerMode: mode });
      if (mode === "code" && !getActiveTimerId()) get().startRegisterTimer();
    },

    sendRegisterPhone: async () => {
      const full = cleanPhone(get().registerRawPhone);
      if (full.length !== 11) return set({ registerError: "system_error" });

      // ИСПРАВЛЕНО: Полностью вычищаем старые забагованные сессии из памяти перед новым запросом
      clearTimers();
      if (typeof window !== "undefined") {
        localStorage.removeItem("active_reg_session_id");
      }

      set({ registerError: "" });
      try {
        const check = await authApi.checkLoginPhone(full);
        if (check?.isLogin) return set({ registerMode: "exists", registerError: "" });

        const res = await authApi.loginPhone(full, useRegistrationStep1Store.getState().name || "");
        if (res?.sessionId) {
          setSavedSessionId(res.sessionId);
          useRegistrationStep3Store.getState().setIsLogin(false);
          set({ registerMode: "sent", registerError: "" });
        }
      } catch {
        set({ registerMode: "phone", registerError: "system_error" });
      }
    },

    confirmRegisterSent: () => {
      set({ registerMode: "code" });
      if (!getActiveTimerId()) get().startRegisterTimer();
      if (getSavedSessionId()) pollMvp().catch(() => {});
    },

    startRegisterTimer: () => {
      if (getActiveTimerId()) clearInterval(getActiveTimerId());
      set({ registerSecs: 60 });
      setActiveTimerId(setInterval(() => {
        const cur = get().registerSecs;
        if (cur <= 1) {
          clearTimers();
          set({ registerSecs: 0, registerCode: "", registerAttempts: 0, registerError: "expired" });
        } else set({ registerSecs: cur - 1 });
      }, 1000));
    },

    handleRegisterKeyboard: (key) => {
      const { registerMode, registerCode, registerRawPhone, isVerifyingCode } = get();
      if (isVerifyingCode) return;
      const isCode = registerMode === "code";
      let cur = isCode ? registerCode : registerRawPhone;

      if (/backspace|delete/i.test(key)) cur = cur.slice(0, -1);
      else if ("0123456789".includes(key) && cur.replace(/\D/g, "").length < (isCode ? 4 : 10)) cur += key;
      else return;

      if (isCode) {
        set({ registerCode: cur });
        if (cur.length === 4) setTimeout(() => get().verifyRegisterSms(id => saveAndSwitch(id, cleanPhone(get().registerRawPhone))), 50);
      } else {
        const d = cur.replace(/\D/g, "").slice(0, 10);
        set({ registerRawPhone: d, registerPhone: "+7" + d });
      }
    },

    verifyRegisterSms: async (onSuccess) => {
      const { registerCode, registerAttempts } = get();
      if (registerCode.length !== 4) return;
      const full = cleanPhone(get().registerRawPhone);
      set({ isVerifyingCode: true, registerError: "" });
      try {
        const res = await authApi.verifySms(full, registerCode);
        if (res?.sessionId) {
          set({ isVerifyingCode: false });
          onSuccess(res.sessionId);
        } else throw new Error();
      } catch {
        const next = registerAttempts + 1;
        clearTimers();
        set({ registerCode: "", isVerifyingCode: false, registerAttempts: next >= 3 ? 0 : next, registerError: next >= 3 ? "too_many_attempts" : "wrong_code" });
        if (next >= 3) await get().sendRegisterPhone();
      }
    }
  };
};
