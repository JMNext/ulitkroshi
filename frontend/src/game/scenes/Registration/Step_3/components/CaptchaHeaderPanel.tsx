import React from 'react';
import { Typography } from 'antd';
import { useRegistrationStep3Store } from '../useRegistrationStep3Store';
import { getFruitUrl } from './CaptchaFruitGrid';

const TITLES = {
  select: 'Выбери 4 фрукта<br/>и запомни их!',
  confirm: 'Запомнил?',
  verify: 'А теперь повтори фрукты,<br/>которые ты запомнил!',
  error: 'Что то не так, давай<br/>еще раз!'
};

export const CaptchaHeaderPanel = () => {
  const mode = useRegistrationStep3Store((state) => state.mode);
  const correct = useRegistrationStep3Store((state) => state.corr);
  const selected = useRegistrationStep3Store((state) => state.sel);

  const isConfirm = mode === 'confirm';
  const displayArray = isConfirm ? correct : selected;

  return (
    /* Добавлен класс shrink-0, защищающий заднее поле от изменения размеров */
    <Typography.Text component="div" className="captcha-header-container shrink-0">
      <p 
        className="captcha-header-title" 
        dangerouslySetInnerHTML={{ __html: TITLES[mode] || TITLES.select }} 
      />
      <Typography.Text component="div" className="captcha-slots-row">
        {Array.from({ length: 4 }).map((_, i) => {
          const fIdx = i < displayArray.length ? displayArray[i] : null;
          return fIdx !== null ? (
            <Typography.Text component="div" key={i} className="captcha-slot-cell captcha-slot-filled box-border">
              <img src={getFruitUrl(fIdx)} className="w-full h-full object-contain pointer-events-none" alt="" />
            </Typography.Text>
          ) : (
            <Typography.Text component="div" key={i} className="captcha-slot-cell captcha-slot-empty box-border" />
          );
        })}
      </Typography.Text>
      <span className="captcha-header-tail" />
    </Typography.Text>
  );
};
