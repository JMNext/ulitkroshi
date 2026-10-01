import { useApiStore } from "@/api/store/useApiStore";
import { isMock } from "@/api/api";
import { StateCreator } from "zustand";
import { LoginState, Step3CombinedState, setClearFruitsTimeoutId, setShakeTimeoutId } from "../useRegistrationStep3Store";

export const createFruitLoginSlice: StateCreator<Step3CombinedState, [], [], LoginState> = (set, get) => ({
  loginSel: new Array<number>(),
  loginMode: "select",
  loginShake: false,
  loginAttempts: 0,
  loginError: "",
  isLoginSubmitting: false,

  removeLastLoginFruit: () => {
    const { loginSel, isLoginSubmitting, loginMode } = get();
    if (isLoginSubmitting || loginMode === "error" || loginSel.length === 0) return;
    set({ loginSel: loginSel.slice(0, -1), loginError: "" });
  },

  toggleLoginSelect: async (id: number, sessionId: string, onComplete: () => void) => {
    const { loginMode, loginSel, isLoginSubmitting, loginAttempts } = get();

    if (loginMode === "error" || isLoginSubmitting || loginAttempts >= 3 || loginSel.includes(id)) {
      return;
    }

    const next = [...loginSel, id];
    if (next.length > 4) return;
    set({ loginSel: next, loginError: "" });

    if (next.length === 4) {
      set({ isLoginSubmitting: true });
      try {
        const phone = localStorage.getItem("login_phone_buffer") || "";
        const fruitString = next.join("");

        const res = await useApiStore.getState().loginFruit(fruitString, phone);

        if (res?.accessToken || isMock) {
          set({ isLoginSubmitting: false, loginSel: new Array<number>() });
          onComplete();
        } else {
          throw new Error();
        }
      } catch (err) {
        const att = loginAttempts + 1;
        if (att >= 3) {
          set({ isLoginSubmitting: false, loginMode: "error", loginShake: true, loginAttempts: att, loginError: "wrong_fruit" });
        } else {
          set({ isLoginSubmitting: false, loginShake: true, loginAttempts: att, loginError: "wrong_fruit" });
          setShakeTimeoutId(setTimeout(() => set({ loginShake: false }), 500));
          setClearFruitsTimeoutId(setTimeout(() => set({ loginSel: new Array<number>(), loginMode: "select", loginError: "" }), 1200));
        }
      }
    }
  }
});
