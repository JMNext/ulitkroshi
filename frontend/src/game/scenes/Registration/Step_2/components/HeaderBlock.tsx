import React from 'react';
import { Typography } from 'antd';
import { useRegistrationStep2Store } from '../useRegistrationStep2Store';

interface HeaderBlockProps {
  onResend: () => void;
}

export const HeaderBlock = ({ onResend }: HeaderBlockProps) => {
  const mode = useRegistrationStep2Store((state) => state.mode);
  const secs = useRegistrationStep2Store((state) => state.secs);

  return (
    <Typography component="div" className="header-block-container">
      {mode !== 'code' ? (
        <p className="header-block-title">
          Набери свой номер телефона!
        </p>
      ) : (
        <Typography component="div" className="header-block-wrapper">
          <p className="header-block-title">
            Введи номер из смс!
          </p>
          <button 
            disabled={secs > 0} 
            onClick={onResend} 
            className={`header-resend-btn ${secs > 0 ? 'header-resend-btn-disabled' : 'header-resend-btn-active'}`}
          >
            {secs > 0 ? `Отправить повторно через ${secs} сек` : 'Отправить повторно'}
          </button>
        </Typography>
      )}
      <span className="header-block-tail" />
    </Typography>
  );
};
