import React, { MouseEvent } from 'react';
import './GameHeaderUI.css';

interface GameHeaderUIProps {
  score: number;
  scoreLabel?: string;
  onBack: () => void;
}

export const GameHeaderUI = ({ score, scoreLabel, onBack }: GameHeaderUIProps) => {
  const isMemoryGame = typeof window !== 'undefined' && window.location.href.includes('memory');
  const finalLabel = scoreLabel || (isMemoryGame ? 'ПАРА' : 'СЧЕТ');

  const handleBackClick = (event: MouseEvent<HTMLButtonElement>) => {
    onBack();
  };

  return (
    <header className="game-header-bar-wrapper">
      <button
        type="button"
        onClick={handleBackClick}
        className="game-header-back-btn"
      >
        <span className="block">← НАЗАД</span>
      </button>

      <div className="game-header-score-badge">
        <p className="game-header-score-label">{finalLabel}:</p>
        <p className="game-header-score-value">{score}</p>
      </div>
    </header>
  );
};
