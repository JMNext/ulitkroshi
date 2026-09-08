import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { GAMES, MODES, GAME_COLORS, GAME_SVGS, BTN_BASE_CLASS } from "./games.constants";
import { CloseButton } from "@/ModalWrapper/CloseButton";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

interface MiniGamesModalProps {
  onClose: () => void;
}

export const MiniGamesModal = ({ onClose }: MiniGamesModalProps) => {
  const [view, setView] = useState<"main" | "difficulty">("main");
  const [selectedScene, setSelectedScene] = useState<string>("");

  const { hp = 0, currentAnim = "", incrementMiniGamesClick } = usePetStore();

  const isBlocked = hp < 10 || ["sleep_circle", "sleep_begin", "sleep_awake"].includes(currentAnim);
  const isMainView = view === "main";

  const handleSelectMode = (difficulty: string) => {
    const phaserGame = (window as any).phaserGame;
    if (phaserGame) {
      phaserGame.scene.getScene("MainScene")?.scene.sleep();
      phaserGame.scene.start(selectedScene, { difficulty });
    }
    onClose();
  };

  const handleGameClick = (scene: string) => {
    if (isBlocked && incrementMiniGamesClick) {
      onClose();
      window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text: incrementMiniGamesClick() } }));
      return;
    }
    setSelectedScene(scene);
    setView("difficulty");
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none">
          <div className="box-border relative bg-white border-[4px] border-[#ffca28] rounded-[32px] max-sm:rounded-[24px] p-6 max-sm:p-4 max-sm:m-2 w-[380px] max-sm:w-[330px] [@media(orientation:landscape)_and_(max-height:500px)]:w-[330px] h-auto flex flex-col items-center max-sm:scale-95 origin-center landscape:scale-95 shadow-2xl">
            
            <Dialog.Close asChild>
              <CloseButton className="absolute top-3 right-3" />
            </Dialog.Close>

            {!isMainView && (
              <button
                type="button"
                onClick={() => setView("main")}
                className="absolute top-4 left-4 z-30 text-[#94a3b8] hover:text-slate-600 font-black text-[15px] uppercase tracking-wide cursor-pointer transition-colors flex items-center gap-1 h-10 outline-none touch-manipulation select-none max-sm:top-3 max-sm:left-3"
              >
                <span className="text-[22px] sm:text-[26px] font-light leading-none relative -top-[1.5px]">‹</span> Назад
              </button>
            )}

            <Dialog.Title className="mt-4 pt-4 mb-4 text-center text-[22px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased select-none shrink-0">
              {isMainView ? "МИНИ-ИГРЫ" : "СЛОЖНОСТЬ"}
            </Dialog.Title>

            <div className="flex w-full max-w-[280px] flex-col items-center gap-3 shrink-0 pb-1">
              {isMainView ? (
                GAMES.map((game) => (
                  <button
                    key={game.scene}
                    type="button"
                    onClick={() => handleGameClick(game.scene)}
                    className={`${BTN_BASE_CLASS} ${GAME_COLORS[game.scene] || "bg-[#388e3c] text-white"} h-[48px] text-[15px] ${
                      isBlocked ? "opacity-75 saturate-100 grayscale-[20%] pointer-events-auto cursor-not-allowed" : ""
                    }`}
                    style={isBlocked ? { transform: "none" } : undefined}
                  >
                    <div className="absolute left-[16px] flex h-[28px] w-[28px] items-center justify-center">
                      {GAME_SVGS[game.scene]}
                    </div>
                    <span className="pl-[20px] antialiased">{game.text}</span>
                    {isBlocked && (
                      <div className="absolute right-[16px] flex h-[22px] w-[22px] items-center justify-center bg-red-500 rounded-full border border-white text-white p-1 shadow-sm scale-90">
                        {GAME_SVGS.LockIcon}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                MODES.map((mode) => (
                  <button
                    key={mode.diff}
                    type="button"
                    onClick={() => handleSelectMode(mode.diff)}
                    className={`${BTN_BASE_CLASS} h-[48px] text-[15px]`}
                    style={{ backgroundColor: mode.bgColor, color: mode.textColor }}
                  >
                    <span className="antialiased">{mode.text}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
