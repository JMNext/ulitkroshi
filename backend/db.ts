import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const dbClient = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

export async function initDatabase() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      password VARCHAR(100),
      roles TEXT[] DEFAULT '{user}',
      coins INT DEFAULT 0,
      unlocked_pets INT[] DEFAULT '{}',
      pet_name VARCHAR(50) DEFAULT 'Булька',
      pet_status VARCHAR(20) DEFAULT 'alive',
      pet_satiety INT DEFAULT 100,
      pet_happiness INT DEFAULT 100,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await dbClient.query(createUsersTable);
    console.log('🎰 [DB] Таблица "users" готова.');
  } catch (error) {
    console.error('❌ [DB] Ошибка инициализации БД:', error);
  }
}
