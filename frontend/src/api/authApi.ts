import axios from "axios";
import { UserProfile, AuthResponse } from "./types";

export const isMock = true; 

let mockCoinsMemory = 5000; 
let mockUnlockedPetsMemory: number[] = [];
let mockPhoneMemory = "";

export const gatewayApi = axios.create({
  baseURL: "http://localhost:3001",
  headers: { "Content-Type": "application/json" }
});

gatewayApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || "Произошла сетевая ошибка";
    return Promise.reject(new Error(message));
  }
);

gatewayApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    if (isMock) return { accessToken: "mock_acc_" + Date.now(), refreshToken: "mock_ref_" + Date.now(), user: createMockUser() };
    return (await gatewayApi.post<AuthResponse>("/auth/login", { emailOrPhone: email, password })).data;
  },

  async logout(): Promise<void> {
    if (isMock) return;
    await gatewayApi.post("/auth/logout");
  },

  async restore(): Promise<UserProfile> {
    if (isMock) return createMockUser();
    return (await gatewayApi.get<UserProfile>('/auth/me')).data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    if (isMock) return { accessToken: "mock_acc_" + Date.now(), refreshToken: "mock_ref_" + Date.now(), user: createMockUser() };
    return (await gatewayApi.post<AuthResponse>("/auth/refresh", { refreshToken })).data;
  },

  async register(data: { name: string; phone: string }): Promise<AuthResponse> {
    if (isMock) return { accessToken: "mock_reg_" + Date.now(), refreshToken: "mock_reg_rf_" + Date.now(), user: createMockUser(data.name, data.phone) };
    return (await gatewayApi.post<AuthResponse>("/auth/register", data)).data;
  },

  async loginPhone(phone: string, chosenPetName?: string): Promise<{ success: boolean; sessionId: string }> {
    if (isMock) {
      mockPhoneMemory = phone;
      return { success: true, sessionId: "mock_sess_" + Date.now() };
    }
    return (await gatewayApi.post<{ success: boolean; sessionId: string }>("/auth/login/phone", { phone, chosenPetName })).data;
  },

  async verifySms(phone: string, code: string): Promise<{ sessionId: string }> {
    if (isMock) return { sessionId: "mock_sess_verified" };
    return (await gatewayApi.post<{ sessionId: string }>("/auth/login/verify-sms", { phone, code })).data;
  },

  async verifyFruit(sessionId: string, fruits: string[]): Promise<AuthResponse> {
    if (isMock) {
      localStorage.setItem("mock_accessToken", "true");
      return { accessToken: "mock_fr_" + Date.now(), refreshToken: "mock_fr_rf_" + Date.now(), user: createMockUser() };
    }
    return (await gatewayApi.post<AuthResponse>("/auth/login/fruit", { sessionId, fruitCode: fruits })).data;
  },

  async loginQr(qrData: string): Promise<AuthResponse> {
    if (isMock) return { accessToken: "mock_qr_" + Date.now(), refreshToken: "mock_qr_rf_" + Date.now(), user: createMockUser() };
    return (await gatewayApi.post<AuthResponse>("/auth/login/qr", { qrData })).data;
  },

  async checkName(name: string): Promise<{ available: boolean; suggestions?: string[] }> {
    if (isMock) {
      const isTaken = name.toLowerCase() === "admin";
      return { available: !isTaken, suggestions: isTaken ? [name + "777"] : [] };
    }
    return (await gatewayApi.get<{ available: boolean; suggestions?: string[] }>("/auth/check-name", { params: { name } })).data;
  },

  async getCoins(userId: number): Promise<{ coins: number }> {
    if (isMock) return { coins: mockCoinsMemory };
    return (await gatewayApi.get<{ coins: number }>(`/game/pharmacy/coins/${userId}`)).data;
  },

  async updateCoins(amount: number): Promise<{ coins: number }> {
    if (isMock) { 
      mockCoinsMemory += amount; 
      return { coins: mockCoinsMemory }; 
    }
    return (await gatewayApi.post<{ coins: number }>("/game/pharmacy/coins/update", { amount })).data;
  },

  async updateUnlockedPets(petIndexes: number[]): Promise<{ unlockedPets: number[] }> {
    if (isMock) {
      mockUnlockedPetsMemory = petIndexes;
      return { unlockedPets: mockUnlockedPetsMemory };
    }
    return (await gatewayApi.post<{ unlockedPets: number[] }>("/user/pets/update", { petIndexes })).data;
  }
};
