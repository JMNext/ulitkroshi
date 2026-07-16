import React from 'react';
import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

export const BubbleBlock = () => {
  const stage = useRegistrationStep1Store((state) => state.stage);
  const name = useRegistrationStep1Store((state) => state.name);

  // Подписываемся на статусы проверки имени улитки
  const nameStatus = useRegistrationStep1Store((state) => state.nameStatus);
  const isNameChecking = useRegistrationStep1Store((state) => state.isNameChecking);

  return (
    <div className="bubble-block-container">
      {stage === 1 && (
        <div className="flex flex-col items-center">
          {/* Стандартный текст, если имя свободно или еще не вводилось */}
          {nameStatus !== 'taken' && !isNameChecking && (
            <p className="bubble-text-intro">
              Привет, друг! Я — твой Улиткрош! Придумай мне имя, а затем введи его на клавиатуре или нажми на большую красную кнопку и скажи мне его. Громко и чётче!
            </p>
          )}

          {/* Текст во время проверки */}
          {isNameChecking && (
            <p className="bubble-text-intro text-gray-500 animate-pulse">
              Проверяю имя...
            </p>
          )}

          {/* ТЗ: Если имя занято — Улиткрош выводит фразу в облаке */}
          {nameStatus === 'taken' && (
            <p className="bubble-text-intro text-red-600 font-bold">
              Это имя уже занято, выбери вариант:
            </p>
          )}
        </div>
      )}
      
      {stage === 2 && (
        <section className="bubble-text-stage">
          <p className="bubble-text-label">Меня зовут</p>
          <p className="bubble-text-name">{name}?</p>
        </section>
      )}
      {stage === 3 && (
        <section className="bubble-text-error">
          <p>Ой, я не расслышал!</p>
          <p>Давай ещё разок, громче и чётче!</p>
        </section>
      )}
      {stage === 4 && (
        <section className="bubble-text-stage">
          <p className="bubble-text-label">Здорово, теперь меня зовут</p>
          <p className="bubble-text-name">{name}</p>
        </section>
      )}
      <span className="bubble-tail" />
    </div>
  );
};
