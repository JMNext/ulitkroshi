import Phaser from 'phaser';

export class AnimatedCharacter {
  constructor(scene, x, y, defaultVideoKey) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.currentAnimation = defaultVideoKey;
    this.isSleeping = false;
    this.anims = {};

    ['idle', 'eat', 'wash', 'play', 'sleep'].forEach((key) => {
      const isWash = key === 'wash';
      const finalY = isWash ? y - 410 : y;

      const vid = scene.add.video(x, finalY, key);
      const finalScale = isWash ? 0.86 : 0.85;
      
      vid.setOrigin(0.5, 0.5).setScale(finalScale).setDepth(2).setMute(true).setVisible(key === defaultVideoKey);
      vid.setAlpha(key === defaultVideoKey ? 1 : 0);

      if (vid.video) {
        vid.video.style.objectFit = 'fill';
      }
      
      // ИСПРАВЛЕНО: Ширина для wash сужена до 1076 пикселей, чтобы убрать эффект расширения
      vid.setSize(isWash ? 1076 : 1080, isWash ? 1920 : 1080);
      vid.updateDisplayOrigin();

      vid.on('complete', () => {
        if (!this.isSleeping && this.currentAnimation === key) {
          this.playAnim('idle', true);
        }
      });

      this.anims[key] = vid;
      if (key === defaultVideoKey) vid.play(true);
    });
  }

  getBounds() {
    return this.anims[this.currentAnimation].getBounds();
  }

  get x_coord() { return this.x; }
  get y_coord() { return this.y; }

  playAnim(key, loop = false) {
    if (key === 'sleep') {
      this.isSleeping = !this.isSleeping;
      this.executeSwitch(this.isSleeping ? 'sleep' : 'idle', true);
      return;
    }
    if (!this.isSleeping) this.executeSwitch(key, loop);
  }

  executeSwitch(key, loop) {
    const prevAnim = this.anims[this.currentAnimation];
    const nextAnim = this.anims[key];
    if (!nextAnim) return;

    this.currentAnimation = key;
    nextAnim.setVisible(true);

    if (nextAnim.video) {
      nextAnim.video.loop = loop;
      nextAnim.video.currentTime = 0;
    }
    nextAnim.play(loop);

    this.scene.tweens.add({
      targets: nextAnim,
      alpha: 1,
      duration: 150
    });

    if (prevAnim && prevAnim !== nextAnim) {
      this.scene.tweens.add({
        targets: prevAnim,
        alpha: 0,
        duration: 150,
        onComplete: () => {
          if (this.currentAnimation !== prevAnim.texture.key) {
            prevAnim.stop().setVisible(false);
          }
        }
      });
    }
  }

  destroy() {
    Object.values(this.anims).forEach(vid => vid.destroy());
  }
}
