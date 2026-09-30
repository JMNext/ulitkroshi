/**
 * petAssetLoader.ts — Динамическая загрузка ассетов персонажа по стадии.
 *
 * Структура каталогов:
 *   assets/pets/<petId>/<stage>/<animation>.<ext>
 *
 * Пример: assets/pets/snail-01/teen/idle.webm
 *
 * Fallback: если ассет для стадии не найден — возвращает teen-версию.
 * После появления уникальных Baby/Adult ассетов — просто добавить файлы в нужные папки.
 */

import { PetStage } from './growth.config';

/** Имена анимаций (английские, без транслитерации) */
export type AnimationName =
  | 'idle'
  | 'idle-alt'
  | 'eat'
  | 'play'
  | 'wash'
  | 'sleep-begin'
  | 'sleep-loop'
  | 'sleep-wake'
  | 'happy'
  | 'sad';

/**
 * Маппинг устаревших имён анимаций (prostoi, sad_state) на новые.
 * Используется для плавного перехода без рефакторинга всего кода разом.
 */
export const LEGACY_ANIM_MAP: Record<string, AnimationName> = {
  prostoi1:     'idle',
  prostoi2:     'idle-alt',
  eat:          'eat',
  play:         'play',
  wash:         'wash',
  sleep_begin:  'sleep-begin',
  sleep_circle: 'sleep-loop',
  sleep_awake:  'sleep-wake',
  happy:        'happy',
  sad_state:    'sad',
};

/** Первый персонаж */
export const PET_ID_FIRST = 'snail-01';

/** Получить URL анимации по стадии */
export interface PetAnimUrls {
  mov: string;
  webm: string;
}

/**
 * Возвращает объект { mov, webm } для данного персонажа, стадии и анимации.
 * Импортирует через динамические import.meta.url (Vite-совместимо).
 */
export function getPetAnimationUrls(
  petId: string,
  stage: PetStage,
  animation: AnimationName
): PetAnimUrls {
  const base = `/src/assets/pets/${petId}/${stage}/${animation}`;
  return {
    mov:  `${base}.mov`,
    webm: `${base}.webm`,
  };
}

/**
 * Нормализует имя анимации: если передано устаревшее имя — возвращает новое.
 */
export function normalizeAnimName(anim: string): AnimationName {
  return LEGACY_ANIM_MAP[anim] ?? (anim as AnimationName);
}
