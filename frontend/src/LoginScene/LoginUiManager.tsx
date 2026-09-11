import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { useEffect } from "react";
import { LoginButton } from "./components/LoginButton";
import { LoginLoader } from "./components/LoginLoader";
import { RegisterLink } from "./components/RegisterLink";
import { LoginScene } from "./LoginScene";
import { useLoginStore } from "./store/useLoginStore";

interface LoginUiProps {
  phaserScene: LoginScene;
}

export function LoginUiManager({ phaserScene }: LoginUiProps) {
  const { status, startLoading } = useLoginStore();
  const scale = useLoginStore((state) => state.scale ?? 1);
  const isVert = useLoginStore((state) => state.isVert ?? true);

  useEffect(() => {
    if (phaserScene?.sys?.isActive()) phaserScene.triggerResize();
  }, [phaserScene]);

  const handleSceneSwitch = (action: "login" | "register") => {
    if (phaserScene.sys?.isActive()) phaserScene.events.emit("switch_scene", action);
  };

  const handleLoginClick = () => {
    useRegistrationStep2Store.getState().setIsLogin(true);
    useRegistrationStep3Store.getState().setIsLogin(true);
    startLoading(() => handleSceneSwitch("login"));
  };

  const handleRegisterClick = () => {
    useRegistrationStep2Store.getState().setIsLogin(false);
    useRegistrationStep3Store.getState().setIsLogin(false);
    handleSceneSwitch("register");
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex h-full w-full items-end justify-center">
      <div
        className="pointer-events-none z-10 box-border flex w-[460px] origin-bottom flex-col items-center gap-4 opacity-100 transition-opacity [backface-visibility:hidden]"
        style={{ transform: `scale(${scale})`, paddingBottom: isVert ? "50px" : "85px" }}
      >
        {status === "button" ? (
          <div className="pointer-events-auto flex w-full flex-col items-center justify-center gap-4">
            <LoginButton onClick={handleLoginClick} />
            <RegisterLink onClick={handleRegisterClick} />
          </div>
        ) : (
          <LoginLoader />
        )}
      </div>
    </div>
  );
}
