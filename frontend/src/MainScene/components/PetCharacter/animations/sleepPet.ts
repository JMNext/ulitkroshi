import { SLEEP_SOUND_URL } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

const cachedSleepAudio = typeof window !== "undefined" ? new Audio(SLEEP_SOUND_URL) : null;
if (cachedSleepAudio) cachedSleepAudio.loop = true;

let lastAnim: string | null = null;

usePetStore.subscribe((state) => {
  const current = state.currentAnim;
  if (current === lastAnim) return;

  lastAnim = current;

  if (cachedSleepAudio) {
    if (current === "sleep_circle") {
      cachedSleepAudio.play().catch(() => {});
    } else if (current !== "sleep_begin") {
      cachedSleepAudio.pause();
      cachedSleepAudio.currentTime = 0;
    }
  }
});

export const triggerSleepingClick = () => {
  usePetStore.getState().triggerSleepAction();
};
