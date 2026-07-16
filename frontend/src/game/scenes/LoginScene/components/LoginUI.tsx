import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { LoginButton } from './LoginButton';
import { LoginLoader } from './LoginLoader';

interface LoginUIComponentProps {
  onStart: () => void;
}

export type LoadingTrigger = (onComplete: () => void) => void;

let loginUiRoot: Root | null = null;

export const loginUiEmitter = {
  startLoading: null as LoadingTrigger | null,
};

export const LoginUIComponent = ({ onStart }: LoginUIComponentProps) => {
  const [step, setStep] = useState<'button' | 'loading'>('button');
  const onCompleteRef = useRef<(() => void) | null>(null);

  loginUiEmitter.startLoading = (onComplete) => {
    onCompleteRef.current = onComplete;
    setStep('loading');
  };

  useEffect(() => {
    return () => {
      loginUiEmitter.startLoading = null;
    };
  }, []);

  return (
    <main className="pointer-events-none fixed inset-0 z-30 h-full w-full overflow-hidden">
      {step === 'button' && <LoginButton onStart={onStart} />}

      {step === 'loading' && (
        <LoginLoader onComplete={() => onCompleteRef.current?.()} />
      )}
    </main>
  );
};

export const renderLoginUI = (scene: Phaser.Scene, onStartClick: () => void): void => {
  destroyLoginUI();
  const container = document.createElement('div');
  container.id = 'login-ui-overlay';
  container.className = 'absolute inset-0 pointer-events-none z-30';
  document.getElementById('game-container')?.appendChild(container);

  loginUiRoot = createRoot(container);
  loginUiRoot.render(<LoginUIComponent onStart={onStartClick} />);
};

export const destroyLoginUI = (): void => {
  if (loginUiRoot) {
    loginUiRoot.unmount();
    loginUiRoot = null;
  }
  document.getElementById('login-ui-overlay')?.remove();
  loginUiEmitter.startLoading = null;
};

export const startLoadingAnimation = (onComplete: () => void): void => {
  if (loginUiEmitter.startLoading) {
    loginUiEmitter.startLoading(onComplete);
  } else {
    onComplete();
  }
};
