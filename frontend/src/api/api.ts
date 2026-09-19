import axios from "axios";
import { mockApi } from "./api.mock";
import { AuthResponse, UserProfile } from "@/api/types/types";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

export const isMock = true;

export const gatewayApi = axios.create({
  baseURL: "http://localhost:3001",
  headers: { "Content-Type": "application/json" }
});

gatewayApi.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

gatewayApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newestToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

      if (newestToken) {
        originalRequest.headers.Authorization = `Bearer ${newestToken}`;
        return gatewayApi(originalRequest);
      }
    }

    console.error(`🚨 [AXIOS RESPONSE ERROR] URL: ${error.config?.url} | Error:`, error.response?.data || error.message);
    const message = error.response?.data?.error || "Произошла сетевая ошибка";
    return Promise.reject(new Error(message));
  }
);

export const api = {
  resetMockMemory(): void {
    if (isMock) mockApi.resetMockMemory();
  },

  async checkLoginPhone(phone: string): Promise<{ success: boolean; isLogin: boolean }> {
    if (isMock) {
      const mockRes = await mockApi.checkLoginPhone(phone);
      localStorage.setItem("is_login_flow", String(mockRes.isLogin));
      return mockRes;
    }

    const res = (await gatewayApi.post<{ success: boolean; isLogin: boolean }>("/auth/login/phone-check", { phone })).data;
    if (res) {
      localStorage.setItem("is_login_flow", String(res.isLogin));
    }
    return res;
  },

  async logout(): Promise<void> {
    if (isMock) return mockApi.logout();
    await gatewayApi.post("/auth/logout").catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("is_login_flow");
    localStorage.removeItem("local_user_coins");
  },

  async restore(): Promise<UserProfile> {
    if (isMock) return mockApi.restore();
    return (await gatewayApi.get<UserProfile>("/auth/me")).data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    if (isMock) return mockApi.refresh(refreshToken);
    const data = (await gatewayApi.post<AuthResponse>("/auth/refresh", { refreshToken })).data;
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  },

  async loginPhone(phone: string, chosenPetName?: string): Promise<{ success: boolean; sessionId: string; isLogin: boolean }> {
    if (isMock) {
      const mockRes = await mockApi.loginPhone(phone, chosenPetName);
      localStorage.setItem("is_login_flow", String(mockRes.isLogin));
      return mockRes;
    }
    const res = (await gatewayApi.post<{ success: boolean; sessionId: string; isLogin: boolean }>("/auth/login/phone", { phone, chosenPetName })).data;
    if (res) {
      localStorage.setItem("is_login_flow", String(res.isLogin));
    }
    return res;
  },

  async verifySms(phone: string, code: string): Promise<{ sessionId: string }> {
    if (isMock) return mockApi.verifySms(phone, code);
    return (await gatewayApi.post<{ sessionId: string }>("/auth/login/verify-sms", { phone, code })).data;
  },

  async verifyFruit(sessionId: string, fruits: string, phone?: string): Promise<AuthResponse> {
    if (isMock) {
      const data = await mockApi.verifyFruit(sessionId, fruits, phone);
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        if (phone) {
          localStorage.setItem("saved_user_phone", phone);
        }
      }
      return data;
    }

    let isLoginFlow = localStorage.getItem("is_login_flow") === "true";

    const currentPhaserSceneKey = (window as any).phaserGame?.scene?.getScenes(true)?.[0]?.sys?.settings?.key;
    if (currentPhaserSceneKey === "Step3Scene" && !phone) {
      isLoginFlow = false;
      localStorage.setItem("is_login_flow", "false");
    }

    const endpointUrl = isLoginFlow ? "/auth/login/fruit" : "/auth/register/fruit";

    const petStoreState = usePetStore.getState() as any;
    const chosenPetName = petStoreState?.petName || petStoreState?.name || "Булька";

    const data = (await gatewayApi.post<AuthResponse>(endpointUrl, {
      sessionId,
      fruitCode: fruits,
      phone,
      petName: chosenPetName
    })).data;

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

  async updateCoins(actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items", total?: number): Promise<{ coins: number }> {
    if (isMock) return mockApi.updateCoins(actionType, total);
    const safeTotal = total !== undefined ? Number(total) : 0;
    return (await gatewayApi.post<{ coins: number }>("/game/pharmacy/action", { actionType, total: safeTotal })).data;
  },

  async feedPet(): Promise<UserProfile> {
    if (isMock) return mockApi.feedPet();
    return (await gatewayApi.post<UserProfile>("/game/pharmacy/feed")).data;
  },

  async createRegistrationCleanupTask(phone: string): Promise<void> {
    if (isMock) return;
    navigator.sendBeacon("http://localhost:3001/auth/login/cleanup-registration", JSON.stringify({ phone }));
  },

  async getPetStatus(): Promise<UserProfile> {
    if (isMock) return mockApi.getPetStatus();
    return (await gatewayApi.post<UserProfile>("/game/pharmacy/status")).data;
  }
};
