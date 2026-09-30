import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { useRegistrationStep1Store } from "../store/useRegistrationStep1Store";
import micBtnImg from "/src/assets/registration/microphone_button.png";

declare global {
  interface Window {
    __globalBgAudio?: HTMLAudioElement;
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

const toggleAudio = (play: boolean) => {
  const audio = window.__globalBgAudio;
  if (audio) play ? audio.play().catch(() => {}) : audio.pause();
};

export const SpeechMicButton = ({ compact = false }: { compact?: boolean }) => {
  const recRef = useRef<any>(null);
  const isListRef = useRef(false);
  const { setSpeechResult, setSpeechError, setInput } = useRegistrationStep1Store();

  useEffect(() => {
    const Class = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Class) return;

    const rec = new Class();
    rec.continuous = false;
    rec.lang = "ru-RU";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      isListRef.current = true;
      toggleAudio(false);
    };
    rec.onend = () => {
      isListRef.current = false;
    };
    rec.onerror = (e: any) => {
      isListRef.current = false;
      toggleAudio(true);
      if (e.error !== "aborted" && ["no-speech", "audio-capture", "not-allowed"].includes(e.error)) {
        setSpeechError();
      }
    };
    rec.onresult = (e: any) => {
      isListRef.current = false;
      toggleAudio(true);
      const text = e.results?.[0]?.[0]?.transcript;
      if (text) setSpeechResult(text.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s-]/g, ""));
    };

    recRef.current = rec;
    return () => {
      if (recRef.current) {
        recRef.current.onstart = recRef.current.onend = recRef.current.onresult = recRef.current.onerror = null;
        recRef.current.abort();
      }
    };
  }, [setSpeechError, setSpeechResult]);

  const handleMicClick = () => {
    setInput("");
    (document.activeElement as HTMLElement)?.blur?.();

    if (!recRef.current) {
      toggleAudio(false);
      return setTimeout(() => {
        Math.random() > 0.3
          ? setSpeechResult(`Крош${Math.floor(100 + Math.random() * 900)}`)
          : setSpeechError();
        toggleAudio(true);
      }, 1000);
    }

    if (isListRef.current) {
      recRef.current.abort();
      isListRef.current = false;
      toggleAudio(true);
    } else {
      recRef.current.start();
    }
  };

  return (
    <button
      type="button"
      onClick={handleMicClick}
      className={clsx(
        "pointer-events-auto m-0 box-border flex cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 transition-all duration-75 outline-none active:scale-95",
        compact ? "h-[60px] w-[60px]" : "h-[100px] w-[100px]"
      )}
      title="Голосовой ввод имени"
    >
      <img src={micBtnImg} className="pointer-events-none block h-full w-full object-contain" alt="Микрофон" />
    </button>
  );
};
