import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

export const PetStarsRating = ({ isUnlocked, isStarterPet }: { isUnlocked: boolean; isStarterPet: boolean }) => {
  const { level = 1, stage = 'baby' } = usePetStore();

  const filledStars = "Ур. " + level;
  const emptyStars = "";

  return (
    <div className="pointer-events-none absolute top-[71.5%] left-1/2 z-10 flex h-7 -translate-x-1/2 items-center justify-center select-none">
      {isUnlocked ? (
        <span className="text-[24px] font-black tracking-wide text-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
          {isStarterPet ? `${filledStars}${emptyStars}` : "★".repeat(3)}
        </span>
      ) : (
        <span className="text-[18px] font-black text-slate-400/60">🔒</span>
      )}
    </div>
  );
};
