import lifeImgUrl from "@/assets/interface-icons/life.svg";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { clsx } from "clsx";
import { useEffect } from "react";
import { ACTION_ANIMATIONS, LOOPING_ANIMATIONS, PET_ANIMATION_URLS } from "./constants/petCharacter.constants";

interface PetCharacterProps { alertText: string | null; onAnimationEnd: (animKey: string) => void; }

const ALL_KEYS = Object.keys(PET_ANIMATION_URLS);

export const PetCharacter = ({ alertText, onAnimationEnd }: PetCharacterProps) => {
  const { hp, petName, currentAnim, registerVideoElement, completeCareAction, getVideoElements } = usePetStore();

  const isLow = hp <= 25;
  const safeHp = Math.min(Math.max(hp, 0), 100);

  useEffect(() => {
    const videos = getVideoElements();
    ALL_KEYS.forEach((key) => {
      const v = videos[key];
      if (!v) return;
      v.currentTime = 0;
      currentAnim === key ? v.play().catch(() => {}) : !v.paused && v.pause();
    });
  }, [currentAnim, getVideoElements]);

  useEffect(() => () => {
    const videos = getVideoElements();
    ALL_KEYS.forEach((key) => {
      const v = videos[key];
      v?.pause(); v?.removeAttribute("src"); v?.load();
      registerVideoElement(key, null);
    });
  }, [getVideoElements, registerVideoElement]);

  const handleEnded = (key: string) => {
    if (key !== currentAnim || LOOPING_ANIMATIONS.includes(key)) return;
    completeCareAction();
    if (key !== "sleep_begin") onAnimationEnd(key);
  };

  return (
    <div className="pointer-events-auto absolute top-1/2 left-1/2 h-[644px] w-[644px] -translate-x-1/2 -translate-y-1/2 [backface-visibility:hidden]">
      {alertText && (
        <div className="animate-fade-in pointer-events-none absolute top-0 left-1/2 z-50 -mt-12 w-max -translate-x-1/2 rounded-xl border border-solid border-orange-400 bg-black/60 px-5 py-2.5 text-center backdrop-blur-sm">
          <span className="text-[18px] leading-tight font-black tracking-wide text-orange-400 uppercase">{alertText}</span>
        </div>
      )}

      <div className={clsx("pointer-events-none absolute top-[30px] left-1/2 flex w-[300px] -translate-x-1/2 flex-col items-center justify-center transition-all duration-150 select-none", ACTION_ANIMATIONS.includes(currentAnim) ? "invisible opacity-0" : "visible opacity-100")}>
        <span className="mb-3 max-w-[270px] overflow-hidden text-center text-[32px] font-black text-ellipsis whitespace-nowrap text-[#1a3d1c]">{petName}</span>

        <div className={clsx("relative box-border flex h-[22px] w-[285px] items-center rounded-[11px] border-[3px] border-solid bg-white/90", isLow ? "animate-pulse border-red-500" : "border-[#ffca28]")}>
          <div className={clsx("ml-[1px] h-4 rounded-[8px] transition-all duration-150", isLow ? "bg-red-500" : "bg-[#4caf50]")} style={{ width: `${safeHp}%` }} />
          <img src={lifeImgUrl} className="pointer-events-none absolute top-1/2 left-[-43px] block h-[41px] w-[41px] -translate-y-1/2 object-contain" alt="" />
        </div>

        <span className={clsx("mt-3 text-center text-[24px] font-black", isLow ? "animate-bounce text-red-600" : "text-[#1a3d1c]")}>{hp}%</span>
      </div>

      <div id="phaser-native-html-pet" className="pointer-events-auto absolute inset-0 h-full w-full overflow-visible">
        {ALL_KEYS.map((key) => (
          <video
            key={key}
            ref={(el) => registerVideoElement(key, el)}
            muted playsInline preload="auto"
            loop={LOOPING_ANIMATIONS.includes(key)}
            onEnded={() => handleEnded(key)}
            className={clsx(
              "pointer-events-auto absolute left-1/2 block h-auto w-full -translate-x-1/2 border-none bg-transparent object-contain object-bottom",
              key === "wash" ? "bottom-[-156px]" : "bottom-0",
              currentAnim === key ? "visible z-30 opacity-100" : "pointer-events-none invisible z-10 opacity-0"
            )}
            style={{ imageRendering: "crisp-edges" }}
          >
            <source src={PET_ANIMATION_URLS[key].webm} type="video/webm; codecs=vp9,vorbis" />
            <source src={PET_ANIMATION_URLS[key].mov} type='video/quicktime; codecs="hvc1"' />
          </video>
        ))}
      </div>
    </div>
  );
};
