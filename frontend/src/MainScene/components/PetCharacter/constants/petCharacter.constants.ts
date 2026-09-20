import eatSound from "@/assets/resources/sound/eat.mp3";
import playSound from "@/assets/resources/sound/play.mp3";
import washSound from "@/assets/resources/sound/wash.mp3";
import sleepSound from "@/assets/resources/sound/sleep.mp3";

import washMov from "@/assets/resources/1stpet-animation/wash-converted.mov";
import washWebm from "@/assets/resources/1stpet-animation/wash-converted.webm";

import playMov from "@/assets/resources/1stpet-animation/play_ball.mov";
import playWebm from "@/assets/resources/1stpet-animation/play_ball.webm";

import eatMov from "@/assets/resources/1stpet-animation/eat-converted.mov";
import eatWebm from "@/assets/resources/1stpet-animation/eat-converted.webm";

import sadMov from "@/assets/resources/1stpet-animation/sad_state.mov";
import sadWebm from "@/assets/resources/1stpet-animation/sad_state.webm";

import sleepBeginMov from "@/assets/resources/1stpet-animation/sleep_begin.mov";
import sleepBeginWebm from "@/assets/resources/1stpet-animation/sleep_begin.webm";

import sleepCircleMov from "@/assets/resources/1stpet-animation/sleep_circle.mov";
import sleepCircleWebm from "@/assets/resources/1stpet-animation/sleep_circle.webm";

import sleepAwakeMov from "@/assets/resources/1stpet-animation/sleep_awake.mov";
import sleepAwakeWebm from "@/assets/resources/1stpet-animation/sleep_awake.webm";

import prostoi2Mov from "@/assets/resources/1stpet-animation/prostoi2.mov";
import prostoi2Webm from "@/assets/resources/1stpet-animation/prostoi2.webm";

import prostoi1Mov from "@/assets/resources/1stpet-animation/prostoi-converted.mov";
import prostoi1Webm from "@/assets/resources/1stpet-animation/prostoi-converted.webm";

export interface VideoSources { mov: string; webm: string; }
export interface FoodConfig { hpRestoreValue: number; restoresHp: boolean; }

export const EAT_SOUND_URL = eatSound;
export const PLAY_SOUND_URL = playSound;
export const WASH_SOUND_URL = washSound;
export const SLEEP_SOUND_URL = sleepSound;

export const PET_ANIMATION_URLS: Record<string, VideoSources> = {
  wash: { mov: washMov, webm: washWebm },
  play: { mov: playMov, webm: playWebm },
  eat: { mov: eatMov, webm: eatWebm },
  sad_state: { mov: sadMov, webm: sadWebm },
  sleep_begin: { mov: sleepBeginMov, webm: sleepBeginWebm },
  sleep_circle: { mov: sleepCircleMov, webm: sleepCircleWebm },
  sleep_awake: { mov: sleepAwakeMov, webm: sleepAwakeWebm },
  prostoi2: { mov: prostoi2Mov, webm: prostoi2Webm },
  prostoi1: { mov: prostoi1Mov, webm: prostoi1Webm }
};

export const ACTION_ANIMATIONS = ["wash", "play", "eat"];
export const LOOPING_ANIMATIONS = ["sleep_circle", "sad_state", "prostoi1", "prostoi2"];

export const FOOD_CONFIGS: Record<string, FoodConfig> = {
  fruit_01: { hpRestoreValue: 25, restoresHp: true },
  fruit_02: { hpRestoreValue: 50, restoresHp: true },
  fruit_03: { hpRestoreValue: 0, restoresHp: false },
  fruit_04: { hpRestoreValue: 0, restoresHp: false }
};

export const DEFAULT_FOOD_CONFIG = { hpRestoreValue: 25, restoresHp: true };

export const PET_LOCK_BUBBLES = {
  default: "Сначала покорми меня!",
  sleepAlert: "Сначала разбуди меня!",
  triggerCount: 5,
  funnyPhrases: [
    "ХВАТИТ ТЫКАТЬ, Я ГОЛОДНЫЙ",
    "Я ХОЧУ КУШАТЬ, А НЕ ИГРАТЬ",
    "ИГРЫ НА ПУСТОЙ ЖЕЛУДОК НЕ РАБОТАЮТ",
    "СНАЧАЛА ЕДА, ПОТОМ РАЗВЛЕЧЕНИЯ"
  ],
  fullHpStorePhrase: "Я не хочу это есть! Покорми меня обычной едой."
};
