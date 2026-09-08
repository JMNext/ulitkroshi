import { SLEEP_SOUND_URL } from "@/MainScene/components/PetCharacter/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

const cachedSleepAudio = typeof window !== "undefined" ? new Audio(SLEEP_SOUND_URL) : null;
if (cachedSleepAudio) {
  cachedSleepAudio.loop = true;
}

let lastAnim: string | null = null;

usePetStore.subscribe((state) => {
  const current = state.currentAnim;
  if (current === lastAnim) return;

  const previous = lastAnim;
  lastAnim = current;

  if (previous === null) return;

  if (current === "sleep_circle") {
    if (cachedSleepAudio) {
      cachedSleepAudio.play().catch(() => {});
    }
  } else if (current !== "sleep_begin" && cachedSleepAudio) {
    cachedSleepAudio.pause();
    cachedSleepAudio.currentTime = 0;
  }
});

export const triggerSleepingClick = () => {
  const { currentAnim, triggerSleepAction } = usePetStore.getState();
  
  if (["sleep_begin", "sleep_awake"].includes(currentAnim)) {
    return;
  }

  if (["sleep_circle", "prostoi1", "prostoi2", "sad_state"].includes(currentAnim)) {
    triggerSleepAction();
  }
};
