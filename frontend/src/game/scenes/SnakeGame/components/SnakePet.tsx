import React, { useRef } from 'react';
import petIdleVideo from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import petPlayVideo from '/src/assets/resources/1stpet-animation/play-converted.webm';
import petSadVideo from '/src/assets/resources/1stpet-animation/sad_state.webm';

interface SnakePetProps {
  isWash: boolean;
  isCrashed: boolean;
  onEnded: () => void;
  onCrashEnded: () => void;
  gridOffsetY: number;
  isPort: boolean;
  isTab: boolean;
  isFold: boolean;
}

export const SnakePet = ({ isWash, isCrashed, onEnded, onCrashEnded, gridOffsetY, isPort, isTab, isFold }: SnakePetProps) => {
  const vIdle = useRef<HTMLVideoElement | null>(null);
  const vPlay = useRef<HTMLVideoElement | null>(null);
  const vSad = useRef<HTMLVideoElement | null>(null);
  const size = isFold ? 100 : (isPort ? Math.max(110, Math.min(150, gridOffsetY * 0.65)) : 140);

  const style: React.CSSProperties = isPort 
    ? { position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: `${window.innerHeight - gridOffsetY + 10}px`, zIndex: 40 } 
    : { position: 'absolute', left: isTab ? '4vw' : 'calc(20vw - 100px)', bottom: isTab ? '40px' : '50px', zIndex: 40 };

  const sizeStyle: React.CSSProperties = isPort ? { width: size, height: size } : {
    width: isTab ? '140px' : '30vw', height: isTab ? '140px' : '30vw', minWidth: '200px', maxWidth: '280px'
  };

  const handleWashAnim = () => {
    try { vIdle.current?.pause(); vSad.current?.pause(); } catch(e) {}
    vPlay.current?.play().catch(() => {});
  };

  const handleCrashAnim = () => {
    try { vIdle.current?.pause(); vPlay.current?.pause(); } catch(e) {}
    vSad.current?.play().catch(() => {});
  };

  React.useEffect(() => { 
    if (isWash) {
      handleWashAnim();
    } else if (isCrashed) {
      handleCrashAnim();
    } else {
      vPlay.current?.pause();
      vSad.current?.pause();
      vIdle.current?.play().catch(() => {});
    }
  }, [isWash, isCrashed]);

  const showPlay = isWash;
  const showSad = !isWash && isCrashed;
  const showIdle = !isWash && !isCrashed;

  return (
    <div style={style}>
      <div style={sizeStyle}>
        <video ref={vIdle} src={petIdleVideo} muted playsInline autoPlay loop style={{ display: showIdle ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'contain' }} />
        <video ref={vPlay} src={petPlayVideo} muted playsInline onEnded={onEnded} style={{ display: showPlay ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'contain' }} />
        <video ref={vSad} src={petSadVideo} muted playsInline onEnded={onCrashEnded} style={{ display: showSad ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    </div>
  );
};
