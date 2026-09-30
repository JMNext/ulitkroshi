/**
 * StageTransitionOverlay.tsx — Полноэкранный оверлей анимации перехода стадии.
 *
 * Блокирует UI на 4 секунды при переходе Baby→Teen или Teen→Adult.
 * Слушает DOM-событие "stage_transition" испускаемое pet.slice.ts.
 */

import React, { useEffect, useState, useCallback } from 'react';
import styles from './StageTransitionOverlay.module.css';

interface TransitionData {
  from: string;
  to: string;
}

const STAGE_LABELS: Record<string, string> = {
  baby:  'Малыш',
  teen:  'Подросток',
  adult: 'Взрослый',
};

const STAGE_COLORS: Record<string, string> = {
  baby:  '#FF9547',
  teen:  '#47B8FF',
  adult: '#47E06A',
};

const STAGE_EMOJIS: Record<string, string> = {
  baby:  '🥚',
  teen:  '🌱',
  adult: '✨',
};

const StageTransitionOverlay: React.FC = () => {
  const [transition, setTransition] = useState<TransitionData | null>(null);
  const [visible, setVisible] = useState(false);

  const handleTransition = useCallback((e: Event) => {
    const detail = (e as CustomEvent<TransitionData>).detail;
    if (!detail?.from || !detail?.to) return;

    setTransition(detail);
    setVisible(true);

    // Автоскрытие через 4 секунды
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => setTransition(null), 400); // после анимации выхода
    }, 4000);
  }, []);

  useEffect(() => {
    window.addEventListener('stage_transition', handleTransition);
    return () => window.removeEventListener('stage_transition', handleTransition);
  }, [handleTransition]);

  if (!transition) return null;

  const toColor = STAGE_COLORS[transition.to] || '#fff';
  const toLabel = STAGE_LABELS[transition.to] || transition.to;
  const toEmoji = STAGE_EMOJIS[transition.to] || '🎉';

  return (
    <div
      className={`${styles.overlay} ${visible ? styles.visible : styles.hidden}`}
      style={{ '--accent': toColor } as React.CSSProperties}
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={styles.content}>
        <div className={styles.emoji}>{toEmoji}</div>
        <h2 className={styles.title}>Твой питомец подрос!</h2>
        <p className={styles.stage}>
          Теперь он&nbsp;
          <span style={{ color: toColor }}>{toLabel}</span>
        </p>
        <div className={styles.sparkles}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={styles.sparkle}
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StageTransitionOverlay;
