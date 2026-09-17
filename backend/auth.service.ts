import jwt from "jsonwebtoken";
import { dbPool } from "./db";

export interface UserProfile {
  id: number; name: string; phone: string; roles: string[]; coins: number; unlockedPets: number[]; petName: string; petStatus: string; petSatiety: number; petHappiness: number;
}

const JWT_SECRET = "snail_game_super_secret_secure_key_2026";
export const phoneSessions = new Map<string, { phone: string; code: string; verified: boolean; chosenPetName?: string; savedCaptcha?: string }>();

const generateTokens = (userId: number, username: string) => ({
  accessToken: jwt.sign({ id: userId, name: username }, JWT_SECRET, { expiresIn: "15m" }),
  refreshToken: jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" })
});

const mapUserFields = (dbUser: any): UserProfile => {
  return {
    id: Number(dbUser.id || 0), name: dbUser.name || "Игрок", phone: dbUser.phone || "", roles: dbUser.roles || ["user"], coins: dbUser.coins ?? 0, unlockedPets: dbUser.unlocked_pets || [], petName: dbUser.pet_name || dbUser.name || "Игрок", petStatus: dbUser.pet_status || "alive", petSatiety: dbUser.pet_satiety ?? 100, petHappiness: dbUser.pet_happiness ?? 100
  };
};

export const BackendAuthService = {
  async invalidateToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const result = await dbPool.query("SELECT phone FROM users WHERE id = \$1", [decoded.id]);
      if (result.rows.length) {
        const dbUser = result.rows[0];
        const userPhone = dbUser.phone;
        for (const [id, data] of phoneSessions.entries()) {
          if (data.phone === userPhone) phoneSessions.delete(id);
        }
      }
    } catch {}
  },

  async login(phone: string, password: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
    const result = await dbPool.query("SELECT * FROM users WHERE phone = \$1", [cleanPhone]);
    if (!result.rows.length) return null;
    const user = result.rows[0];
    return { ...generateTokens(Number(user.id), user.name), user: mapUserFields(user) };
  },

  async getMe(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const result = await dbPool.query("SELECT * FROM users WHERE id = \$1", [decoded.id]);
      return result.rows.length ? mapUserFields(result.rows[0]) : null;
    } catch { return null; }
  },

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: number };
      const result = await dbPool.query("SELECT * FROM users WHERE id = \$1", [decoded.id]);
      if (!result.rows.length) return null;
      const user = result.rows[0];
      return { ...generateTokens(Number(user.id), user.name), user: mapUserFields(user) };
    } catch { return null; }
  },

  async registerUser(name: string, phone: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
    const newUser = await dbPool.query("INSERT INTO users (name, phone, coins) VALUES (\$1, \$2, 0) RETURNING *", [name, cleanPhone]);
    const user = newUser.rows[0];
    return { ...generateTokens(Number(user.id), user.name), user: mapUserFields(user) };
  },

  async requestSmsCode(phone: string, chosenPetName?: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    const sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
    phoneSessions.set(sessionId, { phone: cleanPhone, code: randomCode, verified: false, chosenPetName });
    console.log(`\n📲 [SMS УЛИТКРОШИ] Телефон: ${cleanPhone} | КОД: ${randomCode}\n`);
    return sessionId;
  },

  verifySmsCode(phone: string, code: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
    for (const [id, data] of phoneSessions.entries()) {
      if (data.phone === cleanPhone && data.code === code) {
        data.verified = true;
        return id;
      }
    }
    return null;
  },

  async processFruitLogin(sessionId: string, clientFruitsCode: string, incomingPhone?: string) {
    let session = phoneSessions.get(sessionId);

    if (!session && incomingPhone) {
      const cleanPhone = incomingPhone.replace(/[^0-9]/g, "").trim();
      const mockCode = "0123";
      session = { phone: cleanPhone, code: mockCode, verified: true };
      phoneSessions.set(sessionId, session);
    }

    if (!session || !session.verified) return null;

    const result = await dbPool.query("SELECT * FROM users WHERE phone = \$1", [session.phone]);
    const isReg = result.rows.length === 0;

    if (isReg) {
      if (!session.savedCaptcha) {
        session.savedCaptcha = clientFruitsCode;
        phoneSessions.set(sessionId, session);
        return {
          accessToken: "temp_reg_token",
          user: { id: 0, name: "Pending", phone: session.phone, roles: ["user"], coins: 0, unlockedPets: [], petName: session.chosenPetName || "Булька", petStatus: "alive", petSatiety: 100, petHappiness: 100 }
        };
      } else {
        if (clientFruitsCode !== session.savedCaptcha) {
          return null;
        }
      }
    } else {
      const userInDb = result.rows[0];
      if (clientFruitsCode !== userInDb.password) {
        return null;
      }
    }

    let user;
    if (isReg) {
      const tempPlayerName = `Player_${Math.floor(1000 + Math.random() * 9000)}`;
      const petName = session.chosenPetName || tempPlayerName;
      const insertResult = await dbPool.query("INSERT INTO users (name, phone, pet_name, password, coins) VALUES (\$1, \$2, \$3, \$4, 0) RETURNING *", [
        tempPlayerName, session.phone, petName, clientFruitsCode
      ]);
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
    }

    phoneSessions.delete(sessionId);
    return { ...generateTokens(Number(user.id), user.name), user: mapUserFields(user) };
  }
};
