import { BTN_BASE_CLASS, MODES } from "../constants/games.constants";

export const DifficultyView = ({ onSelectMode }: { onSelectMode: (diff: "easy" | "medium" | "hard") => void }) => (
  <div className="flex w-full flex-col items-center gap-3">
    <div className="mb-2 shrink-0 text-center text-[20px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased select-none">СЛОЖНОСТЬ</div>
    {MODES.map((mode) => (
      <button key={mode.diff} type="button" onClick={() => onSelectMode(mode.diff as any)} className={`${BTN_BASE_CLASS} h-[48px] text-[15px]`} style={{ backgroundColor: mode.bgColor, color: mode.textColor }}>
        <span className="font-black tracking-wide uppercase antialiased">{mode.text}</span>
      </button>
    ))}
  </div>
);
