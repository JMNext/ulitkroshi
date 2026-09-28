import { sleepPet } from "./sleepPet";
import { startFeedingDrag } from "@/MainScene/components/PetCharacter/animations/startFeedingDrag";
import { startPlayingDrag } from "@/MainScene/components/PetCharacter/animations/startPlayingDrag";
import { startWashingDrag } from "@/MainScene/components/PetCharacter/animations/startWashingDrag";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { getFruitUrlByStoreId } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/constants/shop.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { PET_LOCK_BUBBLES } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";

export type CareActionType = "wash" | "play" | "feed" | "sleep";
export interface BaseDragConfig { url: string; action: "wash" | "play" | "eat"; onSuccess: () => void; onEnd?: () => void; }

const METHODS = { play: startPlayingDrag, wash: startWashingDrag } as const;
const dist = (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x1 - x2, y1 - y2);

const getRandomBuffPhrase = () => {
  const list = PET_LOCK_BUBBLES.buffActivePhrases || [];
  return list[Math.floor(Math.random() * list.length)] || "Я уже чистый!";
};

export const handleCareActionDown = (type: CareActionType, def: string, act: string, scale: number, s: number, e: any) => {
  const pStore = usePetStore.getState(), gStore = useMainGameStore.getState();
  if (!pStore.canExecuteAction(type)) return;
  if (type === "sleep") return sleepPet();

  if (type === "feed") {
    e.stopPropagation();
    const { inventory } = pStore, fId = inventory.currentId, has = fId && (inventory.counts[fId] ?? 0) > 0;
    const sX = e.nativeEvent.clientX, sY = e.nativeEvent.clientY, icon = has ? act || def : def;
    let dragged = false;

    const move = (me: PointerEvent) => {
      if (!dragged && dist(me.clientX, me.clientY, sX, sY) > 10) { dragged = true; clean(); startFeedingDrag(e.nativeEvent, icon, has ? fId : undefined, undefined, scale, s); }
    };
    const up = (ue: PointerEvent) => { clean(); if (!dragged && dist(ue.clientX, ue.clientY, sX, sY) <= 10) gStore.setIsFoodOpen((p) => !p); };
    const clean = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    return;
  }

  const drag = METHODS[type as keyof typeof METHODS];
  if (drag) { e.stopPropagation(); drag(e.nativeEvent, def, undefined, scale, s); }
};

export const handleFruitActionDown = (id: string, isZero: boolean, scale: number, s = 1, e: PointerEvent) => {
  const gStore = useMainGameStore.getState();
  if (isZero) return gStore.setModal("shop");
  gStore.setIsFoodOpen(false);
  startFeedingDrag(e, getFruitUrlByStoreId(usePetStore.getState().inventory.activeIds[id] ?? 1) || "", id, undefined, scale, s);
};

export const createBaseDrag = (ie: any, config: BaseDragConfig, scale = 1, s = 1): void => {
  const pStore = usePetStore.getState();
  if (!["prostoi1", "prostoi2", "sad_state"].includes(pStore.currentAnim)) return config.onEnd?.();

  const target = ie.target as HTMLElement, ev = "nativeEvent" in ie ? ie.nativeEvent : ie;
  if (target?.setPointerCapture && ev.pointerId !== undefined) try { target.setPointerCapture(ev.pointerId); } catch {}

  const ratio = window.innerWidth / window.innerHeight;
  const isPortrait = ratio < 1;

  // Базовый адаптивный размер рассчитывается от меньшей стороны текущего вьюпорта
  const baseSize = isPortrait ? window.innerWidth * 0.15 : window.innerHeight * 0.15;
  const finalSize = baseSize * scale * s;

  // Динамический радиус попадания в питомца соразмерно экрану
  const conf = ratio >= 1 ? { r: 140 } : ratio < 0.42 ? { r: 75 } : { r: 110 };

  const rect = document.getElementById("phaser-native-html-pet")?.getBoundingClientRect();
  const tx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2, ty = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

  const ghost = document.createElement("div");
  ghost.className = "fixed top-0 left-0 pointer-events-none z-50 [will-change:transform]";
  ghost.style.width = `${finalSize}px`;
  ghost.style.height = `${finalSize}px`;

  const sync = (x: number, y: number) => { ghost.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`; };
  sync(ev.clientX, ev.clientY);

  const img = document.createElement("img");
  img.src = config.url; img.className = "w-full h-full object-contain block";
  ghost.appendChild(img); document.body.appendChild(ghost);

  let active = true;
  const move = (e: PointerEvent) => active && sync(e.clientX, e.clientY);
  const up = (e: PointerEvent) => {
    if (!active) return;
    active = false;
    window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
    if (target?.releasePointerCapture && e.pointerId !== undefined) try { target.releasePointerCapture(e.pointerId); } catch {}
    ghost.remove();

    if (dist(e.clientX, e.clientY, tx, ty) <= conf.r) {
      if (config.action === "wash" && Date.now() < pStore.buffUntil) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text: getRandomBuffPhrase() } }));
        }
        config.onEnd?.();
        return;
      }
      if (config.action !== "eat") pStore.triggerCareAction(config.action);
      config.onSuccess();
    }
    config.onEnd?.();
  };

  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerup", up, { passive: true });
};
