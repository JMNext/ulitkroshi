import nextButtonImg from '/src/assets/registration/next_button.png';

interface NextButtonProps {
  onClick: () => void;
}

export const NextButton = ({ onClick }: NextButtonProps) => {
  return (
    <button 
      onClick={onClick} 
      className="pointer-events-auto active:scale-90 transition-transform cursor-pointer flex items-center justify-center w-[180px] h-[180px] border-none bg-transparent mt-4"
    >
      {/* ИСПРАВЛЕНО: Переменная вместо строки пути */}
      <img src={nextButtonImg} className="w-full h-full object-contain" alt="далее" />
    </button>
  );
};
