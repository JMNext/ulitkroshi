import { clsx } from "clsx";

interface PetMetaInfoProps { currentIndex: number; isUnlocked: boolean; petName: string; }

export const PetMetaInfo = ({ currentIndex, isUnlocked, petName }: PetMetaInfoProps) => {
  const isStarter = currentIndex === 0;
  return (
    <div className="pointer-events-none z-10 flex w-full flex-col items-center gap-1.5 px-4 text-center">
      <span className="block max-w-[340px] text-[30px] leading-tight font-black tracking-wide break-words uppercase antialiased text-amber-500 drop-shadow-[0_2px_4px_rgba(255,255,255,0.7)]">
        {isStarter ? petName : `${isUnlocked ? "Питомец" : "Секретный питомец"} #${currentIndex + 1}`}
      </span>
      <div className="mt-0.5 flex flex-col items-center justify-center">
        <span className={clsx("text-[12px] font-black tracking-widest uppercase antialiased", isUnlocked ? "text-amber-600" : "text-slate-400/80")}>
          {isUnlocked ? (isStarter ? "ЛЕГЕНДАРНЫЙ" : "РЕДКИЙ") : "СТАТУС ЗАБЛОКИРОВАН"}
        </span>
      </div>
    </div>
  );
};
