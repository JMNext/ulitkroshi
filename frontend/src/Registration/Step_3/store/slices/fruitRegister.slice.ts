import { authApi } from "@/api/auth.api";
import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { StateCreator } from "zustand";
import { RegisterState, setClearFruitsTimeoutId, setShakeTimeoutId, Step3CombinedState } from "../useRegistrationStep3Store";

export const createFruitRegisterSlice: StateCreator<Step3CombinedState, [], [], RegisterState> = (set, get) => {
  const handleFail = (att: number, isLogin: boolean) => {
    const next = att + 1;
    if (next >= 3) {
      set(isLogin ? { isLoginSubmitting: false, loginMode: "error", loginShake: true, loginAttempts: next, loginError: "wrong_fruit" } : { isRegisterSubmitting: false, step3Mode: "error", registerShake: true, registerAttempts: next, step3Error: "wrong_fruit" });
    } else {
      set(isLogin ? { isLoginSubmitting: false, loginShake: true, loginAttempts: next, loginError: "wrong_fruit" } : { isRegisterSubmitting: false, registerShake: true, registerAttempts: next, step3Error: "wrong_fruit" });
      setShakeTimeoutId(setTimeout(() => set(isLogin ? { loginShake: false } : { registerShake: false }), 500));
      setClearFruitsTimeoutId(setTimeout(() => set(isLogin ? { loginSel: [] } : { registerSel: [], step3Error: "" }), 1200));
    }
  };

  return {
    registerSel: [], registerCorr: [], step3Mode: "select", registerShake: false, registerAttempts: 0, step3Error: "", isRegisterSubmitting: false,

    saveFirstStep: () => set({ registerSel: [], step3Mode: "verify", step3Error: "", isRegisterSubmitting: false }),

    toggleRegisterSelect: async (id, sessionId, onComplete) => {
      const state = get();
      if (state.isLogin) {
        const { loginMode, loginSel, isLoginSubmitting, loginAttempts } = state;
        if (isLoginSubmitting || loginMode === "error" || loginAttempts >= 3 || loginSel.includes(id)) return;

        const nextLogin = [...loginSel, id];
        if (nextLogin.length > 4) return;
        set({ loginSel: nextLogin, loginError: "" });

        if (nextLogin.length === 4) {
          set({ isLoginSubmitting: true });
          try {
            const res = await authApi.verifyFruit(sessionId, nextLogin.join(""));
            if (res?.accessToken) { set({ isLoginSubmitting: false, loginSel: [] }); onComplete(); }
            else throw new Error();
          } catch { handleFail(loginAttempts, true); }
        }
        return;
      }

      const { step3Mode, registerSel, registerCorr, isRegisterSubmitting, registerAttempts } = state;
      if (isRegisterSubmitting || step3Mode === "error" || registerAttempts >= 3 || registerSel.includes(id)) return;

      const nextReg = [...registerSel, id];
      if (nextReg.length > 4) return;
      set({ registerSel: nextReg, step3Error: "" });

      if (nextReg.length === 4) {
        if (step3Mode === "select") return set({ registerCorr: nextReg, registerSel: [], step3Mode: "confirm" });

        if (step3Mode === "verify") {
          set({ isRegisterSubmitting: true });
          if (!(registerCorr.length === 4 && registerCorr.every((v, i) => v === nextReg[i]))) return handleFail(registerAttempts, false);

          try {
            const s2 = useRegistrationStep2Store.getState() as any;
            const digits = (s2?.loginRawPhone || s2?.registerRawPhone || localStorage.getItem("saved_user_phone") || localStorage.getItem("login_phone_buffer") || "").replace(/\D/g, "");

            await authApi.verifyFruit(sessionId, nextReg.join(""), digits.startsWith("7") ? digits : `7${digits}`);
            set({ isRegisterSubmitting: false, registerSel: [], registerCorr: [] });
            onComplete();
          } catch { handleFail(registerAttempts, false); }
        }
      }
    }
  };
};
