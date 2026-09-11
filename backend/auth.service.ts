import axios from "axios";
import jwt from "jsonwebtoken";
import { dbPool } from "./db";

export interface UserProfile {
  id: number;
  name: string;
  phone: string;
  roles: string[];
  coins: number;
  unlockedPets: number[];
  petName: string;
  petStatus: string;
  petSatiety: number;
  petHappiness: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";
export const phoneSessions = new Map<string, { phone: string; code: string; verified: boolean; chosenPetName?: string }>();

const generateTokens = (userId: number, username: string) => ({
  accessToken: jwt.sign({ id: userId, name: username }, JWT_SECRET, { expiresIn: "15m" }),
  refreshToken: jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" })
});

const mapUserFields = (dbUser: any): UserProfile => ({
  id: dbUser.id,
  name: dbUser.name,
  phone: dbUser.phone,
  roles: dbUser.roles || ["user"],
  coins: dbUser.coins ?? 0,
  unlockedPets: dbUser.unlocked_pets || [],
  petName: dbUser.pet_name || "",
  petStatus: dbUser.pet_status || "alive",
  petSatiety: dbUser.pet_satiety ?? 100,
  petHappiness: dbUser.pet_happiness ?? 100
});

export const BackendAuthService = {
  async login(phone: string, password: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
    const result = await dbPool.query("SELECT * FROM users WHERE phone = $1", [cleanPhone]);
    if (!result.rows.length || result.rows[0].password !== password) return null;
    const user = result.rows[0];
    return { ...generateTokens(user.id, user.name), user: mapUserFields(user) };
  },

  async getMe(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const result = await dbPool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
      return result.rows.length ? mapUserFields(result.rows[0]) : null;
    } catch {
      return null;
    }
  },

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: number };
      const result = await dbPool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
      if (!result.rows.length) return null;
      const user = result.rows[0];
      return { ...generateTokens(user.id, user.name), user: mapUserFields(user) };
    } catch {
      return null;
    }
  },

  async registerUser(name: string, phone: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
    const newUser = await dbPool.query("INSERT INTO users (name, phone) VALUES ($1, $2) RETURNING *", [name, cleanPhone]);
    return { ...generateTokens(newUser.rows[0].id, newUser.rows[0].name), user: mapUserFields(newUser.rows[0]) };
  },

  async requestSmsCode(phone: string, chosenPetName?: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, "").trim();
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    const sessionId = "sess_" + Math.random().toString(36).substring(2, 15);

    phoneSessions.set(sessionId, { phone: cleanPhone, code: randomCode, verified: false, chosenPetName });

    console.log(`\n📲 [SMS УЛИТКРОШИ] Телефон: ${cleanPhone} | КОД: ${randomCode}\n`);

    const smsApiKey = process.env.SMS_RU_API_KEY;
    if (smsApiKey && smsApiKey !== "undefined") {
      axios
        .get(`https://sms.ru`, {
          params: { api_id: smsApiKey, to: cleanPhone, msg: `Код Улиткроши: ${randomCode}`, json: 1 },
          timeout: 2000
        })
        .catch(() => {});
    }
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

  async processFruitLogin(sessionId: string, clientFruitsCode: string) {
    const session = phoneSessions.get(sessionId);
    if (!session || !session.verified) return null;

    const result = await dbPool.query("SELECT * FROM users WHERE phone = $1", [session.phone]);
    const isReg = result.rows.length === 0;

    if (!isReg && result.rows[0].password && result.rows[0].password !== clientFruitsCode) return null;

    let user;
    if (isReg) {
      const tempPlayerName = `Player_${Math.floor(1000 + Math.random() * 9000)}`;
      const petName = session.chosenPetName || "Булька";
      const insertResult = await dbPool.query("INSERT INTO users (name, phone, pet_name, password) VALUES ($1, $2, $3, $4) RETURNING *", [
        tempPlayerName,
        session.phone,
        petName,
        clientFruitsCode
      ]);
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
      if (session.chosenPetName) {
        const updatePet = await dbPool.query("UPDATE users SET pet_name = $1 WHERE id = $2 RETURNING *", [session.chosenPetName, user.id]);
        user = updatePet.rows[0];
      }
    }
    phoneSessions.delete(sessionId);
    return { ...generateTokens(user.id, user.name), user: mapUserFields(user) };
  }
};
