interface ConfirmSelectionProps {
  onNo: () => void;
  onYes: () => void;
}

export const ConfirmSelection = ({ onNo, onYes }: ConfirmSelectionProps) => {
  return (
    <div className="pointer-events-auto bg-white rounded-[24px] p-2 flex gap-4 shadow-lg w-[90vw] max-w-[420px] h-[76px] border-2 border-[#81c714] items-center justify-between box-border mt-4">
      <button 
        onClick={onNo} 
        className="flex-1 h-full bg-gradient-to-b from-[#ff5252] to-[#e63254] hover:from-[#ff6e6e] hover:to-[#e63254] active:scale-95 font-black text-white text-2xl rounded-[18px] shadow-sm transition-transform cursor-pointer flex items-center justify-center select-none border-none"
      >
        Нет
      </button>
      <button 
        onClick={onYes} 
        className="flex-1 h-full bg-gradient-to-b from-[#81c714] to-[#60aa05] hover:from-[#92d623] hover:to-[#60aa05] active:scale-95 font-black text-white text-2xl rounded-[18px] shadow-sm transition-transform cursor-pointer flex items-center justify-center select-none border-none"
      >
        Да!
      </button>
    </div>
  );
};
