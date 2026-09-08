import sideBtnBg from "@/assets/interface-icons/button.svg";
import shopIcon from "@/assets/interface-icons/shop.svg";
import fotoIcon from "@/assets/interface-icons/foto.svg";
import minigameIcon from "@/assets/interface-icons/mini-game.svg";
import mypetsIcon from "@/assets/interface-icons/my-pets.svg";

interface SideButtonsMenuProps {
  side: 'left' | 'right';
  styles: React.CSSProperties;
}

const SIDE_BUTTONS = {
  left: [
    { id: 'shop', icon: shopIcon },
    { id: 'foto', icon: fotoIcon }
  ],
  right: [
    { id: 'minigames', icon: minigameIcon },
    { id: 'pets', icon: mypetsIcon }
  ]
};

export const SideButtonsMenu = ({ side, styles }: SideButtonsMenuProps) => {
  return (
    <div className="absolute pointer-events-auto z-30 origin-center transition-all duration-150" style={styles}>
      <div className="flex flex-col gap-5 items-center justify-center">
        {SIDE_BUTTONS[side].map(({ id, icon }) => (
          <button 
            key={id} 
            type="button" 
            data-ui-action={id} 
            className="cursor-pointer outline-none relative w-[120px] h-[120px] bg-transparent flex items-center justify-center active:scale-95 transition-transform touch-manipulation border-0 m-0 p-0 box-border"
          >
            <img src={sideBtnBg} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="" />
            <img src={icon} className="relative w-20 h-20 object-contain z-10 pointer-events-none" alt="" />
          </button>
        ))}
      </div>
    </div>
  );
};
