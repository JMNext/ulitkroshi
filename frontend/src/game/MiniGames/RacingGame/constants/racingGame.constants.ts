export const RACING_ASSETS = {
  bgHoriz: new URL("@/assets/background/fon_goriz.png", import.meta.url).href,
  bgVert: new URL("@/assets/background/fon_vert.png", import.meta.url).href
};

export interface RacingResizeMetrics {
  paddingX: number;
  paddingY: number;
  offsetX: number;
  offsetY: number;
}

export const getRacingResizeMetrics = (w: number, h: number, isPortrait: boolean): RacingResizeMetrics => {
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
