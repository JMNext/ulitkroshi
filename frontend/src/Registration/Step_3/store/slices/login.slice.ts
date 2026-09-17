import { useApiStore } from "@/api/store/useApiStore";
import { StateCreator } from "zustand";
import { LoginState, Step3CombinedState, clearTimers, setShakeTimeoutId, setClearFruitsTimeoutId } from "../useRegistrationStep3Store";

const LETTERS_LOOKUP = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p"] as const;

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

    const next = loginSel.includes(id) ? loginSel.filter((v) => v !== id) : [...loginSel, id];
    if (next.length > 4) return;
    set({ loginSel: next, loginError: "" });

    if (next.length === 4) {
      set({ isLoginSubmitting: true });

      const handleFailure = () => {
        const nextAttempts = loginAttempts + 1;
        clearTimers();

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

        const stringLetterCode = next.map((fruitId) => LETTERS_LOOKUP[fruitId] || "a").join("");

        await useApiStore.getState().verifyFruit(realSessionId, stringLetterCode, savedPhone);
        set({ isLoginSubmitting: false, loginSel: [] });
        onComplete();
      } catch {
        handleFailure();
      }
    }
  }
});
