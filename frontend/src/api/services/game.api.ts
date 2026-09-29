import { isMock, gameApiInstance } from "@/api/api";
import { UserProfile } from "@/api/types/types";
import { DEFAULT_USER_PROFILE, getMockCoins } from "./auth.api";

export const gameApi = {
  getCoins: async (): Promise<{ coins: number }> => {
    if (isMock) return { coins: getMockCoins() };
    return (await gameApiInstance.get<{ coins: number }>("/auth/pharmacy/coins")).data;
  },

  async updateCoins(actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items", total?: number): Promise<{ coins: number }> {
    if (isMock) {
      const localCoins = getMockCoins();
      let nextCoins = localCoins;
      if (actionType === "buy_medicine") nextCoins = Math.max(0, localCoins - 30);
      else if (actionType === "mini_game_reward") nextCoins = localCoins + Number(total || 0);
      else if (actionType === "buy_shop_items" && total) nextCoins = Math.max(0, localCoins - total);
      if (typeof window !== "undefined") localStorage.setItem("local_user_coins", String(nextCoins));
      return { coins: nextCoins };
    }
    return (await gameApiInstance.post<{ coins: number }>("/auth/pharmacy/action", { actionType, total: total !== undefined ? Number(total) : 0 })).data;
  },

  async damagePet(): Promise<{ coins: number; petHealth: number }> {
    if (isMock) {
      const localCoins = getMockCoins();
      const nextCoins = Math.max(0, localCoins - 30);
      if (typeof window !== "undefined") localStorage.setItem("local_user_coins", String(nextCoins));
      return { coins: nextCoins, petHealth: 75 };
    }
    return (await gameApiInstance.post<{ coins: number; petHealth: number }>("/auth/pharmacy/action", { actionType: "buy_medicine" })).data;
  },

  feedPet: async (): Promise<UserProfile> => {
    if (isMock) return { ...DEFAULT_USER_PROFILE, coins: getMockCoins(), petHealths: [] };
    return (await gameApiInstance.post<UserProfile>("/auth/pharmacy/feed")).data;
  },

  getPetStatus: async (): Promise<UserProfile> => {
    if (isMock) return { ...DEFAULT_USER_PROFILE, coins: getMockCoins() };
    return (await gameApiInstance.get<UserProfile>("/auth/pharmacy/status")).data;
  }
};
