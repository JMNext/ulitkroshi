import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import { BaseAuthScene } from "../BaseAuthScene";
import { Step1UiManager } from "./Step1UiManager";
import React from "react";

export class Step1Scene extends BaseAuthScene {
  constructor() { super({ key: "Step1Scene" }); }

  protected getUiComponent(): React.ReactElement {
    return <Step1UiManager phaserScene={this as any} />;
  }

  protected getBackgroundKey(orientation: "vert" | "goriz"): string {
    return `game_bg_${orientation}`;
  }

  public override create(): void {
    super.create();

    registerSceneEvent(this, "step1_scene_start", () => this.scene.start());
    registerSceneEvent(this, "step1_scene_stop", () => {
      if (this.sys.isActive()) {
        if (this.uiContainer) this.uiContainer.style.opacity = "0";
        this.tweens.add({ targets: this.backgroundIm, alpha: 0, duration: 200, onComplete: () => this.scene.stop() });
      }
    });
  }
}
