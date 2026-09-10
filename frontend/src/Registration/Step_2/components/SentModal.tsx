import React from "react";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

const MESSAGES = {
  regTitle: "Отправили смс\nна твой номер!",
  regBtn: "ОК!",
  notFoundTitle: "Не нашли тебя в системе.\nХочешь зарегистрироваться?",
  btnYes: "ДА!",
  btnNo: "НЕТ"
};

export const SentModal = () => {
  const { errorMessage, confirmSent, resetStore, setIsLogin } = useRegistrationStep2Store();
  const isNotFound = errorMessage === "user_not_found";

  const handleOkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    confirmSent();
  };

  const handleYesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("login_phone_buffer");
    localStorage.removeItem("saved_user_phone");
    setIsLogin(false);
    resetStore(); 
    if ((window as any).currentPhaserScene) {
      (window as any).currentPhaserScene.scene.start("Step1Scene");
    }
  };

  const handleNoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    resetStore();
  };

  return (
    <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-fade-in">
      <div className="pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 bg-white px-5 py-6 text-center shadow-2xl landscape:py-5 landscape:gap-4 style-border">
        {isNotFound ? (
          <div className="box-border flex w-full flex-col items-center justify-center gap-5">
            <h3 className="m-0 text-xl font-black text-slate-700 select-none leading-snug w-full normal-case whitespace-pre-line">
              {MESSAGES.notFoundTitle}
            </h3>
            <div className="flex w-full items-center justify-center gap-4 px-2">
              <button
                type="button"
                onClick={handleYesClick}
                className="flex h-12 flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] text-base font-black tracking-wide text-white uppercase shadow-md outline-none select-none transition-transform active:scale-95 whitespace-nowrap"
              >
                {MESSAGES.btnYes}
              </button>
              <button
                type="button"
                onClick={handleNoClick}
                className="flex h-12 flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-rose-500 to-rose-600 text-base font-black tracking-wide text-white uppercase shadow-md outline-none select-none transition-transform active:scale-95 whitespace-nowrap"
              >
                {MESSAGES.btnNo}
              </button>
            </div>
          </div>
        ) : (
          <div className="box-border flex w-full flex-col items-center justify-center gap-5">
            <h3 className="m-0 text-xl font-black text-slate-700 select-none leading-snug w-full normal-case whitespace-pre-line">
              {MESSAGES.regTitle}
            </h3>
            <button
              type="button"
              onClick={handleOkClick}
              className="flex h-12 w-[160px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-4 text-base font-black tracking-wide text-white uppercase shadow-md outline-none select-none transition-transform active:scale-95 whitespace-nowrap"
            >
              {MESSAGES.regBtn}
            </button>
          </div>
        )}
      </div>
      <style>{`
        .style-border {
          border-color: ${isNotFound ? '#f43f5e' : '#81c714'};
        }
      `}</style>
    </div>
  );
};
