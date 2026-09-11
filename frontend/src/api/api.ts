import axios from "axios";
import { mockApi } from "./api.mock";
import { AuthResponse, UserProfile } from "./types";

// ТВОЙ ПЕРЕКЛЮЧАТЕЛЬ: true — моки для заказчика, false — реальный сервер
export const isMock = true;

export const gatewayApi = axios.create({
  baseURL: "http://localhost:3001",
  headers: { "Content-Type": "application/json" }
});

// Интерцептор ответов, адаптированный под билд с моками
gatewayApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если включены моки, гасим сетевые ошибки localhost, чтобы билд не падал
    if (isMock) {
      console.warn("Сетевой запрос проигнорирован (включен режим моков):", error.message);
      return Promise.resolve({ data: {} } as any);
    }
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
  async checkLoginPhone(phone: string): Promise<{ success: boolean; isLogin: boolean }> {
    if (isMock) return mockApi.checkLoginPhone(phone);
    return (await gatewayApi.post<{ success: boolean; isLogin: boolean }>("/auth/login/phone-check", { phone })).data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    if (isMock) {
      const data = await mockApi.login();
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      return data;
    }
    const data = (await gatewayApi.post<AuthResponse>("/auth/login", { emailOrPhone: email, password })).data;
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  },

  async logout(): Promise<void> {
    if (!isMock) {
      await gatewayApi.post("/auth/logout");
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  async restore(): Promise<UserProfile> {
    if (isMock) return mockApi.restore();
    return (await gatewayApi.get<UserProfile>("/auth/me")).data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    if (isMock) return mockApi.refresh();
    return (await gatewayApi.post<AuthResponse>("/auth/refresh", { refreshToken })).data;
  },

  async register(data: { name: string; phone: string }): Promise<AuthResponse> {
    if (isMock) {
      const res = await mockApi.register(data);
      if (res?.accessToken) {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
      }
      return res;
    }
    return (await gatewayApi.post<AuthResponse>("/auth/register", data)).data;
  },

  async loginPhone(phone: string, chosenPetName?: string): Promise<{ success: boolean; sessionId: string; isLogin: boolean }> {
    if (isMock) return mockApi.loginPhone(phone);
    return (await gatewayApi.post<{ success: boolean; sessionId: string; isLogin: boolean }>("/auth/login/phone", { phone, chosenPetName }))
      .data;
  },

  async verifySms(phone: string, code: string): Promise<{ sessionId: string }> {
    if (isMock) return mockApi.verifySms(phone, code);
    return (await gatewayApi.post<{ sessionId: string }>("/auth/login/verify-sms", { phone, code })).data;
  },

  async verifyFruit(sessionId: string, fruits: string, phone?: string, isLoginFlow?: boolean): Promise<AuthResponse> {
    if (isMock) {
      const data = await mockApi.verifyFruit();
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      return data;
    }
    const data = (await gatewayApi.post<AuthResponse>("/auth/login/fruit", { sessionId, fruitCode: fruits, phone, isLoginFlow })).data;
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  },

  async loginQr(qrData: string): Promise<AuthResponse> {
    if (isMock) {
      const data = await mockApi.loginQr();
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      return data;
    }
    return (await gatewayApi.post<AuthResponse>("/auth/login/qr", { qrData })).data;
  },

  async checkName(name: string): Promise<{ available: boolean; suggestions?: string[] }> {
    if (isMock) return mockApi.checkName(name);
    return (await gatewayApi.get<{ available: boolean; suggestions?: string[] }>("/auth/check-name", { params: { name } })).data;
  },

  async getCoins(userId: number): Promise<{ coins: number }> {
    if (isMock) return mockApi.getCoins();
    return (await gatewayApi.get<{ coins: number }>(`/game/pharmacy/coins/${userId}`)).data;
  },

  async updateCoins(
    actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items",
    userId: number,
    total?: number
  ): Promise<{ coins: number }> {
    if (isMock) return mockApi.updateCoins(actionType, total);
    return (await gatewayApi.post<{ coins: number }>("/game/pharmacy/action", { actionType, userId, total })).data;
  },

  async updateUnlockedPets(petIndexes: number[]): Promise<{ unlockedPets: number[] }> {
    if (isMock) return mockApi.updateUnlockedPets(petIndexes);
    return (await gatewayApi.post<{ unlockedPets: number[] }>("/user/pets/update", { petIndexes })).data;
  }
};
