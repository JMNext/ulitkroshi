import { Scene } from 'phaser';
import { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { setGlobalPetName } from '../../MainScene/PetHealthBar';
import { BubbleBlock } from './components/BubbleBlock';
import { ConfirmSelection } from './components/ConfirmSelection';
import { NextButton } from './components/NextButton';
import { SpeechInputField } from './components/SpeechInputField';

export class RegistrationLogic_Step1 {
  private regUiRoot: Root | null = null;
  private isDestroyed = false;

  constructor(
    private scene: Scene,
    private onComplete: () => void
  ) {
    this.renderUI();
  }

  private renderUI(): void {
    const c = document.createElement('div');
    c.id = 'registration-ui-overlay';
    c.className =
      'absolute inset-0 pointer-events-none z-30 overflow-hidden w-full h-[100vh] font-sans select-none';
    document.getElementById('game-container')?.appendChild(c);
    document.getElementById('game-container')?.classList.add('in-registration');
    this.regUiRoot = createRoot(c);
    this.regUiRoot.render(
      <Container
        scene={this.scene}
        onDone={() => this.destroy(true)}
      />
    );
  }

  public destroy = (triggerCallback = false): void => {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.regUiRoot?.unmount();
    this.regUiRoot = null;
    document.getElementById('registration-ui-overlay')?.remove();
    document.getElementById('game-container')?.classList.remove('in-registration');
    if (triggerCallback) this.onComplete();
  };
}

const Container = ({ scene, onDone }: { scene: Scene; onDone: () => void }) => {
  const [stage, setStage] = useState(1);
  const [name, setName] = useState('');
  const [input, setInput] = useState('');
  const [w, setW] = useState(window.innerWidth);
  const inputElementRef = useRef<HTMLInputElement | null>(null);
  const h = window.innerHeight;

  useEffect(() => {
    const res = () => setW(window.innerWidth);
    window.addEventListener('resize', res, { passive: true });
    return () => window.removeEventListener('resize', res);
  }, []);

  useEffect(() => {
    if (stage !== 1 && stage !== 3) {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if ('virtualKeyboard' in navigator)
        (navigator as unknown as { virtualKeyboard: { hide: () => void } }).virtualKeyboard.hide();
    }
  }, [stage]);

  const submit = (v: string) => {
    setName(v.trim() || 'Булька');
    setStage(2);
  };
  const isPort = w < h,
    isTab = !isPort && w / h < 1.72,
    isFold = isPort && w / h < 0.5;
  const scale = isFold ? Math.min(w / 360, 0.85) : isPort ? 0.85 : 0.8;
  const cScale = isFold ? Math.min(w / 390, 0.8) : isPort ? 0.85 : 0.75;
  const bottom = isTab ? '20px' : isFold ? '6%' : '10%';

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex h-[100dvh] w-full justify-center overflow-hidden">
      <BubbleBlock
        stage={stage}
        name={name}
        isLandscapeTablet={isTab}
        bubbleScale={scale}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom,
          transform: `translateX(-50%) scale(${cScale})`,
          transformOrigin: 'bottom center',
        }}
        className="z-25 flex w-full max-w-[420px] flex-col-reverse items-center justify-start gap-6">
        {stage === 4 && <NextButton onClick={onDone} />}
        {stage === 2 && (
          <ConfirmSelection
            onNo={() => setStage(3)}
            onYes={() => {
              setGlobalPetName(name);
              setStage(4);
            }}
          />
        )}
        {(stage === 1 || stage === 3) && (
          <SpeechInputField
            scene={scene}
            inputValue={input}
            inputRef={inputElementRef}
            onValueChange={setInput}
            onSpeechResult={(r) => {
              setInput('');
              submit(r);
            }}
            onSpeechError={() => setStage(3)}
            onSubmit={submit}
          />
        )}
      </div>
    </div>
  );
};
