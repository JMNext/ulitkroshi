import { Request } from "express";
import { QueryResult, QueryResultRow } from "pg";

export interface DbUser extends QueryResultRow {
  id: number;
  name: string | null;
  phone: string | null;
  roles?: string[] | null;
  coins?: number | null;
  unlocked_pets?: number[] | null;
  pet_name?: string | null;
  pet_health?: number | null;
  password?: string | null;
}

export interface MappedUser {
  id: number;
  name: string;
  phone: string;
  roles: string[];
  coins: number;
  unlockedPets: number[];
  petName: string;
  petHealth: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
  };
}

export interface GameActionResult<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface SessionData {
  phone: string;
  code: string;
  chosenPetName?: string;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: MappedUser;
}
