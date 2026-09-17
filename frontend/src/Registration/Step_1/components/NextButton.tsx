import nextBtnImg from "/src/assets/registration/next_button.png";

interface NextButtonProps {
  onComplete: () => void;
}

export const NextButton = ({ onComplete }: NextButtonProps) => {
  return (
    <button
      type="button"
      onClick={onComplete}
      className="pointer-events-auto m-0 box-border flex h-[100px] w-[100px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-transform duration-75 outline-none active:scale-95"
    >
      <img src={nextBtnImg} className="pointer-events-none block h-full w-full object-contain" alt="Далее" />
    </button>
  );
};
