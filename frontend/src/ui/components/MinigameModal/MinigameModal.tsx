import React, { useState } from 'react';
import { GameButton } from './GameButton';
import { GAMES, MODES } from './games.constants';

interface MinigameModalProps {
  onClose: () => void;
  onStartGame: (selectedScene: string, difficulty: string) => void;
  screenType?: 'desktop' | 'square' | 'portrait' | 'lowLandscape';
}

export const MinigameModal = ({ onClose, onStartGame, screenType = 'desktop' }: MinigameModalProps) => {
  const [view, setView] = useState<'main' | 'difficulty'>('main');
  const [selectedScene, setSelectedScene] = useState<string>('');

  const handleSelectMode = (difficulty: string) => {
    setView('main');
    onStartGame(selectedScene, difficulty);
  };

  const greenGradient = { background: 'linear-gradient(to bottom, #4caf50, #2e7d32)', color: '#ffffff' };
  const yellowGradient = { background: 'linear-gradient(to bottom, #ffd54f, #ffb300)', color: '#0f172a' };
  const redGradient = { background: 'linear-gradient(to bottom, #e63254, #d32f2f)', color: '#ffffff' };

  // Адаптивная конфигурация внутренних размеров
  const isLow = screenType === 'lowLandscape';
  const modalStyles = isLow 
    ? { width: '380px', padding: '20px 16px 18px 16px', gap: '10px', titleSize: 'text-xl', btnHeight: 46 }
    : { width: '100%', padding: '32px 24px 28px 24px', gap: '14px', titleSize: 'text-2xl', btnHeight: 60 };

  return (
    <div 
      style={{ width: isLow ? modalStyles.width : undefined, padding: modalStyles.padding }}
      className="w-full md:w-[440px] rounded-[32px] border-4 border-solid border-[#ffca28] bg-white box-border flex flex-col items-center relative select-none max-w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        type="button" 
        onClick={onClose} 
        className={`absolute text-slate-400 hover:text-slate-600 transition-colors \!font-black bg-transparent border-none right-5 z-50 cursor-pointer text-2xl outline-none ${isLow ? 'top-3' : 'top-4'}`}
      >
        ✕
      </button>

      <header className={`w-full relative flex items-center justify-center px-6 min-h-[32px] ${isLow ? 'mb-3' : 'mb-6'}`}>
        {view === 'difficulty' && (
          <button 
            type="button" 
            onClick={() => setView('main')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none \!font-black z-50 flex items-center justify-center cursor-pointer text-2xl outline-none"
          >
            ←
          </button>
        )}
        <h2 className={`text-[#1a3d1c] \!font-black tracking-wide text-center uppercase m-0 ${modalStyles.titleSize}`}>
          {view === 'main' ? 'МИНИ-ИГРЫ' : 'СЛОЖНОСТЬ'}
        </h2>
      </header>

      <section style={{ gap: modalStyles.gap }} className="w-full flex flex-col items-center">
        {view === 'main'
          ? GAMES.map((game) => (
              <GameButton
                key={game.scene}
                text={game.text}
                height={modalStyles.btnHeight}
                onClick={() => { setSelectedScene(game.scene); setView('difficulty'); }}
                gradientStyle={greenGradient}
                buttonIcon={game.icon}
              />
            ))
          : MODES.map((mode) => (
              <GameButton
                key={mode.diff}
                text={mode.text}
                height={modalStyles.btnHeight}
                onClick={() => handleSelectMode(mode.diff)}
                gradientStyle={
                  mode.diff === 'easy' ? greenGradient : 
                  mode.diff === 'medium' ? yellowGradient : redGradient
                }
              />
            ))}
      </section>
    </div>
  );
};
