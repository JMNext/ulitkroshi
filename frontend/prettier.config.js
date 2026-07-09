export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],

  // === НАСТРОЙКИ КОМПАКТНОСТИ ДЛЯ HTML И TAILWIND ===
  // Переносит каждый атрибут на новую строку, если их много, делая HTML читаемым
  singleAttributePerLine: true,
  // Запрещает Prettier раздувать пробелы и ломать строчные элементы в HTML
  htmlWhitespaceSensitivity: 'ignore',
  // Помещает закрывающую угловую скобку > тега на той же строке, а не переносит её на отдельную
  bracketSameLine: true,
};
