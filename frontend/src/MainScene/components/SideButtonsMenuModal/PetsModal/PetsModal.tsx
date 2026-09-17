import { CloseButton } from "@/CloseButton/CloseButton";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { PetsTrack } from "@/MainScene/components/SideButtonsMenuModal/PetsModal/components/PetsTrack";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { useEffect } from "react";
import { PetMetaInfo } from "./components/PetMetaInfo";
import { usePetNavigationStore } from "./store/usePetNavigationStore";
import startPetImg from "/src/assets/start-pet.png";

export const PetsModal = NiceModal.create(() => {
  const modal = useModal();
  const { isVert, scale } = useMainGameStore();
  const { activePetIndex, unlockedPetIndexes, petName, updateField } = usePetStore();
  const { currentIndex, init, onDragStart, onDragMove, handleWheel, handlePrev, handleNext } = usePetNavigationStore();

  useEffect(() => {
    init(activePetIndex);
  }, [activePetIndex, init]);

  const computedScale = isVert ? scale * 0.95 : Math.max(0.72, scale * 0.95);
  const isUnlocked = unlockedPetIndexes.includes(currentIndex);
  const isSelected = currentIndex === activePetIndex;

  return (
    <Dialog.Root open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none">
          <div className="pointer-events-none fixed inset-x-0 top-0 box-border flex h-16 items-center justify-between overflow-visible bg-transparent px-8 select-none">
            <Dialog.Title className="pointer-events-auto mt-4 ml-2 font-black tracking-wide text-white uppercase antialiased drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] portrait:text-[18px] landscape:text-[20px]">
              Коллекция ({currentIndex + 1}/20)
            </Dialog.Title>
            <Dialog.Close asChild>
              <CloseButton className="pointer-events-auto !absolute top-[30px] right-[30px] z-50 !h-[44px] !w-[44px] text-[18px] sm:!h-[54px] sm:!w-[54px] sm:text-[24px] [@media(orientation:landscape)_and_(max-height:500px)]:top-[20px] [@media(orientation:landscape)_and_(max-height:500px)]:right-[20px]" />
            </Dialog.Close>
          </div>

          <div
            className="landscape:max-h-[520px]:pt-6 relative box-border flex w-full max-w-[850px] origin-center flex-col items-center justify-center overflow-visible pt-12 select-none"
            style={{ transform: `scale(${computedScale})` }}
            onWheel={handleWheel}
          >
            <PetMetaInfo currentIndex={currentIndex} isUnlocked={isUnlocked} petName={petName} />

            <div
              className="flex h-full w-full justify-center"
              onPointerDown={(e) => onDragStart(e.clientX)}
              onPointerMove={(e) => onDragMove(e.clientX)}
            >
              <PetsTrack currentIndex={currentIndex} startPetImg={startPetImg} updateField={updateField} />
            </div>

            <div className="mt-3 flex h-8 w-full shrink-0 items-center justify-center landscape:mt-1">
              <button
                type="button"
                disabled={!isUnlocked || isSelected}
                onClick={() => isUnlocked && updateField("activePetIndex", currentIndex)}
                className={clsx(
                  "min-w-[120px] rounded-full border-2 border-solid border-white px-4 py-1 text-center text-[12px] font-black tracking-wider whitespace-nowrap text-white uppercase antialiased shadow-md transition-all",
                  isUnlocked
                    ? isSelected
                      ? "cursor-default bg-[#81c714]"
                      : "cursor-pointer touch-manipulation bg-[#ff9800] active:scale-[0.98]"
                    : "cursor-default bg-slate-500 opacity-80"
                )}
              >
                {isUnlocked ? (isSelected ? "Выбран" : "Выбрать") : "Не получен"}
              </button>
            </div>

            <div className="z-30 mt-4 flex w-full items-center justify-center gap-16 select-none landscape:mt-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex h-12 w-12 cursor-pointer touch-manipulation items-center justify-center border-none bg-transparent p-0 font-sans text-[42px] leading-none font-light text-white/60 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-transform outline-none hover:text-white active:scale-75"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex h-12 w-12 cursor-pointer touch-manipulation items-center justify-center border-none bg-transparent p-0 font-sans text-[42px] leading-none font-light text-white/60 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-transform outline-none hover:text-white active:scale-75"
              >
                ›
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
