import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

export const BubbleBlock = () => {
  const { stage, name, nameStatus, isNameChecking, nameHistory } = useRegistrationStep1Store();
  const hasRejectedBefore = nameHistory?.length > 0;

  return (
    <div className="flex flex-col items-center box-border select-none pointer-events-none w-[455px]">
      <div className="w-full h-auto bg-white border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center box-border pt-6 pb-6 px-8 rounded-[32px]">
        {stage === 1 && (
          <div className="w-full flex flex-col items-center">
            {nameStatus !== 'taken' && (
              <p className="font-extrabold text-slate-800 leading-snug tracking-wide m-0 p-0 block text-[19px]">
                {hasRejectedBefore 
                  ? 'Эх, а мне так нравилось... Ну ладно, тогда как меня будут звать? Придумай другое имя!'
                  : 'Привет, друг! Я — твой Улиткрош! Придумай мне имя, а затем введи его на клавиатуре или нажми на большую красную кнопку и скажи мне его. Громко и чётче!'
                }
              </p>
            )}
            {nameStatus === 'taken' && !isNameChecking && (
              <p className="font-extrabold text-red-600 leading-snug tracking-wide m-0 p-0 block text-[19px]">
                Это имя уже занято, выбери вариант:
              </p>
            )}
          </div>
        )}
        
        {(stage === 2 || stage === 4) && (
          <div className="w-full flex flex-col items-center justify-center">
            <p className="font-semibold text-slate-500 leading-snug tracking-wide m-0 p-0 block text-[19px]">
              {stage === 2 ? 'Меня зовут' : 'Здорово, теперь меня зовут'}
            </p>
            <p className="font-black text-emerald-800 leading-snug tracking-wide m-0 p-0 block text-[34px] mt-1">
              {name}{stage === 2 ? '?' : ''}
            </p>
          </div>
        )}

        {stage === 3 && (
          <div className="w-full flex flex-col items-center">
            <p className="font-extrabold text-slate-800 leading-snug m-0 p-0 block text-[20px]">
              Ой, я не расслышал!
            </p>
            <p className="font-extrabold text-slate-800 leading-snug block text-[20px] mt-2">
              Давай ещё разок, громче и чётче!
            </p>
          </div>
        )}
      </div>
      <div className="w-full flex justify-center items-start mt-[-1px] box-border">
        <div className="w-0 h-0 border-x-transparent border-b-transparent drop-shadow-black/5 border-l-[12px] border-r-[12px] border-t-[12px] border-t-white" />
      </div>
    </div>
  );
};
