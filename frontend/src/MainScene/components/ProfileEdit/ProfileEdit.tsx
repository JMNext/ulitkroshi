import React, { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CloseButton } from "@/ModalWrapper/CloseButton";

import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { EDIT_BTN_ICON_URL } from "./profileEdit.constants";
import { AVAILABLE_AVATARS } from "@/MainScene/components/Avatars/Avatars";

interface ProfileEditProps {
  onClose: () => void;
}

export const ProfileEdit = ({ onClose }: ProfileEditProps) => {
  const { username, avatarId, setUsername } = useMainGameStore();
  const currentAvatarId = avatarId || "default";

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(username);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(username);
  }, [username]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setInputValue(username);
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  const handleSave = () => {
    if (inputValue && setUsername) {
      setUsername(inputValue);
    }
    setIsEditing(false);
    inputRef.current?.blur();
  };

  const AvatarComponent = (
    AVAILABLE_AVATARS.find((a) => a.id === currentAvatarId) ||
    AVAILABLE_AVATARS[0]
  )?.Component;

  return (
    <Dialog.Root
      open={true}
      onOpenChange={(open) => !open && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none">
          <div className="relative box-border flex h-auto w-[380px] origin-center flex-col items-center rounded-[32px] border-[4px] border-[#ffca28] bg-white p-6 shadow-2xl max-sm:m-2 max-sm:w-[330px] max-sm:scale-95 max-sm:rounded-[24px] max-sm:p-4 landscape:scale-95 [@media(orientation:landscape)_and_(max-height:500px)]:w-[330px]">
            <Dialog.Close asChild>
              <CloseButton className="absolute top-3 right-3" />
            </Dialog.Close>

            <Dialog.Title className="sr-only">
              Редактирование профиля
            </Dialog.Title>

            <div
              data-ui-action="avatar_select"
              className={`pointer-events-auto relative mx-auto mt-8 h-[105px] w-[105px] shrink-0 cursor-pointer rounded-full bg-white shadow-sm transition-transform select-none hover:scale-105 active:scale-95 ${
                currentAvatarId === "default"
                  ? "border-0 p-0"
                  : "border-2 border-[#e2e8f0] p-1"
              }`}
            >
              <div className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                {AvatarComponent && <AvatarComponent />}
              </div>
            </div>

            <div className="relative mx-auto mt-4 flex h-[34px] w-full max-w-[280px] shrink-0 items-center justify-center font-black select-none">
              {!isEditing ? (
                <div className="pointer-events-auto flex w-full items-center justify-center gap-2">
                  <span
                    onClick={handleStartEdit}
                    className="max-w-[180px] cursor-pointer overflow-hidden text-center text-[21px] font-black text-ellipsis whitespace-nowrap text-[#1a3d1c] antialiased transition-transform active:scale-95"
                  >
                    {username}
                  </span>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="m-0 flex h-[32px] w-[32px] shrink-0 -translate-x-0.5 -translate-y-1 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-transform outline-none active:scale-90"
                  >
                    <img
                      src={EDIT_BTN_ICON_URL}
                      className="pointer-events-none block h-[26px] w-[26px] object-contain"
                      alt=""
                    />
                  </button>
                </div>
              ) : (
                <div className="pointer-events-auto flex w-full items-center justify-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    maxLength={20}
                    inputMode="text"
                    autoCapitalize="words"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                      if (e.key === "Escape") {
                        e.stopPropagation();
                        setIsEditing(false);
                      }
                    }}
                    onBlur={handleSave}
                    className="box-border h-[34px] w-full max-w-[180px] rounded-[12px] border-2 border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-center text-[17px] font-black text-[#1a3d1c] transition-colors outline-none focus:border-[#81c714]"
                  />
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleSave();
                    }}
                    className="m-0 flex h-[32px] w-[32px] shrink-0 -translate-x-0.5 -translate-y-0.5 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-transform outline-none active:scale-90"
                  >
                    <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] bg-[#81c714] text-center text-[16px] leading-none font-black text-white select-none">
                      ✓
                    </span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              data-ui-action="scan_pet"
              className="pointer-events-auto m-0 mx-auto mt-6 flex h-[48px] w-full max-w-[280px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-[24px] border-0 bg-[#ff9800] p-0 text-[15px] font-black tracking-wide text-white uppercase shadow-sm transition-transform outline-none select-none active:scale-[0.98]"
            >
              Добавить питомца
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
