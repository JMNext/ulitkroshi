import { LoginScene } from "@/LoginScene/LoginScene";
import { MainScene } from "@/MainScene/MainScene";
import { Step1Scene } from "@/Registration/Step_1/Step1Scene";
import { Step2Scene } from "@/Registration/Step_2/Step2Scene";
import { Step3Scene } from "@/Registration/Step_3/Step3Scene";
import { Step4Scene } from "@/Registration/Step_4/Step4Scene";
import { ScannerScene } from "@/ScannerScene/ScannerScene";
import NiceModal from "@ebay/nice-modal-react";
import Phaser from "phaser";
import { createRoot } from "react-dom/client";
import "./global.css";
import { PreloaderScene } from "./PreloaderScene";

declare global { interface Window { phaserGame: Phaser.Game | null; } }

if (window.phaserGame) { window.phaserGame.destroy(true); window.phaserGame = null; }

window.phaserGame = new Phaser.Game({
  type: Phaser.AUTO, parent: "game-container", transparent: true, preserveDrawingBuffer: true,
  physics: { default: "arcade", arcade: { debug: false } },
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, roundPixels: true, pixelArt: false },
  scene: [
    PreloaderScene,
    LoginScene,
    Step1Scene,
    Step2Scene,
    Step3Scene,
    Step4Scene,
    MainScene,
    ScannerScene,
  ]
});

const root = document.createElement("div");
root.id = "nice-modal-global-root";
document.body.appendChild(root);
createRoot(root).render(<NiceModal.Provider />);
