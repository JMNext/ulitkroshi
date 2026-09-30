-- =============================================================
-- Migration 001: Добавление системы стадий взросления
-- Author: growth-stages feature
-- Date: 2026-09-30
-- Rollback: 001_add_growth_stages_rollback.sql
-- =============================================================

BEGIN;

-- 1. Добавляем новые колонки для уровней и стадий
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS pet_levels INTEGER[] DEFAULT ARRAY[1],
  ADD COLUMN IF NOT EXISTS pet_stages TEXT[]    DEFAULT ARRAY['baby'],
  ADD COLUMN IF NOT EXISTS last_daily_login DATE DEFAULT NULL;

-- 2. Пересчёт level/stage по имеющемуся XP для каждого питомца
--    Логика соответствует growth.config.ts (таблица уровней из ТЗ раздел 5.3)
DO $$
DECLARE
  user_row RECORD;
  i        INTEGER;
  xp       INTEGER;
  lvl      INTEGER;
  stg      TEXT;
  levels   INTEGER[];
  stages   TEXT[];
BEGIN
  FOR user_row IN
    SELECT id, pet_experiences, array_length(pet_experiences, 1) AS pet_count
    FROM users
    WHERE pet_experiences IS NOT NULL
  LOOP
    levels := ARRAY_FILL(1,    ARRAY[user_row.pet_count]);
    stages := ARRAY_FILL('baby'::TEXT, ARRAY[user_row.pet_count]);

    FOR i IN 1..user_row.pet_count LOOP
      xp := COALESCE(user_row.pet_experiences[i], 0);

      -- Таблица уровней Baby (1–5)
      IF    xp < 25   THEN lvl := 1;  stg := 'baby';
      ELSIF xp < 50   THEN lvl := 2;  stg := 'baby';
      ELSIF xp < 75   THEN lvl := 3;  stg := 'baby';
      ELSIF xp < 110  THEN lvl := 4;  stg := 'baby';
      ELSIF xp < 150  THEN lvl := 5;  stg := 'baby';
      -- Teen (6–15)
      ELSIF xp < 300  THEN lvl := 6;  stg := 'teen';
      ELSIF xp < 500  THEN lvl := 7;  stg := 'teen';
      ELSIF xp < 650  THEN lvl := 8;  stg := 'teen';
      ELSIF xp < 800  THEN lvl := 9;  stg := 'teen';
      ELSIF xp < 1000 THEN lvl := 10; stg := 'teen';
      ELSIF xp < 1100 THEN lvl := 11; stg := 'teen';
      ELSIF xp < 1200 THEN lvl := 12; stg := 'teen';
      ELSIF xp < 1300 THEN lvl := 13; stg := 'teen';
      ELSIF xp < 1400 THEN lvl := 14; stg := 'teen';
      ELSIF xp < 1500 THEN lvl := 15; stg := 'teen';
      -- Adult (16–100), шаг 300 XP начиная с 1500
      ELSE
        lvl := 16 + FLOOR((xp - 1500)::NUMERIC / 300);
        IF lvl > 100 THEN lvl := 100; END IF;
        stg := 'adult';
      END IF;

      levels[i] := lvl;
      stages[i] := stg;
    END LOOP;

    UPDATE users
    SET pet_levels = levels,
        pet_stages = stages
    WHERE id = user_row.id;
  END LOOP;
END $$;

-- 3. Устаревшая колонка pet_stars более не используется.
--    Оставляем в схеме для безопасного rollback; удаление — в отдельной миграции
--    после полного перехода всей кодовой базы.

COMMIT;
