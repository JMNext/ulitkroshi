import { toPng } from "html-to-image";
import Phaser from "phaser";

interface CustomWindow extends Window {
  phaserGame: Phaser.Game | null;
}

export const takeScreenshot = async () => {
  const canvasElement = document.querySelector("canvas");
  const gameContainer = canvasElement?.parentElement;
  const uiRoot = gameContainer?.querySelector(".phaser-ui-root-container") as HTMLDivElement;
  const customWindow = window as unknown as CustomWindow;

  if (!gameContainer || !canvasElement || !uiRoot || !customWindow.phaserGame) return;

  try {
    const width = gameContainer.clientWidth;
    const height = gameContainer.clientHeight;
    const pRatio = window.devicePixelRatio || 2;

    customWindow.phaserGame.renderer.snapshot((snapshotImage: unknown) => {
      if (!snapshotImage || !(snapshotImage instanceof HTMLImageElement)) return;

      uiRoot.style.pointerEvents = "auto";

      toPng(uiRoot, {
        cacheBust: true,
        pixelRatio: pRatio,
        skipFonts: true,
        width: width,
        height: height,
        filter: (node: Node) => !(node instanceof HTMLElement && node.innerText === "✕")
      })
        .then(async (uiDataUrl) => {
          uiRoot.style.pointerEvents = "none";

          const finalCanvas = document.createElement("canvas");
          finalCanvas.width = width * pRatio;
          finalCanvas.height = height * pRatio;
          const ctx = finalCanvas.getContext("2d");
          if (!ctx) return;

          const imgUI = new Image();

          await new Promise((resolve) => {
            imgUI.onload = resolve;
            imgUI.src = uiDataUrl;
          });

          ctx.drawImage(snapshotImage, 0, 0, finalCanvas.width, finalCanvas.height);
          ctx.drawImage(imgUI, 0, 0, finalCanvas.width, finalCanvas.height);

          const dataUrl = finalCanvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `snail-game-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((uiError: unknown) => {
          uiRoot.style.pointerEvents = "none";
          console.error("[SCREENSHOT] Ошибка интерфейса:", uiError);
        });
    });
  } catch (error) {
    console.error("[SCREENSHOT] Критическая ошибка:", error);
  }
};
