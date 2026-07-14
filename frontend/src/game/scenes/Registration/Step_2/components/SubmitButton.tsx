interface SubmitButtonProps {
  isPortrait: boolean;
  isReady: boolean;
  onClick: () => void;
}

export const SubmitButton = ({ isPortrait, isReady, onClick }: SubmitButtonProps) => {
  return (
    <button 
      onClick={onClick} 
      disabled={!isReady} 
      className={`w-full ${isPortrait ? 'h-[50px] text-xl' : 'h-[60px] text-2xl'} text-white font-black rounded-full border-b-4 shadow-md transition-all box-border mt-2 ${isReady ? 'pointer-events-auto border-[#366901] bg-gradient-to-b from-[#81c714] to-[#4c9203] cursor-pointer active:translate-y-[2px] active:border-b-2 opacity-100' : 'pointer-events-none bg-slate-300 border-slate-400 opacity-60'}`}
    >
      Отправить
    </button>
  );
};
