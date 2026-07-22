import Phaser from 'phaser';
import { usePetCareStore } from '../../usePetCareStore';

// Переменные для хранения ссылки на синглтон звука и контроля предыдущего состояния
let sleepSoundInstance: Phaser.Sound.BaseSound | null = null;
let lastAnimState: string = usePetCareStore.getState().currentAnim;
let isSubscribed = false;

export const triggerSleepingClick = (scene: Phaser.Scene) => {
  const store = usePetCareStore.getState();
  const state: string = store.currentAnim;

  if (scene.sound.locked) {
    scene.sound.unlock();
  }

  // Запускаем подписку с ОДНИМ аргументом (коллбэком), чтобы не было ошибок типизации Zustand
  if (!isSubscribed) {
    isSubscribed = true;
    
    usePetCareStore.subscribe((snapshot) => {
      const currentAnim = snapshot.currentAnim;
      
      // Выполняем логику только если состояние анимации РЕАЛЬНО изменилось
      if (currentAnim !== lastAnimState) {
        lastAnimState = currentAnim;

        if (currentAnim === 'sleep_circle') {
          // Если зашли в цикл сна и звук загружен в кэш Phaser под ключом 'sleep'
          if (scene.cache.audio.exists('sleep')) {
            if (!sleepSoundInstance) {
              sleepSoundInstance = scene.sound.add('sleep', { loop: true });
            }
            if (!sleepSoundInstance.isPlaying) {
              sleepSoundInstance.play();
            }
          }
        } else if (currentAnim !== 'sleep_begin') {
          // Если питомец проснулся или переключился на другое действие (но не в процессе укладывания)
          if (sleepSoundInstance && sleepSoundInstance.isPlaying) {
            sleepSoundInstance.stop();
          }
        }
      }
    });
  }

  // Базовая логика триггера экшена сна
  if (state === 'sleep_circle' || state === 'prostoi1' || state === 'prostoi2') {
    store.triggerSleepAction();
  }
};
