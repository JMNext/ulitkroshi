import React, { useState, useEffect } from 'react';
import { MemoryPet } from './MemoryPet';
import { GameHeaderUI } from '../../../../ui/components/GameHeaderUI';

interface SharedGridConfig {
  topOffset: number;
  maxGridH: number;
  maxGridW: number;
}

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
}

interface MemoryUiContainerProps {
  scene?: IMemoryGameScene;
  onBack: () => void;
  bind: (
    setScoreCallback: React.Dispatch<React.SetStateAction<number>>, 
    setWashCallback: () => void
  ) => void;
}

export const getSharedMemoryGridConfig = (w: number, h: number): SharedGridConfig => {
  const isPort = w < h;
  const isTab = !isPort && (w / h) < 1.72;
  
  let topOffset = isPort ? Math.floor(h * 0.15) : 10;
  let maxGridH = isPort ? Math.floor(h * 0.52) : Math.floor(h * 0.8);
  let maxGridW = isPort ? Math.floor(w * 0.92) : Math.floor(w * 0.6);
  
  if (isTab) { 
    maxGridH = Math.floor(h * 0.68); 
    maxGridW = Math.floor(w * 0.55); 
  }
  
  return { topOffset, maxGridH, maxGridW };
};

export const MemoryUiContainer = ({ scene, onBack, bind }: MemoryUiContainerProps) => {
  const [score, setScore] = useState(scene?.matchesFound || 0);
  const [isWash, setIsWash] = useState(false);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    bind(setScore, () => setIsWash(true));
    
    let timeoutId: number;
    const res = () => {
      // Debounce ресайза во избежание микролагов в кадрах
      window.cancelAnimationFrame(timeoutId);
      timeoutId = window.requestAnimationFrame(() => {
        setDims({ w: window.innerWidth, h: window.innerHeight });
      });
    };
    
    window.addEventListener('resize', res, { passive: true });
    return () => {
      window.cancelAnimationFrame(timeoutId);
      window.removeEventListener('resize', res);
    };
  }, [bind]);

  const isPort = dims.w < dims.h;
  const isTab = !isPort && (dims.w / dims.h) < 1.72;
  const isFold = isPort && (dims.w / dims.h) < 0.5;
  const cfg = getSharedMemoryGridConfig(dims.w, dims.h);

  const phaserConfig = (scene && scene.cfgs && scene.difficulty)
    ? (scene.cfgs[scene.difficulty] || { rows: 4, cols: 4 })
    : { rows: 4, cols: 4 };
    
  const { rows, cols } = phaserConfig;

  const size = Math.min(Math.floor(cfg.maxGridW / cols), Math.floor(cfg.maxGridH / rows));
  const gridHeight = rows * size;
  
  const gridBottomY = (isPort 
    ? cfg.topOffset + (cfg.maxGridH - gridHeight) / 2 
    : (dims.h - gridHeight) / 2) + gridHeight;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <GameHeaderUI score={score} onBack={onBack} />
      <MemoryPet 
        isWash={isWash} 
        onEnded={() => setIsWash(false)} 
        gridBottomY={gridBottomY} 
        dimensions={dims} 
        isPort={isPort} 
        isLandscapeTablet={isTab} 
        isUltraNarrow={isFold} 
      />
    </div>
  );
};
