import { createRoot, Root } from 'react-dom/client';
import { Scene } from 'phaser';
import React, { useState, useEffect } from 'react';
import { HeaderBlock } from './components/HeaderBlock';
import { DisplayFields } from './components/DisplayFields';
import { SubmitButton } from './components/SubmitButton';
import { SentModal } from './components/SentModal';
import { PinPadWrapper } from './components/PinPadWrapper';

type RegMode = 'phone' | 'sent' | 'code';
type UpdateUiCallback = (phone: string, code: string, mode: RegMode, secs: number) => void;

export class RegistrationLogic_Step2 {
  private regUiRoot: Root | null = null;
  private phone = '';
  private code = '';
  private timer: Phaser.Time.TimerEvent | null = null;
  private updateUI?: UpdateUiCallback;
  private isDestroyed = false; // Флаг защиты

  constructor(private scene: Scene, private onComplete: () => void) {
    window.addEventListener('keydown', this.onKb);
    this.renderUI();
  }

  private renderUI(): void {
    const c = document.createElement('div');
    c.id = 'registration-phone-overlay';
    c.className = 'absolute inset-0 pointer-events-none z-30 flex justify-center';
    document.getElementById('game-container')?.appendChild(c);
    document.getElementById('game-container')?.classList.add('in-registration');

    this.regUiRoot = createRoot(c);
    this.regUiRoot.render(
      <Container 
        onPressKey={(k: string) => this.handleKey(k)} 
        onSend={() => this.sendPhone()} 
        onGoCode={() => this.goCode()} 
        onResend={() => this.resend()}
        bind={(fn: UpdateUiCallback) => { this.updateUI = fn; fn(this.fmt(''), '', 'phone', 60); }} 
      />
    );
  }

  private handleKey(key: string) {
    const isCode = this.timer !== null;
    let target = isCode ? this.code : this.phone;
    if (key === 'BACKSPACE') target = target.slice(0, -1);
    else if (/^\d$/.test(key) && target.length < (isCode ? 4 : 10)) target += key;

    if (isCode) {
      this.code = target;
      if (this.code.length === 4) this.scene.time.delayedCall(600, () => this.destroy(true));
    } else {
      this.phone = target;
    }
    this.sync();
  }

  private onKb = (e: KeyboardEvent) => {
    if (e.key === 'Backspace') this.handleKey('BACKSPACE');
    else if (e.key === 'Enter' && this.phone.length === 10) this.sendPhone();
    else if (/^\d$/.test(e.key)) this.handleKey(e.key);
  };

  private sendPhone() { if (this.phone.length === 10) this.sync('sent'); }
  private goCode() { this.sync('code'); this.startTimer(); }
  private resend() { this.code = ''; this.startTimer(); }

  private startTimer() {
    let secs = 60;
    this.timer?.remove();
    this.timer = this.scene.time.addEvent({
      delay: 1000, loop: true,
      callback: () => { secs--; this.updateUI?.(this.fmt(this.phone), this.code, 'code', secs); if (secs <= 0) this.timer?.remove(); }
    });
  }

  private sync(m: RegMode = this.timer ? 'code' : 'phone') { this.updateUI?.(this.fmt(this.phone), this.code, m, 60); }

  private fmt = (d: string) => {
    if (this.timer || d.length === 0) return d.length === 0 ? '+7 ( _ _ _ ) _ _ _ - _ _ - _ _' : `+7 (${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,8)}-${d.slice(8,10)}`;
    let f = '+7 ( ';
    for (let i = 0; i < 10; i++) { f += i < d.length ? d[i] : '_'; if (i === 2) f += ' ) '; if (i === 5 || i === 7) f += ' - '; }
    return f;
  };

  public destroy = (triggerCallback = false): void => {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    window.removeEventListener('keydown', this.onKb);
    this.timer?.remove();
    this.regUiRoot?.unmount();
    
    document.getElementById('registration-phone-overlay')?.remove();
    document.getElementById('game-container')?.classList.remove('in-registration');
    
    if (triggerCallback) {
      this.onComplete();
    }
  };
}

interface Container2Props {
  onPressKey: (k: string) => void;
  onSend: () => void;
  onGoCode: () => void;
  onResend: () => void;
  bind: (fn: UpdateUiCallback) => void;
}

const Container = ({ onPressKey, onSend, onGoCode, onResend, bind }: Container2Props) => {
  const [state, setState] = useState({ phone: '', code: '', mode: 'phone' as RegMode, secs: 60 });
  const [w, setW] = useState(window.innerWidth);
  const h = window.innerHeight;

  useEffect(() => {
    bind((p: string, c: string, m: RegMode, s: number) => setState({ phone: p, code: c, mode: m, secs: s }));
    const res = () => setW(window.innerWidth);
    window.addEventListener('resize', res);
    return () => window.removeEventListener('resize', res);
  }, [bind]);

  const isPort = w < h, isTab = !isPort && (w / h) < 1.72, isFold = isPort && (w / h) < 0.5;
  const scale = isFold ? Math.min(w / 390, 0.8) : (isPort ? 0.85 : (h < 650 ? 0.72 : 0.82));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden h-[100dvh] z-30 flex items-center justify-center p-4 box-border">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }} className={`pointer-events-none flex flex-col items-center ${isFold ? 'w-[95vw]' : (isPort ? 'w-[380px]' : 'w-[440px]')} gap-4 z-20 text-center justify-center box-border`}>
        <HeaderBlock mode={state.mode} isPortrait={isPort} secs={state.secs} onResend={onResend} />
        <DisplayFields mode={state.mode} isPortrait={isPort} phone={state.phone} code={state.code} />
        {state.mode === 'phone' && <SubmitButton isPortrait={isPort} isReady={state.phone.indexOf('_') === -1} onClick={onSend} />}
        <PinPadWrapper isDesktopSize={!isPort && !isTab} isDisabled={state.mode === 'sent'} onKeyClick={onPressKey} showModal={state.mode === 'sent'} isPortrait={isPort} onModalConfirm={onGoCode} SentModalComponent={SentModal} />
      </div>
    </div>
  );
};
