import React, { useEffect } from 'react';
import { CaptchaHeaderPanel } from './components/CaptchaHeaderPanel';
import { CaptchaConfirmModal } from './components/CaptchaConfirmModal';
import { CaptchaFruitGrid } from './components/CaptchaFruitGrid';
import { CaptchaResetButton } from './components/CaptchaResetButton';
import { useRegistrationStep3Store } from './useRegistrationStep3Store';

interface RegistrationUIWithStep3Props {
  onDone: () => void;
}

export const RegistrationUI_Step3 = ({ onDone }: RegistrationUIWithStep3Props) => {
  const mode = useRegistrationStep3Store((state) => state.mode);
  const shake = useRegistrationStep3Store((state) => state.shake);
  const sel = useRegistrationStep3Store((state) => state.sel);
  const corr = useRegistrationStep3Store((state) => state.corr);
  
  // Достаем новые поля и методы ТЗ из локального стора
  const attempts = useRegistrationStep3Store((state) => state.attempts);
  const errorMessage = useRegistrationStep3Store((state) => state.errorMessage);
  const isSubmitting = useRegistrationStep3Store((state) => state.isSubmitting);
  const verifyAndSubmit = useRegistrationStep3Store((state) => state.verifyAndSubmit);
  const undoLastSelect = useRegistrationStep3Store((state) => state.undoLastSelect);

  const toggleSelect = useRegistrationStep3Store((state) => state.toggleSelect);
  const setCaptchaState = useRegistrationStep3Store((state) => state.setCaptchaState);
  const generateNewOrder = useRegistrationStep3Store((state) => state.generateNewOrder);
  const resetStore = useRegistrationStep3Store((state) => state.resetStore);

  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [resetStore]);

  // Следим за вводом: как только набрано 4 элемента в режиме верификации — запускаем проверку
  useEffect(() => {
    if (mode === 'verify' && sel.length === 4 && !isSubmitting) {
      verifyAndSubmit(sel).then(() => {
        const currentError = useRegistrationStep3Store.getState().errorMessage;
        if (!currentError) {
          onDone(); // Переходим к финальной Phaser-сцене поздравления
        }
      });
    }
  }, [sel, mode, isSubmitting, verifyAndSubmit, onDone]);

  // Функция полного сброса кода к началу (при клике на Сбросить или после 3 ошибок)
  const handleFullReset = () => {
    useRegistrationStep3Store.setState({ attempts: 0, errorMessage: '' });
    generateNewOrder();
    setCaptchaState([], [], 'select', false);
  };

  const isNextButtonActive = mode === 'verify' && sel.length === 4;

  return (
    <main className="captcha-overlay-root pointer-events-auto">
      <section className={`captcha-overlay-layout ${shake ? 'captcha-shake' : ''}`}>
        <CaptchaHeaderPanel />
        
        {/* ТЗ: Системный вывод ошибок и лимитов попыток в строгом стиле */}
        <div className="h-6 text-center text-lg font-bold my-2" style={{ minHeight: '24px' }}>
          {isSubmitting && <span className="text-gray-500">Сохранение фруктового кода...</span>}
          {errorMessage && <span className="text-red-600">{errorMessage}</span>}
          {mode === 'verify' && attempts > 0 && !errorMessage && (
            <span className="text-orange-600">Осталось попыток: {3 - attempts}</span>
          )}
        </div>

        <section className="captcha-interactive-zone">
          <CaptchaFruitGrid onPress={toggleSelect} />
          
          {mode === 'confirm' && (
            <CaptchaConfirmModal 
              onConfirm={() => setCaptchaState([], sel, 'verify', false)} 
            />
          )}

          {/* Панель кнопок управления ТЗ */}
          <div className="flex justify-center gap-4 mt-4 w-full max-w-xs">
            {/* ТЗ: Кнопка «Отменить последний» */}
            <button
              type="button"
              disabled={sel.length === 0 || mode === 'confirm' || mode === 'error' || isSubmitting}
              onClick={undoLastSelect}
              className="px-4 py-2 font-bold bg-gray-200 border-2 border-gray-400 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Отменить последний
            </button>

            <CaptchaResetButton 
              onReset={handleFullReset} 
            />
          </div>

          {/* ТЗ: После 3 ошибок → автоматическое предложение вернуться к выбору кода заново */}
          {attempts >= 3 && (
            <div className="flex flex-col items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl w-full max-w-xs">
              <p className="text-sm text-red-700 font-medium text-center">Код запутался. Начнем сначала?</p>
              <button
                type="button"
                onClick={handleFullReset}
                className="w-full py-2 font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Выбрать код заново
              </button>
            </div>
          )}

          {/* ТЗ: Кнопка «Далее» активна только после выбора 4 фруктов в verify (если не переключается автоматически) */}
          {mode === 'verify' && (
            <button
              disabled={!isNextButtonActive || isSubmitting}
              onClick={onDone}
              className={`w-full max-w-xs mt-3 py-3 font-bold text-white rounded-xl shadow-sm transition-all ${
                isNextButtonActive && !isSubmitting
                  ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed opacity-60'
              }`}
            >
              Далее
            </button>
          )}

        </section>
      </section>
    </main>
  );
};
