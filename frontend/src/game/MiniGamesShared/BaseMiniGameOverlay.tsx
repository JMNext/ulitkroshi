import { createRoot, Root } from "react-dom/client";
import React from "react";
import { GameHeaderLeft } from "@/game/MiniGamesUI/GameHeader/GameHeaderLeft";
import { GameHeaderRight } from "@/game/MiniGamesUI/GameHeader/GameHeaderRight";
import { GameOverModalUI } from "@/game/MiniGamesUI/GameOverModal/GameOverModalUI";
import { useCatchGameStore } from "@/game/MiniGames/CatchGame/store/useCatchGameStore";
import { useMemoryGameStore } from "@/game/MiniGames/MemoryGame/store/useMemoryGameStore";
import { useSnakeGameStore } from "@/game/MiniGames/SnakeGame/store/useSnakeGameStore";
import { useRacingGameStore } from "@/game/MiniGames/RacingGame/store/useRacingGameStore";

type GameKey = "catch" | "memory" | "snake" | "racing";

interface OverlayState {
  score: number;
  hp: number;
  isGameOver: boolean;
  isWin: boolean;
}

const useGameOverlayStore = (gameKey: GameKey): OverlayState => {
  const catchStore = useCatchGameStore();
  const memoryStore = useMemoryGameStore();
  const snakeStore = useSnakeGameStore();
  const racingStore = useRacingGameStore();

  switch (gameKey) {
    case "catch":
      return { score: catchStore.score, hp: catchStore.hp ?? 100, isGameOver: catchStore.isGameOver, isWin: !!catchStore.isWin };
    case "memory":
      return { score: memoryStore.score, hp: 100, isGameOver: memoryStore.isGameOver, isWin: memoryStore.isGameOver };
    case "snake":
      return { score: snakeStore.score, hp: snakeStore.hp ?? 100, isGameOver: snakeStore.isGameOver, isWin: !!snakeStore.isWin };
    case "racing":
      return { score: racingStore.score, hp: racingStore.hp ?? 100, isGameOver: racingStore.isGameOver, isWin: !!racingStore.isWin };
    default:
      return { score: 0, hp: 100, isGameOver: false, isWin: false };
  }
};

interface ReactiveOverlayProps {
  gameKey: GameKey;
  scene: any;
}

const ReactiveOverlay: React.FC<ReactiveOverlayProps> = ({ gameKey, scene }) => {
  const { score, hp, isGameOver, isWin } = useGameOverlayStore(gameKey);
  const w = scene.scale?.width || window.innerWidth;
  const h = scene.scale?.height || window.innerHeight;
  const scale = h > w ? h / 1080 : Math.min(w / 1920, h / 1080);

  const handleBack = () => {
    if (scene.exitGame) scene.exitGame();
    else if (scene.exitGameSession) scene.exitGameSession();
  };

  const handleRestart = () => {
    scene.scene?.restart({ difficulty: scene.difficulty });
  };

  return React.createElement("div", { className: "absolute inset-0 w-full h-full pointer-events-none" },
    // Для игры Memory передаем hp как undefined, чтобы компонент GameHeaderLeft отрендерил ТОЛЬКО кнопку НАЗАД
    React.createElement(GameHeaderLeft, {
      hp: gameKey === "memory" ? undefined : hp,
      currentScale: scale,
      onBack: handleBack
    }),

    // Верхний правый счет показываем только для остальных игр
    gameKey !== "memory" && React.createElement(GameHeaderRight, { score, currentScale: scale }),

    isGameOver && React.createElement("div", { className: "pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/40" },
      React.createElement(GameOverModalUI, {
        score,
        isWin,
        gameType: gameKey as any,
        // Передаем принудительно difficulty="memory", чтобы внутреннее условие в GameOverModalUI скрыло строчку со счетом
        difficulty: gameKey === "memory" ? "memory" : scene.difficulty,
        onRestart: handleRestart,
        onBack: handleBack
      })
    )
  );
};

export class BaseMiniGameOverlay {
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;

  constructor(private scene: any, private gameKey: GameKey) {}

  public create(): void {
    const id = `phaser-${this.gameKey}-root`;
    const el = document.getElementById(id);
    if (el) { this.container = el as HTMLDivElement; return; }

    this.container = document.createElement("div");
    this.container.id = id;
    this.container.className = "absolute inset-0 w-full h-full z-50 overflow-hidden bg-transparent pointer-events-none";
    (document.getElementById("game-container") || document.body).appendChild(this.container);
  }

  public render = (): void => {
    if (!this.container) return;
    if (!this.root) this.root = createRoot(this.container);
    this.root.render(React.createElement(ReactiveOverlay, { gameKey: this.gameKey, scene: this.scene }));
  };

  public destroy(): void {
    try { this.root?.unmount(); } catch {}
    this.container?.remove();
    this.root = null;
    this.container = null;
  }
}
