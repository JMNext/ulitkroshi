# Этап 1: Система стадий взросления (feature/growth-stages)

**Ветка:** `feature/growth-stages`
**Версия:** v1.3.0
**Статус:** ✅ Завершено

## Чек-лист задач

### Подготовка
- [x] Создание ветки `feature/growth-stages` от `develop`
- [x] Обновление `AGENTS.md` с приоритетами навыков
- [x] Утверждён Implementation Plan v2

### Компонент 1: Shared — growth.config.ts
- [x] Создать `backend/shared/growth.config.ts`
- [x] Создать `frontend/src/shared/growth.config.ts`

### Компонент 2: Миграция БД
- [x] Создать `deployment/postgres/migrations/001_add_growth_stages.sql`
- [x] Создать `deployment/postgres/migrations/001_add_growth_stages_rollback.sql`
- [x] Обновить `deployment/postgres/init.sql` (схема для чистых инсталляций)

### Компонент 3: Backend — growth.service.ts + growth.router.ts
- [x] Создать `backend/game-service/growth.service.ts`
- [x] Создать `backend/game-service/growth.router.ts`
- [x] Подключить роутер в `backend/server.ts`

### Компонент 4: Backend — типы, auth и syncPetStats
- [x] Обновить `backend/shared/types.ts`
- [x] Обновить `backend/shared/utils.ts` (mapUserFields)
- [x] Обновить `backend/auth-service/auth.service.ts` (INSERT pet_levels, pet_stages)

### Компонент 5: Frontend — типы и API
- [x] Обновить `frontend/src/api/types/types.ts`
- [x] Добавить `gainXp()` в `frontend/src/api/services/game.api.ts`

### Компонент 6: Frontend — PetStore
- [x] Обновить `usePetStore.ts` (level + stage, убрать stars)
- [x] Обновить `inventory.slice.ts`

### Компонент 7: Frontend — UI шкалы опыта
- [x] Создать `ExperienceBar.tsx` и `ExperienceBar.module.css`
- [x] Создать `StageTransitionOverlay.tsx` и `StageTransitionOverlay.module.css`
- [x] Подключить `ExperienceBar` в `Header.tsx`
- [x] Подключить `StageTransitionOverlay` в `MainSceneUI.tsx`

### Компонент 8: Frontend — масштабирование
- [x] Обновить `PetCharacter.tsx` (STAGE_SCALE: 55% / 100% / 150%)

### Компонент 9: Frontend — реструктуризация ассетов
- [x] Создать `pets/snail-01/{baby,teen,adult}/`
- [x] Переименовать Teen-ассеты (английские имена без транслита)
- [x] Создать `petAssetLoader.ts`
- [x] Обновить `petCharacter.constants.ts`

### Компонент 10: Frontend — интеграция gainXp
- [x] Обновить `pet.slice.ts` (completeCareAction)
- [x] Обновить `gameplay.slice.ts` (мини-игры)
- [x] Добавить начисление daily login XP бонуса (`useApiStore.ts`)

### Финализация и верификация
- [x] Юнит-тесты `tests/growth.config.test.ts` (4/4 tests passed)
- [x] `tsc --noEmit` (0 ошибок)
- [x] `npm run build:front` (успешная сборка Vite)
- [x] Обновить `CHANGELOG.md` v1.3.0
- [x] Обновить `package.json` → 1.3.0


### Исправление UI позиционирования и читаемости
- [x] Кнопка «Продолжить» на экране регистрации после ввода имени (`SpeechInputField`, `Step1UiManager`, `SpeechMicButton`)
- [x] Запрет переноса статусной строки подсказок в `ExperienceBar` (`flex-wrap: nowrap`, `white-space: nowrap`)
- [x] Скрытие `ExperienceBar` во время действий ухода (кормление, мытьё, игра) по аналогии с `PetIndicators`
- [x] Центрирование PetCharacter: устранение конфликта CSS translate Tailwind 4 и style.transform
- [x] Читаемость ExperienceBar: вынос из сжатого Header, контрастный бежевый фон-плашка, крупный шрифт 18px
- [x] Адаптивное позиционирование в mainLayoutHelper (.ui-exp-target под хедером на мобильных и по центру на десктопе)
- [x] Сборка и верификация (npm run build:front)

## Обзор результатов

Все 10 компонентов Этапа 1 («Система стадий взросления») полностью реализованы в соответствии с ТЗ и Implementation Plan v2:
1. Конфигурация уровней 1–100 и 3 стадий (Baby 1–5, Teen 6–15, Adult 16–30+) централизована в `growth.config.ts`.
2. Серверная авторитетность расчёта XP реализована через `growth.service.ts` и эндпоинт `POST /game/xp/gain`.
3. Создана миграция БД `001_add_growth_stages.sql` с пересчётом существующих данных и откатным скриптом, обновлён `init.sql`.
4. Клиентский стор `usePetStore` переведён с устаревшего `stars` на `level` и `stage`.
5. Добавлены компоненты `ExperienceBar` (в центре Header) и полноэкранный `StageTransitionOverlay`.
6. Реализовано масштабирование персонажа по стадии в `PetCharacter.tsx` через `STAGE_SCALE`.
7. Ассеты реструктурированы по стандарту `pets/snail-01/{baby,teen,adult}/`, подключены через `petCharacter.constants.ts`.
8. Начисление XP интегрировано во все действия ухода, мини-игры и ежедневный вход.
