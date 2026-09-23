import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";
import f1 from "@/assets/fruits/fruits_01.png"; import f2 from "@/assets/fruits/fruits_02.png";
import f3 from "@/assets/fruits/fruits_03.png"; import f4 from "@/assets/fruits/fruits_04.png";
import f5 from "@/assets/fruits/fruits_05.png"; import f6 from "@/assets/fruits/fruits_06.png";
import f7 from "@/assets/fruits/fruits_07.png"; import f8 from "@/assets/fruits/fruits_08.png";
import f9 from "@/assets/fruits/fruits_09.png"; import f10 from "@/assets/fruits/fruits_10.png";
import f11 from "@/assets/fruits/fruits_11.png"; import f12 from "@/assets/fruits/fruits_12.png";
import f13 from "@/assets/fruits/fruits_13.png"; import f14 from "@/assets/fruits/fruits_14.png";
import f15 from "@/assets/fruits/fruits_15.png"; import f16 from "@/assets/fruits/fruits_16.png";

const URLS = [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16];

export const CaptchaBlockModal = () => {
  const { isLogin, loginSel, registerSel, generateNewOrder, resetStore } = useRegistrationStep3Store();
  const selected = isLogin ? loginSel : registerSel;

  return (
    <div className="animate-fade-in pointer-events-none absolute top-1/2 left-1/2 z-[99] -translate-x-1/2 -translate-y-1/2">
      <div className="pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 border-red-500 bg-white px-5 py-6 text-center shadow-2xl landscape:gap-3 landscape:py-4">
        <h3 className="m-0 w-full text-xl leading-snug font-black whitespace-pre-line text-slate-700 select-none landscape:text-base">Код запутался.\nНачнем сначала?</h3>
        <div className="flex h-7 w-full items-center justify-center gap-1.5 select-none">
          {selected.map((id, idx) => {
            const url = URLS[id >= 1 && id <= 16 ? id - 1 : id];
            return url ? <img key={idx} src={url} width="28" height="28" className="block h-7 w-7 object-contain" alt="" /> : null;
          })}
        </div>
        <button type="button" onClick={() => { resetStore(true); generateNewOrder(); }} className="flex h-12 w-[190px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#f97316] to-[#ea580c] px-4 text-base font-black whitespace-nowrap text-white uppercase shadow-md transition-transform outline-none select-none active:scale-95">Выбрать заново</button>
      </div>
    </div>
  );
};
