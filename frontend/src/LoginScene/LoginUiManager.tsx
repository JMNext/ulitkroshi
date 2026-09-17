import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { clsx } from "clsx";
import React, { useEffect } from "react";
import { LoginButton } from "./components/LoginButton";
import { LoginLoader } from "./components/LoginLoader";
import { RegisterLink } from "./components/RegisterLink";
import { LoginScene } from "./LoginScene";
import { useLoginStore } from "./store/useLoginStore";

interface LoginUiProps {
  phaserScene: LoginScene;
}

export function LoginUiManager({ phaserScene }: LoginUiProps) {
  const { status, startLoading, scale, isVert } = useLoginStore();

  useEffect(() => {
    if (phaserScene.sys.isActive()) phaserScene.triggerResize();
  }, [phaserScene]);

  const handleSceneSwitch = (action: "login" | "register") => {
    if (phaserScene.sys.isActive()) phaserScene.events.emit("switch_scene", action);
  };

  const handleAction = (isLogin: boolean, action: "login" | "register") => {
    useRegistrationStep2Store.getState().setIsLogin(isLogin);
    useRegistrationStep3Store.getState().setIsLogin(isLogin);
    if (isLogin) {
      startLoading(() => handleSceneSwitch("login"));
    } else {
      handleSceneSwitch("register");
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
          <LoginLoader />
        )}
      </div>
    </div>
  );
}
