import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { clsx } from "clsx";
import { useEffect } from "react";
import { LOOPING_ANIMATIONS, PET_ANIMATION_URLS } from "./constants/petCharacter.constants";
import { STAGE_SCALE, PetStage } from "@/shared/growth.config";

interface PetCharacterProps {
  onAnimationEnd?: (animKey: string) => void;
}

const ALL_KEYS = Object.keys(PET_ANIMATION_URLS);

export const PetCharacter = ({ onAnimationEnd = () => {} }: PetCharacterProps) => {
  const { currentAnim, stage, registerVideoElement, completeCareAction, getVideoElements } = usePetStore();

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

  const scale = STAGE_SCALE[(stage as PetStage) ?? 'teen'] ?? 1.0;

  return (
    <div className="pointer-events-auto relative h-full w-full [backface-visibility:hidden]">


      {/* Только видео-спрайт питомца масштабируется в зависимости от стадии взросления */}
      <div
        id="phaser-native-html-pet"
        className="pointer-events-auto absolute inset-0 h-full w-full overflow-visible"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center bottom",
          transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {ALL_KEYS.map((key) => (
          <video
            key={key}
            ref={(el) => registerVideoElement(key, el)}
            muted
            playsInline
            preload="metadata"
            loop={LOOPING_ANIMATIONS.includes(key)}
            onEnded={() => handleEnded(key)}
            className={clsx(
              "pointer-events-auto absolute left-1/2 block h-auto w-full -translate-x-1/2 border-none bg-transparent object-contain object-bottom",
              key === "wash" ? "bottom-[-156px]" : "bottom-0",
              currentAnim === key ? "visible z-30 opacity-100" : "pointer-events-none invisible z-10 opacity-0"
            )}
            style={{ imageRendering: "crisp-edges" }}
          >
            {/* Для Safari на iOS и macOS: HEVC с альфа-каналом ОБЯЗАН быть первым */}
            <source src={PET_ANIMATION_URLS[key].mov} type='video/mp4; codecs="hvc1"' />
            <source src={PET_ANIMATION_URLS[key].mov} type='video/quicktime; codecs="hvc1"' />
            {/* Для Chrome, Edge, Firefox, Android: WebM с альфа-каналом (VP9) */}
            <source src={PET_ANIMATION_URLS[key].webm} type="video/webm; codecs=vp9,vorbis" />
          </video>
        ))}
      </div>
    </div>
  );
};
