import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

// Вынесли маску телефона в чистую читалку подстрок
const formatPhoneNumber = (phone: string): string => {
  const p = phone.padEnd(10, "_");
  return `+7 ( ${p.slice(0, 3)} ) ${p.slice(3, 6)} - ${p.slice(6, 8)} - ${p.slice(8, 10)}`;
};

export const DisplayFields = () => {
  const { mode, code, rawPhone, errorMessage } = useRegistrationStep2Store();

  // Прямое и плоское вычисление текста без циклов
  const displayText = mode === "code" && errorMessage !== "user_not_found"
    ? code.padEnd(4, "_").split("").join(" ")
    : formatPhoneNumber(rawPhone);

  return (
    <div className="pointer-events-none relative flex h-[76px] w-[460px] shrink-0 origin-center items-center justify-center font-black text-slate-700 transition-all duration-150 select-none">
      <div className="box-border flex h-full w-full items-center justify-center rounded-[38px] border border-slate-100 bg-white px-6 text-center shadow-md">
        <span className="block w-full truncate text-[22px] font-black tracking-wider">{displayText}</span>
      </div>
    </div>
  );
};
