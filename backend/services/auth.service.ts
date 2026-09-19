import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../auth.middleware";
import { dbPool } from "../db/db";
import { SessionData, DbUser, AuthPayload, MappedUser } from "../types/express";
import { getFirstRow, mapUserFields } from "../types/utils";


export const phoneSessions = new Map<string, SessionData>();
export const verifiedPhoneSessions = new Map<string, SessionData>();

const generateTokens = (userId: number, username: string) => {
  const safeId = Number(userId || 0);
  const safeName = String(username || "Игрок");
  return {
    accessToken: jwt.sign({ id: safeId, name: safeName }, JWT_SECRET, { expiresIn: "15m" }),
    refreshToken: jwt.sign({ id: safeId }, JWT_SECRET, { expiresIn: "7d" })
  };
};

export const BackendAuthService = {
  async requestSmsCode(phone: string, chosenPetName?: string): Promise<string> {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    const smsSessionId = "sess_" + Math.random().toString(36).substring(2, 15);

    phoneSessions.set(smsSessionId, { phone, code: randomCode, chosenPetName });
    return smsSessionId;
  },

  verifySmsCode(phone: string, code: string): string | null {
    const cleanPhone = String(phone).replace(/[^0-9]/g, "").trim();
    for (const [smsSessionId, data] of phoneSessions.entries()) {
      const cleanDataPhone = String(data.phone).replace(/[^0-9]/g, "").trim();
      if (cleanDataPhone === cleanPhone && String(data.code).trim() === String(code).trim()) {
        const fruitSessionId = "fruit_" + Math.random().toString(36).substring(2, 15);

        verifiedPhoneSessions.set(fruitSessionId, { phone: cleanPhone, code, chosenPetName: data.chosenPetName });
        phoneSessions.delete(smsSessionId);
        return fruitSessionId;
      }
    }
    return null;
  },

  async invalidateToken(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const result = await dbPool.query<DbUser>("SELECT phone FROM users WHERE id = \$1", [decoded.id]);
      const user = getFirstRow(result);
      if (user?.phone) {
        const userPhone = user.phone;
        for (const [id, data] of phoneSessions.entries()) {
          if (data.phone === userPhone) phoneSessions.delete(id);
        }
      }
    } catch {}
  },

  async login(phone: string, password: string): Promise<AuthPayload | null> {
    const result = await dbPool.query<DbUser>("SELECT * FROM users WHERE phone = \$1", [phone]);
    const user = getFirstRow(result);
    if (!user) return null;

    const inputPass = String(password || "").replace(/[-_\s]/g, "").trim();
    const dbPass = String(user.password || "").replace(/[-_\s]/g, "").trim();
    if (inputPass !== dbPass) return null;

    return { ...generateTokens(Number(user.id), user.name || "Игрок"), user: mapUserFields(user) };
  },

  async getMe(token: string): Promise<MappedUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const result = await dbPool.query<DbUser>("SELECT * FROM users WHERE id = \$1", [decoded.id]);
      const user = getFirstRow(result);
      return user ? mapUserFields(user) : null;
    } catch {
      return null;
    }
  },

  async refreshTokens(refreshToken: string): Promise<AuthPayload | null> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: number };
      const result = await dbPool.query<DbUser>("SELECT * FROM users WHERE id = \$1", [decoded.id]);
      const user = getFirstRow(result);
      if (!user) return null;
      return { ...generateTokens(Number(user.id), user.name || "Игрок"), user: mapUserFields(user) };
    } catch {
      return null;
    }
  },

  async registerUser(name: string, phone: string): Promise<AuthPayload | null> {
    const newUser = await dbPool.query<DbUser>("INSERT INTO users (name, phone, coins) VALUES (\$1, \$2, 0) RETURNING *", [name, phone]);
    const user = getFirstRow(newUser);
    if (!user) return null;
    return { ...generateTokens(Number(user.id), user.name || "Игрок"), user: mapUserFields(user) };
  },

  async processFruitLogin(clientFruitsCode: string, incomingPhone: string): Promise<AuthPayload | null> {
    if (!incomingPhone || !clientFruitsCode) return null;
    const cleanPhone = String(incomingPhone).replace(/[^0-9]/g, "").trim();
    const normalizedClientCode = String(clientFruitsCode).replace(/[-_\s]/g, "").trim();

    try {
      const result = await dbPool.query<DbUser>("SELECT * FROM users WHERE phone = \$1", [cleanPhone]);
      const user = getFirstRow(result);
      if (!user) return null;

      const dbPass = String(user.password || "").replace(/[-_\s]/g, "").trim();
      if (normalizedClientCode !== dbPass) return null;

      return { ...generateTokens(Number(user.id), user.name || "Игрок"), user: mapUserFields(user) };
    } catch {
      return null;
    }
  },

  async processFruitRegister(clientFruitsCode: string, incomingPhone: string, petName?: string): Promise<AuthPayload | null> {
    if (!incomingPhone || !clientFruitsCode) return null;
    const cleanPhone = String(incomingPhone).replace(/[^0-9]/g, "").trim();
    const normalizedClientCode = String(clientFruitsCode).trim();
    const finalPetName = String(petName || "Апа").trim();

    try {
      const randomHash = Math.floor(1000 + Math.random() * 9000).toString();
      const tempPlayerName = `Player_${randomHash}`;

      const insertResult = await dbPool.query<DbUser>(
        "INSERT INTO users (name, phone, pet_name, password, coins) VALUES (\$1, \$2, \$3, \$4, 0) RETURNING *",
        [tempPlayerName, cleanPhone, finalPetName, normalizedClientCode]
      );
      const user = getFirstRow(insertResult);
      if (!user) return null;

      return { ...generateTokens(Number(user.id), user.name || "Игрок"), user: mapUserFields(user) };
    } catch {
      return null;
    }
  }
};
