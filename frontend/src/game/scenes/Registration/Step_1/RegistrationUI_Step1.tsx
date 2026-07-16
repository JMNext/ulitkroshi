import React, { useEffect } from 'react';
import { BubbleBlock } from './components/BubbleBlock';
import { ConfirmSelection } from './components/ConfirmSelection';
import { NextButton } from './components/NextButton';
import { PetVideoBlock } from './components/PetVideoBlock';
import { SpeechInputField } from './components/SpeechInputField';
import { SpeechMicButton } from './components/SpeechMicButton';
import { useRegistrationStep1Store } from './useRegistrationStep1Store';

interface RegistrationUIWithStep1Props {
  onDone: () => void;
}

export const RegistrationUI_Step1 = ({ onDone }: RegistrationUIWithStep1Props) => {
  const stage = useRegistrationStep1Store((state) => state.stage);
  const setSpeechResult = useRegistrationStep1Store((state) => state.setSpeechResult);
  const setSpeechError = useRegistrationStep1Store((state) => state.setSpeechError);
  const resetStore = useRegistrationStep1Store((state) => state.resetStore);

  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [resetStore]);

  return (
    <main className="reg-overlay-container">
      <BubbleBlock />
      <PetVideoBlock />
      
      <section className="reg-controls-container">
        <div className="pointer-events-auto w-full flex flex-col items-center">
          {stage === 4 && <NextButton onClick={onDone} />}
          {stage === 2 && <ConfirmSelection />}
          {(stage === 1 || stage === 3) && (
            <div className="flex w-full flex-col-reverse items-center gap-6">
              <SpeechMicButton
                onSpeechResult={setSpeechResult}
                onSpeechError={setSpeechError}
              />
              <SpeechInputField />
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
