import React from 'react';
import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

export const SpeechInputField = () => {
  const input = useRegistrationStep1Store((state) => state.input);
  const setInput = useRegistrationStep1Store((state) => state.setInput);
  const submit = useRegistrationStep1Store((state) => state.submit);
  
  const nameStatus = useRegistrationStep1Store((state) => state.nameStatus);
  const nameSuggestions = useRegistrationStep1Store((state) => state.nameSuggestions);
  const isNameChecking = useRegistrationStep1Store((state) => state.isNameChecking);

  return (
    <div className="speech-input-wrapper">
      
      {/* ТЗ: Если имя занято — рендерим ТОЛЬКО кнопки вариантов СТРОГО НАД ИНПУТОМ */}
      {nameStatus === 'taken' && nameSuggestions.length > 0 && (
        <div className="name-suggestions-container">
          {nameSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setInput(suggestion)} // Запишет вариант в инпут и запустит повторный дебаунс-чек
              className="name-suggestion-btn"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        placeholder="Как меня зовут?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { 
          if (e.key === 'Enter' && nameStatus === 'available' && !isNameChecking) {
            e.currentTarget.blur();
            submit(input); 
          }
        }}
        className="speech-input-field"
      />
    </div>
  );
};
