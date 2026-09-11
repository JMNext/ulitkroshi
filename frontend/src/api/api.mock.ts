import { AuthResponse, UserProfile } from "./types";

let mockCoinsMemory = 5000;
let mockUnlockedPetsMemory: number[] = [];
let mockPhoneMemory = "";

const createMockUser = (name = "Player001", phone = ""): UserProfile => ({
  id: 12345,
  name,
  email: "test@example.com",
  phone: phone || mockPhoneMemory || "+79991112233",
  roles: ["user"],
  coins: mockCoinsMemory,
  unlockedPets: mockUnlockedPetsMemory,
  petName: name,
  petStatus: "alive",
  petSatiety: 85,
  petHappiness: 90
});

const generateMockAuth = (prefix: string, name?: string, phone?: string): AuthResponse => ({
  accessToken: `${prefix}_acc_${Date.now()}`,
  refreshToken: `${prefix}_ref_${Date.now()}`,
  user: createMockUser(name, phone)
});

export const mockApi = {
  resetMockMemory() {
    mockCoinsMemory = 5000;
    mockUnlockedPetsMemory = [];
    mockPhoneMemory = "";
  },

  async checkLoginPhone(phone: string): Promise<{ success: boolean; isLogin: boolean }> {
    mockPhoneMemory = phone;
    return { success: true, isLogin: true };
  },

  async login(): Promise<AuthResponse> {
    return generateMockAuth("mock");
  },

  async restore(): Promise<UserProfile> {
    return createMockUser();
  },

  async refresh(): Promise<AuthResponse> {
    return generateMockAuth("mock");
  },

  async register(data: { name: string; phone: string }): Promise<AuthResponse> {
    return generateMockAuth("mock_reg", data.name, data.phone);
  },

  async loginPhone(phone: string): Promise<{ success: boolean; sessionId: string; isLogin: boolean }> {
    mockPhoneMemory = phone;
    return { success: true, sessionId: "mock_sess_" + Date.now(), isLogin: true };
  },

  async verifySms(phone: string, code: string): Promise<{ sessionId: string }> {
    return { sessionId: "mock_sess_verified_" + Date.now() };
  },

  async verifyFruit(): Promise<AuthResponse> {
    return generateMockAuth("mock_fruit");
  },

  async loginQr(): Promise<AuthResponse> {
    return generateMockAuth("mock_qr");
  },

  async checkName(name: string): Promise<{ available: boolean; suggestions?: string[] }> {
    const isTaken = name.toLowerCase() === "admin";
    return { available: !isTaken, suggestions: isTaken ? [name + "777"] : [] };
  },

  async getCoins(): Promise<{ coins: number }> {
    return { coins: mockCoinsMemory };
  },

  async updateCoins(actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items", total?: number): Promise<{ coins: number }> {
    if (actionType === "buy_medicine") mockCoinsMemory -= 30;
    if (actionType === "mini_game_reward") mockCoinsMemory += 15;
    if (actionType === "buy_shop_items" && total) mockCoinsMemory -= total;
    return { coins: Math.max(0, mockCoinsMemory) };
  },

  async updateUnlockedPets(petIndexes: number[]): Promise<{ unlockedPets: number[] }> {
    mockUnlockedPetsMemory = petIndexes;
    return { unlockedPets: mockUnlockedPetsMemory };
  }
};
