import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const cleanEnv = (val: string | undefined): string | undefined => {
  if (!val) return undefined;
  return val.replace(/['"]/g, "").trim();
};

export const dbPool = new pg.Pool({
  user: cleanEnv(process.env.DB_USER),
  host: cleanEnv(process.env.DB_HOST),
  database: cleanEnv(process.env.DB_NAME),
  password: cleanEnv(process.env.DB_PASSWORD),
  port: Number(cleanEnv(process.env.DB_PORT)) || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export async function initDatabase() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS public.users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      password VARCHAR(100),
      roles TEXT[] DEFAULT '{user}',
      coins INT DEFAULT 0,
      unlocked_pets INT[] DEFAULT '{0}',
      pet_name VARCHAR(50) DEFAULT 'Булька',
      pet_status VARCHAR(20) DEFAULT 'alive',
      pet_satiety INT DEFAULT 100,
      pet_happiness INT DEFAULT 100,
      is_suspended BOOLEAN DEFAULT false,
      last_minigame_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP - INTERVAL '1 minute',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await dbPool.query(createUsersTable);
    await dbPool.query("ALTER TABLE public.users ALTER COLUMN coins SET DEFAULT 0;");
    console.log("🎰 [DB] Таблица пользователей Улиткрошей готова.");
  } catch (error) {
    console.error("❌ [DB] Ошибка инициализации базы данных:", error);
  }
}
