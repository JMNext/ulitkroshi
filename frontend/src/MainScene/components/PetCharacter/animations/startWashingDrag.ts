import { createBaseDrag } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { WASH_SOUND_URL } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

if (typeof document !== "undefined" && !document.getElementById("react-wash-keyframes")) {
  const style = document.createElement("style");
  style.id = "react-wash-keyframes";
  style.innerHTML = `
    @keyframes spongeAbsorb { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; } }
    @keyframes bubbleLife { 0% { transform: translate(-50%, -50%) scale(0); opacity: 0; } 15% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.95; } 80% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; } 100% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; } }
  `;
  document.head.appendChild(style);
}

export const startWashingDrag = (
  initialEvent: React.PointerEvent<HTMLDivElement> | PointerEvent,
  washKey: string,
  onDragEndCallback?: () => void,
  scale: number = 1,
  s: number = 1
) => {
  createBaseDrag(
    initialEvent,
    {
      url: washKey,
      action: "wash",
      onSuccess: () => {
        const store = usePetStore.getState();
        store.triggerCareAction("wash");

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
          new Audio(WASH_SOUND_URL).play().catch(() => {});

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
          const totalBubbles = 128;

          const interval = setInterval(() => {
            bubbleCount++;
            if (bubbleCount > totalBubbles) {
              clearInterval(interval);
              container.style.opacity = "0";
              setTimeout(() => container.remove(), 300);
              return;
            }

            const rect = pet?.getBoundingClientRect();
            const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
            const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

            const b = document.createElement("div");
            const size = (Math.floor(Math.random() * 31) + 25) * currentScale;

            Object.assign(b.style, {
              position: "absolute",
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "inset -3px -3px 8px rgba(0,0,0,0.05), inset 3px 3px 8px rgba(255,255,255,0.6)",
              left: `${cx + (Math.random() * 386.4 - 193.2) * currentScale}px`,
              top: `${cy + (Math.random() * 221 - 55) * currentScale}px`,
              animation: "bubbleLife 1s ease-in-out forwards"
            });

            container.appendChild(b);
            b.addEventListener("animationend", () => b.remove());
          }, 25);
        }, 400);
      },
      document: undefined,
      onEnd: onDragEndCallback
    } as any,
    scale,
    s
  );
};
