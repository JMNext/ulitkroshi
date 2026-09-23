import { getSharedGameResizeMetrics } from "@/game/MiniGamesShared/miniGames.constants";
import { MemoryGameScene } from "../MemoryGameScene";
import { useMemoryGameStore } from "../store/useMemoryGameStore";

export class MemoryGameGrid {
  private mainGridContainer!: Phaser.GameObjects.Container;
  private cards: Phaser.GameObjects.Container[] = [];
  private readonly cardW = 160;
  private readonly cardH = 160;

  constructor(private scene: MemoryGameScene) {}

  public createGrid = (): void => {
    const { deck } = useMemoryGameStore.getState();
    this.mainGridContainer = this.scene.add.container(0, 0).setDepth(10);

    const cols = 4, gap = 16, startX = -(cols * this.cardW + (cols - 1) * gap) / 2 + this.cardW / 2;
    const startY = -(Math.ceil(deck.length / cols) * this.cardH + (Math.ceil(deck.length / cols) - 1) * gap) / 2 + this.cardH / 2;

    deck.forEach((id, i) => {
      const x = startX + (i % cols) * (this.cardW + gap), y = startY + Math.floor(i / cols) * (this.cardH + gap);
      const container = this.scene.add.container(x, y);

      const frame = this.scene.add.graphics().fillStyle(0xffffff, 1).lineStyle(4, 0xffb300, 1);
      frame.fillRoundedRect(-this.cardW / 2, -this.cardH / 2, this.cardW, this.cardH, 24);
      frame.strokeRoundedRect(-this.cardW / 2, -this.cardH / 2, this.cardW, this.cardH, 24);

      const shirt = this.scene.add.image(0, 0, "card_shirt").setDisplaySize(this.cardW * 0.82, this.cardH * 0.82);
      const fruit = this.scene.add.image(0, 0, `fruit_${id}`).setDisplaySize(this.cardW * 0.85, this.cardH * 0.85);

      container.add([frame, shirt, fruit]).setSize(this.cardW, this.cardH).setInteractive({ useHandCursor: true });
      container.setData({ index: i, fruitId: id, shirt, fruit, frame, isOpen: true });
      container.on("pointerdown", () => useMemoryGameStore.getState().canClick && useMemoryGameStore.getState().handleCardClick(i, this.scene.totalPairs));

      this.mainGridContainer.add(container);
      this.cards.push(container);
    });
    this.resize();
    this.updateVisuals();
  };

  public resize = (): void => {
    if (!this.mainGridContainer || !this.scene?.scale) return;
    const { width: w, height: h } = this.scene.scale;
    if (!w || !h) return;
    const isPort = h > w, gridW = 4 * this.cardW + 3 * 16, gridH = Math.ceil(this.cards.length / 4) * this.cardH + (Math.ceil(this.cards.length / 4) - 1) * 16;

    const m = getSharedGameResizeMetrics(w, h, isPort);
    let sc = 1;

    if (isPort) sc = Math.min(w / (gridW + 40), h / (gridH + 240), (w * 0.86) / gridW);
    else {
      sc = Math.min(w / (gridW + m.paddingX), h / (gridH + m.paddingY));
      if (m.ratioModifier) sc *= 0.98;
      sc = Math.min(sc, (w * 0.65) / gridW, 1.25);
    }
    this.mainGridContainer.setPosition(w / 2, isPort ? h / 2 - 20 : h / 2).setScale(sc);
  };

  public updateVisuals = (): void => {
    const { openedCards, matchedCards, isPreview } = useMemoryGameStore.getState();

    this.cards.forEach((c) => {
      if (!c.active || !c.data) return;
      const { index: idx, fruitId: id, shirt, fruit, isOpen: lastOpen } = c.data.values;
      const isMatched = matchedCards.includes(id), shouldOpen = isPreview || openedCards.includes(idx) || isMatched;

      if (isMatched && c.visible) {
        this.scene.tweens.add({ targets: c, scale: 0.75, alpha: 0, duration: 400, onComplete: () => c.setVisible(false).disableInteractive() });
        return;
      }

      if (lastOpen !== shouldOpen) {
        c.setData("isOpen", shouldOpen);
        this.scene.tweens.add({
          targets: c, scaleX: 0, duration: 200, ease: "Quad.easeIn",
          onComplete: () => {
            shirt.setVisible(!shouldOpen);
            fruit.setVisible(shouldOpen);
            this.scene.tweens.add({
              targets: c, scaleX: 1, duration: 200, ease: "Quad.easeOut",
              onComplete: () => shouldOpen && !isMatched && this.scene.tweens.add({ targets: c, alpha: 0.85, duration: 500, yoyo: true, repeat: 1, ease: "Sine.easeInOut", onComplete: () => c.setAlpha(1) })
            });
          }
        });
      } else {
        shirt.setVisible(!shouldOpen);
        fruit.setVisible(shouldOpen);
      }
    });
  };

  public runMixAnimation = (): void => {
    const deck = [...this.cards];
    let swaps = 0;
    const step = () => {
      if (swaps >= 5) return useMemoryGameStore.getState().setCanClickTrue();
      let idx1 = Math.floor(Math.random() * deck.length), idx2 = Math.floor(Math.random() * deck.length);
      while (idx1 === idx2) idx2 = Math.floor(Math.random() * deck.length);

      const [c1, c2] = [deck[idx1], deck[idx2]], [x1, y1, x2, y2] = [c1.x, c1.y, c2.x, c2.y];
      this.mainGridContainer.bringToTop(c1);
      this.mainGridContainer.bringToTop(c2);

      this.scene.tweens.add({ targets: c1, x: x2, y: y2, duration: 350, ease: "Cubic.easeInOut" });
      this.scene.tweens.add({
        targets: c2, x: x1, y: y1, duration: 350, ease: "Cubic.easeInOut",
        onComplete: () => { deck[idx1] = c2; deck[idx2] = c1; swaps++; this.scene.time.delayedCall(100, step); }
      });
    };
    step();
  };

  public destroy = (): void => {
    this.cards.forEach((c) => c?.destroy());
    this.cards = [];
    this.mainGridContainer?.destroy();
  };
}
