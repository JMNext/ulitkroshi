import { useState, useEffect, useRef } from 'react';
import microphoneBtnImg from '/src/assets/registration/microphone_button.png';
import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventMock extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionMock extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((ev: SpeechRecognitionEventMock) => void) | null;
  start(): void;
  abort(): void;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionMock;
  webkitSpeechRecognition?: new () => SpeechRecognitionMock;
}

export const SpeechMicButton = ({ scene }: { scene?: Phaser.Scene }) => {
  const [isListening, setIsListening] = useState(false);
  const { stage, setSpeechResult, setSpeechError } = useRegistrationStep1Store();
  const recRef = useRef<SpeechRecognitionMock | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refs = useRef({ setSpeechResult, setSpeechError, scene });
  useEffect(() => { 
    refs.current = { setSpeechResult, setSpeechError, scene }; 
  }, [setSpeechResult, setSpeechError, scene]);

  useEffect(() => {
    const win = window as WindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    Object.assign(rec, { continuous: false, lang: 'ru-RU', interimResults: false, maxAlternatives: 1 });

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (e.error !== 'aborted' && ['no-speech', 'audio-capture', 'not-allowed'].includes(e.error)) {
        refs.current.setSpeechError();
      }
    };
    
    rec.onresult = (e: SpeechRecognitionEventMock) => {
      const text = e.results?.[0]?.[0]?.transcript;
      if (text) refs.current.setSpeechResult(text);
    };

    recRef.current = rec;

    const handleAbort = () => {
      if (timerRef.current) { 
        clearTimeout(timerRef.current); 
        timerRef.current = null; 
      }
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
        Math.random() > 0.3 ? refs.current.setSpeechResult('Булька') : refs.current.setSpeechError();
      }, 2000);
      return;
    }
    try { recRef.current.start(); } catch { setIsListening(false); }
  };

  return (
    <button 
      type="button"
      onClick={handleMicClick} 
      className={`transition-all duration-300 flex items-center justify-center rounded-full border-none bg-transparent outline-none active:scale-95 w-[140px] h-[140px] ${
        isListening ? 'animate-pulse scale-105 shadow-[0_0_12px_#10b981]/50 brightness-110' : 'scale-100'
      }`}
    >
      <img src={microphoneBtnImg} className="w-full h-full object-contain" alt="Запись" />
    </button>
  );
};
