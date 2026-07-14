import React, { useState, useEffect } from 'react';
import { SnakePet } from './SnakePet';
import { GameHeaderUI } from '../../../../ui/components/GameHeaderUI';
import { MobileControlsUI } from '../../../../ui/components/MobileControls';

export interface ISnakeGameScene {
  score: number;
  changeDirection?: (dir: string) => void;
}

interface SnakeUiContainerProps {
  scene?: ISnakeGameScene;
  gridOffsetY: number;
  onBack: () => void;
  bind: (
    setScoreCallback: React.Dispatch<React.SetStateAction<number>>, 
    setWashCallback: () => void,
    setCrashCallback: () => void
  ) => void;
}

export const SnakeUiContainer = ({ scene, gridOffsetY, onBack, bind }: SnakeUiContainerProps) => {
  const [score, setScore] = useState(scene?.score || 0);
  const [isWash, setIsWash] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [w, setW] = useState(window.innerWidth);

  useEffect(() => {
    bind(
      setScore, 
      () => setIsWash(true),
      () => setIsCrashed(true)
    );
    
    let timeoutId: number;
    const res = () => {
      window.cancelAnimationFrame(timeoutId);
      timeoutId = window.requestAnimationFrame(() => {
        setW(window.innerWidth);
      });
    };
    
    window.addEventListener('resize', res, { passive: true });
    return () => {
      window.cancelAnimationFrame(timeoutId);
      window.removeEventListener('resize', res);
    };
  }, [bind]);

  const isPort = w < window.innerHeight;
  const isFold = isPort && (w / window.innerHeight) < 0.5;
  const isTab = !isPort && (w / window.innerHeight) < 1.72;

  const ctrlStyle: React.CSSProperties = isPort
    ? { position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: isFold ? '15px' : '30px', zIndex: 50, scale: isFold ? '0.85' : '1.0' }
    : { position: 'fixed', right: isTab ? '5%' : '10%', bottom: isTab ? '40px' : '60px', zIndex: 50, scale: isTab ? '0.85' : '1.0' };

  return (
    <>
      <GameHeaderUI score={score} onBack={onBack} />
      
      <SnakePet 
        isWash={isWash} 
        isCrashed={isCrashed}
        onEnded={() => setIsWash(false)} 
        onCrashEnded={() => setIsCrashed(false)}
        gridOffsetY={gridOffsetY} 
        isPort={isPort} 
        isTab={isTab} 
        isFold={isFold} 
      />
      
      <div style={ctrlStyle} className="pointer-events-auto">
        <MobileControlsUI 
          type="cross" 
          onChangeDir={(dir: string | number) => scene?.changeDirection?.(String(dir))} 
        />
      </div>
    </>
  );
};
