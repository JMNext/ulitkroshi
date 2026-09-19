import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { isMock, authApiInstance } from "@/api/client";
import { authApi } from "@/api/auth.api";
import { EventBus } from "@/eventbus/EventBus";
import { StateCreator } from "zustand";
import { CustomWindow, RegisterState, Step2CombinedState, clearTimers, getActiveTimerId, setActiveTimerId, getSavedSessionId, setSavedSessionId, setMvpPollingId } from "../useRegistrationStep2Store";

const getCleanFullPhone = (rawPhone: string): string => {
  const digits = rawPhone.replace(/\D/g, "").slice(-10);
  return `7${digits}`;
};

const savePhoneToStorage = (p: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("saved_user_phone", p);
    localStorage.setItem("login_phone_buffer", p);
  }
};

export const createPhoneRegisterSlice: StateCreator<Step2CombinedState, [], [], RegisterState> = (set, get) => {
  const triggerAutoVerify = () => {
    get().verifyRegisterSms((id) => {
      const cleanPhone = getCleanFullPhone(get().registerRawPhone);
      savePhoneToStorage(cleanPhone);
      clearTimers();
      EventBus.emit("step2_scene_stop");
      EventBus.emit("step3_scene_start", { sessionId: id });
      if (typeof window !== "undefined") {
        const game = (window as unknown as CustomWindow).phaserGame;
        if (game) {
          game.scene.stop("Step2Scene");
          game.scene.start("Step3Scene", { sessionId: id });
        }
      }
    });
  };

  const pollMvpCode = async () => {
    if (get().registerMode !== "code") return clearTimers();
    try {
      const sid = getSavedSessionId();
      if (!sid) return;
      const res = (await authApiInstance.get<{ code: string | null }>(`/auth/login/get-mvp-code?sessionId=${sid}`)).data;
      if (get().registerMode !== "code") return;
      if (!res?.code) {
        setMvpPollingId(setTimeout(pollMvpCode, 1000));
        return;
      }
      let i = 0;
      const typing = setInterval(() => {
        if (get().registerMode !== "code") return clearInterval(typing);
        if (i < res.code!.length) {
          get().handleRegisterKeyboard(res.code![i++]);
        } else {
          clearInterval(typing);
          setTimeout(triggerAutoVerify, 300);
        }
      }, 250);
    } catch {
      if (get().registerMode === "code") setMvpPollingId(setTimeout(pollMvpCode, 1000));
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
      const fullPhone = getCleanFullPhone(get().registerRawPhone);

      if (!isMock && fullPhone.length !== 11) {
        return set({ registerError: "system_error" });
      }

      clearTimers();
      set({ registerError: "" });

      try {
        const checkRes = await authApi.checkLoginPhone(fullPhone);

        if (checkRes && checkRes.isLogin) {
          set({ registerMode: "exists", registerError: "" });
          return;
        }

        if (typeof window !== "undefined" && checkRes) {
          localStorage.setItem("is_login_flow", checkRes.isLogin.toString());
        }

        const chosenName = useRegistrationStep1Store.getState().name || "";
        const res = await authApi.loginPhone(fullPhone, chosenName);

        if (res?.sessionId || isMock) {
          setSavedSessionId(isMock ? "mock_reg_session_id" : res.sessionId);
          useRegistrationStep3Store.getState().setIsLogin(checkRes ? checkRes.isLogin : false);
          set({ registerMode: "sent", registerError: "" });
        }
      } catch (err) {
        console.error("🚨 [FRONTEND ERR SEND PHONE]:", err);
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
      setActiveTimerId(setInterval(() => {
        const current = get().registerSecs;
        if (current <= 1) {
          clearTimers();
          set({ registerSecs: 0, registerCode: "", registerAttempts: 0, registerError: "expired" });
        } else set({ registerSecs: current - 1 });
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
        if (cur.length === 4) setTimeout(triggerAutoVerify, 50);
      } else {
        const digits = cur.replace(/\D/g, "").slice(0, 10);
        set({ registerRawPhone: digits, registerPhone: `+7${digits}` });
      }
    },

    verifyRegisterSms: async (onSuccess) => {
      const { registerCode, registerAttempts } = get();
      if (registerCode.length !== 4) return;

      const fullPhone = getCleanFullPhone(get().registerRawPhone);

      if (isMock) return (savePhoneToStorage(fullPhone), clearTimers(), onSuccess("mock_verified_reg_session"));
      set({ isVerifyingCode: true, registerError: "" });

      try {
        const res = await authApi.verifySms(fullPhone, registerCode);

        if (res && res.sessionId) {
          if (typeof window !== "undefined") {
            localStorage.setItem("active_reg_session_id", res.sessionId);
          }
          savePhoneToStorage(fullPhone);
          clearTimers();
          set({ isVerifyingCode: false });
          onSuccess(res.sessionId);
        } else {
          throw new Error("Неверный формат ответа СМС");
        }
      } catch (err) {
        console.error("🚨 [FRONTEND ERR VERIFY SMS]:", err);
        const next = registerAttempts + 1;
        clearTimers();
        set({
          registerCode: "",
          isVerifyingCode: false,
          registerAttempts: next >= 3 ? 0 : next,
          registerError: next >= 3 ? "too_many_attempts" : "wrong_code"
        });
        if (next >= 3) await get().sendRegisterPhone();
      }
    }
  };
};
