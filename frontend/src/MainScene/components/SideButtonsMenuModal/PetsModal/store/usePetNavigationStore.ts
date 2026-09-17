import { create } from "zustand";

interface PetNavigationState {
  currentIndex: number;
  touchStartX: number;
  lastScrollTime: number;
  isDragging: boolean;
  init: (activeIndex: number) => void;
  handlePrev: () => void;
  handleNext: () => void;
  onDragStart: (x: number) => void;
  onDragMove: (x: number) => void;
  handleWheel: (e: React.WheelEvent) => void;
}

export const usePetNavigationStore = create<PetNavigationState>((set, get) => {
  const isThrottled = () => {
    const now = Date.now();
    if (now - get().lastScrollTime <= 220) return true;
    set({ lastScrollTime: now });
    return false;
  };

  return {
    currentIndex: 0,
    touchStartX: 0,
    lastScrollTime: 0,
    isDragging: false,

    init: (activeIndex) => set({ currentIndex: activeIndex, isDragging: false }),

    handlePrev: () => {
      if (!isThrottled()) {
        set((s) => ({ currentIndex: (s.currentIndex + 19) % 20 }));
      }
    },

    handleNext: () => {
      if (!isThrottled()) {
        set((s) => ({ currentIndex: (s.currentIndex + 1) % 20 }));
      }
    },

    onDragStart: (x) => set({ touchStartX: x, isDragging: true }),

    onDragMove: (x) => {
      const { isDragging, touchStartX, handleNext, handlePrev } = get();
      if (!isDragging) return;

      const diff = touchStartX - x;
      if (Math.abs(diff) > 50) {
        if (diff > 0) handleNext();
        else handlePrev();
        set({ isDragging: false });
      }
    },

    handleWheel: (e) => {
      // Объединили избыточные вложенные условия и Math.abs проверки в одну строчку
      const delta = e.deltaX || e.deltaY;
      if (Math.abs(delta) > 10) {
        if (delta > 0) get().handleNext();
        else get().handlePrev();
      }
    }
  };
});
