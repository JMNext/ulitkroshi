import { clsx } from "clsx";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

const MSG = {
  title: "Этот номер телефона\nуже зарегистрирован!",
  sub: "Пожалуйста, измените номер\nили вернитесь в Главное меню.",
  edit: "Изменить номер", menu: "Главное меню"
} as const;

export const PhoneExistsModal = () => {
  const click = (cb: () => void) => { (document.activeElement as HTMLElement)?.blur?.(); cb(); };

  return (
    <div className="animate-fade-in pointer-events-none absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
      <div className="pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 bg-white px-5 py-6 text-center shadow-2xl border-[#ff4d4f] landscape:gap-4 landscape:py-5">
        <div className="box-border flex flex-col gap-2 select-none">
          <h3 className="m-0 text-xl leading-snug font-black whitespace-pre-line text-slate-800">{MSG.title}</h3>
          <p className="m-0 text-sm leading-normal font-medium whitespace-pre-line text-slate-500">{MSG.sub}</p>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-3">
          <button type="button" onClick={() => click(() => useRegistrationStep2Store.setState({ registerMode: "phone", registerError: "" }))} className="flex h-12 w-[200px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-4 text-base font-black text-white uppercase shadow-md transition-transform active:scale-95 outline-none select-none">{MSG.edit}</button>
          <button type="button" onClick={() => click(() => useRegistrationStep2Store.getState().cancelToMainMenu())} className="flex h-12 w-[200px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#ff4d4f] to-[#d9363e] px-4 text-base font-black text-white uppercase shadow-md transition-transform active:scale-95 outline-none select-none">{MSG.menu}</button>
        </div>
      </div>
    </div>
  );
};
