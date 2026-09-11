import { GameHeaderUI } from "@/game/MiniGamesUI/GameHeader/GameHeaderUI";
import { GameOverModalUI } from "@/game/MiniGamesUI/GameOverModal/GameOverModalUI";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryGameScene } from "../MemoryGameScene";
import { useMemoryGameStore } from "../store/useMemoryGameStore";

export class MemoryGameOverlay {
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;

  constructor(private scene: MemoryGameScene) {}

  public create = (): void => {
    const gameContainer = document.getElementById("game-container") || document.body;
    const existing = document.getElementById("phaser-catch-root");
    if (existing) {
      this.container = existing as HTMLDivElement;
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
      const isGameOver = useMemoryGameStore((s) => s.isGameOver);

      const { width, height } = this.scene.scale;
      const currentScale = height > width ? height / 1080 : Math.min(width / 1920, height / 1080);

      return React.createElement(
        "div",
        {
          className: "absolute inset-0 w-full h-full pointer-events-none"
        },
        React.createElement(
          "div",
          {
            className: "pointer-events-auto absolute inset-x-0 top-0 z-50"
          },
          React.createElement(GameHeaderUI, {
            currentScale,
            onBack: () => this.scene.exitGameSession()
          })
        ),

        isGameOver &&
          React.createElement(
            "div",
            {
              className: "pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/40"
            },
            React.createElement(GameOverModalUI, {
              score: 0,
              isWin: true,
              difficulty: this.scene.difficulty,
              onRestart: () => this.scene.restartGame(),
              onBack: () => this.scene.exitGameSession()
            })
          )
      );
    };

    this.root.render(React.createElement(ReactiveOverlay));
  };

  public destroy = (): void => {
    if (this.root) {
      try {
        this.root.unmount();
      } catch (e) {
        console.warn(e);
      }
      this.root = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  };
}
