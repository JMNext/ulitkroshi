import { UserProfile, AuthResponse } from "@/api/types/types";

let mockCoinsMemory = 5000;
let mockUnlockedPetsMemory: number[] = [];
let mockPhoneMemory = "";
let mockPetNameMemory = "";
let mockUserNameMemory = "";
let mockPetHealthMemory = 100;

const createMockUser = (name = "", phone = ""): UserProfile => {
  const finalUserName = name || mockUserNameMemory || "Игрок";
  const finalPetName = mockPetNameMemory || "Булька";

  return {
    id: 12345,
    name: finalUserName,
    phone: phone || mockPhoneMemory || "79991112233",
    roles: ["user"],
    coins: mockCoinsMemory,
    unlockedPets: mockUnlockedPetsMemory,
    petName: finalPetName,
    petHealth: mockPetHealthMemory
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
    mockPetHealthMemory = 100;

    if (typeof window !== "undefined") {
      localStorage.removeItem("saved_user_phone");
      localStorage.removeItem("login_phone_buffer");
      localStorage.removeItem("active_reg_session_id");
      localStorage.removeItem("is_login_flow");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("local_user_coins");
    }
  },

  async checkLoginPhone(phone: string): Promise<{ success: boolean; isLogin: boolean }> {
    mockPhoneMemory = phone;
    const isRegistered = typeof window !== "undefined" && localStorage.getItem("saved_user_phone") === phone;
    return { success: true, isLogin: isRegistered };
  },

  async login(phone: string, password: string): Promise<AuthResponse> {
    mockPhoneMemory = phone;
    return generateMockAuth("mock");
  },

  async logout(): Promise<void> {
    this.resetMockMemory();
    return Promise.resolve();
  },

  async restore(): Promise<UserProfile> {
    return createMockUser();
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
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
    const isRegistered = typeof window !== "undefined" && localStorage.getItem("saved_user_phone") === phone;
    return { success: true, sessionId: "mock_sess_" + Date.now(), isLogin: isRegistered };
  },

  async verifySms(phone: string, code: string): Promise<{ sessionId: string }> {
    return { sessionId: "mock_sess_verified_" + Date.now() };
  },

  async verifyFruit(sessionId: string, fruits: string, phone?: string): Promise<AuthResponse> {
    if (phone) mockPhoneMemory = phone;
    mockCoinsMemory = 5000;

    const isLoginFlow = typeof window !== "undefined" && localStorage.getItem("is_login_flow") === "true";

    if (!isLoginFlow) {
      return {
        accessToken: "",
        refreshToken: "",
        user: createMockUser("", phone)
      };
    }

    return generateMockAuth("mock_fruit");
  },

  async getCoins(): Promise<{ coins: number }> {
    return { coins: mockCoinsMemory };
  },

  async updateCoins(
    actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items",
    total?: number
  ): Promise<{ coins: number }> {
    if (actionType === "buy_medicine") mockCoinsMemory = Math.max(0, mockCoinsMemory - 30);
    if (actionType === "mini_game_reward") mockCoinsMemory += Number(total || 0);
    if (actionType === "buy_shop_items" && total) mockCoinsMemory = Math.max(0, mockCoinsMemory - total);
    return { coins: mockCoinsMemory };
  },

  async feedPet(): Promise<UserProfile> {
    mockPetHealthMemory = Math.min(100, mockPetHealthMemory + 20);
    return createMockUser();
  },

  async getPetStatus(): Promise<UserProfile> {
    return createMockUser();
  }
};
