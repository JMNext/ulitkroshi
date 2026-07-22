// FinalPlayButton.tsx
interface FinalPlayButtonProps {
  onClick: () => void;
}

export const FinalPlayButton = ({ onClick }: FinalPlayButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="box-border flex items-center justify-center rounded-full border-none bg-gradient-to-b from-[#f59e0b] to-[#b45309] text-center font-black tracking-wider text-white uppercase shadow-md transition-transform duration-100 ease-out will-change-transform outline-none select-none active:scale-95 cursor-pointer h-[64px] w-[340px] text-[24px]"
    >
      Вперед в игру
    </button>
  );
};
