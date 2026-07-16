import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "../api/api";
import { UserProfile } from "../types/auth";

const trackMetrika = (targetName: string, params?: any) => {
  const COUNTER_ID = 12345678; // ⚠️ ЗАМЕНИТЕ НА ВАШ ID СЧЕТЧИКА
  if (typeof window !== "undefined" && (window as any).ym) {
    (window as any).ym(COUNTER_ID, "reachGoal", targetName, params);
  } else {
    console.log(`[Yandex.Metrika Mock] Цель: ${targetName}`, params || "");
  }
};

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Методы ТЗ
  checkName: (name: string) => Promise<{ available: boolean; suggestions?: string[] }>;
  register: (name: string, phone: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  loginPhone: (phone: string) => Promise<void>;
  verifySms: (phone: string, code: string) => Promise<{ sessionId: string }>;
  verifyFruit: (sessionId: string, fruits: string[]) => Promise<void>;
  loginQr: (qrData: string) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
  
  // ТЗ Аналитика: ручные триггеры для экранов
  trackStartRegistration: () => void;
  trackNameEntered: () => void;
  
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      // ТЗ: onboarding_started — начало регистрации (вызывайте при монтировании экрана ввода имени)
      trackStartRegistration: () => {
        trackMetrika("onboarding_started");
      },

      // ТЗ: onboarding_name_entered — ввод имени (вызывайте при переходе с экрана подтверждения имени)
      trackNameEntered: () => {
        trackMetrika("onboarding_name_entered");
      },

      // 1. Проверка имени (GET /api/auth/check-name)
      checkName: async (name) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.checkName(name);
          set({ isLoading: false });
          return res;
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.message || "Ошибка проверки имени";
          set({ isLoading: false, error: errMsg });
          throw err;
        }
      },

      // 2. Регистрация (POST /api/auth/register)
      register: async (name, phone) => {
        set({ isLoading: true, error: null });
        // ТЗ: login_attempt — попытка входа
        trackMetrika("login_attempt", { type: "register" });
        try {
          await authService.register({ name, phone });
          set({ isLoading: false });
          // ТЗ: onboarding_phone_entered — ввод телефона
          trackMetrika("onboarding_phone_entered");
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.message || "Ошибка регистрации";
          set({ isLoading: false, error: errMsg });
          // ТЗ: login_failed — неудачный вход
          trackMetrika("login_failed", { error: "register_error" });
          throw err;
        }
      },

      // 3. Старый логин по email/pass
      login: async (email, pass) => {
        set({ isLoading: true, error: null });
        trackMetrika("login_attempt", { type: "email" });
        try {
          const user = await authService.login(email, pass);
          const accessToken = localStorage.getItem("accessToken");
          set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
          trackMetrika("login_success", { type: "email" });
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.message || "Ошибка входа";
          set({ isLoading: false, error: errMsg });
          trackMetrika("login_failed", { error: "email_error" });
          throw err;
        }
      },

      // 4. Инициализация входа по телефону (POST /api/auth/login/phone)
      loginPhone: async (phone) => {
        set({ isLoading: true, error: null });
        trackMetrika("login_attempt", { type: "phone_sms_request" });
        try {
          await authService.loginPhone(phone);
          set({ isLoading: false });
          // ТЗ: onboarding_sms_sent — отправка SMS
          trackMetrika("onboarding_sms_sent");
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.message || "Ошибка отправки SMS";
          set({ isLoading: false, error: errMsg });
          trackMetrika("login_failed", { error: "sms_request_error" });
          throw err;
        }
      },

      // 5. Верификация SMS (POST /api/auth/login/verify-sms)
      verifySms: async (phone, code) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.verifySms(phone, code);
          set({ isLoading: false });
          // ТЗ: onboarding_sms_verified — подтверждение SMS
          trackMetrika("onboarding_sms_verified");
          return res;
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.message || "Неверный код SMS";
          set({ isLoading: false, error: errMsg });
          trackMetrika("login_failed", { error: "sms_verify_error" });
          throw err;
        }
      },

      // 6. Верификация фруктового кода (POST /api/auth/login/fruit)
      verifyFruit: async (sessionId, fruits) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.verifyFruit(sessionId, fruits);
          
          // ТЗ: onboarding_fruit_code_created — создание фруктового кода
          trackMetrika("onboarding_fruit_code_created");

          set({
            user: res.user,
            token: res.accessToken,
            isAuthenticated: true,
            isLoading: false
          });

          // ТЗ: onboarding_completed — завершение регистрации
          trackMetrika("onboarding_completed");
          // ТЗ: login_success — успешный вход
          trackMetrika("login_success", { type: "phone_fruit" });
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.message || "Неверный фруктовый код";
          set({ isLoading: false, error: errMsg });
          trackMetrika("login_failed", { error: "fruit_code_error" });
          throw err;
        }
      },

      // 7. Вход по QR-коду (POST /api/auth/login/qr)
      loginQr: async (qrData) => {
        set({ isLoading: true, error: null });
        trackMetrika("login_attempt", { type: "qr" });
        try {
          const res = await authService.loginQr(qrData);
          set({
            user: res.user,
            token: res.accessToken,
            isAuthenticated: true,
            isLoading: false
          });
          trackMetrika("login_success", { type: "qr" });
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.message || "Ошибка QR-кода";
          set({ isLoading: false, error: errMsg });
          trackMetrika("login_failed", { error: "qr_error" });
          throw err;
        }
      },

      // 8. Обновление токена (POST /api/auth/refresh)
      refreshToken: async () => {
        set({ isLoading: true, error: null });
        try {
          const success = await authService.refresh();
          if (success) {
            const accessToken = localStorage.getItem("accessToken");
            const currentUser = authService.getUser();
            set({ token: accessToken, user: currentUser, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false, isAuthenticated: false });
          }
          return success;
        } catch (err: any) {
          set({ isLoading: false, isAuthenticated: false, error: err.message });
          return false;
        }
      },

      // 9. Логаут и очистка данных при выходе
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (err) {
          console.error("Logout request failed:", err);
        } finally {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
        }
      }
    }),
    {
      name: "child-game-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
