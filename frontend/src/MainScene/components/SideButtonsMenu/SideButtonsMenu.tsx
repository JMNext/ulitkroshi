import sideBtnBg from "@/assets/interface-icons/button.svg";
import fotoIcon from "@/assets/interface-icons/foto.svg";
import minigameIcon from "@/assets/interface-icons/mini-game.svg";
import mypetsIcon from "@/assets/interface-icons/my-pets.svg";
import shopIcon from "@/assets/interface-icons/shop.svg";

interface SideButtonsMenuProps {
  side: "left" | "right";
  styles: React.CSSProperties;
}

const SIDE_BUTTONS = {
  left: [
    { id: "shop", icon: shopIcon },
    { id: "foto", icon: fotoIcon }
  ],
  right: [
    { id: "minigames", icon: minigameIcon },
    { id: "pets", icon: mypetsIcon }
  ]
};

export const SideButtonsMenu = ({ side, styles }: SideButtonsMenuProps) => {
  return (
    <div className="pointer-events-auto absolute z-30 origin-center transition-all duration-150" style={styles}>
      <div className="flex flex-col items-center justify-center gap-5">
        {SIDE_BUTTONS[side].map(({ id, icon }) => (
          <button
            key={id}
            type="button"
            data-ui-action={id}
            className="relative m-0 box-border flex h-[120px] w-[120px] cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 transition-transform outline-none active:scale-95"
          >
            <img src={sideBtnBg} className="pointer-events-none absolute inset-0 h-full w-full object-contain" alt="" />
            <img src={icon} className="pointer-events-none relative z-10 h-20 w-20 object-contain" alt="" />
          </button>
        ))}
      </div>
    </div>
  );
};
