import { createRoot, Root } from 'react-dom/client';
import { Scene } from 'phaser';
import React, { useState, useEffect } from 'react';
import { SuccessBubble } from './components/SuccessBubble';
import { FinalPlayButton } from './components/FinalPlayButton';

export class RegistrationLogic_Step4 {
  private regUiRoot: Root | null = null;
  private isDestroyed = false;

  constructor(private scene: Scene, private onComplete: () => void) {
    const c = document.createElement('div');
    c.id = 'registration-final-overlay';
    c.className = 'absolute inset-0 pointer-events-none z-30 flex justify-center';
    document.getElementById('game-container')?.appendChild(c)?.classList.add('in-registration');

    this.regUiRoot = createRoot(c);
    this.regUiRoot.render(<Container onPlay={() => this.destroy(true)} />);
  }

  public destroy = (call = false): void => {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.regUiRoot?.unmount();
    document.getElementById('registration-final-overlay')?.remove();
    document.getElementById('game-container')?.classList.remove('in-registration');
    if (call) this.onComplete();
  };
}

const Container = ({ onPlay }: { onPlay: () => void }) => {
  const [w, setW] = useState(window.innerWidth);
  const h = window.innerHeight;

  useEffect(() => {
    const res = () => setW(window.innerWidth);
    window.addEventListener('resize', res);
    return () => window.removeEventListener('resize', res);
  }, []);

  const isPort = w < h, isTab = !isPort && (w / h) < 1.72, isFold = isPort && (w / h) < 0.5;
  const scale = isFold ? Math.min(w / 390, 0.85) : (isPort ? 0.85 : 0.75);
  const bottom = isTab ? '40px' : (isFold ? '95px' : '80px');

  return (
    <div className="fixed inset-0 pointer-events-none w-full h-full font-sans select-none z-30 flex justify-center overflow-hidden">
      <SuccessBubble isLandscapeTablet={isTab} bubbleScale={isFold ? Math.min(w / 360, 0.85) : (isPort ? 0.85 : 0.8)} />
      <FinalPlayButton bottomPosition={bottom} controlsScale={scale} onClick={onPlay} />
    </div>
  );
};
