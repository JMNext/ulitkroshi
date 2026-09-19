import { CloseButton } from "@/CloseButton/CloseButton";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { EventBus } from "@/eventbus/EventBus";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import Phaser from "phaser";
import { BTN_BASE_CLASS, GAME_COLORS, GAME_SVGS, GAMES, MODES } from "./constants/games.constants";

interface CustomWindow extends Window {
  phaserGame: Phaser.Game | null;
}

export const MiniGamesModal = NiceModal.create(() => {
  const modal = useModal();
  const [view, setView] = useState<"main" | "difficulty">("main");
  const [selectedScene, setSelectedScene] = useState<string>("");

  const { hp, currentAnim, incrementMiniGamesClick } = usePetStore();

  const isBlocked = hp < 10 || ["sleep_circle", "sleep_begin", "sleep_awake"].includes(currentAnim);
  const isMainView = view === "main";

  useEffect(() => {
    if (modal.visible) {
      setView("main");
      setSelectedScene("");
    }
    return () => {
      setView("main");
      setSelectedScene("");
    };
  }, [modal.visible]);

  const handleClose = () => {
    setView("main");
    setSelectedScene("");
    modal.hide();
  };

  const handleResetState = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const handleSelectMode = (difficulty: "easy" | "medium" | "hard") => {
    EventBus.emit("main_scene_sleep");

    if (selectedScene === "CatchGameScene") {
      EventBus.emit("minigame_catch_start", { difficulty });
    } else if (selectedScene === "MemoryGameScene") {
      EventBus.emit("minigame_memory_start");
    } else if (selectedScene === "SnakeGameScene") {
      EventBus.emit("minigame_snake_start", { difficulty });
    }

    const customWindow = window as unknown as CustomWindow;
    const phaserGame = customWindow.phaserGame;
    if (phaserGame) {
      phaserGame.scene.getScene("MainScene")?.scene.sleep();
      phaserGame.scene.start(selectedScene, { difficulty });
    }
    handleClose();
  };

  const handleGameClick = (scene: string) => {
    if (isBlocked) {
      handleClose();
      window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text: incrementMiniGamesClick() } }));
      return;
    }
    setSelectedScene(scene);
    setView("difficulty");
  };

  return (
    <Dialog.Root open={modal.visible} onOpenChange={handleResetState}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none">
          <div className="relative box-border flex h-auto w-[380px] origin-center flex-col items-center rounded-[32px] border-[4px] border-[#ffca28] bg-white p-6 shadow-2xl max-sm:m-2 max-sm:w-[330px] max-sm:scale-95 max-sm:rounded-[24px] max-sm:p-4 landscape:scale-95 [@media(orientation:landscape)_and_(max-height:500px)]:w-[330px]">
            <Dialog.Close asChild>
              <CloseButton className="absolute top-3 right-3" />
            </Dialog.Close>

            {!isMainView && (
              <button
                type="button"
                onClick={() => setView("main")}
                className="absolute top-4 left-4 z-30 flex h-10 cursor-pointer touch-manipulation items-center gap-1 text-[15px] font-black tracking-wide text-[#94a3b8] uppercase transition-colors outline-none select-none hover:text-slate-600 max-sm:top-3 max-sm:left-3"
              >
                <span className="relative -top-[1.5px] text-[22px] leading-none font-light sm:text-[26px]">‹</span> Назад
              </button>
            )}

            <Dialog.Title className="mt-4 mb-4 shrink-0 pt-4 text-center text-[22px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased select-none">
              {isMainView ? "МИНИ-ИГРЫ" : "СЛОЖНОСТЬ"}
            </Dialog.Title>

            <div className="flex w-full max-w-[280px] shrink-0 flex-col items-center gap-3 pb-1">
              {isMainView
                ? GAMES.map((game) => (
                    <button
                      key={game.scene}
                      type="button"
                      onClick={() => handleGameClick(game.scene)}
                      className={`${BTN_BASE_CLASS} ${GAME_COLORS[game.scene] || "bg-[#388e3c] text-white"} h-[48px] text-[15px] ${
                        isBlocked ? "pointer-events-auto cursor-not-allowed opacity-75 grayscale-[20%] saturate-100" : ""
                      }`}
                      style={isBlocked ? { transform: "none" } : undefined}
                    >
                      <div className="absolute left-[16px] flex h-[28px] w-[28px] items-center justify-center">{GAME_SVGS[game.scene]}</div>
                      <span className="pl-[20px] antialiased">{game.text}</span>
                      {isBlocked && (
                        <div className="absolute right-[16px] flex h-[22px] w-[22px] scale-90 items-center justify-center rounded-full border border-white bg-red-500 p-1 text-white shadow-sm">
                          {GAME_SVGS.LockIcon}
                        </div>
                      )}
                    </button>
                  ))
                : MODES.map((mode) => (
                    <button
                      key={mode.diff}
                      type="button"
                      onClick={() => handleSelectMode(mode.diff as "easy" | "medium" | "hard")}
                      className={`${BTN_BASE_CLASS} h-[48px] text-[15px]`}
                      style={{ backgroundColor: mode.bgColor, color: mode.textColor }}
                    >
                      <span className="antialiased">{mode.text}</span>
                    </button>
                  ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
