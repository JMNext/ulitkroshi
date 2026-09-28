import { clsx } from "clsx";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

interface PetMetaInfoProps { currentIndex: number; isUnlocked: boolean; petName: string; }

export const PetMetaInfo = ({ currentIndex, isUnlocked, petName }: PetMetaInfoProps) => {
  const isStarter = currentIndex === 0;
  const { stars = 1 } = usePetStore();

  const wowRarityMap = {
    1: { label: "Обычный", color: "text-[#4a5568] drop-shadow-[0_1.5px_0_rgba(255,255,255,1)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" },
    2: { label: "Необычный", color: "text-[#2ed11d] drop-shadow-[0_1.5px_0_rgba(255,255,255,1)]" },
    3: { label: "Редкий", color: "text-[#0070dd] drop-shadow-[0_1.5px_0_rgba(255,255,255,1)]" },
    4: { label: "Эпический", color: "text-[#a335ee] drop-shadow-[0_1.5px_0_rgba(255,255,255,1)]" },
    5: { label: "Легендарный", color: "text-[#ff8000] drop-shadow-[0_1.5px_0_rgba(255,255,255,1)]" }
  };

  const currentRarity = wowRarityMap[stars as keyof typeof wowRarityMap] || wowRarityMap[1];

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
          {isUnlocked ? (isStarter ? currentRarity.label : "РЕДКИЙ") : "СТАТУС ЗАБЛОКИРОВАН"}
        </span>
      </div>
    </div>
  );
};
