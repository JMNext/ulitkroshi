export interface UserProfile {
  id: number;
  name: string;
  discriminator: string;
  phone: string;
  roles: string[];
  coins: number;
  unlockedPets: number[];
  petName: string;
  petHealth: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}
