import { registerSceneEvent } from "@/eventbus/registerSceneEvent";
import { BaseAuthScene } from "@/Registration/BaseAuthScene";
import { LoginUiManager } from "./LoginUiManager";
import React from "react";

export class LoginScene extends BaseAuthScene {
  constructor() { super({ key: "LoginScene" }); }

  public override init(): void {
    super.init();
    if (this.load.isLoading()) this.load.reset();
  }

  protected getUiComponent(): React.ReactElement {
    return <LoginUiManager phaserScene={this as any} />;
  }

  protected getBackgroundKey(orientation: "vert" | "goriz"): string {
    return `login_bg_${orientation}`;
  }

  public override create(): void {
    super.create();

    registerSceneEvent(this, "login_scene_start", () => this.scene.start());
    registerSceneEvent(this, "force_logout_to_login", () => {
      this.cleanUp();
      this.scene.manager.getScenes(false).forEach(s => {
        try { s.scene.stop(); s.scene.setVisible(false); s.scene.setActive(false); } catch (_) {}
      });
      this.scene.start("LoginScene"); this.scene.bringToTop("LoginScene");
    });
  }
}
