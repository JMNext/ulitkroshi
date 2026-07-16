import React from 'react';
import { Modal, Button, ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs'; // Импортируем провайдер стилей
import './GameOverModalUI.css';

interface GameOverModalUIProps {
  onRestart?: () => void;
  onBack: () => void;
  isWin?: boolean;
  score: number;
}

export const GameOverModalUI = ({ onRestart, onBack, isWin = false, score }: GameOverModalUIProps) => {
  const title = isWin ? 'ПОБЕДА!' : 'ИГРА ОКОНЧЕНА';
  const resultLabel = isWin ? 'ХОДЫ' : 'СЧЕТ';

  const titleColor = isWin ? 'text-[#1a3d1c]' : 'text-[#d32f2f]';
  const borderModifier = isWin ? 'is-win-border' : 'is-lose-border';

  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#61aa05',
            colorPrimaryHover: '#73d13d',
            colorPrimaryActive: '#389e0d',
            borderRadius: 100, 
          },
          components: {
            Modal: {
              borderRadiusLG: 40,
            },
          },
        }}
      >
        <Modal
          open={true}
          centered
          closable={false}
          footer={null}
          maskClosable={false}
          width={340} 
          // ИСПОЛЬЗУЕМ ЧИСТЫЕ КЛАССЫ: Никаких инлайн стилей
          className={`gameoverlay-antd-modal ${borderModifier}`}
          wrapClassName="gameoverlay-antd-blur-mask"
        >
          <article className="gameoverlay-modal-content">
            <h1 className={`${titleColor} gameoverlay-modal-main-title`}>
              {title}
            </h1>
            
            <p className="gameoverlay-modal-score-text">
              {resultLabel}: {score}
            </p>

            <nav className="gameoverlay-modal-btn-stack">
              {onRestart && (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={onRestart}
                  className="gameoverlay-modal-btn-font"
                  style={{ height: '48px' }}
                >
                  ИГРАТЬ СНАЧАЛА
                </Button>
              )}

              <Button
                type="primary"
                size="large"
                block
                onClick={onBack}
                className="gameoverlay-modal-btn-font"
                style={{ height: '48px' }}
              >
                В МЕНЮ
              </Button>
            </nav>
          </article>
        </Modal>
      </ConfigProvider>
    </StyleProvider>
  );
};
