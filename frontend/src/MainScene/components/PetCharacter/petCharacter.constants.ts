export interface VideoSources {
  mov: string;
  webm: string;
}

export interface FoodConfig {
  hpRestoreValue: number;
  restoresHp: boolean;
}

const CACHE_VERSION = "?v=94178c42";

const createVideoSource = (movPath: string, webmPath: string): VideoSources => ({
  mov: `${new URL(movPath, import.meta.url).href}${CACHE_VERSION}`,
  webm: `${new URL(webmPath, import.meta.url).href}${CACHE_VERSION}`
});

export const EAT_SOUND_URL = new URL("/src/assets/resources/sound/eat.mp3", import.meta.url).href;
export const PLAY_SOUND_URL = new URL("/src/assets/resources/sound/play.mp3", import.meta.url).href;
export const WASH_SOUND_URL = new URL("/src/assets/resources/sound/wash.mp3", import.meta.url).href;
export const SLEEP_SOUND_URL = new URL("/src/assets/resources/sound/sleep.mp3", import.meta.url).href;

const EAT_VIDEO_SOURCES = createVideoSource(
  "/src/assets/resources/1stpet-animation/eat-converted.mov",
  "/src/assets/resources/1stpet-animation/eat-converted.webm"
);

export const PET_ANIMATION_URLS: Record<string, VideoSources> = {
  wash: createVideoSource("/src/assets/resources/1stpet-animation/wash-converted.mov", "/src/assets/resources/1stpet-animation/wash-converted.webm"),
  play: createVideoSource("/src/assets/resources/1stpet-animation/play_ball.mov", "/src/assets/resources/1stpet-animation/play_ball.webm"),
  
  eat: EAT_VIDEO_SOURCES,
  eat_fruit: EAT_VIDEO_SOURCES,

  sad_state: createVideoSource("/src/assets/resources/1stpet-animation/sad_state.mov", "/src/assets/resources/1stpet-animation/sad_state.webm"),
  sleep_begin: createVideoSource("/src/assets/resources/1stpet-animation/sleep_begin.mov", "/src/assets/resources/1stpet-animation/sleep_begin.webm"),
  sleep_circle: createVideoSource("/src/assets/resources/1stpet-animation/sleep_circle.mov", "/src/assets/resources/1stpet-animation/sleep_circle.webm"),
  sleep_awake: createVideoSource("/src/assets/resources/1stpet-animation/sleep_awake.mov", "/src/assets/resources/1stpet-animation/sleep_awake.webm"),
  prostoi2: createVideoSource("/src/assets/resources/1stpet-animation/prostoi2.mov", "/src/assets/resources/1stpet-animation/prostoi2.webm"),
  prostoi1: createVideoSource("/src/assets/resources/1stpet-animation/prostoi-converted.mov", "/src/assets/resources/1stpet-animation/prostoi-converted.webm")
};

export const ACTION_ANIMATIONS: string[] = ["wash", "play", "eat", "eat_fruit"];
export const LOOPING_ANIMATIONS: string[] = ["sleep_circle", "sad_state", "prostoi1", "prostoi2"];

export const FOOD_CONFIGS: Record<string, FoodConfig> = {
  fruit_01: { hpRestoreValue: 25, restoresHp: true },
  fruit_02: { hpRestoreValue: 100, restoresHp: true },
  fruit_03: { hpRestoreValue: 0, restoresHp: false },
  fruit_04: { hpRestoreValue: 0, restoresHp: false }
};
export const DEFAULT_FOOD_CONFIG: FoodConfig = { hpRestoreValue: 25, restoresHp: true };

export const PET_LOCK_BUBBLES = {
  default: "Сначала покорми меня!",
  sleepAlert: "Сначала разбуди меня!",
  triggerCount: 5,
  funnyPhrases: [
    "ХВАТИТ ТЫКАТЬ, Я ГОЛОДНЫЙ",
    "Я ХОЧУ КУШАТЬ, А НЕ ИГРАТЬ",
    "ИГРЫ НА ПУСТОЙ ЖЕЛУДОК НЕ РАБОТАЮТ",
    "СНАЧАЛА ЕДА, ПОТОМ РАЗВЛЕЧЕНИЯ"
  ]
};
