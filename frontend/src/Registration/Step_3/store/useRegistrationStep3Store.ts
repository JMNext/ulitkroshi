import { gatewayApi } from "@/api/api";
import { useApiStore } from "@/api/store/useApiStore";
import { create } from "zustand";

export type CaptchaMode = "select" | "confirm" | "verify" | "error";

export interface LayoutContext {
  screenMode: "fold" | "mobile" | "tablet" | "desktop"; viewW: number; scale: number; isVert: boolean;
}

interface Step3State {
  sel: number[]; corr: number[]; mode: CaptchaMode; shake: boolean; fruitOrder: number[]; attempts: number;
  errorMessage: "wrong_fruit" | "system_error" | ""; isSubmitting: boolean; isLogin: boolean; layoutContext: LayoutContext | null; computedScale: number;
  toggleSelect: (id: number, sessionId: string, onComplete: () => void) => Promise<void>;
  saveFirstStep: () => void; generateNewOrder: () => void; setIsLogin: (isLogin: boolean) => void;
  setLayout: (layoutContext: LayoutContext, computedScale: number) => void; resetStore: (keepIsLogin?: boolean, isRegistrationSuccess?: boolean) => void;
}

const LETTERS_LOOKUP = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p"] as const;

const genOrder = (): number[] => [...Array(16).keys()].sort(() => Math.random() - 0.5);

let shakeTimeoutId: ReturnType<typeof setTimeout> | null = null;
let clearFruitsTimeoutId: ReturnType<typeof setTimeout> | null = null;

const clearTimers = () => {
  if (shakeTimeoutId) clearTimeout(shakeTimeoutId);
  if (clearFruitsTimeoutId) clearTimeout(clearFruitsTimeoutId);
  shakeTimeoutId = clearFruitsTimeoutId = null;
};

const initialValues = {
  sel: [], corr: [], mode: "select" as const, shake: false, attempts: 0, errorMessage: "" as const, isSubmitting: false, isLogin: false, layoutContext: null, computedScale: 1
};

export const useRegistrationStep3Store = create<Step3State>((set, get) => ({
  ...initialValues,
  fruitOrder: genOrder(),

  setLayout: (layoutContext, computedScale) => set({ layoutContext, computedScale }),
  setIsLogin: (isLogin) => set({ isLogin }),

  saveFirstStep: () => {
    set({ sel: [], mode: "verify", errorMessage: "", isSubmitting: false });
  },

  generateNewOrder: () => {
    set({ fruitOrder: genOrder() });
  },

  toggleSelect: async (id, sessionId, onComplete) => {
    const { mode, sel, corr, isSubmitting, attempts, isLogin } = get();
    if (mode === "error" || isSubmitting || attempts >= 3) return;

    const next = sel.includes(id) ? sel.filter((v) => v !== id) : [...sel, id];
    if (next.length > 4) return;
    set({ sel: next, errorMessage: "" });

    if (next.length === 4) {
      set({ isSubmitting: true });

      const handleInputFailure = async (errType: "wrong_fruit" | "system_error") => {
        const nextAttempts = attempts + 1;
        clearTimers();

        if (nextAttempts >= 3) {
          set({ isSubmitting: false, mode: "error", shake: true, attempts: nextAttempts, errorMessage: errType });
        } else {
          set({ isSubmitting: false, shake: true, attempts: nextAttempts, errorMessage: errType });
          shakeTimeoutId = setTimeout(() => set({ shake: false }), 500);
          clearFruitsTimeoutId = setTimeout(() => {
            const nextMode = isLogin ? "select" : (corr.length > 0 ? "verify" : "select");
            set({ sel: [], mode: nextMode });
          }, 1200);
        }
      };

      const verifyServerFruit = async () => {
        try {
          const savedPhone = localStorage.getItem("login_phone_buffer") || "";
          const realSessionId = localStorage.getItem("active_reg_session_id") || sessionId;

          const sortedFruitIds = [...next].sort((a, b) => a - b);
          const stringLetterCode = sortedFruitIds.map((fruitId) => LETTERS_LOOKUP[fruitId] || "a").join("");

          await useApiStore.getState().verifyFruit(realSessionId, stringLetterCode, savedPhone, isLogin);
          set({ isSubmitting: false });
          onComplete();
        } catch {
          await handleInputFailure("wrong_fruit");
        }
      };

      if (isLogin) {
        await verifyServerFruit();
        return;
      }

      if (mode === "select") {
        const sortedFirstSelection = [...next].sort((a, b) => a - b);
        set({ corr: sortedFirstSelection, sel: [], isSubmitting: false, mode: "confirm" });
      } else if (mode === "verify") {
        const sortedCurrentSelection = [...next].sort((a, b) => a - b);
        const isMatch = sortedCurrentSelection.length === corr.length && sortedCurrentSelection.every((uid, idx) => uid === corr[idx]);

        if (isMatch) {
          await verifyServerFruit();
        } else {
          await handleInputFailure("wrong_fruit");
        }
      }
    }
  },

  resetStore: (keepIsLogin = false, isRegistrationSuccess = false) => {
    clearTimers();
    if (isRegistrationSuccess) {
      set({ ...initialValues, isLogin: keepIsLogin ? get().isLogin : false });
    } else {
      set({ ...initialValues, fruitOrder: genOrder(), isLogin: keepIsLogin ? get().isLogin : false });
    }
  }
}));
