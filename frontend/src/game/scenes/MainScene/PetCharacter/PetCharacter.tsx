import React, { useEffect, useRef } from 'react';
import './PetCharacter.css';

const videoProstoi1 = new URL('/src/assets/resources/1stpet-animation/prostoi-converted.webm', import.meta.url).href;
const videoProstoi2 = new URL('/src/assets/resources/1stpet-animation/prostoi2.webm', import.meta.url).href;
const videoSadState = new URL('/src/assets/resources/1stpet-animation/sad_state.webm', import.meta.url).href;
const videoSleepBegin = new URL('/src/assets/resources/1stpet-animation/sleep_begin.webm', import.meta.url).href;
const videoSleepCircle = new URL('/src/assets/resources/1stpet-animation/sleep_circle.webm', import.meta.url).href;
const videoSleepAwake = new URL('/src/assets/resources/1stpet-animation/sleep_awake.webm', import.meta.url).href;
const videoEat = new URL('/src/assets/resources/1stpet-animation/eat-converted.webm', import.meta.url).href;
const videoPlay = new URL('/src/assets/resources/1stpet-animation/play_ball.webm', import.meta.url).href;
const videoWash = new URL('/src/assets/resources/1stpet-animation/wash-converted.webm', import.meta.url).href; 

interface PetCharacterProps {
  currentAnim: string;
  onAnimationComplete: (anim: string) => void;
}

const ANIMATION_MAP: Record<string, string> = {
  wash: videoWash, 
  play: videoPlay, 
  eat: videoEat, 
  sad_state: videoSadState,
  sleep_begin: videoSleepBegin, 
  sleep_circle: videoSleepCircle, 
  sleep_awake: videoSleepAwake,
  prostoi2: videoProstoi2, 
  prostoi1: videoProstoi1,
};

const LOOPING_ANIMS = new Set(['prostoi1', 'prostoi2', 'sleep_circle', 'sad_state']);
const COMPLETABLE_ANIMS = new Set(['sleep_begin', 'sleep_awake', 'wash', 'play', 'eat']);

export const PetCharacter = ({ currentAnim, onAnimationComplete }: PetCharacterProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isWash = currentAnim === 'wash';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [currentAnim]);

  return (
    <div className={`pet-character-container ${isWash ? 'is-wash-size' : 'is-default-size'}`}>
      <div className="pet-character-sprite-wrap">
        <video
          ref={videoRef}
          src={ANIMATION_MAP[currentAnim] || videoProstoi1}
          className={`pet-video-render ${isWash ? 'is-wash-video' : ''}`}
          loop={LOOPING_ANIMS.has(currentAnim)}
          muted
          preload="auto"
          playsInline
          controls={false}
          onEnded={() => COMPLETABLE_ANIMS.has(currentAnim) && onAnimationComplete(currentAnim)}
          style={{ pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
};
