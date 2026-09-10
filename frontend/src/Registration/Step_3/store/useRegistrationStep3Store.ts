import { create } from "zustand";
import { useApiStore } from "@/api/store/useApiStore";
import { isMock, gatewayApi } from "@/api/api";

export type CaptchaMode = "select" | "confirm" | "verify" | "error";

interface Step3State {
  sel: number[]; corr: number[]; mode: CaptchaMode; shake: boolean; fruitOrder: number[];
  attempts: number; errorMessage: "wrong_fruit" | "system_error" | ""; isSubmitting: boolean; isLogin: boolean;
  toggleSelect: (id: number, sessionId: string, onComplete: () => void) => Promise<void>;
  saveFirstStep: () => void; generateNewOrder: () => void; setIsLogin: (isLogin: boolean) => void;
  resetStore: (keepIsLogin?: boolean, isRegistrationSuccess?: boolean) => void;
}

const LETTERS_LOOKUP = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p'];

const genOrder = (): number[] => Array.from({ length: 16 }, (_, i) => i).sort(() => Math.random() - 0.5);

let shakeTimeoutId: any = null;
let clearFruitsTimeoutId: any = null;

const clearTimers = () => { 
  if (shakeTimeoutId) clearTimeout(shakeTimeoutId); 
  if (clearFruitsTimeoutId) clearTimeout(clearFruitsTimeoutId); 
  shakeTimeoutId = clearFruitsTimeoutId = null; 
};

const initialOrder = genOrder();

export const useRegistrationStep3Store = create<Step3State>((set, get) => ({
  sel: [], corr: [], mode: "select", shake: false, fruitOrder: initialOrder, attempts: 0, errorMessage: "", isSubmitting: false, isLogin: false,

  toggleSelect: async (id, sessionId, onComplete) => {
    const { mode, sel, corr, isSubmitting, attempts, isLogin } = get();
    if (mode === "error" || isSubmitting || attempts >= 3) return;

    const next = sel.includes(id) ? sel.filter((v) => v !== id) : [...sel, id];
    if (next.length > 4) return;
    set({ sel: next, errorMessage: "" });

    if (next.length === 4) {
      set({ isSubmitting: true });

      const handleInputFailure = async (errType: "wrong_fruit" | "system_error") => {
        const nextAttempts = attempts + 1; clearTimers();
        const savedPhone = localStorage.getItem("login_phone_buffer") || "";
        
        if (nextAttempts >= 3) {
          if (!isMock && savedPhone) {
            try { await gatewayApi.post("/auth/login/cleanup-registration", { phone: savedPhone }); } catch {}
          }
          set({ isSubmitting: false, mode: "error", shake: true, attempts: nextAttempts, errorMessage: errType });
        } else {
          set({ isSubmitting: false, shake: true, attempts: nextAttempts, errorMessage: errType });
          shakeTimeoutId = setTimeout(() => set({ shake: false }), 500);
          clearFruitsTimeoutId = setTimeout(() => set({ sel: [], mode: isLogin ? "select" : (corr.length > 0 ? "verify" : "select") }), 1200);
        }
      };

      const verifyServerFruit = async () => {
        try {
          const savedPhone = localStorage.getItem("login_phone_buffer") || "";
          const realSessionId = localStorage.getItem("active_reg_session_id") || sessionId;
          const stringLetterCode = next.map(idx => LETTERS_LOOKUP[idx] || 'a').join('');
          
          await useApiStore.getState().verifyFruit(realSessionId, stringLetterCode, savedPhone, isLogin);
          set({ isSubmitting: false }); 
          onComplete();
        } catch { 
          if (!isLogin) {
            localStorage.setItem("mock_accessToken", "true");
            set({ isSubmitting: false }); 
            onComplete();
          } else {
            await handleInputFailure("wrong_fruit"); 
          }
        }
      };

      if (isMock) {
        set({ isSubmitting: false });
        if (isLogin) { localStorage.setItem("mock_accessToken", "true"); onComplete(); }
        else if (mode === "select") set({ corr: next, sel: [], mode: "confirm" });
        else if (mode === "verify") {
          if (next.length === corr.length && next.every((v, i) => v === corr[i])) { 
            localStorage.setItem("mock_accessToken", "true"); 
            onComplete(); 
          }
          else handleInputFailure("wrong_fruit");
        }
        return;
      }

      if (isLogin) { await verifyServerFruit(); return; }

      if (mode === "select") {
        set({ corr: next, sel: [], isSubmitting: false, mode: "confirm" });
      } else if (mode === "verify") {
        if (next.length === corr.length && next.every((v, i) => v === corr[i])) {
          await verifyServerFruit();
        } else {
          await handleInputFailure("wrong_fruit");
        }
      }
    }
  },

  saveFirstStep: () => set({ sel: [], mode: "verify", errorMessage: "", isSubmitting: false }),
  generateNewOrder: () => set({ fruitOrder: genOrder() }),
  setIsLogin: (isLogin) => set({ isLogin }),
  resetStore: (keepIsLogin = false, isRegistrationSuccess = false) => { 
    clearTimers(); 
    const savedPhone = localStorage.getItem("login_phone_buffer") || "";
    
    if (!isMock && savedPhone && !isRegistrationSuccess) {
      gatewayApi.post("/auth/login/cleanup-registration", { phone: savedPhone }).catch(() => {});
    }
    set({ sel: [], corr: [], mode: "select", shake: false, fruitOrder: genOrder(), attempts: 0, errorMessage: "", isSubmitting: false, isLogin: keepIsLogin ? get().isLogin : false }); 
  }
}));
