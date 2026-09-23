import { isMock } from "@/api/client";
import { EventBus } from "@/eventbus/EventBus";
import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { clsx } from "clsx";
import { useEffect } from "react";
import { LoginButton } from "./components/LoginButton";
import { LoginLoader } from "./components/LoginLoader";
import { RegisterLink } from "./components/RegisterLink";
import { LoginScene } from "./LoginScene";
import { useLoginStore } from "./store/useLoginStore";

export const LoginUiManager = ({ phaserScene }: { phaserScene: LoginScene }) => {
  const { status, startLoading, scale, isVert, updateField } = useLoginStore();

  useEffect(() => {
    updateField?.("status", "button");

    const handleResize = (d: any) => {
      updateField("width", d.width);
      updateField("height", d.height);
      updateField("scale", d.scale);
      updateField("isVert", d.isVert);
    };

    const handleUnload = () => {
      const phone = localStorage.getItem("login_phone_buffer");
      if (!isMock && phone && !localStorage.getItem("accessToken")) {
        navigator.sendBeacon("http://localhost:3001/auth/login/cleanup-registration", JSON.stringify({ phone }));
      }
    };

    phaserScene.events.on("phaser_scene_resize", handleResize).on("phaser_before_unload", handleUnload);
    if (phaserScene.sys.isActive()) phaserScene.triggerResize();

    return () => {
      phaserScene.events.off("phaser_scene_resize", handleResize).off("phaser_before_unload", handleUnload);
    };
  }, [phaserScene, updateField]);

  const handleAction = (isLogin: boolean, action: "login" | "register") => {
    if (!phaserScene.sys.isActive()) return;
    useRegistrationStep2Store.getState().setIsLogin(isLogin);
    useRegistrationStep3Store.getState().setIsLogin(isLogin);

    const switchScene = () => {
      EventBus.emit("login_scene_stop");
      EventBus.emit(action === "login" ? "step2_scene_start" : "step1_scene_start");
      phaserScene.events.emit("switch_scene", action);
    };

    isLogin ? startLoading(switchScene) : switchScene();
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
          <LoginLoader />
        )}
      </div>
    </div>
  );
};
