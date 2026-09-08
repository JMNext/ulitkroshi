import jwt from 'jsonwebtoken';
import axios from 'axios';
import { dbClient } from './db';

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

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';
const VALID_FRUITS = ["apple", "banana", "orange", "strawberry", "grape"];

export const phoneSessions = new Map<string, { phone: string; code: string; verified: boolean; chosenPetName?: string; expectedFruits: string[] }>();

const generateTokens = (userId: number, username: string) => ({
  accessToken: jwt.sign({ id: userId, name: username }, JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })
});

const mapUserFields = (dbUser: any): UserProfile => ({
  id: dbUser.id,
  name: dbUser.name,
  phone: dbUser.phone,
  roles: dbUser.roles,
  coins: dbUser.coins,
  unlockedPets: dbUser.unlocked_pets || [], 
  petName: dbUser.pet_name,                 
  petStatus: dbUser.pet_status,             
  petSatiety: dbUser.pet_satiety,           
  petHappiness: dbUser.pet_happiness        
});

const generateRequiredFruits = (count = 4): string[] => [...VALID_FRUITS].sort(() => 0.5 - Math.random()).slice(0, count);

export const BackendAuthService = {
  async login(emailOrPhone: string, password: string): Promise<TokenResponse | null> {
    const result = await dbClient.query('SELECT * FROM users WHERE phone = $1', [emailOrPhone]);
    if (result.rows.length === 0) return null;
    const user = result.rows[0]; 
    if (user.password !== password) return null;
    return { ...generateTokens(user.id, user.name), user: mapUserFields(user) };
  },

  async getMe(token: string): Promise<UserProfile | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const result = await dbClient.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      return result.rows.length === 0 ? null : mapUserFields(result.rows[0]); 
    } catch { return null; }
  },

  async refreshTokens(refreshToken: string): Promise<TokenResponse | null> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: number };
      const result = await dbClient.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length === 0) return null;
      const user = result.rows[0]; 
      return { ...generateTokens(user.id, user.name), user: mapUserFields(user) };
    } catch { return null; }
  },

  async registerUser(name: string, phone: string): Promise<TokenResponse> {
    const newUser = await dbClient.query("INSERT INTO users (name, phone, unlocked_pets) VALUES ($1, $2, '{0}') RETURNING *", [name, phone]);
    return { ...generateTokens(newUser.rows[0].id, newUser.rows[0].name), user: mapUserFields(newUser.rows[0]) };
  },

  async requestSmsCode(phone: string, chosenPetName?: string): Promise<string> {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    const sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
    const expectedFruits = generateRequiredFruits(4);
    
    phoneSessions.set(sessionId, { phone, code: randomCode, verified: false, chosenPetName, expectedFruits });
    
    console.log(`\n📲 [SMS ДЕБАГ] Телефон: ${phone} | КОД: ${randomCode}`);
    console.log(`🍎 [КАПЧА ДЕБАГ] Порядок фруктов: ${expectedFruits.join(', ')}\n`);

    let smsApiKey = process.env.SMS_RU_API_KEY;
    if (smsApiKey) {
      try {
        await axios.get(`https://sms.ru`, { params: { api_id: smsApiKey.replace(/['"]/g, ''), to: phone, msg: `Ваш код подтверждения: ${randomCode}`, json: 1 } });
      } catch {}
    }
    return sessionId;
  },

  verifySmsCode(phone: string, code: string): string | null {
    for (const [id, data] of phoneSessions.entries()) {
      if (data.phone === phone && data.code === code) {
        data.verified = true;
        return id;
      }
    }
    return null;
  },

  async processFruitLogin(sessionId: string, clientFruits: string[]): Promise<TokenResponse | null> {
    const session = phoneSessions.get(sessionId);
    if (!session || !session.verified) return null;
    
    let result = await dbClient.query('SELECT * FROM users WHERE phone = $1', [session.phone]);
    const isRegistrationFlow = result.rows.length === 0;

    if (!isRegistrationFlow) {
      const isFruitValid = session.expectedFruits && session.expectedFruits.length === clientFruits.length && session.expectedFruits.every((fruit, idx) => fruit === clientFruits[idx]);
      if (!isFruitValid) return null;
    }

    let user;
    if (isRegistrationFlow) {
      const tempName = `Player_${Math.floor(1000 + Math.random() * 9000)}`;
      const petName = session.chosenPetName || "Булька";
      const insertResult = await dbClient.query("INSERT INTO users (name, phone, pet_name, unlocked_pets) VALUES ($1, $2, $3, '{0}') RETURNING *", [tempName, session.phone, petName]);
      user = insertResult.rows[0]; 
    } else {
      user = result.rows[0]; 
      if (session.chosenPetName) {
        const updatePet = await dbClient.query("UPDATE users SET pet_name = $1, unlocked_pets = '{0}' WHERE id = $2 RETURNING *", [session.chosenPetName, user.id]);
        user = updatePet.rows[0]; 
      }
    }
    
    phoneSessions.delete(sessionId);
    return { ...generateTokens(user.id, user.name), user: mapUserFields(user) };
  },

  async isNameAvailable(name: string): Promise<boolean> {
    try {
      const result = await dbClient.query('SELECT id FROM users WHERE name = $1', [name]);
      return result.rows.length === 0;
    } catch { return false; }
  }
};
