import crypto from "crypto";
import jwt from "jsonwebtoken";
import { dbPool } from "../shared/db";
import { DbUser, SessionData } from "../shared/types";
import { getFirstRow, mapUserFields, getNormalizedPhone } from "../shared/utils";
import { JWT_SECRET } from "../shared/auth.middleware";

export const phoneSessions = new Map<string, SessionData>();
export const verifiedPhoneSessions = new Map<string, SessionData>();
const SMS_RU_API_KEY = process.env.SMS_RU_API_KEY || "";

setInterval(() => {
  const now = Date.now();
  [phoneSessions, verifiedPhoneSessions].forEach((m) => {
    for (const [k, s] of m.entries()) if (now - s.createdAt > 300000) m.delete(k);
  });
}, 60000);

const hashPassword = (pass: string): string => {
  return crypto.createHash("sha256").update(String(pass || "").replace(/[-_\s]/g, "").trim()).digest("hex");
};

const genTokens = (id: number, name: string) => {
  const sId = Number(id || 0);
  const sName = String(name || `Player#${sId}`);
  return {
    accessToken: jwt.sign({ id: sId, name: sName }, JWT_SECRET, { expiresIn: "15m" }),
    refreshToken: jwt.sign({ id: sId }, JWT_SECRET, { expiresIn: "7d" })
  };
};

const authRes = (u: DbUser) => {
  const tokens = genTokens(u.id, u.player_name || "");
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: mapUserFields(u)
  };
};

export const checkUserExists = async (phone: string): Promise<boolean> => {
  const r = await dbPool.query("SELECT 1 FROM users WHERE phone = \$1", [getNormalizedPhone(phone)]);
  return r.rows.length > 0;
};

export const requestSmsCode = async (phone: string, chosenPetName?: string): Promise<string> => {
  const generatedCode = String(Math.floor(1000 + Math.random() * 9000));
  const cp = getNormalizedPhone(phone);
  try {
    const url = `https://sms.ru{SMS_RU_API_KEY}&to=${cp}&msg=${encodeURIComponent(`Код авторизации: \${generatedCode}`)}&json=1`;
    await fetch(url);
  } catch (err) {
    console.error(err);
  }
  const id = "sess_" + crypto.randomBytes(8).toString("hex");
  phoneSessions.set(id, { phone: cp, code: generatedCode, chosenPetName, createdAt: Date.now() });
  return id;
};

export const verifySmsCode = (phone: string, code: string): string | null => {
  const cp = getNormalizedPhone(phone);
  for (const [sId, d] of phoneSessions.entries()) {
    if (getNormalizedPhone(d.phone) === cp && d.code === code) {
      const fId = "fruit_" + crypto.randomBytes(8).toString("hex");
      verifiedPhoneSessions.set(fId, { phone: cp, code: d.code, chosenPetName: d.chosenPetName, createdAt: Date.now() });
      phoneSessions.delete(sId);
      return fId;
    }
  }
  return null;
};

export const cleanupSessionsByPhone = (phone: string): void => {
  const cp = getNormalizedPhone(phone);
  [phoneSessions, verifiedPhoneSessions].forEach((m) => {
    for (const [k, s] of m.entries()) {
      if (getNormalizedPhone(s.phone) === cp) m.delete(k);
    }
  });
};

export const invalidateToken = async (t: string): Promise<void> => {
  try {
    await dbPool.query("INSERT INTO public.token_blacklist (token) VALUES (\$1) ON CONFLICT DO NOTHING", [t]);
  } catch (err) {
    console.error(err);
  }
};

export const getMe = async (t: string) => {
  try {
    const dec = jwt.verify(t, JWT_SECRET) as { id: number };
    const r = await dbPool.query<DbUser>("SELECT * FROM users WHERE id = \$1", [dec.id]);
    const u = getFirstRow(r);
    return u ? mapUserFields(u) : null;
  } catch {
    return null;
  }
};

export const refreshTokens = async (rt: string) => {
  try {
    const dec = jwt.verify(rt, JWT_SECRET) as { id: number };
    const r = await dbPool.query<DbUser>("SELECT * FROM users WHERE id = \$1", [dec.id]);
    const u = getFirstRow(r);
    return u ? authRes(u) : null;
  } catch {
    return null;
  }
};

export const processFruitLogin = async (code: string, phone: string) => {
  if (!phone || !code) return null;
  const r = await dbPool.query<DbUser>("SELECT * FROM users WHERE phone = \$1", [getNormalizedPhone(phone)]);
  const u = getFirstRow(r);
  if (!u) return null;
  return hashPassword(code) === u.password ? authRes(u) : null;
};

export const processFruitRegister = async (sessionId: string, code: string, phone: string, petName?: string) => {
  if (!phone || !code) return null;
  try {
    const cp = getNormalizedPhone(phone);
    const sessionData = verifiedPhoneSessions.get(sessionId);
    const savedPetName = (sessionData?.chosenPetName || petName || "Булька").trim();
    const realPetName = savedPetName !== "" ? savedPetName : "Булька";

    const rCheck = await dbPool.query<DbUser>("SELECT * FROM users WHERE phone = \$1", [cp]);
    if (getFirstRow(rCheck)) throw new Error("Зарегистрирован");

    const rIns = await dbPool.query<DbUser>(
      `INSERT INTO users (phone, password, player_name, unlocked_pets, pet_names, pet_healths, pet_experiences, pet_stars, pet_levels, pet_stages, coins)
       VALUES ($1, $2, $3, 1, ARRAY[$4]::TEXT[], '{100}'::INTEGER[], '{0}'::INTEGER[], '{1}'::INTEGER[], '{1}'::INTEGER[], '{"baby"}'::TEXT[], 0) RETURNING *`,
      [cp, hashPassword(code), `${realPetName}#${Math.floor(1000 + Math.random() * 9000)}`, realPetName]
    );

    verifiedPhoneSessions.delete(sessionId);
    const newUser = getFirstRow(rIns);
    return newUser ? authRes(newUser) : null;
  } catch (dbError) {
    throw dbError;
  }
};

export const syncPetStats = async (userId: number, petHealth: number, petExperience: number, petStars: number, petIndex: number): Promise<boolean> => {
  try {
    const idx = (Number(petIndex) || 0) + 1;
    await dbPool.query(
      `UPDATE users
       SET pet_healths[$1] = $2,
           pet_experiences[$1] = $3,
           pet_stars[$1] = $4
       WHERE id = $5`,
      [idx, petHealth, petExperience, petStars, userId]
    );
    return true;
  } catch {
    return false;
  }
};
