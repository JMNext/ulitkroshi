import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../shared/auth.middleware";
import { dbPool } from "../shared/db";
import { DbUser, AuthPayload, MappedUser } from "../shared/types";
import { getFirstRow, mapUserFields } from "../shared/utils";

// Наш кастомный тип сессии с меткой времени создания
interface TimedSession {
  phone: string;
  code: string;
  chosenPetName?: string;
  createdAt: number;
}

// Встроенные карты памяти для сессий
const rawPhoneSessions = new Map<string, TimedSession>();
const rawVerifiedPhoneSessions = new Map<string, TimedSession>();

// Обертка для сохранения совместимости интерфейсов (чтобы другие файлы не сломались)
export const phoneSessions = {
  get: (key: string) => rawPhoneSessions.get(key),
  set: (key: string, val: Omit<TimedSession, "createdAt">) =>
    rawPhoneSessions.set(key, { ...val, createdAt: Date.now() }),
  del: (key: string) => rawPhoneSessions.delete(key),
  keys: () => Array.from(rawPhoneSessions.keys())
};

export const verifiedPhoneSessions = {
  get: (key: string) => rawVerifiedPhoneSessions.get(key),
  set: (key: string, val: Omit<TimedSession, "createdAt">) =>
    rawVerifiedPhoneSessions.set(key, { ...val, createdAt: Date.now() }),
  del: (key: string) => rawVerifiedPhoneSessions.delete(key),
  keys: () => Array.from(rawVerifiedPhoneSessions.keys())
};

// Автоматический сборщик мусора: раз в минуту удаляет сессии старше 5 минут
setInterval(() => {
  const now = Date.now();
  const TTL = 5 * 60 * 1000; // 5 минут

  for (const [key, session] of rawPhoneSessions.entries()) {
    if (now - session.createdAt > TTL) rawPhoneSessions.delete(key);
  }
  for (const [key, session] of rawVerifiedPhoneSessions.entries()) {
    if (now - session.createdAt > TTL) rawVerifiedPhoneSessions.delete(key);
  }
}, 60000);

const generateTokens = (userId: number, username: string) => {
  const safeId = Number(userId || 0);
  const safeName = String(username || `Player_${safeId}`);
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

    const keys = phoneSessions.keys();
    for (const smsSessionId of keys) {
      const data = phoneSessions.get(smsSessionId);
      if (!data) continue;

      const cleanDataPhone = String(data.phone).replace(/[^0-9]/g, "").trim();
      if (cleanDataPhone === cleanPhone && String(data.code).trim() === String(code).trim()) {
        const fruitSessionId = "fruit_" + Math.random().toString(36).substring(2, 15);

        verifiedPhoneSessions.set(fruitSessionId, { phone: cleanPhone, code, chosenPetName: data.chosenPetName });
        phoneSessions.del(smsSessionId);
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
        const keys = phoneSessions.keys();
        for (const id of keys) {
          const data = phoneSessions.get(id);
          if (data && data.phone === userPhone) phoneSessions.del(id);
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

    const fallbackName = `Player_${user.id}`;
    return { ...generateTokens(Number(user.id), user.name || fallbackName), user: mapUserFields(user) };
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
      const fallbackName = `Player_${user.id}`;
      return { ...generateTokens(Number(user.id), user.name || fallbackName), user: mapUserFields(user) };
    } catch {
      return null;
    }
  },

  async registerUser(name: string, phone: string): Promise<AuthPayload | null> {
    const newUser = await dbPool.query<DbUser>("INSERT INTO users (name, phone, coins) VALUES (\$1, \$2, 0) RETURNING *", [name, phone]);
    const user = getFirstRow(newUser);
    if (!user) return null;
    const fallbackName = `Player_${user.id}`;
    return { ...generateTokens(Number(user.id), user.name || fallbackName), user: mapUserFields(user) };
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

      const fallbackName = `Player_${user.id}`;
      return { ...generateTokens(Number(user.id), user.name || fallbackName), user: mapUserFields(user) };
    } catch {
      return null;
    }
  },

  async processFruitRegister(clientFruitsCode: string, incomingPhone: string, petName?: string): Promise<AuthPayload | null> {
    if (!incomingPhone || !clientFruitsCode) return null;
    const cleanPhone = String(incomingPhone).replace(/[^0-9]/g, "").trim();
    const normalizedClientCode = String(clientFruitsCode).trim();
    const finalPetName = String(petName || "Улитка").trim();

    try {
      const randomHash = Math.floor(1000 + Math.random() * 9000).toString();
      const tempPlayerName = `Player_${randomHash}`;

      const insertResult = await dbPool.query<DbUser>(
        "INSERT INTO users (name, phone, pet_name, password, coins) VALUES (\$1, \$2, \$3, \$4, 0) RETURNING *",
        [tempPlayerName, cleanPhone, finalPetName, normalizedClientCode]
      );
      const user = getFirstRow(insertResult);
      if (!user) return null;

      const fallbackName = `Player_${user.id}`;
      return { ...generateTokens(Number(user.id), user.name || fallbackName), user: mapUserFields(user) };
    } catch {
      return null;
    }
  }
};
