import React from 'react';
import { Button, ConfigProvider } from 'antd';
import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

export const ConfirmSelection = () => {
  const setStage = useRegistrationStep1Store((state) => state.setStage);

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            fontFamily: 'inherit',
          },
        },
      }}
    >
      <div className="confirm-selection-container">
        <Button 
          type="primary"
          onClick={() => setStage(3)} 
          className="confirm-btn-no"
        >
          Нет
        </Button>
        <Button 
          type="primary"
          onClick={() => setStage(4)} 
          className="confirm-btn-yes"
        >
          Да!
        </Button>
      </div>
    </ConfigProvider>
  );
};
