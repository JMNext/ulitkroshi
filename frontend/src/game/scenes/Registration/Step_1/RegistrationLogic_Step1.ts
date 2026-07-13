import { setRegistrationStageUI, setRegistrationNameUI, setRegistrationListeningUI } from './RegistrationUI_Step1';

export class RegistrationLogic_Step1 {
  private scene: any;
  private isListening: boolean = false;
  private petName: string = '';
  private recognition: any = null;
  private fallbackTimer: any = null;

  constructor(scene: any) {
    this.scene = scene;
    this.initSpeechRecognition();
  }

  private initSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Web Speech API не поддерживается в этом браузере.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.lang = 'ru-RU';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      const formattedName = speechToText.trim().charAt(0).toUpperCase() + speechToText.trim().slice(1);
      this.handleInputSubmit(formattedName);
    };

    this.recognition.onend = () => {
      this.stopListeningState();
    };

    this.recognition.onerror = (event: any) => {
      console.error('Ошибка распознавания речи:', event.error);
      this.stopListeningState();
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setRegistrationStageUI(3);
      }
    };
  }

  public handleInputSubmit = (name: string): void => {
    this.petName = name.trim() || 'Булька';
    setRegistrationNameUI(this.petName);
    setRegistrationStageUI(2);
  };

  public handleConfirmYes = (): void => {
    setRegistrationStageUI(4);
  };

  public handleConfirmNo = (): void => {
    setRegistrationStageUI(3);
  };

  public startSpeechRecognition = (): void => {
    if (this.isListening) return;

    if (!this.recognition) {
      this.runFallbackTimer();
      return;
    }

    try {
      this.isListening = true;
      setRegistrationListeningUI(true);
      this.recognition.start();
    } catch (e) {
      console.error('Не удалось запустить распознавание:', e);
      this.stopListeningState();
    }
  };

  private stopListeningState(): void {
    this.isListening = false;
    setRegistrationListeningUI(false);
  }

  private runFallbackTimer(): void {
    this.isListening = true;
    setRegistrationListeningUI(true);

    this.fallbackTimer = this.scene.time.delayedCall(2000, () => {
      this.stopListeningState();
      if (Math.random() > 0.3) {
        this.handleInputSubmit('Булька');
      } else {
        setRegistrationStageUI(3);
      }
      this.fallbackTimer = null;
    });
  }

  public destroy = (): void => {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Игнорируем ошибки, если запись уже остановлена
      }
    }
    if (this.fallbackTimer) {
      this.fallbackTimer.remove();
      this.fallbackTimer = null;
    }
  };
}
