import { CloseButton } from "@/CloseButton/CloseButton";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { PetsTrack } from "@/MainScene/components/SideButtonsMenuModal/PetsModal/components/PetsTrack";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { PetMetaInfo } from "./components/PetMetaInfo";
import { PetNavigationControls } from "@/MainScene/components/SideButtonsMenuModal/PetsModal/components/PetNavigationControls";
import { PetStarsRating } from "@/MainScene/components/SideButtonsMenuModal/PetsModal/components/PetStarsRating";
import { usePetNavigationStore } from "./store/usePetNavigationStore";
import startPetImg from "/src/assets/start-pet.png";

if (typeof document !== "undefined" && !document.getElementById("holo-shimmer-styles")) {
  const style = document.createElement("style");
  style.id = "holo-shimmer-styles";
  style.innerHTML = `
    @keyframes holoGradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    .holo-card-shine { background: linear-gradient(-45deg, #e2e8f0, #cbd5e1, #ffffff, #94a3b8, #cbd5e1, #ffffff, #e2e8f0); background-size: 400% 400%; animation: holoGradient 8s ease infinite; }
  `;
  document.head.appendChild(style);
}

export const PetsModal = NiceModal.create(() => {
  const modal = useModal();
  const { activePetIndex, unlockedPetIndexes, petName, updateField } = usePetStore();
  const { currentIndex, init, onDragStart, onDragMove, onDragEnd, handleWheel, handlePrev, handleNext } = usePetNavigationStore();
  const [scale, setScale] = useState(1);

  useEffect(() => { init(activePetIndex); }, [activePetIndex, init]);

  useLayoutEffect(() => {
    if (!modal.visible) return;
    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const el = document.querySelector(".phaser-ui-root-container");
      const ps = el ? parseFloat(getComputedStyle(el).getPropertyValue("--game-scale")) || 1 : 1;
      setScale(h > w ? (w >= 768 ? Math.max(ps, (w * 0.48) / 390) : Math.max(0.75, Math.min(1.05, ps))) : (w >= 1024 && h >= 768 ? Math.min(1.0, Math.max(ps, (h * 0.6) / 580)) : (h * 0.88) / 580));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [modal.visible]);

  const isUnlocked = unlockedPetIndexes.includes(currentIndex);
  const handleSelect = useCallback(() => {
    if (isUnlocked) { updateField("activePetIndex", currentIndex); modal.hide(); }
  }, [isUnlocked, currentIndex, updateField, modal]);

  return (
    <Dialog.Root open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px]" />
        <Dialog.Content className="holo-card-shine fixed top-1/2 left-1/2 z-50 box-border flex h-[580px] w-[390px] origin-center flex-col items-center overflow-hidden rounded-[32px] border-[5px] border-[#ffca28] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)] outline-none select-none" style={{ transform: `translate(-50%, -50%) scale(${scale})` }} onWheel={handleWheel}>
          <Dialog.Close asChild><CloseButton className="absolute top-4 right-4 z-50 cursor-pointer" /></Dialog.Close>
          <Dialog.Title className="sr-only">Коллекция питомцев</Dialog.Title>
          <div className="z-10 mt-6 w-full shrink-0"><PetMetaInfo currentIndex={currentIndex} isUnlocked={isUnlocked} petName={petName} /></div>

          <div className="absolute top-[46.5%] left-1/2 z-0 flex h-[300px] w-full -translate-x-1/2 -translate-y-1/2 touch-none justify-center overflow-visible" onPointerDown={(e) => onDragStart(e.clientX)} onPointerMove={(e) => e.buttons === 1 && onDragMove(e.clientX)} onPointerUp={() => onDragEnd(handleSelect)} onPointerLeave={() => onDragEnd(handleSelect)}>
            <PetsTrack currentIndex={currentIndex} startPetImg={startPetImg} isUnlocked={isUnlocked} isSelected={currentIndex === activePetIndex} updateField={updateField} onCardSelect={handleSelect} />
          </div>

          <PetStarsRating isUnlocked={isUnlocked} isStarterPet={currentIndex === 0} />
          <PetNavigationControls currentIndex={currentIndex} isUnlocked={isUnlocked} isSelected={currentIndex === activePetIndex} handlePrev={handlePrev} handleNext={handleNext} onSelect={handleSelect} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
