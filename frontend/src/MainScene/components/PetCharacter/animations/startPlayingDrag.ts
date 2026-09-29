import { createBaseDrag } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { PLAY_SOUND_URL } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";

let audio: HTMLAudioElement | null = null;

export const startPlayingDrag = (e: any, ballKey: string, onEnd?: () => void, scale = 1, s = 1) => {
  if (typeof window !== "undefined" && !audio) audio = new Audio(PLAY_SOUND_URL);

  const isPort = window.innerHeight > window.innerWidth;
  const fX = isPort ? 1520 : 1130, fY = isPort ? 550 : 540;

  createBaseDrag(e, {
    url: ballKey, action: "play",
    onSuccess: () => {
      const pet = document.getElementById("phaser-native-html-pet");
      const canvas = document.querySelector("#game-container canvas");
      const cRect = canvas?.getBoundingClientRect() || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      const petRect = pet?.getBoundingClientRect();
      const bSize = (isPort ? 95 : 120) * (petRect ? petRect.width / 644 : 1);

      const ball = document.createElement("img");
      ball.src = ballKey;
      ball.style.cssText = `position:fixed;top:0;left:0;z-index:999999;pointer-events:none;object-fit:contain;width:${bSize}px;height:${bSize}px;will-change:transform;`;
      document.body.appendChild(ball);

      const startX = ((e.clientX - cRect.left) / cRect.width) * 1920;
      const startY = ((e.clientY - cRect.top) / cRect.height) * 1080;
      const dummy = { x: startX, y: startY, scale: 1, angle: 0 };
      const { left: cLeft, top: cTop, width: cW, height: cH } = cRect;

      const sync = () => {
        ball.style.transform = `translate3d(${cLeft + (dummy.x / 1920) * cW}px, ${cTop + (dummy.y / 1080) * cH}px, 0) translate(-50%, -50%) scale(${dummy.scale}) rotate(${dummy.angle}deg)`;
      };
      sync();

      let start: number | null = null, played = false;

      const animate = (t: number) => {
        if (!start) start = t;
        const dt = t - start;

        if (dt <= 1500) {
          const p = dt / 1500, ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          dummy.x = startX + (fX - startX) * ease;
          dummy.y = startY + (fY - startY) * ease;
          dummy.scale = 1 + 0.5 * ease;
          sync();
        } else if (dt <= 1770) {
          if (!played && audio) { played = true; audio.currentTime = 0; audio.play().catch(() => {}); }
        } else if (dt <= 2970) {
          const p = (dt - 1770) / 1200;
          dummy.x = fX + (-200 - fX) * p;
          dummy.y = fY + 100 * p - Math.sin(p * Math.PI) * 220;
          dummy.scale = 1.5 - 0.7 * p;
          dummy.angle = -540 * p;
          sync();
        } else return ball.remove();

        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    },
    onEnd
  }, scale, s);
};
