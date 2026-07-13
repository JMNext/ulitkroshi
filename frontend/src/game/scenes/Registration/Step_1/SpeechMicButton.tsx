import React, { useState, useEffect, useRef } from 'react';

interface SpeechMicButtonProps {
  onSpeechResult: (text: string) => void;
  onSpeechError: () => void;
}

export const SpeechMicButton: React.FC<SpeechMicButtonProps> = ({ onSpeechResult, onSpeechError }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Инициализируем Web Speech API при монтировании кнопки
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Web Speech API не поддерживается в этом браузере.');
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
      const speechToText = event.results[0][0].transcript;
      if (speechToText && speechToText.trim()) {
        // Форматируем имя: первая буква заглавная
        const formatted = speechToText.trim().charAt(0).toUpperCase() + speechToText.trim().slice(1);
        onSpeechResult(formatted);
      }
    };

    rec.onerror = (event: any) => {
      console.error('Ошибка распознавания речи:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        onSpeechError();
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    // Очистка при размонтировании кнопки (например, если закрыли экран во время записи)
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Игнорируем ошибки, если запись уже остановлена
        }
      }
    };
  }, [onSpeechResult, onSpeechError]);

  const handleMicClick = () => {
    if (isListening || !recognitionRef.current) return;
    
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
