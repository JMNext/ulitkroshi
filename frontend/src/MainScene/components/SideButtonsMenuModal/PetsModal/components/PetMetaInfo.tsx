interface PetMetaInfoProps {
  currentIndex: number;
  isUnlocked: boolean;
  petName: string;
}

const LANDSCAPE_MEDIA = "landscape:max-h-[520px]";

export const PetMetaInfo = ({ currentIndex, isUnlocked, petName }: PetMetaInfoProps) => {
  const isStarterPet = currentIndex === 0;
  const starCount = isStarterPet ? 5 : 3;
  const petNum = currentIndex + 1;

  const displayName = isStarterPet
    ? petName
    : `${isUnlocked ? "Питомец" : "Секретный питомец"} #${petNum}`;

  return (
    <div className={`pointer-events-none z-10 mb-2 ${LANDSCAPE_MEDIA}:mb-0 flex w-full flex-col items-center gap-0.5 text-center`}>
      <span className={`block w-full text-center font-black tracking-wider text-amber-400 uppercase drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)] text-[32px] sm:text-[36px] ${LANDSCAPE_MEDIA}:text-[24px] antialiased`}>
        {displayName}
      </span>
      
      <div className={`flex h-12 ${LANDSCAPE_MEDIA}:h-8 w-full flex-col items-center justify-center`}>
        <div
          className={`flex flex-col items-center justify-center transition-all duration-150 ${
            isUnlocked ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <span className={`font-black tracking-wide text-amber-500 uppercase drop-shadow-[0_1px_3px_rgba(217,119,6,0.5)] text-[13px] sm:text-[14px] ${LANDSCAPE_MEDIA}:text-[12px] antialiased`}>
            {isStarterPet ? "ЛЕГЕНДАРНЫЙ" : "РЕДКИЙ"}
          </span>
          
          <div className="mt-0.5 flex items-center gap-1">
            {Array.from({ length: starCount }).map((_, i) => (
              <span
                key={i}
                className={`font-black text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] text-[16px] sm:text-[20px] ${LANDSCAPE_MEDIA}:text-[16px]`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
