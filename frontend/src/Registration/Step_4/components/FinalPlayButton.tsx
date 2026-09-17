interface FinalPlayButtonProps {
  onClick: () => void;
}

export const FinalPlayButton = ({ onClick }: FinalPlayButtonProps) => {
  return (
    <button
      type="button"
      onClick={() => {
        (document.activeElement as HTMLElement)?.blur?.();
        onClick();
      }}
      className="pointer-events-auto mx-auto box-border flex h-[64px] w-[380px] cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#f59e0b] to-[#d97706] px-10 text-[24px] font-black tracking-wide whitespace-nowrap text-white uppercase shadow-md transition-all duration-100 ease-out outline-none select-none active:scale-95"
    >
      Вперед в игру
    </button>
  );
};
