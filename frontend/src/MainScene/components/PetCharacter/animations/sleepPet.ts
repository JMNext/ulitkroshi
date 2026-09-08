import { SLEEP_SOUND_URL } from "@/MainScene/components/PetCharacter/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

let sleepAudio: HTMLAudioElement | null = null;
let lastAnim: string | null = null;

usePetStore.subscribe((state) => {
  const current = state.currentAnim;
  if (current === lastAnim) return;

  const previous = lastAnim;
  lastAnim = current;

  if (previous === null) return;

  if (current === "sleep_circle") {
    if (!sleepAudio) {
      sleepAudio = new Audio(SLEEP_SOUND_URL);
      sleepAudio.loop = true;
    }
    sleepAudio.play().catch(() => {});
  } else if (current !== "sleep_begin" && sleepAudio) {
    sleepAudio.pause();
    sleepAudio.currentTime = 0;
  }
});

export const triggerSleepingClick = () => {
  const { currentAnim, triggerSleepAction } = usePetStore.getState();
  
  if (["sleep_circle", "prostoi1", "prostoi2", "sad_state"].includes(currentAnim)) {
    triggerSleepAction();
  }
};
