import React, { useRef } from "react";
import { useRegistrationStep1Store } from "../store/useRegistrationStep1Store";

export const SpeechInputField = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    input,
    isNameChecking,
    setInput,
    submit
  } = useRegistrationStep1Store();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim();
      if (!isNameChecking && trimmed) {
        submit(trimmed);
        inputRef.current?.blur();
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.readOnly = true;
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.readOnly = false;
        inputRef.current.focus();
      }
    }, 40);
  };

  return (
    <div className="box-border flex w-[380px] flex-col items-center justify-center mx-auto relative">
      <input
        ref={inputRef}
        type="text"
        maxLength={15}
        value={input}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        disabled={isNameChecking}
        placeholder={isNameChecking ? "Проверяю имя..." : "Как меня зовут?"}
        className="touch-manipulation pointer-events-auto box-border h-[48px] w-[380px] rounded-[24px] border border-slate-200 bg-white px-6 text-center text-[19px] font-black text-[#065f46] antialiased placeholder-slate-400 shadow-[0_0_15px_rgba(129,199,20,0.25)] transition-all duration-200 outline-none focus:border-[#81c714] focus:shadow-[0_0_20px_rgba(129,199,20,0.5)] disabled:opacity-70 mx-auto block"
        onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ0-9-]/g, ""))}
      />
    </div>
  );
};
