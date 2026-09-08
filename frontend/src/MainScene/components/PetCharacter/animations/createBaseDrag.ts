import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { startFeedingDrag } from "@/MainScene/components/PetCharacter/animations/startFeedingDrag";
import { startPlayingDrag } from "@/MainScene/components/PetCharacter/animations/startPlayingDrag";
import { startWashingDrag } from "@/MainScene/components/PetCharacter/animations/startWashingDrag";
import { triggerSleepingClick } from "@/MainScene/components/PetCharacter/animations/sleepPet";
import { getFruitUrlByStoreId } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/shop.constants";

export type CareActionType = "wash" | "play" | "feed" | "sleep";

export interface BaseDragConfig {
  url: string;
  action: "wash" | "play" | "eat";
  onSuccess: () => void;
  onEnd?: () => void;
}

const DRAG_METHODS = { play: startPlayingDrag, wash: startWashingDrag } as const;

export const handleCareActionDown = (
  type: CareActionType,
  btn: HTMLElement,
  scale: number,
  s: number,
  e: PointerEvent
) => {
  const petStore = usePetStore.getState();
  const gameStore = useMainGameStore.getState();

  if (!petStore.canExecuteAction(type)) return;
  if (type === "sleep") return triggerSleepingClick();

  const defIcon = btn.getAttribute("data-ui-default-icon") || "";

  if (type === "feed") {
    const { currentFruitId: fId, fruitsCounts: fCounts } = petStore;
    const hasFruit = fId && (fCounts?.[fId] ?? 0) > 0;
    const startX = e.clientX, startY = e.clientY;

    const icon = hasFruit ? (btn.parentElement?.getAttribute("data-active-fruit-icon") || defIcon) : defIcon;
    const targetId = hasFruit ? fId : undefined;

    const handlePointerMove = (me: PointerEvent) => {
      if (Math.hypot(me.clientX - startX, me.clientY - startY) > 10) {
        cleanup();
        startFeedingDrag(e, icon, targetId, undefined, scale, s);
      }
    };

    const handlePointerUp = (ue: PointerEvent) => {
      cleanup();
      if (Math.hypot(ue.clientX - startX, ue.clientY - startY) <= 10) {
        gameStore.setIsFoodOpen((p) => !p);
      }
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return;
  }

  const drag = DRAG_METHODS[type as keyof typeof DRAG_METHODS];
  if (drag) drag(e, defIcon, undefined, scale, s);
};

export const handleFruitActionDown = (id: string, isZero: boolean, scale: number, s: number, e: PointerEvent) => {
  const gameStore = useMainGameStore.getState();
  if (isZero) return gameStore.setModal("shop");

  const petStore = usePetStore.getState();
  const iconUrl = getFruitUrlByStoreId(petStore.activeFruitIds[id] ?? 1) || "";

  gameStore.setIsFoodOpen(false);
  startFeedingDrag(e, iconUrl, id, undefined, scale, s);
};

export const createBaseDrag = (
  ie: React.PointerEvent<HTMLDivElement> | PointerEvent,
  config: BaseDragConfig,
  scale = 1,
  s = 1
): void => {
  if (!["prostoi1", "prostoi2", "sad_state"].includes(usePetStore.getState().currentAnim ?? "prostoi1")) {
    return config.onEnd?.();
  }

  const ratio = window.innerWidth / window.innerHeight;
  const mode = ratio < 1 ? (ratio < 0.42 ? "u" : "v") : "d";
  const conf = { u: { c: "w-12 h-12", r: 75 }, v: { c: "w-14 h-14", r: 110 }, d: { c: "w-20 h-20", r: 140 } }[mode];

  const ghost = document.createElement("div");
  ghost.className = `fixed top-0 left-0 pointer-events-none ${conf.c} z-50 [will-change:transform]`;
  
  const updateTransform = (x: number, y: number) => {
    ghost.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale * s})`;
  };
  updateTransform(ie.clientX, ie.clientY);

  const img = document.createElement("img");
  img.src = config.url;
  img.className = "w-full h-full object-contain block";
  ghost.appendChild(img);
  document.body.appendChild(ghost);

  const handleDragMove = (e: PointerEvent) => updateTransform(e.clientX, e.clientY);
  const handleDragUp = (e: PointerEvent) => {
    window.removeEventListener("pointermove", handleDragMove);
    window.removeEventListener("pointerup", handleDragUp);
    ghost.remove();

    const rect = document.getElementById("phaser-native-html-pet")?.getBoundingClientRect();
    if (rect && Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2)) <= conf.r) {
      config.onSuccess();
    }
    config.onEnd?.();
  };

  window.addEventListener("pointermove", handleDragMove);
  window.addEventListener("pointerup", handleDragUp);
};
