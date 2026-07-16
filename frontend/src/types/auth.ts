export interface UserProfile {
  id: string | number;
  email?: string;       // Сделали опциональным, так как при входе по телефону email может отсутствовать
  name?: string;        // ТЗ: Добавили имя ребенка
  phone?: string;       // ТЗ: Добавили телефон
  roles?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

// ТЗ: Добавили интерфейс для ответа проверки уникальности имени
export interface CheckNameResponse {
  available: boolean;
  suggestions?: string[];
}

// ТЗ: Добавили интерфейс для структуры данных при регистрации
export interface RegisterData {
  name: string;
  phone: string;
}
