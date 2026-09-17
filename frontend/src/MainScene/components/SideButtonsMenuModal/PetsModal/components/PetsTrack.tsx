import { PetState } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { clsx } from "clsx";

interface PetsTrackProps {
  currentIndex: number;
  startPetImg: string;
  updateField: <K extends keyof PetState>(field: K, value: PetState[K]) => void;
}

export const PetsTrack = ({ currentIndex, startPetImg, updateField }: PetsTrackProps) => {
  // Вынесли конфигурацию элементов в чистый массив
  const items = [
    { id: (currentIndex - 1 + 20) % 20, cls: "opacity-30 scale-90 pointer-events-none" },
    { id: currentIndex, cls: "scale-105 shadow-md border-amber-400 bg-amber-50/50 z-20" },
    { id: (currentIndex + 1) % 20, cls: "opacity-30 scale-90 pointer-events-none" }
  ];

  return (
    <div
      className="box-border flex h-[270px] w-full cursor-grab items-center justify-center gap-8 overflow-visible px-4 select-none active:cursor-grabbing max-sm:portrait:h-[310px] landscape:max-h-[520px]:h-[200px]"
    >
      {items.map(({ id, cls }, i) => {
        const isStartPet = id === 0;

        return (
          <div
            key={i}
            onClick={() => isStartPet && updateField("activePetIndex", 0)}
            className={clsx(
              "relative box-border flex aspect-square h-[220px] w-[220px] flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-[28px] border-[4px] p-2 transition-all duration-200 select-none",
              cls,
              "landscape:max-h-[520px]:w-[160px] landscape:max-h-[520px]:h-[160px] max-sm:portrait:h-[260px] max-sm:portrait:w-[260px]",
              isStartPet ? "border-solid border-[#cbd5e1] bg-slate-50" : "border-dashed border-slate-300 bg-transparent opacity-40"
            )}
          >
            {isStartPet ? (
              <img src={startPetImg} className="pointer-events-none block h-full w-full object-contain" alt="" />
            ) : (
              <span className="landscape:max-h-[520px]:text-[36px] text-[48px] font-black text-slate-400 antialiased max-sm:portrait:text-[56px]">
                ?
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
