import React, { useState } from 'react';
import { Button } from 'antd';
import './MinigameModalUI.css';

interface GameItem {
  text: string;
  scene: string;
  icon: 'memory' | 'catch' | 'snake';
}

interface DiffItem {
  text: string;
  diff: string;
  colorClass: string;
}

interface GameMenuProps {
  onStartGame: (scene: string, difficulty: string) => void;
}

type MenuView = 'main' | 'difficulty';

const ICONS = {
  memory: (
    <svg className="w-full h-full text-white block" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
    </svg>
  ),
  catch: (
    <svg className="w-full h-full text-white block" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 10c0-4.42-3.58-8-8-8s-8 3.58-8 8c0 3.82 2.66 7.02 6.21 7.82-.41.68-.41 1.52 0 2.2a8.003 8.003 0 0 0 11.58-7.82c0-.7-.1-1.38-.21-2.02M12 4c3.31 0 6 2.69 6 6 0 2.45-1.48 4.56-3.6 5.47-.4-.84-.4-1.84 0-2.68C15.82 11.75 17 10 17 10s-1.75.05-2.73.57c-.85.45-1.88.42-2.7 0C10.58 10.05 9 10 9 10s1.18 1.75 2.52 2.79c.42.84.42 1.84 0 2.68C9.4 14.56 8 12.45 8 10c0-3.31 2.69-6 6-6z" />
    </svg>
  ),
  snake: (
    <svg className="w-full h-full text-white block" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
};

export const GameMenu = ({ onStartGame }: GameMenuProps) => {
  const [view, setView] = useState<MenuView>('main');
  const [selectedScene, setSelectedScene] = useState<string>('');

  const games: GameItem[] = [
    { text: 'НАЙДИ ПАРУ', scene: 'MemoryGameScene', icon: 'memory' },
    { text: 'ЛОВЛЯ ФРУКТОВ', scene: 'CatchGameScene', icon: 'catch' },
    { text: 'ЗМЕЙКА', scene: 'SnakeGameScene', icon: 'snake' },
  ];

  const modes: DiffItem[] = [
    { text: 'ЛЕГКО', diff: 'easy', colorClass: 'is-green' },
    { text: 'НОРМАЛЬНО', diff: 'medium', colorClass: 'is-yellow' },
    { text: 'СЛОЖНО', diff: 'hard', colorClass: 'is-red' },
  ];

  const handleGameSelect = (scene: string) => {
    setSelectedScene(scene);
    setView('difficulty');
  };

  const handleDifficultySelect = (difficulty: string) => {
    onStartGame(selectedScene, difficulty);
    setView('main');
  };

  return (
    <div className="minigame-modal-menu-wrapper">
      <header className="minigame-modal-menu-header">
        {view === 'difficulty' && (
          /* ИСПРАВЛЕНО: Вернули нативный тег кнопки для стрелки, чтобы абсолютное позиционирование работало железно */
          <button
            type="button"
            onClick={() => setView('main')}
            className="minigame-modal-nav-btn is-back-arrow"
          >
            ←
          </button>
        )}
        <h2 className="minigame-modal-main-title">
          {view === 'main' ? 'МИНИ-ИГРЫ' : 'СЛОЖНОСТЬ'}
        </h2>
      </header>

      <section className="minigame-modal-content-grid">
        {view === 'main'
          ? games.map((game) => (
              <Button
                key={game.scene}
                type="primary"
                block
                onClick={() => handleGameSelect(game.scene)}
                className="minigame-modal-action-row-btn is-green"
              >
                <div className="minigame-modal-btn-icon-absolute">
                  {ICONS[game.icon]}
                </div>
                <span className="minigame-modal-btn-text-centered">{game.text}</span>
              </Button>
            ))
          : modes.map((mode) => (
              <Button
                key={mode.diff}
                type="primary"
                block
                onClick={() => handleDifficultySelect(mode.diff)}
                className={`minigame-modal-action-row-btn ${mode.colorClass}`}
              >
                <span className="minigame-modal-btn-text-centered">{mode.text}</span>
              </Button>
            ))}
      </section>
    </div>
  );
};
