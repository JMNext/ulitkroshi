import React, { useRef, useEffect } from 'react';
import petIdleVideo from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import petPlayVideo from '/src/assets/resources/1stpet-animation/play-converted.webm';

interface MemoryPetProps {
  isWash: boolean;
  onEnded: () => void;
  gridBottomY: number;
  dimensions: { h: number; w: number };
  isPort: boolean;
  isLandscapeTablet: boolean;
  isUltraNarrow: boolean;
}

export const MemoryPet = ({ 
  isWash, 
  onEnded, 
  gridBottomY, 
  dimensions, 
  isPort, 
  isLandscapeTablet, 
  isUltraNarrow 
}: MemoryPetProps) => {
  const vIdle = useRef<HTMLVideoElement>(null);
  const vPlay = useRef<HTMLVideoElement>(null);

  const size = isUltraNarrow 
    ? 110 
    : (isPort ? Math.max(140, Math.min(200, Math.floor(dimensions.h * 0.16))) : 130);

  useEffect(() => { 
    if (isWash) { 
      vIdle.current?.pause();
      vPlay.current?.play().catch(() => {}); 
    } 
  }, [isWash]);

  const containerStyle: React.CSSProperties = isPort 
    ? { position: 'absolute', insetInline: 0, top: `${gridBottomY + 8}px`, display: 'flex', justifyContent: 'center', zIndex: 40 } 
    : { position: 'absolute', left: isLandscapeTablet ? '4vw' : 'calc(20vw - 100px)', bottom: isLandscapeTablet ? '35px' : '50px', zIndex: 40 };

  const wrapperStyle: React.CSSProperties = isPort 
    ? { width: size, height: size } 
    : { width: isLandscapeTablet ? '130px' : '30vw', height: isLandscapeTablet ? '130px' : '30vw', minWidth: '140px', maxWidth: '280px' };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <video 
          ref={vIdle} 
          src={petIdleVideo} 
          muted 
          playsInline 
          autoPlay 
          loop 
          style={{ display: isWash ? 'none' : 'block', width: '100%', height: '100%', objectFit: 'contain' }} 
        />
        <video 
          ref={vPlay} 
          src={petPlayVideo} 
          muted 
          playsInline 
          onEnded={onEnded} 
          style={{ display: isWash ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      </div>
    </div>
  );
};
