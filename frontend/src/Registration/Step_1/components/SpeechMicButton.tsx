import { useEffect, useRef } from "react";
import { useRegistrationStep1Store } from "../store/useRegistrationStep1Store";
import micBtnImg from "/src/assets/registration/microphone_button.png";

// Расширяем глобальный интерфейс Window
declare global {
  interface Window {
    __globalBgAudio?: HTMLAudioElement;
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

const toggleGlobalAudio = (play: boolean) => {
  const audio = window.__globalBgAudio;
  if (!audio) return;
  if (play) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
};

export const SpeechMicButton = () => {
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const { setSpeechResult, setSpeechError, setInput } = useRegistrationStep1Store();

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const rec = new SpeechRecognitionClass();
    rec.continuous = false;
    rec.lang = "ru-RU";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      isListeningRef.current = true;
      toggleGlobalAudio(false);
    };

    rec.onend = () => {
      isListeningRef.current = false;
    };

    rec.onerror = (e: any) => {
      isListeningRef.current = false;
      toggleGlobalAudio(true);
      if (e.error !== "aborted" && ["no-speech", "audio-capture", "not-allowed"].includes(e.error)) {
        setSpeechError();
      }
    };

    rec.onresult = (e: any) => {
      isListeningRef.current = false;
      toggleGlobalAudio(true);
      const text = e.results?.[0]?.[0]?.transcript;
      if (text) {
        setSpeechResult(text.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s-]/g, ""));
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      }
    };
  }, [setSpeechError, setSpeechResult]);

  const handleMicClick = () => {
    setInput("");
    (document.activeElement as HTMLElement)?.blur?.();

    if (!recognitionRef.current) {
      toggleGlobalAudio(false);
      setTimeout(() => {
        if (Math.random() > 0.3) {
          setSpeechResult(`Крош${Math.floor(100 + Math.random() * 900)}`);
        } else {
          setSpeechError();
        }
        toggleGlobalAudio(true);
      }, 1000);
      return;
    }

    if (isListeningRef.current) {
      recognitionRef.current.abort();
      isListeningRef.current = false;
      toggleGlobalAudio(true);
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <button
      type="button"
      onClick={handleMicClick}
      className="pointer-events-auto m-0 box-border flex h-[100px] w-[100px] cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 transition-all duration-75 outline-none active:scale-95"
    >
      <img src={micBtnImg} className="pointer-events-none block h-full w-full object-contain" alt="Микрофон" />
    </button>
  );
};
