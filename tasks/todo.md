# Чек-лист: Исправление черного фона персонажа Улиткрош в Safari на iOS

## Анализ первопричины (Root Cause Analysis)
- В `PetCharacter.tsx` в теге `<video>` источник WebM (`.webm`) был указан первым, а HEVC (`.mov`) — вторым.
- Начиная с iOS 14, Safari поддерживает воспроизведение контейнера WebM, поэтому выбирает первый подходящий `<source>`.
- Однако Safari/WebKit **НЕ поддерживает альфа-канал (прозрачность) в WebM VP9** и заменяет прозрачные пиксели сплошным черным цветом (RGB 0,0,0).
- Прозрачное видео в Safari поддерживается исключительно через кодек **HEVC (H.265, `hvc1`) с альфа-каналом** в контейнере QuickTime / MP4.
- Все необходимые файлы анимаций `.mov` уже закодированы с профилем `hvc1` и альфа-каналом в проекте.
- **Решение:** Изменить порядок `<source>` в `<video>`: источник HEVC `.mov` (`video/quicktime; codecs="hvc1"` / `video/mp4; codecs="hvc1"`) должен идти ПЕРВЫМ, а WebM — вторым (для Chrome/Android). Также синхронизированы вспомогательные компоненты, CatchGamePet, добавлено кеширование `mov` в Nginx и обновлена версия до `1.2.2`.

## План работ
- [x] 1. Создание рабочей ветки `fix/safari-pet-transparent-video` от `develop`
- [x] 2. Обновление порядка и типов `<source>` в `frontend/src/MainScene/components/PetCharacter/PetCharacter.tsx`
- [x] 3. Обновление правил кеширования в `deployment/nginx/nginx.conf` (добавление `mov`)
- [x] 4. Инкремент версии в `package.json` до `1.2.2`
- [x] 5. Документирование изменений в `CHANGELOG.md` для версии `[1.2.2] — 2026-09-29`
- [x] 6. Фиксация изменений коммитом по стандарту: `fix(safari): устранение черного фона у персонажа на iOS (приоритет HEVC с альфа-каналом)`
- [x] 7. Слияние в `develop` и отправка в удаленный репозиторий (`git push origin develop`)
- [x] 8. Верификация деплоя на Staging стенде (`https://ulitkroshi.intelcosystem.com`)
- [x] 9. Обновление `tasks/lessons.md` с извлеченными уроками по Safari video alpha

## Обзор результатов (Review & Verification)
1. **Первопричина устранена:** Во всех компонентах рендеринга видео персонажа (`PetCharacter.tsx`, `PetVideoBlock.tsx`, `HappyPetVideo.tsx`, `CatchGamePet.ts`) для Apple-устройств обеспечен безусловный приоритет HEVC (`.mov` с кодеком `hvc1`).
2. **Версионирование:** Версия приложения повышена до `1.2.2`. В CI/CD автоматически собрана и задеплоена сборка `v1.2.2-b17` (отображается в нижнем бейдже экрана).
3. **CI/CD:** GitHub Actions пайплайн `#17` успешно завершен (`status: completed, conclusion: success`).
4. **Кеширование и заголовки:** Nginx возвращает `HTTP/2 200`, `content-type: video/quicktime` с поддержкой Range-запросов и кеширования `immutable` для всех `.mov` ассетов.
5. **Документация:** Обновлены `CHANGELOG.md`, `tasks/todo.md` и добавлен раздел 9 в `tasks/lessons.md`.
