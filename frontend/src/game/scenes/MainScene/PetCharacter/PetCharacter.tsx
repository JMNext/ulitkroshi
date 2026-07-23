import { useEffect, useRef, useState } from 'react';
import { usePetCareStore } from '../usePetCareStore';
import { PET_ANIMS_CONFIG } from './basePet';

// Ресурсы содержат ссылки на .mov для iOS и .webm для остальных платформ
const ANIMS_SOURCES: Record<string, { mov: string; webm: string }> = {
  wash: {
    mov: new URL('/src/assets/resources/1stpet-animation/wash-converted.mov', import.meta.url).href,
    webm: new URL('/src/assets/resources/1stpet-animation/wash-converted.webm', import.meta.url).href,
  },
  play: {
    mov: new URL('/src/assets/resources/1stpet-animation/play_ball.mov', import.meta.url).href,
    webm: new URL('/src/assets/resources/1stpet-animation/play_ball.webm', import.meta.url).href,
  },
  eat: {
    mov: new URL('/src/assets/resources/1stpet-animation/eat-converted.mov', import.meta.url).href,
    webm: new URL('/src/assets/resources/1stpet-animation/eat-converted.webm', import.meta.url).href,
  },
  sad_state: {
    mov: new URL('/src/assets/resources/1stpet-animation/sad_state.mov', import.meta.url).href,
    webm: new URL('/src/assets/resources/1stpet-animation/sad_state.webm', import.meta.url).href,
  },
  sleep_begin: {
    mov: new URL('/src/assets/resources/1stpet-animation/sleep_begin.mov', import.meta.url).href,
    webm: new URL('/src/assets/resources/1stpet-animation/sleep_begin.webm', import.meta.url).href,
  },
  sleep_circle: {
    mov: new URL('/src/assets/resources/1stpet-animation/sleep_circle.mov', import.meta.url).href,
    webm: new URL('/src/assets/resources/1stpet-animation/sleep_circle.webm', import.meta.url).href,
  },
  sleep_awake: {
    mov: new URL('/src/assets/resources/1stpet-animation/sleep_awake.mov', import.meta.url).href,
    webm: new URL('/src/assets/resources/1stpet-animation/sleep_awake.webm', import.meta.url).href,
  },
  prostoi2: {
    mov: new URL('/src/assets/resources/1stpet-animation/prostoi2.mov', import.meta.url).href,
    webm: new URL('/src/assets/resources/1stpet-animation/prostoi2.webm', import.meta.url).href,
  },
  prostoi1: {
    mov: new URL('/src/assets/resources/1stpet-animation/prostoi-converted.mov', import.meta.url).href,
    webm: new URL('/src/assets/resources/1stpet-animation/prostoi-converted.webm', import.meta.url).href,
  },
};

const LOOPS = new Set<string>(['sleep_circle', 'sad_state', 'prostoi1', 'prostoi2']);
const ANIMS_KEYS = Object.keys(PET_ANIMS_CONFIG);

interface PetCharacterProps {
  onAnimationComplete: (a: string) => void;
}

export const PetCharacter = ({ onAnimationComplete }: PetCharacterProps) => {
  const currentAnim = usePetCareStore(s => s.currentAnim);
  const setCurrentAnim = usePetCareStore(s => s.setCurrentAnim);
  const setWashState = usePetCareStore(s => s.setWashState);
  
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [prevAnim, setPrevAnim] = useState<string | null>(null);
  const [isNewPlaying, setIsNewPlaying] = useState<boolean>(false);

  useEffect(() => {
    const active = videoRefs.current[currentAnim];
    if (!active) return;

    setIsNewPlaying(false);
    active.currentTime = 0;
    active.play().catch(() => {});

    Object.entries(videoRefs.current).forEach(([k, v]) => {
      if (v && k !== currentAnim && k !== prevAnim) v.pause();
    });
  }, [currentAnim, prevAnim]);

  const handlePlaying = (key: string): void => {
    if (key === currentAnim) {
      setIsNewPlaying(true);
      if (prevAnim && prevAnim !== currentAnim) videoRefs.current[prevAnim]?.pause();
      setPrevAnim(currentAnim);
    }
  };

  const handleEnded = (key: string): void => {
    if (key !== currentAnim) return;
    if (key === 'sleep_begin') setCurrentAnim('sleep_circle');
    else if (key === 'sleep_awake') { 
      setCurrentAnim('prostoi1'); 
      setWashState('idle'); 
    } else if (key === 'prostoi1' || key === 'prostoi2') {
      const next: string = Math.random() < 0.3 ? 'prostoi2' : 'prostoi1';
      if (next === currentAnim) videoRefs.current[currentAnim]?.play().catch(() => {});
      else setCurrentAnim(next);
    } else onAnimationComplete(key);
  };

  return (
    <div className="w-[644px] max-w-[644px] h-[644px] max-h-[644px] relative overflow-visible select-none flex items-center justify-center">
      {ANIMS_KEYS.map((key) => {
        const srcs = ANIMS_SOURCES[key];
        const config = PET_ANIMS_CONFIG[key];
        if (!srcs || !config) return null;

        const isCurrent = key === currentAnim;
        const isPrevious = key === prevAnim;
        const isVisible = (isCurrent && isNewPlaying) || (isPrevious && !isNewPlaying);

        return (
          <video
            key={key}
            ref={(el) => { videoRefs.current[key] = el; }}
            loop={LOOPS.has(key)}
            muted
            preload="auto"
            playsInline
            onPlaying={() => handlePlaying(key)}
            onEnded={() => handleEnded(key)}
            style={{
              height: config.height,
              transform: `translate(-50%, ${config.translateY})`,
              objectFit: 'cover',
            }}
            className={`pet-anim-${key} absolute left-1/2 bottom-0 brightness-[0.95] contrast-[1.2] w-[644px] ${
              key === 'wash' 
                ? 'max-w-[644px]' 
                : 'max-w-[644px] h-[644px] max-h-[644px]'
            } ${isVisible ? 'visible opacity-100 z-10' : 'invisible opacity-0 z-0'}`}
          >
            {/* Кроссплатформенные источники прозрачного видео */}
            <source src={srcs.mov} type='video/mp4; codecs="hvc1"' />
            <source src={srcs.webm} type="video/webm" />
          </video>
        );
      })}
    </div>
  );
};
