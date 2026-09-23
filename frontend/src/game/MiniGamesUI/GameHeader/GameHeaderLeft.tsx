import { clsx } from "clsx";
import { EventBus } from "@/eventbus/EventBus";
import lifeIcon from "../../../assets/interface-icons/life.svg";

interface GameHeaderLeftProps { onBack: () => void; hp?: number; currentScale?: number; }

export const GameHeaderLeft = ({ onBack, hp, currentScale = 1 }: GameHeaderLeftProps) => {
  const hasLives = typeof hp === "number";
  const isPort = window.innerHeight > window.innerWidth;
  const auto = isPort ? Math.min(Math.max(currentScale * 1.15, 0.75), 1.25) : Math.min(Math.max(currentScale * 1.35, 0.7), 1.4);

  const handleBack = () => {
    (document.activeElement as HTMLElement)?.blur?.();
    onBack?.();
    EventBus.emit("minigame_stop_to_main");
  };

  return (
    <div className="pointer-events-auto fixed top-0 left-0 z-30 flex origin-top-left flex-col p-[18px_24px] transition-transform duration-100 select-none landscape:p-[24px_48px]" style={{ transform: `scale(${auto})` }}>
      <button type="button" onClick={handleBack} className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-1 font-sans text-2xl font-black text-white uppercase drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] transition-transform duration-100 ease-out outline-none hover:scale-105 active:scale-95">
        <span className="relative top-[-1.5px] text-[26px]">‹</span> Назад
      </button>

      {hasLives && (
        <div className="flex items-center gap-1.5 p-[0_4px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {Array.from({ length: 4 }).map((_, idx) => (
            <img
              key={idx}
              src={lifeIcon}
              className={clsx("h-7 w-7 object-contain transition-all duration-300", idx < Math.ceil(hp / 25) ? "scale-100 opacity-100" : "scale-75 opacity-20 grayscale")}
              alt=""
            />
          ))}
        </div>
      )}
    </div>
  );
};
