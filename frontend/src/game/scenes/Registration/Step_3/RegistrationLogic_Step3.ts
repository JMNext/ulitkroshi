import { 
  setRegistrationCaptchaModeUI, 
  setRegistrationSelectedFruitsUI, 
  setRegistrationCorrectFruitsUI,
  triggerRegistrationShakeUI 
} from './RegistrationUI_Step3';

export class RegistrationLogic_Step3 {
  private correct: number[] = [];
  private selected: number[] = [];
  private mode: 'select' | 'confirm' | 'verify' | 'error' = 'select';
  private onCompleteCallback: () => void;

  constructor(onComplete: () => void) {
    this.onCompleteCallback = onComplete;
  }

  public getMode = (): 'select' | 'confirm' | 'verify' | 'error' => this.mode;
  public getSelected = (): number[] => this.selected;
  public getCorrect = (): number[] => this.correct;

  public handleFruitToggle = (idx: number): void => {
    if (this.mode === 'confirm') return;
    
    if (this.mode === 'error') {
      this.mode = 'verify';
      setRegistrationCaptchaModeUI('verify');
      this.selected = [];
    }

    const foundIdx = this.selected.indexOf(idx);
    if (foundIdx > -1) {
      this.selected.splice(foundIdx, 1);
    } else if (this.selected.length < 4) {
      this.selected.push(idx);
      
      if (this.selected.length === 4) {
        if (this.mode === 'select') {
          this.correct = [...this.selected];
          this.mode = 'confirm';
          setRegistrationCaptchaModeUI('confirm');
          setRegistrationCorrectFruitsUI([...this.correct]);
        } else if (this.mode === 'verify') {
          const isCorrect = this.selected.every((val) => this.correct.includes(val));
          if (isCorrect) {
            this.done();
          } else {
            this.mode = 'error';
            this.selected = [];
            triggerRegistrationShakeUI();
            setRegistrationCaptchaModeUI('error');
          }
        }
      }
    }
    setRegistrationSelectedFruitsUI([...this.selected]);
  };

  public handleConfirmYes = (): void => {
    this.mode = 'verify';
    this.selected = [];
    setRegistrationCaptchaModeUI('verify');
    setRegistrationSelectedFruitsUI([]);
  };

  public handleResetClick = (): void => {
    this.selected = [];
    this.correct = [];
    this.mode = 'select';
    setRegistrationCaptchaModeUI('select');
    setRegistrationSelectedFruitsUI([]);
    setRegistrationCorrectFruitsUI([]);
  };

  private done = (): void => {
    if (this.onCompleteCallback) this.onCompleteCallback();
  };
}
