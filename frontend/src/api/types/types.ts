export interface UserProfile {
  id: number;
  phone: string;
  player_name: string;
  coins: number;
  unlockedPets: number;
  petNames: string[];
  petHealths: number[];
  petExperiences: number[];
  /** @deprecated Используйте petLevels + petStages */
  petStars: number[];
  petLevels: number[];
  petStages: string[];
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
  level: number;
  stage: string;
  unlockedPetIndexes: number[];
  updateField?: (key: string, value: unknown) => void;
}

export interface GainXpResponse {
  newXp: number;
  newLevel: number;
  newStage: string;
  xpGained: number;
  stageTransition: { from: string; to: string } | null;
}
