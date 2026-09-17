import axios from "axios";
import { mockApi } from "./api.mock";
import { AuthResponse, UserProfile } from "@/api/types/types";

export const isMock = false;

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

export const api = {
  resetMockMemory(): void {
    if (isMock) mockApi.resetMockMemory();
  },

  async checkLoginPhone(phone: string): Promise<{ success: boolean; isLogin: boolean }> {
    if (isMock) return mockApi.checkLoginPhone(phone);
    return (await gatewayApi.post<{ success: boolean; isLogin: boolean }>("/auth/login/phone-check", { phone })).data;
  },

  async login(phone: string, password: string): Promise<AuthResponse> {
    if (isMock) return mockApi.login(phone, password);
    const data = (await gatewayApi.post<AuthResponse>("/auth/login", { phone, password })).data;
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  },

  async logout(): Promise<void> {
    if (isMock) return mockApi.logout();
    await gatewayApi.post("/auth/logout").catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  async restore(): Promise<UserProfile> {
    if (isMock) return mockApi.restore();
    return (await gatewayApi.get<UserProfile>("/auth/me")).data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    if (isMock) return mockApi.refresh(refreshToken);
    return (await gatewayApi.post<AuthResponse>("/auth/refresh", { refreshToken })).data;
  },

  async register(data: { name: string; phone: string }): Promise<AuthResponse> {
    if (isMock) return mockApi.register(data);
    return (await gatewayApi.post<AuthResponse>("/auth/register", data)).data;
  },

  async loginPhone(phone: string, chosenPetName?: string): Promise<{ success: boolean; sessionId: string; isLogin: boolean }> {
    if (isMock) return mockApi.loginPhone(phone, chosenPetName);
    return (await gatewayApi.post<{ success: boolean; sessionId: string; isLogin: boolean }>("/auth/login/phone", { phone, chosenPetName }))
      .data;
  },

  async verifySms(phone: string, code: string): Promise<{ sessionId: string }> {
    if (isMock) return mockApi.verifySms(phone, code);
    return (await gatewayApi.post<{ sessionId: string }>("/auth/login/verify-sms", { phone, code })).data;
  },

  async verifyFruit(sessionId: string, fruits: string, phone?: string): Promise<AuthResponse> {
    if (isMock) return mockApi.verifyFruit(sessionId, fruits, phone);
    const data = (await gatewayApi.post<AuthResponse>("/auth/login/fruit", { sessionId, fruitCode: fruits, phone })).data;
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  },

  async getCoins(): Promise<{ coins: number }> {
    if (isMock) return mockApi.getCoins();
    return (await gatewayApi.get<{ coins: number }>("/game/pharmacy/coins")).data;
  },

  async updateCoins(
    actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items",
    total?: number
  ): Promise<{ coins: number }> {
    if (isMock) return mockApi.updateCoins(actionType, total);
    return (await gatewayApi.post<{ coins: number }>("/game/pharmacy/action", { actionType, total })).data;
  },

  async feedPet(): Promise<UserProfile> {
    if (isMock) return mockApi.feedPet();
    return (await gatewayApi.post<UserProfile>("/game/pharmacy/feed")).data;
  },

  async getPetStatus(): Promise<UserProfile> {
    if (isMock) return mockApi.getPetStatus();
    return (await gatewayApi.get<UserProfile>("/game/pharmacy/status")).data;
  }
};
