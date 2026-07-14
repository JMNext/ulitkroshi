interface CaptchaConfirmModalProps {
  onConfirm: () => void;
}

export const CaptchaConfirmModal = ({ onConfirm }: CaptchaConfirmModalProps) => {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-3 w-full max-w-[280px] bg-white border border-gray-100 rounded-[32px] shadow-2xl px-4 py-5 flex flex-col items-center justify-center gap-3 text-center z-40 animate-fade-in pointer-events-auto box-border">
      <div className="text-2xl font-black text-gray-700">Запомнил?</div>
      <button 
        onClick={onConfirm} 
        style={{ touchAction: 'manipulation' }} 
        className="w-40 h-11 text-white font-extrabold text-xl rounded-2xl border-b-4 border-[#366901] bg-gradient-to-b from-[#81c714] to-[#4c9203] shadow-md cursor-pointer active:translate-y-[2px] active:border-b-2 box-border flex items-center justify-center select-none"
      >
        Да!
      </button>
    </div>
  );
};
