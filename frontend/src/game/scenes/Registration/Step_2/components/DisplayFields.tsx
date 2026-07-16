import React from 'react';
import { useRegistrationStep2Store } from '../useRegistrationStep2Store';

export const DisplayFields = () => {
  const mode = useRegistrationStep2Store((state) => state.mode);
  const phone = useRegistrationStep2Store((state) => state.phone);
  const code = useRegistrationStep2Store((state) => state.code);

  const renderCodeDisplay = (): string => {
    return code.padEnd(4, '_').split('').join(' ');
  };

  if (mode !== 'code') {
    return (
      <p className="display-field-phone">
        {phone}
      </p>
    );
  }

  return (
    <p className="display-field-code">
      {renderCodeDisplay()}
    </p>
  );
};
