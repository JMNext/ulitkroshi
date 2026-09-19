import { api } from "@/api/api";
import { StateCreator } from "zustand";
import { LoginState, Step3CombinedState, setShakeTimeoutId, setClearFruitsTimeoutId } from "../useRegistrationStep3Store";

export const createLoginSlice: StateCreator<Step3CombinedState, [], [], LoginState> = (set, get) => ({
  loginSel: [],
  loginMode: "select",
  loginShake: false,
  loginAttempts: 0,
  loginError: "",
  isLoginSubmitting: false,

  toggleLoginSelect: async (id, sessionId, onComplete) => {
    const { loginMode, loginSel, isLoginSubmitting, loginAttempts } = get();
    if (loginMode === "error" || isLoginSubmitting || loginAttempts >= 3) return;

    if (loginSel.includes(id)) return;

    const next = [...loginSel, id];
    if (next.length > 4) return;
    set({ loginSel: next, loginError: "" });

    if (next.length === 4) {
      set({ isLoginSubmitting: true });

      const handleFailure = () => {
        const nextAttempts = loginAttempts + 1;
        if (nextAttempts >= 3) {
          set({ isLoginSubmitting: false, loginMode: "error", loginShake: true, loginAttempts: nextAttempts, loginError: "wrong_fruit" });
        } else {
          set({ isLoginSubmitting: false, loginShake: true, loginAttempts: nextAttempts, loginError: "wrong_fruit" });
          setShakeTimeoutId(setTimeout(() => set({ loginShake: false }), 500));
          setClearFruitsTimeoutId(setTimeout(() => set({ loginSel: [], loginMode: "select" }), 1200));
        }
      };

      try {
        const savedPhone = localStorage.getItem("login_phone_buffer") || "";
        const realSessionId = localStorage.getItem("active_reg_session_id") || sessionId;
        const numericStringCode = next.join("");

        await api.verifyFruit(realSessionId, numericStringCode, savedPhone);
        set({ isLoginSubmitting: false, loginSel: [] });
        onComplete();
      } catch (error) {
        console.error("🚨 [ZUSTAND LOGIN ERR]:", error);
        handleFailure();
      }
    }
  }
});
