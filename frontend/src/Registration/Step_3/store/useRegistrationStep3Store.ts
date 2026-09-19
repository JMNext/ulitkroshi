import { create } from "zustand";
import { createLoginSlice } from "./slices/login.slice";
import { createRegisterSlice } from "./slices/register.slice";

export type CaptchaMode = "select" | "confirm" | "verify" | "error";

export interface LayoutContext {
  screenMode: "fold" | "mobile" | "tablet" | "desktop";
  viewW: number;
  scale: number;
  isVert: boolean;
}

export interface LoginState {
  loginSel: number[];
  loginMode: CaptchaMode;
  loginShake: boolean;
  loginAttempts: number;
  loginError: "wrong_fruit" | "system_error" | "";
  isLoginSubmitting: boolean;
  toggleLoginSelect: (id: number, sessionId: string, onComplete: () => void) => Promise<void>;
}

export interface RegisterState {
  registerSel: number[];
  registerCorr: number[];
  step3Mode: CaptchaMode;
  registerShake: boolean;
  registerAttempts: number;
  step3Error: "wrong_fruit" | "server_error" | "";
  isRegisterSubmitting: boolean;
  saveFirstStep: () => void;
  toggleRegisterSelect: (id: number, sessionId: string, onComplete: () => void) => Promise<void>;
}

export interface Step3CombinedState extends LoginState, RegisterState {
  isLogin: boolean;
  fruitOrder: number[];
  layoutContext: LayoutContext | null;
  computedScale: number;
  generateNewOrder: () => void;
  setIsLogin: (isLogin: boolean) => void;
  setLayout: (layoutContext: LayoutContext, computedScale: number) => void;
  resetStore: (keepIsLogin?: boolean, isRegistrationSuccess?: boolean) => void;
}

const genOrder = (): number[] => Array.from({ length: 16 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

let shakeTimeoutId: ReturnType<typeof setTimeout> | null = null;
let clearFruitsTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const setShakeTimeoutId = (id: ReturnType<typeof setTimeout> | null) => { shakeTimeoutId = id; };
export const setClearFruitsTimeoutId = (id: ReturnType<typeof setTimeout> | null) => { clearFruitsTimeoutId = id; };

export const clearTimers = () => {
  if (shakeTimeoutId) clearTimeout(shakeTimeoutId);
  if (clearFruitsTimeoutId) clearTimeout(clearFruitsTimeoutId);
  shakeTimeoutId = clearFruitsTimeoutId = null;
};

const initialValues = {
  loginSel: [], loginMode: "select" as const, loginShake: false, loginAttempts: 0, loginError: "" as const, isLoginSubmitting: false,
  registerSel: [], registerCorr: [], step3Mode: "select" as const, registerShake: false, registerAttempts: 0, step3Error: "" as const, isRegisterSubmitting: false
};

export const useRegistrationStep3Store = create<Step3CombinedState>()((set, get, ...a) => ({
  ...initialValues,
  isLogin: false,
  fruitOrder: genOrder(),
  layoutContext: null,
  computedScale: 1,

  ...createLoginSlice(set, get, ...a),
  ...createRegisterSlice(set, get, ...a),

  setLayout: (layoutContext, computedScale) => set({ layoutContext, computedScale }),
  setIsLogin: (isLogin) => set((state) => ({ ...state, isLogin, loginMode: "select", step3Mode: "select" })),
  generateNewOrder: () => set({ fruitOrder: genOrder() }),

  resetStore: (keepIsLogin = false, isRegistrationSuccess = false) => {
    clearTimers();
    if (get().isLogin) {
      set({
        loginSel: [],
        loginShake: false,
        loginError: "",
        loginMode: "select",
        isLoginSubmitting: false
      });
    } else {
      if (isRegistrationSuccess) {
        set((state) => ({
          ...state,
          ...initialValues,
          isLogin: keepIsLogin ? state.isLogin : false,
          fruitOrder: state.fruitOrder
        }));
      } else {
        set({
          registerSel: [],
          registerShake: false,
          step3Error: "",
          step3Mode: "select",
          isRegisterSubmitting: false
        });
      }
    }
  }
}));
