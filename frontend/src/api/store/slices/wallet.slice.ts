import { StateCreator } from "zustand";
import { gameApi } from "../../services/game.api";
import { ApiStateCombined, WalletSliceState } from "../useApiStore";

const getLocal = (): number => {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem("local_user_coins") || "0");
};

const saveLocal = (amt: number): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("local_user_coins", String(amt));
  }
};

let lastTime = 0;

export const createWalletSlice: StateCreator<ApiStateCombined, [], [], WalletSliceState> = (set, get) => ({
  coins: getLocal(),

  fetchCoins: async () => {
    try {
      const res = await gameApi.getCoins();
      const cc = res?.coins ?? getLocal();
      saveLocal(cc);

      const currentUser = get().user;
      if (currentUser) {
        set({ coins: cc, user: { ...currentUser, coins: cc } });
      } else {
        set({ coins: cc });
      }
    } catch {
      set({ coins: getLocal() });
    }
  },

  executeAction: async (type, total, diff) => {
    const now = Date.now();
    if (type === "mini_game_reward" && now - lastTime < 1500) return true;
    if (type === "mini_game_reward") lastTime = now;

    let next = get().coins;
    let amt = total;

    if (type === "mini_game_reward") {
      let earned = total;
      if (earned === 0 || earned === undefined) {
        if (typeof diff === "string") {
          earned = diff === "memory" ? total : total === 999 || total >= 20 ? (diff === "hard" ? 2 : 1) : 2;
        } else {
          earned = typeof diff === "boolean" ? (diff ? 1 : 2) : total === 999 ? 1 : total >= 20 ? 10 : 3;
        }
      }
      next += earned;
      amt = earned;
    } else if (type === "buy_medicine") {
      next = Math.max(0, next - 30);
      amt = 30;
    } else if (type === "buy_shop_items" && total) {
      next = Math.max(0, next - total);
      amt = total;
    }

    saveLocal(next);

    const currentUserBefore = get().user;
    if (currentUserBefore) {
      set({ coins: next, user: { ...currentUserBefore, coins: next } });
    } else {
      set({ coins: next });
    }

    console.log(`[КОШЕЛЕК] Сетевой запрос к gameApi.updateCoins. Тип: ${type}, Количество: ${amt}`);

    try {
      const res = await gameApi.updateCoins(type, Number(amt || 0));
      console.log("[КОШЕЛЕК] Сырой ответ от бэкенда:", res);

      const server = res && typeof res.coins === "number" ? res.coins : next;
      saveLocal(server);

      const currentUserAfter = get().user;
      if (currentUserAfter) {
        set({ coins: server, user: { ...currentUserAfter, coins: server } });
      } else {
        set({ coins: server });
      }
      return true;
    } catch (err: any) {
      console.error("[КОШЕЛЕК] Ошибка в executeAction catch:", err?.message || err);
      return true;
    }
  }
});
