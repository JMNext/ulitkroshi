import { QueryResult, QueryResultRow } from "pg";
import { DbUser, UserProfile } from "./types";

export const getFirstRow = <T extends QueryResultRow>(res: QueryResult<T>): T | null => {
  if (!res || !res.rows || res.rows.length === 0) return null;
  return res.rows[0] || null;
};

export const getNormalizedPhone = (raw: unknown): string => {
  const d = String(raw || "").replace(/[^0-9]/g, "").trim();
  if (d.length === 11 && (d.startsWith("7") || d.startsWith("8"))) {
    return "7" + d.slice(1);
  }
  return "7" + d;
};

export const mapUserFields = (u: DbUser): UserProfile => {
  const id = Number(u?.id || 0);
  const fullName = u?.player_name ? String(u.player_name) : "Player#1000";
  const [, parsedDisc] = fullName.split("#");
  const discriminator = parsedDisc || "1000";

  const unlockedPetsCount = (u?.unlocked_pets !== undefined && u?.unlocked_pets !== null) ? Number(u.unlocked_pets) : 1;
  const coinsCount = (u?.coins !== undefined && u?.coins !== null) ? Number(u.coins) : 0;

  let finalNames: string[] = [];
  if (Array.isArray(u?.pet_names) && u.pet_names.length > 0) {
    finalNames = u.pet_names.map(String);
  } else {
    finalNames.push("Булька");
  }

  let finalHealths: number[] = [];
  if (Array.isArray(u?.pet_healths) && u.pet_healths.length > 0) {
    finalHealths = u.pet_healths.map(Number);
  } else {
    finalHealths.push(100);
  }

  let finalXp: number[] = [];
  if (Array.isArray(u?.pet_experiences) && u.pet_experiences.length > 0) {
    finalXp = u.pet_experiences.map(Number);
  } else {
    finalXp.push(0);
  }

  let finalStars: number[] = [];
  if (Array.isArray(u?.pet_stars) && u.pet_stars.length > 0) {
    finalStars = u.pet_stars.map(Number);
  } else {
    finalStars.push(1);
  }

  return {
    id,
    phone: u?.phone || "",
    player_name: fullName,
    discriminator,
    coins: coinsCount,
    unlockedPets: unlockedPetsCount,
    petNames: finalNames,
    petHealths: finalHealths,
    petExperiences: finalXp,
    petStars: finalStars
  } as unknown as UserProfile;
};
