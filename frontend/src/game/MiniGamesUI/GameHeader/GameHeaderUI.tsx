import lifeIcon from "../../../assets/interface-icons/life.svg";

const coinImgUrl = new URL("@/assets/buttom_menu-icons/eat.svg", import.meta.url).href;

interface GameHeaderUIProps {
  score?: number;
  onBack: () => void;
  hp?: number;
  currentScale?: number;
  isCoinHeader?: boolean;
}

export const GameHeaderUI = ({ score, onBack, hp, currentScale = 1, isCoinHeader = false }: GameHeaderUIProps) => {
  const hasLives = typeof hp === "number";
  const livesCount = hasLives ? Math.ceil(hp / 25) : 0;

  const isPortrait = window.innerHeight > window.innerWidth;
  const autoScale = isPortrait ? Math.min(Math.max(currentScale * 1.15, 0.75), 1.25) : Math.min(Math.max(currentScale * 1.35, 0.7), 1.4);

  const sharedTextClass = "m-0 text-[19px] landscape:text-[20px]";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 box-border flex w-screen max-w-full items-start justify-between p-[18px_24px] select-none landscape:p-[24px_48px]">
      <div
        className="pointer-events-auto flex origin-top-left flex-col transition-transform duration-100"
        style={{ transform: `scale(${autoScale})` }}
      >
        <button
          type="button"
          onClick={() => {
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            onBack();
          }}
          className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-1 font-sans text-2xl font-black text-white uppercase drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] transition-transform duration-100 ease-out outline-none hover:scale-105 active:scale-95"
        >
          <span className="relative top-[-1.5px] text-[26px]">‹</span> Назад
        </button>

        {hasLives && (
          <div className="flex items-center gap-1.5 p-[0_4px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {Array.from({ length: 4 }).map((_, idx) => {
              const isAlive = idx < livesCount;
              return (
                <img
                  key={`life-${idx}`}
                  src={lifeIcon}
                  className="h-7 w-7 object-contain transition-all duration-300"
                  style={{
                    transform: isAlive ? "scale(1)" : "scale(0.75)",
                    opacity: isAlive ? 1 : 0.2,
                    filter: isAlive ? "none" : "grayscale(100%)"
                  }}
                  alt=""
                />
              );
            })}
          </div>
        )}
      </div>

      {score !== undefined && (
        <div
          className="pointer-events-auto flex origin-top-right flex-col transition-transform duration-100"
          style={{ transform: `scale(${autoScale})` }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-[10px_18px] font-sans font-black text-white drop-shadow-[0_10px_15px_rgba(0,0,0,0.2)] backdrop-blur-md landscape:p-[12px_20px]">
            {isCoinHeader ? (
              <img src={coinImgUrl} className="pointer-events-none mr-0.5 block h-6 w-6 object-contain select-none" alt="" />
            ) : (
              <p className={`tracking-wide ${sharedTextClass}`}>СЧЕТ:</p>
            )}
            <p className={`font-extrabold text-amber-400 ${sharedTextClass}`}>{score}</p>
          </div>
        </div>
      )}
    </header>
  );
};
