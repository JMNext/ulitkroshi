import { useState, useEffect, useRef } from 'react';
import microphoneBtnImg from '/src/assets/registration/microphone_button.png';
import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

interface SpeechMicButtonProps {
  onSpeechResult: (text: string) => void;
  onSpeechError: () => void;
  scene?: Phaser.Scene;
}

export const SpeechMicButton = ({ onSpeechResult, onSpeechError, scene }: SpeechMicButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const { stage } = useRegistrationStep1Store();
  const recRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const refs = useRef({ onSpeechResult, onSpeechError, scene });
  useEffect(() => { refs.current = { onSpeechResult, onSpeechError, scene }; }, [onSpeechResult, onSpeechError, scene]);

  useEffect(() => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    Object.assign(rec, { continuous: false, lang: 'ru-RU', interimResults: false, maxAlternatives: 1 });

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = (e: any) => {
      setIsListening(false);
      if (e.error !== 'aborted' && ['no-speech', 'audio-capture', 'not-allowed'].includes(e.error)) {
        refs.current.onSpeechError();
      }
    };
    
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript;
      if (text) refs.current.onSpeechResult(text);
    };

    recRef.current = rec;

    const handleAbort = () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      setIsListening(false);
      try { recRef.current?.abort(); } catch {}
    };

    refs.current.scene?.events.on('mic_abort', handleAbort);
    return () => {
      refs.current.scene?.events.off('mic_abort', handleAbort);
      if (timerRef.current) clearTimeout(timerRef.current);
      try { recRef.current?.abort(); } catch {}
    };
  }, []);

  if (stage !== 1 && stage !== 3) return null;

  const handleMicClick = () => {
    if (isListening) return;
    if (!recRef.current) {
      setIsListening(true);
      timerRef.current = setTimeout(() => {
        setIsListening(false);
        Math.random() > 0.3 ? refs.current.onSpeechResult('Булька') : refs.current.onSpeechError();
      }, 2000);
      return;
    }
    try { recRef.current.start(); } catch { setIsListening(false); }
  };

  return (
    <button 
      type="button"
      onClick={handleMicClick} 
      className={`transition-all duration-300 flex items-center justify-center rounded-full border-none bg-transparent outline-none active:scale-95 will-change-transform w-[140px] h-[140px] ${
        isListening ? 'animate-pulse scale-105 shadow-[0_0_12px_#10b981]/50 brightness-110' : 'scale-100'
      }`}
    >
      <img src={microphoneBtnImg} className="w-full h-full object-contain" alt="Запись" />
    </button>
  );
};
