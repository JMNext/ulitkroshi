/**
 * growth.config.ts — Конфигурация системы стадий взросления персонажа.
 *
 * ВАЖНО: Этот файл является единственным источником истины для таблицы уровней,
 * XP-наград и скоростей убывания шкал. Дублируется на фронтенде как
 * frontend/src/shared/growth.config.ts — оба файла должны быть синхронизированы.
 */

// ============================================================
// Типы
// ============================================================

/** Стадия взросления персонажа */
export type PetStage = 'baby' | 'teen' | 'adult';

/** Конфигурация одного уровня */
export interface LevelConfig {
  level: number;
  stage: PetStage;
  /** Минимальный суммарный XP для этого уровня */
  cumulativeXp: number;
}

// ============================================================
// Таблица уровней (из ТЗ, раздел 5.3)
// ============================================================

/** Уровни 1–30 по точным данным ТЗ */
export const LEVEL_TABLE: LevelConfig[] = [
  // --- Baby (уровни 1–5, итог 150 XP для перехода) ---
  { level: 1,  stage: 'baby', cumulativeXp: 0 },
  { level: 2,  stage: 'baby', cumulativeXp: 25 },
  { level: 3,  stage: 'baby', cumulativeXp: 50 },
  { level: 4,  stage: 'baby', cumulativeXp: 75 },
  { level: 5,  stage: 'baby', cumulativeXp: 110 },

  // --- Teen (уровни 6–15, итог 1500 XP для перехода) ---
  { level: 6,  stage: 'teen', cumulativeXp: 150 },
  { level: 7,  stage: 'teen', cumulativeXp: 300 },
  { level: 8,  stage: 'teen', cumulativeXp: 500 },
  { level: 9,  stage: 'teen', cumulativeXp: 650 },
  { level: 10, stage: 'teen', cumulativeXp: 800 },
  { level: 11, stage: 'teen', cumulativeXp: 1000 },
  { level: 12, stage: 'teen', cumulativeXp: 1100 },
  { level: 13, stage: 'teen', cumulativeXp: 1200 },
  { level: 14, stage: 'teen', cumulativeXp: 1300 },
  { level: 15, stage: 'teen', cumulativeXp: 1400 },

  // --- Adult (уровни 16–30, шаг 300 XP) ---
  { level: 16, stage: 'adult', cumulativeXp: 1500 },
  { level: 17, stage: 'adult', cumulativeXp: 1800 },
  { level: 18, stage: 'adult', cumulativeXp: 2100 },
  { level: 19, stage: 'adult', cumulativeXp: 2400 },
  { level: 20, stage: 'adult', cumulativeXp: 2700 },
  { level: 21, stage: 'adult', cumulativeXp: 3000 },
  { level: 22, stage: 'adult', cumulativeXp: 3300 },
  { level: 23, stage: 'adult', cumulativeXp: 3600 },
  { level: 24, stage: 'adult', cumulativeXp: 3900 },
  { level: 25, stage: 'adult', cumulativeXp: 4200 },
  { level: 26, stage: 'adult', cumulativeXp: 4500 },
  { level: 27, stage: 'adult', cumulativeXp: 4800 },
  { level: 28, stage: 'adult', cumulativeXp: 5100 },
  { level: 29, stage: 'adult', cumulativeXp: 5400 },
  { level: 30, stage: 'adult', cumulativeXp: 5700 },
];

/** Максимальный уровень */
export const MAX_LEVEL = 100;

/** Шаг XP для уровней 31–100 */
export const XP_STEP_AFTER_30 = 300;

/** XP уровня 30 (база для расчёта 31+) */
const LEVEL_30_XP = 5700;

// ============================================================
// XP-награды за действия (из ТЗ, раздел 5.4)
// ============================================================

export interface StageXpRewards {
  feed: number;
  wash: number;
  sleep: number;
  play: number;
  miniGameRange: [number, number];
  /** XP-бонус за ежедневный первый вход (daily login bonus) */
  dailyLoginXp: number;
}

export const STAGE_XP_REWARDS: Record<PetStage, StageXpRewards> = {
  baby:  { feed: 15, wash: 10, sleep: 5,  play: 10, miniGameRange: [10, 30],  dailyLoginXp: 15 },
  teen:  { feed: 30, wash: 25, sleep: 20, play: 40, miniGameRange: [30, 50],  dailyLoginXp: 30 },
  adult: { feed: 50, wash: 40, sleep: 30, play: 60, miniGameRange: [50, 100], dailyLoginXp: 40 },
};

// ============================================================
// Скорости убывания шкал (из ТЗ, раздел 5.5)
// ============================================================

export interface StageDecayRates {
  /** Интервал убывания на 1 пункт при активной игре (мс) */
  activeDecayMs: number;
  /** Интервал убывания на 1 пункт в фоне (мс) */
  inactiveDecayMs: number;
}

export const STAGE_DECAY_RATES: Record<PetStage, StageDecayRates> = {
  baby:  { activeDecayMs: 600_000,  inactiveDecayMs: 7_200_000 },  // 10 мин / 2 часа
  teen:  { activeDecayMs: 300_000,  inactiveDecayMs: 3_600_000 },  // 5 мин / 1 час
  adult: { activeDecayMs: 240_000,  inactiveDecayMs: 1_800_000 },  // 4 мин / 30 мин
};

// ============================================================
// Масштабирование персонажа по стадии (CSS transform scale)
// ============================================================

/**
 * Коэффициент масштабирования относительно текущих Teen-ассетов.
 * После появления уникальных Baby/Adult ассетов — заменить на 1.0 для всех.
 */
export const STAGE_SCALE: Record<PetStage, number> = {
  baby:  0.55,  // ~55% от Teen
  teen:  1.0,   // Оригинальный размер текущих ассетов
  adult: 1.5,   // ~150% от Teen
};

// ============================================================
// Утилиты расчёта уровней
// ============================================================

/**
 * Определить уровень и стадию по суммарному накопленному XP.
 * Полностью реализует правила ТЗ для уровней 1–100.
 */
export function getLevelFromXp(totalXp: number): { level: number; stage: PetStage } {
  // Уровни 31+: линейный шаг 300 XP
  if (totalXp >= LEVEL_30_XP) {
    const extraXp = totalXp - LEVEL_30_XP;
    const extraLevels = Math.floor(extraXp / XP_STEP_AFTER_30);
    const level = Math.min(30 + extraLevels, MAX_LEVEL);
    return { level, stage: 'adult' };
  }

  // Уровни 1–30 по таблице (ищем последний уровень, где totalXp >= cumulativeXp)
  let result = LEVEL_TABLE[0];
  for (const entry of LEVEL_TABLE) {
    if (totalXp >= entry.cumulativeXp) {
      result = entry;
    } else {
      break;
    }
  }
  return { level: result.level, stage: result.stage };
}

/**
 * Рассчитать XP, необходимый до следующего уровня.
 * Возвращает 0, если достигнут максимальный уровень.
 */
export function getXpForNextLevel(totalXp: number): number {
  const { level } = getLevelFromXp(totalXp);

  if (level >= MAX_LEVEL) return 0;

  // Уровни 1–29: ищем следующую запись в таблице
  const next = LEVEL_TABLE.find((e) => e.level === level + 1);
  if (next) return Math.max(0, next.cumulativeXp - totalXp);

  // Уровни 30+: шаг 300 XP
  const extraLevels = level - 30 + 1;
  const nextCumulativeXp = LEVEL_30_XP + extraLevels * XP_STEP_AFTER_30;
  return Math.max(0, nextCumulativeXp - totalXp);
}

/**
 * Рассчитать XP текущего уровня (начало шкалы для данного уровня).
 */
export function getXpForCurrentLevel(totalXp: number): number {
  const { level } = getLevelFromXp(totalXp);

  if (level <= 1) return 0;

  const current = LEVEL_TABLE.find((e) => e.level === level);
  if (current) return current.cumulativeXp;

  // Уровни 31+
  return LEVEL_30_XP + (level - 30) * XP_STEP_AFTER_30;
}

/**
 * Проверить факт перехода стадии между двумя значениями XP.
 */
export function checkStageTransition(
  oldXp: number,
  newXp: number
): { transitioned: boolean; from?: PetStage; to?: PetStage } {
  const oldResult = getLevelFromXp(oldXp);
  const newResult = getLevelFromXp(newXp);

  if (oldResult.stage !== newResult.stage) {
    return { transitioned: true, from: oldResult.stage, to: newResult.stage };
  }
  return { transitioned: false };
}
