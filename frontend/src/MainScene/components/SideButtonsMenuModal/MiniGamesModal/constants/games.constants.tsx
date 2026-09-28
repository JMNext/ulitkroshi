import React from "react";

export const GAMES = [
  { type: "memory", text: "НАЙДИ ПАРУ", scene: "MemoryGameScene" },
  { type: "catch", text: "СБОР УРОЖАЯ", scene: "CatchGameScene" },
  { type: "snake", text: "ЗМЕЙКА", scene: "SnakeGameScene" },
  { type: "racing", text: "ФРУКТОВЫЕ ГОНКИ", scene: "RacingGameScene" }
];

export const MODES = [
  { diff: "easy", text: "ЛЕГКО", bgColor: "#388e3c", textColor: "#ffffff" },
  { diff: "medium", text: "НОРМАЛЬНО", bgColor: "#fbc02d", textColor: "#0f172a" },
  { diff: "hard", text: "СЛОЖНО", bgColor: "#d32f2f", textColor: "#ffffff" }
];

export const GAME_COLORS: Record<string, string> = {
  MemoryGameScene: "bg-[#fbc02d] text-[#0f172a]",
  CatchGameScene: "bg-[#7b1fa2] text-white",
  SnakeGameScene: "bg-[#8bc34a] text-white",
  RacingGameScene: "bg-[#e65100] text-white"
};

export const GAME_SVGS: Record<string, React.ReactNode> = {
  MemoryGameScene: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="12" height="16" rx="2" fill="white" />
      <rect x="10" y="7" width="12" height="16" rx="2" fill="white" stroke="rgba(15, 23, 42, 0.25)" strokeWidth="1.5" />
    </svg>
  ),
  CatchGameScene: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="14" r="8" fill="white" />
      <path d="M12 6 L16 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  SnakeGameScene: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 16 L9 7 L14 16 L19 7" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  RacingGameScene: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 4 H11 V13 H4 Z M11 4 H18 V13 H11 Z" fill="white" fillRule="evenodd" clipRule="evenodd" />
      <path d="M4 4 V20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4 8 H18 M4 11 H18 M7 4 V13 M14 4 V13" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  ),
  LockIcon: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  )
};

export const BTN_BASE_CLASS =
  "box-border relative w-[290px] h-[52px] border-0 m-0 p-0 cursor-pointer outline-none rounded-[14px] flex items-center justify-center font-black text-[15px] uppercase transition-all duration-100 shadow-sm active:scale-[0.97] touch-manipulation select-none";
