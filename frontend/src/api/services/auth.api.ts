import { isMock, authApiInstance } from "@/api/api";
import { UserProfile, AuthResponse } from "@/api/types/types";

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 12345,
  phone: "79991112233",
  player_name: "Player#1000",
  coins: 20000,
  unlockedPets: 1,
  petNames: ["Булька"],
  petHealths:[100],
  petExperiences:[0],
  petStars: [1]
};

export const getMockCoins = (): number => {
  if (isMock) return 20000;
  if (typeof window !== "undefined") {
    return Number(localStorage.getItem("local_user_coins") || "0");
  }
  return 0;
};

const genMockAuth = (userProfile: UserProfile): AuthResponse => ({
  accessToken: "mock_acc_" + Date.now(),
  refreshToken: "mock_ref_" + Date.now(),
  user: {
    ...userProfile,
    coins: 20000
  }
});

export const authApi = {
  async checkLoginPhone(phone: string): Promise<{ success: boolean; isLogin: boolean }> {
    if (isMock) {
      const isLoginFlowActive = localStorage.getItem("is_login_flow") === "true";
      return { success: true, isLogin: isLoginFlowActive };
    }
    const res = (await authApiInstance.post<{ success: boolean; isLogin: boolean }>("/auth/login/phone-check", { phone })).data;
    if (res) localStorage.setItem("is_login_flow", String(res.isLogin));
    return res;
  },

  async logout(): Promise<void> {
    const keys = ["accessToken", "refreshToken", "is_login_flow", "local_user_coins", "saved_user_phone", "active_reg_session_id", "guide_viewed"];
    keys.forEach((k) => { if (typeof window !== "undefined") localStorage.removeItem(k); });
    if (isMock) return;
    await authApiInstance.post("/auth/logout").catch(() => {});
  },

  async restore(): Promise<UserProfile | null> {
    if (isMock) {
      if (typeof window !== "undefined") localStorage.setItem("local_user_coins", "20000");
      return { ...DEFAULT_USER_PROFILE, coins: 20000 };
    }
    const res = (await authApiInstance.get<any>("/auth/me")).data;
    if (!res) return null;

    const u = res.user || res.data || res;

    let finalName = u.player_name || u.name || u.username || u.tgName || "Player";
    if (!finalName.includes("#")) {
      const disc = u.discriminator || u.tag || (u.id ? String(u.id).padStart(4, "0") : "1000");
      finalName = `${finalName}#${disc}`;
    }

    return {
      ...u,
      player_name: finalName
    };
  },

  async refresh(rt: string): Promise<AuthResponse> {
    if (isMock) return genMockAuth(DEFAULT_USER_PROFILE);
    const d = (await authApiInstance.post<AuthResponse>("/auth/refresh", { refreshToken: rt })).data;
    if (d?.accessToken) {
      localStorage.setItem("accessToken", d.accessToken);
      localStorage.setItem("refreshToken", d.refreshToken);
    }
    return d;
  },

  async loginPhone(phone: string, chosenPetName?: string): Promise<{ success: boolean; sessionId: string; isLogin: boolean }> {
    if (isMock) {
      const isLoginFlowActive = localStorage.getItem("is_login_flow") === "true";
      return { success: true, sessionId: "mock_sess_" + Date.now(), isLogin: isLoginFlowActive };
    }
    const res = (await authApiInstance.post<{ success: boolean; sessionId: string; isLogin: boolean }>("/auth/login/phone", { phone, chosenPetName })).data;
    if (res) localStorage.setItem("is_login_flow", String(res.isLogin));
    return res;
  },

  async verifySms(phone: string, code: string): Promise<{ sessionId: string }> {
    if (isMock) return { sessionId: "mock_verified_" + Date.now() };
    return (await authApiInstance.post<{ sessionId: string }>("/auth/login/verify-sms", { phone, code })).data;
  },

  async loginFruit(fruits: string, phone: string): Promise<AuthResponse> {
    if (isMock) {
      if (typeof window !== "undefined") localStorage.setItem("local_user_coins", "20000");
      return genMockAuth({ ...DEFAULT_USER_PROFILE, phone });
    }
    const cleanFruits = String(fruits || "").replace(/[-_\s]/g, "").trim();
    const response = await authApiInstance.post<AuthResponse>("/auth/login/fruit", { fruitCode: cleanFruits, phone });
    return response.data;
  },

  async verifyFruit(sessionId: string, fruits: string, phone: string, petName: string): Promise<AuthResponse> {
    if (isMock) {
      if (typeof window !== "undefined") {
        localStorage.setItem("saved_user_phone", phone);
        localStorage.setItem("local_user_coins", "20000");
      }
      return genMockAuth({ ...DEFAULT_USER_PROFILE, phone, petNames: [petName || "Булька"] });
    }
    const cleanFruits = String(fruits || "").replace(/[-_\s]/g, "").trim();
    const response = await authApiInstance.post<AuthResponse>("/auth/register/fruit", { sessionId, fruitCode: cleanFruits, phone, petName });
    return response.data;
  },

  async syncPetStats(hp: number, xp: number, stars: number, petIndex: number): Promise<{ success: boolean }> {
    if (isMock) return { success: true };
    return (await authApiInstance.put<{ success: boolean }>("/auth/pet/stats", { petHealth: hp, petExperience: xp, petStars: stars, petIndex })).data;
  },

  createRegistrationCleanupTask: (phone: string): void => {
    if (isMock) return;
    navigator.sendBeacon("http://localhost:3005/auth/login/cleanup-registration", JSON.stringify({ phone }));
  }
};
