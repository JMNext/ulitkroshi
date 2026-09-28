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
  pet_stars?: number[] | null;
  coins?: number | null;
}

export interface UserProfile {
  id: number;
  phone: string;
  name: string;
  discriminator: string;
  coins: number;
  unlockedPets: number;
  petNames: string[];
  petHealths: number[];
  petExperiences: number[];
  petStars: number[];
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
