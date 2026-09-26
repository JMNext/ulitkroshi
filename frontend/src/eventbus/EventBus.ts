import Phaser from "phaser";

export type EventPayloads = {
  main_scene_start: { sessionId?: string } | undefined; main_scene_wake: undefined; main_scene_sleep: undefined; main_scene_stop: undefined;
  login_scene_start: undefined; login_scene_stop: undefined; step1_scene_start: undefined; step1_scene_stop: undefined;
  step2_scene_start: undefined; step2_scene_stop: undefined; step3_scene_start: { sessionId: string }; step3_scene_stop: undefined;
  step4_scene_start: { sessionId: string }; step4_scene_stop: undefined; scanner_scene_start: undefined; scanner_scene_stop: undefined;
  minigame_clicker_start: undefined; minigame_memory_start: undefined; minigame_seabattle_start: undefined; minigame_stop_to_main: undefined; force_logout_to_login: undefined;
  minigame_catch_start: { difficulty: "easy" | "medium" | "hard" }; minigame_snake_start: { difficulty: "easy" | "medium" | "hard" };
  minigame_racing_start: { difficulty: "easy" | "medium" | "hard" }; minigame_tanks_start: { difficulty: "easy" | "medium" | "hard" };
  set_registration_flow: { isLogin: boolean };
};

class TypedEventBus {
  private bus = new Phaser.Events.EventEmitter();
  public emit<K extends keyof EventPayloads>(ev: K, p?: EventPayloads[K]) { return this.bus.emit(ev, p); }
  public on<K extends keyof EventPayloads>(ev: K, fn: (p: EventPayloads[K]) => void, ctx?: any) { this.bus.on(ev, fn, ctx); return this; }
  public off<K extends keyof EventPayloads>(ev: K, fn?: (p: EventPayloads[K]) => void, ctx?: any) { this.bus.off(ev, fn, ctx); return this; }
}

export const EventBus = new TypedEventBus();

export const registerSceneEvent = <K extends keyof EventPayloads>(scene: Phaser.Scene, event: K, fn: (p: EventPayloads[K]) => void, ctx?: any): void => {
  const handler = fn.bind(ctx || scene);
  EventBus.on(event, handler);
  const clean = () => EventBus.off(event, handler);
  scene.sys.events.once("shutdown", clean).once("destroy", clean);
};
