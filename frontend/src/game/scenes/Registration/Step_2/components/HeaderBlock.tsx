import { useRegistrationStep2Store } from '../useRegistrationStep2Store';

export const HeaderBlock = () => {
  const mode = useRegistrationStep2Store((s) => s.mode);
  const secs = useRegistrationStep2Store((s) => s.secs);
  const startTimer = useRegistrationStep2Store((s) => s.startTimer);
  const sendPhone = useRegistrationStep2Store((s) => s.sendPhone);
  const attempts = useRegistrationStep2Store((s) => s.attempts);
  const errorMessage = useRegistrationStep2Store((s) => s.errorMessage);

  const getTitle = (): string => {
    if (errorMessage) return errorMessage;
    if (mode === 'code') {
      return attempts > 0 && attempts < 3 
        ? `Неверный код. Осталось попыток: ${3 - attempts}` 
        : 'Введи номер из смс!';
    }
    return 'Набери свой номер телефона!';
  };

  const handleResend = () => {
    if (secs > 0) return;
    useRegistrationStep2Store.setState({ errorMessage: '' }); 
    sendPhone().then(() => startTimer());
  };

  return (
    <div className="bg-white border border-slate-200/50 rounded-[32px] shadow-lg flex flex-col justify-center items-center overflow-hidden select-none pointer-events-none box-border w-[540px] h-[140px] p-6">
      <p className="font-black text-slate-700 leading-tight tracking-wide text-center m-0 p-0 block text-[21px]">
        {getTitle()}
      </p>

      {mode === 'code' && (
        <span 
          onClick={handleResend} 
          className={`font-black block text-center tracking-tight transition-colors text-[14px] mt-3 ${
            secs > 0 
              ? 'text-slate-500 no-underline cursor-not-allowed pointer-events-none' 
              : 'text-emerald-600 underline cursor-pointer pointer-events-auto'
          }`}
        >
          {secs > 0 ? `Отправить повторно через ${secs} сек` : 'Отправить повторно'}
        </span>
      )}
    </div>
  );
};
