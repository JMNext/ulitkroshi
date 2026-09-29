# Чек-лист исправления ошибки: Черный экран в Яндекс Браузере на iOS

## Причина проблемы
1. В `index.html` отсутствовал элемент `<div id="game-container"></div>`, из-за чего Phaser крепил canvas в конец `body` после 100vh-блока `#root`, сдвигая холст за пределы экрана до старта `LoginScene`.
2. В `PreloaderScene` на старте загружался аудиофайл 1.1 МБ (`main_theme.mp3`) через Web Audio API. В iOS WKWebView (Яндекс Браузер) вызов `AudioContext.decodeAudioData()` на приостановленном (suspended) контексте без предварительного тапа пользователя зависает и никогда не вызывает callback завершения загрузки, навсегда блокируя переход на `LoginScene`.
3. Отсутствовал таймаут безопасности в `PreloaderScene` на случай сбоя или зависания загрузчика ассетов.

## Задачи
- [x] 1. Создание рабочей ветки `fix/ios-yandex-browser-black-screen` от `develop`
- [x] 2. Добавление `<div id="game-container"></div>` в `frontend/index.html` и настройка стилей холста в `frontend/global.css`
- [x] 3. Доработка `frontend/PreloaderScene.ts`:
  - Добавление таймаута безопасности (3 сек) для гарантированного перехода на `LoginScene`
  - Обработка событий `loaderror`
  - Безопасная фоновая подгрузка аудио без блокировки начального рендера
  - Реакция на изменение размера экрана (`resize`) для центрирования элементов загрузки
- [x] 4. Защита работы с `localStorage` и Web Audio в iOS WKWebView
- [x] 5. Обновление `CHANGELOG.md` (секция `[Unreleased]`)
- [x] 6. Коммит по регламенту Conventional Commits: `fix(ios): устранение черного экрана в Яндекс Браузере на iOS (WKWebView)`
- [x] 7. Слияние ветки в `develop` и отправка в удаленный репозиторий (`git push origin develop`)
- [ ] 8. Верификация деплоя на Staging стенде `https://ulitkroshi.intelcosystem.com`
