-- =============================================================
-- Rollback Migration 001: Откат системы стадий взросления
-- =============================================================

BEGIN;

ALTER TABLE users
  DROP COLUMN IF EXISTS pet_levels,
  DROP COLUMN IF EXISTS pet_stages,
  DROP COLUMN IF EXISTS last_daily_login;

COMMIT;
