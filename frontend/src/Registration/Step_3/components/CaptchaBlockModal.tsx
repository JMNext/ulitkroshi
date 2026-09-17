import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";
import { FRUIT_URLS } from "./fruitAssets";

const MESSAGES = {
  title: "Код запутался.\nНачнем сначала?",
  btnReset: "Выбрать заново"
} as const;

export const CaptchaBlockModal = () => {
  const { isLogin, loginSel, registerSel, generateNewOrder, resetStore } = useRegistrationStep3Store();

  const selected = isLogin ? loginSel : registerSel;

  const handleResetClick = () => {
    resetStore(true);
    generateNewOrder();
  };

  return (
    <div className="animate-fade-in pointer-events-none absolute top-1/2 left-1/2 z-[99] -translate-x-1/2 -translate-y-1/2">
      <div className="pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 border-red-500 bg-white px-5 py-6 text-center shadow-2xl landscape:gap-3 landscape:py-4">
        <h3 className="m-0 w-full text-xl leading-snug font-black whitespace-pre-line text-slate-700 normal-case select-none landscape:text-base">
          {MESSAGES.title}
        </h3>

        <div className="flex h-7 w-full items-center justify-center gap-1.5 select-none">
          {selected.map((id, idx) => {
            const url = FRUIT_URLS[id];
            if (!url) return null;

            return <img key={idx} src={url} width="28" height="28" className="block h-7 w-7 object-contain" alt="" />;
          })}
        </div>

        <button
          type="button"
          onClick={handleResetClick}
          className="flex h-12 w-[190px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#f97316] to-[#ea580c] px-4 text-base font-black tracking-wide whitespace-nowrap text-white uppercase shadow-md transition-transform outline-none select-none active:scale-95"
        >
          {MESSAGES.btnReset}
        </button>
      </div>
    </div>
  );
};
