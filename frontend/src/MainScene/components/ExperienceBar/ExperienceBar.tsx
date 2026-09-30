/**
 * ExperienceBar.tsx — Горизонтальная шкала опыта персонажа.
 *
 * Визуал по макету image2.png:
 * - Три цветовых сектора: оранжевый (Baby), синий (Teen), зелёный (Adult)
 * - Пунктирные разделители стадий
 * - Маркеры уровней (золотые — пройденные, серые — будущие)
 * - Золотисто-жёлтый градиент заливки текущего прогресса
 * - Информационная строка: Уровень N • XP / YYY XP • До следующего: Z XP
 */

import React, { useMemo } from 'react';
import { usePetStore } from '../PetCharacter/store/usePetStore';
import {
  LEVEL_TABLE,
  MAX_LEVEL,
  getLevelFromXp,
  getXpForNextLevel,
  getXpForCurrentLevel,
} from '@/shared/growth.config';
import styles from './ExperienceBar.module.css';

// XP, при котором персонаж становится взрослым (level 16)
const TOTAL_XP_RANGE = 5700 + 300 * 70; // до уровня 100

// Цвета секторов по стадии
const STAGE_COLORS = {
  baby:  '#FF9547',
  teen:  '#47B8FF',
  adult: '#47E06A',
};

// Позиции начала каждой стадии в процентах от полной шкалы (упрощённо для отображения)
// Максимум уровня 30 = 5700 XP, показываем только до 30 уровня в пропорции
const DISPLAY_MAX_XP = 5700; // Всё после Adult 30+ — одна зона

const getPercent = (xp: number) => Math.min((xp / DISPLAY_MAX_XP) * 100, 100);

// Стейджные границы на шкале
const STAGE_BREAKS = [
  { xp: 150,  label: 'Стадия 2\nПодросток', color: STAGE_COLORS.teen  },
  { xp: 1500, label: 'Стадия 3\nВзрослый',  color: STAGE_COLORS.adult },
];

const ExperienceBar: React.FC = () => {
  const experience = usePetStore((s) => s.experience);
  const level      = usePetStore((s) => s.level);
  const stage      = usePetStore((s) => s.stage);

  const xpForNext    = getXpForNextLevel(experience);
  const xpForCurrent = getXpForCurrentLevel(experience);
  const xpInLevel    = experience - xpForCurrent;
  const xpNeededThisLevel = xpForNext > 0 ? xpInLevel + xpForNext : 0;

  // Процент заполнения общей шкалы
  const fillPercent = useMemo(() => getPercent(experience), [experience]);

  // Маркеры уровней (1–30 по таблице)
  const levelMarkers = useMemo(() => {
    return LEVEL_TABLE.map((entry) => ({
      level: entry.level,
      stage: entry.stage,
      percent: getPercent(entry.cumulativeXp),
      passed: experience >= entry.cumulativeXp,
    }));
  }, [experience]);

  const stageColor = STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || STAGE_COLORS.baby;

  return (
    <div className={styles.wrapper}>
      {/* Шкала */}
      <div className={styles.track}>
        {/* Градиентная заливка прогресса */}
        <div
          className={styles.fill}
          style={{ width: `${fillPercent}%` }}
          aria-label={`Прогресс: ${experience} XP`}
        />

        {/* Маркеры уровней */}
        {levelMarkers.map((m) => (
          <div
            key={m.level}
            className={`${styles.levelMarker} ${m.passed ? styles.passed : styles.future}`}
            style={{ left: `${m.percent}%` }}
            title={`Уровень ${m.level}`}
          />
        ))}

        {/* Разделители стадий */}
        {STAGE_BREAKS.map((b) => (
          <div
            key={b.xp}
            className={styles.stageBreak}
            style={{ left: `${getPercent(b.xp)}%`, borderColor: b.color }}
            title={b.label}
          />
        ))}
      </div>

      {/* Информационная строка */}
      <div className={styles.info}>
        <span className={styles.levelText} style={{ color: stageColor }}>
          Уровень {level}
        </span>
        <span className={styles.dot}>•</span>
        <span className={styles.xpText}>
          {experience.toLocaleString()} XP
        </span>
        {xpForNext > 0 && (
          <>
            <span className={styles.dot}>•</span>
            <span className={styles.nextText}>
              До след. уровня: {xpForNext.toLocaleString()} XP
            </span>
          </>
        )}
        {level >= MAX_LEVEL && (
          <>
            <span className={styles.dot}>•</span>
            <span className={styles.maxText}>Максимальный уровень!</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ExperienceBar;
