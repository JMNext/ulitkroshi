import { useRef } from "react";
import { useRegistrationStep1Store } from "../store/useRegistrationStep1Store";

export const SpeechInputField = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { input, isNameChecking, setInput, submit } = useRegistrationStep1Store();

  const handleProceed = () => {
    const val = input.trim();
    if (!isNameChecking && val) {
      submit(val);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleProceed();
    }
  };

  const hasName = input.trim().length > 0;

  return (
    <div className="relative mx-auto box-border flex w-[380px] max-w-[90vw] flex-col items-center justify-center">
      <div className="relative w-full flex items-center justify-center">
        <input
          ref={inputRef}
          type="text"
          maxLength={15}
          value={input}
          onKeyDown={handleKeyDown}
          disabled={isNameChecking}
          placeholder={isNameChecking ? "Проверяю имя..." : "Как меня зовут?"}
          onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ0-9-]/g, ""))}
          className="pointer-events-auto mx-auto box-border block h-[52px] w-full touch-manipulation rounded-[26px] border-2 border-slate-200 bg-white pl-6 pr-14 text-center text-[20px] font-black text-[#065f46] antialiased placeholder-slate-400 shadow-[0_4px_16px_rgba(129,199,20,0.3)] transition-all duration-200 outline-none focus:border-[#81c714] focus:shadow-[0_0_20px_rgba(129,199,20,0.5)] disabled:opacity-70"
        />

        {hasName && (
          <button
            type="button"
            onClick={handleProceed}
            className="pointer-events-auto absolute right-1.5 top-1/2 flex h-[40px] w-[40px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#559404] text-white shadow-md transition-transform duration-100 outline-none active:scale-90 hover:scale-105"
            title="Продолжить"
          >
            <svg className="h-5 w-5 stroke-[3] fill-none stroke-current" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
