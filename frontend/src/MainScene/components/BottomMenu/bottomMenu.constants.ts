import menuBg from "@/assets/background/bottom-menu-desktop.svg";
import btnBg from "@/assets/buttom_menu-icons/button.svg";
import eatIcon from "@/assets/buttom_menu-icons/eat.svg";
import washIcon from "@/assets/buttom_menu-icons/wash.svg";
import playIcon from "@/assets/buttom_menu-icons/play.svg";
import sleepIcon from "@/assets/buttom_menu-icons/sleep.svg";

export type Action = "feed" | "wash" | "play" | "sleep";

export const MENU_BG_URL = menuBg;
export const BTN_BG_URL = btnBg;

export const MENU_ITEMS: { type: Action; name: string; icon: string; color: string }[] = [
  { type: "feed", name: "Кормить", icon: eatIcon, color: "#f59e0b" },
  { type: "wash", name: "Мыть", icon: washIcon, color: "#0ea5e9" },
  { type: "play", name: "Играть", icon: playIcon, color: "#f43f5e" },
  { type: "sleep", name: "Спать", icon: sleepIcon, color: "#a855f7" }
];
