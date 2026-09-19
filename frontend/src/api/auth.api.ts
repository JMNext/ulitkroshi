import { authApiInstance, isMock } from "./client";
import { mockApi } from "./api.mock";
import { AuthResponse, UserProfile } from "./types/types";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useApiStore } from "@/api/store/useApiStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";

export const syncUserStores = (user: UserProfile) => {
  if (!user) return;

  const petStore = usePetStore.getState() as any;
  if (petStore && petStore.updateField) {
    petStore.updateField("petName", user.petName);
    petStore.updateField("hp", Number(user.petHealth ?? 100));
  } else {
    usePetStore.setState({ petName: user.petName, hp: Number(user.petHealth ?? 100) });
  }

  useApiStore.setState({
    user: user,
    coins: user.coins,
    isAuthenticated: true
  });

  useMainGameStore.setState({
    username: user.name || `Player_${user.id}`,
    userId: Number(user.id),
    coins: user.coins
  });
};

export const authApi = {
  resetMockMemory(): void {
    if (isMock) mockApi.resetMockMemory();
  },

  async checkLoginPhone(phone: string): Promise<{ success: boolean; isLogin: boolean }> {
    if (isMock) {
      const mockRes = await mockApi.checkLoginPhone(phone);
      const currentStoreIsLogin = useRegistrationStep3Store.getState().isLogin;
      localStorage.setItem("is_login_flow", String(currentStoreIsLogin));
      return { ...mockRes, isLogin: currentStoreIsLogin };
    }

    const res = (await authApiInstance.post<{ success: boolean; isLogin: boolean }>("/auth/login/phone-check", { phone })).data;
    if (res) {
      localStorage.setItem("is_login_flow", String(res.isLogin));
    }
    return res;
  },

  async logout(): Promise<void> {
    if (isMock) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("is_login_flow");
        localStorage.removeItem("local_user_coins");
        localStorage.removeItem("saved_user_phone");
        localStorage.removeItem("login_phone_buffer");
        localStorage.removeItem("guide_viewed");
      }
      return mockApi.logout();
    }
    await authApiInstance.post("/auth/logout").catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("is_login_flow");
    localStorage.removeItem("local_user_coins");
    localStorage.removeItem("guide_viewed");
  },

  async restore(): Promise<UserProfile> {
    if (isMock) {
      const user = await mockApi.restore();
      if (user) syncUserStores(user);
      return user;
    }
    const user = (await authApiInstance.get<UserProfile>("/auth/me")).data;
    if (user) syncUserStores(user);
    return user;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    if (isMock) return mockApi.refresh(refreshToken);
    const data = (await authApiInstance.post<AuthResponse>("/auth/refresh", { refreshToken })).data;
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  },

  async loginPhone(phone: string, chosenPetName?: string): Promise<{ success: boolean; sessionId: string; isLogin: boolean }> {
    if (isMock) {
      const mockRes = await mockApi.loginPhone(phone, chosenPetName);
      const currentStoreIsLogin = useRegistrationStep3Store.getState().isLogin;
      localStorage.setItem("is_login_flow", String(currentStoreIsLogin));
      return { ...mockRes, isLogin: currentStoreIsLogin };
    }
    const res = (await authApiInstance.post<{ success: boolean; sessionId: string; isLogin: boolean }>("/auth/login/phone", { phone, chosenPetName })).data;
    if (res) {
      localStorage.setItem("is_login_flow", String(res.isLogin));
    }
    return res;
  },

  async verifySms(phone: string, code: string): Promise<{ sessionId: string }> {
    if (isMock) return mockApi.verifySms(phone, code);
    return (await authApiInstance.post<{ sessionId: string }>("/auth/login/verify-sms", { phone, code })).data;
  },

  async verifyFruit(sessionId: string, fruits: string, phone?: string): Promise<AuthResponse> {
    if (isMock) {
      const data = await mockApi.verifyFruit(sessionId, fruits, phone);
      if (data?.user) syncUserStores(data.user);
      return data;
    }

    let isLoginFlow = localStorage.getItem("is_login_flow") === "true";
    const activeScenes = (window as any).phaserGame?.scene?.getScenes(true);
    const firstScene = activeScenes && activeScenes.length > 0 ? (activeScenes as any) : null;
    const currentPhaserSceneKey = firstScene?.sys?.settings?.key;

    if (currentPhaserSceneKey === "Step3Scene" && !phone) {
      isLoginFlow = false;
      localStorage.setItem("is_login_flow", "false");
    }

    const endpointUrl = isLoginFlow ? "/auth/login/fruit" : "/auth/register/fruit";
    const petStoreState = usePetStore.getState() as any;
    const chosenPetName = petStoreState?.petName || petStoreState?.name || "Улитка";

    const data = (await authApiInstance.post<AuthResponse>(endpointUrl, {
      sessionId,
      fruitCode: fruits,
      phone,
      petName: chosenPetName
    })).data;

    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      if (data.user) syncUserStores(data.user);
    }
    return data;
  },

  async createRegistrationCleanupTask(phone: string): Promise<void> {
    if (isMock) return;
    navigator.sendBeacon("http://localhost:3001/auth/login/cleanup-registration", JSON.stringify({ phone }));
  }
};
