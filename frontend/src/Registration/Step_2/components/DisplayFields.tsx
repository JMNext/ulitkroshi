import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

const format = (phone: string) => {
  const p = phone.padEnd(10, "_");
  return `+7 ( ${p.slice(0, 3)} ) ${p.slice(3, 6)} - ${p.slice(6, 8)} - ${p.slice(8, 10)}`;
};

export const DisplayFields = () => {
  const { isLogin, loginRawPhone, loginError, registerMode, registerCode, registerRawPhone, registerError } = useRegistrationStep2Store();

  const mode = isLogin ? "phone" : registerMode;
  const err = isLogin ? loginError : registerError;
  const text = mode === "code" && err !== "user_not_found" ? registerCode.padEnd(4, "_").split("").join(" ") : format(isLogin ? loginRawPhone : registerRawPhone);

  return (
    <div className="pointer-events-none relative flex h-[76px] w-[460px] shrink-0 origin-center items-center justify-center font-black text-slate-700 transition-all duration-150 select-none">
      <div className="box-border flex h-full w-full items-center justify-center rounded-[38px] border border-slate-100 bg-white px-6 text-center shadow-md">
        <span className="block w-full truncate text-[22px] font-black tracking-wider">{text}</span>
      </div>
    </div>
  );
};
