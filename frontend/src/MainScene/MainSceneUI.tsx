import StageTransitionOverlay from "@/MainScene/components/ExperienceBar/StageTransitionOverlay";
import ExperienceBar from "@/MainScene/components/ExperienceBar/ExperienceBar";
import { PetIndicators } from "@/MainScene/components/PetCharacter/PetIndicators";
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
import { useApiStore } from "@/api/store/useApiStore";

NiceModal.register("help-modal", HelpModal);
NiceModal.register("profile-modal", ProfileEdit);

export const MainSceneUI = ({ phaserScene }: { phaserScene: MainScene }) => {
  const { alertText, setAlertText, userId } = useMainGameStore((s) => s);
  const activePetIndex = usePetStore((s) => s.activePetIndex);
  const petName = usePetStore((s) => s.petName);
  const hp = usePetStore((s) => s.hp);
  const currentAnim = usePetStore((s) => s.currentAnim);

  // Подключаем отслеживание профиля из вашего useApiStore
  const userProfile = useApiStore((s) => s.user);

  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isUiMounted, setIsUiReady] = useState(false);
  const [isVert, setIsVert] = useState(() => {
    const initData = phaserScene.getLatestResizeData();
    return initData ? initData.isVert : (typeof window !== "undefined" && window.innerHeight > window.innerWidth);
  });

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
      if (data?.isVert !== undefined) {
        setIsVert(data.isVert);
      } else if (data?.height && data?.width) {
        setIsVert(data.height > data.width);
      }
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

  // ЖЁСТКАЯ ГАРАНТИЯ СИНХРОННОСТИ:
  // Интерфейс станет видимым ТОЛЬКО тогда, когда профиль пользователя (userProfile) полностью
  // докачался с сервера Таймвеба и успел наполнить данными usePetStore
  const isApiDataLoaded = userProfile !== null && userProfile !== undefined;
  const showUi = isLayoutReady && isUiMounted && isApiDataLoaded && activePetIndex !== undefined && activePetIndex !== null;

  return (
    <ErrorBoundary>
      <StageTransitionOverlay />
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden font-black select-none"
        style={{
          opacity: showUi ? 1 : 0,
          visibility: showUi ? "visible" : "hidden",
          transition: "opacity 0.12s ease-out"
        }}
      >
        <div className="ui-canvas-target pointer-events-none absolute top-1/2 left-1/2 box-border flex h-[1080px] w-[1920px] flex-col items-center justify-center [backface-visibility:hidden]">
          <div className="ui-header-target pointer-events-none absolute left-1/2 z-50"><Header isVert={isVert} /></div>
          <div className="ui-exp-target pointer-events-auto absolute left-1/2 z-40 origin-center"><ExperienceBar isVert={isVert} /></div>
          <div className="ui-indicators-target pointer-events-none absolute left-1/2 z-30 origin-center">
            {showUi && (
              <PetIndicators petName={petName} hp={hp} currentAnim={currentAnim} alertText={alertText} />
            )}
          </div>
          <div className="ui-alert-target pointer-events-none absolute left-1/2 z-50 origin-center">
            {alertText && (
              <div className="animate-fade-in pointer-events-none flex w-[440px] max-w-[90vw] items-center justify-center rounded-2xl border-2 border-solid border-orange-400 bg-black/90 px-5 py-3.5 text-center backdrop-blur-sm shadow-2xl">
                <span className="text-[16px] sm:text-[18px] leading-snug font-black tracking-wide text-orange-400 uppercase block break-words w-full">
                  {alertText}
                </span>
              </div>
            )}
          </div>
          <div className="ui-left-target pointer-events-auto absolute z-30 origin-left"><SideMenuLeft /></div>
          <div className="ui-right-target pointer-events-auto absolute z-30 origin-right"><SideMenuRight /></div>
          <div className="ui-pet-target pointer-events-none absolute h-[644px] w-[644px]">
            {showUi && (
              <PetCharacter key={activePetIndex} onAnimationEnd={() => {}} />
            )}
          </div>
          <div className="ui-bottom-target pointer-events-none absolute"><BottomMenu isVert={isVert} className="pointer-events-auto" /></div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
