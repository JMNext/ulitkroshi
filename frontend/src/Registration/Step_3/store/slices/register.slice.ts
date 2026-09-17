import { StateCreator } from "zustand";
import { useApiStore } from "@/api/store/useApiStore";
import { Step3CombinedState, RegisterState, clearTimers, setShakeTimeoutId, setClearFruitsTimeoutId } from "../useRegistrationStep3Store";

const LETTERS_LOOKUP = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p"] as const;

export const createRegisterSlice: StateCreator<Step3CombinedState, [], [], RegisterState> = (set, get) => ({
  registerSel: [],
  registerCorr: [],
  registerMode: "select",
  registerShake: false,
  registerAttempts: 0,
  registerError: "",
  isRegisterSubmitting: false,

  saveFirstStep: () => {
    // Просто переключаем режим, ничего на сервер не шлем
    set({ registerSel: [], registerMode: "verify", registerError: "", isRegisterSubmitting: false });
  },

  toggleRegisterSelect: async (id, sessionId, onComplete) => {
    const { registerMode, registerSel, registerCorr, isRegisterSubmitting, registerAttempts } = get();

    if (registerMode === "error" || isRegisterSubmitting || registerAttempts >= 3) return;

    const next = registerSel.includes(id) ? registerSel.filter((v) => v !== id) : [...registerSel, id];
    if (next.length > 4) return;
    set({ registerSel: next, registerError: "" });

    if (next.length === 4) {
      set({ isRegisterSubmitting: true });

      const handleFailure = () => {
        const nextAttempts = registerAttempts + 1;
        clearTimers();

        if (nextAttempts >= 3) {
          set({ isRegisterSubmitting: false, registerMode: "error", registerShake: true, registerAttempts: nextAttempts, registerError: "wrong_fruit" });
        } else {
          set({ isRegisterSubmitting: false, registerShake: true, registerAttempts: nextAttempts, registerError: "wrong_fruit" });
          setShakeTimeoutId(setTimeout(() => set({ registerShake: false }), 500));
          setClearFruitsTimeoutId(setTimeout(() => {
            const nextMode = registerCorr.length > 0 ? "verify" : "select";
            set({ registerSel: [], registerMode: nextMode });
          }, 1200));
        }
      };

      const verifyServerFruit = async (finalSelection: number[]) => {
        try {
          const savedPhone = localStorage.getItem("login_phone_buffer") || "";
          const realSessionId = localStorage.getItem("active_reg_session_id") || sessionId;
          const stringLetterCode = finalSelection.map((fruitId) => LETTERS_LOOKUP[fruitId] || "a").join("");

          await useApiStore.getState().verifyFruit(realSessionId, stringLetterCode, savedPhone);

          set({ isRegisterSubmitting: false, registerSel: [], registerCorr: [] });
          onComplete();
        } catch (err: any) {
          handleFailure();
        }
      };

      if (registerMode === "select") {
        // Первый шаг: сохраняем эталон у себя в памяти фронта и просим подтвердить
        set({ registerCorr: next, registerSel: [], isRegisterSubmitting: false, registerMode: "confirm" });
      }
      else if (registerMode === "verify") {
        // Второй шаг: проверяем, совпал ли ввод с первым шагом на фронте
        const isMatch = registerCorr.length === 4 && registerCorr.every((val, index) => val === next[index]);

        if (!isMatch) {
          // Если юзер ввел второй раз другие фрукты — сразу реджектим без мучений сервера
          handleFailure();
        } else {
          // Если всё совпало — шлем ОДИН ЕДИНСТВЕННЫЙ запрос на сервер для создания юзера
          await verifyServerFruit(next);
        }
      }
    }
  }
});
