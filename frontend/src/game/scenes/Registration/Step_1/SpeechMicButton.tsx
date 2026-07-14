import React, { useState, useEffect, useRef } from 'react';

interface SpeechMicButtonProps {
  scene: any;
  onSpeechResult: (text: string) => void;
  onSpeechError: () => void;
}

export const SpeechMicButton: React.FC<SpeechMicButtonProps> = ({ scene, onSpeechResult, onSpeechError }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fallbackTimerRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
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

    rec.onresult = (event: any) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const speechToText = event.results[0][0].transcript;
        if (speechToText && speechToText.trim()) {
          const formatted = speechToText.trim().charAt(0).toUpperCase() + speechToText.trim().slice(1);
          onSpeechResult(formatted);
        }
      }
    };

    rec.onerror = (event: any) => {
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
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

  return (
    <button 
      onClick={handleMicClick} 
      disabled={isListening} 
      className={`pointer-events-auto transition-all duration-300 flex items-center justify-center w-[180px] h-[180px] rounded-full
        ${isListening 
          ? 'animate-pulse scale-105 shadow-[0_0_30px_rgba(16,185,129,0.6)] brightness-110' 
          : 'active:scale-95 cursor-pointer'
        }
      `}
    >
      <img 
        src="/assets/registration/microphone_button.png" 
        className="w-full h-full object-contain" 
        alt="микрофон" 
      />
    </button>
  );
};
