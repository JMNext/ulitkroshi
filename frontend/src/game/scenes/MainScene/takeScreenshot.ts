import { toPng } from 'html-to-image';

interface IScreenshotScene extends Phaser.Scene {
  game: Phaser.Game;
}

export function takeScreenshot(scene: IScreenshotScene): void {
  if (!scene?.game?.renderer) return;

  {/* 1. Снимаем чистый холст (картинку питомца и фона) из WebGL Phaser */}
  scene.game.renderer.snapshot((phaserImage: unknown) => {
    const phaserImg = phaserImage as HTMLImageElement | null;
    const node = document.getElementById('game-container') || document.body;
    if (!node || !phaserImg?.src) return;

    const filterNoScreenshot = (domNode: HTMLElement) => {
      return !domNode.classList?.contains('no-screenshot');
    };

    {/* Скрываем элементы, которые не должны попасть на фото, перед рендером интерфейса */}
    const targetWidth = node.clientWidth || window.innerWidth;
    const targetHeight = node.clientHeight || window.innerHeight;

    {/* 2. Делаем снимок только HTML-интерфейса (кнопок, хелсбара) через html-to-image */}
    window.setTimeout(async () => {
      try {
        const uiDataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: window.devicePixelRatio || 2,
          skipFonts: true,
          width: targetWidth,
          height: targetHeight,
          filter: filterNoScreenshot as any,
        });

        {/* 3. Создаем временный холст в памяти для склейки двух картинок */}
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth * (window.devicePixelRatio || 2);
        canvas.height = targetHeight * (window.devicePixelRatio || 2);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const imgPhaser = new Image();
          const imgUI = new Image();

          {/* Ждем параллельную загрузку обоих изображений в памяти браузера */}
          await Promise.all([
            new Promise((resolve) => { imgPhaser.onload = resolve; imgPhaser.src = phaserImg.src; }),
            new Promise((resolve) => { imgUI.onload = resolve; imgUI.src = uiDataUrl; })
          ]);

          {/* Отрисовываем сначала Phaser (низ), а затем интерфейс UI (верх) */}
          ctx.drawImage(imgPhaser, 0, 0, canvas.width, canvas.height);
          ctx.drawImage(imgUI, 0, 0, canvas.width, canvas.height);

          {/* 4. Скачиваем готовый склеенный PNG-файл */}
          const link = document.createElement('a');
          link.download = `pet_screenshot_${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          link.remove();
        }
      } catch (error) {
        console.error('Ошибка при генерации изображения:', error);
      }
    }, 20);
  });
}
