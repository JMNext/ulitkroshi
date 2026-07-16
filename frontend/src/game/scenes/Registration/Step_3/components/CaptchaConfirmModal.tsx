import React from 'react';
import { Typography } from 'antd';

interface CaptchaConfirmModalProps {
  onConfirm: () => void;
}

export const CaptchaConfirmModal = ({ onConfirm }: CaptchaConfirmModalProps) => {
  return (
    <Typography.Text component="div" className="captcha-modal-container">
      <p className="captcha-modal-title">Запомнил?</p>
      <button 
        type="button"
        onClick={onConfirm} 
        style={{ touchAction: 'manipulation' }} 
        className="captcha-modal-btn"
      >
        Да!
      </button>
    </Typography.Text>
  );
};
