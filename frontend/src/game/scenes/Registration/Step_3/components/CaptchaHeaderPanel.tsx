interface CaptchaHeaderPanelProps {
  mode: 'select' | 'confirm' | 'verify' | 'error';
  isPortrait: boolean;
  isUltraNarrow: boolean;
  correct: number[];
  selected: number[];
  getFruitUrl: (i: number) => string;
}

const TITLES = {
  select: 'Выбери 4 фрукта<br/>и запомни их!',
  confirm: 'Запомнил?',
  verify: 'А теперь повтори фрукты,<br/>которые ты запомнил!',
  error: 'Что то не так, давай<br/>еще раз!'
};

export const CaptchaHeaderPanel = ({
  mode,
  isPortrait,
  isUltraNarrow,
  correct,
  selected,
  getFruitUrl
}: CaptchaHeaderPanelProps) => {
  const isConfirm = mode === 'confirm';
  const displayArray = isConfirm ? correct : selected;
  const slotClass = isUltraNarrow 
    ? 'w-[14vw] h-[14vw] p-2' 
    : (isPortrait ? 'w-[60px] h-[60px] p-2.5' : 'w-[70px] h-[70px] p-3');

  return (
    <div className={`w-full bg-white/95 backdrop-blur-sm rounded-[38px] px-5 pt-6 shadow-xl relative z-30 border border-slate-100/50 pointer-events-auto ${isPortrait ? 'h-[200px]' : 'h-[215px]'} flex flex-col items-center justify-between pb-5 box-border`}>
      <div 
        className={`w-full h-[60px] flex items-center justify-center ${isPortrait ? 'text-[21px]' : 'text-[24px]'} font-black text-slate-700 leading-tight tracking-wide box-border`} 
        dangerouslySetInnerHTML={{ __html: TITLES[mode] || TITLES.select }} 
      />
      <div className="flex gap-3 justify-center mt-2 box-border">
        {Array.from({ length: 4 }).map((_, i) => {
          const fIdx = i < displayArray.length ? displayArray[i] : null;
          return fIdx !== null ? (
            <div key={i} className={`${slotClass} rounded-full bg-gray-50 flex items-center justify-center shadow-inner border border-gray-100/80 box-border`}>
              <img src={getFruitUrl(fIdx)} className="w-full h-full object-contain pointer-events-none" alt="slot" />
            </div>
          ) : (
            <div key={i} className={`${slotClass} rounded-full bg-[#f4f1ee] border border-solid border-gray-200/60 shadow-inner box-border`} />
          );
        })}
      </div>
      <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[12px] border-transparent border-t-[12px] border-t-white/95" />
    </div>
  );
};
