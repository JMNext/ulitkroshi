interface BubbleBlockProps {
  stage: number;
  name: string;
  isLandscapeTablet: boolean;
  bubbleScale: number;
}

export const BubbleBlock = ({ stage, name, isLandscapeTablet, bubbleScale }: BubbleBlockProps) => {
  const bubbleStyle: React.CSSProperties = {
    transform: `scale(${bubbleScale})`,
    transformOrigin: 'top center',
    top: isLandscapeTablet ? '2%' : '4%'
  };

  return (
    <div 
      style={bubbleStyle} 
      className="absolute pointer-events-auto bg-white/95 backdrop-blur-sm rounded-[32px] px-8 py-5 text-center shadow-xl max-w-lg portrait:w-[90vw] landscape:w-[50vw] min-w-[280px] z-20 box-border"
    >
      {stage === 1 && (
        <div className="text-[17px] portrait:text-[15px] font-bold text-slate-800 leading-snug tracking-wide">
          Привет, друг! Я — твой Улиткрош! Придумай мне имя, а затем введи его на клавиатуре или нажми на большую красную кнопку и скажи мне его. Громко и чётче!
        </div>
      )}
      {stage === 2 && (
        <div className="text-2xl font-bold text-slate-700 leading-normal">
          <p className="text-lg text-slate-500 font-medium">Меня зовут</p>
          <p className="text-4xl font-black text-emerald-800 mt-0.5">{name}?</p>
        </div>
      )}
      {stage === 3 && (
        <div className="text-xl font-bold text-slate-800 leading-snug space-y-1">
          <p>Ой, я не расслышал!</p>
          <p>Давай ещё разок, громче и чётче!</p>
        </div>
      )}
      {stage === 4 && (
        <div className="text-2xl font-bold text-slate-700 leading-normal">
          <p className="text-lg text-slate-500 font-medium">Здорово, теперь меня зовут</p>
          <p className="text-4xl font-black text-emerald-800 mt-0.5">{name}</p>
        </div>
      )}
      <div className="absolute bottom-[-12px] left-[45%] w-0 h-0 border-x-[12px] border-x-transparent border-t-[12px] border-t-white/95" />
    </div>
  );
};
