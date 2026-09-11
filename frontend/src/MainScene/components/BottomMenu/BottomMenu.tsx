import { BTN_BG_URL, MENU_BG_URL, MENU_ITEMS } from "@/MainScene/components/BottomMenu/constants/bottomMenu.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { getFruitUrlByStoreId } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/constants/shop.constants";
import React from "react";

interface BottomMenuProps {
  styles: React.CSSProperties;
}

const FEED_ITEM_DEFAULT = MENU_ITEMS.find((i) => i.type === "feed")!;

export const BottomMenu = ({ styles }: BottomMenuProps) => {
  const { currentAnim = "", canExecuteAction, currentFruitId = "", fruitsCounts = {}, activeFruitIds = {} } = usePetStore();

  const hasFruit = currentFruitId && (fruitsCounts[currentFruitId] ?? 0) > 0;
  const activeFruitIcon =
    hasFruit && activeFruitIds[currentFruitId] ? getFruitUrlByStoreId(activeFruitIds[currentFruitId]) : FEED_ITEM_DEFAULT.icon;

  return (
    <div className="pointer-events-auto absolute left-1/2 transition-all duration-150" style={styles}>
      <div className="relative flex h-[240px] w-[1080px] items-center justify-center">
        <img src={MENU_BG_URL} className="pointer-events-none absolute inset-0 h-full w-full object-contain" alt="" />

        <div className="relative z-10 flex w-[520px] justify-between pt-[45px]" data-active-fruit-icon={activeFruitIcon}>
          {MENU_ITEMS.map(({ name, type, icon, color }) => {
            const isFeed = type === "feed";
            const isAct = currentAnim.startsWith(type) || (isFeed && currentAnim.startsWith("eat"));
            const isSelectable = canExecuteAction?.(type) || isAct;

            return (
              <div
                key={type}
                data-ui-bottom-action={canExecuteAction?.(type) ? type : undefined}
                data-ui-default-icon={icon}
                className={`flex w-[110px] cursor-pointer touch-none flex-col items-center transition-all duration-150 select-none`}
                style={{ opacity: isSelectable ? 1 : 0.4 }}
              >
                <div className="relative flex h-[95px] w-[95px] items-center justify-center transition-transform duration-100">
                  <div
                    className="pointer-events-none absolute inset-0 scale-[1.55] rounded-full transition-opacity duration-100"
                    style={{
                      background: isAct ? `radial-gradient(circle, ${color} 0%, transparent 70%)` : "none",
                      opacity: isAct ? 0.8 : 0
                    }}
                  />
                  <img src={BTN_BG_URL} className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain" alt="" />
                  <img
                    src={isFeed ? activeFruitIcon : icon}
                    className="pointer-events-none relative z-20 h-[57px] w-[57px] object-contain"
                    alt=""
                  />
                </div>
                <span className="pointer-events-none mt-2.5 text-[18px] font-black whitespace-nowrap text-[#525252]">{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
