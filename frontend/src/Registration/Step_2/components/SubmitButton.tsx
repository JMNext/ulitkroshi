import { clsx } from "clsx";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

export const SubmitButton = () => {
  const { isLogin, loginRawPhone, registerRawPhone, sendLoginPhone, sendRegisterPhone } = useRegistrationStep2Store();

  const currentRawPhone = isLogin ? loginRawPhone : registerRawPhone;
  const isReady = currentRawPhone.length === 10;

  const handleClick = () => {
    (document.activeElement as HTMLElement)?.blur?.();
    if (isLogin) {
      sendLoginPhone();
    } else {
      sendRegisterPhone();
    }
  };

  return (
    <div className="pointer-events-auto relative flex h-[76px] w-[460px] shrink-0 origin-center items-center justify-center font-black select-none">
      <button
        type="button"
        disabled={!isReady}
        onClick={handleClick}
        className={clsx(
          "box-border flex h-full w-full items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-6 text-[24px] font-black tracking-wide text-white uppercase",
          isReady
            ? "cursor-pointer touch-manipulation shadow-md transition-transform duration-100 active:scale-95"
            : "cursor-not-allowed opacity-40 outline-none"
        )}
      >
        Отправить
      </button>
    </div>
  );
};
