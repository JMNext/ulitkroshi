import Phaser from "phaser";

interface CountdownConfig {
  scene: Phaser.Scene; container: Phaser.GameObjects.Container | null; onComplete: () => void; yOffset?: number;
  customLabel?: string;
}

export const runCountdown = ({ scene, container, onComplete, yOffset = -40, customLabel = "В БОЙ!" }: CountdownConfig) => {
  let value = 3; const { width: w, height: h } = scene.scale;
  const fontSz = Math.min(76, Math.floor((h > w ? w : 480) / 6.5));

  const text = scene.add.text(container ? 0 : w / 2, container ? yOffset : h / 2 + yOffset, "3", { fontSize: `${fontSz}px`, fontFamily: "Arial Black", color: "#ffffff", stroke: "#000000", strokeThickness: 8 }).setOrigin(0.5).setDepth(100);
  if (container) container.add(text);

  scene.time.addEvent({
    delay: 1000, repeat: 3,
    callback: () => {
      if (--value > 0) text.setText(value.toString());
      else if (value === 0) { text.setFontSize(fontSz).setText(customLabel); onComplete(); }
      else text.destroy();
    }
  });
  return text;
};
