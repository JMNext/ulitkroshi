import React from "react";
import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";
import { FRUIT_URLS } from "./fruitAssets";

export const CaptchaBlockModal = () => {
  const { generateNewOrder, resetStore, sel: selected = [] } = useRegistrationStep3Store();

  const handleResetClick = () => {
    resetStore(true);
    generateNewOrder();
  };

  return (
    <div className="absolute left-1/2 top-1/2 z-[99] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-fade-in">
      <div className="pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 border-red-500 bg-white px-5 py-6 text-center shadow-2xl landscape:py-4 landscape:gap-3">
        <h3 className="m-0 text-xl font-black text-slate-700 select-none leading-snug w-full normal-case landscape:text-base">
          Код запутался.<br />Начнем сначала?
        </h3>
        
        <div className="flex h-7 w-full items-center justify-center gap-1.5 select-none">
          {selected.map((id: number, idx: number) => {
            const url = FRUIT_URLS[id];
            return url && (
              <img 
                key={`block-fruit-${id}-${idx}`} 
                src={url} 
                width="28" 
                height="28" 
                className="h-7 w-7 object-contain block" 
                alt="" 
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleResetClick}
          className="flex h-12 w-[190px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#f97316] to-[#ea580c] px-4 text-base font-black tracking-wide text-white uppercase shadow-md outline-none select-none transition-transform active:scale-95 whitespace-nowrap"
        >
          Выбрать заново
        </button>
      </div>
    </div>
  );
};
