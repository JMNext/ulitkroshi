import Phaser from "phaser";

export type EventPayloads = {
  main_scene_start: { sessionId?: string } | undefined;
  main_scene_wake: undefined;
  main_scene_sleep: undefined;
  main_scene_stop: undefined;
  login_scene_start: undefined;
  login_scene_stop: undefined;
  step1_scene_start: undefined;
  step1_scene_stop: undefined;
  step2_scene_start: undefined;
  step2_scene_stop: undefined;
  step3_scene_start: { sessionId: string };
  step3_scene_stop: undefined;
  step4_scene_start: { sessionId: string };
  step4_scene_stop: undefined;
  scanner_scene_start: undefined;
  scanner_scene_stop: undefined;
  minigame_clicker_start: undefined;
  minigame_memory_start: undefined;
  minigame_catch_start: { difficulty: "easy" | "medium" | "hard" };
  minigame_snake_start: { difficulty: "easy" | "medium" | "hard" };
  minigame_stop_to_main: undefined;
};

class TypedEventBus {
  private bus = new Phaser.Events.EventEmitter();

  public emit<K extends keyof EventPayloads>(event: K, payload?: EventPayloads[K]): boolean {
    return this.bus.emit(event, payload);
  }

  public on<K extends keyof EventPayloads>(event: K, fn: (payload: EventPayloads[K]) => void, context?: unknown): this {
    this.bus.on(event, fn, context);
    return this;
  }

  public off<K extends keyof EventPayloads>(event: K, fn?: (payload: EventPayloads[K]) => void, context?: unknown): this {
    this.bus.off(event, fn, context);
    return this;
  }
}

export const EventBus = new TypedEventBus();

export const registerSceneEvent = <K extends keyof EventPayloads>(
  scene: Phaser.Scene,
  event: K,
  fn: (payload: EventPayloads[K]) => void,
  context?: unknown
): void => {
  const handler = fn.bind(context || scene);
  EventBus.on(event, handler);

  scene.sys.events.once("shutdown", () => {
    EventBus.off(event, handler);
  });
  scene.sys.events.once("destroy", () => {
    EventBus.off(event, handler);
  });
};
