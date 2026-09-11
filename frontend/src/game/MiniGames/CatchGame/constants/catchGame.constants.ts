import petVideoMov from "@/assets/resources/1stpet-animation/prostoi-converted.mov";
import petVideoWebm from "@/assets/resources/1stpet-animation/prostoi-converted.webm";

import f01 from "@/assets/fruits/fruits_01.png";
import f02 from "@/assets/fruits/fruits_02.png";
import f03 from "@/assets/fruits/fruits_03.png";
import f04 from "@/assets/fruits/fruits_04.png";
import f05 from "@/assets/fruits/fruits_05.png";
import f06 from "@/assets/fruits/fruits_06.png";
import f07 from "@/assets/fruits/fruits_07.png";
import f08 from "@/assets/fruits/fruits_08.png";
import f09 from "@/assets/fruits/fruits_09.png";
import f10 from "@/assets/fruits/fruits_10.png";
import f11 from "@/assets/fruits/fruits_11.png";
import f12 from "@/assets/fruits/fruits_12.png";
import f13 from "@/assets/fruits/fruits_13.png";
import f14 from "@/assets/fruits/fruits_14.png";
import f15 from "@/assets/fruits/fruits_15.png";
import f16 from "@/assets/fruits/fruits_16.png";

export const CATCH_ASSETS = {
  bgHoriz: new URL("@/assets/background/fon_goriz.png", import.meta.url).href,
  bgVert: new URL("@/assets/background/fon_vert.png", import.meta.url).href,
  video: { webm: petVideoWebm, mov: petVideoMov },
  fruits: {
    fruit_01: f01,
    fruit_02: f02,
    fruit_03: f03,
    fruit_04: f04,
    fruit_05: f05,
    fruit_06: f06,
    fruit_07: f07,
    fruit_08: f08,
    fruit_09: f09,
    fruit_10: f10,
    fruit_11: f11,
    fruit_12: f12,
    fruit_13: f13,
    fruit_14: f14,
    fruit_15: f15,
    fruit_16: f16
  }
};

export const DIFFICULTY_CONFIGS = {
  easy: { s: 5.0, d: 1500 },
  medium: { s: 7.0, d: 1050 },
  hard: { s: 9.5, d: 750 }
};

export const getCatchResizeMetrics = (w: number, h: number, isPortrait: boolean) => {
  const ratio = w / h;
  if (isPortrait) {
    if (ratio < 0.42) return { petSize: 140, bottomOffset: 65, fruitSize: 44 };
    if (ratio < 0.46) return { petSize: 180, bottomOffset: 55, fruitSize: 52 };
    return { petSize: 210, bottomOffset: 50, fruitSize: 58 };
  }
  return {
    petSize: w < 960 ? 140 : 260,
    bottomOffset: w < 960 ? 12 : 25,
    fruitSize: w < 960 ? 46 : 64
  };
};
