export interface UserProfile {
  id: number;
  phone: string;
  player_name: string;
  coins: number;
  unlockedPets: number;
  petNames: string[];
  petHealths: number[];
  petExperiences: number[];
  petStars: number[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface PetStoreState {
  activePetIndex: number;
  petName: string;
  hp: number;
  experience: number;
  stars: number;
  unlockedPetIndexes: number[];
  updateField?: (key: string, value: unknown) => void;
}
