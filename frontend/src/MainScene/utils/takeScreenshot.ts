import { toPng } from "html-to-image";

export const takeScreenshot = async () => {
  const canvas = document.querySelector("canvas");
  const container = canvas?.parentElement;
  const uiRoot = container?.querySelector(".phaser-ui-root-container") as HTMLDivElement;
  const game = (window as any).phaserGame;

  if (!container || !canvas || !uiRoot || !game) return;

  try {
    const w = container.clientWidth, h = container.clientHeight, pr = window.devicePixelRatio || 2;

    const cutElements = uiRoot.querySelectorAll(".truncate, .text-ellipsis, .overflow-hidden, [class*='max-w-']");
    const originalStyles: Array<{ el: Element; className: string; style: string }> = [];

    cutElements.forEach((el) => {
      originalStyles.push({ el, className: el.className, style: el.getAttribute("style") || "" });
      el.className = el.className.replace(/(truncate|text-ellipsis|overflow-hidden|max-w-\[[^\]]+\]|max-w-\w+)/g, "");
      (el as HTMLElement).style.overflow = "visible";
      (el as HTMLElement).style.width = "auto";
      (el as HTMLElement).style.maxWidth = "none";
    });

    game.renderer.snapshot((snap: any) => {
      if (!(snap instanceof HTMLImageElement)) return;
      uiRoot.style.pointerEvents = "auto";

      toPng(uiRoot, {
        cacheBust: true, pixelRatio: pr, skipFonts: true, width: w, height: h,
        filter: (n: Node) => !(n instanceof HTMLElement && n.innerText === "✕")
      })
        .then(async (uiUrl) => {
          uiRoot.style.pointerEvents = "none";

          const finalCanvas = document.createElement("canvas");
          finalCanvas.width = w * pr; finalCanvas.height = h * pr;
          const ctx = finalCanvas.getContext("2d");
          if (!ctx) return;

          const imgUI = new Image();
          await new Promise((res) => { imgUI.onload = res; imgUI.src = uiUrl; });

          ctx.drawImage(snap, 0, 0, finalCanvas.width, finalCanvas.height);
          ctx.drawImage(imgUI, 0, 0, finalCanvas.width, finalCanvas.height);

          const link = document.createElement("a");
          link.download = `snail-game-${Date.now()}.png`;
          link.href = finalCanvas.toDataURL("image/png");
          link.click();
        })
        .catch(() => uiRoot.style.pointerEvents = "none")
        .finally(() => {
          originalStyles.forEach(({ el, className, style }) => {
            el.className = className;
            style ? el.setAttribute("style", style) : el.removeAttribute("style");
          });
        });
    });
  } catch {}
};
