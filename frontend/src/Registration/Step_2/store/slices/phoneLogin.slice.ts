import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { authApi } from "@/api/auth.api";
import { isMock } from "@/api/client";
import { EventBus } from "@/eventbus/EventBus";
import { StateCreator } from "zustand";
import { LoginState, Step2CombinedState } from "../useRegistrationStep2Store";

const save = (p: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("saved_user_phone", p);
    localStorage.setItem("login_phone_buffer", p);
  }
};

let sub = false;

export const createPhoneLoginSlice: StateCreator<Step2CombinedState, [], [], LoginState> = (set, get) => ({
  loginPhone: "",
  loginRawPhone: "",
  loginError: "",

  sendLoginPhone: async () => {
    const raw = get().loginRawPhone.replace(/\D/g, "").slice(-10);
    if (sub || (!isMock && raw.length < 10)) return;

    set({ loginError: "" });
    sub = true;
    const phone = `7${raw}`;

    try {
      const res = await authApi.checkLoginPhone(phone);
      if (res?.isLogin || isMock) {
        save(phone);
        localStorage.removeItem("active_reg_session_id");
        useRegistrationStep3Store.getState().setIsLogin(true);
        EventBus.emit("step2_scene_stop");
        EventBus.emit("step3_scene_start", { sessionId: isMock ? "mock_login_flow_session" : "login_flow_direct" });
        const game = typeof window !== "undefined" ? (window as any).phaserGame : null;
        if (game) {
          game.scene.stop("Step2Scene");
          game.scene.start("Step3Scene", { sessionId: isMock ? "mock_login_flow_session" : "login_flow_direct" });
        }
      } else {
        useRegistrationStep3Store.getState().setIsLogin(false);
        set({ loginError: "user_not_found" });
      }
    } catch {
      useRegistrationStep3Store.getState().setIsLogin(false);
      set({ loginError: "user_not_found" });
    } finally {
      sub = false;
    }
  },

  handleLoginKeyboard: (key) => {
    let cur = get().loginRawPhone;
    if (/backspace|delete/i.test(key)) cur = cur.slice(0, -1);
    else if ("0123456789".includes(key) && cur.replace(/\D/g, "").length < 10) cur += key;
    else return;

    const d = cur.replace(/\D/g, "").slice(0, 10);
    set({ loginRawPhone: d, loginPhone: `+7${d}` });
    if (d.length === 10 && !sub) setTimeout(() => get().sendLoginPhone(), 50);
  }
});
