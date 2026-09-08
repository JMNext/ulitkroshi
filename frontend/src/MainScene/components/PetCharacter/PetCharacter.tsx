import React, { useRef, useEffect } from "react";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { ACTION_ANIMATIONS, LOOPING_ANIMATIONS, PET_ANIMATION_URLS } from "./petCharacter.constants";
import lifeImgUrl from "@/assets/interface-icons/life.svg";

interface PetCharacterProps {
  styles: React.CSSProperties;
  alertText: string | null;
  onAnimationEnd: (animKey: string) => void;
}

export const PetCharacter = ({ styles, alertText, onAnimationEnd }: PetCharacterProps) => {
  const { hp = 0, petName = "Булька", currentAnim = "prostoi1" } = usePetStore();

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([animKey, video]) => {
      if (!video) return;
      if (animKey === currentAnim) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentAnim]);

  const isLowHp = hp < 10;
  const isLoop = LOOPING_ANIMATIONS.includes(currentAnim);

  return (
    <div 
      className="absolute left-1/2 w-[644px] h-[644px] pointer-events-auto origin-center [backface-visibility:hidden] transition-transform duration-150 ease-out" 
      style={{ zIndex: currentAnim === "wash" ? 50 : 10, ...styles }}
    >
      {alertText && (
        <div className="animate-fade-in pointer-events-none absolute top-[20px] left-1/2 z-50 -mt-12 w-max max-w-none -translate-x-1/2 rounded-xl border border-solid border-orange-400 bg-black/60 px-5 py-2.5 text-center whitespace-nowrap backdrop-blur-sm">
          <span className="text-[18px] leading-tight font-black tracking-wide text-orange-400 uppercase">{alertText}</span>
        </div>
      )}

      <div className={`pointer-events-none absolute left-1/2 -translate-x-1/2 top-[20px] w-[300px] flex flex-col items-center justify-center overflow-visible transition-all duration-150 select-none ${
        ACTION_ANIMATIONS.includes(currentAnim) ? "opacity-0 invisible" : "opacity-100 visible"
      }`}>
        <span className="mb-3 max-w-[270px] overflow-hidden text-center text-[32px] font-black text-ellipsis whitespace-nowrap text-[#1a3d1c]">
          {petName}
        </span>

        <div className={`relative box-border flex h-[22px] w-[285px] items-center rounded-[11px] border-[3px] border-solid bg-white/90 ${
          isLowHp ? "animate-pulse border-red-500" : "border-[#ffca28]"
        }`}>
          <div 
            className={`ml-[1px] h-4 rounded-[8px] transition-all duration-150 ${isLowHp ? "bg-red-500" : "bg-[#4caf50]"}`} 
            style={{ width: `${hp > 0 ? Math.floor(279 * (hp / 100)) : 0}px` }} 
          />
          <img src={lifeImgUrl} className="pointer-events-none absolute top-1/2 left-[-43px] h-[41px] w-[41px] -translate-y-1/2 object-contain block" alt="" />
        </div>
        
        <span className={`mt-3 text-center text-[24px] font-black ${isLowHp ? "text-red-600 animate-bounce" : "text-[#1a3d1c]"}`}>
          {hp}%
        </span>
      </div>

      <div id="phaser-native-html-pet" className="pointer-events-auto absolute inset-0 w-full h-full overflow-visible [transform:translate3d(0,0,0)]">
        {Object.entries(PET_ANIMATION_URLS).map(([animKey, sources]) => {
          const s = sources as { mov: string; webm: string };
          const isCurrent = animKey === currentAnim;
          const isVideoLoop = LOOPING_ANIMATIONS.includes(animKey);

          return (
            <video 
              key={animKey} 
              ref={(el) => { videoRefs.current[animKey] = el; }} 
              muted 
              playsInline 
              preload="auto" 
              loop={isVideoLoop} 
              onEnded={() => !isVideoLoop && isCurrent && onAnimationEnd(animKey)} 
              className={`pointer-events-auto absolute left-1/2 -translate-x-1/2 block h-auto w-full border-none bg-transparent outline-none object-bottom object-contain transition-opacity duration-75 ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`} 
              style={{ 
                bottom: animKey === "wash" ? "-156px" : "0px", 
                imageRendering: "crisp-edges" 
              }}
            >
              <source src={`${s.mov}?v=94178c42`} type='video/quicktime; codecs="hvc1"' /> 
              <source src={`${s.webm}?v=94178c42`} type="video/webm; codecs=vp9,vorbis" />
            </video>
          );
        })}
      </div>
    </div>
  );
};
