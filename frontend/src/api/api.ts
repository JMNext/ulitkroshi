import { UserProfile, AuthResponse } from "../types/auth";
import { BaseService } from "./base.service";
import gatewayApi from "./client";

class AuthService extends BaseService {
  private static instance: AuthService;
  private currentUser: UserProfile | null = null;
  
  private constructor() { super(); }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getUser(): UserProfile | null {
    return this.currentUser;
  }

  async login(email: string, password: string): Promise<UserProfile> {
    try {
      const response = await gatewayApi.post<AuthResponse>("/auth/login", { 
        emailOrPhone: email,
        password 
      });

      console.log("Login response:", response.data);
      
      // Проверяем наличие accessToken
      if (!response.data?.accessToken) {
        throw new Error("Login failed: no access token received");
      }

      // Сохраняем токены
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Сохраняем пользователя
      this.currentUser = response.data.user;
      return this.currentUser;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await gatewayApi.post("/auth/logout", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      this.currentUser = null;
    }
  }

  async restore(): Promise<UserProfile | null> {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    // /auth/me возвращает напрямую UserInfo, а не обёртку
    const response = await gatewayApi.get<UserProfile>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data?.id) {
      throw new Error("Failed to restore session");
    }

    this.currentUser = response.data;
    return this.currentUser;
  } catch (error) {
    console.error("Restore error:", error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
}

  async refresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await gatewayApi.post<AuthResponse>("/auth/refresh", { 
        refreshToken 
      });
      
      if (!response.data?.accessToken) {
        return false;
      }

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      this.currentUser = response.data.user;
      return true;
    } catch (error) {
      console.error("Refresh token error:", error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken') && this.currentUser !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.roles?.includes(role) ?? false;
  }

  // ТЗ: Регистрация (POST /api/auth/register)
  async register(data: { name: string; phone: string }): Promise<any> {
    try {
      const response = await gatewayApi.post("/auth/register", data);
      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  // ТЗ: Вход по телефону Шаг 1 (POST /api/auth/login/phone)
  async loginPhone(phone: string): Promise<any> {
    try {
      const response = await gatewayApi.post("/auth/login/phone", { phone });
      return response.data;
    } catch (error) {
      console.error("Login phone error:", error);
      throw error;
    }
  }

  // ТЗ: Вход по телефону Шаг 2 (POST /api/auth/login/verify-sms)
  async verifySms(phone: string, code: string): Promise<{ sessionId: string }> {
    try {
      const response = await gatewayApi.post<{ sessionId: string }>("/auth/login/verify-sms", { phone, code });
      return response.data;
    } catch (error) {
      console.error("Verify SMS error:", error);
      throw error;
    }
  }

  // ТЗ: Вход по телефону Шаг 3 (POST /api/auth/login/fruit)
  async verifyFruit(sessionId: string, fruits: string[]): Promise<AuthResponse> {
    try {
      const response = await gatewayApi.post<AuthResponse>("/auth/login/fruit", { sessionId, fruitCode: fruits });
      if (!response.data?.accessToken) {
        throw new Error("Login failed: no access token received");
      }
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      this.currentUser = response.data.user;
      return response.data;
    } catch (error) {
      console.error("Verify fruit error:", error);
      throw error;
    }
  }

  // ТЗ: Вход по QR-коду (POST /api/auth/login/qr)
  async loginQr(qrData: string): Promise<AuthResponse> {
    try {
      const response = await gatewayApi.post<AuthResponse>("/auth/login/qr", { qrData });
      if (!response.data?.accessToken) {
        throw new Error("QR Login failed: no access token received");
      }
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      this.currentUser = response.data.user;
      return response.data;
    } catch (error) {
      console.error("Login QR error:", error);
      throw error;
    }
  }

  // ТЗ: Проверка уникальности имени (GET /api/auth/check-name?name={name})
  async checkName(name: string): Promise<{ available: boolean; suggestions?: string[] }> {
    try {
      const response = await gatewayApi.get<{ available: boolean; suggestions?: string[] }>("/auth/check-name", {
        params: { name }
      });
      return response.data;
    } catch (error) {
      console.error("Check name error:", error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();
