import React from 'react';
import { Typography } from 'antd';

interface FinalPlayButtonProps {
  onClick: () => void;
}

export const FinalPlayButton = ({ onClick }: FinalPlayButtonProps) => {
  return (
    <Typography component="div" className="final-play-wrapper">
      <button onClick={onClick} className="final-play-btn">
        Вперед в игру
      </button>
    </Typography>
  );
};
