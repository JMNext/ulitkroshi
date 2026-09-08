export const SNAKE_ASSETS = {
  bgHoriz: new URL("@/assets/background/fon_goriz.png", import.meta.url).href,
  bgVert: new URL("@/assets/background/fon_vert.png", import.meta.url).href,
  fruits: {
    fruit_01: new URL("@/assets/fruits/fruits_01.png", import.meta.url).href,
    fruit_02: new URL("@/assets/fruits/fruits_02.png", import.meta.url).href,
    fruit_03: new URL("@/assets/fruits/fruits_03.png", import.meta.url).href,
    fruit_04: new URL("@/assets/fruits/fruits_04.png", import.meta.url).href,
    fruit_05: new URL("@/assets/fruits/fruits_05.png", import.meta.url).href,
    fruit_06: new URL("@/assets/fruits/fruits_06.png", import.meta.url).href,
    fruit_07: new URL("@/assets/fruits/fruits_07.png", import.meta.url).href,
    fruit_08: new URL("@/assets/fruits/fruits_08.png", import.meta.url).href,
    fruit_09: new URL("@/assets/fruits/fruits_09.png", import.meta.url).href,
    fruit_10: new URL("@/assets/fruits/fruits_10.png", import.meta.url).href,
    fruit_11: new URL("@/assets/fruits/fruits_11.png", import.meta.url).href,
    fruit_12: new URL("@/assets/fruits/fruits_12.png", import.meta.url).href,
    fruit_13: new URL("@/assets/fruits/fruits_13.png", import.meta.url).href,
    fruit_14: new URL("@/assets/fruits/fruits_14.png", import.meta.url).href,
    fruit_15: new URL("@/assets/fruits/fruits_15.png", import.meta.url).href,
    fruit_16: new URL("@/assets/fruits/fruits_16.png", import.meta.url).href,
  }
};

export interface SnakeResizeMetrics {
  paddingX: number;
  paddingY: number;
  offsetX: number;
  offsetY: number;
}

export const getSnakeResizeMetrics = (w: number, h: number, isPortrait: boolean): SnakeResizeMetrics => {
  const ratio = w / h;
  if (isPortrait) {
    if (ratio < 0.42) return { paddingX: 20, paddingY: 240, offsetX: 0, offsetY: -20 };
    if (ratio < 0.46) return { paddingX: 30, paddingY: 230, offsetX: 0, offsetY: -20 };
    return { paddingX: 40, paddingY: 220, offsetX: 0, offsetY: -20 };
  }
  return {
    paddingX: w < 960 ? 100 : 140,
    paddingY: w < 960 ? 60 : 90,
    offsetX: 0,
    offsetY: 0
  };
};
