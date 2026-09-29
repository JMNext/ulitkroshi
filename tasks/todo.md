# Чек-лист реализации фичи: Отображение версии приложения

## Задачи
- [x] 1. Создание рабочей ветки `feature/app-version-display` от `develop`
- [x] 2. Синхронизация версии в `package.json` (`1.2.0`) и передача в сборку через `vite.config.js` (`__APP_VERSION__`)
- [x] 3. Типизация глобальной константы в `frontend/vite-env.d.ts`
- [x] 4. Создание компонента `frontend/VersionBadge.tsx` (позиционирование снизу по центру, читаемый шрифт, адаптивность под safe-area)
- [x] 5. Подключение `<VersionBadge />` в корневой рендер `frontend/index.tsx`
- [x] 6. Проверка синтаксиса и чистоты импортов в кодовой базе
- [x] 7. Обновление `CHANGELOG.md` (секция `[Unreleased]`)
- [ ] 8. Коммит по регламенту Conventional Commits: `feat(ui): отображение версии приложения в нижней части экрана`
- [ ] 9. Слияние ветки `feature/app-version-display` в `develop` и отправка (`git push origin develop`)
- [ ] 10. Проверка деплоя на Staging стенде (`https://ulitkroshi.intelcosystem.com`)
