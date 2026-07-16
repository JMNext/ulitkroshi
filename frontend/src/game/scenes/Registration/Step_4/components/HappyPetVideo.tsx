import React from 'react';
import { Typography } from 'antd';
import happyVideoUrl from '/src/assets/resources/1stpet-animation/happy.webm';

export const HappyPetVideo = () => {
  return (
    <Typography component="div" className="reg-happy-pet-container">
      <video
        src={happyVideoUrl}
        className="reg-happy-pet-video"
        autoPlay
        loop
        muted
        playsInline
      />
    </Typography>
  );
};
