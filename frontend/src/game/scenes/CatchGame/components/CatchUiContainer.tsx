import React, { useState, useEffect } from 'react';
import { GameHeaderUI } from '../../../../ui/components/GameHeaderUI';

interface CatchUiContainerProps {
  scene?: { score?: number };
  onBack: () => void;
  bind: (callback: (score: number, hp: number) => void) => void;
}

export const CatchUiContainer = ({ scene, onBack, bind }: CatchUiContainerProps) => {
  const [score, setScore] = useState(scene?.score ?? 0);

  useEffect(() => {
    bind((currentScore) => setScore(currentScore));
  }, [bind]);

  return (
    <div className="fixed inset-0 pointer-events-none h-screen z-30 flex flex-col justify-between">
      <GameHeaderUI score={score} onBack={onBack} />
    </div>
  );
};
