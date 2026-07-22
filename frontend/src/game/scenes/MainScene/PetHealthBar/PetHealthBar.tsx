import lifeIcon from '../../../../assets/interface-icons/life.svg';
import { useMainGameStore } from '../useMainGameStore';
import { usePetCareStore } from '../usePetCareStore';

export const PetHealthBar = () => {
  const petName = useMainGameStore((state) => state.petName);
  const currentAnim = usePetCareStore((state) => state.currentAnim);
  const isVisible = currentAnim === 'prostoi1' || currentAnim === 'prostoi2';

  if (!isVisible) return null;

  return (
    <div className="pet-health-container flex flex-col items-center text-slate-700 select-none transition-opacity duration-300 ease-out opacity-100">
      {/* Имя питомца в чистом десктопном виде */}
      <span className="pet-name-text block text-center font-black text-[24px] mb-[10px]">
        {petName}
      </span>
      
      {/* Контейнер прогресс-бара */}
      <div className="pet-progress-wrapper relative flex items-center justify-center window-box w-[320px]">
        <img
          src={lifeIcon}
          className="pet-heart-icon object-contain shrink-0 relative z-30 w-[46px] h-[46px]"
          alt="life"
        />

        <div className="pet-bar-border-track rounded-[45px] border-[3px] border-white bg-[#fff6e9] box-border shrink-0 flex items-center justify-center relative z-10 ml-[-12px] w-[280px] h-[40px]">
          <div className="pet-bar-hp-fill rounded-[25px] bg-[#449103] shrink-0 w-[220px] h-[20px]" />
        </div>
      </div>

      {/* Текст процентов в чистом десктопном виде */}
      <span className="pet-percent-text font-black text-[24px] mt-2">
        100%
      </span>
    </div>
  );
};
