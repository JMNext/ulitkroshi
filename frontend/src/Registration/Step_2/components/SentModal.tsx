import { clsx } from "clsx";
import { useContext } from "react";
import { PhaserGameContext } from "../Step2UiManager";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

export const SentModal = () => {
  const phaserScene = useContext(PhaserGameContext);
  const { errorMessage, confirmSent, setIsLogin, resetStore } = useRegistrationStep2Store();
  const isNotFound = errorMessage === "user_not_found";

  const handleOkClick = () => {
    (document.activeElement as HTMLElement)?.blur?.();
    confirmSent();
  };

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

  return (
    <div className="animate-fade-in pointer-events-none absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
      <div
        className={clsx(
          "pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 bg-white px-5 py-6 text-center shadow-2xl landscape:gap-4 landscape:py-5",
          isNotFound ? "border-rose-500" : "border-[#81c714]"
        )}
      >
        {isNotFound ? (
          <div className="box-border flex w-full flex-col items-center justify-center gap-5">
            <h3 className="m-0 w-full text-xl leading-snug font-black whitespace-pre-line text-slate-700 normal-case select-none">
              Не нашли тебя в системе.{"\n"}Хочешь зарегистрироваться?
            </h3>
            <div className="flex w-full items-center justify-center gap-4 px-2">
              <button
                type="button"
                onClick={handleYesClick}
                className="flex h-12 flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] text-base font-black whitespace-nowrap text-white uppercase shadow-md transition-transform outline-none active:scale-95"
              >
                ДА!
              </button>
              <button
                type="button"
                onClick={() => phaserScene?.scene.switch("LoginScene")}
                className="flex h-12 flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-rose-500 to-rose-600 text-base font-black whitespace-nowrap text-white uppercase shadow-md transition-transform outline-none active:scale-95"
              >
                НЕТ
              </button>
            </div>
          </div>
        ) : (
          <div className="box-border flex w-full flex-col items-center justify-center gap-5">
            <h3 className="m-0 w-full text-xl leading-snug font-black whitespace-pre-line text-slate-700 normal-case select-none">
              Отправили смс{"\n"}на твой номер!
            </h3>
            <button
              type="button"
              onClick={handleOkClick}
              className="flex h-12 w-[160px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-4 text-base font-black whitespace-nowrap text-white uppercase shadow-md transition-transform outline-none active:scale-95"
            >
              ОК!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
