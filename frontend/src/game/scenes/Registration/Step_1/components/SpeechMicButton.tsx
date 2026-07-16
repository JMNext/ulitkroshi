import React, { useState, useEffect, useRef } from 'react';
import microphoneBtnImg from '/src/assets/registration/microphone_button.png';

interface SpeechMicButtonProps {
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

export const SpeechMicButton = ({ onSpeechResult, onSpeechError }: SpeechMicButtonProps) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
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
        if (speechToText) {
          onSpeechResult(speechToText);
        }
      }
    };

    rec.onerror = (event: ISpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (['no-speech', 'audio-capture', 'not-allowed'].includes(event.error)) {
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
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, [onSpeechResult, onSpeechError]);

  const runFallbackTimer = () => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }

    setIsListening(true);

    fallbackTimerRef.current = setTimeout(() => {
      setIsListening(false);
      if (Math.random() > 0.3) {
        onSpeechResult('Булька');
      } else {
        onSpeechError();
      }
      fallbackTimerRef.current = null;
    }, 2000);
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
      setIsListening(false);
    }
  };

  return (
    <button 
      type="button"
      onClick={handleMicClick} 
      aria-busy={isListening}
      aria-label={isListening ? "Идёт запись" : "Нажать для ввода голосом"}
      className={`speech-mic-btn ${isListening ? 'speech-mic-btn-listening' : ''}`}
    >
      <img src={microphoneBtnImg} className="w-full h-full object-contain" alt="" />
    </button>
  );
};
