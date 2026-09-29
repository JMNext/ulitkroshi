import { EventBus } from "@/eventbus/EventBus";
import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import { BaseAuthScene } from "../BaseAuthScene";
import { Step3UiManager } from "./Step3UiManager";
import React from "react";

export class Step3Scene extends BaseAuthScene {
  public sessionId: string = "";
  public isLoginFlow: boolean = false;

  constructor() { super({ key: "Step3Scene" }); }

  protected override getResizeConfig() {
    return {
      BASE_W: 460,
      BASE_H: 840,
      MIN: 0.4,
      MAX: 1.5,
      PAD: 1.0,
      MOBILE_SCALE_UP: false
    };
  }

  public override init(data?: { sessionId?: string; isLoginFlow?: boolean }): void {
    super.init();
    this.sessionId = data?.sessionId || "";
    this.isLoginFlow = data?.isLoginFlow || false;
    this.events.emit("phaser_scene_init", { isLoginFlow: this.isLoginFlow });
  }

  protected getUiComponent(): React.ReactElement {
    return <Step3UiManager phaserScene={this as any} sessionId={this.sessionId} />;
  }

  protected getBackgroundKey(orientation: "vert" | "goriz"): string {
    return `game_bg_${orientation}`;
  }

  public override create(): void {
    super.create();

    registerSceneEvent(this, "step3_scene_start", (data?: any) => this.scene.start("Step3Scene", data));
    registerSceneEvent(this, "step3_scene_stop", () => {
      if (this.sys.isActive()) {
        if (this.uiContainer) this.uiContainer.style.opacity = "0";
        this.tweens.add({ targets: this.backgroundIm, alpha: 0, duration: 200, onComplete: () => this.scene.stop() });
      }
    });
  }

  protected override handleWake(sys: Phaser.Scenes.Systems, data?: { sessionId?: string; isLoginFlow?: boolean }): void {
    if (data) {
      this.sessionId = data.sessionId || this.sessionId;
      this.isLoginFlow = data.isLoginFlow || false;
    }
    super.handleWake(sys, data);
    this.events.emit("phaser_scene_init", { isLoginFlow: this.isLoginFlow });
  }

  protected override cleanUp(): void {
    super.cleanUp();
    EventBus.off("step3_scene_start");
    EventBus.off("step3_scene_stop");
  }
}
