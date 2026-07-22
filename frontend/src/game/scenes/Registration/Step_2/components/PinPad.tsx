import { useRegistrationStep2Store } from '../useRegistrationStep2Store';
import normalButtonBg from '/src/assets/board/button.svg';
import redButtonBg from '/src/assets/board/red_button.svg';

export const PinPad = ({ onSuccessCode }: { onSuccessCode: (sessionId: string) => void }) => {
  const mode = useRegistrationStep2Store((s) => s.mode);
  const handleKeyboardInput = useRegistrationStep2Store((s) => s.handleKeyboardInput);

  const isDisabled = mode === 'sent';
  const keys: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', 'delete'];

  return (
    <nav className="flex flex-col justify-center shrink-0 box-border overflow-hidden select-none pointer-events-auto p-0 w-[370px] h-[500px]">
      <div className={`grid grid-cols-3 grid-rows-4 w-full h-full box-border shrink-0 select-none transition-opacity gap-x-[20px] gap-y-[20px] ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
        {keys.map((key) => {
          const isDelete = key === 'delete';
          
          return (
            <button
              key={key}
              disabled={isDisabled}
              onClick={() => !isDisabled && handleKeyboardInput(isDelete ? 'BACKSPACE' : key, onSuccessCode)}
              style={{ touchAction: 'manipulation' }}
              className="relative outline-none w-full h-full bg-transparent border-none p-0 active:scale-95 transition-transform cursor-pointer pointer-events-auto"
            >
              <img 
                src={isDelete ? redButtonBg : normalButtonBg} 
                className="w-full h-full object-contain pointer-events-none drop-shadow-md" 
                alt="" 
              />
              <div 
                className={`absolute inset-0 flex items-center justify-center font-sans box-border select-none pointer-events-none ${
                  isDelete 
                    ? 'text-white font-extrabold pb-2 text-[36px]' 
                    : 'text-slate-700 font-black pb-1 text-[40px]'
                }`}
              >
                {isDelete ? '✕' : key}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
