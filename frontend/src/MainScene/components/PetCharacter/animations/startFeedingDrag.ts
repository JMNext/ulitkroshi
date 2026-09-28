import { createBaseDrag } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { EAT_SOUND_URL, PET_LOCK_BUBBLES } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { DYNAMIC_BOOSTS } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/constants/shop.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";

let audio: HTMLAudioElement | null = null;
let isFeeding = false;
let alertTimer: any = null;

const showAlert = () => {
  const store = useMainGameStore.getState(), msg = PET_LOCK_BUBBLES.fullHpStorePhrase;
  if (typeof store.setAlertText === "function") {
    if (alertTimer) clearTimeout(alertTimer);
    store.setAlertText(msg);
    alertTimer = setTimeout(() => store.setAlertText(null), 3000);
  } else window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text: msg, type: "error" } }));
};

export const startFeedingDrag = (e: any, foodKey: string, fruitId?: string, onEnd?: () => void, scale = 1, s = 1) => {
  if (typeof window !== "undefined" && !audio) { audio = new Audio(EAT_SOUND_URL); audio.volume = 0.5; }
  if (isFeeding) return onEnd?.();

  const store = usePetStore.getState();
  let hpVal = 25, isHp = true;

  if (fruitId) {
    const item = DYNAMIC_BOOSTS.find((b) => b.id === Number(store.inventory?.activeIds?.[fruitId]));
    if (item) { isHp = item.type.startsWith("health"); const m = item.type.match(/\d+/); hpVal = m ? Number(m) : 25; }
  }

  createBaseDrag(e, {
    url: foodKey, action: "eat",
    onSuccess: () => {
      if (isFeeding) return;
      const sState = usePetStore.getState();

      if (fruitId && sState.hp >= 100 && isHp) { showAlert(); return onEnd?.(); }

      const res = fruitId ? sState.useFruitId(fruitId, hpVal, isHp, false) : sState.useFruitId("standard_food", 1, true, true);

      if (res === "FULL_HP") showAlert();
      else if (res === "SUCCESS") {
        isFeeding = true; sState.triggerCareAction("eat"); sState.playVideo?.("eat");
        if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
        setTimeout(() => isFeeding = false, 4550);
      }
      onEnd?.();
    },
    onEnd: () => onEnd?.()
  }, scale, s);
};
