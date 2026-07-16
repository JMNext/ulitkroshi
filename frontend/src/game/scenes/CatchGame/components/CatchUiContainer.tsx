import React, { useEffect } from 'react';
import { GameHeaderUI } from '../../../../ui/components/GameHeader/GameHeaderUI';

import { useCatchGameStore } from '../useCatchGameStore';
import './CatchGame.css';
import { GameOverModalUI } from '../../../../ui/components/GameOverModal/GameOverModalUI';

interface CatchUiContainerProps {
  onBack: () => void;
  onRestart: () => void;
}

export const CatchUiContainer = ({ onBack, onRestart }: CatchUiContainerProps) => {
  const score = useCatchGameStore((state) => state.score);
  const isGameOver = useCatchGameStore((state) => state.isGameOver);
  const resetStore = useCatchGameStore((state) => state.resetStore);

  useEffect(() => {
    return () => resetStore();
  }, [resetStore]);

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
    <>
      <div className="catch-ui-layout">
        <div className="catch-ui-interactive-wrap">
          <GameHeaderUI
            score={score}
            onBack={handleExit}
          />
        </div>
      </div>

      {/* ИСПРАВЛЕНО: Заменили старый хардкод разметки на красивую модалку финала */}
      {isGameOver && (
        <GameOverModalUI
          score={score}
          isWin={isWin}
          onRestart={handleRestart}
          onBack={handleExit}
        />
      )}
    </>
  );
};
