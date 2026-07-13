import { setRegistrationModeUI, setRegistrationPhoneUI, setRegistrationCodeUI, setRegistrationSecsUI, destroyRegistrationUI_Step2 } from './RegistrationUI_Step2';

export class RegistrationLogic_Step2 {
  private scene: any;
  private phone: string = '';
  private code: string = '';
  private secs: number = 60;
  private mode: 'phone' | 'sent' | 'code' = 'phone';
  private timer: Phaser.Time.TimerEvent | null = null;
  private onCompleteCallback: (() => void) | null = null;

  constructor(scene: any, onComplete: () => void) {
    this.scene = scene;
    this.onCompleteCallback = onComplete;
    window.addEventListener('keydown', this.onKb);
    setTimeout(() => setRegistrationPhoneUI(this.fmtPhone()), 0);
  }

  public handleKeyPress = (key: string): void => {
    if (this.mode === 'sent') return;

    if (this.mode === 'phone') {
      if (key === 'BACKSPACE') {
        this.phone = this.phone.slice(0, -1);
      } else if (/^\d$/.test(key) && this.phone.length < 10) {
        this.phone += key;
      }
      setRegistrationPhoneUI(this.fmtPhone());
    } else if (this.mode === 'code') {
      if (key === 'BACKSPACE') {
        this.code = this.code.slice(0, -1);
      } else if (/^\d$/.test(key) && this.code.length < 4) {
        this.code += key;
        if (this.code.length === 4) {
          this.scene.time.delayedCall(600, () => this.done());
        }
      }
      setRegistrationCodeUI(this.code);
    }
  };

  private onKb = (e: KeyboardEvent): void => {
    if (e.key === 'Backspace') this.handleKeyPress('BACKSPACE');
    else if (e.key === 'Enter' && this.mode === 'phone' && this.phone.length === 10) this.sendPhone();
    else if (/^\d$/.test(e.key)) this.handleKeyPress(e.key);
  };

  public sendPhone = (): void => {
    if (this.phone.length < 10) return;
    this.mode = 'sent';
    setRegistrationModeUI('sent');
    setRegistrationPhoneUI(this.fmtPhone());
  };

  public goCode = (): void => {
    this.mode = 'code';
    setRegistrationModeUI('code');
    this.startTimer();
  };

  public resend = (): void => {
    this.secs = 60;
    this.code = '';
    setRegistrationCodeUI('');
    setRegistrationSecsUI(this.secs);
    this.startTimer();
  };

  private done = (): void => {
    this.destroy();
    destroyRegistrationUI_Step2();
    if (this.onCompleteCallback) this.onCompleteCallback();
  };

  private startTimer = (): void => {
    this.stopTimer();
    this.timer = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.secs > 0) {
          this.secs--;
          setRegistrationSecsUI(this.secs);
        } else {
          this.stopTimer();
        }
      },
    });
  };

  private stopTimer = (): void => {
    if (this.timer) { 
      this.timer.remove(); 
      this.timer = null; 
    }
  };

  private fmtPhone = (): string => {
    const d = this.phone;
    if (this.mode === 'sent') {
      return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
    }
    let f = '+7 ( ';
    for (let i = 0; i < 10; i++) {
      f += i < d.length ? d[i] : '_';
      if (i === 2) f += ' ) ';
      if (i === 5 || i === 7) f += ' - ';
    }
    return f;
  };

  public getPhoneLength = (): number => {
    return this.phone.length;
  };

  public destroy = (): void => {
    window.removeEventListener('keydown', this.onKb);
    this.stopTimer();
  };
}
