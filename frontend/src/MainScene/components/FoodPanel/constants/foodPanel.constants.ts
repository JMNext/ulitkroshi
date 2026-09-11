import defaultEatIcon from "@/assets/buttom_menu-icons/eat.svg";

export const FOOD_IDS = ["fruit_01", "fruit_02", "fruit_03", "fruit_04"];

export const CATEGORY_MAP: Record<string, string> = {
  fruit_01: "health_25",
  fruit_02: "health_50",
  fruit_03: "exp_25",
  fruit_04: "exp_50"
};

// Заменили динамический рантайм-импорт через new URL на статическую константу
export const DEFAULT_EAT_ICON = defaultEatIcon;
