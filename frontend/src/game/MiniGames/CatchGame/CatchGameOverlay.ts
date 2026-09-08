import { createRoot, Root } from "react-dom/client";
import React from "react";
import { useCatchGameStore } from "./store/useCatchGameStore";
import { GameHeaderUI } from "@/game/MiniGamesUI/GameHeader/GameHeaderUI";
import { GameOverModalUI } from "@/game/MiniGamesUI/GameOverModal/GameOverModalUI";
import { CatchGameScene } from "./CatchGameScene";

export class CatchGameOverlay {
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;

  constructor(private scene: CatchGameScene) {}

  public create = (): void => {
    const gameContainer = document.getElementById("game-container") || document.body;
    const existingElement = document.getElementById("phaser-catch-root");
    if (existingElement) {
      this.container = existingElement as HTMLDivElement;
      return;
    }
    this.container = document.createElement("div");
    this.container.id = "phaser-catch-root";
    this.container.className = "absolute inset-0 w-full h-full z-50 overflow-hidden bg-transparent pointer-events-none";
    gameContainer.appendChild(this.container);
  };

  public render = (): void => {
    if (!this.container) return;
    if (!this.root) this.root = createRoot(this.container);

    const ReactiveOverlay = () => {
      const score = useCatchGameStore((s) => s.score);
      const hp = useCatchGameStore((s) => s.hp);
      const isGameOver = useCatchGameStore((s) => s.isGameOver);
      const isWin = useCatchGameStore((s) => s.isWin);

      const { width, height } = this.scene.scale;
      const currentScale = height > width ? height / 1080 : Math.min(width / 1920, height / 1080);

      return React.createElement(
        "div",
        { className: "absolute inset-0 w-full h-full pointer-events-none" },
        React.createElement(GameHeaderUI, {
          score,
          hp,
          currentScale,
          onBack: () => this.scene.exitGame()
        }),

        isGameOver &&
          React.createElement(
            "div",
            { className: "pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/40" },
            React.createElement(GameOverModalUI, {
              score,
              isWin,
              onRestart: () => this.scene.scene.restart({ difficulty: this.scene.difficulty }),
              onBack: () => this.scene.exitGame()
            })
          )
      );
    };

    this.root.render(React.createElement(ReactiveOverlay));
  };

  public destroy = (): void => {
    if (this.root) {
      try { this.root.unmount(); } catch (e) { console.warn(e); }
      this.root = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  };
}
