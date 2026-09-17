export interface VideoSources { mov: string; webm: string; }
export interface FoodConfig { hpRestoreValue: number; restoresHp: boolean; }
const formatUrl = (p: string) => new URL(p, import.meta.url).href;
export const EAT_SOUND_URL = formatUrl("/src/assets/resources/sound/eat.mp3");
export const PLAY_SOUND_URL = formatUrl("/src/assets/resources/sound/play.mp3");
export const WASH_SOUND_URL = formatUrl("/src/assets/resources/sound/wash.mp3");
export const SLEEP_SOUND_URL = formatUrl("/src/assets/resources/sound/sleep.mp3");
export const PET_ANIMATION_URLS: Record<string, VideoSources> = {
  wash: { mov: formatUrl("/src/assets/resources/1stpet-animation/wash-converted.mov"), webm: formatUrl("/src/assets/resources/1stpet-animation/wash-converted.webm") },
  play: { mov: formatUrl("/src/assets/resources/1stpet-animation/play_ball.mov"), webm: formatUrl("/src/assets/resources/1stpet-animation/play_ball.webm") },
  eat: { mov: formatUrl("/src/assets/resources/1stpet-animation/eat-converted.mov"), webm: formatUrl("/src/assets/resources/1stpet-animation/eat-converted.webm") },
  sad_state: { mov: formatUrl("/src/assets/resources/1stpet-animation/sad_state.mov"), webm: formatUrl("/src/assets/resources/1stpet-animation/sad_state.webm") },
  sleep_begin: { mov: formatUrl("/src/assets/resources/1stpet-animation/sleep_begin.mov"), webm: formatUrl("/src/assets/resources/1stpet-animation/sleep_begin.webm") },
  sleep_circle: { mov: formatUrl("/src/assets/resources/1stpet-animation/sleep_circle.mov"), webm: formatUrl("/src/assets/resources/1stpet-animation/sleep_circle.webm") },
  sleep_awake: { mov: formatUrl("/src/assets/resources/1stpet-animation/sleep_awake.mov"), webm: formatUrl("/src/assets/resources/1stpet-animation/sleep_awake.webm") },
  prostoi2: { mov: formatUrl("/src/assets/resources/1stpet-animation/prostoi2.mov"), webm: formatUrl("/src/assets/resources/1stpet-animation/prostoi2.webm") },
  prostoi1: { mov: formatUrl("/src/assets/resources/1stpet-animation/prostoi-converted.mov"), webm: formatUrl("/src/assets/resources/1stpet-animation/prostoi-converted.webm") }
};
export const ACTION_ANIMATIONS = ["wash", "play", "eat"];
export const LOOPING_ANIMATIONS = ["sleep_circle", "sad_state", "prostoi1", "prostoi2"];
export const FOOD_CONFIGS: Record<string, FoodConfig> = {
  fruit_01: { hpRestoreValue: 25, restoresHp: true },
  fruit_02: { hpRestoreValue: 100, restoresHp: true },
  fruit_03: { hpRestoreValue: 0, restoresHp: false },
  fruit_04: { hpRestoreValue: 0, restoresHp: false }
};
export const DEFAULT_FOOD_CONFIG = { hpRestoreValue: 25, restoresHp: true };
export const PET_LOCK_BUBBLES = {
  default: "Сначала покорми меня!",
  sleepAlert: "Сначала разбуди меня!",
  triggerCount: 5,
  funnyPhrases: ["ХВАТИТ ТЫКАТЬ, Я ГОЛОДНЫЙ", "Я ХОЧУ КУШАТЬ, А НЕ ИГРАТЬ", "ИГРЫ НА ПУСТОЙ ЖЕЛУДОК НЕ РАБОТАЮТ", "СНАЧАЛА ЕДА, ПОТОМ РАЗВЛЕЧЕНИЯ"]
};
