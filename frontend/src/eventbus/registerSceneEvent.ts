import Phaser from "phaser";
import { EventBus, EventPayloads } from "./EventBus";

export const registerSceneEvent = <K extends keyof EventPayloads>(
  scene: Phaser.Scene,
  event: K,
  fn: (payload: EventPayloads[K]) => void
) => {
  EventBus.on(event, fn, scene);

  scene.sys.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    EventBus.off(event, fn, scene);
  });
};
