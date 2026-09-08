import { useMemoryGameStore } from "./store/useMemoryGameStore";
import { MemoryGameScene } from "./MemoryGameScene";

export class MemoryGameGrid {
  private mainGridContainer!: Phaser.GameObjects.Container;
  private cards: Phaser.GameObjects.Container[] = [];
  private readonly cardW = 160;
  private readonly cardH = 160;

  constructor(private scene: MemoryGameScene) {}

  public createGrid = (): void => {
    const { deck } = useMemoryGameStore.getState();
    this.mainGridContainer = this.scene.add.container(0, 0).setDepth(10);

    const cols = 4;
    const gap = 16;
    const startX = -(cols * this.cardW + (cols - 1) * gap) / 2 + this.cardW / 2;
    const rows = Math.ceil(deck.length / cols);
    const startY = -(rows * this.cardH + (rows - 1) * gap) / 2 + this.cardH / 2;

    deck.forEach((id, i) => {
      const x = startX + (i % cols) * (this.cardW + gap);
      const y = startY + Math.floor(i / cols) * (this.cardH + gap);
      const container = this.scene.add.container(x, y);

      const frame = this.scene.add.graphics();
      frame.fillStyle(0xffffff, 1).lineStyle(4, 0xffb300, 1);
      frame.fillRoundedRect(-this.cardW / 2, -this.cardH / 2, this.cardW, this.cardH, 24);
      frame.strokeRoundedRect(-this.cardW / 2, -this.cardH / 2, this.cardW, this.cardH, 24);

      const shirt = this.scene.add.image(0, 0, "card_shirt").setDisplaySize(this.cardW * 0.82, this.cardH * 0.82);
      const fruit = this.scene.add.image(0, 0, `fruit_${id}`).setDisplaySize(this.cardW * 0.85, this.cardH * 0.85);

      container.add([frame, shirt, fruit]).setSize(this.cardW, this.cardH).setInteractive({ useHandCursor: true });
      container.setData({ index: i, fruitId: id, shirt, fruit, frame, isOpen: true });
      
      container.on("pointerdown", () => 
        useMemoryGameStore.getState().canClick &&
        useMemoryGameStore.getState().handleCardClick(i, this.scene.totalPairs)
      );

      this.mainGridContainer.add(container);
      this.cards.push(container);
    });

    this.resize();
    this.updateVisuals();
  };

  public resize = (): void => {
    if (!this.mainGridContainer || !this.scene?.scale) return;
    const { width: w, height: h } = this.scene.scale;
    if (w === 0 || h === 0) return;
    const isPortrait = h > w;

    const gridW = 4 * this.cardW + 3 * 16;
    const gridH = Math.ceil(this.cards.length / 4) * this.cardH + (Math.ceil(this.cards.length / 4) - 1) * 16;

    let scale = 1;
    if (isPortrait) {
      const maxVertScale = (w * 0.86) / gridW;
      scale = Math.min(w / (gridW + 40), h / (gridH + 240), maxVertScale);
    } else {
      const paddingX = w < 960 ? 100 : 160;
      const paddingY = w < 960 ? 60 : 100;
      scale = Math.min(w / (gridW + paddingX), h / (gridH + paddingY));
      if (w / h < 1.6) scale *= 0.98;
      
      const maxHorizontalScale = (w * 0.65) / gridW;
      scale = Math.min(scale, maxHorizontalScale, 1.25);
    }

    this.mainGridContainer.setPosition(w / 2, isPortrait ? h / 2 - 20 : h / 2).setScale(scale);
  };

  public updateVisuals = (): void => {
    const { openedCards, matchedCards, isPreview } = useMemoryGameStore.getState();

    this.cards.forEach((c) => {
      if (!c.active || !c.data) return;
      const { index: idx, fruitId: id, shirt, fruit, isOpen: lastIsOpen } = c.data.values;
      const isMatched = matchedCards.includes(id);
      const shouldBeOpen = isPreview || openedCards.includes(idx) || isMatched;

      if (isMatched && c.visible) {
        this.scene.tweens.add({
          targets: c, scale: 0.75, alpha: 0, duration: 400,
          onComplete: () => { c.setVisible(false).disableInteractive(); }
        });
        return;
      }

      if (lastIsOpen !== shouldBeOpen) {
        c.setData("isOpen", shouldBeOpen);
        this.scene.tweens.add({
          targets: c, scaleX: 0, duration: 200, ease: "Quad.easeIn",
          onComplete: () => {
            shirt.setVisible(!shouldBeOpen);
            fruit.setVisible(shouldBeOpen);
            
            this.scene.tweens.add({ 
              targets: c, scaleX: 1, duration: 200, ease: "Quad.easeOut",
              onComplete: () => {
                if (shouldBeOpen && !isMatched) {
                  this.runShimmerEffect(c);
                }
              }
            });
          }
        });
      } else {
        shirt.setVisible(!shouldBeOpen);
        fruit.setVisible(shouldBeOpen);
      }
    });
  };

  private runShimmerEffect = (cardContainer: Phaser.GameObjects.Container): void => {
    this.scene.tweens.add({
      targets: cardContainer,
      alpha: 0.85,
      duration: 500,
      yoyo: true,
      repeat: 1,
      ease: "Sine.easeInOut",
      onComplete: () => {
        cardContainer.setAlpha(1);
      }
    });
  };

  public runMixAnimation = (): void => {
    let currentDeck = [...this.cards];
    let swapCount = 0;

    const executeStep = () => {
      if (swapCount >= 5) return useMemoryGameStore.getState().setCanClickTrue();

      let idx1 = Math.floor(Math.random() * currentDeck.length);
      let idx2 = Math.floor(Math.random() * currentDeck.length);
      while (idx1 === idx2) idx2 = Math.floor(Math.random() * currentDeck.length);

      const [c1, c2] = [currentDeck[idx1], currentDeck[idx2]];
      const [x1, y1, x2, y2] = [c1.x, c1.y, c2.x, c2.y];

      this.mainGridContainer.bringToTop(c1);
      this.mainGridContainer.bringToTop(c2);

      this.scene.tweens.add({ targets: c1, x: x2, y: y2, duration: 350, ease: "Cubic.easeInOut" });
      this.scene.tweens.add({
        targets: c2, x: x1, y: y1, duration: 350, ease: "Cubic.easeInOut",
        onComplete: () => {
          currentDeck[idx1] = c2;
          currentDeck[idx2] = c1;
          swapCount++;
          this.scene.time.delayedCall(100, executeStep);
        }
      });
    };
    executeStep();
  };

  public destroy = (): void => {
    this.cards.forEach((c) => c?.destroy());
    this.cards = [];
    this.mainGridContainer?.destroy();
  };
}
