import nextButtonImg from '/src/assets/registration/next_button.png';
import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

export const NextButton = ({ onComplete }: { onComplete: () => void }) => {
  const { stage } = useRegistrationStep1Store();

  if (stage !== 4) return null;

  return (
    <button 
      type="button" 
      onClick={onComplete} 
      className="border-none bg-transparent transition-transform duration-100 ease-out cursor-pointer active:scale-95 outline-none select-none w-[140px] h-[140px]"
      aria-label="Далее"
    >
      <img src={nextButtonImg} className="w-full h-full object-contain" alt="Далее" />
    </button>
  );
};
