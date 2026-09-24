import { CloseButton } from "@/CloseButton/CloseButton";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLayoutEffect, useState } from "react";
import { HELP_SECTIONS } from "./constants/helpModal.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";

export const HelpModal = NiceModal.create(() => {
  const modal = useModal();
  const [scale, setScale] = useState(1);
  const setIsHelpShown = useMainGameStore((s) => s.setIsHelpShown);

  useLayoutEffect(() => {
    if (!modal.visible) return;
    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const el = document.querySelector(".phaser-ui-root-container");
      const ps = el ? parseFloat(getComputedStyle(el).getPropertyValue("--game-scale")) || 1 : 1;
      setScale(h > w ? (w >= 768 ? Math.max(ps, (w * 0.55) / 520) : Math.max(0.65, Math.min(1.0, (w * 0.9) / 520))) : (w >= 1024 && h >= 768 ? Math.min(1.0, Math.max(ps, (h * 0.65) / 520)) : (h * 0.88) / 520));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [modal.visible]);

  if (!modal.visible) return null;

  const handleClose = () => {
    setIsHelpShown(false);
    modal.hide();
  };

  return (
    <Dialog.Root defaultOpen={true} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <Dialog.Portal container={typeof document !== "undefined" ? document.body : undefined}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 box-border flex h-auto max-h-[85vh] w-[520px] origin-center flex-col items-center rounded-[32px] border-[4px] border-[#ffca28] bg-white px-5 pt-12 pb-5 shadow-2xl outline-none select-none" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
          <Dialog.Close asChild><CloseButton className="absolute top-5 right-4 z-40 cursor-pointer" /></Dialog.Close>
          <Dialog.Title className="mb-4 shrink-0 text-center text-[22px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased">Как играть</Dialog.Title>

          <div className="flex w-full max-w-[460px] scrollbar-none flex-col gap-4 overflow-y-auto text-[15px] leading-relaxed font-medium text-[#1a3d1c] antialiased">
            {HELP_SECTIONS.map(({ id, title, text }) => (
              <div key={id} className="flex shrink-0 flex-col gap-1 rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <span className="text-[16px] font-black text-[#ff9800]">{title}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>

          <button type="button" onClick={handleClose} className="pointer-events-auto mx-auto mt-4 flex h-[46px] w-full max-w-[400px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-[24px] border-0 bg-[#ff9800] p-0 text-[15px] font-black tracking-wide text-white uppercase shadow-sm outline-none active:scale-98">
            Понятно
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
