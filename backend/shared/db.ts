import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const env = (v: string | undefined): string | undefined => v ? v.replace(/['"]/g, "").trim() : undefined;

export const dbPool = new pg.Pool({
  user: env(process.env.DB_USER),
  host: env(process.env.DB_HOST),
  database: env(process.env.DB_NAME),
  password: env(process.env.DB_PASSWORD),
  port: Number(env(process.env.DB_PORT)) || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  client_encoding: "UTF8"
});

export async function initDatabase(): Promise<void> {
  try {
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE,
        password VARCHAR(100),
        player_name VARCHAR(60) UNIQUE,
        unlocked_pets INT DEFAULT 1,
        pet_names TEXT[] DEFAULT ARRAY[]::TEXT[],
        pet_healths INT[] DEFAULT ARRAY[]::INTEGER[],
        pet_experiences INT[] DEFAULT ARRAY[]::INTEGER[],
        pet_stars INT[] DEFAULT ARRAY[]::INTEGER[],
        coins INT DEFAULT 0,
        last_minigame_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP - INTERVAL '1 minute',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS public.token_blacklist (
        token TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ База данных успешно инициализирована!");
  } catch (err) {
    console.error("❌ Ошибка при инициализации БД:", err);
    process.exit(1);
  }
}
