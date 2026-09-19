import { QueryResult, QueryResultRow } from "pg";
import { DbUser, MappedUser } from "./types";

export const getFirstRow = <T extends QueryResultRow>(queryResult: QueryResult<T>): T | null => {
  if (queryResult?.rows && queryResult.rows.length > 0) {
    return queryResult.rows[0];
  }
  return null;
};

export const getNormalizedPhone = (rawPhone: unknown): string => {
  let digits = String(rawPhone || "").replace(/[^0-9]/g, "").trim();
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    digits = digits.slice(1);
  }
  return `7${digits}`;
};

export const mapUserFields = (dbUser: DbUser): MappedUser => {
  const safeId = Number(dbUser?.id || 0);
  const fallbackName = `Player_${safeId}`;

  return {
    id: safeId,
    name: dbUser?.name || fallbackName,
    phone: dbUser?.phone || "",
    roles: Array.isArray(dbUser?.roles) ? dbUser.roles : ["user"],
    coins: Number(dbUser?.coins ?? 0),
    unlockedPets: Array.isArray(dbUser?.unlocked_pets) ? dbUser.unlocked_pets.map(Number) : [],
    petName: dbUser?.pet_name || "",
    petHealth: Number(dbUser?.pet_health ?? 100)
  };
};
