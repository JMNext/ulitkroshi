import { StateCreator } from "zustand";
import { isMock } from "../../client";
import { gameApi } from "../../game.api";
import { ApiStateCombined, WalletSliceState } from "../useApiStore";

const getLocalCoins = (): number => (typeof window === "undefined" ? 0 : Number(localStorage.getItem("local_user_coins") || "0"));

const saveLocalCoins = (amount: number) => {
  if (typeof window !== "undefined") localStorage.setItem("local_user_coins", String(amount));
};

let lastActionTime = 0;

export const createWalletSlice: StateCreator<ApiStateCombined, [], [], WalletSliceState> = (set, get) => ({
  coins: getLocalCoins(),

  fetchCoins: async () => {
    try {
      const res = await gameApi.getCoins();
      const cc = res?.coins ?? getLocalCoins();
      saveLocalCoins(cc);
      set({ coins: cc });
    } catch {
      set({ coins: getLocalCoins() });
    }
  },

  executeAction: async (actionType, total, difficulty) => {
    const now = Date.now();
    if (actionType === "mini_game_reward" && now - lastActionTime < 1500) return true;
    if (actionType === "mini_game_reward") lastActionTime = now;

    let nextCoins = get().coins;
    let amountToSendToServer = total;

    if (actionType === "mini_game_reward") {
      if (!isMock && total >= 5000) {
        return true;
      }

      let earned = total;
      if (earned === 0) {
        if (typeof difficulty === "string")
          earned = difficulty === "memory" ? total : total === 999 || total >= 20 ? (difficulty === "hard" ? 2 : 1) : 2;
        else if (typeof difficulty === "boolean") earned = difficulty ? 1 : 2;
        else earned = total === 999 ? 1 : total >= 20 ? 10 : 3;
      }

      if (!isMock) {
        earned = total >= 5000 ? 0 : total;
      }

      nextCoins = nextCoins + earned;
      amountToSendToServer = earned;
    } else if (actionType === "buy_medicine") {
      nextCoins = Math.max(0, nextCoins - 30);
      amountToSendToServer = 30;
    } else if (actionType === "buy_shop_items" && total) {
      nextCoins = Math.max(0, nextCoins - total);
    }

    saveLocalCoins(nextCoins);
    set({ coins: nextCoins });

    if (!isMock && actionType === "mini_game_reward" && amountToSendToServer === 0) {
      return true;
    }

    try {
      const res = await gameApi.updateCoins(actionType, amountToSendToServer);
      const serverCoins = res && typeof res.coins === "number" ? res.coins : nextCoins;
      saveLocalCoins(serverCoins);
      set({ coins: serverCoins });
      return true;
    } catch (err) {
      console.error("🚨 [FRONTEND WALLET CATCH ERROR]:", err);
      return isMock;
    }
  }
});
