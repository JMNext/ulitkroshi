import { SLEEP_SOUND_URL } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

let audio: HTMLAudioElement | null = null;
let last: string | null = null;
let sub = false;

export const triggerSleepingClick = () => {
  if (typeof window !== "undefined" && !sub) {
    sub = true;
    audio = new Audio(SLEEP_SOUND_URL);
    audio.loop = true;

    usePetStore.subscribe((s) => {
      if (s.currentAnim === last || !audio) return;
      last = s.currentAnim;
      if (last === "sleep_circle") audio.play().catch(() => {});
      else if (last !== "sleep_begin") { audio.pause(); audio.currentTime = 0; }
    });
  }
  usePetStore.getState().triggerSleepAction();
};
