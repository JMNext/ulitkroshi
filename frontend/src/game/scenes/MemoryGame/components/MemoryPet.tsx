import React, { useRef, useEffect } from 'react';
import petIdleVideo from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import petPlayVideo from '/src/assets/resources/1stpet-animation/play-converted.webm';
import { useMemoryGameStore } from '../useMemoryGameStore';

interface MemoryPetProps {
  onEnded: () => void;
}

export const MemoryPet = ({ onEnded }: MemoryPetProps) => {
  const vIdle = useRef<HTMLVideoElement>(null);
  const vPlay = useRef<HTMLVideoElement>(null);

  const isWash = useMemoryGameStore((state) => state.isWash);

  useEffect(() => { 
    if (isWash) { 
      if (vIdle.current) vIdle.current.pause();
      if (vPlay.current) {
        vPlay.current.currentTime = 0;
        vPlay.current.play().catch((err) => console.warn("Play block:", err)); 
      }
    } else {
      if (vPlay.current) vPlay.current.pause();
      if (vIdle.current) vIdle.current.play().catch((err) => console.warn("Idle block:", err));
    }
  }, [isWash]);

  return (
    <div className="memory-pet-layout-box">
      <div className="pet-character-sprite-wrap">
        <video 
          ref={vIdle} 
          src={petIdleVideo} 
          muted 
          playsInline 
          autoPlay 
          loop 
          className="pet-video-render"
          style={{ display: isWash ? 'none' : 'block' }} 
        />
        <video 
          ref={vPlay} 
          src={petPlayVideo} 
          muted 
          playsInline 
          onEnded={onEnded} 
          className="pet-video-render"
          style={{ display: isWash ? 'block' : 'none' }} 
        />
      </div>
    </div>
  );
};
