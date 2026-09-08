export interface VideoSources {
  mov: string;
  webm: string;
}

export interface FoodConfig {
  hpRestoreValue: number;
  restoresHp: boolean;
}

const CACHE_VERSION = "94178c42";

const formatUrl = (url: string): string => {
  const u = new URL(url);
  u.searchParams.set("v", CACHE_VERSION);
  return u.href;
};

export const EAT_SOUND_URL = formatUrl(new URL("/src/assets/resources/sound/eat.mp3", import.meta.url).href);
export const PLAY_SOUND_URL = formatUrl(new URL("/src/assets/resources/sound/play.mp3", import.meta.url).href);
export const WASH_SOUND_URL = formatUrl(new URL("/src/assets/resources/sound/wash.mp3", import.meta.url).href);
export const SLEEP_SOUND_URL = formatUrl(new URL("/src/assets/resources/sound/sleep.mp3", import.meta.url).href);

const EAT_VIDEO_SOURCES: VideoSources = {
  mov: formatUrl(new URL("/src/assets/resources/1stpet-animation/eat-converted.mov", import.meta.url).href),
  webm: formatUrl(new URL("/src/assets/resources/1stpet-animation/eat-converted.webm", import.meta.url).href)
};

export const PET_ANIMATION_URLS: Record<string, VideoSources> = {
  wash: {
    mov: formatUrl(new URL("/src/assets/resources/1stpet-animation/wash-converted.mov", import.meta.url).href),
    webm: formatUrl(new URL("/src/assets/resources/1stpet-animation/wash-converted.webm", import.meta.url).href)
  },
  play: {
    mov: formatUrl(new URL("/src/assets/resources/1stpet-animation/play_ball.mov", import.meta.url).href),
    webm: formatUrl(new URL("/src/assets/resources/1stpet-animation/play_ball.webm", import.meta.url).href)
  },
  
  eat: EAT_VIDEO_SOURCES,
  eat_fruit: EAT_VIDEO_SOURCES,

  sad_state: {
    mov: formatUrl(new URL("/src/assets/resources/1stpet-animation/sad_state.mov", import.meta.url).href),
    webm: formatUrl(new URL("/src/assets/resources/1stpet-animation/sad_state.webm", import.meta.url).href)
  },
  sleep_begin: {
    mov: formatUrl(new URL("/src/assets/resources/1stpet-animation/sleep_begin.mov", import.meta.url).href),
    webm: formatUrl(new URL("/src/assets/resources/1stpet-animation/sleep_begin.webm", import.meta.url).href)
  },
  sleep_circle: {
    mov: formatUrl(new URL("/src/assets/resources/1stpet-animation/sleep_circle.mov", import.meta.url).href),
    webm: formatUrl(new URL("/src/assets/resources/1stpet-animation/sleep_circle.webm", import.meta.url).href)
  },
  sleep_awake: {
    mov: formatUrl(new URL("/src/assets/resources/1stpet-animation/sleep_awake.mov", import.meta.url).href),
    webm: formatUrl(new URL("/src/assets/resources/1stpet-animation/sleep_awake.webm", import.meta.url).href)
  },
  prostoi2: {
    mov: formatUrl(new URL("/src/assets/resources/1stpet-animation/prostoi2.mov", import.meta.url).href),
    webm: formatUrl(new URL("/src/assets/resources/1stpet-animation/prostoi2.webm", import.meta.url).href)
  },
  prostoi1: {
    mov: formatUrl(new URL("/src/assets/resources/1stpet-animation/prostoi-converted.mov", import.meta.url).href),
    webm: formatUrl(new URL("/src/assets/resources/1stpet-animation/prostoi-converted.webm", import.meta.url).href)
  }
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
