import eatIcon from "@/assets/buttom_menu-icons/eat.svg";

const fruitImgs = import.meta.glob("/src/assets/fruits/*.png", { eager: true, query: "?url" }) as Record<string, { default: string }>;

export const CURRENCY_IMG_URL = eatIcon;

export const DYNAMIC_BOOSTS = [
  {
    id: 1,
    name: "Яблоко",
    price: 40,
    type: "health_25",
    description: "Спелое хрустящее яблоко. Быстро затягивает мелкие царапины и восстанавливает +25 здоровья."
  },
  {
    id: 2,
    name: "Банан",
    price: 45,
    type: "health_25",
    description: "Питательный банан. Отличный перекус, который прибавит улитке +25 здоровья."
  },
  {
    id: 3,
    name: "Апельсин",
    price: 55,
    type: "health_25",
    description: "Сочный цитрус, полный витамина C. Бодрит тело и возвращает +25 здоровья."
  },
  {
    id: 4,
    name: "Виноград",
    price: 90,
    type: "health_50",
    description: "Целая гроздь спелого винограда. Насыщает силой и восстанавливает сразу +50 здоровья."
  },
  {
    id: 5,
    name: "Киви",
    price: 100,
    type: "health_50",
    description: "Спелый киви с легкой кислинкой. Запускает регенерацию и дарует +50 здоровья."
  },
  {
    id: 6,
    name: "Арбуз",
    price: 110,
    type: "health_50",
    description: "Огромная сочная долька сахарного арбуза. Мощно исцеляет, давая +50 здоровья."
  },
  {
    id: 7,
    name: "Ананас",
    price: 60,
    type: "exp_25",
    description: "Тропический ананас. Помогает улитке концентрироваться на задачах и приносит +25 опыта."
  },
  {
    id: 8,
    name: "Клубника",
    price: 70,
    type: "exp_25",
    description: "Ароматная спелая клубника. Повышает мозговую активность и добавляет +25 опыта."
  },
  {
    id: 9,
    name: "Золотая Груша",
    price: 250,
    type: "health_100",
    description: "Легендарная золотая груша. Обладает абсолютной магией исцеления и полностью восстанавливает 100% здоровья."
  },
  {
    id: 10,
    name: "Вишня",
    price: 90,
    type: "exp_25",
    description: "Горсть спелой вишни. Стимулирует интерес к тренировкам, принося +25 опыта."
  },
  {
    id: 11,
    name: "Персик",
    price: 210,
    type: "exp_50",
    description: "Сочный спелый персик. Обладает уникальным эффектом ускоренного развития и дает +50 опыта."
  },
  {
    id: 12,
    name: "Лимон",
    price: 150,
    type: "exp_50",
    description: "Кислый лимон, заставляющий взбодриться. Дает мощный ментальный толчок на +50 опыта."
  },
  {
    id: 13,
    name: "Авокадо",
    price: 50,
    type: "health_25",
    description: "Свежий авокадо, богатый полезными жирами. Мгновенно восстанавливает +25 здоровья."
  },
  {
    id: 14,
    name: "Гранат",
    price: 170,
    type: "exp_50",
    description: "Ценный спелый гранат. Пробуждает скрытый потенциал и мгновенно начисляет +50 опыта."
  },
  {
    id: 15,
    name: "Манго",
    price: 190,
    type: "exp_50",
    description: "Экзотическое сочное манго. Вдохновляет на новые рекорды, добавляя +50 опыта."
  },
  {
    id: 16,
    name: "Черника",
    price: 80,
    type: "exp_25",
    description: "Лесная ягода для остроты ума. Открывает новые знания, давая улитке +25 опыта."
  }
];

export const INVENTORY_SLOT_MAP: Record<string, string> = {
  health_25: "fruit_01",
  health_50: "fruit_02",
  health_100: "fruit_02",
  exp_25: "fruit_03",
  exp_50: "fruit_04"
};

export const BADGES_CONFIG: Record<string, { t: string; border: string; bg: string; text: string; shadow: string }> = {
  health_25: {
    t: "❤️ Здоровье +25",
    border: "border-[#81c784]",
    bg: "bg-[#e8f5e9]",
    text: "text-[#2e7d32]",
    shadow: "shadow-[inset_0_-1px_0_rgba(129,199,132,0.4)]"
  },
  health_50: {
    t: "💖 Здоровье +50",
    border: "border-[#4caf50]",
    bg: "bg-[#edfbeb]",
    text: "text-[#1b5e20]",
    shadow: "shadow-[inset_0_-2px_0_rgba(76,175,80,0.4)]"
  },
  health_100: {
    t: "🌟 Здоровье 100%",
    border: "border-[#ffb74d]",
    bg: "bg-[#fff3e0]",
    text: "text-[#e65100]",
    shadow: "shadow-[inset_0_-2px_0_rgba(255,183,77,0.4)]"
  },
  exp_25: {
    t: "⚡ Опыт +25",
    border: "border-[#7dd3fc]",
    bg: "bg-[#e0f2fe]",
    text: "text-[#0369a1]",
    shadow: "shadow-[inset_0_-1px_0_rgba(125,211,252,0.4)]"
  },
  exp_50: {
    t: "🔥 Опыт +50",
    border: "border-[#f472b6]",
    bg: "bg-[#fce7f3]",
    text: "text-[#be185d]",
    shadow: "shadow-[inset_0_-2px_0_rgba(244,114,182,0.4)]"
  }
};

// Вынесли мапинг слотов панели во внутренний массив для O(1) поиска по строковому ключу
const PANEL_SLOT_NUMS: Record<string, number> = { fruit_01: 1, fruit_02: 5, fruit_03: 9, fruit_04: 13 };

export const getFruitUrlByStoreId = (id: number | string): string => {
  // Быстрое определение числового индекса без регулярных выражений
  const num = typeof id === "number" ? id : PANEL_SLOT_NUMS[id] || parseInt(id, 10) || 0;

  if (num === 0) return fruitImgs["/src/assets/fruits/cookie.png"]?.default || CURRENCY_IMG_URL;

  // Переписали падинг нулей на быструю проверку условий: индексы бустов всегда в пределах 1-16
  const filename = num < 10 ? `fruits_0${num}` : `fruits_${num}`;
  return fruitImgs[`/src/assets/fruits/${filename}.png`]?.default || CURRENCY_IMG_URL;
};

export const preloadShopFruits = (scene: any) => {
  for (let i = 0; i <= 16; i++) {
    const url = getFruitUrlByStoreId(i);
    if (url) scene.load.image(`ui_fruit_${i}`, url);
  }
};

const GROUP_STYLES_MAP: Record<string, { card: string; popup: string }> = {
  health_25: {
    card: "border-[#81c784] bg-gradient-to-b from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] text-[#2e7d32] [text-shadow:0_1px_0_rgba(255,255,255,0.6)]",
    popup: "border-[#4caf50]"
  },
  health_50: {
    card: "border-[#ffd54f] bg-gradient-to-b from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] text-[#f57c00] [text-shadow:0_1px_0_rgba(255,255,255,0.6)]",
    popup: "border-[#ffb300]"
  },
  health_100: {
    card: "border-[#f43f5e] bg-gradient-to-b from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3] text-[#e11d48] [text-shadow:0_1px_0_rgba(255,255,255,0.6)]",
    popup: "border-[#e11d48]"
  },
  exp_25: {
    card: "border-[#4fc3f7] bg-gradient-to-b from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] text-[#0288d1] [text-shadow:0_1px_0_rgba(255,255,255,0.6)]",
    popup: "border-[#03a9f4]"
  },
  exp_50: {
    card: "border-[#ba68c8] bg-gradient-to-b from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] text-[#7b1fa2] [text-shadow:0_1px_0_rgba(255,255,255,0.6)]",
    popup: "border-[#9c27b0]"
  }
};

const DEFAULT_GROUP_STYLE = { card: "border-slate-200 bg-white", popup: "border-slate-400" };

export const getGroupStyles = (type: string) => GROUP_STYLES_MAP[type] || DEFAULT_GROUP_STYLE;
