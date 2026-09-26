import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import { BaseAuthScene } from "../BaseAuthScene";
import { Step2UiManager } from "./Step2UiManager";
import React from "react";

export class Step2Scene extends BaseAuthScene {
  public isLoginFlow: boolean = false;

  constructor() { super({ key: "Step2Scene" }); }

  public override init(data?: { isLoginFlow?: boolean }): void {
    super.init();
    this.isLoginFlow = data?.isLoginFlow || false;
  }

  protected getUiComponent(): React.ReactElement {
    return <Step2UiManager phaserScene={this as any} />;
  }

  protected getBackgroundKey(orientation: "vert" | "goriz"): string {
    return `game_bg_${orientation}`;
  }

  protected override getResizeConfig() {
    return {
      BASE_W: 460,
      BASE_H: 840,
      BASE_HORIZ_H: 840,
      MIN: 0.4,
      MAX: 1.5,
      PAD: 1.0,
      MOBILE_SCALE_UP: false
    };
  }

  public override create(): void {
    super.create();

    registerSceneEvent(this, "step2_scene_start", () => this.scene.start("Step2Scene"));
    registerSceneEvent(this, "step2_scene_stop", () => {
      if (this.sys.isActive()) {
        if (this.uiContainer) this.uiContainer.style.opacity = "0";
        this.tweens.add({ targets: this.backgroundIm, alpha: 0, duration: 200, onComplete: () => this.scene.stop() });
      }
    });

    this.events.emit("phaser_scene_ready", { isLoginFlow: this.isLoginFlow });
  }

  protected override handleWake(sys: Phaser.Scenes.Systems, data?: { isLoginFlow?: boolean }): void {
    if (data) this.isLoginFlow = data.isLoginFlow || false;
    super.handleWake(sys, data);
    this.events.emit("phaser_scene_ready", { isLoginFlow: this.isLoginFlow });
  }
}
