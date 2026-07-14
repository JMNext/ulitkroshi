import { toPng } from 'html-to-image';

interface IScreenshotScene extends Phaser.Scene {
  game: Phaser.Game;
}

export function takeScreenshot(scene: IScreenshotScene): void {
  if (!scene?.game?.renderer) return;

  scene.game.renderer.snapshot(async (phaserImage: unknown) => {
    const phaserImg = phaserImage as HTMLImageElement | null;
    const node = document.getElementById('game-container');
    if (!node || !phaserImg?.src) return;

    try {
      const phaserCanvas = node.querySelector('canvas');
      if (!phaserCanvas) return;

      const originalVisibility = phaserCanvas.style.visibility;
      
      const tempImg = document.createElement('img');
      tempImg.src = phaserImg.src;
      tempImg.style.position = 'absolute';
      tempImg.style.inset = '0';
      tempImg.style.width = '100%';
      tempImg.style.height = '100%';
      tempImg.style.zIndex = '0';
      phaserCanvas.parentElement?.appendChild(tempImg);
      phaserCanvas.style.visibility = 'hidden';

      const bottomMenuOverlay = document.getElementById('main-bottom-ui-overlay');
      let tempBottomCopy: HTMLElement | null = null;
      
      if (bottomMenuOverlay) {
        tempBottomCopy = bottomMenuOverlay.cloneNode(true) as HTMLElement;
        tempBottomCopy.id = 'main-bottom-ui-overlay-screenshot-temp';
        
        const originalMainWrapper = bottomMenuOverlay.firstElementChild as HTMLElement | null;
        const copiedMainWrapper = tempBottomCopy.firstElementChild as HTMLElement | null;
        if (originalMainWrapper && copiedMainWrapper) {
          copiedMainWrapper.style.cssText = originalMainWrapper.style.cssText;
          const originalButtonsGroup = originalMainWrapper.lastElementChild as HTMLElement | null;
          const copiedButtonsGroup = copiedMainWrapper.lastElementChild as HTMLElement | null;
          if (originalButtonsGroup && copiedButtonsGroup) {
            copiedButtonsGroup.style.cssText = originalButtonsGroup.style.cssText;
          }
        }
        
        node.appendChild(tempBottomCopy);
        bottomMenuOverlay.style.opacity = '0';
      }

      await new Promise((resolve) => window.setTimeout(resolve, 20));

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: window.devicePixelRatio || 1,
        skipFonts: true,
        width: node.clientWidth,
        height: node.clientHeight,
      });

      phaserCanvas.style.visibility = originalVisibility;
      tempImg.remove();

      if (tempBottomCopy) tempBottomCopy.remove();
      if (bottomMenuOverlay) bottomMenuOverlay.style.opacity = '1';

      const link = document.createElement('a');
      link.download = `pet_screenshot_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      link.remove();
    } catch (error) {
      console.error('Ошибка при создании скриншота:', error);
    }
  });
}
