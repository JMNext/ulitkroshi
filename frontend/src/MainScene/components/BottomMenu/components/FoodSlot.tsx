import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { ShopModal } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ShopModal";
import { getFruitUrlByStoreId } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/constants/shop.constants";
import defaultEatIcon from "@/assets/buttom_menu-icons/eat.svg";
import NiceModal from "@ebay/nice-modal-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

const DEFAULTS: Record<string, number> = { fruit_01: 1, fruit_02: 4, fruit_03: 7, fruit_04: 11 };

const STYLES: Record<string, any> = {
  health_25: { borderColor: "#81c784", background: "linear-gradient(to bottom, #f1f5f9, #e2e8f0, #cbd5e1)", color: "#2e7d32" },
  health_50: { borderColor: "#ffd54f", background: "linear-gradient(to bottom, #f1f5f9, #e2e8f0, #cbd5e1)", color: "#f57c00" },
  health_100: { borderColor: "#f43f5e", background: "linear-gradient(to bottom, #fff1f2, #ffe4e6, #fecdd3)", color: "#e11d48" },
  exp_25: { borderColor: "#4fc3f7", background: "linear-gradient(to bottom, #f1f5f9, #e2e8f0, #cbd5e1)", color: "#0288d1" },
  exp_50: { borderColor: "#ba68c8", background: "linear-gradient(to bottom, #f1f5f9, #e2e8f0, #cbd5e1)", color: "#7b1fa2" }
};

export const FoodSlot = ({ id }: { id: string }) => {
  const { counts, cooldowns, activeIds, currentId } = usePetStore((s) => s.inventory);
  const selectFruit = usePetStore((s) => s.selectFruitId);
  const [timeLeft, setTimeLeft] = useState(0);

  const count = counts[id] ?? 0, isZero = count <= 0, isSel = currentId === id, cd = cooldowns[id] ?? 0;

  useEffect(() => {
    if (isZero || isSel || cd <= 0) return setTimeLeft(0);
    const calc = () => Math.max(0, Math.ceil((cd - Date.now()) / 1000));
    setTimeLeft(calc());
    const timer = setInterval(() => {
      const rem = calc(); setTimeLeft(rem);
      if (rem <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [cd, isZero, isSel]);

  const isCool = !isZero && !isSel && timeLeft > 0 && timeLeft <= 360;
  const fId = activeIds?.[id] || DEFAULTS[id];

  const type = id === "fruit_02" ? (Number(fId) === 9 ? "health_100" : "health_50") : id === "fruit_03" ? "exp_25" : id === "fruit_04" ? "exp_50" : "health_25";
  const style = isCool ? { borderColor: "#94a3b8" } : STYLES[type] || { borderColor: "#cbd5e1", background: "#ffffff", color: "#000000" };

  return (
    <div onClick={() => !isCool && (isZero ? NiceModal.show(ShopModal) : selectFruit(id))} style={style} className={clsx("relative box-border flex h-14 w-14 cursor-pointer touch-manipulation items-center justify-center rounded-[12px] border-[3px] border-solid transition-transform active:scale-95", isZero && "opacity-60 saturate-[0.85]", isCool && "pointer-events-none opacity-70")}>
      <img src={isSel && !isZero ? defaultEatIcon : getFruitUrlByStoreId(fId) || defaultEatIcon} className={clsx("pointer-events-none block h-11 w-11 object-contain", isZero && "opacity-40 grayscale", isCool && "opacity-30")} alt="" />
      {!(isSel && !isZero) && <span className={clsx("pointer-events-none absolute -top-1 -right-1 z-20 rounded-full px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm", isZero ? "bg-gray-400" : "bg-[#f59e0b]")}>{count}</span>}
      {isCool && (
        <div className="pointer-events-none absolute inset-x-0 bottom-1 z-10 flex items-center justify-center px-1">
          <span className="rounded-[6px] bg-black/75 px-1 py-0.5 text-[11px] leading-none font-black tracking-wider text-white shadow-sm">
            {`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
          </span>
        </div>
      )}
    </div>
  );
};
