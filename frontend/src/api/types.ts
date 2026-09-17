export interface UserProfile {
  id: number;
  name: string;
  phone: string;
  roles: string[];
  coins: number;
  unlockedPets: number[];
  petName: string;
  petStatus: string;
  petSatiety: number;
  petHappiness: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}
