import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { mockApi } from "./api.mock";
import { gameApiInstance, isMock } from "./client";
import { UserProfile } from "./types/types";

export const gameApi = {
  getCoins: async () => isMock ? mockApi.getCoins() : (await gameApiInstance.get<{ coins: number }>("/game/pharmacy/coins")).data,

  async updateCoins(actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items", total?: number) {
    if (isMock) return mockApi.updateCoins(actionType, total);
    return (await gameApiInstance.post<{ coins: number }>("/game/pharmacy/action", { actionType, total: total !== undefined ? Number(total) : 0 })).data;
  },

  async damagePet() {
    if (isMock) return { coins: (await mockApi.updateCoins("buy_medicine")).coins, petHealth: Math.max(1, usePetStore.getState().hp - 25) };
    return (await gameApiInstance.post<{ coins: number; petHealth: number }>("/game/pharmacy/action", { actionType: "buy_medicine" })).data;
  },

  feedPet: async () => isMock ? mockApi.feedPet() : (await gameApiInstance.post<UserProfile>("/game/pharmacy/feed")).data,
  getPetStatus: async () => isMock ? mockApi.getPetStatus() : (await gameApiInstance.post<UserProfile>("/game/pharmacy/status")).data
};
