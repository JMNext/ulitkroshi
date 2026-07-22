import nextButtonImg from '/src/assets/registration/next_button.png';
import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

interface NextButtonProps {
  onComplete: () => void;
}

export const NextButton = ({ onComplete }: NextButtonProps) => {
  const { stage } = useRegistrationStep1Store();

  if (stage !== 4) return null;

  return (
    <button 
      type="button" 
      onClick={onComplete} 
      className="border-none bg-transparent transition-transform duration-100 ease-out cursor-pointer active:scale-95 outline-none select-none will-change-transform w-[140px] h-[140px]"
      aria-label="Далее"
    >
      <img src={nextButtonImg} className="w-full h-full object-contain" alt="Далее" />
    </button>
  );
};
