import { UserProfile, AuthResponse } from "../types/auth";
import { BaseService } from "./base.service";

class AuthService extends BaseService {
  private static instance: AuthService;
  private currentUser: UserProfile | null = null;
  // 1. Добавляем временное хранилище для проверенного имени питомца/пользователя
  private lastCheckedName: string = "Константин"; 
  
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

  // 2. Используем сохраненное имя по умолчанию вместо хардкода
  private createMockUser(email: string = "user@example.com"): UserProfile {
    return {
      id: "mock-uid-12345",
      email: email,
      phone: "+79991112233",
      name: this.lastCheckedName, // Теперь берется актуальное имя
      roles: ["user", "admin"]
    };
  }

  async login(email: string, password: string): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (password === "wrong") throw new Error("Invalid password");
    
    this.currentUser = this.createMockUser(email);
    return this.currentUser;
  }

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.currentUser = null;
    this.lastCheckedName = "Константин"; // Сбрасываем к дефолту
  }

  async restore(): Promise<UserProfile | null> {
    return null;
  }

  async refresh(): Promise<boolean> {
    return false;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.roles?.includes(role) ?? false;
  }

  async register(data: { name: string; phone: string }): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (data.name) this.lastCheckedName = data.name; // Запоминаем из прямой регистрации
    return { success: true, message: "Mock registration successful" };
  }

  async loginPhone(phone: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true, message: "SMS code sent to " + phone };
  }

  async verifySms(phone: string, code: string): Promise<{ sessionId: string }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (code === "0000") throw new Error("Invalid SMS code");
    return { sessionId: "mock_session_id_xyz" };
  }

  async verifyFruit(sessionId: string, fruits: string[]): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const response: AuthResponse = {
      accessToken: "mock_access_token_fruit_" + Date.now(),
      refreshToken: "mock_refresh_token_fruit_" + Date.now(),
      user: this.createMockUser() // Вернет юзера с сохраненным lastCheckedName
    };

    this.currentUser = response.user;
    return response;
  }

  async loginQr(qrData: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const response: AuthResponse = {
      accessToken: "mock_access_token_qr_" + Date.now(),
      refreshToken: "mock_refresh_token_qr_" + Date.now(),
      user: this.createMockUser() // Вернет юзера с сохраненным lastCheckedName
    };

    this.currentUser = response.user;
    return response;
  }

  async checkName(name: string): Promise<{ available: boolean; suggestions?: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (name.toLowerCase() === "admin" || name.toLowerCase() === "root") {
      return {
        available: false,
        suggestions: [`${name}1`, `${name}_pro`]
      };
    }
    
    // 3. Запоминаем имя, если оно успешно прошло валидацию инпута
    this.lastCheckedName = name; 
    
    return { available: true };
  }
}

export const authService = AuthService.getInstance();
