import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RegistrationUIComponent } from './RegistrationUIComponent';

let regUiRoot: Root | null = null;
let globalSetStage: ((stage: number) => void) | null = null;
let globalSetName: ((name: string) => void) | null = null;
let globalSetListening: ((listening: boolean) => void) | null = null;

export const renderRegistrationUI_Step1 = (scene: any, onComplete: () => void): void => {
  destroyRegistrationUI_Step1();
  
  if ('virtualKeyboard' in navigator) {
    (navigator as any).virtualKeyboard.overlaysContent = true;
  }

  const container = document.createElement('div');
  container.id = 'registration-ui-overlay';
  container.className = 'absolute inset-0 pointer-events-none z-30 overflow-hidden w-full h-[100vh] font-sans select-none';
  document.getElementById('game-container')?.appendChild(container);
  document.getElementById('game-container')?.classList.add('in-registration');

  regUiRoot = createRoot(container);
  regUiRoot.render(<RegistrationUIComponent scene={scene} onComplete={onComplete} />);
};

export const destroyRegistrationUI_Step1 = (): void => {
  if (regUiRoot) { 
    regUiRoot.unmount(); 
    regUiRoot = null; 
  }
  document.getElementById('registration-ui-overlay')?.remove();
  document.getElementById('game-container')?.classList.remove('in-registration');
  globalSetStage = null;
  globalSetName = null;
  globalSetListening = null;
};

export const setRegistrationStageUI = (stage: number): void => { 
  if (globalSetStage) globalSetStage(stage); 
};

export const setRegistrationNameUI = (name: string): void => { 
  if (globalSetName) globalSetName(name); 
};

export const setRegistrationListeningUI = (listening: boolean): void => { 
  if (globalSetListening) globalSetListening(listening); 
};

export const _internalRegBridge = {
  register: (setStage: any, setName: any, setListening: any) => {
    globalSetStage = setStage;
    globalSetName = setName;
    globalSetListening = setListening;
  },
  unregister: () => {
    globalSetStage = null;
    globalSetName = null;
    globalSetListening = null;
  }
};
