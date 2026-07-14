import { useState, useEffect, useRef } from 'react';
import { Scene } from 'phaser';
import microphoneBtnImg from '/src/assets/registration/microphone_button.png';

interface SpeechMicButtonProps {
  scene: Scene;
  onSpeechResult: (text: string) => void;
  onSpeechError: () => void;
}

interface ISpeechAlternative {
  transcript: string;
}

interface ISpeechResult {
  [index: number]: ISpeechAlternative;
}

interface ISpeechRecognitionResultList {
  [index: number]: ISpeechResult;
}

interface ISpeechRecognitionEvent {
  results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: () => void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onerror: (event: ISpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  abort: () => void;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
}

export const SpeechMicButton = ({ scene, onSpeechResult, onSpeechError }: SpeechMicButtonProps) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 767);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const fallbackTimerRef = useRef<Phaser.Time.TimerEvent | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 767);
    };
    window.addEventListener('resize', handleResize);

    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Web Speech API не поддерживается. Будет использован фолбек.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'ru-RU';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: ISpeechRecognitionEvent) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const speechToText = event.results[0][0].transcript;
        if (speechToText && speechToText.trim()) {
          const formatted = speechToText.trim().charAt(0).toUpperCase() + speechToText.trim().slice(1);
          onSpeechResult(formatted);
        }
      }
    };

    rec.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.error('Ошибка распознавания речи:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'not-allowed') {
        onSpeechError();
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      window.removeEventListener('resize', handleResize);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.warn('Не удалось сбросить распознавание речи:', e);
        }
      }
      if (fallbackTimerRef.current) {
        fallbackTimerRef.current.remove();
      }
    };
  }, [onSpeechResult, onSpeechError]);

  const runFallbackTimer = () => {
    setIsListening(true);

    fallbackTimerRef.current = scene.time.delayedCall(2000, () => {
      setIsListening(false);
      if (Math.random() > 0.3) {
        onSpeechResult('Булька');
      } else {
        onSpeechError();
      }
      fallbackTimerRef.current = null;
    });
  };

  const handleMicClick = () => {
    if (isListening) return;
    
    if (!recognitionRef.current) {
      runFallbackTimer();
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Не удалось запустить микрофон:', e);
      setIsListening(false);
    }
  };

  const buttonSizeClass = isMobile ? 'w-[130px] h-[130px]' : 'w-[180px] h-[180px]';

  return (
    <button 
      onClick={handleMicClick} 
      disabled={isListening} 
      className={`pointer-events-auto transition-all duration-300 flex items-center justify-center rounded-full border-none bg-transparent p-0 ${buttonSizeClass}
        ${isListening 
          ? 'animate-pulse scale-105 shadow-[0_0_30px_rgba(16,185,129,0.6)] brightness-110' 
          : 'active:scale-95 cursor-pointer'
        }
      `}
    >
      <img 
        src={microphoneBtnImg} 
        className="w-full h-full object-contain" 
        alt="микрофон" 
      />
    </button>
  );
};
