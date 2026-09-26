import { ErrorBoundary } from "@/eventbus/ErrorBoundary";
import { BottomMenu } from "@/MainScene/components/BottomMenu/BottomMenu";
import { Header } from "@/MainScene/components/Header/Header";
import { PetCharacter } from "@/MainScene/components/PetCharacter/PetCharacter";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { SideMenuLeft } from "@/MainScene/components/SideButtonsMenu/SideMenuLeft";
import { SideMenuRight } from "@/MainScene/components/SideButtonsMenu/SideMenuRight";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import NiceModal from "@ebay/nice-modal-react";
import { useEffect, useRef, useState } from "react";
import { executeMainResize } from "./mainLayoutHelper";
import { MainScene } from "./MainScene";
import { isMock } from "@/api/api";
import { HelpModal } from "@/MainScene/components/HelpModal/HelpModal";
import { ProfileEdit } from "@/MainScene/components/ProfileEdit/ProfileEdit";

NiceModal.register("help-modal", HelpModal);
NiceModal.register("profile-modal", ProfileEdit);

export const MainSceneUI = ({ phaserScene }: { phaserScene: MainScene }) => {
  const { alertText, setAlertText, userId } = useMainGameStore((s) => s);
  const activePetIndex = usePetStore((s) => s.activePetIndex);

  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isUiMounted, setIsUiReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const alertTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (isMock) {
      NiceModal.show("help-modal");
    } else if (userId) {
      const savedFlag = localStorage.getItem(`guide_viewed_${userId}`);
      if (savedFlag !== "true") {
        NiceModal.show("help-modal");
      }
    }
  }, [userId]);

  useEffect(() => {
    const handleResize = (data: any) => {
      const uiRoot = containerRef.current?.closest(".phaser-ui-root-container") as HTMLDivElement;
      if (uiRoot) {
        executeMainResize(data.width, data.height, uiRoot);
        setIsLayoutReady(true);

        requestAnimationFrame(() => {
          setIsUiReady(true);
        });
      }
    };

    const handleMiniGameStart = (e: any) =>
      phaserScene.events.emit("switch_to_minigame", { scene: e.detail?.scene, difficulty: e.detail?.difficulty });

    const handleShowBubble = (e: any) => {
      if (!e.detail?.text) return;
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      setAlertText(e.detail.text);
      alertTimeoutRef.current = setTimeout(() => setAlertText(""), 2500);
    };

    phaserScene.events.on("phaser_main_resize", handleResize);
    window.addEventListener("start_mini_game", handleMiniGameStart);
    window.addEventListener("ui_show_bubble", handleShowBubble);

    if (phaserScene.sys.isActive()) {
      handleResize(phaserScene.getLatestResizeData());
    }

    return () => {
      phaserScene.events.off("phaser_main_resize", handleResize);
      window.removeEventListener("start_mini_game", handleMiniGameStart);
      window.removeEventListener("ui_show_bubble", handleShowBubble);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, [phaserScene, setAlertText]);

  const showUi = isLayoutReady && isUiMounted && activePetIndex !== undefined;

  return (
    <ErrorBoundary>
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden font-black select-none"
        style={{ visibility: showUi ? "visible" : "hidden" }}
      >
        <div className="ui-canvas-target pointer-events-none absolute top-1/2 left-1/2 box-border flex h-[1080px] w-[1920px] flex-col items-center justify-center [backface-visibility:hidden]">
          <div className="ui-header-target absolute left-1/2"><Header /></div>
          <div className="ui-left-target pointer-events-auto absolute z-30 origin-left"><SideMenuLeft /></div>
          <div className="ui-right-target pointer-events-auto absolute z-30 origin-right"><SideMenuRight /></div>
          <div className="ui-pet-target pointer-events-none absolute">
            <PetCharacter key={activePetIndex} alertText={alertText} onAnimationEnd={() => {}} />
          </div>
          <div className="ui-bottom-target pointer-events-none absolute"><BottomMenu className="pointer-events-auto" /></div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
