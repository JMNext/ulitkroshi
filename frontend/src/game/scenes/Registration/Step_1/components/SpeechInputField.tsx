import { RefObject } from 'react';
import { Scene } from 'phaser';
import { SpeechMicButton } from './SpeechMicButton';

interface SpeechInputFieldProps {
  scene: Scene;
  inputValue: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onValueChange: (val: string) => void;
  onSpeechResult: (recognizedName: string) => void;
  onSpeechError: () => void;
  onSubmit: (val: string) => void;
}

export const SpeechInputField = ({
  scene,
  inputValue,
  inputRef,
  onValueChange,
  onSpeechResult,
  onSpeechError,
  onSubmit
}: SpeechInputFieldProps) => {
  return (
    <div className="flex flex-col-reverse items-center gap-6 w-full px-4 box-border mt-4">
      <SpeechMicButton 
        scene={scene}
        onSpeechResult={onSpeechResult} 
        onSpeechError={onSpeechError} 
      />
      <input
        ref={inputRef}
        type="text"
        placeholder="Как меня зовут?"
        value={inputValue}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => { 
          if (e.key === 'Enter') {
            inputRef.current?.blur();
            onSubmit(inputValue); 
          }
        }}
        className="pointer-events-auto w-full max-w-[360px] h-[64px] bg-white text-center text-2xl font-bold rounded-full shadow-lg border border-slate-100 outline-none text-emerald-800 placeholder-slate-400 focus:border-emerald-500 transition-colors box-border"
      />
    </div>
  );
};
