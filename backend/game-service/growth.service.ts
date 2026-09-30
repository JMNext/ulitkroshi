/**
 * growth.service.ts — Серверная авторитетность: начисление XP и расчёт стадий.
 *
 * Античит-принцип: клиент сообщает только тип действия и petIndex.
 * Сервер самостоятельно рассчитывает награду и новое состояние.
 */

import { dbPool as pool } from '../shared/db';
import {
  getLevelFromXp,
  checkStageTransition,
  STAGE_XP_REWARDS,
  PetStage,
} from '../shared/growth.config';

export type XpAction = 'feed' | 'wash' | 'sleep' | 'play' | 'mini_game' | 'daily_login';

export interface GainXpResult {
  newXp: number;
  newLevel: number;
  newStage: PetStage;
  xpGained: number;
  stageTransition: { from: PetStage; to: PetStage } | null;
}

export async function gainXp(
  userId: number,
  petIndex: number,
  action: XpAction,
  miniGameScore?: number
): Promise<GainXpResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Получаем актуальные данные под блокировкой (защита от race conditions)
    const { rows } = await client.query<{
      pet_experiences: number[];
      pet_levels: number[];
      pet_stages: string[];
      last_daily_login: string | null;
    }>(
      `SELECT pet_experiences, pet_levels, pet_stages, last_daily_login
       FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );

    if (!rows.length) {
      await client.query('ROLLBACK');
      throw new Error(`User ${userId} not found`);
    }

    const user = rows[0];
    const experiences: number[] = [...(user.pet_experiences || [0])];
    const levels: number[]      = [...(user.pet_levels     || [1])];
    const stages: string[]      = [...(user.pet_stages     || ['baby'])];

    // Убеждаемся, что массивы достаточной длины (для нового питомца)
    while (experiences.length <= petIndex) experiences.push(0);
    while (levels.length      <= petIndex) levels.push(1);
    while (stages.length      <= petIndex) stages.push('baby');

    const currentXp    = experiences[petIndex] ?? 0;
    const currentStage = (stages[petIndex] ?? 'baby') as PetStage;
    const rewards      = STAGE_XP_REWARDS[currentStage];

    // 2. Рассчитываем размер награды
    let xpGain = 0;

    if (action === 'daily_login') {
      // Бонус за первый вход дня (только один раз)
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      if (user.last_daily_login === today) {
        // Уже получил сегодня — без начисления
        await client.query('ROLLBACK');
        return {
          newXp: currentXp,
          newLevel: levels[petIndex] ?? 1,
          newStage: currentStage,
          xpGained: 0,
          stageTransition: null,
        };
      }
      xpGain = rewards.dailyLoginXp;
      await client.query(
        'UPDATE users SET last_daily_login = $1 WHERE id = $2',
        [today, userId]
      );
    } else if (action === 'mini_game') {
      // XP за мини-игру: зависит от score и стадии
      const [min, max] = rewards.miniGameRange;
      const score = Math.max(0, miniGameScore ?? 0);
      // Линейное масштабирование: 0–1000 очков → min–max XP
      const ratio  = Math.min(score / 1000, 1);
      xpGain = Math.round(min + (max - min) * ratio);
    } else {
      xpGain = rewards[action as keyof typeof rewards] as number ?? 0;
    }

    // 3. Применяем начисление XP
    const newXp = currentXp + xpGain;
    const { level: newLevel, stage: newStage } = getLevelFromXp(newXp);
    const transition = checkStageTransition(currentXp, newXp);

    // 4. Обновляем массивы
    experiences[petIndex] = newXp;
    levels[petIndex]      = newLevel;
    stages[petIndex]      = newStage;

    await client.query(
      `UPDATE users
       SET pet_experiences = $1,
           pet_levels      = $2,
           pet_stages      = $3
       WHERE id = $4`,
      [experiences, levels, stages, userId]
    );

    await client.query('COMMIT');

    return {
      newXp,
      newLevel,
      newStage,
      xpGained: xpGain,
      stageTransition: transition.transitioned
        ? { from: transition.from!, to: transition.to! }
        : null,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
