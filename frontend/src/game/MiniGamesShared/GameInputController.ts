import Phaser from "phaser";

export interface InputDirections {
  left: boolean; right: boolean; up: boolean; down: boolean;
  dirStr: "LEFT" | "RIGHT" | "UP" | "DOWN" | "";
}

export class GameInputController {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(private scene: Phaser.Scene) {
    if (this.scene.input.keyboard) {
      this.scene.input.keyboard.clearCaptures();
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasd = this.scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D
      }) as any;
    }
  }

  public getKeyboardDirections(): InputDirections {
    const left = !!(this.cursors?.left?.isDown || this.wasd?.left?.isDown);
    const right = !!(this.cursors?.right?.isDown || this.wasd?.right?.isDown);
    const up = !!(this.cursors?.up?.isDown || this.wasd?.up?.isDown);
    const down = !!(this.cursors?.down?.isDown || this.wasd?.down?.isDown);

    let dirStr: InputDirections["dirStr"] = "";
    if (left) dirStr = "LEFT"; else if (right) dirStr = "RIGHT";
    else if (up) dirStr = "UP"; else if (down) dirStr = "DOWN";

    return { left, right, up, down, dirStr };
  }

  public getLocalPointerCoords(pointer: Phaser.Input.Pointer, container: Phaser.GameObjects.Container, yOffset = 0): { x: number; y: number } {
    const scaleX = container.scaleX || 1, scaleY = container.scaleY || 1;
    return {
      x: (pointer.x - this.scene.scale.width / 2) / scaleX,
      y: (pointer.y - (this.scene.scale.height / 2 + yOffset)) / scaleY
    };
  }

  public setupTouchSwipe(onSwipe: (dir: "LEFT" | "RIGHT" | "UP" | "DOWN") => void): void {
    let sX = 0, sY = 0;
    this.scene.input.on("pointerdown", (p: Phaser.Input.Pointer) => { sX = p.x; sY = p.y; });
    this.scene.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      const dX = p.x - sX, dY = p.y - sY;
      if (Math.abs(dX) > Math.abs(dY)) { if (Math.abs(dX) > 40) onSwipe(dX > 0 ? "RIGHT" : "LEFT"); }
      else if (Math.abs(dY) > 40) onSwipe(dY > 0 ? "DOWN" : "UP");
    });
  }

  public destroy(): void {
    this.scene.input.off("pointerdown");
    this.scene.input.off("pointermove");
    this.scene.input.off("pointerup");
  }
}
