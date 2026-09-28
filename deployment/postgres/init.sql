-- Инициализация базы данных проекта «Улиткроши»

CREATE TABLE IF NOT EXISTS public.users (
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

CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_player_name ON public.users(player_name);
