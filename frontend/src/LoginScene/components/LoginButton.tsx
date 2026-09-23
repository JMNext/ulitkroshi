export const LoginButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={() => { (document.activeElement as HTMLElement)?.blur?.(); onClick(); }}
    className="pointer-events-auto box-border flex h-[65px] w-[260px] cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-6 text-[26px] font-black tracking-wide text-white uppercase shadow-md transition-transform duration-100 ease-out outline-none select-none active:scale-95"
  >
    Войти
  </button>
);
