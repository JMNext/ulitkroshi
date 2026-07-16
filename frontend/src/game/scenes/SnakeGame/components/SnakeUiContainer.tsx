import React, { useEffect, useState } from 'react';
import { GameHeaderUI } from '../../../../ui/components/GameHeader/GameHeaderUI';
import { MobileControlsUI } from '../../../../ui/components/MobileControls/MobileControls';

import { SnakePet } from './SnakePet';
import { useSnakeGameStore } from '../useSnakeGameStore';
import './SnakeGame.css';
import { GameOverModalUI } from '../../../../ui/components/GameOverModal/GameOverModalUI';

export interface ISnakeGameScene {
  score: number;
  changeDirection?: (dir: string) => void;
}

interface SnakeUiContainerProps {
  scene?: ISnakeGameScene;
  onBack: () => void;
  onRestart: () => void;
}

export const SnakeUiContainer = ({ scene, onBack, onRestart }: SnakeUiContainerProps) => {
  const score = useSnakeGameStore((state) => state.score);
  const isGameOver = useSnakeGameStore((state) => state.isGameOver);
  const setWash = useSnakeGameStore((state) => state.setWash);
  const setCrashed = useSnakeGameStore((state) => state.setCrashed);
  const resetStore = useSnakeGameStore((state) => state.resetStore);

  const [w, setW] = useState(window.innerWidth);

  useEffect(() => {
    let timeoutId: number;
    const res = () => {
      window.cancelAnimationFrame(timeoutId);
      timeoutId = window.requestAnimationFrame(() => setW(window.innerWidth));
    };
    window.addEventListener('resize', res, { passive: true });
    return () => {
      window.cancelAnimationFrame(timeoutId);
      window.removeEventListener('resize', res);
    };
  }, []);

  useEffect(() => {
    return () => resetStore();
  }, [resetStore]);

  const isPort = w < window.innerHeight;
  const isFold = isPort && w / window.innerHeight < 0.5;
  const isTab = !isPort && w / window.innerHeight < 1.72;

  const ctrlStyle: React.CSSProperties = isPort
    ? {
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: isFold ? '15px' : '30px',
        zIndex: 50,
        scale: isFold ? '0.85' : '1.0',
      }
    : {
        position: 'fixed',
        right: isTab ? '5%' : '10%',
        bottom: isTab ? '40px' : '60px',
        zIndex: 50,
        scale: isTab ? '0.85' : '1.0',
      };

  const isWin = score >= 20;

  const handleExit = () => {
    resetStore();
    onBack();
  };

  const handleRestart = () => {
    resetStore();
    onRestart();
  };

  return (
    <div className="snake-game-ui-wrapper">
      <div className="memory-grid-visual-anchor" />

      <GameHeaderUI
        score={score}
        onBack={handleExit}
      />

      <SnakePet
        onEnded={() => setWash(false)}
        onCrashEnded={() => setCrashed(false)}
      />

      <div style={ctrlStyle} className="pointer-events-auto">
        <MobileControlsUI
          type="cross"
          onChangeDir={(dir: string | number) => scene?.changeDirection?.(String(dir))}
        />
      </div>

      {/* ИСПРАВЛЕНО: Заменили старый хардкод разметки на красивую переиспользуемую модалку финала */}
      {isGameOver && (
        <GameOverModalUI
          score={score}
          isWin={isWin}
          onRestart={handleRestart}
          onBack={handleExit}
        />
      )}
    </div>
  );
};
