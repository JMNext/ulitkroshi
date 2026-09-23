import { clsx } from "clsx";
import { CURRENCY_IMG_URL, getFruitUrlByStoreId } from "../constants/shop.constants";

export const ProductImage = ({ id, cardStyle }: { id: number; cardStyle: string }) => (
  <div className="flex shrink-0 flex-col items-center justify-center">
    <div className={clsx("flex h-[92px] w-[92px] items-center justify-center rounded-[22px] border-[4px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] max-md:landscape:h-[80px] max-md:landscape:w-[80px]", cardStyle)}>
      <img src={getFruitUrlByStoreId(id) || CURRENCY_IMG_URL} className="pointer-events-none block h-14 w-14 object-contain max-md:landscape:h-12 max-md:landscape:w-12" alt="" />
    </div>
  </div>
);
