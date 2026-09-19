import { createBaseDrag } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { WASH_SOUND_URL } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

let cachedWashAudio: HTMLAudioElement | null = null;

export const startWashingDrag = (
  initialEvent: React.PointerEvent<HTMLDivElement> | PointerEvent,
  washKey: string,
  onDragEndCallback?: () => void,
  scale: number = 1,
  s: number = 1
) => {
  if (typeof window !== "undefined" && !cachedWashAudio) {
    cachedWashAudio = new Audio(WASH_SOUND_URL);
  }

  createBaseDrag(
    initialEvent,
    {
      url: washKey,
      action: "wash",
      onSuccess: () => {
        const pet = document.getElementById("phaser-native-html-pet");
        const petRect = pet?.getBoundingClientRect();
        const currentScale = petRect ? petRect.width / 644 : 1;

        const sponge = document.createElement("img");
        sponge.src = washKey;
        Object.assign(sponge.style, {
          position: "fixed",
          zIndex: "99999",
          pointerEvents: "none",
          width: `${80 * currentScale}px`,
          height: `${80 * currentScale}px`,
          objectFit: "contain",
          left: `${initialEvent.clientX}px`,
          top: `${initialEvent.clientY}px`,
          animation: "spongeAbsorb 0.4s ease-in forwards"
        });
        document.body.appendChild(sponge);

        setTimeout(() => {
          sponge.remove();
          if (cachedWashAudio) {
            cachedWashAudio.currentTime = 0;
            cachedWashAudio.play().catch(() => {});
          }

          const container = document.createElement("div");
          Object.assign(container.style, {
            position: "fixed",
            inset: "0",
            pointerEvents: "none",
            zIndex: "99998",
            transition: "opacity 0.3s"
          });
          document.body.appendChild(container);

          let bubbleCount = 0;
          const totalBubbles = 40;
          const staticRect = pet?.getBoundingClientRect();
          const cx = staticRect ? staticRect.left + staticRect.width / 2 : window.innerWidth / 2;
          const cy = staticRect ? staticRect.top + staticRect.height / 2 : window.innerHeight / 2;

          const interval = setInterval(() => {
            bubbleCount++;
            if (bubbleCount > totalBubbles) {
              clearInterval(interval);
              container.style.opacity = "0";
              setTimeout(() => container.remove(), 300);
              return;
            }

            const b = document.createElement("div");
            const size = (Math.floor(Math.random() * 21) + 15) * currentScale;

            Object.assign(b.style, {
              position: "absolute",
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              left: `${cx + (Math.random() * 300 - 150) * currentScale}px`,
              top: `${cy + (Math.random() * 160 - 40) * currentScale}px`,
              animation: "bubbleLife 0.8s ease-in-out forwards"
            });

            container.appendChild(b);

            const cleanupBubble = () => {
              b.removeEventListener("animationend", cleanupBubble);
              b.remove();
            };
            b.addEventListener("animationend", cleanupBubble);
          }, 60);
        }, 400);
      },
      onEnd: onDragEndCallback
    },
    scale,
    s
  );
};
