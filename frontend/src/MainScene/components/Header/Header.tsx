import { HeaderAvatar } from "./components/HeaderAvatar";
import { HeaderCoins } from "./components/HeaderCoins";

interface HeaderProps {
  isVert?: boolean;
}

export const Header = ({ isVert }: HeaderProps) => (
  <div className="desktop:px-[60px] landscape:px-[60px] pointer-events-none z-40 box-border h-[94px] w-full px-4 sm:px-8 md:px-12">
    <div className="relative h-full w-full">
      <div className="pointer-events-auto absolute top-1/2 left-0 -translate-y-1/2">
        <HeaderCoins isVert={isVert} />
      </div>
      <div className="pointer-events-auto absolute top-1/2 right-0 -translate-y-1/2">
        <HeaderAvatar isVert={isVert} />
      </div>
    </div>
  </div>
);
