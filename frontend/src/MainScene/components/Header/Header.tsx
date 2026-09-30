import { HeaderAvatar } from "./components/HeaderAvatar";
import { HeaderCoins } from "./components/HeaderCoins";

export const Header = () => (
  <div className="desktop:px-[60px] landscape:px-[60px] pointer-events-none z-40 box-border h-[90px] w-full px-4 sm:px-8 md:px-12">
    <div className="relative h-[90px] w-full">
      <div className="desktop:-left-[44px] landscape:-left-[44px] pointer-events-auto absolute top-1/2 left-0 -translate-y-1/2">
        <HeaderCoins />
      </div>
      <div className="desktop:-right-[44px] landscape:-right-[44px] pointer-events-auto absolute top-1/2 right-0 -translate-y-1/2">
        <HeaderAvatar />
      </div>
    </div>
  </div>);