import React from 'react';

const MESSAGES = {
  success: "Поздравляю! Ты владелец улиткроша!"
};

export const SuccessBubble = () => {
  return (
    <div className="absolute left-1/2 top-[30px] w-[calc(100%-32px)] max-w-[540px] -translate-x-1/2 origin-top pointer-events-none select-none z-50 flex flex-col transition-all duration-150">
      <div className="relative box-border flex w-full items-center justify-center rounded-[36px] border-[1.5px] border-slate-200 bg-white px-6 py-6 text-center font-black shadow-md">
        <p className="text-[24px] leading-snug m-0 whitespace-normal break-words text-slate-700 font-black antialiased">
          {MESSAGES.success}
        </p>
        <div className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[18px] border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]" />
        <div className="absolute bottom-[-19.5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[18px] border-t-slate-200 -z-10" />
      </div>
    </div>
  );
};
