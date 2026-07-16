import React from 'react';
import normalButtonBg from '/src/assets/board/button.svg';
import redButtonBg from '/src/assets/board/red_button.svg';
import './PinPad.css';

interface PinPadProps {
  isDisabled?: boolean;
  onKeyClick: (key: string) => void;
}

export const PinPad = ({ isDisabled = false, onKeyClick }: PinPadProps) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', 'delete'];

  const handlePress = (k: string) => {
    if (isDisabled) return;
    onKeyClick(k === 'delete' ? 'BACKSPACE' : k);
  };

  return (
    <div className={`pinpad-grid-container ${isDisabled ? 'pinpad-grid-container-disabled' : ''}`}>
      {keys.map((key) => {
        const isDelete = key === 'delete';
        const bgSrc = isDelete ? redButtonBg : normalButtonBg;

        return (
          <button
            key={key}
            disabled={isDisabled}
            onClick={() => handlePress(key)}
            style={{ touchAction: 'manipulation' }}
            className="pinpad-key-btn"
          >
            <img src={bgSrc} className="w-full h-full object-contain pointer-events-none drop-shadow-md" alt="button-bg" />
            {isDelete ? (
              <div className="pinpad-delete-text">✕</div>
            ) : (
              <div className="pinpad-key-text">{key}</div>
            )}
          </button>
        );
      })}
    </div>
  );
};
