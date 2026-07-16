import { toPng } from 'html-to-image';

interface IScreenshotScene extends Phaser.Scene {
  game: Phaser.Game;
}

export function takeScreenshot(scene: IScreenshotScene): void {
  if (!scene?.game?.renderer) return;

  scene.game.renderer.snapshot((phaserImage: unknown) => {
    const phaserImg = phaserImage as HTMLImageElement | null;
    const node = document.getElementById('game-container');
    if (!node || !phaserImg?.src) return;

    const tempOverlay = document.createElement('div');
    tempOverlay.style.position = 'absolute';
    tempOverlay.style.inset = '0';
    tempOverlay.style.backgroundImage = `url(${phaserImg.src})`;
    tempOverlay.style.backgroundSize = '100% 100%';
    tempOverlay.style.backgroundPosition = 'center';
    tempOverlay.style.backgroundRepeat = 'no-repeat';
    tempOverlay.style.zIndex = '1';

    node.appendChild(tempOverlay);

    const filterNoScreenshot = (domNode: HTMLElement) => {
      if (domNode.classList?.contains('no-screenshot')) {
        return false;
      }
      return true;
    };

    window.setTimeout(async () => {
      try {
        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: window.devicePixelRatio || 2,
          skipFonts: true,
          width: node.clientWidth,
          height: node.clientHeight,
          filter: filterNoScreenshot as any,
        });

        const link = document.createElement('a');
        link.download = `pet_screenshot_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        link.remove();
      } catch (error) {
        console.error('Ошибка при генерации изображения:', error);
      } finally {
        tempOverlay.remove();
      }
    }, 35);
  });
}
