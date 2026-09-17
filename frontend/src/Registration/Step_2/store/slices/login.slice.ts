import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { api, isMock } from "@/api/api";
import { EventBus } from "@/eventbus/EventBus";
import { StateCreator } from "zustand";
import { CustomWindow, LoginState, Step2CombinedState } from "../useRegistrationStep2Store";

const savePhoneToStorage = (p: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("saved_user_phone", p);
    localStorage.setItem("login_phone_buffer", p);
  }
};

export const createLoginSlice: StateCreator<Step2CombinedState, [], [], LoginState> = (set, get) => ({
  loginPhone: "",
  loginRawPhone: "",
  loginError: "",

  sendLoginPhone: async () => {
    const { loginRawPhone } = get();
    if (!isMock && loginRawPhone.length !== 10) return;
    set({ loginError: "" });
    const fullPhone = `+7${loginRawPhone}`;

    try {
      const res = await api.checkLoginPhone(fullPhone);
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
    } catch {
      useRegistrationStep3Store.getState().setIsLogin(false);
      set({ loginError: "user_not_found" });
    }
  },

  handleLoginKeyboard: (key) => {
    let cur = get().loginRawPhone;

    if (/backspace|delete/i.test(key)) cur = cur.slice(0, -1);
    else if ("0123456789".includes(key) && cur.length < 10) cur += key;
    else return;

    set({ loginRawPhone: cur, loginPhone: `+7${cur}` });
    if (cur.length === 10 && cur !== "") {
      setTimeout(() => {
        get().sendLoginPhone();
      }, 50);
    }
  }
});
