import React from 'react';

interface SubmitButtonProps {
  isReady: boolean;
  onClick: () => void;
}

export const SubmitButton = ({ isReady, onClick }: SubmitButtonProps) => {
  return (
    <button 
      onClick={onClick} 
      disabled={!isReady} 
      className="submit-step-btn"
    >
      Отправить
    </button>
  );
};
