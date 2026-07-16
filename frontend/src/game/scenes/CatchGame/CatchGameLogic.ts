import * as Phaser from 'phaser';

export const DIFFICULTY_CONFIGS: Record<string, { s: number; d: number }> = {
  easy: { s: 6, d: 1500 },
  medium: { s: 8, d: 1200 },
  hard: { s: 11, d: 900 }
};

export const getMovedPlayerX = (
  currentX: number,
  direction: number,
  speed: number,
  minX: number,
  maxX: number
): number => {
  const nextX = currentX + direction * speed;
  return Phaser.Math.Clamp(nextX, minX, maxX);
};

export const checkFruitCaughtLogic = (
  fruitX: number,
  fruitY: number,
  playerX: number,
  playerY: number,
  catchRadius: number
): boolean => {
  return Phaser.Math.Distance.Between(fruitX, fruitY, playerX, playerY) <= catchRadius;
};

export const setupMouseControls = (
  scene: Phaser.Scene,
  player: Phaser.GameObjects.Video
): (p: Phaser.Input.Pointer) => void => {
  const onPointerMove = (pointer: Phaser.Input.Pointer) => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    const hw = (player.displayWidth || 100) / 2;
    player.x = Phaser.Math.Clamp(pointer.x, hw, scene.scale.width - hw);
  };

  scene.input.on('pointermove', onPointerMove);
  return onPointerMove;
};

export const removeMouseControls = (
  scene: Phaser.Scene,
  onPointerMoveRef: (p: Phaser.Input.Pointer) => void
): void => {
  scene.input.off('pointermove', onPointerMoveRef);
};

export const setupKeyboardControls = (
  onChangeDirection: (dir: number) => void
): { keydown: (e: KeyboardEvent) => void; keyup: (e: KeyboardEvent) => void } => {
  let leftPressed = false;
  let rightPressed = false;

  const updateDirection = () => {
    if (leftPressed && !rightPressed) onChangeDirection(-1);
    else if (!leftPressed && rightPressed) onChangeDirection(1);
    else onChangeDirection(0);
  };

  const keydown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      leftPressed = true;
      updateDirection();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      rightPressed = true;
      updateDirection();
    }
  };

  const keyup = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      leftPressed = false;
      updateDirection();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      rightPressed = false;
      updateDirection();
    }
  };

  window.addEventListener('keydown', keydown, { passive: true });
  window.addEventListener('keyup', keyup, { passive: true });

  return { keydown, keyup };
};

export const removeKeyboardControls = (listeners: {
  keydown: (e: KeyboardEvent) => void;
  keyup: (e: KeyboardEvent) => void;
}): void => {
  window.removeEventListener('keydown', listeners.keydown);
  window.removeEventListener('keyup', listeners.keyup);
};
