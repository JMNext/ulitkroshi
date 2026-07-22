import buttonBg from '../../../../assets/interface-icons/button.svg';

export const SideButtonsMenu = ({ 
  buttons, 
  onAction 
}: { 
  buttons: { id: string; src: string; icon: string }[]; 
  onAction: (id: string) => void; 
}) => {
  return (
    <nav className="side-menu-navigation flex select-none flex-col gap-5">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          type="button"
          onClick={() => onAction(btn.id)}
          className="side-menu-button relative m-0 flex shrink-0 items-center justify-center border-none bg-transparent p-0 outline-none cursor-pointer active:scale-95 transition-transform h-[120px] max-h-[120px] w-[120px] max-w-[120px]"
        >
          <img
            src={buttonBg}
            className="side-menu-button-bg absolute inset-0 w-full h-full object-contain drop-shadow-md"
            alt="bg"
          />
          <img
            src={btn.src}
            className="side-menu-button-icon z-10 object-contain h-[80px] max-h-[80px] w-[80px] max-w-[80px]"
            alt={btn.icon}
          />
        </button>
      ))}
    </nav>
  );
};
