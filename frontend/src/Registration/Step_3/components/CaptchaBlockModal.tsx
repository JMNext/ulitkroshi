import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";

import fruit01 from "@/assets/fruits/fruits_01.png";
import fruit02 from "@/assets/fruits/fruits_02.png";
import fruit03 from "@/assets/fruits/fruits_03.png";
import fruit04 from "@/assets/fruits/fruits_04.png";
import fruit05 from "@/assets/fruits/fruits_05.png";
import fruit06 from "@/assets/fruits/fruits_06.png";
import fruit07 from "@/assets/fruits/fruits_07.png";
import fruit08 from "@/assets/fruits/fruits_08.png";
import fruit09 from "@/assets/fruits/fruits_09.png";
import fruit10 from "@/assets/fruits/fruits_10.png";
import fruit11 from "@/assets/fruits/fruits_11.png";
import fruit12 from "@/assets/fruits/fruits_12.png";
import fruit13 from "@/assets/fruits/fruits_13.png";
import fruit14 from "@/assets/fruits/fruits_14.png";
import fruit15 from "@/assets/fruits/fruits_15.png";
import fruit16 from "@/assets/fruits/fruits_16.png";

const FRUIT_URLS: string[] = [
  fruit01, fruit02, fruit03, fruit04, fruit05, fruit06, fruit07, fruit08,
  fruit09, fruit10, fruit11, fruit12, fruit13, fruit14, fruit15, fruit16
];

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
            const url = id >= 1 && id <= 16 ? FRUIT_URLS[id - 1] : FRUIT_URLS[id];
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
