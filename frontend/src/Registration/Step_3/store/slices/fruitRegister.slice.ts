import { StateCreator } from "zustand";
import { authApi } from "@/api/auth.api";
import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { Step3CombinedState, RegisterState, setShakeTimeoutId, setClearFruitsTimeoutId } from "../useRegistrationStep3Store";

export const createFruitRegisterSlice: StateCreator<Step3CombinedState, [], [], RegisterState> = (set, get) => ({
  registerSel: [],
  registerCorr: [],
  step3Mode: "select",
  registerShake: false,
  registerAttempts: 0,
  step3Error: "",
  isRegisterSubmitting: false,

  saveFirstStep: () => {
    set({ registerSel: [], step3Mode: "verify", step3Error: "", isRegisterSubmitting: false });
  },

  toggleRegisterSelect: async (id, sessionId, onComplete) => {
    const combinedState = get() as any;
    const isLoginFlow = combinedState.isLogin;

    if (isLoginFlow) {
      const loginSel = combinedState.loginSel || [];
      const loginAttempts = combinedState.loginAttempts || 0;
      const isLoginSubmitting = combinedState.isLoginSubmitting || false;
      const loginMode = combinedState.loginMode || "select";

      if (isLoginSubmitting || loginMode === "error" || loginAttempts >= 3) return;
      if (loginSel.includes(id)) return;

      const nextLoginSel = [...loginSel, id];
      if (nextLoginSel.length > 4) return;
      set({ loginSel: nextLoginSel, loginError: "" } as any);

      if (nextLoginSel.length === 4) {
        set({ isLoginSubmitting: true } as any);
        const codeStr = nextLoginSel.join("");
        try {
          const response = await authApi.verifyFruit(sessionId, codeStr);
          if (response && response.accessToken) {
            set({ isLoginSubmitting: false, loginSel: [] } as any);
            onComplete();
          } else {
            throw new Error("wrong_fruit");
          }
        } catch (error) {
          console.error("🚨 [FRUIT LOGIN ERROR]:", error);
          const nextAttempts = loginAttempts + 1;
          if (nextAttempts >= 3) {
            set({ isLoginSubmitting: false, loginMode: "error", loginShake: true, loginAttempts: nextAttempts, loginError: "wrong_fruit" } as any);
          } else {
            set({ isLoginSubmitting: false, loginShake: true, loginAttempts: nextAttempts, loginError: "wrong_fruit" } as any);
            setShakeTimeoutId(setTimeout(() => set({ loginShake: false } as any), 500));
            setClearFruitsTimeoutId(setTimeout(() => set({ loginSel: [] } as any), 1200));
          }
        }
      }
      return;
    }

    const { step3Mode, registerSel, registerCorr, isRegisterSubmitting, registerAttempts } = get();
    if (isRegisterSubmitting || step3Mode === "error" || registerAttempts >= 3) return;

    if (registerSel.includes(id)) return;

    const next = [...registerSel, id];
    if (next.length > 4) return;
    set({ registerSel: next, step3Error: "" });

    if (next.length === 4) {
      const numericStringCode = next.join("");

      if (step3Mode === "select") {
        set({
          registerCorr: next,
          registerSel: [],
          step3Mode: "confirm"
        });
        return;
      }

      if (step3Mode === "verify") {
        set({ isRegisterSubmitting: true });

        const isMatch = registerCorr.length === 4 && registerCorr.every((val, index) => val === next[index]);

        if (!isMatch) {
          const nextAttempts = registerAttempts + 1;
          if (nextAttempts >= 3) {
            set({ isRegisterSubmitting: false, step3Mode: "error", registerShake: true, registerAttempts: nextAttempts, step3Error: "wrong_fruit" });
          } else {
            set({ isRegisterSubmitting: false, registerShake: true, registerAttempts: nextAttempts, step3Error: "wrong_fruit" });
            setShakeTimeoutId(setTimeout(() => set({ registerShake: false }), 500));
            setClearFruitsTimeoutId(setTimeout(() => {
              set({ registerSel: [], step3Error: "" });
            }, 1200));
          }
          return;
        }

        try {
          const step2State = useRegistrationStep2Store.getState() as any;
          const rawPhoneDigits =
            step2State?.loginRawPhone ||
            step2State?.registerRawPhone ||
            localStorage.getItem("saved_user_phone") ||
            localStorage.getItem("login_phone_buffer") ||
            "";

          const cleanDigits = rawPhoneDigits.replace(/\D/g, "");
          const fullPhone = cleanDigits.startsWith("7") ? cleanDigits : `7${cleanDigits}`;

          await authApi.verifyFruit(sessionId, numericStringCode, fullPhone);

          set({ isRegisterSubmitting: false, registerSel: [], registerCorr: [] });
          onComplete();
        } catch (error: any) {
          console.error("🚨 [FRUIT REGISTRATION ERROR]:", error);
          const nextAttempts = registerAttempts + 1;
          if (nextAttempts >= 3) {
            set({ isRegisterSubmitting: false, step3Mode: "error", registerShake: true, registerAttempts: nextAttempts, step3Error: "wrong_fruit" });
          } else {
            set({ isRegisterSubmitting: false, registerShake: true, registerAttempts: nextAttempts, step3Error: "wrong_fruit" });
            setShakeTimeoutId(setTimeout(() => set({ registerShake: false }), 500));
            setClearFruitsTimeoutId(setTimeout(() => {
              set({ registerSel: [], step3Error: "" });
            }, 1200));
          }
        }
      }
    }
  }
});
