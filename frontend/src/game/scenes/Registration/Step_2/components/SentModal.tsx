interface SentModalProps {
  isPortrait: boolean;
  onConfirm: () => void;
}

export const SentModal = ({ isPortrait, onConfirm }: SentModalProps) => {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-4 w-full max-w-[340px] bg-white border border-slate-100 rounded-[36px] shadow-2xl px-6 py-6 flex flex-col items-center justify-center gap-4 text-center z-30 pointer-events-auto box-border">
      <div className={`${isPortrait ? 'text-[20px]' : 'text-[23px]'} font-black text-gray-700 leading-snug px-1`}>
        Отправили смс<br />на твой номер!
      </div>
      <button 
        onClick={onConfirm} 
        className={`w-32 ${isPortrait ? 'h-10 text-base' : 'h-11 text-lg'} text-white font-black rounded-full border-b-4 border-[#366901] bg-gradient-to-b from-[#81c714] to-[#4c9203] shadow-md cursor-pointer active:translate-y-[2px] active:border-b-2 box-border flex items-center justify-center`}
      >
        Ок!
      </button>
    </div>
  );
};
