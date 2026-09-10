import React from 'react';
import { useLoginStore } from './store/useLoginStore';
import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { LoginButton } from "./components/LoginButton";
import { RegisterLink } from "./components/RegisterLink";
import { LoginLoader } from "./components/LoginLoader";
import { LoginScene } from './LoginScene';

interface LoginUiProps {
  phaserScene: LoginScene;
}

export function LoginUiManager({ phaserScene }: LoginUiProps) {
  const { status, startLoading } = useLoginStore();
  
  const scale = useLoginStore((state) => state.scale ?? 1);
  const isVert = useLoginStore((state) => state.isVert ?? true);
  const paddingBottom = isVert ? "50px" : "85px";

  const handleSceneSwitch = (action: 'login' | 'register') => {
    if (phaserScene.sys?.isActive()) {
      phaserScene.events.emit('switch_scene', action);
    }
  };

  const handleLoginClick = () => {
    // ВХОД: активируем флаги входа
    useRegistrationStep2Store.getState().setIsLogin(true);
    useRegistrationStep3Store.getState().setIsLogin(true);
    startLoading(() => handleSceneSwitch('login'));
  };

  const handleRegisterClick = () => {
    // РЕГИСТРАЦИЯ: жестко гасим флаги входа, включаем чистую регистрацию
    useRegistrationStep2Store.getState().setIsLogin(false);
    useRegistrationStep3Store.getState().setIsLogin(false);
    handleSceneSwitch('register');
  };

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full flex items-end justify-center">
      <div 
        className="pointer-events-none z-10 flex flex-col items-center gap-4 box-border origin-bottom w-[460px] transition-transform duration-150" 
        style={{ transform: `scale(${scale})`, paddingBottom }}
      >
        {status === 'button' ? (
          <div className="flex flex-col items-center gap-4 pointer-events-auto w-full justify-center">
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
