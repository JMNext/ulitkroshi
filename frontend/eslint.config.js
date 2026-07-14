import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  eslintConfigPrettier, // Отключает конфликты стилей с Prettier
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // Явно указываем линтеру, что мы пишем код для браузера
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'off', // Вырубили предупреждения, чтобы не спамило желтыми линиями
      'no-console': 'off',     // Разрешаем console.log в коде
      'no-undef': 'error',     // Включаем строгую ошибку, чтобы работали автоимпорты через ПКМ
    },
  },
];
