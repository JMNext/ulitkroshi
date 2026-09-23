import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { clsx } from "clsx";
import { AVAILABLE_AVATARS, AvatarId } from "./Avatars";

export const AvatarSelectView = ({ onBack }: { onBack: () => void }) => {
  const { avatarId = "frog", setAvatarId } = useMainGameStore();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center pt-6">
      <button type="button" onClick={onBack} className="absolute top-4 left-4 z-30 flex h-10 cursor-pointer touch-manipulation items-center gap-1 text-[14px] font-black tracking-wide text-[#94a3b8] uppercase outline-none select-none hover:text-slate-600">
        <span className="relative -top-[1.5px] text-[20px] leading-none font-light">‹</span> Назад
      </button>

      <div className="mb-3 shrink-0 text-[18px] font-black tracking-wide text-[#1a3d1c] uppercase select-none">Выбор Аватара</div>

      <div className="grid max-h-[240px] w-full max-w-[290px] scrollbar-none grid-cols-3 gap-3 overflow-y-auto p-1 select-none">
        {AVAILABLE_AVATARS.map(({ id, Component: Icon }) => {
          const isSelected = id === avatarId;
          return (
            <button key={id} type="button" onClick={() => setAvatarId(id as AvatarId)} className={clsx("relative aspect-square cursor-pointer rounded-[18px] border-2 bg-[#f1f5f9] p-1.5 outline-none", isSelected ? "z-10 border-[#81c714] bg-[#f0fdf4] shadow-md" : "border-transparent hover:border-[#cbd5e1]")}>
              <div className="h-full w-full overflow-hidden rounded-[14px]"><Icon /></div>
              {isSelected && <div className="absolute right-0 bottom-0 z-20 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#81c714] text-[10px] font-black text-white shadow-sm">✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
