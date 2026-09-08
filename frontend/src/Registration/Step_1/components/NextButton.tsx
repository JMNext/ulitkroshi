import React from 'react';
import nextBtnImg from '/src/assets/registration/next_button.png';

export const NextButton = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <button 
      type="button"
      onClick={onComplete} 
      className="box-border border-0 m-0 p-0 cursor-pointer pointer-events-auto outline-none w-[100px] h-[100px] bg-transparent flex items-center justify-center active:scale-95 transition-transform duration-75"
    >
      <img src={nextBtnImg} className="w-full h-full object-contain pointer-events-none block" alt="Далее" />
    </button>
  );
};
