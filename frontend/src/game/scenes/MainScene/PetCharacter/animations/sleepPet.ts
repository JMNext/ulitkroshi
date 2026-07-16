import Phaser from 'phaser';
import { usePetCareStore } from '../../usePetCareStore';

export const triggerSleepingClick = (scene: Phaser.Scene) => {
  const state = usePetCareStore.getState().currentAnim;

  const snd = scene.sound as any;
  if (snd?.context?.state === 'suspended') snd.context.resume();

  if (state === 'sleep_circle') {
    scene.events.emit('character_sleep_awake');
  } else if (state === 'prostoi1' || state === 'prostoi2') {
    scene.events.emit('character_sleep_begin');
  }
};
