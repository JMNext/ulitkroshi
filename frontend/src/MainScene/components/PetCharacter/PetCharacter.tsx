import React, { useRef, useEffect, useState } from "react";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import {
  ACTION_ANIMATIONS,
  LOOPING_ANIMATIONS,
  PET_ANIMATION_URLS
} from "./petCharacter.constants";
import lifeImgUrl from "@/assets/interface-icons/life.svg";

interface PetCharacterProps {
  styles: React.CSSProperties;
  alertText: string | null;
  onAnimationEnd: (animKey: string) => void;
}

interface Slot {
  key: string;
  sources: { mov: string; webm: string } | null;
  isLoop: boolean;
}

export const PetCharacter = ({
  styles,
  alertText,
  onAnimationEnd
}: PetCharacterProps) => {
  const {
    hp = 0,
    petName = "Булька",
    currentAnim = "prostoi1"
  } = usePetStore();
  const vRefA = useRef<HTMLVideoElement | null>(null);
  const vRefB = useRef<HTMLVideoElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [slotA, setSlotA] = useState<Slot>({
    key: "prostoi1",
    sources: PET_ANIMATION_URLS["prostoi1"] || null,
    isLoop: true
  });
  const [slotB, setSlotB] = useState<Slot>({
    key: "",
    sources: null,
    isLoop: false
  });
  const [active, setActive] = useState<"A" | "B">("A");

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const src = PET_ANIMATION_URLS[currentAnim] || null;
    const isLoop = LOOPING_ANIMATIONS.includes(currentAnim);
    const isA = active === "A";

    if ((isA ? slotA.key : slotB.key) === currentAnim) {
      const activeVideo = isA ? vRefA.current : vRefB.current;
      if (activeVideo?.paused) activeVideo.play().catch(() => {});
    } else {
      const setSlot = isA ? setSlotB : setSlotA;
      const ref = isA ? vRefB : vRefA;

      setSlot({ key: currentAnim, sources: src, isLoop });
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.currentTime = 0;
          ref.current
            .play()
            .catch(() =>
              setTimeout(
                () => ref.current?.play().catch(() => {}),
                50
              )
            );
        }
      });
    }

    if (!isLoop) {
      timeoutRef.current = setTimeout(
        () => onAnimationEnd(currentAnim),
        4500
      );
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentAnim, onAnimationEnd]);

  const handleTimeUpdate = (slot: "A" | "B") => {
    const video = slot === "A" ? vRefA.current : vRefB.current;
    if (!video || video.currentTime === 0) return;

    if (slot === "A" && currentAnim === slotA.key && active !== "A") {
      setActive("A");
      vRefB.current?.pause();
    } else if (
      slot === "B" &&
      currentAnim === slotB.key &&
      active !== "B"
    ) {
      setActive("B");
      vRefA.current?.pause();
    }
  };

  const renderVideo = (
    slot: Slot,
    type: "A" | "B",
    ref: React.RefObject<HTMLVideoElement | null>
  ) => {
    if (!slot.sources) return null;
    const isCurrent = active === type;
    return (
      <video
        ref={ref}
        key={`slot_${type.toLowerCase()}_${slot.key}`}
        muted
        playsInline
        preload="auto"
        loop={slot.isLoop}
        onTimeUpdate={() => handleTimeUpdate(type)}
        onEnded={() =>
          !slot.isLoop &&
          currentAnim === slot.key &&
          onAnimationEnd(slot.key)
        }
        className="pointer-events-auto absolute block h-auto w-full border-none bg-transparent object-contain object-bottom outline-none"
        style={{
          left: "50%",
          bottom: slot.key === "wash" ? "-156px" : "0px",
          imageRendering: "crisp-edges",
          zIndex: isCurrent ? 20 : 10,
          transform: isCurrent
            ? "translate3d(-50%, 0, 0)"
            : "translate3d(-10000px, 0, 0)",
          pointerEvents: isCurrent ? "auto" : "none",
          willChange: "transform"
        }}
      >
        <source
          src={slot.sources.mov}
          type='video/quicktime; codecs="hvc1"'
        />
        <source
          src={slot.sources.webm}
          type="video/webm; codecs=vp9,vorbis"
        />
      </video>
    );
  };

  const isLowHp = hp < 10;

  return (
    <div
      className="pointer-events-auto absolute left-1/2 h-[644px] w-[644px] origin-center transition-transform duration-150 ease-out [backface-visibility:hidden]"
      style={{ zIndex: currentAnim === "wash" ? 50 : 10, ...styles }}
    >
      {alertText && (
        <div className="animate-fade-in pointer-events-none absolute top-[20px] left-1/2 z-50 -mt-12 w-max max-w-none -translate-x-1/2 rounded-xl border border-solid border-orange-400 bg-black/60 px-5 py-2.5 text-center whitespace-nowrap backdrop-blur-sm">
          <span className="text-[18px] leading-tight font-black tracking-wide text-orange-400 uppercase">
            {alertText}
          </span>
        </div>
      )}

      <div
        className={`pointer-events-none absolute top-[20px] left-1/2 flex w-[300px] -translate-x-1/2 flex-col items-center justify-center overflow-visible transition-all duration-150 select-none ${
          ACTION_ANIMATIONS.includes(currentAnim)
            ? "invisible opacity-0"
            : "visible opacity-100"
        }`}
      >
        <span className="mb-3 max-w-[270px] overflow-hidden text-center text-[32px] font-black text-ellipsis whitespace-nowrap text-[#1a3d1c]">
          {petName}
        </span>
        <div
          className={`relative box-border flex h-[22px] w-[285px] items-center rounded-[11px] border-[3px] border-solid bg-white/90 ${isLowHp ? "animate-pulse border-red-500" : "border-[#ffca28]"}`}
        >
          <div
            className={`ml-[1px] h-4 rounded-[8px] transition-all duration-150 ${isLowHp ? "bg-red-500" : "bg-[#4caf50]"}`}
            style={{
              width: `${hp > 0 ? Math.floor(279 * (hp / 100)) : 0}px`
            }}
          />
          <img
            src={lifeImgUrl}
            className="pointer-events-none absolute top-1/2 left-[-43px] block h-[41px] w-[41px] -translate-y-1/2 object-contain"
            alt=""
          />
        </div>
        <span
          className={`mt-3 text-center text-[24px] font-black ${isLowHp ? "animate-bounce text-red-600" : "text-[#1a3d1c]"}`}
        >
          {hp}%
        </span>
      </div>

      <div
        id="phaser-native-html-pet"
        className="pointer-events-auto absolute inset-0 h-full w-full [transform:translate3d(0,0,0)] overflow-visible"
      >
        {renderVideo(slotA, "A", vRefA)}
        {renderVideo(slotB, "B", vRefB)}
      </div>
    </div>
  );
};
