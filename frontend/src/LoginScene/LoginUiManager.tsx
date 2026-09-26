import { EventBus } from "@/eventbus/EventBus";
import { preloadSharedAssets } from "@/game/MiniGamesShared/preloadSharedAssets";
import { clsx } from "clsx";
import { useEffect, useRef } from "react";
import { LoginButton } from "./components/LoginButton";
import { LoginLoader } from "./components/LoginLoader";
import { RegisterLink } from "./components/RegisterLink";
import { LoginScene } from "./LoginScene";
import { useLoginStore } from "./store/useLoginStore";

export const LoginUiManager = ({ phaserScene }: { phaserScene: LoginScene }) => {
  const { status, scale, isVert, updateField } = useLoginStore();
  const animationRef = useRef<number | null>(null);
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);

  useEffect(() => {
    updateField?.("status", "button");
    updateField?.("progress", 0);

    const handleResize = (d: any) => {
      updateField("width", d.width);
      updateField("height", d.height);
      updateField("scale", d.scale);
      updateField("isVert", d.isVert);
    };

    const handleUnload = () => {
      const phone = localStorage.getItem("login_phone_buffer");
      if (phone && !localStorage.getItem("accessToken")) {
        navigator.sendBeacon("http://localhost:3005/auth/login/cleanup-registration", JSON.stringify({ phone }));
      }
    };

    phaserScene.events.on("phaser_scene_resize", handleResize).on("phaser_before_unload", handleUnload);
    if (phaserScene.sys.isActive()) phaserScene.triggerResize();

    return () => {
      phaserScene.events.off("phaser_scene_resize", handleResize).off("phaser_before_unload", handleUnload);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phaserScene, updateField]);

  const resumeAudioContext = () => {
    const soundManager = phaserScene.sound as any;
    if (soundManager && soundManager.context && soundManager.context.state === "suspended") {
      soundManager.context.resume().catch(() => {});
    }
  };

  const handleAction = (isLogin: boolean, action: "login" | "register") => {
    if (!phaserScene.sys.isActive()) return;

    resumeAudioContext();

    const switchScene = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      EventBus.emit("login_scene_stop");
      const targetSceneKey = action === "login" ? "Step2Scene" : "Step1Scene";

      EventBus.emit(action === "login" ? "step2_scene_start" : "step1_scene_start");
      phaserScene.events.emit("switch_scene", action);

      phaserScene.scene.stop("LoginScene");
      phaserScene.scene.start(targetSceneKey, { isLoginFlow: isLogin });
    };

    if (isLogin) {
      updateField("status", "loading");
      updateField("progress", 0);

      targetProgressRef.current = 0;
      currentProgressRef.current = 0;

      const tick = () => {
        if (currentProgressRef.current < targetProgressRef.current) {
          currentProgressRef.current += 0.02;
          if (currentProgressRef.current > targetProgressRef.current) {
            currentProgressRef.current = targetProgressRef.current;
          }
          updateField("progress", currentProgressRef.current);
        }

        if (targetProgressRef.current >= 1 && currentProgressRef.current >= 1) {
          switchScene();
        } else {
          animationRef.current = requestAnimationFrame(tick);
        }
      };

      phaserScene.load.on("progress", (value: number) => {
        targetProgressRef.current = value;
      });

      phaserScene.load.once("complete", () => {
        phaserScene.load.off("progress");
        targetProgressRef.current = 1;
      });

      animationRef.current = requestAnimationFrame(tick);

      preloadSharedAssets(phaserScene, "snake");
      preloadSharedAssets(phaserScene, "racing");
      preloadSharedAssets(phaserScene, "memory", true);
      preloadSharedAssets(phaserScene, "catch");
      phaserScene.load.start();
    } else {
      switchScene();
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex h-full w-full items-end justify-center">
      <div
        className={clsx(
          "pointer-events-none z-10 box-border flex w-[460px] origin-bottom flex-col items-center gap-4 opacity-100 transition-opacity [backface-visibility:hidden]",
          isVert ? "pb-[50px]" : "pb-[85px]"
        )}
        style={{ transform: `scale(${scale})` }}
      >
        {status === "button" ? (
          <div className="pointer-events-auto flex w-full flex-col items-center justify-center gap-4">
            <LoginButton onClick={() => handleAction(true, "login")} />
            <RegisterLink onClick={() => handleAction(false, "register")} />
          </div>
        ) : (
          <div className="pointer-events-auto">
            <LoginLoader />
          </div>
        )}
      </div>
    </div>
  );
};
