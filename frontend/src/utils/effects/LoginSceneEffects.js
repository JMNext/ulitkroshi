import Phaser from 'phaser';

export function createLoginButton(scene, x, y, onClickCallback) {
  const w = 500, h = 120;
  const container = scene.add.container(x, y).setDepth(2);

  const shadow = scene.add.graphics().fillStyle(0x366901, 1).fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 60);
  const body = scene.add.graphics().fillStyle(0x61aa05, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 60);
  const border = scene.add.graphics().lineStyle(4, 0xa6f034, 0.5).strokeRoundedRect(-w / 2, -h / 2, w, h, 60);
  const txt = scene.add.text(0, 0, 'ВОЙТИ', { fontFamily: 'Arial Black, Impact, sans-serif', fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);

  container.add([shadow, body, border, txt]);
  container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

  const reset = () => { body.y = 0; border.y = 0; txt.y = 0; };

  container.on('pointerdown', () => { body.y = 6; border.y = 6; txt.y = 6; })
    .on('pointerout', reset)
    .on('pointerup', () => { reset(); container.destroy(); if (onClickCallback) onClickCallback(); });
}

export function createLoadingBar(scene, x, y, onCompleteCallback) {
  const w = 500, h = 85;
  const bg = scene.add.graphics().setDepth(2).fillStyle(0xffffff, 0.95).fillRoundedRect(x - w / 2, y - h / 2, w, h, 42);
  bg.fillStyle(0xede9e6, 1).fillRoundedRect(x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 16, 34);
  const bar = scene.add.graphics().setDepth(3);

  let p = 0;
  const timer = scene.time.addEvent({
    delay: 16,
    loop: true,
    callback: () => {
      p += 0.015;
      bar.clear();
      
      // Назначаем цвет заливки повторно СРАЗУ после очистки
      bar.fillStyle(0xf9b300, 1);
      
      const currentWidth = (w - 28) * Math.min(p, 1);
      if (currentWidth > 0) {
        bar.fillRoundedRect(x - w / 2 + 14, y - h / 2 + 14, currentWidth, h - 28, 20);
      }
      
      if (p >= 1) { 
        timer.remove(); 
        bar.destroy(); 
        bg.destroy(); 
        if (onCompleteCallback) onCompleteCallback(); 
      }
    }
  });
}
