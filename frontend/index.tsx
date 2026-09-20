import bgMusicUrl from "@/assets/resources/sound/main_theme.mp3";
import { CatchGameScene } from "@/game/MiniGames/CatchGame/CatchGameScene";
import { MemoryGameScene } from "@/game/MiniGames/MemoryGame/MemoryGameScene";
import { SnakeGameScene } from "@/game/MiniGames/SnakeGame/SnakeGameScene";
import { LoginScene } from "@/LoginScene/LoginScene";
import { MainScene } from "@/MainScene/MainScene";
import { Step1Scene } from "@/Registration/Step_1/Step1Scene";
import { Step2Scene } from "@/Registration/Step_2/Step2Scene";
import { Step3Scene } from "@/Registration/Step_3/Step3Scene";
import { Step4Scene } from "@/Registration/Step_4/Step4Scene";
import { ScannerScene } from "@/ScannerScene/ScannerScene";
import Phaser from "phaser";
import "./global.css";
import { RacingGameScene } from "@/game/MiniGames/RacingGame/RacingGameScene";
import { PlanesGameScene } from "@/game/MiniGames/PlanesGame/PlanesGameScene";

declare global {
  interface Window {
    phaserGame: Phaser.Game | null;
  }
}

const AUDIO_EVENTS = ["click", "keydown", "touchstart"] as const;

if (window.phaserGame) {
  window.phaserGame.destroy(true);
  window.phaserGame = null;
}

const audio = new Audio(bgMusicUrl);
audio.loop = true;
audio.volume = 0.4;

const handleInteraction = () => {
  audio.play().catch(() => {});
  AUDIO_EVENTS.forEach((ev) => window.removeEventListener(ev, handleInteraction));
};
AUDIO_EVENTS.forEach((ev) => window.addEventListener(ev, handleInteraction, { passive: true }));

window.phaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  transparent: true,
  preserveDrawingBuffer: true,
  physics: { default: "arcade", arcade: { debug: false } },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: { antialias: true, roundPixels: true, pixelArt: false },
  scene: [
    LoginScene,
    Step1Scene,
    Step2Scene,
    Step3Scene,
    Step4Scene,
    MainScene,
    ScannerScene,
    CatchGameScene,
    MemoryGameScene,
    SnakeGameScene,
    RacingGameScene,
    PlanesGameScene
  ]
});
