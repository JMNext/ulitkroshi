import { BTN_BASE_CLASS, GAME_COLORS, GAME_SVGS, GAMES } from "../constants/games.constants";

interface GameListViewProps { isBlocked: boolean; onGameClick: (scene: string) => void; }

export const GameListView = ({ isBlocked, onGameClick }: GameListViewProps) => (
  <div className="flex w-full flex-col items-center gap-2.5">
    {GAMES.map((game) => (
      <button key={game.scene} type="button" onClick={() => onGameClick(game.scene)} className={`${BTN_BASE_CLASS} ${GAME_COLORS[game.scene] || "bg-[#388e3c] text-white"} h-[48px] text-[15px]`}>
        <div className="absolute left-[16px] flex h-[24px] w-[28px] items-center justify-center">{GAME_SVGS[game.scene]}</div>
        <span className="pl-[20px] font-black tracking-wide uppercase antialiased">{game.text}</span>
        {isBlocked && (
          <div className="absolute right-[16px] flex h-[20px] w-[22px] items-center justify-center rounded-full border border-solid border-white bg-red-500 text-white shadow-sm">
            {GAME_SVGS.LockIcon}
          </div>
        )}
      </button>
    ))}
  </div>
);
