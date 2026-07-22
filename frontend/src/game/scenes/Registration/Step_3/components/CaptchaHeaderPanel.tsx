import { useRegistrationStep3Store } from '../useRegistrationStep3Store';
import { getFruitUrl } from './CaptchaFruitGrid';

export const CaptchaHeaderPanel = () => {
  const mode = useRegistrationStep3Store((s) => s.mode);
  const selected = useRegistrationStep3Store((s) => s.sel);
  const attempts = useRegistrationStep3Store((s) => s.attempts);
  const errorMessage = useRegistrationStep3Store((s) => s.errorMessage);

  const getHeaderText = (): string => {
    if (errorMessage) return errorMessage;
    if (mode === 'verify') return attempts > 0 ? `Осталось попыток: ${3 - attempts}` : 'А теперь повтори фрукты,<br/>которые ты запомнил!';
    if (mode === 'confirm') return 'Запомнил?';
    if (mode === 'error') return 'Что то не так, давай<br/>еще раз!';
    return 'Выбери 4 фрукта<br/>и запомни их!';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl flex flex-col items-center justify-start box-border select-none pointer-events-none w-[455px] h-[230px] pt-8">
      
      <div className="w-full flex items-center justify-center px-4 box-border h-[56px]">
        <p 
          className="font-black text-slate-700 leading-tight tracking-wide text-center m-0 p-0 block text-[20px]" 
          dangerouslySetInnerHTML={{ __html: getHeaderText() }} 
        />
      </div>
      
      <div className="w-full flex justify-center items-center box-border gap-x-3 mt-[18px]">
        {Array.from({ length: 4 }).map((_, i) => {
          const hasFruit = i < selected.length;
          
          return (
            <div 
              key={i} 
              className={`p-1 rounded-full flex items-center justify-center border border-solid shadow-inner box-border shrink-0 w-[68px] h-[68px] ${
                hasFruit 
                  ? 'border-slate-100 bg-gray-50' 
                  : 'border-slate-200 bg-stone-100'
              }`}
            >
              {hasFruit && (
                <img 
                  src={getFruitUrl(selected[i])} 
                  className="w-full h-full object-contain pointer-events-none" 
                  alt="" 
                />
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
