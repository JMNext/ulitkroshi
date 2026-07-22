import React, { useState, useEffect } from 'react';
import { Button, ConfigProvider } from 'antd';

interface GameOverModalUIProps {
  onRestart?: () => void;
  onBack: () => void;
  isWin?: boolean;
  score: number;
}

export const GameOverModalUI = ({ onRestart, onBack, isWin = false, score }: GameOverModalUIProps) => {
  const [screenType, setScreenType] = useState<'desktop' | 'square' | 'portrait' | 'lowLandscape'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      if (Math.abs(w - h) < 10) setScreenType('square');
      else if (h > w && w / h <= 0.75) setScreenType('portrait');
      else if (h <= w && h < 550) setScreenType('lowLandscape'); 
      else setScreenType('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const title = isWin ? 'ПОБЕДА!' : 'ИГРА ОКОНЧЕНА';
  const resultLabel = isWin ? 'ХОДЫ' : 'СЧЕТ';

  const titleColor = isWin ? 'text-[#1a3d1c]' : 'text-[#d32f2f]';
  const borderClass = isWin ? 'border-[#81c714]' : 'border-[#e63254]';

  // ИСПРАВЛЕНО: Увеличены размеры для lowLandscape (мобильный ландшафт теперь крупный и читаемый)
  const sizes = {
    portrait: { article: 'w-[440px] p-8 gap-6 rounded-[50px] border-[5px]', title: 'text-[36px]', score: 'text-[28px]', btnHeight: 62, btnRadius: 24, btnText: 'text-[22px]', gap: 'gap-4' },
    square: { article: 'w-[300px] p-5 gap-3.5 rounded-[32px] border-4', title: 'text-[24px]', score: 'text-[19px]', btnHeight: 42, btnRadius: 16, btnText: 'text-[16px]', gap: 'gap-2.5' },
    lowLandscape: { article: 'w-[380px] p-5 gap-3 rounded-[24px] border-[4px]', title: 'text-[24px]', score: 'text-[19px]', btnHeight: 48, btnRadius: 14, btnText: 'text-[16px]', gap: 'gap-2.5' },
    desktop: { article: 'w-[340px] p-6 gap-4 rounded-[40px] border-4', title: 'text-[28px]', score: 'text-[22px]', btnHeight: 48, btnRadius: 18, btnText: 'text-[18px]', gap: 'gap-3' }
  };

  const currentSize = sizes[screenType];

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
      {/* ИСПРАВЛЕНО: Изменено absolute на fixed. Добавлен !z-[99999], чтобы гарантированно перекрыть "сырой" HTML-элемент пета */}
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm !z-[99999] pointer-events-auto p-4">
        
        <article className={`bg-white shadow-2xl border-solid text-center box-border flex flex-col items-center justify-center transition-all duration-150 max-w-[calc(100vw-32px)] ${borderClass} ${currentSize.article}`}>
          
          <h1 className={`font-black tracking-wide leading-none m-0 p-0 block w-full h-auto transition-all duration-150 ${titleColor} ${currentSize.title}`}>
            {title}
          </h1>
          
          <p className={`font-extrabold text-slate-700 m-0 p-0 block w-full text-center transition-all duration-150 ${currentSize.score}`}>
            {resultLabel}: {score}
          </p>

          <nav className={`flex flex-col w-full mt-2 box-border transition-all duration-150 ${currentSize.gap}`}>
            {onRestart && (
              <Button
                type="text"
                block
                onClick={onRestart}
                className={`w-full flex items-center justify-center \!font-black text-slate-900 border-none uppercase tracking-wide m-0 p-0 transition-all duration-150 hover:opacity-90 ${currentSize.btnText}`}
                style={{ 
                  height: currentSize.btnHeight,
                  borderRadius: currentSize.btnRadius,
                  background: 'linear-gradient(to bottom, #ffd54f, #ffb300)',
                  color: '#0f172a'
                }}
              >
                ИГРАТЬ СНАЧАЛА
              </Button>
            )}

            <Button
              type="text"
              block
              onClick={onBack}
              className={`w-full flex items-center justify-center \!font-black text-white border-none uppercase tracking-wide m-0 p-0 transition-all duration-150 hover:opacity-90 ${currentSize.btnText}`}
              style={{ 
                height: currentSize.btnHeight,
                borderRadius: currentSize.btnRadius,
                background: 'linear-gradient(to bottom, #4caf50, #2e7d32)',
                color: '#ffffff'
              }}
            >
              В МЕНЮ
            </Button>
          </nav>

        </article>

      </div>
    </ConfigProvider>
  );
};
