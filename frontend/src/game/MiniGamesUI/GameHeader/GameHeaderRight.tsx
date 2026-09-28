const coinUrl = new URL("@/assets/buttom_menu-icons/eat.svg", import.meta.url).href;
const shared = "m-0 text-[19px] landscape:text-[20px]";

export const GameHeaderRight = ({ score, isCoinHeader = false, currentScale = 1 }: { score?: number; isCoinHeader?: boolean; currentScale?: number }) => {
  if (score === undefined) return null;

  const isPort = window.innerHeight > window.innerWidth;
  const auto = isPort ? Math.min(Math.max(currentScale * 1.15, 0.75), 1.25) : Math.min(Math.max(currentScale * 1.35, 0.7), 1.4);

  return (
    <div className="pointer-events-auto fixed top-0 right-0 z-30 flex origin-top-right flex-col p-[18px_24px] transition-transform duration-100 select-none landscape:p-[24px_48px]" style={{ transform: `scale(${auto})` }}>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-[10px_18px] font-sans font-black text-white drop-shadow-[0_10px_15px_rgba(0,0,0,0.2)] backdrop-blur-md landscape:p-[12px_20px]">
        {isCoinHeader ? <img src={coinUrl} className="pointer-events-none mr-0.5 block h-6 w-6 object-contain" alt="" /> : <p className={`tracking-wide ${shared}`}>СЧЕТ:</p>}
        <p className={`font-extrabold text-amber-400 ${shared}`}>{score}</p>
      </div>
    </div>
  );
};
