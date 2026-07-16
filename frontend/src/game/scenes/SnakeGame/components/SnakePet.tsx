import React, { useRef, useEffect } from 'react';
import petIdleVideo from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import petPlayVideo from '/src/assets/resources/1stpet-animation/play-converted.webm';
import petSadVideo from '/src/assets/resources/1stpet-animation/sad_state.webm';
import { useSnakeGameStore } from '../useSnakeGameStore';

interface SnakePetProps {
  onEnded: () => void;
  onCrashEnded: () => void;
}

export const SnakePet = ({ onEnded, onCrashEnded }: SnakePetProps) => {
  const vIdle = useRef<HTMLVideoElement | null>(null);
  const vPlay = useRef<HTMLVideoElement | null>(null);
  const vSad = useRef<HTMLVideoElement | null>(null);

  const isWash = useSnakeGameStore((state) => state.isWash);
  const isCrashed = useSnakeGameStore((state) => state.isCrashed);

  useEffect(() => { 
    if (isWash) {
      try { vIdle.current?.pause(); vSad.current?.pause(); } catch(e) {}
      vPlay.current?.play().catch(() => {});
    } else if (isCrashed) {
      try { vIdle.current?.pause(); vPlay.current?.pause(); } catch(e) {}
      vSad.current?.play().catch(() => {});
    } else {
      vPlay.current?.pause();
      vSad.current?.pause();
      vIdle.current?.play().catch(() => {});
    }
  }, [isWash, isCrashed]);

  return (
    <div className="snake-pet-layout-box">
      <div className="pet-character-sprite-wrap">
        <video ref={vIdle} src={petIdleVideo} muted playsInline autoPlay loop style={{ display: !isWash && !isCrashed ? 'block' : 'none' }} className="pet-video-render" />
        <video ref={vPlay} src={petPlayVideo} muted playsInline onEnded={onEnded} style={{ display: isWash ? 'block' : 'none' }} className="pet-video-render" />
        <video ref={vSad} src={petSadVideo} muted playsInline onEnded={onCrashEnded} style={{ display: !isWash && isCrashed ? 'block' : 'none' }} className="pet-video-render" />
      </div>
    </div>
  );
};
