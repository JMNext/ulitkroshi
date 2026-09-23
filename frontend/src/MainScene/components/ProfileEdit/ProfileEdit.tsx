import { authApi } from "@/api/auth.api";
import { CloseButton } from "@/CloseButton/CloseButton";
import { EventBus } from "@/eventbus/EventBus";
import { AvatarSelectView } from "@/MainScene/components/ProfileEdit/components/AvatarSelectView";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLayoutEffect, useState } from "react";
import { ProfileActions } from "./components/ProfileActions";
import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProfileNameField } from "./components/ProfileNameField";

export const ProfileEdit = NiceModal.create(() => {
  const modal = useModal();
  const { username, avatarId, setUsername, resetStore, discriminator } = useMainGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (!modal.visible) return;
    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const el = document.querySelector(".phaser-ui-root-container");
      const ps = el ? parseFloat(getComputedStyle(el).getPropertyValue("--game-scale")) || 1 : 1;
      setScale(h > w ? (w >= 768 ? Math.max(ps, (w * 0.42) / 340) : (w * 0.85) / 340) : (w >= 1024 && h >= 768 ? Math.min(1.0, Math.max(ps, (h * 0.5) / 370)) : (h * 0.88) / 370));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [modal.visible]);

  const handleLogout = async () => {
    modal.hide(); setIsEditing(false);
    EventBus.emit("force_logout_to_login");
    try { await authApi.logout(); } catch (e) { console.error(e); }
    await resetStore();
  };

  const handleClose = () => { modal.hide(); setIsEditing(false); };

  return (
    <Dialog.Root open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 box-border flex h-[370px] w-[340px] origin-center flex-col items-center overflow-hidden rounded-[28px] border-[4px] border-[#ffca28] bg-white p-5 shadow-2xl outline-none" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
          <Dialog.Close asChild><CloseButton className="absolute top-4 right-4 z-40 cursor-pointer" /></Dialog.Close>

          {!isEditing ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 pt-1">
              <Dialog.Title className="sr-only">Профиль</Dialog.Title>
              <div className="pr-6 text-center text-[16px] font-black tracking-wider text-slate-500/90 uppercase select-none">Тег: #{discriminator || "0000"}</div>
              <div className="cursor-pointer" onClick={() => setIsEditing(true)}><ProfileAvatar avatarId={avatarId} /></div>
              <ProfileNameField currentName={username} setUsername={setUsername} />
              <div className="mt-1 flex w-full flex-col gap-2">
                <ProfileActions onStartScanner={() => { handleClose(); EventBus.emit("main_scene_stop"); EventBus.emit("scanner_scene_start"); }} onLogout={handleLogout} />
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center"><AvatarSelectView onBack={() => setIsEditing(false)} /></div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
