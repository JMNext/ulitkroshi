import { clsx } from "clsx";
import { useContext } from "react";
import { PhaserGameContext } from "../Step2UiManager";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";
import { useLoginStore } from "@/LoginScene/store/useLoginStore";

const MESSAGES = {
  title: "Не нашли тебя в системе.\nХочешь зарегистрироваться?",
  btnYes: "ДА!",
  btnNo: "НЕТ"
} as const;

export const UserNotFoundModal = () => {
  const phaserScene = useContext(PhaserGameContext);
  const { setIsLogin, resetStore } = useRegistrationStep2Store();

  const handleYesClick = () => {
    localStorage.removeItem("login_phone_buffer");
    localStorage.removeItem("saved_user_phone");
    sessionStorage.setItem("force_registration_flow", "true");
    setIsLogin(false);
    resetStore();
    if (phaserScene) {
      phaserScene.scene.start("Step1Scene");
    }
  };

  const handleNoClick = () => {
    if (useLoginStore.getState().resetStore) {
      useLoginStore.getState().resetStore();
    } else {
      useLoginStore.setState({ status: "button" });
    }

    resetStore();
    phaserScene?.scene.start("LoginScene");
  };

  return (
    <div className="animate-fade-in pointer-events-none absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
      <div
        className={clsx(
          "pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 bg-white px-5 py-6 text-center shadow-2xl landscape:gap-4 landscape:py-5",
          "border-rose-500"
        )}
      >
        <div className="box-border flex w-full flex-col items-center justify-center gap-5">
          <h3 className="m-0 w-full text-xl leading-snug font-black whitespace-pre-line text-slate-700 normal-case select-none">
            {MESSAGES.title}
          </h3>
          <div className="flex w-full items-center justify-center gap-4 px-2">
            <button
              type="button"
              onClick={handleYesClick}
              className="flex h-12 flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] text-base font-black whitespace-nowrap text-white uppercase shadow-md transition-transform duration-100 outline-none active:scale-95"
            >
              {MESSAGES.btnYes}
            </button>
            <button
              type="button"
              onClick={handleNoClick}
              className="flex h-12 flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-rose-500 to-rose-600 text-base font-black whitespace-nowrap text-white uppercase shadow-md transition-transform duration-100 outline-none active:scale-95"
            >
              {MESSAGES.btnNo}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
