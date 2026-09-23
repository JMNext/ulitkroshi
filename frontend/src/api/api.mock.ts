import { AuthResponse, UserProfile } from "@/api/types/types";

const initMem = () => ({ coins: 5000, pets: [] as number[], phone: "", petName: "", user: "", hp: 100, disc: "" });
let mem = initMem();

const getUser = (name = "", phone = ""): UserProfile => {
  if (!mem.disc) mem.disc = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return {
    id: 12345, name: name || mem.user || `Player_12345`, discriminator: mem.disc,
    phone: phone || mem.phone || "79991112233", roles: ["user"], coins: mem.coins,
    unlockedPets: mem.pets, petName: mem.petName || "Булька", petHealth: mem.hp
  } as any;
};

const genAuth = (prefix: string, name?: string, phone?: string): AuthResponse => ({
  accessToken: `${prefix}_acc_${Date.now()}`, refreshToken: `${prefix}_ref_${Date.now()}`, user: getUser(name, phone)
});

export const mockApi = {
  resetMockMemory() {
    mem = initMem();
    if (typeof window !== "undefined") ["saved_user_phone", "login_phone_buffer", "active_reg_session_id", "is_login_flow", "accessToken", "refreshToken", "local_user_coins"].forEach(k => localStorage.removeItem(k));
  },

  async checkLoginPhone(phone: string) { mem.phone = phone; return { success: true, isLogin: typeof window !== "undefined" && localStorage.getItem("saved_user_phone") === phone }; },
  async login(phone: string, password: string) { mem.phone = phone; return genAuth("mock"); },
  async logout() { this.resetMockMemory(); },
  async restore() { return getUser(); },
  async refresh(refreshToken: string) { return genAuth("mock"); },

  async register(data: { name: string; phone: string }) {
    mem.coins = 5000; mem.user = mem.phone = mem.petName = data.name;
    mem.disc = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    if (typeof window !== "undefined") localStorage.setItem("saved_user_phone", data.phone);
    return genAuth("mock_reg", data.name, data.phone);
  },

  async loginPhone(phone: string, chosenPetName?: string) {
    mem.phone = phone; if (chosenPetName) mem.petName = chosenPetName;
    return { success: true, sessionId: "mock_sess_" + Date.now(), isLogin: typeof window !== "undefined" && localStorage.getItem("saved_user_phone") === phone };
  },

  async verifySms(phone: string, code: string) { return { sessionId: "mock_sess_verified_" + Date.now() }; },

  async verifyFruit(sessionId: string, fruits: string, phone?: string) {
    if (phone) { mem.phone = phone; if (typeof window !== "undefined") localStorage.setItem("saved_user_phone", phone); }
    mem.coins = 5000; return genAuth("mock_fruit", mem.user, phone);
  },

  async getCoins() { return { coins: mem.coins }; },

  async updateCoins(action: "buy_medicine" | "mini_game_reward" | "buy_shop_items", total?: number) {
    if (action === "buy_medicine") mem.coins = Math.max(0, mem.coins - 30);
    else if (action === "mini_game_reward") mem.coins += Number(total || 0);
    else if (action === "buy_shop_items" && total) mem.coins = Math.max(0, mem.coins - total);
    return { coins: mem.coins };
  },

  async feedPet() { mem.hp = Math.min(100, mem.hp + 20); return getUser(); },
  async getPetStatus() { return getUser(); }
};
