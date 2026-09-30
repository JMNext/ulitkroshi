import prostoiMov from "@/assets/resources/1stpet-animation/prostoi-converted.mov";
import prostoiWebm from "@/assets/resources/1stpet-animation/prostoi-converted.webm";
import { useEffect, useRef, useMemo } from "react";
import { isApplePlatform } from "@/shared/device";

export const PetVideoBlock = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isApple = useMemo(() => isApplePlatform(), []);

  useEffect(() => () => {
    const v = videoRef.current;
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
  }, []);

  return (
    <div className="pointer-events-none absolute top-[460px] left-1/2 z-10 h-[644px] w-[644px] origin-center -translate-x-1/2 -translate-y-1/2 overflow-visible bg-transparent transition-all duration-150">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        className="pointer-events-none absolute top-1/2 left-1/2 block h-auto w-full -translate-x-1/2 -translate-y-1/2 border-none bg-transparent object-contain object-bottom outline-none"
        style={{ imageRendering: "crisp-edges" }}
      >
        {isApple ? (
          <>
            <source src={prostoiMov} type='video/mp4; codecs="hvc1"' />
            <source src={prostoiMov} type="video/quicktime" />
            <source src={prostoiMov} />
          </>
        ) : (
          <>
            <source src={prostoiWebm} type="video/webm; codecs=vp9,vorbis" />
            <source src={prostoiMov} type='video/mp4; codecs="hvc1"' />
            <source src={prostoiMov} type="video/quicktime" />
          </>
        )}
      </video>
    </div>
  );
};
