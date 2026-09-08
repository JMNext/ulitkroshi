import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { createBaseDrag } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { PLAY_SOUND_URL } from "@/MainScene/components/PetCharacter/petCharacter.constants";

export const startPlayingDrag = (
  initialEvent: React.PointerEvent<HTMLDivElement> | PointerEvent,
  ballKey: string,
  onDragEndCallback?: () => void,
  scale = 1,
  s = 1
) => {
  const isPort = window.innerHeight > window.innerWidth;
  
  const bounds = isPort 
    ? { right: 1520, left: 0, up: 530, down: 0 }
    : { right: 1130, left: 0, up: 540, down: 0 };

  const finalX = bounds.right - bounds.left;
  const finalY = 1080 - bounds.up + bounds.down;

  const bounceAudio = new Audio(PLAY_SOUND_URL);
  bounceAudio.volume = 1.0;
  bounceAudio.preload = "auto";

  createBaseDrag(initialEvent, {
    url: ballKey,
    action: "play",
    onSuccess: () => {
      const pet = document.getElementById("phaser-native-html-pet");
      const canvas = document.querySelector("#game-container canvas");
      const cRect = canvas?.getBoundingClientRect() || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

      const baseSize = (isPort ? 95 : 120) * (pet ? pet.getBoundingClientRect().width / 644 : 1);

      const ballImg = document.createElement("img");
      ballImg.src = ballKey;
      Object.assign(ballImg.style, {
        position: "fixed",
        top: "0",
        left: "0",
        zIndex: "999999",
        pointerEvents: "none",
        objectFit: "contain",
        width: `${baseSize}px`,
        height: `${baseSize}px`,
        willChange: "transform"
      });
      document.body.appendChild(ballImg);

      const startWorldX = ((initialEvent.clientX - cRect.left) / cRect.width) * 1920;
      const startWorldY = ((initialEvent.clientY - cRect.top) / cRect.height) * 1080;
      
      const dummy = { x: startWorldX, y: startWorldY, scale: 1, angle: 0 };

      const sync = () => {
        const posX = cRect.left + (dummy.x / 1920) * cRect.width;
        const posY = cRect.top + (dummy.y / 1080) * cRect.height;
        ballImg.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%) scale(${dummy.scale}) rotate(${dummy.angle}deg)`;
      };

      sync();
      
      let startTime: number | null = null;
      let hasPlayedSound = false;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        if (elapsed <= 1500) {
          const progress = elapsed / 1500;
          const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          dummy.x = startWorldX + (finalX - startWorldX) * eased;
          dummy.y = startWorldY + (finalY - startWorldY) * eased;
          dummy.scale = 1 + 0.5 * eased;
          sync();
        } else if (elapsed <= 1770) {
          if (!hasPlayedSound) {
            hasPlayedSound = true;
            bounceAudio.play().catch((err) => console.log("Аудио заблокировано:", err));
          }
        } else if (elapsed <= 2970) {
          const p = (elapsed - 1770) / 1200;
          dummy.x = finalX + (-200 - finalX) * p;
          dummy.y = finalY + 100 * p - Math.sin(p * Math.PI) * 220;
          dummy.scale = 1.5 - 0.7 * p;
          dummy.angle = -540 * p;
          sync();
        } else {
          ballImg.remove();
          return;
        }
        
        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
      usePetStore.getState().triggerCareAction("play");
    },
    onEnd: onDragEndCallback
  }, scale, s);
};
