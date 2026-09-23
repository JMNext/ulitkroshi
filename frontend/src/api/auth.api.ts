import { useApiStore } from "@/api/store/useApiStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { mockApi } from "./api.mock";
import { authApiInstance, isMock } from "./client";
import { AuthResponse, UserProfile } from "./types/types";

export const syncUserStores = (u: UserProfile) => {
  if (!u) return;
  const pStore = usePetStore.getState() as any;
  pStore?.updateField ? (pStore.updateField("petName", u.petName), pStore.updateField("hp", Number(u.petHealth ?? 100))) : usePetStore.setState({ petName: u.petName, hp: Number(u.petHealth ?? 100) });

  useApiStore.setState({ user: u, coins: u.coins, isAuthenticated: true });

  const disc = u.discriminator ? String(u.discriminator).trim() : (u.name?.includes("#") ? u.name.split("#").pop() || "0000" : "0000");
  const local = typeof window !== "undefined" ? localStorage.getItem("local_saved_username")?.trim() : null;
  const disp = (local || u.name || "Player").split("#");

  useMainGameStore.setState({ username: (disp[0] || "Player").trim(), discriminator: disc, userId: Number(u.id), coins: u.coins });
};

const saveFlow = (isLogin: boolean) => localStorage.setItem("is_login_flow", String(isLogin));

export const authApi = {
  resetMockMemory: () => { if (isMock) mockApi.resetMockMemory(); },

  async checkLoginPhone(phone: string) {
    if (isMock) { const res = await mockApi.checkLoginPhone(phone), fl = useRegistrationStep3Store.getState().isLogin; saveFlow(fl); return { ...res, isLogin: fl }; }
    const res = (await authApiInstance.post<any>("/auth/login/phone-check", { phone })).data;
    if (res) saveFlow(res.isLogin);
    return res;
  },

  async logout() {
    if (typeof window === "undefined") return;
    const name = localStorage.getItem("local_saved_username");
    if (isMock) { localStorage.clear(); if (name) localStorage.setItem("local_saved_username", name); return mockApi.logout(); }
    await authApiInstance.post("/auth/logout").catch(() => {});
    ["accessToken", "refreshToken", "is_login_flow", "local_user_coins", "guide_viewed"].forEach(k => localStorage.removeItem(k));
  },

  async restore() {
    const u = isMock ? await mockApi.restore() : (await authApiInstance.get<UserProfile>("/auth/me")).data;
    if (u) syncUserStores(u);
    return u;
  },

  async refresh(rt: string) {
    if (isMock) return mockApi.refresh(rt);
    const d = (await authApiInstance.post<AuthResponse>("/auth/refresh", { refreshToken: rt })).data;
    if (d?.accessToken) { localStorage.setItem("accessToken", d.accessToken); localStorage.setItem("refreshToken", d.refreshToken); }
    return d;
  },

  async loginPhone(phone: string, chosenPetName?: string) {
    if (isMock) { const res = await mockApi.loginPhone(phone, chosenPetName), fl = useRegistrationStep3Store.getState().isLogin; saveFlow(fl); return { ...res, isLogin: fl }; }
    const res = (await authApiInstance.post<any>("/auth/login/phone", { phone, chosenPetName })).data;
    if (res) saveFlow(res.isLogin);
    return res;
  },

  async verifySms(phone: string, code: string) { return isMock ? mockApi.verifySms(phone, code) : (await authApiInstance.post<{ sessionId: string }>("/auth/login/verify-sms", { phone, code })).data; },

  async verifyFruit(sessionId: string, fruits: string, phone?: string) {
    if (isMock) { const d = await mockApi.verifyFruit(sessionId, fruits, phone); if (d?.user) syncUserStores(d.user); return d; }

    const scenes = (window as any).phaserGame?.scene?.getScenes(true);
    let flow = localStorage.getItem("is_login_flow") === "true";
    if (scenes?.[0]?.sys?.settings?.key === "Step3Scene" && !phone) { flow = false; saveFlow(false); }

    const pStore = usePetStore.getState() as any;
    const d = (await authApiInstance.post<AuthResponse>(flow ? "/auth/login/fruit" : "/auth/register/fruit", { sessionId, fruitCode: fruits, phone, petName: pStore?.petName || pStore?.name || "Улитка" })).data;

    if (d?.accessToken) { localStorage.setItem("accessToken", d.accessToken); localStorage.setItem("refreshToken", d.refreshToken); if (d.user) syncUserStores(d.user); }
    return d;
  },

  createRegistrationCleanupTask: (phone: string) => { if (!isMock) navigator.sendBeacon("http://localhost:3001/auth/login/cleanup-registration", JSON.stringify({ phone })); }
};
