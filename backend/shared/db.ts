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
      DROP TABLE IF EXISTS public.users CASCADE;

      CREATE TABLE public.users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE,
        password VARCHAR(100),
        player_name VARCHAR(60) UNIQUE,
        unlocked_pets INT DEFAULT 1,
        pet_names TEXT[] DEFAULT ARRAY['Булька']::TEXT[],
        pet_healths INT[] DEFAULT ARRAY[100]::INTEGER[],
        pet_experiences INT[] DEFAULT ARRAY[0]::INTEGER[],
        pet_stars INT[] DEFAULT ARRAY[1]::INTEGER[],
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
    console.log("✅ База данных успешно инициализирована заново!");
  } catch (err) {
    console.error("❌ Ошибка при инициализации БД:", err);
    process.exit(1);
  }
}
