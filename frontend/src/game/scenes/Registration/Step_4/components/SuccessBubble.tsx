import React from 'react';
import { Typography } from 'antd';

export const SuccessBubble = () => {
  return (
    <Typography component="div" className="success-bubble-container">
      <p className="success-bubble-title">
        Поздравляю!<br />Ты владелец<br />улиткроша!
      </p>
      <span className="success-bubble-tail" />
    </Typography>
  );
};
