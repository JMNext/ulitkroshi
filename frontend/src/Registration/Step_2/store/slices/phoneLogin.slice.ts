import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { isMock } from "@/api/client";
import { authApi } from "@/api/auth.api";
import { EventBus } from "@/eventbus/EventBus";
import { StateCreator } from "zustand";
import { CustomWindow, LoginState, Step2CombinedState } from "../useRegistrationStep2Store";

const savePhoneToStorage = (p: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("saved_user_phone", p);
    localStorage.setItem("login_phone_buffer", p);
  }
};

let isSubmittingPhone = false;

export const createPhoneLoginSlice: StateCreator<Step2CombinedState, [], [], LoginState> = (set, get) => ({
  loginPhone: "",
  loginRawPhone: "",
  loginError: "",

  sendLoginPhone: async () => {
    const { loginRawPhone } = get();
    const cleanDigits = loginRawPhone.replace(/\D/g, "").slice(-10);

    if (isSubmittingPhone) return;

    if (!isMock && cleanDigits.length < 10) {
      console.error(`[ZUSTAND] Длина телефона меньше 10 цифр (${cleanDigits.length}). Отмена.`);
      return;
    }

    set({ loginError: "" });
    isSubmittingPhone = true;
    const fullPhone = `7${cleanDigits}`;

    try {
      const res = await authApi.checkLoginPhone(fullPhone);

      if (res?.isLogin || isMock) {
        savePhoneToStorage(fullPhone);
        localStorage.removeItem("active_reg_session_id");
        useRegistrationStep3Store.getState().setIsLogin(true);
        EventBus.emit("step2_scene_stop");
        EventBus.emit("step3_scene_start", { sessionId: isMock ? "mock_login_flow_session" : "login_flow_direct" });
        if (typeof window !== "undefined") {
          const customWindow = window as unknown as CustomWindow;
          const game = customWindow.phaserGame;
          if (game) {
            game.scene.stop("Step2Scene");
            game.scene.start("Step3Scene", { sessionId: isMock ? "mock_login_flow_session" : "login_flow_direct" });
          }
        }
      } else {
        useRegistrationStep3Store.getState().setIsLogin(false);
        set({ loginError: "user_not_found" });
      }
    } catch (err: any) {
      console.error(`[ZUSTAND] Критическая ошибка запроса:`, err.message || err);
      useRegistrationStep3Store.getState().setIsLogin(false);
      set({ loginError: "user_not_found" });
    } finally {
      isSubmittingPhone = false;
    }
  },

  handleLoginKeyboard: (key) => {
    let cur = get().loginRawPhone;

    if (/backspace|delete/i.test(key)) cur = cur.slice(0, -1);
    else if ("0123456789".includes(key) && cur.replace(/\D/g, "").length < 10) cur += key;
    else {
      return;
    }

    const digits = cur.replace(/\D/g, "").slice(0, 10);
    set({ loginRawPhone: digits, loginPhone: `+7${digits}` });

    if (digits.length === 10 && !isSubmittingPhone) {
      setTimeout(() => {
        get().sendLoginPhone();
      }, 50);
    }
  }
});
