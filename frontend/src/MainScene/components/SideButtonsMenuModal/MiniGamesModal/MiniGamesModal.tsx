import { CloseButton } from "@/CloseButton/CloseButton";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLayoutEffect, useState } from "react";
import { DifficultyView } from "./components/DifficultyView";
import { GameListView } from "./components/GameListView";

export const MiniGamesModal = NiceModal.create(({ onSelectGame }: { onSelectGame?: (scene: string, difficulty: "easy" | "medium" | "hard") => void }) => {
  const modal = useModal();
  const [view, setView] = useState<"main" | "difficulty">("main");
  const [selectedScene, setSelectedScene] = useState("");
  const [scale, setScale] = useState(1);

  const { hp, currentAnim, incrementMiniGamesClick } = usePetStore();
  const isBlocked = hp < 10 || ["sleep_circle", "sleep_begin", "sleep_awake"].includes(currentAnim);
  const isMain = view === "main";

  useLayoutEffect(() => {
    if (!modal.visible) return;
    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const el = document.querySelector(".phaser-ui-root-container");
      const ps = el ? parseFloat(getComputedStyle(el).getPropertyValue("--game-scale")) || 1 : 1;
      setScale(h > w ? (w >= 768 ? Math.max(ps, (w * 0.44) / 360) : (w * 0.85) / 360) : (w >= 1024 && h >= 768 ? Math.min(1.0, Math.max(ps, (h * 0.58) / 420)) : (h * 0.88) / 420));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [modal.visible]);

  const handleClose = () => { setView("main"); setSelectedScene(""); modal.hide(); };

  const handleSelectMode = (difficulty: "easy" | "medium" | "hard") => {
    if (onSelectGame) onSelectGame(selectedScene, difficulty);
    else {
      window.dispatchEvent(new CustomEvent("main_scene_stop"));
      window.dispatchEvent(new CustomEvent("start_mini_game", { detail: { scene: selectedScene, difficulty } }));
    }
    handleClose();
  };

  const handleGameClick = (scene: string) => {
    if (isBlocked) {
      handleClose();
      window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text: incrementMiniGamesClick() } }));
      return;
    }
    setSelectedScene(scene); setView("difficulty");
  };

  return (
    <Dialog.Root open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 box-border flex h-[420px] w-[360px] origin-center flex-col items-center overflow-hidden rounded-[28px] border-[4px] border-[#ffca28] bg-white px-5 pt-10 pb-5 shadow-2xl outline-none focus:outline-none" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
          <Dialog.Close asChild><CloseButton className="absolute top-5 right-4 z-40 cursor-pointer" /></Dialog.Close>

          {!isMain && (
            <button type="button" onClick={() => setView("main")} className="absolute top-5 left-4 z-40 flex h-10 cursor-pointer touch-manipulation items-center gap-1 text-[14px] font-black tracking-wide text-[#94a3b8] uppercase outline-none select-none hover:text-slate-600">
              <span className="relative -top-[1.5px] text-[20px] leading-none font-light">‹</span> Назад
            </button>
          )}

          <div className="flex h-full w-full flex-col items-center justify-between">
            <div className="flex min-h-[40px] w-full shrink-0 items-center justify-center">
              {isMain && <Dialog.Title className="text-center text-[20px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased select-none">МИНИ-ИГРЫ</Dialog.Title>}
            </div>
            <div className="flex w-full flex-1 flex-col items-center justify-center pb-2">
              {isMain ? <GameListView isBlocked={isBlocked} onGameClick={handleGameClick} /> : <DifficultyView onSelectMode={handleSelectMode} />}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
