// MainHeaderUI.tsx
import coinIcon from '../../../../assets/buttom_menu-icons/eat.svg';
import avatarIcon from '../../../../assets/interface-icons/icon-avatar.svg';
import plusIcon from '../../../../assets/interface-icons/plus.svg';
import { useMainGameStore } from '../useMainGameStore';

interface MainHeaderUIProps {
  onPlusClick: () => void;
  onAvatarClick: () => void;
}

export const MainHeaderUI = ({ onPlusClick, onAvatarClick }: MainHeaderUIProps) => {
  const coins = useMainGameStore((s) => s.coins);

  return (
    <div className="main-header-container box-border flex w-full flex-row items-center justify-between h-auto">
      {/* Плашка монет с восстановленным мобильным скейлингом */}
      <div className="coin-balance-plate box-border flex items-center justify-between rounded-full border border-white bg-[#fff6e9] shadow-md h-[94px] w-[290px] p-[14px] transition-transform duration-100 max-h-[1000px]:scale-[0.78] max-h-[1000px]:origin-left portrait:scale-[0.72] portrait:origin-left">
        <img src={coinIcon} className="coin-icon shrink-0 object-contain h-[80px] w-[80px]" alt="cookie" />
        <span className="coin-value-text flex-1 px-2 text-center font-black text-slate-700 text-[24px] max-h-[1000px]:text-[20px]">
          {coins}
        </span>
        <button type="button" onClick={onPlusClick} className="add-coins-button m-0 shrink-0 border-none bg-transparent p-0 outline-none cursor-pointer active:scale-95 transition-transform h-[60px] w-[60px]">
          <img src={plusIcon} className="add-coins-icon w-full h-full object-contain" alt="plus" />
        </button>
      </div>

      {/* Кнопка аватара с восстановленным мобильным скейлингом */}
      <button type="button" onClick={onAvatarClick} className="avatar-profile-button m-0 shrink-0 border-none bg-transparent p-0 outline-none cursor-pointer active:scale-95 transition-transform h-[100px] w-[100px] max-h-[1000px]:scale-[0.78] max-h-[1000px]:origin-right portrait:scale-[0.72] portrait:origin-right">
        <img src={avatarIcon} className="avatar-profile-icon w-full h-full object-contain drop-shadow-md" alt="avatar" />
      </button>
    </div>
  );
};
