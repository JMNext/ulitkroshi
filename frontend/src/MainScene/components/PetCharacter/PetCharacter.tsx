import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { clsx } from "clsx";
import { useEffect } from "react";
import { LOOPING_ANIMATIONS, PET_ANIMATION_URLS } from "./constants/petCharacter.constants";
import { PetIndicators } from "./PetIndicators";

interface PetCharacterProps { alertText: string | null; onAnimationEnd: (animKey: string) => void; }

const ALL_KEYS = Object.keys(PET_ANIMATION_URLS);

export const PetCharacter = ({ alertText, onAnimationEnd }: PetCharacterProps) => {
  const { hp, petName, currentAnim, registerVideoElement, completeCareAction, getVideoElements } = usePetStore();

  useEffect(() => {
    const videos = getVideoElements();
    ALL_KEYS.forEach((key) => {
      const v = videos[key];
      if (!v) return;
      if (currentAnim === key) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        if (!v.paused) {
          v.pause();
        }
      }
    });
  }, [currentAnim, getVideoElements]);

  useEffect(() => () => {
    const videos = getVideoElements();
    ALL_KEYS.forEach((key) => {
      const v = videos[key];
      if (v) {
        if (!v.paused) v.pause();
        v.removeAttribute("src");
        v.load();
      }
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
      <PetIndicators petName={petName} hp={hp} currentAnim={currentAnim} alertText={alertText} />

      {alertText && (
        <div className="animate-fade-in pointer-events-none absolute top-[38px] left-1/2 z-50 w-[460px] max-w-[90vw] -translate-x-1/2 -ml-[2px] rounded-xl border border-solid border-orange-400 bg-black/85 px-5 py-3 text-center backdrop-blur-sm shadow-xl">
          <span className="text-[16px] sm:text-[18px] leading-snug font-black tracking-wide text-orange-400 uppercase block break-words">
            {alertText}
          </span>
        </div>
      )}

      <div id="phaser-native-html-pet" className="pointer-events-auto absolute inset-0 h-full w-full overflow-visible">
        {ALL_KEYS.map((key) => (
          <video
            key={key}
            ref={(el) => registerVideoElement(key, el)}
            muted playsInline preload="metadata"
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
