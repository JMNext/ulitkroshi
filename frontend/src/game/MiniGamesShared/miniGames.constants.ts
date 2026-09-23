import f01 from "@/assets/fruits/fruits_01.png"; import f02 from "@/assets/fruits/fruits_02.png";
import f03 from "@/assets/fruits/fruits_03.png"; import f04 from "@/assets/fruits/fruits_04.png";
import f05 from "@/assets/fruits/fruits_05.png"; import f06 from "@/assets/fruits/fruits_06.png";
import f07 from "@/assets/fruits/fruits_07.png"; import f08 from "@/assets/fruits/fruits_08.png";
import f09 from "@/assets/fruits/fruits_09.png"; import f10 from "@/assets/fruits/fruits_10.png";
import f11 from "@/assets/fruits/fruits_11.png"; import f12 from "@/assets/fruits/fruits_12.png";
import f13 from "@/assets/fruits/fruits_13.png"; import f14 from "@/assets/fruits/fruits_14.png";
import f15 from "@/assets/fruits/fruits_15.png"; import f16 from "@/assets/fruits/fruits_16.png";

const FRUITS_ARRAY = [f01, f02, f03, f04, f05, f06, f07, f08, f09, f10, f11, f12, f13, f14, f15, f16];

export const SHARED_GAME_ASSETS = {
  bgHoriz: new URL("@/assets/background/fon_goriz.png", import.meta.url).href,
  bgVert: new URL("@/assets/background/fon_vert.png", import.meta.url).href,
  cardShirt: new URL("@/assets/buttom_menu-icons/sleep.svg", import.meta.url).href,
  fruits: Object.fromEntries(FRUITS_ARRAY.map((f, i) => [
    `fruit_${String(i + 1).padStart(2, "0")}`,
    f
  ]))
};

export interface SharedResizeMetrics {
  paddingX: number; paddingY: number; offsetX: number; offsetY: number; ratioModifier?: boolean;
  fruitSize?: number; petSize?: number; bottomOffset?: number;
}

export const getSharedGameResizeMetrics = (w: number, h: number, isPort: boolean, gameKey?: "catch" | "memory" | "snake" | "racing"): SharedResizeMetrics => {
  const r = w / h;

  if (gameKey === "catch") {
    if (isPort) {
      return r < 0.42
        ? { paddingX: 20, paddingY: 240, offsetX: 0, offsetY: -20, fruitSize: 44, petSize: 140, bottomOffset: 65 }
        : r < 0.46
          ? { paddingX: 30, paddingY: 230, offsetX: 0, offsetY: -20, fruitSize: 52, petSize: 180, bottomOffset: 55 }
          : { paddingX: 40, paddingY: 220, offsetX: 0, offsetY: -20, fruitSize: 58, petSize: 210, bottomOffset: 50 };
    }
    return { paddingX: w < 960 ? 100 : 140, paddingY: w < 960 ? 60 : 90, offsetX: 0, offsetY: 0, fruitSize: w < 960 ? 46 : 64, petSize: w < 960 ? 140 : 260, bottomOffset: w < 960 ? 12 : 25 };
  }

  if (isPort) {
    return r < 0.42 ? { paddingX: 20, paddingY: 240, offsetX: 0, offsetY: -20 } : r < 0.46 ? { paddingX: 30, paddingY: 230, offsetX: 0, offsetY: -20 } : { paddingX: 40, paddingY: 220, offsetX: 0, offsetY: -20 };
  }
  return { paddingX: w < 960 ? 100 : 140, paddingY: w < 960 ? 60 : 90, offsetX: 0, offsetY: 0, ratioModifier: r < 1.6 };
};
