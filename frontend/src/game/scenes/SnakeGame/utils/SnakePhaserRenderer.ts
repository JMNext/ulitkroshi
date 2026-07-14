import * as Phaser from 'phaser';

export const buildGridGfx = (scene: Phaser.Scene, ox: number, oy: number, sz: number): Phaser.GameObjects.Graphics => {
  const g = scene.add.graphics().setDepth(2).fillStyle(0xffffff, 0.4).fillRoundedRect(ox, oy, 12 * sz, 12 * sz, Math.min(24, sz * 0.4)).lineStyle(2, 0x000000, 0.2);
  for (let i = 1; i <= 11; i++) {
    g.moveTo(ox + i * sz, oy).lineTo(ox + i * sz, oy + 12 * sz).moveTo(ox, oy + i * sz).lineTo(ox + 12 * sz, oy + i * sz);
  }
  g.strokePath().lineStyle(Math.max(3, sz * 0.1), 0x61aa05, 1).strokeRoundedRect(ox, oy, 12 * sz, 12 * sz, Math.min(24, sz * 0.4));
  return g;
};

export const drawSegmentGfx = (scene: Phaser.Scene, ox: number, oy: number, sz: number, gx: number, gy: number, isHead: boolean, dir: string): Phaser.GameObjects.Graphics => {
  const [x, y] = [ox + gx * sz, oy + gy * sz];
  const g = scene.add.graphics().fillStyle(isHead ? 0x4c9203 : 0x61aa05, 1).fillRoundedRect(0, 0, sz - 4, sz - 4, sz * 0.2).setPosition(x, y).setDepth(5);
  if (isHead) {
    g.fillStyle(0, 1);
    const s = sz - 4, er = Math.max(2, sz * 0.06), f = s * 0.75, n = s * 0.25;
    const eyes: Record<string, number[]> = { RIGHT: [f, n, f, f], LEFT: [n, n, n, f], UP: [n, n, f, n], DOWN: [n, f, f, f] };
    const [e1x, e1y, e2x, e2y] = eyes[dir] || [f, n, f, f];
    g.fillCircle(e1x, e1y, er).fillCircle(e2x, e2y, er);
  }
  return g;
};
