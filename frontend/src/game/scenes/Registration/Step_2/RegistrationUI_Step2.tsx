import React, { useEffect, useState, useRef } from 'react';
import { HeaderBlock } from './components/HeaderBlock';
import { DisplayFields } from './components/DisplayFields';
import { SubmitButton } from './components/SubmitButton';
import { PinPadWrapper } from './components/PinPadWrapper';
import { useRegistrationStep2Store } from './useRegistrationStep2Store';
import { useAuthStore } from '../../../../store/useAuthStore';

interface RegistrationUIWithStep2Props {
  // Изменили сигнатуру, чтобы передавать sessionId в сцену фруктовой матрицы
  onDone: (sessionId: string) => void; 
}

export const RegistrationUI_Step2 = ({ onDone }: RegistrationUIWithStep2Props) => {
  const phone = useRegistrationStep2Store((state) => state.phone);
  const mode = useRegistrationStep2Store((state) => state.mode);
  const code = useRegistrationStep2Store((state) => state.code);
  const rawPhone = useRegistrationStep2Store((state) => state.rawPhone);
  const secs = useRegistrationStep2Store((state) => state.secs);
  const handleKeyboardInput = useRegistrationStep2Store((state) => state.handleKeyboardInput);
  const startTimer = useRegistrationStep2Store((state) => state.startTimer);
  const sendPhone = useRegistrationStep2Store((state) => state.sendPhone);

  // Локальные состояния ТЗ для контроля ошибок и лимитов
  const [attempts, setAttempts] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  
  // Реф, чтобы отслеживать автоматический перезапрос и не зацикливать useEffect
  const isAutoResending = useRef<boolean>(false);

  // Слушатель физической клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyboardInput(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyboardInput]);

  // ТЗ: Автоматическая отправка нового кода при истечении таймера (5 минут)
  // По умолчанию ваш стор запускает 60 секунд. Для ТЗ в 5 минут (300 сек) 
  // достаточно поменять значение secs в startTimer() вашего стора на 300.
  useEffect(() => {
    if (mode === 'code' && secs === 0 && !isAutoResending.current) {
      isAutoResending.current = true;
      handleCodeExpiredOrLimit();
    }
  }, [secs, mode]);

  // ТЗ: Отправка POST /api/auth/login/verify-sms при вводе полного кода
  useEffect(() => {
    // Предполагаем длину кода 4 символа, как заложено в вашем handleKeyboardInput
    if (mode === 'code' && code.length === 4 && !isVerifying) {
      const verifySmsCode = async () => {
        setIsVerifying(true);
        setErrorMessage('');

        try {
          const { verifySms } = useAuthStore.getState();
          const fullPhoneNumber = `+7${rawPhone}`;

          // Вызов реального эндпоинта ТЗ
          const response = await verifySms(fullPhoneNumber, code);

          // Успех -> небольшая пауза для анимации и переход к фруктовой матрице
          setTimeout(() => {
            setIsVerifying(false);
            onDone(response.sessionId); // Передаем sessionId бэкенда дальше
          }, 400);

        } catch (error: any) {
          setIsVerifying(false);
          const nextAttempts = attempts + 1;
          setAttempts(nextAttempts);

          // ТЗ: 3 ошибки → автоматическая отправка нового кода
          if (nextAttempts >= 3) {
            handleCodeExpiredOrLimit();
          } else {
            // ТЗ: Неверный код → сообщение об ошибке
            setErrorMessage('Кажется, это не тот код, попробуй ещё раз!');
            // Сбрасываем неверный код в сторе для повторного ввода ребенком
            useRegistrationStep2Store.setState({ code: '' });
          }
        }
      };

      verifySmsCode();
    }
  }, [code, mode, rawPhone, attempts, isVerifying, onDone]);

  // Функция автоматического перевыпуска SMS при лимитах или таймауте по ТЗ
  const handleCodeExpiredOrLimit = async () => {
    try {
      // Сбрасываем код и счетчик попыток
      useRegistrationStep2Store.setState({ code: '' });
      setAttempts(0);
      setErrorMessage(secs === 0 ? 'Время действия кода истекло. Отправлен новый код.' : 'Превышено количество попыток. Отправлен новый код.');
      
      // Повторно вызываем эндпоинт отправки телефона
      await sendPhone();
      startTimer(); // Перезапускаем таймер на новый круг
    } catch (err) {
      console.error('Ошибка автоматического перевыпуска кода:', err);
    } finally {
      isAutoResending.current = false;
    }
  };

  return (
    <main className="registration-overlay-root">
      <section className="registration-overlay-layout">
        <HeaderBlock onResend={startTimer} />
        
        <DisplayFields />

        {/* СТРОГИЙ ВЫВОД ОШИБОК И СТАТУСОВ ПО ТЗ (БЕЗ СМАЙЛИКОВ) */}
        <div className="h-6 text-base font-bold text-center my-2">
          {isVerifying && <span className="text-gray-500">Проверка кода...</span>}
          {errorMessage && <span className="text-red-600">{errorMessage}</span>}
          {mode === 'code' && attempts > 0 && attempts < 3 && !errorMessage && (
            <span className="text-orange-600">Осталось попыток: {3 - attempts}</span>
          )}
        </div>

        {mode === 'phone' && (
          <SubmitButton 
            isReady={phone.indexOf('_') === -1} 
            onClick={sendPhone} 
          />
        )}
        
        <PinPadWrapper 
          onPressKey={handleKeyboardInput} 
          onGoCode={() => useRegistrationStep2Store.getState().setMode('code')} 
        />
      </section>
    </main>
  );
};
