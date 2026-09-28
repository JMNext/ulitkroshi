import { useApiStore } from "@/api/store/useApiStore";
import { StateCreator } from "zustand";
import { RegisterState, setClearFruitsTimeoutId, setShakeTimeoutId, Step3CombinedState } from "../useRegistrationStep3Store";

export const createFruitRegisterSlice: StateCreator<Step3CombinedState, [], [], RegisterState> = (set, get) => {
  const handleFail = (att: number, isLogin: boolean) => {
    const next = att + 1;
    if (next >= 3) {
      set({ isRegisterSubmitting: false, step3Mode: "error", registerShake: true, registerAttempts: next, step3Error: "wrong_fruit" });
    } else {
      set({ isRegisterSubmitting: false, registerShake: true, registerAttempts: next, step3Error: "wrong_fruit" });
      setShakeTimeoutId(setTimeout(() => set({ registerShake: false }), 500));
      setClearFruitsTimeoutId(setTimeout(() => set({ registerSel: new Array<number>(), step3Mode: "select", step3Error: "" }), 1200));
    }
  };

  return {
    registerSel: new Array<number>(),
    registerCorr: new Array<number>(),
    step3Mode: "select",
    registerShake: false,
    registerAttempts: 0,
    step3Error: "",
    isRegisterSubmitting: false,

    saveFirstStep: () => {
      set({ registerSel: new Array<number>(), step3Mode: "verify", step3Error: "", isRegisterSubmitting: false });
    },

    toggleRegisterSelect: async (id: number, sessionId: string, onComplete: () => void) => {
      const state = get();

      if (state.isLogin) return;

      const { step3Mode, registerSel, registerCorr, isRegisterSubmitting, registerAttempts } = state;
      if (isRegisterSubmitting || step3Mode === "error" || registerAttempts >= 3 || registerSel.includes(id)) return;

      const nextReg = [...registerSel, id];
      if (nextReg.length > 4) return;
      set({ registerSel: nextReg, step3Error: "" });

      if (nextReg.length === 4 && step3Mode === "select") {
        set({ registerCorr: nextReg, registerSel: new Array<number>(), step3Mode: "confirm" });
        return;
      }

      if (nextReg.length === 4 && (step3Mode === "verify" || step3Mode === "confirm")) {
        set({ isRegisterSubmitting: true });
        const currentCorr = get().registerCorr;

        const isMatch = Array.isArray(currentCorr) && currentCorr.length === 4 && currentCorr.every((v, i) => v === nextReg[i]);

        if (!isMatch) {
          handleFail(registerAttempts, false);
          return;
        }

        try {
          const phone = localStorage.getItem("login_phone_buffer") || localStorage.getItem("saved_user_phone") || localStorage.getItem("phone") || "";
          const currentPetName = localStorage.getItem("chosen_pet_name_buffer") || "";
          const fruitString = nextReg.join("");

          await useApiStore.getState().verifyFruit(sessionId, fruitString, phone, currentPetName);
          set({ isRegisterSubmitting: false, registerSel: new Array<number>(), registerCorr: new Array<number>() });
          onComplete();
        } catch (err) {
          handleFail(registerAttempts, false);
        }
      }
    }
  };
};
