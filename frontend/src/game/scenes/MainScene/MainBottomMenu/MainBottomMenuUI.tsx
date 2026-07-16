import React, { useEffect, useRef, useCallback } from "react";
import { Scene } from "phaser";
import "./BottomMenuUI.css";

import menuBgDesktop from "../../../../assets/background/bottom-menu-desktop.svg";
import buttonBgUrl from "../../../../assets/buttom_menu-icons/button.svg";
import eatIcon from "../../../../assets/buttom_menu-icons/eat.svg";
import playIcon from "../../../../assets/buttom_menu-icons/play.svg";
import sleepIcon from "../../../../assets/buttom_menu-icons/sleep.svg";
import washIcon from "../../../../assets/buttom_menu-icons/wash.svg";
import { startFeedingDrag } from "../PetCharacter/animations/feedPet";
import { startPlayingDrag } from "../PetCharacter/animations/playBall";
import { startWashingDrag } from "../PetCharacter/animations/washPet";
import { triggerSleepingClick } from "../PetCharacter/animations/sleepPet";
import { usePetCareStore } from "../usePetCareStore";

export type BottomMenuGameScene = Scene & { currentPetState?: string };

export interface MenuItem {
  text: string;
  icon: string;
  action: (e: TouchEvent | MouseEvent) => void;
  animKeys: string[];
  stateKey: string;
}

export const MainBottomMenuUI = ({ scene }: { scene: BottomMenuGameScene }) => {
  const bRef = useRef<Map<string, HTMLElement>>(new Map());
  const canExecuteAction = usePetCareStore((state) => state.canExecuteAction);
  const currentAnim = usePetCareStore((state) => state.currentAnim);

  const items: MenuItem[] = [
    { text: "Кормить", icon: eatIcon, action: (e) => canExecuteAction("Кормить") && startFeedingDrag(scene, e), animKeys: ["eat", "feeding"], stateKey: "eat" },
    { text: "Мыть", icon: washIcon, action: (e) => canExecuteAction("Мыть") && startWashingDrag(scene, e), animKeys: ["wash", "washing"], stateKey: "wash" },
    { text: "Играть", icon: playIcon, action: (e) => canExecuteAction("Играть") && startPlayingDrag(scene, e), animKeys: ["play", "playing"], stateKey: "play" },
    { text: "Спать", icon: sleepIcon, action: () => triggerSleepingClick(scene), animKeys: ["sleep_begin", "sleep_circle"], stateKey: "sleep" },
  ];

  useEffect(() => {
    const listeners: { el: HTMLElement; ts: (e: TouchEvent) => void }[] = [];

    items.forEach((item) => {
      const el = bRef.current.get(item.text);
      if (!el) return;
      const ts = (e: TouchEvent) => {
        e.preventDefault();
        item.action(e);
      };
      el.addEventListener("touchstart", ts, { passive: false });
      listeners.push({ el, ts });
    });

    return () => listeners.forEach(({ el, ts }) => el.removeEventListener("touchstart", ts));
  }, [items]);

  const handleMouseDown = useCallback((item: MenuItem) => (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    item.action(e.nativeEvent);
  }, []);

  return (
    <main className="bottom-menu-wrapper">
      <img src={menuBgDesktop} className="bottom-menu-bg" alt="menu-bg" />
      <nav className="bottom-menu-items-flex">
        {items.map((item) => {
          const isActive = item.animKeys.includes(currentAnim);

          return (
            <div
              key={item.text}
              ref={(node) => {
                if (node) bRef.current.set(item.text, node);
                else bRef.current.delete(item.text);
              }}
              onMouseDown={handleMouseDown(item)}
              className={`bottom-menu-item-btn ${isActive ? `bottom-menu-item-active active-${item.stateKey}` : ""}`}
            >
              <div className="bottom-menu-icon-container">
                <img src={buttonBgUrl} className="bottom-menu-icon-bg" alt="btn-bg" />
                <img src={item.icon} className="bottom-menu-icon-img" alt={item.text} />
              </div>
              <span className="bottom-menu-item-text">{item.text}</span>
            </div>
          );
        })}
      </nav>
    </main>
  );
};
