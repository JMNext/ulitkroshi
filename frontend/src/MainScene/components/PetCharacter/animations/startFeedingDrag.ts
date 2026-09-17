import { createBaseDrag } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { DEFAULT_FOOD_CONFIG, EAT_SOUND_URL, FOOD_CONFIGS } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

const cachedEatAudio = typeof window !== "undefined" ? new Audio(EAT_SOUND_URL) : null;
if (cachedEatAudio) cachedEatAudio.volume = 0.5;

let isFeedingProcessing = false;

export const startFeedingDrag = (
  initialEvent: React.PointerEvent<HTMLDivElement> | PointerEvent,
  foodKey: string,
  fruitId?: string,
  onDragEndCallback?: () => void,
  scale = 1,
  s = 1
) => {
  if (isFeedingProcessing) {
    if (onDragEndCallback) onDragEndCallback();
    return;
  }

  createBaseDrag(
    initialEvent,
    {
      url: foodKey,
      action: "eat",
      onSuccess: () => {
        if (isFeedingProcessing) return;

        const store = usePetStore.getState();
        const config = FOOD_CONFIGS[fruitId || foodKey] || DEFAULT_FOOD_CONFIG;
        const result = fruitId
          ? store.useFruitId(fruitId, config.hpRestoreValue, config.restoresHp, false)
          : store.useFruitId("standard_food", 1, true, true);

        if (result === "FULL_HP") {
          window.dispatchEvent(
            new CustomEvent("ui_show_bubble", {
              detail: { text: "Спасибо, я сейчас не голоден!", type: "error" }
            })
          );
        } else if (result === "SUCCESS") {
          isFeedingProcessing = true;

          if (cachedEatAudio) {
            cachedEatAudio.currentTime = 0;
            cachedEatAudio.play().catch(() => {});
          }

          setTimeout(() => {
            isFeedingProcessing = false;
          }, 4550);
        }
      },
      onEnd: () => {
        if (onDragEndCallback) onDragEndCallback();
      }
    },
    scale,
    s
  );
};
