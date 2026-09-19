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
  connectionTimeoutMillis: 30000,
  client_encoding: "UTF8"
});

export async function initDatabase() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS public.users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      password VARCHAR(100),
      roles TEXT[] DEFAULT ARRAY['user']::TEXT[],
      coins INT DEFAULT 0,
      unlocked_pets INT[] DEFAULT ARRAY[]::INTEGER[],
      pet_name VARCHAR(50) DEFAULT 'Булька',
      pet_health INT DEFAULT 100,
      last_minigame_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP - INTERVAL '1 minute',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await dbPool.query(createUsersTable);
    await dbPool.query("ALTER TABLE public.users ALTER COLUMN roles SET DEFAULT ARRAY['user']::TEXT[];");
    await dbPool.query("ALTER TABLE public.users ALTER COLUMN unlocked_pets SET DEFAULT ARRAY[]::INTEGER[];");
    await dbPool.query("ALTER TABLE public.users ALTER COLUMN coins SET DEFAULT 0;");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("📋 Детали ошибки СУБД:", error.message);
    }
  }
}
