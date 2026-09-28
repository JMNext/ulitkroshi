import { clsx } from "clsx";
import { BADGES_CONFIG, CURRENCY_IMG_URL } from "../constants/shop.constants";

interface ProductInfoProps { name: string; type: string; price: number; description: string; }

const EffectBadge = ({ type }: { type: string }) => {
  const b = BADGES_CONFIG[type];
  return b ? <div className={clsx("rounded-full border-[2px] px-4 py-0.5 text-[11px] font-black tracking-wider uppercase antialiased", b.border, b.bg, b.text, b.shadow)}>{b.t}</div> : null;
};

export const ProductInfo = ({ name, type, price, description }: ProductInfoProps) => (
  <div className="flex w-full flex-col items-center justify-center gap-1.5 text-center max-md:landscape:items-start max-md:landscape:text-left">
    <h3 className="m-0 w-full truncate text-[21px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased max-sm:text-[19px]">{name}</h3>
    <EffectBadge type={type} />
    <div className="box-border flex h-[22px] items-center justify-center gap-1 rounded-full border border-solid border-amber-100 bg-amber-50 px-3 text-[11px] font-black tracking-wide text-amber-600 uppercase antialiased">
      <span>Цена: {price}</span>
      <img src={CURRENCY_IMG_URL} className="block h-3.5 w-3.5 object-contain" alt="" />
    </div>
    <p className="m-0 w-full text-center text-[12.5px] leading-normal font-bold text-slate-500 antialiased max-sm:text-[12px] max-md:landscape:text-left">{description}</p>
  </div>
);
