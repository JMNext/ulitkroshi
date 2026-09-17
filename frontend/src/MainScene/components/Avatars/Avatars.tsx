// Импортируем дефолтную иконку напрямую, избавляясь от внешнего файла констант
import avatarDefaultIcon from "@/assets/interface-icons/icon-avatar.svg";

export type AvatarId = "default" | "frog" | "dog" | "cat" | "panda" | "fox";

interface AvatarItem {
  id: AvatarId;
  Component: React.ComponentType;
}

const SVG_CLASS = "h-full w-full rounded-full overflow-hidden";

// as const фиксирует строковые id как литералы "frog", "dog" и т.д., а не просто string
export const AVAILABLE_AVATARS = [
  {
    id: "default",
    Component: () => <img src={avatarDefaultIcon} className="block h-full w-full rounded-full object-cover" alt="Default Avatar" />
  },
  {
    id: "frog",
    Component: () => (
      <svg viewBox="0 0 160 160" className={SVG_CLASS}>
        <circle cx="80" cy="80" r="75" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="4" />
        <ellipse cx="80" cy="90" rx="60" ry="50" fill="#81C784" />
        <circle cx="50" cy="50" r="18" fill="#81C784" />
        <circle cx="110" cy="50" r="18" fill="#81C784" />
        <circle cx="50" cy="50" r="12" fill="#FFFFFF" />
        <circle cx="110" cy="50" r="12" fill="#FFFFFF" />
        <circle cx="52" cy="50" r="6" fill="#212121" />
        <circle cx="108" cy="50" r="6" fill="#212121" />
        <circle cx="50" cy="48" r="2" fill="#FFFFFF" />
        <circle cx="106" cy="48" r="2" fill="#FFFFFF" />
        <ellipse cx="36" cy="80" rx="10" ry="6" fill="#FF8A80" opacity="0.6" />
        <ellipse cx="124" cy="80" rx="10" ry="6" fill="#FF8A80" opacity="0.6" />
        <path d="M65,85 Q80,100 95,85" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    )
  },
  {
    id: "dog",
    Component: () => (
      <svg viewBox="0 0 160 160" className={SVG_CLASS}>
        <circle cx="80" cy="80" r="75" fill="#E1F5FE" stroke="#4E342E" strokeWidth="4" />
        <ellipse cx="32" cy="75" rx="14" ry="30" fill="#795548" transform="rotate(15, 32, 75)" />
        <ellipse cx="128" cy="75" rx="14" ry="30" fill="#795548" transform="rotate(-15, 128, 75)" />
        <ellipse cx="80" cy="95" rx="55" ry="46" fill="#D7CCC8" />
        <ellipse cx="50" cy="75" rx="16" ry="18" fill="#795548" opacity="0.15" />
        <circle cx="55" cy="80" r="8" fill="#212121" />
        <circle cx="105" cy="80" r="8" fill="#212121" />
        <circle cx="53" cy="78" r="2.5" fill="#FFFFFF" />
        <circle cx="103" cy="78" r="2.5" fill="#FFFFFF" />
        <ellipse cx="80" cy="90" rx="10" ry="6" fill="#212121" />
        <path d="M74,98 Q80,104 80,98 Q80,104 86,98" stroke="#4E342E" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="36" cy="94" rx="8" ry="5" fill="#FF8A80" opacity="0.5" />
        <ellipse cx="124" cy="94" rx="8" ry="5" fill="#FF8A80" opacity="0.5" />
      </svg>
    )
  },
  {
    id: "cat",
    Component: () => (
      <svg viewBox="0 0 160 160" className={SVG_CLASS}>
        <circle cx="80" cy="80" r="75" fill="#FFF3E0" stroke="#E65100" strokeWidth="4" />
        <polygon points="30,60 35,20 70,50" fill="#FFB74D" />
        <polygon points="25,62 31,26 62,52" fill="#FF8A80" />
        <polygon points="130,60 125,20 90,50" fill="#FFB74D" />
        <polygon points="135,62 129,26 98,52" fill="#FF8A80" />
        <ellipse cx="80" cy="95" rx="58" ry="48" fill="#FFB74D" />
        <ellipse cx="80" cy="105" rx="35" ry="25" fill="#FFFFFF" />
        <circle cx="55" cy="80" r="8" fill="#212121" />
        <circle cx="105" cy="80" r="8" fill="#212121" />
        <circle cx="53" cy="78" r="2.5" fill="#FFFFFF" />
        <circle cx="103" cy="78" r="2.5" fill="#FFFFFF" />
        <polygon points="80,94 74,84 86,84" fill="#FF8A80" />
        <path d="M74,94 Q80,100 80,94 Q80,100 86,94" stroke="#E65100" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="34" cy="92" rx="9" ry="5" fill="#FF8A80" opacity="0.5" />
        <ellipse cx="126" cy="92" rx="9" ry="5" fill="#FF8A80" opacity="0.5" />
      </svg>
    )
  },
  {
    id: "panda",
    Component: () => (
      <svg viewBox="0 0 160 160" className={SVG_CLASS}>
        <circle cx="80" cy="80" r="75" fill="#F3E5F5" stroke="#263238" strokeWidth="4" />
        <circle cx="42" cy="46" r="18" fill="#263238" />
        <circle cx="118" cy="46" r="18" fill="#263238" />
        <ellipse cx="80" cy="95" rx="58" ry="48" fill="#FFFFFF" />
        <ellipse cx="54" cy="82" rx="14" ry="18" fill="#263238" transform="rotate(-15, 54, 82)" />
        <ellipse cx="106" cy="82" rx="14" ry="18" fill="#263238" transform="rotate(15, 106, 82)" />
        <circle cx="55" cy="78" r="6" fill="#FFFFFF" />
        <circle cx="105" cy="78" r="6" fill="#FFFFFF" />
        <circle cx="55" cy="78" r="3" fill="#212121" />
        <circle cx="105" cy="78" r="3" fill="#212121" />
        <ellipse cx="80" cy="94" rx="7" ry="4.5" fill="#263238" />
        <path d="M75,101 Q80,105 85,101" stroke="#263238" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <ellipse cx="36" cy="96" rx="9" ry="5" fill="#FF8A80" opacity="0.5" />
        <ellipse cx="124" cy="96" rx="9" ry="5" fill="#FF8A80" opacity="0.5" />
      </svg>
    )
  },
  {
    id: "fox",
    Component: () => (
      <svg viewBox="0 0 160 160" className={SVG_CLASS}>
        <circle cx="80" cy="80" r="75" fill="#FFFDE7" stroke="#263238" strokeWidth="4" />
        <polygon points="30,55 20,15 60,45" fill="#FF7043" />
        <polygon points="26,57 18,22 52,47" fill="#263238" />
        <polygon points="130,55 140,15 100,45" fill="#FF7043" />
        <polygon points="134,57 142,22 108,47" fill="#263238" />
        <ellipse cx="80" cy="95" rx="58" ry="46" fill="#FF7043" />
        <ellipse cx="44" cy="105" rx="24" ry="24" fill="#FFFFFF" />
        <ellipse cx="116" cy="105" rx="24" ry="24" fill="#FFFFFF" />
        <circle cx="55" cy="80" r="7.5" fill="#212121" />
        <circle cx="105" cy="80" r="7.5" fill="#212121" />
        <circle cx="53" cy="78" r="2" fill="#FFFFFF" />
        <circle cx="103" cy="78" r="2" fill="#FFFFFF" />
        <polygon points="80,94 73,88 87,88" fill="#212121" />
        <path d="M75,98 Q80,103 85,98" stroke="#D84315" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <ellipse cx="32" cy="90" rx="8" ry="5" fill="#FF8A80" opacity="0.5" />
        <ellipse cx="128" cy="90" rx="8" ry="5" fill="#FF8A80" opacity="0.5" />
      </svg>
    )
  }
] as const;
