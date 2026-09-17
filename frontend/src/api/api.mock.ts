import { AuthResponse, UserProfile } from "./types";

// 🌟 ИСПРАВЛЕНИЕ: Даем мокам стартовый баланс в 5000 монет по умолчанию,
// чтобы при вычитании стоимости яблока (40) в памяти оставалось 4960, а не 0.
let mockCoinsMemory = 5000;
let mockUnlockedPetsMemory: number[] = [];
let mockPhoneMemory = "";
let mockPetNameMemory = "";
let mockUserNameMemory = "";

const createMockUser = (name = "", phone = ""): UserProfile => {
  const finalUserName = name || mockUserNameMemory || "Игрок";
  const finalPetName = mockPetNameMemory || "Булька";

  return {
    id: 12345,
    name: finalUserName,
    phone: phone || mockPhoneMemory || "+79991112233",
    roles: ["user"],
    coins: mockCoinsMemory,
    unlockedPets: mockUnlockedPetsMemory,
    petName: finalPetName,
    petStatus: "alive",
    petSatiety: 85,
    petHappiness: 90
  };
};

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
    mockPetNameMemory = "";
    mockUserNameMemory = "";
  },

  async checkLoginPhone(phone: string): Promise<{ success: boolean; isLogin: boolean }> {
    mockPhoneMemory = phone;
    return { success: true, isLogin: true };
  },

  async login(): Promise<AuthResponse> {
    return generateMockAuth("mock");
  },

  async logout(): Promise<void> {
    return Promise.resolve();
  },

  async restore(): Promise<UserProfile> {
    return createMockUser();
  },

  async refresh(): Promise<AuthResponse> {
    return generateMockAuth("mock");
  },

  async register(data: { name: string; phone: string }): Promise<AuthResponse> {
    mockCoinsMemory = 5000;
    mockUserNameMemory = data.name;
    if (!mockPetNameMemory) mockPetNameMemory = data.name;
    return generateMockAuth("mock_reg", data.name, data.phone);
  },

  async loginPhone(phone: string, chosenPetName?: string): Promise<{ success: boolean; sessionId: string; isLogin: boolean }> {
    mockPhoneMemory = phone;
    if (chosenPetName) mockPetNameMemory = chosenPetName;
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

  async updateCoins(actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items", userId: number, total: number): Promise<{ coins: number }> {
    if (actionType === "buy_medicine") mockCoinsMemory = Math.max(0, mockCoinsMemory - 30);
    if (actionType === "mini_game_reward") mockCoinsMemory += 15;
    if (actionType === "buy_shop_items" && total) mockCoinsMemory = Math.max(0, mockCoinsMemory - total);
    return { coins: mockCoinsMemory };
  },

  async updateUnlockedPets(petIndexes: number[]): Promise<{ unlockedPets: number[] }> {
    mockUnlockedPetsMemory = petIndexes;
    return { unlockedPets: mockUnlockedPetsMemory };
  }
};
