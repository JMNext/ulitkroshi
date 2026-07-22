import { useEffect, useState, useRef } from 'react';
import React from 'react';
import begemotImg from '../../../../assets/login_assets/begemot.png';

interface LoginLoaderProps {
  onComplete: () => void;
}

export const LoginLoader = ({ onComplete }: LoginLoaderProps) => {
  const [progress, setProgress] = useState<number>(0);
  const onCompleteRef = useRef<() => void>(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let timeoutId: number;
    
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 0.015, 1);
        if (next >= 1) {
          window.clearInterval(interval);
          timeoutId = window.setTimeout(() => {
            onCompleteRef.current();
          }, 50);
        }
        return next;
      });
    }, 16);
    return () => {
      window.clearInterval(interval);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  const progressPercent: number = progress * 100;
  const rotationDegrees: number = Math.sin(progress * 30) * 6;

  return (
    <div className="p-1 rounded-full shadow-xl flex items-center pointer-events-auto box-border select-none origin-bottom border border-solid border-slate-200/30 bg-white/95 w-[340px] h-[36px]">
      <div className="w-full h-full rounded-full p-[3px] relative overflow-visible flex items-center bg-[#ede9e6]">
        
        <div className="w-full h-6 rounded-full overflow-hidden bg-transparent">
          <div 
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[#f9b300] rounded-full transition-none"
          />
        </div>

        <div
          style={{
            left: `${progressPercent}%`,
            transform: `translate(-50%, -50%) rotate(${rotationDegrees}deg)`
          }}
          className="flex items-center justify-center z-10 absolute will-change-transform top-1/2 w-[56px] h-[56px]"
        >
          <img 
            src={begemotImg} 
            alt="Бегемотик" 
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

      </div>
    </div>
  );
};
