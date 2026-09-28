export const ProfileActions = ({ onStartScanner, onLogout }: { onStartScanner: () => void; onLogout: () => void }) => (
  <>
    <button type="button" onClick={onStartScanner} className="mx-auto flex h-[48px] w-full max-w-[280px] cursor-pointer items-center justify-center rounded-[24px] border-0 bg-[#ff9800] text-[15px] font-black text-white uppercase shadow-sm">
      Добавить питомца
    </button>
    <button type="button" onClick={onLogout} className="mx-auto flex h-[44px] w-full max-w-[280px] cursor-pointer items-center justify-center rounded-[24px] border-2 border-[#ef4444] bg-transparent text-[14px] font-black text-[#ef4444] uppercase shadow-sm">
      Выйти
    </button>
  </>
);
