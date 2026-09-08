import { PetState } from "@/MainScene/components/PetCharacter/store/usePetStore";

interface PetsTrackProps {
  currentIndex: number;
  isDraggingRef: React.MutableRefObject<boolean>;
  startPetImg: string;
  onDragStart: (x: number) => void;
  onDragMove: (x: number) => void;
  updateField?: <K extends keyof PetState>(field: K, value: PetState[K]) => void;
}

const LANDSCAPE_MEDIA = "landscape:max-h-[520px]";
const PORTRAIT_MEDIA = "max-sm:portrait";

export const PetsTrack = ({
  currentIndex,
  isDraggingRef,
  startPetImg,
  onDragStart,
  onDragMove,
  updateField
}: PetsTrackProps) => {
  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  const getClientX = (e: React.TouchEvent | React.MouseEvent) => 
    'touches' in e ? e.touches[0].clientX : e.clientX;

  const items = [
    { id: (currentIndex - 1 + 20) % 20, cls: "opacity-30 scale-90 pointer-events-none" },
    { id: currentIndex, cls: "scale-105 shadow-md border-amber-400 bg-amber-50/50 z-20" },
    { id: (currentIndex + 1) % 20, cls: "opacity-30 scale-90 pointer-events-none" }
  ];

  return (
    <div
      className={`box-border flex items-center justify-center w-full gap-8 h-[270px] ${PORTRAIT_MEDIA}:h-[310px] ${LANDSCAPE_MEDIA}:h-[200px] cursor-grab overflow-visible px-4 select-none active:cursor-grabbing`}
      onTouchStart={(e) => onDragStart(getClientX(e))}
      onTouchMove={(e) => onDragMove(getClientX(e))}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => onDragStart(getClientX(e))}
      onMouseMove={(e) => onDragMove(getClientX(e))}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {items.map(({ id, cls }, i) => {
        const isStartPet = id === 0;

        return (
          <div
            key={i}
            onClick={() => isStartPet && updateField?.("activePetIndex", 0)}
            className={`relative box-border flex aspect-square w-[220px] h-[220px] ${PORTRAIT_MEDIA}:w-[260px] ${PORTRAIT_MEDIA}:h-[260px] ${LANDSCAPE_MEDIA}:w-[160px] ${LANDSCAPE_MEDIA}:h-[160px] flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-[28px] border-[4px] p-2 transition-all duration-200 select-none ${cls} ${
              isStartPet 
                ? "border-solid border-[#cbd5e1] bg-slate-50" 
                : "border-dashed border-slate-300 bg-transparent opacity-40"
            }`}
          >
            {isStartPet ? (
              <img
                src={startPetImg}
                className="pointer-events-none block h-full w-full object-contain"
                alt=""
              />
            ) : (
              <span className={`text-[48px] font-black text-slate-400 antialiased ${PORTRAIT_MEDIA}:text-[56px] ${LANDSCAPE_MEDIA}:text-[36px]`}>
                ?
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
