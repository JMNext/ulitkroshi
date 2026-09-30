import { Request } from "express";
import { QueryResultRow } from "pg";

export interface DbUser extends QueryResultRow {
  id: number;
  phone: string | null;
  password?: string | null;
  player_name: string | null;
  unlocked_pets?: number | null;
  pet_names?: string[] | null;
  pet_healths?: number[] | null;
  pet_experiences?: number[] | null;
  /** @deprecated Устаревшее поле. Используйте pet_levels + pet_stages */
  pet_stars?: number[] | null;
  pet_levels?: number[] | null;
  pet_stages?: string[] | null;
  last_daily_login?: string | null;
  coins?: number | null;
}

export interface UserProfile {
  id: number;
  phone: string;
  player_name: string;
  discriminator: string;
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

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
  };
}

export interface SessionData {
  phone: string;
  code: string;
  chosenPetName?: string;
  createdAt: number;
}
