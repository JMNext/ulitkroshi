import { gameApiInstance, isMock } from "./client";
import { mockApi } from "./api.mock";
import { UserProfile } from "./types/types";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

export const gameApi = {
  async getCoins(): Promise<{ coins: number }> {
    if (isMock) return mockApi.getCoins();
    return (await gameApiInstance.get<{ coins: number }>("/game/pharmacy/coins")).data;
  },

  async updateCoins(actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items", total?: number): Promise<{ coins: number }> {
    if (isMock) return mockApi.updateCoins(actionType, total);
    const safeTotal = total !== undefined ? Number(total) : 0;
    return (await gameApiInstance.post<{ coins: number }>("/game/pharmacy/action", { actionType, total: safeTotal })).data;
  },

  async damagePet(): Promise<{ coins: number; petHealth: number }> {
    if (isMock) {
      const res = await mockApi.updateCoins("buy_medicine");
      return { coins: res.coins, petHealth: Math.max(1, usePetStore.getState().hp - 25) };
    }
    return (await gameApiInstance.post<{ coins: number; petHealth: number }>("/game/pharmacy/action", { actionType: "buy_medicine" })).data;
  },

  async feedPet(): Promise<UserProfile> {
    if (isMock) return mockApi.feedPet();
    return (await gameApiInstance.post<UserProfile>("/game/pharmacy/feed")).data;
  },

  async getPetStatus(): Promise<UserProfile> {
    if (isMock) return mockApi.getPetStatus();
    return (await gameApiInstance.post<UserProfile>("/game/pharmacy/status")).data;
  }
};
