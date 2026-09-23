import { authApi } from "@/api/auth.api";
import { StateCreator } from "zustand";
import { LoginState, Step3CombinedState, setClearFruitsTimeoutId, setShakeTimeoutId } from "../useRegistrationStep3Store";

export const createFruitLoginSlice: StateCreator<Step3CombinedState, [], [], LoginState> = (set, get) => ({
  loginSel: [], loginMode: "select", loginShake: false, loginAttempts: 0, loginError: "", isLoginSubmitting: false,

  toggleLoginSelect: async (id, sessionId, onComplete) => {
    const { loginMode, loginSel, isLoginSubmitting, loginAttempts } = get();
    if (loginMode === "error" || isLoginSubmitting || loginAttempts >= 3 || loginSel.includes(id)) return;

    const next = [...loginSel, id];
    if (next.length > 4) return;
    set({ loginSel: next, loginError: "" });

    if (next.length === 4) {
      set({ isLoginSubmitting: true });
      try {
        const phone = localStorage.getItem("login_phone_buffer") || "";
        const sId = localStorage.getItem("active_reg_session_id") || sessionId;

        await authApi.verifyFruit(sId, next.join(""), phone);
        set({ isLoginSubmitting: false, loginSel: [] });
        onComplete();
      } catch {
        const att = loginAttempts + 1;
        if (att >= 3) set({ isLoginSubmitting: false, loginMode: "error", loginShake: true, loginAttempts: att, loginError: "wrong_fruit" });
        else {
          set({ isLoginSubmitting: false, loginShake: true, loginAttempts: att, loginError: "wrong_fruit" });
          setShakeTimeoutId(setTimeout(() => set({ loginShake: false }), 500));
          setClearFruitsTimeoutId(setTimeout(() => set({ loginSel: [], loginMode: "select" }), 1200));
        }
      }
    }
  }
});
