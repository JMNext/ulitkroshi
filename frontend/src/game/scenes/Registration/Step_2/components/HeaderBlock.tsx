interface HeaderBlockProps {
  mode: 'phone' | 'sent' | 'code';
  isPortrait: boolean;
  secs: number;
  onResend: () => void;
}

export const HeaderBlock = ({ mode, isPortrait, secs, onResend }: HeaderBlockProps) => {
  return (
    <div className="w-full bg-white/95 backdrop-blur-sm rounded-[32px] px-5 py-4 shadow-xl relative z-20 border border-slate-100/50 box-border">
      {mode !== 'code' ? (
        <div className={`${isPortrait ? 'text-[22px]' : 'text-[26px]'} font-black text-slate-700 leading-snug tracking-wide`}>
          Набери свой номер телефона!
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <div className={`${isPortrait ? 'text-[22px]' : 'text-[26px]'} font-black text-slate-700 leading-snug tracking-wide`}>
            Введи номер из смс!
          </div>
          <button 
            disabled={secs > 0} 
            onClick={onResend} 
            className={`text-[15px] font-black mt-2 block w-full text-center underline tracking-tight transition-colors border-none bg-transparent p-0 ${secs > 0 ? 'text-slate-500 cursor-default' : 'text-emerald-600 cursor-pointer'}`}
          >
            {secs > 0 ? `Отправить повторно через ${secs} сек` : 'Отправить повторно'}
          </button>
        </div>
      )}
      <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[12px] border-transparent border-t-[12px] border-t-white/95" />
    </div>
  );
};
