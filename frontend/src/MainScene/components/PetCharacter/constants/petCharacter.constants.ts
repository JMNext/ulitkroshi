import eatSound from "@/assets/resources/sound/eat.mp3";
import playSound from "@/assets/resources/sound/play.mp3";
import sleepSound from "@/assets/resources/sound/sleep.mp3";
import washSound from "@/assets/resources/sound/wash.mp3";

// Анимации текущего персонажа (Стадия Teen)
// После появления Baby/Adult ассетов — переключение через petAssetLoader.ts
import washMov       from "@/assets/pets/snail-01/teen/wash.mov";
import washWebm      from "@/assets/pets/snail-01/teen/wash.webm";

import playMov       from "@/assets/pets/snail-01/teen/play.mov";
import playWebm      from "@/assets/pets/snail-01/teen/play.webm";

import eatMov        from "@/assets/pets/snail-01/teen/eat.mov";
import eatWebm       from "@/assets/pets/snail-01/teen/eat.webm";

import sadMov        from "@/assets/pets/snail-01/teen/sad.mov";
import sadWebm       from "@/assets/pets/snail-01/teen/sad.webm";

import sleepBeginMov  from "@/assets/pets/snail-01/teen/sleep-begin.mov";
import sleepBeginWebm from "@/assets/pets/snail-01/teen/sleep-begin.webm";

import sleepCircleMov  from "@/assets/pets/snail-01/teen/sleep-loop.mov";
import sleepCircleWebm from "@/assets/pets/snail-01/teen/sleep-loop.webm";

import sleepAwakeMov  from "@/assets/pets/snail-01/teen/sleep-wake.mov";
import sleepAwakeWebm from "@/assets/pets/snail-01/teen/sleep-wake.webm";

import prostoi2Mov  from "@/assets/pets/snail-01/teen/idle-alt.mov";
import prostoi2Webm from "@/assets/pets/snail-01/teen/idle-alt.webm";

import prostoi1Mov  from "@/assets/pets/snail-01/teen/idle.mov";
import prostoi1Webm from "@/assets/pets/snail-01/teen/idle.webm";

export interface VideoSources {
  mov: string;
  webm: string;
}
export interface FoodConfig {
  hpRestoreValue: number;
  restoresHp: boolean;
}

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
  sadPlayAlert: "Мне грустно, я не хочу играть в большие игры... Поиграй со мной в мячик!",
  buffActivePhrases: [
    "Я уже чистый и вкусно пахну!",
    "Не нужно меня мыть, я полон сил и энергии!",
    "Я сейчас не хочу мыться, мне и так отлично!",
    "Куда еще мыться? Я и так сверкаю!",
    "Я бодр и свеж, давай лучше займемся чем-то другим!"
  ],
  triggerCount: 5,
  funnyPhrases: [
    "ХВАТИТ ТЫКАТЬ, Я ГОЛОДНЫЙ",
    "Я ХОЧУ КУШАТЬ, А НЕ ИГРАТЬ",
    "ИГРЫ НА ПУСТОЙ ЖЕЛУДОК НЕ РАБОТАЮТ",
    "СНАЧАЛА ЕДА, ПОТОМ РАЗВЛЕЧЕНИЯ"
  ],
  sadPhrases: [
    "Я сейчас не хочу играть в сложные игры... Давай во что-нибудь попроще!",
    "Я так устал, мне бы помыться или получить заряд бодрости...",
    "Настроение на нулях, сложные игры не поднимут его. Давай покатаем мячик!",
    "Мне грустно для больших игр. Освежи меня или поиграй со мной с нижней панели!"
  ],
  fullHpStorePhrase: "Я не хочу это! Покорми меня обычной едой."
};
