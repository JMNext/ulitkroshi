interface FinalPlayButtonProps {
  onClick: () => void;
}

export const FinalPlayButton = ({ onClick }: FinalPlayButtonProps) => {
  return (
    <div className="flex h-[64px] w-[400px] items-center justify-center">
      <button
        type="button"
        onClick={() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          onClick();
        }}
        className="pointer-events-auto mx-auto box-border flex h-full w-[380px] cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#f59e0b] to-[#d97706] px-10 text-[24px] font-black tracking-wide whitespace-nowrap text-white uppercase shadow-md transition-all duration-100 ease-out outline-none select-none active:scale-95"
      >
        Вперед в игру
      </button>
    </div>
  );
};
