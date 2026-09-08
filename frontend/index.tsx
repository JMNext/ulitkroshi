import "./global.css";
import Phaser from "phaser";
import bgMusicUrl from "@/assets/resources/sound/main_theme.mp3";
import { LoginScene } from '@/LoginScene/LoginScene';
import { Step1Scene } from '@/Registration/Step_1/Step1Scene';
import { Step2Scene } from '@/Registration/Step_2/Step2Scene';
import { Step3Scene } from '@/Registration/Step_3/Step3Scene';
import { Step4Scene } from '@/Registration/Step_4/Step4Scene';
import { MainScene } from '@/MainScene/MainScene';
import { CatchGameScene } from '@/game/MiniGames/CatchGame/CatchGameScene';
import { MemoryGameScene } from '@/game/MiniGames/MemoryGame/MemoryGameScene';
import { SnakeGameScene } from '@/game/MiniGames/SnakeGame/SnakeGameScene';

declare global {
  interface Window {
    phaserGame: Phaser.Game | null;
    currentAddPetScanner?: any;
    currentTranslateTimer?: number;
  }
}

const GAME_CONTAINER_ID = "game-container";
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
  AUDIO_EVENTS.forEach(event => window.removeEventListener(event, handleInteraction));
};

AUDIO_EVENTS.forEach(event => window.addEventListener(event, handleInteraction, { passive: true }));

window.phaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: GAME_CONTAINER_ID,
  transparent: true,
  preserveDrawingBuffer: true,
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    antialias: true,
    roundPixels: true,
    pixelArt: false
  },
  scene: [
    LoginScene,
    Step1Scene,
    Step2Scene,
    Step3Scene,
    Step4Scene,
    MainScene,
    CatchGameScene,
    MemoryGameScene,
    SnakeGameScene
  ]
});
