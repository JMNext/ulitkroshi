import React, { useMemo } from 'react';
import { usePetStore } from '../PetCharacter/store/usePetStore';
import {
  MAX_LEVEL,
  getXpForNextLevel,
  getXpForCurrentLevel,
  PetStage,
} from '@/shared/growth.config';
import styles from './ExperienceBar.module.css';

const STAGE_LABELS: Record<PetStage, string> = {
  baby: 'Малыш',
  teen: 'Подросток',
  adult: 'Взрослый',
};

const STAGE_COLORS: Record<PetStage, string> = {
  baby: '#FF8A00',
  teen: '#0284c7',
  adult: '#16a34a',
};

const ExperienceBar: React.FC = () => {
  const experience = usePetStore((s) => s.experience);
  const level = usePetStore((s) => s.level);
  const stage = (usePetStore((s) => s.stage) || 'baby') as PetStage;

  const xpForNext = getXpForNextLevel(experience);
  const xpCurrentLevelBase = getXpForCurrentLevel(experience);
  const xpInCurrentLevel = experience - xpCurrentLevelBase;
  const xpSpanForLevel = xpInCurrentLevel + xpForNext;

  const fillPercent = useMemo(() => {
    if (level >= MAX_LEVEL) return 100;
    if (xpSpanForLevel <= 0) return 0;
    return Math.min(100, Math.max(0, (xpInCurrentLevel / xpSpanForLevel) * 100));
  }, [level, xpInCurrentLevel, xpSpanForLevel]);

  const stageLabel = STAGE_LABELS[stage] || 'Малыш';
  const stageColor = STAGE_COLORS[stage] || '#FF8A00';

  // Сколько осталось до следующей стадии (если еще не взрослая)
  const nextStageInfo = useMemo(() => {
    if (stage === 'baby') {
      const remaining = Math.max(0, 150 - experience);
      return `До «Подростка»: ${remaining} XP`;
    }
    if (stage === 'teen') {
      const remaining = Math.max(0, 1500 - experience);
      return `До «Взрослого»: ${remaining} XP`;
    }
    return null;
  }, [stage, experience]);

  return (
    <div className={styles.container}>
      {/* Верхняя строка: Уровень, Стадия и XP */}
      <div className={styles.headerRow}>
        <div className={styles.badgeGroup}>
          <span
            className={styles.stageBadge}
            style={{ backgroundColor: stageColor }}
          >
            {stageLabel}
          </span>
          <span className={styles.levelTitle}>
            Уровень {level}
          </span>
        </div>

        <div className={styles.xpCount}>
          <span className={styles.xpCurrent}>{xpInCurrentLevel}</span>
          <span className={styles.xpDivider}>/</span>
          <span className={styles.xpTotal}>
            {level >= MAX_LEVEL ? 'MAX' : `${xpSpanForLevel} XP`}
          </span>
        </div>
      </div>

      {/* Шкала прогресса */}
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {/* Нижняя строка: До след. уровня и стадии */}
      <div className={styles.footerRow}>
        {level < MAX_LEVEL ? (
          <span className={styles.nextLevelHint}>
            До след. уровня: <strong>{xpForNext} XP</strong>
          </span>
        ) : (
          <span className={styles.maxLevelHint}>⭐ Максимальный уровень!</span>
        )}

        {nextStageInfo && (
          <span className={styles.nextStageHint}>
            {nextStageInfo}
          </span>
        )}
      </div>
    </div>
  );
};

export default ExperienceBar;
