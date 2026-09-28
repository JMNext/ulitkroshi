export const RegisterLink = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={() => { (document.activeElement as HTMLElement)?.blur?.(); onClick(); }}
    className="pointer-events-auto m-0 box-border flex h-[44px] w-[300px] cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 text-center text-[20px] font-medium text-white transition-all duration-75 outline-none select-none hover:text-slate-200 active:scale-95"
  >
    Зарегистрироваться
  </button>
);
