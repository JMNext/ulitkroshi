import { setRegistrationStageUI, setRegistrationNameUI, setRegistrationListeningUI } from './RegistrationUI_Step1';

export class RegistrationLogic_Step1 {
  private scene: any;
  private isListening: boolean = false;
  private petName: string = '';

  constructor(scene: any) {
    this.scene = scene;
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
    this.isListening = true;
    setRegistrationListeningUI(true);

    this.scene.time.delayedCall(2000, () => {
      this.isListening = false;
      setRegistrationListeningUI(false);
      if (Math.random() > 0.3) {
        this.handleInputSubmit('Булька');
      } else {
        setRegistrationStageUI(3);
      }
    });
  };
}
