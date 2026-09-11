import prostoiMov from "@/assets/resources/1stpet-animation/prostoi-converted.mov";
import prostoiWebm from "@/assets/resources/1stpet-animation/prostoi-converted.webm";
import { useState } from "react";

export const PetVideoBlock = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className="pointer-events-none absolute top-[460px] left-1/2 z-10 h-[644px] w-[644px] origin-center -translate-x-1/2 -translate-y-1/2 overflow-visible bg-transparent transition-all duration-150"
      style={{ opacity: isLoaded ? 1 : 0 }}
    >
      <video
        autoPlay
        muted
        playsInline
        loop
        onLoadedData={() => setIsLoaded(true)}
        className="pointer-events-none absolute top-1/2 left-1/2 block h-auto w-full -translate-x-1/2 -translate-y-1/2 border-none bg-transparent object-contain object-bottom outline-none"
        style={{ imageRendering: "crisp-edges" }}
      >
        <source src={prostoiMov} type="video/quicktime" />
        <source src={prostoiWebm} type="video/webm; codecs=vp9,vorbis" />
      </video>
    </div>
  );
};
