import { createRoot, Root } from 'react-dom/client';
import { Scene } from 'phaser';
import React, { useState, useEffect } from 'react';
import { CaptchaHeaderPanel } from './components/CaptchaHeaderPanel';
import { CaptchaConfirmModal } from './components/CaptchaConfirmModal';
import { CaptchaFruitGrid } from './components/CaptchaFruitGrid';
import { CaptchaResetButton } from './components/CaptchaResetButton';

type CaptchaMode = 'select' | 'confirm' | 'verify' | 'error';
type UpdateCaptchaCallback = (sel: number[], corr: number[], m: CaptchaMode, shake: boolean) => void;

const fImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;
const ID_MAP: Record<number, string> = { 0: '01', 1: '02', 2: '0003_13', 3: '03', 4: '04', 5: '05', 6: '06', 7: '0007_09', 8: '07', 9: '08', 10: '10', 11: '11', 12: '12', 13: '14', 14: '15', 15: '16' };

export class RegistrationLogic_Step3 {
  private regUiRoot: Root | null = null;
  private correct: number[] = [];
  private selected: number[] = [];
  private mode: CaptchaMode = 'select';
  private updateUI?: UpdateCaptchaCallback;
  private isDestroyed = false;

  constructor(private scene: Scene, private onComplete: () => void) {
    this.renderUI();
  }

  public getMode = (): CaptchaMode => this.mode;
  public getSelected = (): number[] => this.selected;
  public getCorrect = (): number[] => this.correct;

  private renderUI(): void {
    this.destroyUI();
    const c = document.createElement('div');
    c.id = 'registration-fruits-overlay';
    c.className = 'absolute inset-0 pointer-events-none z-30 flex justify-center';
    document.getElementById('game-container')?.appendChild(c);
    document.getElementById('game-container')?.classList.add('in-registration');

    this.regUiRoot = createRoot(c);
    this.regUiRoot.render(
      <Container 
        onToggle={(i: number) => this.toggle(i)} 
        onYes={() => { this.mode = 'verify'; this.selected = []; this.sync(); }} 
        onReset={() => { this.selected = []; this.correct = []; this.mode = 'select'; this.sync(); }}
        bind={(fn: UpdateCaptchaCallback) => { this.updateUI = fn; }} 
      />
    );
  }

  private toggle(idx: number) {
    if (this.mode === 'confirm') return;
    if (this.mode === 'error') { this.mode = 'verify'; this.selected = []; }

    const f = this.selected.indexOf(idx);
    if (f > -1) this.selected.splice(f, 1);
    else if (this.selected.length < 4) {
      this.selected.push(idx);
      if (this.selected.length === 4) {
        if (this.mode === 'select') { this.correct = [...this.selected]; this.mode = 'confirm'; }
        else if (this.mode === 'verify') {
          if (this.selected.every(v => this.correct.includes(v))) return this.destroy(true);
          this.mode = 'error'; this.selected = []; this.sync(true); return;
        }
      }
    }
    this.sync();
  }

  private sync(shake = false) { this.updateUI?.(this.selected, this.correct, this.mode, shake); }

  private destroyUI(): void {
    this.regUiRoot?.unmount();
    this.regUiRoot = null;
    document.getElementById('registration-fruits-overlay')?.remove();
    document.getElementById('game-container')?.classList.remove('in-registration');
  }

  public destroy = (triggerCallback = false): void => {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.destroyUI();
    
    if (triggerCallback) {
      this.onComplete();
    }
  };
}

interface Container3Props {
  onToggle: (i: number) => void;
  onYes: () => void;
  onReset: () => void;
  bind: (fn: UpdateCaptchaCallback) => void;
}

const Container = ({ onToggle, onYes, onReset, bind }: Container3Props) => {
  const [s, setS] = useState({ sel: [] as number[], corr: [] as number[], mode: 'select' as CaptchaMode, shake: false });
  const [w, setW] = useState(window.innerWidth);
  const h = window.innerHeight;

  useEffect(() => {
    bind((sel: number[], corr: number[], mode: CaptchaMode, shake: boolean) => setS({ sel, corr, mode, shake }));
    const res = () => setW(window.innerWidth);
    window.addEventListener('resize', res);
    return () => window.removeEventListener('resize', res);
  }, [bind]);

  const getUrl = (i: number) => fImgs[`/src/assets/fruits/fruits_${ID_MAP[i]}.png`]?.default || '';

  const isPort = w < h, isFold = isPort && (w / h) < 0.5;
  const scale = isFold ? Math.min(w / 390, 0.82) : (isPort ? 0.8 : (h < 650 ? 0.72 : 0.82));

  const blockWidth = isFold ? 'w-[95vw]' : (isPort ? 'w-[380px]' : 'w-[440px]');

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden h-[100dvh] z-30 flex items-center justify-center p-4 box-border">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }} className={`flex flex-col items-center ${blockWidth} gap-2 z-20 pointer-events-none font-sans ${s.shake ? 'animate-shake' : ''} max-h-full justify-center box-border`}>
        <style>{`@keyframes d-shake { 0%, 100% { transform: scale(${scale}) translate(0,0); } 20%, 60% { transform: scale(${scale}) translate(-6px,0); } 40%, 80% { transform: scale(${scale}) translate(6px,0); } } .animate-shake { animation: d-shake 0.4s; }`}</style>
        
        <CaptchaHeaderPanel mode={s.mode} isPortrait={isPort} isUltraNarrow={isFold} correct={s.corr} selected={s.sel} getFruitUrl={getUrl} />
        
        <div className="w-full flex flex-col items-center pointer-events-auto z-30 mt-4 relative box-border">
          <CaptchaFruitGrid 
            mode={s.mode} 
            selected={s.sel} 
            isUltraNarrow={isFold} 
            isPortrait={isPort} 
            getFruitUrl={getUrl} 
            onPress={onToggle} 
          />
          
          {s.mode === 'confirm' && <CaptchaConfirmModal onConfirm={onYes} />}
          
          <CaptchaResetButton 
            mode={s.mode} 
            onReset={onReset} 
          />
        </div>
      </div>
    </div>
  );
};
