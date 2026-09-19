import lifeImgUrl from "@/assets/interface-icons/life.svg";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { clsx } from "clsx";
import React, { useEffect } from "react";
import { ACTION_ANIMATIONS, PET_ANIMATION_URLS, LOOPING_ANIMATIONS } from "./constants/petCharacter.constants";

interface PetCharacterProps {
  styles: React.CSSProperties;
  alertText: string | null;
  onAnimationEnd: (animKey: string) => void;
}

const ALL_ANIM_KEYS = Object.keys(PET_ANIMATION_URLS);

export const PetCharacter = ({ styles, alertText, onAnimationEnd }: PetCharacterProps) => {
  const { hp, petName, currentAnim, registerVideoElement, completeCareAction, getVideoElements } = usePetStore();

  const isActionActive = ACTION_ANIMATIONS.includes(currentAnim);
  const isLow = hp < 10;
  const safeHp = Math.min(Math.max(hp, 0), 100);

  useEffect(() => {
    const videos = getVideoElements();
    ALL_ANIM_KEYS.forEach((key) => {
      const video = videos[key];
      if (!video) return;

      if (currentAnim === key) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        if (!video.paused) {
          video.pause();
        }
        video.currentTime = 0;
      }
    });
  }, [currentAnim, getVideoElements]);

  useEffect(() => {
    return () => {
      const videos = getVideoElements();
      ALL_ANIM_KEYS.forEach((key) => {
        const video = videos[key];
        if (video) {
          video.pause();
          video.removeAttribute("src");
          video.load();
        }
        registerVideoElement(key, null);
      });
    };
  }, [getVideoElements, registerVideoElement]);

  const handleVideoEnded = (animKey: string) => {
    if (animKey !== currentAnim) return;
    if (LOOPING_ANIMATIONS.includes(animKey)) return;

    completeCareAction();

    if (animKey !== "sleep_begin") {
      onAnimationEnd(animKey);
    }
  };

  return (
    <div
      className="pointer-events-auto absolute left-1/2 h-[644px] w-[644px] origin-center transition-transform duration-150 ease-out [backface-visibility:hidden]"
      style={{ zIndex: currentAnim === "wash" ? 50 : 10, ...styles }}
    >
      {alertText && (
        <div className="animate-fade-in pointer-events-none absolute top-[20px] left-1/2 z-50 -mt-12 w-max max-w-none -translate-x-1/2 rounded-xl border border-solid border-orange-400 bg-black/60 px-5 py-2.5 text-center whitespace-nowrap backdrop-blur-sm">
          <span className="text-[18px] leading-tight font-black tracking-wide text-orange-400 uppercase">{alertText}</span>
        </div>
      )}

      <div className={clsx("pointer-events-none absolute top-[20px] left-1/2 flex w-[300px] -translate-x-1/2 flex-col items-center justify-center transition-all duration-150 select-none", isActionActive ? "invisible opacity-0" : "visible opacity-100")}>
        <span className="mb-3 max-w-[270px] overflow-hidden text-center text-[32px] font-black text-ellipsis whitespace-nowrap text-[#1a3d1c]">{petName}</span>
        <div className={clsx("relative box-border flex h-[22px] w-[285px] items-center rounded-[11px] border-[3px] border-solid bg-white/90", isLow ? "animate-pulse border-red-500" : "border-[#ffca28]")}>
          <div className={clsx("ml-[1px] h-4 rounded-[8px] transition-all duration-150", isLow ? "bg-red-500" : "bg-[#4caf50]")} style={{ width: `${safeHp}%` }} />
          <img src={lifeImgUrl} className="pointer-events-none absolute top-1/2 left-[-43px] block h-[41px] w-[41px] -translate-y-1/2 object-contain" alt="" />
        </div>
        <span className={clsx("mt-3 text-center text-[24px] font-black", isLow ? "animate-bounce text-red-600" : "text-[#1a3d1c]")}>{hp}%</span>
      </div>

      <div id="phaser-native-html-pet" className="pointer-events-auto absolute inset-0 h-full w-full overflow-visible">
        {ALL_ANIM_KEYS.map((animKey) => {
          const sources = PET_ANIMATION_URLS[animKey];
          if (!sources) return null;

          const isActive = currentAnim === animKey;

          return (
            <video
              key={animKey}
              ref={(el) => registerVideoElement(animKey, el)}
              muted
              playsInline
              preload="auto"
              loop={LOOPING_ANIMATIONS.includes(animKey)}
              onEnded={() => handleVideoEnded(animKey)}
              className={clsx(
                "pointer-events-auto absolute block h-auto w-full border-none bg-transparent object-contain object-bottom left-1/2 -translate-x-1/2",
                animKey === "wash" ? "bottom-[-156px]" : "bottom-0",
                isActive ? "z-30 opacity-100 visible" : "z-10 opacity-0 invisible pointer-events-none"
              )}
              style={{ imageRendering: "crisp-edges" }}
            >
              <source src={sources.webm} type="video/webm; codecs=vp9,vorbis" />
              <source src={sources.mov} type='video/quicktime; codecs="hvc1"' />
            </video>
          );
        })}
      </div>
    </div>
  );
};
