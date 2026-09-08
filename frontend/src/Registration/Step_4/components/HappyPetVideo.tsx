import React, { useState } from 'react';
import happyMov from "@/assets/resources/1stpet-animation/happy.mov";
import happyWebm from "@/assets/resources/1stpet-animation/happy.webm";

export const HappyPetVideo = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className="absolute left-1/2 top-[460px] -translate-x-1/2 -translate-y-1/2 scale-100 w-[644px] h-[644px] z-0 bg-transparent overflow-visible pointer-events-none transition-all duration-150 origin-center select-none" 
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
        <source src={happyMov} type="video/quicktime" />
        <source src={happyWebm} type="video/webm; codecs=vp9,vorbis" />
      </video>
    </div>
  );
};
