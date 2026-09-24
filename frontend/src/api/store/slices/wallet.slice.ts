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
      set({ coins: cc });
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
      if (earned === 0) {
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
    }

    saveLocal(next);
    set({ coins: next });

    try {
      const res = await gameApi.updateCoins(type, amt);
      const server = res && typeof res.coins === "number" ? res.coins : next;
      saveLocal(server);
      set({ coins: server });
      return true;
    } catch {
      return true;
    }
  }
});
