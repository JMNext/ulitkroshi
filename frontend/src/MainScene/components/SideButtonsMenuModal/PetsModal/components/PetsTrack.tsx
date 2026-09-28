import { PetStateCombined } from "@/MainScene/components/PetCharacter/store/usePetStore";

interface PetsTrackProps {
  currentIndex: number;
  startPetImg: string;
  isUnlocked: boolean;
  isSelected: boolean;
  updateField: <K extends keyof PetStateCombined>(field: K, value: PetStateCombined[K]) => void;
  onCardSelect: () => void;
}

export const PetsTrack = ({ currentIndex, startPetImg, isUnlocked, isSelected, updateField, onCardSelect }: PetsTrackProps) => {
  const handleSelect = () => {
    if (isUnlocked && !isSelected) { updateField("activePetIndex", currentIndex); onCardSelect(); }
  };

  return (
    <div className="box-border flex h-[300px] w-full items-center justify-center overflow-visible select-none">
      <div onClick={handleSelect} className="relative flex h-[300px] w-[300px] flex-shrink-0 cursor-pointer flex-col items-center justify-center overflow-visible transition-transform duration-200 active:scale-[0.97]">
        {!currentIndex ? (
          <img src={startPetImg} className="pointer-events-none block h-full w-full object-contain drop-shadow-[0_15px_35px_rgba(15,23,42,0.3)]" alt="" />
        ) : (
          <span className="mt-4 block text-[150px] leading-none font-black text-slate-400/30 antialiased">?</span>
        )}
      </div>
    </div>
  );
};
