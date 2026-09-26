import { createBaseDrag } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { WASH_SOUND_URL } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

if (typeof document !== "undefined" && !document.getElementById("react-wash-keyframes")) {
  const style = document.createElement("style");
  style.id = "react-wash-keyframes";
  style.innerHTML = `
    @keyframes spongeAbsorb {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
    }
    @keyframes bubbleLife {
      0% { transform: translate3d(-50%, -50%, 0) scale(0); opacity: 0; }
      12% { transform: translate3d(-50%, -50%, 0) scale(1.2); opacity: 0.95; }
      82% { transform: translate3d(-50%, -50%, 0) scale(1); opacity: 0.9; }
      100% { transform: translate3d(-50%, -50%, 0) scale(0.4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

let activeInterval: ReturnType<typeof setInterval> | null = null;
let activeTimeout: ReturnType<typeof setTimeout> | null = null;
let activeContainer: HTMLDivElement | null = null;

export const clearWashingEffects = () => {
  if (activeInterval) { clearInterval(activeInterval); activeInterval = null; }
  if (activeTimeout) { clearTimeout(activeTimeout); activeTimeout = null; }
  if (activeContainer) { activeContainer.remove(); activeContainer = null; }
};

export const startWashingDrag = (e: any, washKey: string, onEnd?: () => void, scale = 1, s = 1) => {
  const clickX = e.clientX;
  const clickY = e.clientY;

  createBaseDrag(e, {
    url: washKey,
    action: "wash",
    onSuccess: () => {
      if (Date.now() < usePetStore.getState().buffUntil) return;

      clearWashingEffects();

      const pet = document.getElementById("phaser-native-html-pet");
      const petRect = pet?.getBoundingClientRect();
      const ps = petRect ? petRect.width / 644 : 1;
      const size = 80 * ps;

      const sponge = document.createElement("img");
      sponge.src = washKey;
      sponge.style.cssText = `
        position: fixed;
        z-index: 99999;
        pointer-events: none;
        width: ${size}px;
        height: ${size}px;
        object-fit: contain;
        left: ${clickX}px;
        top: ${clickY}px;
        animation: spongeAbsorb 0.4s ease-in forwards;
        will-change: transform, opacity;
      `;
      document.body.appendChild(sponge);

      activeTimeout = setTimeout(() => {
        sponge.remove();
        new Audio(WASH_SOUND_URL).play().catch(() => {});

        const cx = petRect ? petRect.left + petRect.width / 2 : window.innerWidth / 2;
        const cy = petRect ? petRect.top + petRect.height / 2 : window.innerHeight / 2;

        const container = document.createElement("div");
        container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99998;transition:opacity 0.4s;";
        document.body.appendChild(container);
        activeContainer = container;

        let count = 0;
        const maxBubbles = 75;

        activeInterval = setInterval(() => {
          if (++count > maxBubbles) {
            if (activeInterval) clearInterval(activeInterval);
            container.style.opacity = "0";
            activeTimeout = setTimeout(() => {
              container.remove();
              if (activeContainer === container) activeContainer = null;
            }, 400);
            return;
          }

          const b = document.createElement("div");
          const bSize = (25 + Math.random() * 31) * ps;
          const bubbleLeft = cx + (Math.random() * 386.4 - 193.2) * ps;
          const bubbleTop = cy + (Math.random() * 221 - 55) * ps;

          b.style.cssText = `
            position: absolute;
            width: ${bSize}px;
            height: ${bSize}px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            left: ${bubbleLeft}px;
            top: ${bubbleTop}px;
            animation: bubbleLife 1.4s ease-in-out forwards;
            will-change: transform, opacity;
          `;

          container.appendChild(b);
          b.addEventListener("animationend", () => b.remove(), { once: true });
        }, 40);
      }, 400);
    },
    onEnd
  }, scale, s);
};
