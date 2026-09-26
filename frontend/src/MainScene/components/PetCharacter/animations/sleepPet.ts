import { SLEEP_SOUND_URL } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

let audio: HTMLAudioElement | null = null;
let isSubscribed = false;

export const sleepPet = () => {
  if (typeof window !== "undefined") {
    if (!audio) {
      audio = new Audio(SLEEP_SOUND_URL);
      audio.loop = true;
    }

    const currentAnim = usePetStore.getState().currentAnim;
    const isSleepingNow = ["sleep_begin", "sleep_circle"].includes(currentAnim);

    if (!isSleepingNow) {
      audio.play().then(() => { if (audio) audio.pause(); }).catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    if (!isSubscribed) {
      isSubscribed = true;

      usePetStore.subscribe((state) => {
        if (!audio) return;

        if (state.currentAnim === "sleep_circle") {
          if (audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
          }
        } else if (state.currentAnim !== "sleep_begin") {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        }
      });
    }
  }

  usePetStore.getState().triggerSleepAction();
};
