import { useEffect, useRef } from 'react';
import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

export const SpeechInputField = ({ scene }: { scene?: Phaser.Scene }) => {
  const { input, setInput, submit, nameStatus, nameSuggestions, isNameChecking, stage, selectSuggestion } = useRegistrationStep1Store();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scene) return;
    const handleSetText = (text: string) => {
      setInput(text);
      if (inputRef.current) inputRef.current.focus();
    };
    scene.events.on('set_input_text', handleSetText);
    return () => { scene.events.off('set_input_text', handleSetText); };
  }, [scene, setInput]);

  const handleFocus = () => {
    if (window.visualViewport) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 300);
    }
  };

  if (stage !== 1 && stage !== 3) return null;

  return (
    <div className="flex flex-col items-center box-border w-full px-4 gap-3 mx-auto">
      <input
        ref={inputRef}
        type="text"
        placeholder={isNameChecking ? "Проверяю имя..." : "Как меня зовут?"}
        disabled={isNameChecking}
        value={input}
        onFocus={handleFocus}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { 
          if (e.key === 'Enter' && !isNameChecking && input.trim()) {
            e.preventDefault();
            if (inputRef.current) {
              inputRef.current.blur();
            }
            submit(input); 
          }
        }}
        className="border bg-white text-center font-black rounded-full shadow-md border-slate-100 outline-none text-emerald-800 placeholder-slate-400 box-border tracking-wide disabled:opacity-75 w-full text-[22px] px-8 py-4 h-[68px]"
      />

      {nameStatus === 'taken' && nameSuggestions.length > 0 && !isNameChecking && (
        <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-hidden">
          {nameSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                selectSuggestion(suggestion);
                if (inputRef.current) inputRef.current.blur();
              }}
              className="bg-gradient-to-b from-sky-50 to-sky-100 font-extrabold text-sky-800 rounded-full border-2 border-sky-400/80 shadow-sm flex items-center justify-center transition-all duration-100 leading-none shrink-0 outline-none text-[16px] p-[12px_20px] active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
