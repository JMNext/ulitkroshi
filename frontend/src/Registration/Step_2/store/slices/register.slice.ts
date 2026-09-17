import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { api, gatewayApi, isMock } from "@/api/api";
import { useApiStore } from "@/api/store/useApiStore";
import { EventBus } from "@/eventbus/EventBus";
import { StateCreator } from "zustand";
import {
  CustomWindow,
  RegisterState,
  Step2CombinedState,
  clearTimers,
  getActiveTimerId,
  getSavedSessionId,
  setActiveTimerId,
  setMvpPollingId,
  setSavedSessionId
} from "../useRegistrationStep2Store";

const savePhoneToStorage = (p: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("saved_user_phone", p);
    localStorage.setItem("login_phone_buffer", p);
  }
};

export const createRegisterSlice: StateCreator<Step2CombinedState, [], [], RegisterState> = (set, get) => {
  const triggerAutoVerify = () => {
    get().verifyRegisterSms((id) => {
      const cleanDigits = get().registerRawPhone.replace(/\D/g, "");
      savePhoneToStorage(`7${cleanDigits}`);

      setTimeout(() => {
        EventBus.emit("step2_scene_stop");
        EventBus.emit("step3_scene_start", { sessionId: id });
        if (typeof window !== "undefined") {
          const customWindow = window as unknown as CustomWindow;
          const game = customWindow.phaserGame;
          if (game) {
            game.scene.stop("Step2Scene");
            game.scene.start("Step3Scene", { sessionId: id });
          }
        }
      }, 50);
    });
  };

  const pollMvpCode = async () => {
    try {
      const sid = getSavedSessionId();
      if (!sid) return;
      const res = (await gatewayApi.get<{ code: string | null }>(`/auth/login/get-mvp-code?sessionId=${sid}`)).data;
      if (!res?.code) {
        setMvpPollingId(setTimeout(pollMvpCode, 1000));
        return;
      }
      let i = 0;
      const typing = setInterval(() => {
        if (i < res.code!.length) {
          get().handleRegisterKeyboard(res.code![i++]);
        } else {
          clearInterval(typing);
          setTimeout(triggerAutoVerify, 300);
        }
      }, 250);
    } catch {
      setMvpPollingId(setTimeout(pollMvpCode, 1000));
    }
  };

  return {
    registerPhone: "",
    registerCode: "",
    registerMode: "phone",
    registerSecs: 60,
    registerRawPhone: "",
    registerAttempts: 0,
    registerError: "",
    isVerifyingCode: false,

    setRegisterMode: (mode) => {
      set({ registerMode: mode });
      if (mode === "code" && !getActiveTimerId()) get().startRegisterTimer();
    },

    sendRegisterPhone: async () => {
      const { registerRawPhone } = get();

      const cleanDigits = registerRawPhone.replace(/\D/g, "");
      if (!isMock && cleanDigits.length < 10) {
        // ИСПРАВЛЕНО: Возвращаем стандартный тип ошибки, разрешенный интерфейсом вашего стора
        set({ registerError: "system_error" });
        return;
      }

      clearTimers();
      set({ registerError: "" });

      const fullPhone = `7${cleanDigits.slice(-10)}`;

      try {
        const checkRes = await api.checkLoginPhone(fullPhone);

        const res = await api.loginPhone(fullPhone, useRegistrationStep1Store.getState().name || "Булька");
        if (res?.sessionId || isMock) {
          setSavedSessionId(isMock ? "mock_reg_session_id" : res.sessionId);
          useRegistrationStep3Store.getState().setIsLogin(checkRes ? checkRes.isLogin : false);
          set({ registerMode: "sent", registerError: "" });
        }
      } catch (err: any) {
        console.error("🚨 [FRONTEND ERROR] Ошибка при отправке телефона:", err.message);
        set({ registerMode: "phone", registerError: "system_error" });
      }
    },

    confirmRegisterSent: () => {
      set({ registerMode: "code" });
      if (!getActiveTimerId()) get().startRegisterTimer();
      if (!isMock && getSavedSessionId()) pollMvpCode();
    },

    startRegisterTimer: () => {
      const tid = getActiveTimerId();
      if (tid) clearInterval(tid);
      set({ registerSecs: 60 });

      const newTid = setInterval(() => {
        const current = get().registerSecs;
        if (current <= 1) {
          clearTimers();
          set({ registerSecs: 0, registerCode: "", registerAttempts: 0, registerError: "expired" });
        } else set({ registerSecs: current - 1 });
      }, 1000);

      setActiveTimerId(newTid);
    },

    handleRegisterKeyboard: (key) => {
      const { registerMode, registerCode, registerRawPhone, isVerifyingCode } = get();
      if (isVerifyingCode) return;

      const isCode = registerMode === "code";
      let cur = isCode ? registerCode : registerRawPhone;

      if (/backspace|delete/i.test(key)) cur = cur.slice(0, -1);
      else if ("0123456789".includes(key) && cur.length < (isCode ? 4 : 15)) cur += key;
      else return;

      if (isCode) {
        set({ registerCode: cur });
        if (cur.length === 4) {
          setTimeout(triggerAutoVerify, 50);
        }
      } else {
        const digits = cur.replace(/\D/g, "");
        set({ registerRawPhone: digits, registerPhone: `+7${digits}` });
      }
    },

    verifyRegisterSms: async (onSuccess) => {
      const { registerRawPhone, registerCode, registerAttempts } = get();
      if (registerCode.length !== 4) return;

      const cleanDigits = registerRawPhone.replace(/\D/g, "");
      const fullPhone = `7${cleanDigits.slice(-10)}`;

      if (isMock) {
        savePhoneToStorage(fullPhone);
        clearTimers();
        onSuccess("mock_verified_reg_session");
        return;
      }

      set({ isVerifyingCode: true, registerError: "" });
      try {
        const res = await useApiStore.getState().verifySms(fullPhone, registerCode);
        if (typeof window !== "undefined") {
          localStorage.setItem("active_reg_session_id", res.sessionId);
        }
        savePhoneToStorage(fullPhone);
        clearTimers();
        set({ isVerifyingCode: false });
        onSuccess(res.sessionId);
      } catch {
        const next = registerAttempts + 1;
        clearTimers();
        set({
          registerCode: "",
          isVerifyingCode: false,
          registerAttempts: next >= 3 ? 0 : next,
          registerError: next >= 3 ? "too_many_attempts" : "wrong_code"
        });
        if (next >= 3) {
          await get().sendRegisterPhone();
        }
      }
    }
  };
};
