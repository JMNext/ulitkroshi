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

export const startWashingDrag = (e: any, washKey: string, onEnd?: () => void, scale = 1, s = 1) => {
  createBaseDrag(e, {
    url: washKey, action: "wash",
    onSuccess: () => {
      if (Date.now() < usePetStore.getState().buffUntil) return;

      usePetStore.getState().triggerCareAction("wash");
      const pet = document.getElementById("phaser-native-html-pet");
      const petRect = pet?.getBoundingClientRect();
      const ps = petRect ? petRect.width / 644 : 1;
      const size = 80 * ps;

      const sponge = document.createElement("img");
      sponge.src = washKey;
      sponge.style.cssText = `position:fixed;z-index:99999;pointer-events-none;width:${size}px;height:${size}px;object-fit:contain;left:${e.clientX}px;top:${e.clientY}px;animation:spongeAbsorb 0.4s ease-in forwards;`;
      document.body.appendChild(sponge);

      setTimeout(() => {
        sponge.remove();
        new Audio(WASH_SOUND_URL).play().catch(() => {});

        const container = document.createElement("div");
        container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99998;transition:opacity 0.3s;";
        document.body.appendChild(container);

        let count = 0;
        const interval = setInterval(() => {
          if (++count > 128) {
            clearInterval(interval); container.style.opacity = "0";
            return setTimeout(() => container.remove(), 300);
          }
          const rect = pet?.getBoundingClientRect();
          const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
          const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
          const b = document.createElement("div");
          const bSize = (25 + Math.random() * 31) * ps;

          b.style.cssText = `position:absolute;width:${bSize}px;height:${bSize}px;border-radius:50%;background-color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.4);box-shadow:inset -3px -3px 8px rgba(0,0,0,0.05), inset 3px 3px 8px rgba(255,255,255,0.6);left:${cx + (Math.random() * 386.4 - 193.2) * ps}px;top:${cy + (Math.random() * 221 - 55) * ps}px;animation:bubbleLife 1s ease-in-out forwards;`;
          container.appendChild(b);
          b.addEventListener("animationend", () => b.remove());
        }, 25);
      }, 400);
    },
    onEnd
  }, scale, s);
};
