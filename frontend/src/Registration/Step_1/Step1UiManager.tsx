import { EventBus } from "@/eventbus/EventBus";
import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import { BackButton } from "@/shared/components/BackButton";
import Phaser from "phaser";
import { useEffect } from "react";
import { BubbleBlock } from "./components/BubbleBlock";
import { ConfirmSelection } from "./components/ConfirmSelection";
import { NextButton } from "./components/NextButton";
import { PetVideoBlock } from "./components/PetVideoBlock";
import { SpeechInputField } from "./components/SpeechInputField";
import { SpeechMicButton } from "./components/SpeechMicButton";
import { Step1Scene } from "./Step1Scene";

export function Step1UiManager({ phaserScene }: { phaserScene: Step1Scene }) {
  const {
    stage,
    input,
    isNameChecking,
    submit,
    layoutContext: ctx,
    finalScale,
    setLayout,
    setStage,
    resetStore,
  } = useRegistrationStep1Store();

  useEffect(() => {
    const handleResize = (d: any) =>
      setLayout({ screenMode: d.screenMode, viewW: d.viewW, scale: d.scale, isVert: d.isVert }, d.finalScale);
    const handleReset = () => setStage(1);

    const handleFlow = (data: { isLogin: boolean }) => {
      console.log("Режим входа/регистрации на Шаге 1:", data.isLogin);
    };

    phaserScene.events
      .on("phaser_scene_resize", handleResize)
      .on("phaser_scene_sleep", handleReset)
      .on("phaser_scene_cleanup", handleReset);

    EventBus.on("set_registration_flow", handleFlow);

    if (phaserScene.sys.isActive()) phaserScene.triggerResize();

    return () => {
      phaserScene.events
        .off("phaser_scene_resize", handleResize)
        .off("phaser_scene_sleep", handleReset)
        .off("phaser_scene_cleanup", handleReset);
      EventBus.off("set_registration_flow", handleFlow);
    };
  }, [phaserScene, setLayout, setStage]);

  if (!ctx) return null;

  const isMob = ctx.screenMode === "mobile" || ctx.screenMode === "fold";
  const transf = `translate(-50%, -50%) scale(${isMob ? 1.2 : 1})`;
  const top = isMob ? "965px" : "910px";

  const handleNext = () => {
    if (!phaserScene.sys.isActive()) return;
    phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
    phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (!phaserScene.sys.isActive()) return;
      EventBus.emit("step1_scene_stop");
      EventBus.emit("step2_scene_start");
      phaserScene.scene.stop("Step1Scene");
      phaserScene.scene.start("Step2Scene", { sessionId: "mock-session-id" });
    });
  };

  const handleBackToLogin = () => {
    if (!phaserScene.sys.isActive()) return;
    phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
    phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (!phaserScene.sys.isActive()) return;
      EventBus.emit("step1_scene_stop");
      EventBus.emit("login_scene_start");
      resetStore();
      phaserScene.scene.stop("Step1Scene");
      phaserScene.scene.start("LoginScene");
    });
  };

  const hasName = input.trim().length > 0;
  const handleProceed = () => {
    const val = input.trim();
    if (!isNameChecking && val) {
      submit(val);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden select-none">
      {/* Кнопка возврата в верхнем левом углу экрана */}
      <div
        className="pointer-events-auto absolute z-50"
        style={{
          top: "max(16px, env(safe-area-inset-top, 16px))",
          left: "max(16px, env(safe-area-inset-left, 16px))",
        }}
      >
        <BackButton onClick={handleBackToLogin} label="В начало" />
      </div>

      <div
        className="pointer-events-none absolute top-1/2 left-1/2 z-10 box-border flex h-[1080px] w-[1920px] flex-col items-center justify-center [backface-visibility:hidden]"
        style={{ transform: `translate(-50%, -50%) scale(${finalScale})` }}
      >
        <PetVideoBlock />
        <BubbleBlock />

        {(stage === 1 || stage === 3) && (
          <>
            <div
              className="pointer-events-none absolute left-1/2 z-20 origin-center"
              style={{ top: isMob ? "835px" : "810px", transform: transf }}
            >
              <SpeechInputField />
            </div>

            <div
              className="pointer-events-none absolute left-1/2 z-20 origin-center"
              style={{ top, transform: transf }}
            >
              {hasName ? (
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleProceed}
                    className="pointer-events-auto flex h-[60px] min-w-[220px] cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#559404] px-6 text-[21px] font-black tracking-wide text-white uppercase shadow-[0_6px_20px_rgba(129,199,20,0.5)] transition-transform duration-100 outline-none select-none active:scale-95 hover:brightness-105"
                  >
                    <span>Продолжить</span>
                    <svg className="h-6 w-6 stroke-[3] fill-none stroke-current" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                  <SpeechMicButton compact />
                </div>
              ) : (
                <SpeechMicButton />
              )}
            </div>
          </>
        )}

        {stage === 2 && (
          <div
            className="pointer-events-none absolute top-[865px] left-1/2 z-10 origin-center"
            style={{ transform: transf }}
          >
            <ConfirmSelection />
          </div>
        )}

        {stage === 4 && (
          <div
            className="pointer-events-none absolute left-1/2 z-10 origin-center"
            style={{ top, transform: transf }}
          >
            <NextButton onComplete={handleNext} />
          </div>
        )}
      </div>
    </div>
  );
}
