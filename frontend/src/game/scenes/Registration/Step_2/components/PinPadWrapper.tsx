import React from 'react';
import { PinPad } from "../../components/PinPad";
import { SentModal } from './SentModal';
import { useRegistrationStep2Store } from '../useRegistrationStep2Store';

interface PinPadWrapperProps {
  onPressKey: (k: string) => void;
  onGoCode: () => void;
}

export const PinPadWrapper = ({ onPressKey, onGoCode }: PinPadWrapperProps) => {
  const mode = useRegistrationStep2Store((state) => state.mode);

  return (
    <nav className="pinpad-wrapper-container">
      <PinPad 
        isDisabled={mode === 'sent'} 
        onKeyClick={onPressKey} 
      />
      {mode === 'sent' && (
        <SentModal 
          onConfirm={onGoCode} 
        />
      )}
    </nav>
  );
};
