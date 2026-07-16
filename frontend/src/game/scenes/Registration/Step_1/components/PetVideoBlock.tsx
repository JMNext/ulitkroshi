import React from 'react';
import petVideoUrl from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';

export const PetVideoBlock = () => {
  return (
    <div className="reg-pet-video-container">
      <video
        src={petVideoUrl}
        className="reg-pet-video"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};
