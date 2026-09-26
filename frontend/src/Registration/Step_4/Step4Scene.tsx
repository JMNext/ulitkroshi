import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import { BaseAuthScene } from "../BaseAuthScene";
import { Step4UiManager } from "./Step4UiManager";
import React from "react";

export class Step4Scene extends BaseAuthScene {
  constructor() { super({ key: "Step4Scene" }); }

  protected getUiComponent(): React.ReactElement {
    return <Step4UiManager phaserScene={this as any} />;
  }

  protected getBackgroundKey(orientation: "vert" | "goriz"): string {
    return `game_bg_${orientation}`;
  }

  public override create(): void {
    super.create();

    registerSceneEvent(this, "step4_scene_start", (data?: any) => this.scene.start("Step4Scene", data));
    registerSceneEvent(this, "step4_scene_stop", () => {
      if (this.sys.isActive()) {
        if (this.uiContainer) this.uiContainer.style.opacity = "0";
        this.tweens.add({ targets: this.backgroundIm, alpha: 0, duration: 200, onComplete: () => this.scene.stop() });
      }
    });
  }
}
