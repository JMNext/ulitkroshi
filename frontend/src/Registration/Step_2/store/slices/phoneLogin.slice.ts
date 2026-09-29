import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { isMock } from "@/api/api";
import { authApi } from "@/api/services/auth.api";
import { EventBus } from "@/eventbus/EventBus";
import { StateCreator } from "zustand";
import { LoginState, Step2CombinedState } from "../useRegistrationStep2Store";

interface SnailWindow { phaserGame?: { scene: { stop: (k: string) => void; start: (k: string, d?: any) => void } } }

const cleanPhone = (raw: string): string => {
  const d = String(raw || "").replace(/[^0-9]/g, "").trim();
  return d.length === 11 && (d.startsWith("7") || d.startsWith("8")) ? "7" + d.slice(1) : d.length > 10 ? "7" + d.slice(-10) : "7" + d;
};

const saveAndSwitch = (phone: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("saved_user_phone", phone);
    localStorage.setItem("login_phone_buffer", phone);
    localStorage.removeItem("active_reg_session_id");
    const gw = window as unknown as SnailWindow;
    if (gw.phaserGame) {
      gw.phaserGame.scene.stop("Step2Scene");
      gw.phaserGame.scene.start("Step3Scene", { sessionId: "login_flow_direct" });
    }
  }
  EventBus.emit("step2_scene_stop");
  EventBus.emit("step3_scene_start", { sessionId: "login_flow_direct" });
};

let sub = false;

export const createPhoneLoginSlice: StateCreator<Step2CombinedState, [], [], LoginState> = (set, get) => ({
  loginPhone: "", loginRawPhone: "", loginError: "",

  sendLoginPhone: async () => {
    const phone = cleanPhone(get().loginRawPhone);
    if (sub) return;
    if (phone.length !== 11) return set({ loginError: "user_not_found" });

    set({ loginError: "" });
    sub = true;

    try {
      if (isMock) {
        saveAndSwitch(phone);
        useRegistrationStep3Store.getState().setIsLogin(true);
        return;
      }

      const res = await authApi.checkLoginPhone(phone);
      if (res?.isLogin) {
        saveAndSwitch(phone);
        useRegistrationStep3Store.getState().setIsLogin(true);
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
    set({ loginRawPhone: d, loginPhone: "+7" + d });

    if (d.length === 10 && !sub) {
      setTimeout(() => { get().sendLoginPhone().catch(() => {}); }, 50);
    }
  }
});
