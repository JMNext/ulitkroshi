import React from 'react';
import { Modal, ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { GameMenu } from './GameMenu';
import './MinigameModalUI.css';

interface MinigameModalUIProps {
  onClose: () => void;
  onStartGame: (selectedScene: string, difficulty: string) => void;
}

export const MinigameModalUI = ({ onClose, onStartGame }: MinigameModalUIProps) => {
  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              borderRadiusLG: 32,
            },
          },
        }}
      >
        <Modal
          open={true}
          centered
          closable={false}
          footer={null}
          maskClosable={true}
          onCancel={onClose}
          width={380}
          className="minigame-antd-modal"
          wrapClassName="minigame-antd-blur-mask"
        >
          <div className="minigame-modal-content-wrap">
            <button 
              type="button" 
              onClick={onClose} 
              className="minigame-modal-nav-btn is-close-cross"
            >
              ✕
            </button>
            <GameMenu onStartGame={onStartGame} />
          </div>
        </Modal>
      </ConfigProvider>
    </StyleProvider>
  );
};
