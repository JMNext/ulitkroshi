import React from 'react';
import { Typography } from 'antd';

interface SentModalProps {
  onConfirm: () => void;
}

export const SentModal = ({ onConfirm }: SentModalProps) => {
  return (
    <Typography component="div" className="sent-modal-container">
      <p className="sent-modal-title">
        Отправили смс<br />на твой номер!
      </p>
      <button 
        onClick={onConfirm} 
        className="sent-modal-btn"
      >
        Ок!
      </button>
    </Typography>
  );
};
