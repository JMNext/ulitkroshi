import React, { useState } from 'react';
import prostoiMov from "@/assets/resources/1stpet-animation/prostoi-converted.mov";
import prostoiWebm from "@/assets/resources/1stpet-animation/prostoi-converted.webm";

export const PetVideoBlock = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className="absolute left-1/2 top-[460px] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150 origin-center w-[644px] h-[644px] z-10 bg-transparent overflow-visible" 
      style={{ opacity: isLoaded ? 1 : 0 }}
    >
      <video
        autoPlay 
        muted 
        playsInline 
        loop
        onLoadedData={() => setIsLoaded(true)}
        className="block w-full h-auto pointer-events-none outline-none border-none bg-transparent absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-bottom object-contain"
        style={{ imageRendering: 'crisp-edges' }}
      >
        <source src={prostoiMov} type="video/quicktime" />
        <source src={prostoiWebm} type="video/webm; codecs=vp9,vorbis" />
      </video>
    </div>
  );
};
