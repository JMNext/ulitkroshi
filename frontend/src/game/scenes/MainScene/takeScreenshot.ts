import { toPng } from 'html-to-image';

export function takeScreenshot(scene: any): void {
  if (!scene?.game?.renderer) return;

  scene.game.renderer.snapshot(async (phaserImage: HTMLImageElement) => {
    const node = document.getElementById('game-container');
    if (!node || !phaserImage?.src) return;

    try {
      const phaserCanvas = node.querySelector('canvas');
      if (!phaserCanvas) return;

      const originalVisibility = phaserCanvas.style.visibility;
      
      const tempImg = document.createElement('img');
      tempImg.src = phaserImage.src;
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
        node.appendChild(tempBottomCopy);
        bottomMenuOverlay.style.opacity = '0';
      }

      // Ускорение: Уменьшили задержку до 20мс для мгновенного слепка кадра
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Ускорение: Включен skipFonts для отключения тяжелого парсинга шрифтов
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: window.devicePixelRatio || 1,
        skipFonts: true, 
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
