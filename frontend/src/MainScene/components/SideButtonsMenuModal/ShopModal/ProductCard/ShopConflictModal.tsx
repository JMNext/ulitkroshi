interface ShopConflictModalProps {
  isOpen: boolean;
  conflictType: "cart" | "inventory";
  conflictingItemName: string;
  newItemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ShopConflictModal = ({ isOpen, conflictType, conflictingItemName, newItemName, onConfirm, onCancel }: ShopConflictModalProps) => {
  if (!isOpen) return null;
  const isCart = conflictType === "cart";

  return (
    <div className="box-border flex w-full flex-col items-center justify-center p-2 text-center select-none">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-solid border-orange-400 bg-orange-100 text-[28px]">⚠️</div>
      <h4 className="m-0 mt-3 text-[18px] font-black tracking-wide text-orange-700 uppercase antialiased">Замена фрукта</h4>
      <p className="m-0 mt-2 text-[13px] leading-normal font-bold text-slate-600 antialiased">
        {isCart ? (
          <>В корзине уже лежит фрукт той же категории: <span className="font-black text-orange-600">«{conflictingItemName}»</span>. Вы хотите заменить его на <span className="font-black text-emerald-600">«{newItemName}»</span>?</>
        ) : (
          <>В инвентаре питомца уже есть фрукт той же категории: <span className="font-black text-orange-600">«{conflictingItemName}»</span>. При покупке он заменится на <span className="font-black text-emerald-600">«{newItemName}»</span>. Продолжить?</>
        )}
      </p>
      <div className="mt-5 flex w-full flex-row gap-2.5">
        <button type="button" onClick={onConfirm} className="min-h-[38px] flex-1 cursor-pointer items-center justify-center rounded-xl border-none bg-[#4caf50] text-[11px] font-black tracking-wider text-white uppercase shadow-[0_3px_0_#2e7d32]">
          {isCart ? "Да, заменить" : "Да, купить"}
        </button>
        <button type="button" onClick={onCancel} className="min-h-[38px] flex-1 cursor-pointer items-center justify-center rounded-xl border-none bg-[#9e9e9e] text-[11px] font-black tracking-wider text-white uppercase shadow-[0_3px_0_#616161]">
          Отмена
        </button>
      </div>
    </div>
  );
};
