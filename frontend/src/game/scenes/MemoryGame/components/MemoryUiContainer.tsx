import React, { useEffect } from 'react';
import { GameHeaderUI } from '../../../../ui/components/GameHeader/GameHeaderUI';
import { MemoryPet } from './MemoryPet';
import { useMemoryGameStore } from '../useMemoryGameStore';
import './MemoryGameUI.css';
import { GameOverModalUI } from '../../../../ui/components/GameOverModal/GameOverModalUI';

interface PhaserDifficultyConfig {
  rows: number;
  cols: number;
  pairs: number;
  shuffleCount: number;
}

export interface IMemoryGameScene {
  matchesFound: number;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  cfgs?: Record<string, PhaserDifficultyConfig>;
  scene: {
    key: string;
    restart: () => void;
  };
}

interface MemoryUiContainerProps {
  scene?: IMemoryGameScene; // Вернули scene в пропсы, чтобы дергать рестарт
  onBack: () => void;
}

export const MemoryUiContainer = ({ scene, onBack }: MemoryUiContainerProps) => {
  const score = useMemoryGameStore((state) => state.score);
  const isGameOver = useMemoryGameStore((state) => state.isGameOver);
  const resetStore = useMemoryGameStore((state) => state.resetStore);
  const setWash = useMemoryGameStore((state) => state.setWash);

  // Сбрасываем стейт игры при демонтаже экрана
  useEffect(() => {
    return () => resetStore();
  }, [resetStore]);

  const handleExit = () => {
    resetStore();
    onBack();
  };

  const handleRestart = () => {
    resetStore();
    scene?.scene?.restart(); // Вызываем оригинальный рестарт сцены Phaser
  };

  return (
    <div className="memory-game-ui-wrapper">
      <GameHeaderUI
        score={score}
        onBack={handleExit}
      />

      <div className="memory-grid-visual-anchor">
        <MemoryPet
          onEnded={() => setWash(false)}
        />
      </div>

      {/* ИСПРАВЛЕНО: Заменили старую разметку на красивую переиспользуемую модалку финала */}
      {isGameOver && (
        <GameOverModalUI
          score={score}
          isWin={true}
          onRestart={handleRestart}
          onBack={handleExit}
        />
      )}
    </div>
  );
};
