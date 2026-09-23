import sideBtnBg from "@/assets/interface-icons/button.svg";
import minigameIcon from "@/assets/interface-icons/mini-game.svg";
import mypetsIcon from "@/assets/interface-icons/my-pets.svg";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { MiniGamesModal } from "@/MainScene/components/SideButtonsMenuModal/MiniGamesModal/MiniGamesModal";
import { PetsModal } from "@/MainScene/components/SideButtonsMenuModal/PetsModal/PetsModal";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import NiceModal from "@ebay/nice-modal-react";

export const SideMenuRight = () => {
  const setAlert = useMainGameStore((s) => s.setAlertText);

  const handleGames = () => {
    const store = usePetStore.getState();
    if (["sleep_circle", "sleep_begin", "sleep_awake"].includes(store.currentAnim)) return setAlert(store.incrementMiniGamesClick());
    NiceModal.show(MiniGamesModal);
  };

  return (
    <div className="pointer-events-auto flex flex-col items-center justify-center gap-5">
      <button type="button" onClick={handleGames} className="relative box-border flex h-[120px] w-[120px] cursor-pointer touch-manipulation items-center justify-center bg-transparent p-0 transition-transform active:scale-95 border-0 outline-none">
        <img src={sideBtnBg} className="pointer-events-none absolute inset-0 h-full w-full object-contain" alt="" />
        <img src={minigameIcon} className="pointer-events-none relative z-10 h-20 w-20 object-contain" alt="" />
      </button>

      <button type="button" onClick={() => NiceModal.show(PetsModal)} className="relative box-border flex h-[120px] w-[120px] cursor-pointer touch-manipulation items-center justify-center bg-transparent p-0 transition-transform active:scale-95 border-0 outline-none">
        <img src={sideBtnBg} className="pointer-events-none absolute inset-0 h-full w-full object-contain" alt="" />
        <img src={mypetsIcon} className="pointer-events-none relative z-10 h-20 w-20 object-contain" alt="" />
      </button>
    </div>
  );
};
