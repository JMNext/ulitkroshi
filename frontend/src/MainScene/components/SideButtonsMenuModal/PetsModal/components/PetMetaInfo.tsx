import { clsx } from "clsx";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

interface PetMetaInfoProps { currentIndex: number; isUnlocked: boolean; petName: string; }

export const PetMetaInfo = ({ currentIndex, isUnlocked, petName }: PetMetaInfoProps) => {
  const isStarter = currentIndex === 0;
  const { level = 1, stage = "baby" } = usePetStore();

  // Редкость на основе стадии
  const stageRarityMap = {
    baby:  { label: "Малыш",     color: "text-[#FF9547] drop-shadow-[0_1.5px_0_rgba(255,255,255,1)]" },
    teen:  { label: "Подросток", color: "text-[#47B8FF] drop-shadow-[0_1.5px_0_rgba(255,255,255,1)]" },
    adult: { label: "Взрослый",  color: "text-[#47E06A] drop-shadow-[0_1.5px_0_rgba(255,255,255,1)]" },
  };

  const currentRarity = stageRarityMap[stage as keyof typeof stageRarityMap] || stageRarityMap["baby"];

  return (
    <div className="pointer-events-none z-10 flex w-full flex-col items-center gap-1.5 px-4 text-center">
      <span className="block max-w-[340px] text-[30px] leading-tight font-black tracking-wide break-words uppercase antialiased text-amber-500 drop-shadow-[0_2px_0_rgba(255,255,255,1)]">
        {isStarter ? petName : `${isUnlocked ? "Питомец" : "Секретный питомец"} #${currentIndex + 1}`}
      </span>
      <div className="mt-0.5 flex flex-col items-center justify-center">
        <span
          className={clsx(
            "text-[14px] font-black tracking-widest uppercase antialiased transition-all duration-150",
            isUnlocked ? currentRarity.color : "text-slate-400/80"
          )}
        >
          {isUnlocked ? (isStarter ? `${currentRarity.label} • Ур. ${level}` : "РЕДКИЙ") : "СТАТУС ЗАБЛОКИРОВАН"}
        </span>
      </div>
    </div>
  );
};
